import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendRefundEmail(to: string, orderId: string, amount: number, refundId: string) {
    if (!process.env.SMTP_USER) return;
    
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Refund Processed - Order #' + orderId.slice(-6),
        html: `
          <h2>Refund Processed Successfully</h2>
          <p>Your refund has been processed.</p>
          <p><strong>Order ID:</strong> ${orderId.slice(-6)}</p>
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Refund ID:</strong> ${refundId}</p>
          <p>The amount will be credited to your original payment method within 5-10 business days.</p>
        `,
      });
    } catch (error) {
      console.error('Email send failed:', error);
    }
  }

  async sendPaymentSuccessEmail(to: string, orderId: string, amount: number, pointsEarned: number) {
    if (!process.env.SMTP_USER) return;
    
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Payment Successful - Order #' + orderId.slice(-6),
        html: `
          <h2>Payment Successful!</h2>
          <p>Your payment has been confirmed.</p>
          <p><strong>Order ID:</strong> ${orderId.slice(-6)}</p>
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Loyalty Points Earned:</strong> ${pointsEarned}</p>
          <p>Thank you for your purchase!</p>
        `,
      });
    } catch (error) {
      console.error('Email send failed:', error);
    }
  }

  async sendPaymentFailedEmail(to: string, orderId: string) {
    if (!process.env.SMTP_USER) return;
    
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Payment Failed - Order #' + orderId.slice(-6),
        html: `
          <h2>Payment Failed</h2>
          <p>Your payment could not be processed.</p>
          <p><strong>Order ID:</strong> ${orderId.slice(-6)}</p>
          <p>Please try again or contact support.</p>
        `,
      });
    } catch (error) {
      console.error('Email send failed:', error);
    }
  }
}
