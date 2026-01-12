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
    private notificationsService: NotificationsService,
  ) {
    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
    this.stripe = new Stripe(stripeKey, {
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
    const orderId = session.metadata.orderId;
    const userId = session.metadata.userId;

    const order = await this.orderModel.findById(orderId);
    if (!order) {
      console.error('Order not found for session:', session.id);
      return;
    }

    // Update order status
    await this.orderModel.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      stripePaymentIntentId: session.payment_intent,
      status: 'CONFIRMED',
    });

    // Update payment record
    await this.paymentModel.findOneAndUpdate(
      { stripeSessionId: session.id },
      {
        status: 'succeeded',
        stripePaymentIntentId: session.payment_intent,
        processedAt: new Date(),
      }
    );

    // Add loyalty points to user (only after successful payment)
    if (order.pointsEarned > 0) {
      const user = await this.userModel.findById(userId);
      if (user) {
        await this.userModel.findByIdAndUpdate(userId, {
          loyaltyPoints: user.loyaltyPoints + order.pointsEarned,
        });

        // Send notification
        await this.notificationsService.createNotification({
          userId,
          title: 'Loyalty Points Earned',
          message: `You earned ${order.pointsEarned} loyalty points from your order!`,
          type: 'LOYALTY',
          data: { points: order.pointsEarned, action: 'earned', orderId },
        });
      }
    }

    // Send order confirmation notification
    await this.notificationsService.createNotification({
      userId,
      title: 'Payment Successful',
      message: `Your payment for order #${orderId.toString().slice(-6)} has been confirmed!`,
      type: 'ORDER',
      data: { orderId, status: 'CONFIRMED', paymentStatus: 'paid' },
    });

    console.log(`Order ${orderId} payment completed successfully`);
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
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      const order = await this.orderModel.findOne({ stripeSessionId: sessionId });

      return {
        sessionId: session.id,
        paymentStatus: session.payment_status,
        order: order,
      };
    } catch (error) {
      throw new BadRequestException('Failed to verify session');
    }
  }
}