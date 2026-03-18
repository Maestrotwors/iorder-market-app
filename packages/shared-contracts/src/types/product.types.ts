export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  supplierId: string;
  images: string[];
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: ICategory[];
  createdAt: Date;
  updatedAt: Date;
}
