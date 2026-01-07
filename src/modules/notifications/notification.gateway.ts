import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({ 
  cors: { 
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || 'https://your-frontend-domain.com']
      : (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(','),
    credentials: true 
  },
  namespace: '/notifications'
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove user from connected users
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, userId: string) {
    this.connectedUsers.set(userId, client.id);
    client.join(`user_${userId}`);
    console.log(`User ${userId} joined with socket ${client.id}`);
  }

  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }

  sendOrderUpdate(userId: string, orderData: any) {
    this.server.to(`user_${userId}`).emit('orderUpdate', orderData);
  }

  sendLoyaltyUpdate(userId: string, loyaltyData: any) {
    this.server.to(`user_${userId}`).emit('loyaltyUpdate', loyaltyData);
  }

  // Specific event methods
  emitSaleStarted(productData: any) {
    this.server.emit('SALE_STARTED', productData);
  }

  emitOrderPlaced(userId: string, orderData: any) {
    this.server.to(`user_${userId}`).emit('ORDER_PLACED', orderData);
  }

  emitPointsEarned(userId: string, pointsData: any) {
    this.server.to(`user_${userId}`).emit('POINTS_EARNED', pointsData);
  }
}