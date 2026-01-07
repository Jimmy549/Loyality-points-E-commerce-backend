export interface WebsiteContent {
  _id?: string;
  section: 'hero' | 'brands' | 'new-arrivals' | 'top-selling' | 'dress-style' | 'reviews' | 'footer' | 'about' | 'contact';
  type: 'text' | 'image' | 'list' | 'object' | 'array';
  key: string;
  value: any;
  isActive: boolean;
  order: number;
  metadata?: {
    title?: string;
    description?: string;
    alt?: string;
    link?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}