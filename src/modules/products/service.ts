import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.interface';
import { CreateProductDto, UpdateProductDto, QueryProductsDto } from './dto';
import { NotificationGateway } from '../notifications/notification.gateway';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private productModel: Model<Product>,
    private notificationGateway: NotificationGateway
  ) {}

  async findAll(query?: QueryProductsDto): Promise<{ products: any[]; total: number; page: number; pages: number }> {
    const { search, category, loyaltyType, onSale, minPrice, maxPrice, page = 1, limit = 20, sortBy = 'createdAt' } = query || {};
    
    const filter: any = {};
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (loyaltyType) {
      filter.loyaltyType = loyaltyType;
    }
    
    if (onSale !== undefined) {
      filter.isOnSale = onSale;
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }
    
    const sort: any = {};
    if (sortBy) {
      const isDescending = sortBy.startsWith('-');
      const field = isDescending ? sortBy.substring(1) : sortBy;
      sort[field] = isDescending ? -1 : 1;
    }
    
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      this.productModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(filter).exec()
    ]);
    
    const mappedProducts = products.map(p => ({
      ...p.toObject(),
      id: p._id,
      srcUrl: p.images?.[0] || '',
      gallery: p.images || [],
      rating: 4.5,
      discount: {
        amount: 0,
        percentage: p.isOnSale && p.salePrice ? Math.round(((p.price - p.salePrice) / p.price) * 100) : 0
      }
    }));
    
    return {
      products: mappedProducts,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string): Promise<any> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    
    return {
      ...product.toObject(),
      id: product._id,
      srcUrl: product.images?.[0] || '',
      gallery: product.images || [],
      rating: 4.5,
      discount: {
        amount: 0,
        percentage: product.isOnSale && product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0
      }
    };
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const oldProduct = await this.productModel.findById(id).exec();
    
    const product = await this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
    if (!product) throw new NotFoundException('Product not found');
    
    if (updateProductDto.isOnSale && !oldProduct?.isOnSale) {
      this.notificationGateway.emitSaleStarted({
        productId: product._id,
        title: product.title,
        originalPrice: product.price,
        salePrice: product.salePrice
      });
    }
    
    return product;
  }

  async delete(id: string): Promise<{ message: string }> {
    const product = await this.productModel.findByIdAndDelete(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return { message: 'Product deleted successfully' };
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.productModel.distinct('category').exec();
    return categories.filter(cat => cat);
  }

  async getTotalCount(): Promise<number> {
    return this.productModel.countDocuments().exec();
  }

  async startSale(id: string, salePrice: number): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      { isOnSale: true, salePrice },
      { new: true }
    ).exec();
    
    if (!product) throw new NotFoundException('Product not found');
    
    // Broadcast sale notification to all users
    this.notificationGateway.emitSaleStarted({
      productId: product._id.toString(),
      title: product.title,
      originalPrice: product.price,
      salePrice: product.salePrice,
      message: `🔥 Sale Alert! ${product.title} is now on sale!`
    });
    
    return product;
  }

  async endSale(id: string): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      { isOnSale: false, salePrice: null },
      { new: true }
    ).exec();
    
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
