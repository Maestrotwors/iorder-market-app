import { UserRole } from '../enums';

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupplierProfile {
  id: string;
  userId: string;
  companyName: string;
  description: string;
  rating: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
