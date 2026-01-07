import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebsiteContent } from './website.interface';
import { CreateWebsiteContentDto, UpdateWebsiteContentDto, QueryWebsiteContentDto } from './dto';

@Injectable()
export class WebsiteService {
  constructor(@InjectModel('WebsiteContent') private websiteContentModel: Model<WebsiteContent>) {}

  async create(createDto: CreateWebsiteContentDto): Promise<WebsiteContent> {
    try {
      const content = new this.websiteContentModel(createDto);
      return await content.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Content with this section and key already exists');
      }
      throw new BadRequestException('Failed to create content');
    }
  }

  async findAll(query: QueryWebsiteContentDto): Promise<WebsiteContent[]> {
    const filter: any = {};
    if (query.section) filter.section = query.section;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    return this.websiteContentModel.find(filter).sort({ section: 1, order: 1 }).exec();
  }

  async findBySection(section: string): Promise<WebsiteContent[]> {
    return this.websiteContentModel.find({ section, isActive: true }).sort({ order: 1 }).exec();
  }

  async findOne(id: string): Promise<WebsiteContent> {
    const content = await this.websiteContentModel.findById(id).exec();
    if (!content) throw new NotFoundException('Content not found');
    return content;
  }

  async update(id: string, updateDto: UpdateWebsiteContentDto): Promise<WebsiteContent> {
    const content = await this.websiteContentModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true, runValidators: true }
    ).exec();
    
    if (!content) throw new NotFoundException('Content not found');
    return content;
  }

  async delete(id: string): Promise<void> {
    const result = await this.websiteContentModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Content not found');
  }

  async seedDefaultContent(): Promise<void> {
    const defaultContent = [
      {
        section: 'hero',
        type: 'text',
        key: 'main-title',
        value: 'FIND CLOTHES THAT MATCHES YOUR STYLE',
        order: 1
      },
      {
        section: 'hero',
        type: 'text',
        key: 'subtitle',
        value: 'Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.',
        order: 2
      },
      {
        section: 'brands',
        type: 'array',
        key: 'brand-list',
        value: ['versace', 'zara', 'gucci', 'prada', 'calvin-klein'],
        order: 1
      },
      {
        section: 'footer',
        type: 'object',
        key: 'company-info',
        value: {
          name: 'SHOP.CO',
          description: 'We have clothes that suits your style and which you\'re proud to wear. From women to men.',
          email: 'support@shopco.com',
          phone: '+1-000-000-0000'
        },
        order: 1
      }
    ];

    for (const content of defaultContent) {
      try {
        await this.websiteContentModel.create(content);
      } catch (error) {
        // Skip if already exists
      }
    }
  }
}