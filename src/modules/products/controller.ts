import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './service';
import { CreateProductDto, UpdateProductDto, QueryProductsDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CloudinaryService } from '../../common/services/cloudinary.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private cloudinaryService: CloudinaryService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated products' })
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories' })
  @ApiResponse({ status: 200, description: 'Returns list of categories' })
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Returns product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiOperation({ summary: 'Create new product with images (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async create(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    try {
      console.log('Received body:', body);
      console.log('Received files:', files?.length || 0);
      
      // Handle image uploads
      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        imageUrls = await Promise.all(
          files.map(file => this.cloudinaryService.uploadImage(file))
        );
      }
      
      // Parse tags - ensure it's always an array
      let tags: string[] = [];
      if (body.tags) {
        if (typeof body.tags === 'string') {
          try {
            const parsed = JSON.parse(body.tags);
            tags = Array.isArray(parsed) ? parsed : [];
          } catch {
            tags = [];
          }
        } else if (Array.isArray(body.tags)) {
          tags = body.tags;
        }
      }
      
      // Create product data
      const productData = {
        title: body.title,
        description: body.description,
        price: parseFloat(body.price) || 0,
        stock: parseInt(body.stock) || 0,
        salePrice: body.salePrice ? parseFloat(body.salePrice) : undefined,
        isOnSale: body.salePrice && parseFloat(body.salePrice) > 0,
        loyaltyType: body.loyaltyType || 'MONEY',
        category: body.category,
        tags,
        images: imageUrls
      };
      
      console.log('Creating product with data:', productData);
      
      return this.productsService.create(productData);
    } catch (error) {
      console.error('Product creation error:', error);
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiOperation({ summary: 'Update product with images (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    let imageUrls: string[] = [];
    
    if (files && files.length > 0) {
      imageUrls = await Promise.all(
        files.map(file => this.cloudinaryService.uploadImage(file))
      );
    }
    
    const updateData = { ...updateProductDto };
    if (imageUrls.length > 0) {
      updateData.images = imageUrls;
    }
    
    return this.productsService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @Post(':id/start-sale')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Start sale for product and notify users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Sale started and notifications sent' })
  async startSale(
    @Param('id') id: string,
    @Body() body: { salePrice: number }
  ) {
    return this.productsService.startSale(id, body.salePrice);
  }

  @Post(':id/end-sale')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'End sale for product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Sale ended successfully' })
  async endSale(@Param('id') id: string) {
    return this.productsService.endSale(id);
  }
}
