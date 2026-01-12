import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './order.interface';
import { Cart } from '../cart/cart.interface';
import { Product } from '../products/product.interface';
import { User } from '../users/user.interface';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { LoyaltyService } from '../loyalty/service';
import { NotificationsService } from '../notifications/service';
import { PaymentsService } from '../payments/service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel('Order') private orderModel: Model<Order>,
    @InjectModel('Cart') private cartModel: Model<Cart>,
    @InjectModel('Product') private productModel: Model<Product>,
    @InjectModel('User') private userModel: Model<User>,
    private loyaltyService: LoyaltyService,
    private notificationsService: NotificationsService,
    private paymentsService: PaymentsService,
  ) {}

  async getUserOrders(userId: string): Promise<Order[]> {
    const orders = await this.orderModel.find({ userId }).populate('items.productId').exec();
    return orders.map(order => ({
      ...order.toObject(),
      loyaltyPointsEarned: order.pointsEarned,
      loyaltyPointsUsed: order.pointsUsed,
    })) as Order[];
  }

  async getOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderModel.findOne({ _id: orderId, userId }).populate('items.productId').exec();
    if (!order) throw new NotFoundException('Order not found');
    return {
      ...order.toObject(),
      loyaltyPointsEarned: order.pointsEarned,
      loyaltyPointsUsed: order.pointsUsed,
    } as Order;
  }

  async checkout(userId: string, createOrderDto: CreateOrderDto): Promise<any> {
    try {
      let cart = await this.cartModel.findOne({ userId }).populate('items.productId');
      
      // Check if cart exists and has items
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty. Please add items to cart before checkout.');
      }

      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      // Validate stock
      for (const item of cart.items) {
        const product = await this.productModel.findById(item.productId);
        if (!product) {
          throw new BadRequestException(`Product not found`);
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${product.title}`);
        }
      }

      const pointsToUse = createOrderDto.pointsToUse || 0;
      if (pointsToUse > user.loyaltyPoints) {
        throw new BadRequestException(`Insufficient points. Available: ${user.loyaltyPoints}`);
      }

      // Calculate final amount
      const pointsValue = Math.floor(pointsToUse / 100) * 5;
      const finalAmount = Math.max(0, cart.totalPrice - pointsValue);
      const pointsEarned = Math.floor(finalAmount);

      // Determine payment method
      const paymentMethod = createOrderDto.paymentMethod || 
        (pointsToUse > 0 && finalAmount === 0 ? 'points' : 
         pointsToUse > 0 && finalAmount > 0 ? 'hybrid' : 'stripe');

      // Create order
      const order = new this.orderModel({
        userId,
        items: cart.items.map(item => {
          const product = item.productId as any;
          return {
            productId: product._id,
            quantity: item.quantity,
            price: item.price,
            title: product.title,
          };
        }),
        totalAmount: finalAmount,
        pointsUsed: pointsToUse,
        pointsEarned,
        status: 'PENDING',
        shippingAddress: createOrderDto.shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'points' ? 'paid' : 'pending',
      });

      const savedOrder = await order.save();

      // If payment is points-only, process immediately
      if (paymentMethod === 'points') {
        // Deduct points
        await this.userModel.findByIdAndUpdate(userId, { 
          $inc: { loyaltyPoints: -pointsToUse } 
        });

        // Update stock
        for (const item of cart.items) {
          const product = item.productId as any;
          await this.productModel.findByIdAndUpdate(product._id, { 
            $inc: { stock: -item.quantity } 
          });
        }

        // Clear cart
        await this.cartModel.findOneAndUpdate({ userId }, { items: [], totalPrice: 0 });

        // Update order status
        await this.orderModel.findByIdAndUpdate(savedOrder._id, { 
          status: 'CONFIRMED',
          paymentStatus: 'paid'
        });

        // Send notifications
        await this.notificationsService.createNotification({
          userId,
          title: 'Order Placed Successfully',
          message: `Your order #${savedOrder._id.toString().slice(-6)} has been placed successfully`,
          type: 'ORDER',
          data: { orderId: savedOrder._id, status: 'CONFIRMED' },
        });

        if (pointsToUse > 0) {
          await this.notificationsService.createNotification({
            userId,
            title: 'Loyalty Points Used',
            message: `You used ${pointsToUse} loyalty points on this order`,
            type: 'LOYALTY',
            data: { points: pointsToUse, action: 'used' },
          });
        }

        return savedOrder;
      }

      // For Stripe or hybrid payment, create checkout session
      if (paymentMethod === 'stripe' || paymentMethod === 'hybrid') {
        const checkoutSession = await this.paymentsService.createCheckoutSession(
          savedOrder._id.toString(),
          userId,
          finalAmount
        );

        // Deduct points immediately for hybrid (but not stock - wait for payment)
        if (paymentMethod === 'hybrid' && pointsToUse > 0) {
          await this.userModel.findByIdAndUpdate(userId, { 
            $inc: { loyaltyPoints: -pointsToUse } 
          });

          await this.notificationsService.createNotification({
            userId,
            title: 'Loyalty Points Used',
            message: `You used ${pointsToUse} loyalty points on this order`,
            type: 'LOYALTY',
            data: { points: pointsToUse, action: 'used' },
          });
        }

        await this.notificationsService.createNotification({
          userId,
          title: 'Order Created',
          message: `Complete your payment to confirm order #${savedOrder._id.toString().slice(-6)}`,
          type: 'ORDER',
          data: { orderId: savedOrder._id, status: 'PENDING' },
        });

        // Return checkout URL for redirect
        return {
          ...savedOrder.toObject(),
          checkoutUrl: checkoutSession.url,
          sessionId: checkoutSession.sessionId,
        };
      }

      return savedOrder;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }

  async updateOrder(orderId: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderModel.findById(orderId).populate('userId');
    if (!order) throw new NotFoundException('Order not found');

    const oldPaymentStatus = order.paymentStatus;
    const oldStatus = order.status;
    const userId = typeof order.userId === 'object' ? (order.userId as any)._id : order.userId;

    // Update order
    Object.assign(order, updateOrderDto);
    await order.save();

    // If status changed to DELIVERED, award loyalty points
    if (oldStatus !== 'DELIVERED' && updateOrderDto.status === 'DELIVERED') {
      if (order.pointsEarned > 0) {
        const updatedUser = await this.userModel.findByIdAndUpdate(
          userId,
          { $inc: { loyaltyPoints: order.pointsEarned } },
          { new: true }
        );
        
        console.log('Loyalty points awarded on delivery:', order.pointsEarned);
        console.log('User new loyalty points:', updatedUser?.loyaltyPoints);

        await this.notificationsService.createNotification({
          userId: userId.toString(),
          title: 'Loyalty Points Earned',
          message: `You earned ${order.pointsEarned} loyalty points from your delivered order`,
          type: 'LOYALTY',
          data: { points: order.pointsEarned, action: 'earned', orderId },
        });
      }
    }

    // If payment status changed from pending to paid, process the order
    if (oldPaymentStatus === 'pending' && updateOrderDto.paymentStatus === 'paid') {
      console.log('Processing payment approval for order:', orderId);

      // Update stock
      for (const item of order.items) {
        await this.productModel.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      }

      // Clear user's cart
      await this.cartModel.findOneAndUpdate(
        { userId },
        { items: [], totalPrice: 0 }
      );

      // Update order status to CONFIRMED if still PENDING
      if (order.status === 'PENDING') {
        order.status = 'CONFIRMED';
        await order.save();
      }

      await this.notificationsService.createNotification({
        userId: userId.toString(),
        title: 'Payment Confirmed',
        message: `Payment confirmed for order #${order._id.toString().slice(-6)}`,
        type: 'ORDER',
        data: { orderId: order._id, status: 'CONFIRMED' },
      });
    }

    // Send notification for status change
    if (oldStatus !== updateOrderDto.status && updateOrderDto.status) {
      await this.notificationsService.createNotification({
        userId: userId.toString(),
        title: 'Order Status Updated',
        message: `Your order #${order._id.toString().slice(-6)} status changed to ${updateOrderDto.status}`,
        type: 'ORDER',
        data: { orderId: order._id, status: updateOrderDto.status },
      });
    }

    return order;
  }

  async cancelOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderModel.findOne({ _id: orderId, userId });
    if (!order) throw new NotFoundException('Order not found');
    if (!['PENDING', 'CONFIRMED'].includes(order.status.toUpperCase())) {
      throw new BadRequestException('Order cannot be cancelled');
    }
    order.status = 'CANCELLED';
    await order.save();
    return order;
  }

  async findAll(query?: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = query || {};
    const filter: any = {};
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).populate('userId').skip(skip).limit(limit).exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);
    return { orders, total };
  }

  async findById(orderId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId).populate('userId').exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getTotalCount(): Promise<number> {
    return this.orderModel.countDocuments().exec();
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.orderModel.aggregate([
      { $match: { status: { $in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    return result[0]?.total || 0;
  }
}
