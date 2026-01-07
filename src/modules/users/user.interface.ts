export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  loyaltyPoints: number;
  createdAt?: Date;
  updatedAt?: Date;
}