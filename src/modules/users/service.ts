import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.interface';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.userModel.findById(userId).select('-password').exec();
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user profile');
    }
  }

  async getAllUsers(query?: { page?: number; limit?: number }): Promise<{ users: Omit<User, 'password'>[]; total: number }> {
    try {
      const { page = 1, limit = 20 } = query || {};
      const skip = (page - 1) * limit;
      
      const [users, total] = await Promise.all([
        this.userModel.find().select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
        this.userModel.countDocuments().exec()
      ]);
      
      return { users, total };
    } catch (error) {
      throw new BadRequestException('Failed to fetch users');
    }
  }

  async createAdmin(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      const existingUser = await this.userModel.findOne({ email: createUserDto.email });
      if (existingUser) throw new BadRequestException('User already exists');
      
      const adminUser = new this.userModel({
        ...createUserDto,
        role: 'ADMIN'
      });
      
      await adminUser.save();
      const { password, ...result } = adminUser.toObject();
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create admin user');
    }
  }

  async updateUserRole(userId: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { role: updateUserDto.role },
        { new: true, runValidators: true }
      ).select('-password').exec();
      
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user role');
    }
  }

  async assignRole(email: string, role: string): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) throw new NotFoundException('User not found');
      
      user.role = role as any;
      await user.save();
      const { password, ...result } = user.toObject();
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to assign role');
    }
  }

  async findById(id: string): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.userModel.findById(id).select('-password').exec();
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user');
    }
  }

  async getTotalCount(): Promise<number> {
    try {
      return this.userModel.countDocuments().exec();
    } catch (error) {
      throw new BadRequestException('Failed to get user count');
    }
  }
}