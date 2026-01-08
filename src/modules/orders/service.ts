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
    private paymentsService: PaymentsService
  ) {}

  async getUserOrders(userId: string): Promise<Order[]> {
    const orders = await this.orderModel.find({ userId }).populate('items.productId').exec();
    
    // Transform orders to match frontend expectations
    return orders.map(order => ({
      ...order.toObject(),
      loyaltyPointsEarned: order.pointsEarned,
      loyaltyPointsUsed: order.pointsUsed,
    })) as Order[];
  }

  async getOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderModel.findOne({ _id: orderId, userId }).populate('items.productId').exec();
    if (!order) throw new NotFoundException('Order not found');
    
    // Transform order to match frontend expectations
    const transformedOrder = {
      ...order.toObject(),
      loyaltyPointsEarned: order.pointsEarned,
      loyaltyPointsUsed: order.pointsUsed,
    };
    
    return transformedOrder as Order;
  }

  async checkout(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      console.log('Starting checkout for user:', userId, 'with data:', createOrderDto);
      
      // Get user's cart with populated product details
      let cart = await this.cartModel.findOne({ userId }).populate('items.productId');
      
      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty. Please add items to cart before checkout.');
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        console.log('User not found:', userId);
        throw new NotFoundException('User not found');
      }

      console.log('User found:', user.email, 'Current points:', user.loyaltyPoints);
      console.log('Cart items:', cart.items.length, 'Total price:', cart.totalPrice);

      // Validate stock
      for (const item of cart.items) {
        const product = await this.productModel.findById(item.productId);
        if (!product || product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${product?.title || 'product'}`);
        }
      }

      const pointsToUse = createOrderDto.pointsToUse || 0;
      console.log('Points to use:', pointsToUse);
      
      // Validate loyalty points
      if (pointsToUse > 0) {
        if (user.loyaltyPoints < pointsToUse) {
          throw new BadRequestException(`Insufficient points. Available: ${user.loyaltyPoints}, Required: ${pointsToUse}`);
        }
      }

      // Calculate final amount after points deduction (100 points = $5)
      const pointsValue = Math.floor(pointsToUse / 100) * 5;
      const finalAmount = Math.max(0, cart.totalPrice - pointsValue);
      const pointsEarned = Math.floor(finalAmount); // 1 point per dollar
      
      console.log('Points value:', pointsValue, 'Final amount:', finalAmount, 'Points earned:', pointsEarned);

      // Create order
      const order = new this.orderModel({
        userId,
        items: cart.items.map(item => {
          const product = item.productId as any;
          return {
            productId: product._id,
            quantity: item.quantity,
            price: item.price,
            title: product.title
          };
        }),
        totalAmount: finalAmount,
        pointsUsed: pointsToUse,
        pointsEarned,
        status: 'PENDING',
        shippingAddress: createOrderDto.shippingAddress,
        paymentMethod: createOrderDto.paymentMethod || 'credit_card',
        paymentDetails: createOrderDto.paymentDetails
      });

      const savedOrder = await order.save();
      console.log('Order saved:', savedOrder._id);

      // Update user loyalty points
      const newPointsBalance = user.loyaltyPoints - pointsToUse + pointsEarned;
      await this.userModel.findByIdAndUpdate(userId, {
        loyaltyPoints: newPointsBalance
      });
      console.log('Updated user points from', user.loyaltyPoints, 'to', newPointsBalance);

      // Update stock
      for (const item of cart.items) {
        const product = item.productId as any;
        await this.productModel.findByIdAndUpdate(
          product._id,
          { $inc: { stock: -item.quantity } }
        );
      }

      // Clear cart
      await this.cartModel.findOneAndUpdate({ userId }, { items: [], totalPrice: 0 });
      console.log('Cart cleared for user:', userId);

      // Create payment record
      if (createOrderDto.paymentDetails) {
        try {
          await this.paymentsService.create(userId, {
            orderId: savedOrder._id.toString(),
            amount: finalAmount,
            paymentMethod: createOrderDto.paymentMethod || 'credit_card',
            cardDetails: createOrderDto.paymentDetails
          });
          console.log('Payment record created for order:', savedOrder._id);
        } catch (error) {
          console.error('Failed to create payment record:', error);
        }
      }

      // Send notifications
      try {
        // Order notification
        await this.notificationsService.createNotification({
          userId,
          title: 'Order Placed Successfully',
          message: `Your order #${savedOrder._id.toString().slice(-6)} has been placed successfully`,
          type: 'ORDER',
          data: { orderId: savedOrder._id, status: 'PENDING' }
        });

        // Loyalty points notification
        if (pointsEarned > 0) {
          await this.notificationsService.createNotification({
            userId,
            title: 'Loyalty Points Earned',
            message: `You earned ${pointsEarned} loyalty points from this order`,
            type: 'LOYALTY',
            data: { points: pointsEarned, action: 'earned' }
          });
        }

        if (pointsToUse > 0) {
          await this.notificationsService.createNotification({
            userId,
            title: 'Loyalty Points Used',
            message: `You used ${pointsToUse} loyalty points on this order`,
            type: 'LOYALTY',
            data: { points: pointsToUse, action: 'used' }
          });
        }
        console.log('Notifications saved for order:', savedOrder._id);
      } catch (error) {
        console.error('Failed to save notifications:', error);
      }

      return savedOrder;
    } catch (error) {
      console.error('Checkout error:', error.message, error.stack);
      throw error; // Re-throw the error to be handled by the controller
    }
  }

  async updateOrder(orderId: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(orderId, updateOrderDto, { new: true });
    if (!order) throw new NotFoundException('Order not found');
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

  async findAll(query?: { status?: string; page?: number; limit?: number }): Promise<{ orders: Order[]; total: number }> {
    const { status, page = 1, limit = 20 } = query || {};
    const filter: any = {};
    if (status) filter.status = status;
    
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).populate('userId').skip(skip).limit(limit).exec(),
      this.orderModel.countDocuments(filter).exec()
    ]);
    
    return { orders, total };
  }

  async getTotalCount(): Promise<number> {
    return this.orderModel.countDocuments().exec();
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.orderModel.aggregate([
      { $match: { status: { $in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    return result[0]?.total || 0;
  }
}