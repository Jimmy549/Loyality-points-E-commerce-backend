import { Controller, Get, Post, Patch, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CartService } from './service';
import { AddToCartDto, RemoveFromCartDto, UpdateCartItemDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({ status: 200, description: 'Returns user cart' })
  getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.sub);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  addToCart(@CurrentUser() user: any, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(user.sub, addToCartDto);
  }

  @Patch('items')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart item updated' })
  updateCartItem(@CurrentUser() user: any, @Body() updateCartItemDto: UpdateCartItemDto) {
    return this.cartService.updateCartItem(user.sub, updateCartItemDto);
  }

  @Delete('items')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  removeFromCart(@CurrentUser() user: any, @Body() removeFromCartDto: RemoveFromCartDto) {
    return this.cartService.removeFromCart(user.sub, removeFromCartDto);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.sub);
  }
}
