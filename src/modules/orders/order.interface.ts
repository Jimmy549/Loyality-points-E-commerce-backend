export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  title: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id?: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  pointsUsed: number;
  pointsEarned: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress?: ShippingAddress;
  trackingNumber?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}