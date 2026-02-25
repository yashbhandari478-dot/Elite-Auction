export interface Bid {
  _id?: string;
  productId: string;
  productName?: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  bidAmount: number;
  bidTime: Date;
  isWinning?: boolean;
  status: 'active' | 'won' | 'lost' | 'rejected';
  createdAt?: Date;
}

export interface PlaceBidRequest {
  productId: string;
  bidAmount: number;
}

export interface BidResponse {
  message: string;
  bid: Bid;
  currentHighestBid: number;
}

export interface TrackingEvent {
  status: string;
  location: string;
  description: string;
  timestamp: Date;
}

export interface DeliveryAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email?: string;
}

export interface WinningBid {
  _id?: string;
  productId: any;   // may be a plain string ID or a populated object
  productName: string;
  customerId: string;
  customerName: string;
  supplierId: any;
  supplierName: string;
  winningAmount: number;
  status: 'accepted' | 'rejected' | 'pending' | 'active';
  paymentStatus: 'pending' | 'completed' | 'failed';
  auctionEndTime: Date;
  createdAt?: Date;
  // Platform fees
  buyersPremiumRate?: number;   // e.g. 0.03
  buyersPremium?: number;       // ₹ charged on top to customer
  platformFeeRate?: number;     // e.g. 0.05
  platformFee?: number;         // ₹ deducted from supplier payout
  customerTotalAmount?: number; // winningAmount + buyersPremium
  supplierPayout?: number;      // winningAmount - platformFee
  // Delivery tracking fields
  deliveryStatus?: 'order_placed' | 'payment_confirmed' | 'dispatched' | 'in_transit' | 'out_for_delivery' | 'delivered';
  estimatedDelivery?: Date;
  deliveryAddress?: DeliveryAddress;
  trackingHistory?: TrackingEvent[];
}
