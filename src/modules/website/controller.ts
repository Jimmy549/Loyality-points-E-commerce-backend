import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebsiteService } from './service';
import { CreateWebsiteContentDto, UpdateWebsiteContentDto, QueryWebsiteContentDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Website Content')
@Controller('website')
export class WebsiteController {
  constructor(private websiteService: WebsiteService) {}

  @Get()
  @ApiOperation({ summary: 'Get all website content' })
  @ApiResponse({ status: 200, description: 'Returns all website content' })
  findAll(@Query() query: QueryWebsiteContentDto) {
    return this.websiteService.findAll(query);
  }

  @Get('section/:section')
  @ApiOperation({ summary: 'Get content by section' })
  @ApiResponse({ status: 200, description: 'Returns content for specific section' })
  findBySection(@Param('section') section: string) {
    return this.websiteService.findBySection(section);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content by ID' })
  @ApiResponse({ status: 200, description: 'Returns content details' })
  findOne(@Param('id') id: string) {
    return this.websiteService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create new content (Admin only)' })
  @ApiResponse({ status: 201, description: 'Content created successfully' })
  create(@Body() createDto: CreateWebsiteContentDto) {
    return this.websiteService.create(createDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update content (Admin only)' })
  @ApiResponse({ status: 200, description: 'Content updated successfully' })
  update(@Param('id') id: string, @Body() updateDto: UpdateWebsiteContentDto) {
    return this.websiteService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete content (Admin only)' })
  @ApiResponse({ status: 200, description: 'Content deleted successfully' })
  delete(@Param('id') id: string) {
    return this.websiteService.delete(id);
  }

  @Post('seed')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Seed default content (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Default content seeded successfully' })
  seedDefaultContent() {
    return this.websiteService.seedDefaultContent();
  }
}