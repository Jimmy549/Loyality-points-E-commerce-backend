import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './payment.interface';
import { CreatePaymentDto, UpdatePaymentDto } from './dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel('Payment') private paymentModel: Model<Payment>
  ) {}

  async create(userId: string, createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = new this.paymentModel({
      ...createPaymentDto,
      userId,
      status: 'completed', // Auto-complete for demo
      processedAt: new Date(),
      transactionId: `txn_${Date.now()}`
    });
    return payment.save();
  }

  async findByOrderId(orderId: string): Promise<Payment> {
    const payment = await this.paymentModel.findOne({ orderId }).exec();
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async findUserPayments(userId: string): Promise<Payment[]> {
    return this.paymentModel.find({ userId }).populate('orderId').exec();
  }

  async updateStatus(paymentId: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.paymentModel.findByIdAndUpdate(paymentId, updatePaymentDto, { new: true }).exec();
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}