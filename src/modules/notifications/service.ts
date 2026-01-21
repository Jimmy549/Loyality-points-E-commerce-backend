import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationGateway } from './notification.gateway';

export interface Notification {
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'ORDER' | 'LOYALTY' | 'GENERAL' | 'SALE';
  isRead: boolean;
  data?: any;
  createdAt?: Date;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel('Notification') private notificationModel: Model<Notification>,
    private notificationGateway: NotificationGateway
  ) {}

  async createNotification(notificationData: Omit<Notification, '_id' | 'isRead' | 'createdAt'>): Promise<Notification> {
    const notification = new this.notificationModel({
      ...notificationData,
      isRead: false
    });
    
    const savedNotification = await notification.save();
    
    // Send real-time notification
    this.notificationGateway.sendNotificationToUser(notificationData.userId, savedNotification);
    
    return savedNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationModel.find({ 
      $or: [{ userId }, { userId: 'SYSTEM' }] 
    }).sort({ createdAt: -1 }).limit(50).exec();
  }

  async getAdminNotifications(): Promise<Notification[]> {
    return this.notificationModel.find().sort({ createdAt: -1 }).limit(50).exec();
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return this.notificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    ).exec();
  }

  // Helper methods for specific notification types
  async sendOrderNotification(userId: string, orderId: string, status: string) {
    await this.createNotification({
      userId,
      title: 'Order Update',
      message: `Your order has been ${status.toLowerCase()}`,
      type: 'ORDER',
      data: { orderId, status }
    });
  }

  async sendLoyaltyNotification(userId: string, points: number, action: 'earned' | 'used') {
    await this.createNotification({
      userId,
      title: 'Loyalty Points Update',
      message: `You have ${action} ${points} loyalty points`,
      type: 'LOYALTY',
      data: { points, action }
    });
  }
}