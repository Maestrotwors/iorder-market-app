export interface IUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
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
