export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'supplier' | 'customer';
  phone?: string;
  address?: string;
  isApproved: boolean;
  isBlocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: 'admin' | 'supplier' | 'customer';
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'supplier' | 'customer';
  phone?: string;
  address?: string;
}
