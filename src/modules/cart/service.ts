import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from './cart.interface';
import { Product } from '../products/product.interface';
import { AddToCartDto, RemoveFromCartDto, UpdateCartItemDto } from './dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel('Cart') private cartModel: Model<Cart>,
    @InjectModel('Product') private productModel: Model<Product>
  ) {}

  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartModel.findOne({ userId }).populate('items.productId').exec();
    if (!cart) {
      cart = new this.cartModel({ userId, items: [], totalPrice: 0 });
      await cart.save();
    }
    return cart;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const product = await this.productModel.findById(addToCartDto.productId);
    if (!product) throw new NotFoundException('Product not found');
    if (product.stock < addToCartDto.quantity) throw new BadRequestException('Insufficient stock');

    let cart = await this.cartModel.findOne({ userId });
    if (!cart) cart = new this.cartModel({ userId, items: [], totalPrice: 0 });

    const existingItem = cart.items.find(item => item.productId.toString() === addToCartDto.productId);
    const requestedQuantity = (existingItem?.quantity || 0) + addToCartDto.quantity;

    if (product.stock < requestedQuantity) {
      throw new BadRequestException(`Insufficient stock. Total available: ${product.stock}`);
    }

    const price = product.isOnSale ? product.salePrice : product.price;

    if (existingItem) {
      existingItem.quantity += addToCartDto.quantity;
      existingItem.price = price;
    } else {
      cart.items.push({
        productId: addToCartDto.productId,
        quantity: addToCartDto.quantity,
        price
      });
    }

    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    return cart.save();
  }

  async updateCartItem(userId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) throw new NotFoundException('Cart not found');

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === updateCartItemDto.productId);
    if (itemIndex === -1) throw new NotFoundException('Item not found in cart');

    const product = await this.productModel.findById(updateCartItemDto.productId);
    if (!product) throw new NotFoundException('Product not found');
    if (product.stock < updateCartItemDto.quantity) {
      throw new BadRequestException(`Insufficient stock. Total available: ${product.stock}`);
    }

    cart.items[itemIndex].quantity = updateCartItemDto.quantity;
    const price = product.isOnSale ? product.salePrice : product.price;
    cart.items[itemIndex].price = price;

    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    return cart.save();
  }

  async removeFromCart(userId: string, removeFromCartDto: RemoveFromCartDto): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) throw new NotFoundException('Cart not found');

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === removeFromCartDto.productId);
    if (itemIndex === -1) throw new NotFoundException('Item not found in cart');

    if (removeFromCartDto.quantity) {
      cart.items[itemIndex].quantity -= removeFromCartDto.quantity;
      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
    } else {
      cart.items.splice(itemIndex, 1);
    }

    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    return cart.save();
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) throw new NotFoundException('Cart not found');
    
    cart.items = [];
    cart.totalPrice = 0;
    return cart.save();
  }
}
