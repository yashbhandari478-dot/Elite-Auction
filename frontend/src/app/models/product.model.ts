export interface Product {
  _id?: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  currentPrice?: number;
  images: string[];
  supplierId: string;
  supplierName?: string;
  auctionStartTime: Date;
  auctionEndTime: Date;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  highestBid?: number;
  highestBidder?: string;
  winnerId?: string;
  isApproved?: boolean;
  approvalReason?: string;
  approvedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  category: string;
  basePrice: number;
  images: string[];
  auctionStartTime: Date;
  auctionEndTime: Date;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  category?: string;
  basePrice?: number;
  images?: string[];
  auctionStartTime?: Date;
  auctionEndTime?: Date;
}
