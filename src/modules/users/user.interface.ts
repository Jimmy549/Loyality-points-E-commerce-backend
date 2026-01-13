export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  loyaltyPoints: number;
  provider?: 'local' | 'google' | 'github' | 'discord';
  providerId?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}