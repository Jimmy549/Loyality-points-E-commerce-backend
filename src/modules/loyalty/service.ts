import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../products/product.interface';
import { User } from '../users/user.interface';
import { Loyalty } from './loyalty.interface';
import { UpdateLoyaltySettingsDto } from './dto/update-settings.dto';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectModel('Product') private productModel: Model<Product>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Loyalty') private loyaltyModel: Model<Loyalty>
  ) {}

  private async getSettings(): Promise<Loyalty> {
    const settings = await this.loyaltyModel.findOne().exec();
    if (!settings) {
      // Return defaults if no settings found
      return {
        pointsPerDollar: 10,
        pointsToMoneyRate: 0.1,
        isActive: true
      } as Loyalty;
    }
    return settings;
  }

  async updateSettings(dto: UpdateLoyaltySettingsDto): Promise<Loyalty> {
    const settings = await this.loyaltyModel.findOne().exec();
    if (settings) {
      return this.loyaltyModel.findByIdAndUpdate(settings._id, dto, { new: true }).exec();
    } else {
      const newSettings = new this.loyaltyModel(dto);
      return newSettings.save();
    }
  }

  validatePaymentMethod(product: Product, paymentType: 'MONEY' | 'POINTS' | 'HYBRID', pointsUsed?: number): boolean {
    switch (product.loyaltyType) {
      case 'MONEY':
        if (paymentType !== 'MONEY') {
          throw new BadRequestException('This product can only be purchased with money');
        }
        return true;

      case 'POINTS':
        if (paymentType !== 'POINTS') {
          throw new BadRequestException('This product can only be purchased with points');
        }
        return true;

      case 'HYBRID':
        if (!['MONEY', 'POINTS', 'HYBRID'].includes(paymentType)) {
          throw new BadRequestException('Invalid payment method for hybrid product');
        }
        return true;

      default:
        throw new BadRequestException('Invalid product loyalty type');
    }
  }

  async validateCartPayment(cartItems: any[], paymentType: 'MONEY' | 'POINTS' | 'HYBRID', pointsUsed: number = 0): Promise<boolean> {
    for (const item of cartItems) {
      const product = await this.productModel.findById(item.productId);
      if (!product) throw new BadRequestException('Product not found');
      
      this.validatePaymentMethod(product, paymentType, pointsUsed);
    }
    return true;
  }

  async calculatePointsRequired(price: number): Promise<number> {
    const settings = await this.getSettings();
    return Math.ceil(price / settings.pointsToMoneyRate);
  }

  async calculatePointsEarned(amountSpent: number): Promise<number> {
    const settings = await this.getSettings();
    if (!settings.isActive) return 0;
    return Math.floor(amountSpent * settings.pointsPerDollar);
  }

  async calculateMoneyValue(points: number): Promise<number> {
    const settings = await this.getSettings();
    return points * settings.pointsToMoneyRate;
  }

  async validateUserPoints(userId: string, pointsRequired: number): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    
    if (user.loyaltyPoints < pointsRequired) {
      throw new BadRequestException(`Insufficient points. Required: ${pointsRequired}, Available: ${user.loyaltyPoints}`);
    }
    return true;
  }

  async getConversionRates() {
    const settings = await this.getSettings();
    return {
      pointsPerDollar: settings.pointsPerDollar,
      pointsToMoneyRate: settings.pointsToMoneyRate,
      description: `$1 = ${settings.pointsPerDollar} points, ${Math.ceil(1/settings.pointsToMoneyRate)} points = $1`
    };
  }
}