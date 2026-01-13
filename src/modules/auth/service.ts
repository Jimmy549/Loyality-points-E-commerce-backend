import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.interface';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      console.log('Registration attempt for:', registerDto.email);
      
      // Check if user already exists
      const existingUser = await this.userModel.findOne({ email: registerDto.email });
      if (existingUser) {
        console.log('User already exists:', registerDto.email);
        throw new ConflictException('Email already exists');
      }

      console.log('Creating new user:', registerDto.email);
      const user = new this.userModel({
        ...registerDto,
        loyaltyPoints: 0 // New users start with 0 points, earn points through purchases
      });
      
      await user.save();
      console.log('User saved successfully:', user._id);
      
      const { password, ...userResult } = user.toObject();
      const payload = { 
        sub: user._id, 
        email: user.email, 
        role: user.role,
        iss: 'ecom-loyalty-backend',
        aud: 'ecom-loyalty-frontend'
      };
      
      const token = this.jwtService.sign(payload);
      console.log('JWT token generated for:', user.email);
      
      return {
        access_token: token,
        user: userResult
      };
    } catch (error) {
      console.error('Registration error:', error.message, error.stack);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      console.log('Login attempt for:', loginDto.email);
      
      const user = await this.userModel.findOne({ email: loginDto.email });
      if (!user) {
        console.log('User not found:', loginDto.email);
        throw new UnauthorizedException('Invalid credentials');
      }
      
      console.log('User found, checking password for role:', user.role);
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      
      if (!isPasswordValid) {
        console.log('Password invalid for:', loginDto.email);
        throw new UnauthorizedException('Invalid credentials');
      }
      
      console.log('Login successful for:', user.email, 'Role:', user.role);
      
      const { password, ...userResult } = user.toObject();
      const payload = { 
        sub: user._id, 
        email: user.email, 
        role: user.role,
        iss: 'ecom-loyalty-backend',
        aud: 'ecom-loyalty-frontend'
      };
      
      return {
        access_token: this.jwtService.sign(payload),
        user: userResult
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  async socialLogin(userData: any) {
    try {
      console.log('Social login attempt:', userData.email, 'Provider:', userData.provider);
      
      let user = await this.userModel.findOne({ email: userData.email });
      
      if (!user) {
        console.log('Creating new user from social login');
        user = await this.userModel.create({
          name: userData.name,
          email: userData.email,
          provider: userData.provider,
          providerId: userData.providerId,
          avatar: userData.avatar,
          loyaltyPoints: 0,
          role: 'USER'
        });
      } else if (user.provider === 'local' && userData.provider !== 'local') {
        console.log('Linking social provider to existing local account');
        user.provider = userData.provider;
        user.providerId = userData.providerId;
        user.avatar = userData.avatar || user.avatar;
        await user.save();
      }
      
      const { password, ...userResult } = user.toObject();
      const payload = { 
        sub: user._id, 
        email: user.email, 
        role: user.role,
        iss: 'ecom-loyalty-backend',
        aud: 'ecom-loyalty-frontend'
      };
      
      const token = this.jwtService.sign(payload);
      console.log('Social login successful for:', user.email);
      
      return {
        access_token: token,
        user: userResult
      };
    } catch (error) {
      console.error('Social login error:', error.message);
      throw new Error(`Social login failed: ${error.message}`);
    }
  }
}