export interface Product {
  _id?: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  isOnSale: boolean;
  salePrice?: number;
  loyaltyType: 'MONEY' | 'POINTS' | 'HYBRID';
  loyaltyPointsCost?: number;
  category?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}