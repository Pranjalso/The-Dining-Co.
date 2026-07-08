export interface IAdmin {
  _id?: string;
  username: string;
  password: string;
  role: 'superadmin' | 'cafeadmin';
  cafeSlug?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICafe {
  _id?: string;
  cafeName: string;
  ownerName: string;
  city: string;
  location: string;
  subscriptionPlan: 'Demo (7 Days)' | '1 Month' | '3 Months' | '6 Months' | '12 Months' | 'Lifetime';
  startDate: Date;
  endDate: Date;
  slug: string;
  username: string;
  password: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMenuItem {
  _id?: string;
  cafeSlug: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl: string;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrder {
  _id?: string;
  cafeSlug: string;
  orderNumber: number;
  tableNumber: string;
  items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'upi';
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  upiId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JwtPayload {
  id: string;
  username: string;
  role: 'superadmin' | 'cafeadmin';
  cafeSlug?: string;
  cafeName?: string;
  tokenVersion?: number;
  sessionStart?: number;
  iat?: number;  // Issued at timestamp
  exp?: number;  // Expiration timestamp
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  user?: {
    id: string;
    username: string;
    role: string;
    cafeSlug?: string;
    cafeName?: string;
  };
}