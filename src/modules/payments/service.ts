import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { Order } from '../orders/order.interface';
import { User } from '../users/user.interface';
import { Payment } from './payment.interface';
import { NotificationsService } from '../notifications/service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectModel('Payment') private paymentModel: Model<Payment>,
    @InjectModel('Order') private orderModel: Model<Order>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Product') private productModel: Model<any>,
    @InjectModel('Cart') private cartModel: Model<any>,
    private notificationsService: NotificationsService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia' as any,
    });
  }

  async createCheckoutSession(orderId: string, userId: string, amount: number) {
    try {
      const order = await this.orderModel.findById(orderId);
      if (!order) throw new NotFoundException('Order not found');

      // Create line items from order
      const lineItems = order.items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: { 
            name: item.title,
            description: `Quantity: ${item.quantity}`
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      // Create Stripe checkout session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/orders/cancel`,
        metadata: {
          orderId: order._id.toString(),
          userId: userId,
        },
      });

      // Update order with session ID
      await this.orderModel.findByIdAndUpdate(orderId, {
        stripeSessionId: session.id,
        paymentStatus: 'pending',
      });

      // Create payment record
      await this.paymentModel.create({
        orderId: order._id,
        userId: userId,
        amount: amount,
        paymentMethod: (order as any).paymentMethod || 'stripe',
        status: 'pending',
        stripeSessionId: session.id,
      });

      return { url: session.url, sessionId: session.id };
    } catch (error) {
      console.error('Create checkout session error:', error);
      throw new BadRequestException(error.message || 'Failed to create checkout session');
    }
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    try {
      if (!signature) {
        throw new BadRequestException('Missing stripe-signature header');
      }

      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new BadRequestException('Webhook secret not configured');
      }

      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );

      console.log('Webhook event received:', event.type);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (err) {
      console.error('Webhook error:', err.message);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }

  private async handleCheckoutSessionCompleted(session: any) {
    console.log(`[WebHook] Session completed: ${session.id}, status: ${session.payment_status}`);
    if (session.payment_status === 'paid') {
      await this.confirmOrder(session.id, session.metadata.orderId, session.metadata.userId, session.payment_intent);
    }
  }

  private async confirmOrder(sessionId: string, orderId: string, userId: string, paymentIntentId: string) {
    console.log(`[ConfirmOrder] Starting confirmation for Order: ${orderId}, User: ${userId}`);
    
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      console.error('[ConfirmOrder] Order not found:', orderId);
      return;
    }

    // Skip if already confirmed
    if (order.status === 'CONFIRMED' && order.paymentStatus === 'paid') {
      console.log(`[ConfirmOrder] Order ${orderId} already confirmed, skipping.`);
      return;
    }

    // Update order status
    await this.orderModel.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      stripePaymentIntentId: paymentIntentId,
      status: 'CONFIRMED',
    });
    console.log(`[ConfirmOrder] Order ${orderId} status updated to CONFIRMED/paid`);

    // Update stock for each item in the order
    try {
      for (const item of order.items) {
        await this.productModel.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      }
      console.log(`[ConfirmOrder] Stock updated for order items`);
    } catch (error) {
      console.error('[ConfirmOrder] Failed to update stock:', error.message);
    }

    // Clear user's cart
    try {
      await this.cartModel.findOneAndUpdate(
        { userId },
        { items: [], totalPrice: 0 }
      );
      console.log(`[ConfirmOrder] User cart cleared`);
    } catch (error) {
      console.error('[ConfirmOrder] Failed to clear cart:', error.message);
    }

    // Update payment record
    try {
      await this.paymentModel.findOneAndUpdate(
        { stripeSessionId: sessionId },
        {
          status: 'succeeded',
          stripePaymentIntentId: paymentIntentId,
          processedAt: new Date(),
        }
      );
      console.log(`[ConfirmOrder] Payment record updated`);
    } catch (error) {
      console.error('[ConfirmOrder] Failed to update payment record:', error.message);
    }

    // Add loyalty points to user
    if (order.pointsEarned && order.pointsEarned > 0) {
      console.log(`[ConfirmOrder] Awarding ${order.pointsEarned} points to User: ${userId}`);
      try {
        const updatedUser = await this.userModel.findByIdAndUpdate(
          userId,
          { $inc: { loyaltyPoints: order.pointsEarned } },
          { new: true }
        );
        
        if (updatedUser) {
          console.log(`[ConfirmOrder] Success! User ${userId} now has ${updatedUser.loyaltyPoints} points`);
        } else {
          console.error(`[ConfirmOrder] User ${userId} not found when awarding points`);
        }

        // Send notification
        await this.notificationsService.createNotification({
          userId,
          title: 'Loyalty Points Earned',
          message: `You earned ${order.pointsEarned} loyalty points from your order!`,
          type: 'LOYALTY',
          data: { points: order.pointsEarned, action: 'earned', orderId },
        });
      } catch (error) {
        console.error('[ConfirmOrder] Failed to award points/notify:', error.message);
      }
    } else {
      console.log(`[ConfirmOrder] No points to award for this order (PointsEarned: ${order.pointsEarned})`);
    }

    // Send order confirmation notification
    try {
      await this.notificationsService.createNotification({
        userId,
        title: 'Payment Successful',
        message: `Your payment for order #${orderId.toString().slice(-6)} has been confirmed!`,
        type: 'ORDER',
        data: { orderId, status: 'CONFIRMED', paymentStatus: 'paid' },
      });
    } catch (error) {
      console.error('[ConfirmOrder] Failed to send order notification:', error.message);
    }

    console.log(`[ConfirmOrder] Order ${orderId} confirmation process completed`);
  }

  private async handlePaymentIntentSucceeded(paymentIntent: any) {
    console.log('Payment intent succeeded:', paymentIntent.id);
    
    await this.paymentModel.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      {
        status: 'succeeded',
        processedAt: new Date(),
        metadata: paymentIntent.metadata,
      }
    );
  }

  private async handlePaymentIntentFailed(paymentIntent: any) {
    console.log('Payment intent failed:', paymentIntent.id);

    const payment = await this.paymentModel.findOne({ stripePaymentIntentId: paymentIntent.id });
    if (payment) {
      await this.paymentModel.findByIdAndUpdate(payment._id, { status: 'failed' });
      await this.orderModel.findByIdAndUpdate(payment.orderId, { paymentStatus: 'failed' });

      // Send failure notification
      await this.notificationsService.createNotification({
        userId: payment.userId.toString(),
        title: 'Payment Failed',
        message: 'Your payment has failed. Please try again.',
        type: 'ORDER',
        data: { orderId: payment.orderId, paymentStatus: 'failed' },
      });
    }
  }

  async verifySession(sessionId: string) {
    console.log(`[VerifySession] Verifying session: ${sessionId}`);
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      let order = await this.orderModel.findOne({ stripeSessionId: sessionId });

      console.log(`[VerifySession] Stripe status: ${session.payment_status}, Local Order Status: ${order?.status}`);

      // If session is paid but order is still pending, manually confirm it
      if (session.payment_status === 'paid' && order && (order.status === 'PENDING' || order.paymentStatus === 'pending')) {
        console.log(`[VerifySession] Manual confirmation triggered for order: ${order._id}`);
        await this.confirmOrder(session.id, order._id.toString(), order.userId.toString(), session.payment_intent as string);
        order = await this.orderModel.findById(order._id);
      }

      const user = order ? await this.userModel.findById(order.userId).select('-password') : null;

      return {
        sessionId: session.id,
        paymentStatus: session.payment_status,
        order: order,
        user: user,
      };
    } catch (error) {
      throw new BadRequestException('Failed to verify session');
    }
  }

  async refundPayment(orderId: string, userId: string, reason?: string) {
    try {
      const order = await this.orderModel.findById(orderId);
      if (!order) throw new NotFoundException('Order not found');
      if (order.userId.toString() !== userId) throw new BadRequestException('Unauthorized');
      if (order.paymentStatus !== 'paid') throw new BadRequestException('Order not paid');
      if ((order as any).paymentStatus === 'refunded') throw new BadRequestException('Already refunded');

      const payment = await this.paymentModel.findOne({ orderId });
      if (!(payment as any)?.stripePaymentIntentId) throw new BadRequestException('Payment intent not found');

      const refund = await this.stripe.refunds.create({
        payment_intent: (payment as any).stripePaymentIntentId,
        reason: 'requested_by_customer',
      });

      await this.orderModel.findByIdAndUpdate(orderId, { paymentStatus: 'refunded', status: 'CANCELLED' });
      await this.paymentModel.findByIdAndUpdate(payment._id, { status: 'refunded', refundId: refund.id });

      // Deduct loyalty points if earned
      if (order.pointsEarned > 0) {
        const user = await this.userModel.findById(userId);
        if (user) {
          await this.userModel.findByIdAndUpdate(userId, {
            loyaltyPoints: Math.max(0, user.loyaltyPoints - order.pointsEarned),
          });
        }
      }

      await this.notificationsService.createNotification({
        userId,
        title: 'Refund Processed',
        message: `Your refund of $${order.totalAmount} has been processed.`,
        type: 'ORDER',
        data: { orderId, refundId: refund.id },
      });

      return { success: true, refundId: refund.id };
    } catch (error) {
      throw new BadRequestException(error.message || 'Refund failed');
    }
  }
}