import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './payment.interface';

@Injectable()
export class PaymentsService {
  constructor(@InjectModel('Payment') private paymentModel: Model<Payment>) {}

  async create(userId: string, data: any) {
    const payment = new this.paymentModel({ userId, ...data, status: 'PENDING' });
    return payment.save();
  }

  async findByOrderId(orderId: string) {
    return this.paymentModel.findOne({ orderId });
  }

  async findUserPayments(userId: string) {
    return this.paymentModel.find({ userId });
  }

  async markPaid(orderId: string) {
    return this.paymentModel.findOneAndUpdate({ orderId }, { status: 'PAID' });
  }
}
