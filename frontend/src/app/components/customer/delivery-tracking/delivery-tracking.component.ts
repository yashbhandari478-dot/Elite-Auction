import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BidService } from '../../../services/bid.service';

interface TrackingEvent {
    status: string;
    location: string;
    description: string;
    timestamp: string;
}

interface DeliveryTracking {
    _id: string;
    productName: string;
    supplierName: string;
    winningAmount: number;
    deliveryStatus: string;
    estimatedDelivery: string;
    paymentStatus: string;
    createdAt: string;
    deliveryAddress?: {
        fullName: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
        phone: string;
        email: string;
    };
    trackingHistory: TrackingEvent[];
}

@Component({
    selector: 'app-delivery-tracking',
    templateUrl: './delivery-tracking.component.html',
    styleUrls: ['./delivery-tracking.component.css']
})
export class DeliveryTrackingComponent implements OnInit {

    tracking: DeliveryTracking | null = null;
    loading = true;
    error = '';
    orderId = '';

    readonly stages = [
        { key: 'order_placed', icon: '📋', label: 'Order Placed', sub: 'Your order has been received' },
        { key: 'payment_confirmed', icon: '💳', label: 'Payment Confirmed', sub: 'Payment successfully processed' },
        { key: 'dispatched', icon: '📦', label: 'Dispatched', sub: 'Shipped from warehouse' },
        { key: 'in_transit', icon: '🚚', label: 'In Transit', sub: 'On the way to your city' },
        { key: 'out_for_delivery', icon: '🏠', label: 'Out for Delivery', sub: 'With local delivery agent' },
        { key: 'delivered', icon: '✅', label: 'Delivered', sub: 'Package delivered!' }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private bidService: BidService
    ) { }

    ngOnInit() {
        this.orderId = this.route.snapshot.paramMap.get('id') || '';
        if (this.orderId) {
            this.loadTracking();
        } else {
            this.error = 'Invalid order ID';
            this.loading = false;
        }
    }

    loadTracking() {
        this.loading = true;
        this.bidService.getDeliveryTracking(this.orderId).subscribe({
            next: (res: any) => {
                this.tracking = res.tracking;
                this.loading = false;
            },
            error: (e: any) => {
                this.error = e.error?.message || 'Could not load tracking information';
                this.loading = false;
            }
        });
    }

    get currentStageIndex(): number {
        if (!this.tracking) return 0;
        return this.stages.findIndex(s => s.key === this.tracking!.deliveryStatus);
    }

    stageClass(index: number): string {
        const cur = this.currentStageIndex;
        if (index < cur) return 'done';
        if (index === cur) return 'active';
        return 'pending';
    }

    daysUntilDelivery(): number {
        if (!this.tracking?.estimatedDelivery) return 7;
        const diff = new Date(this.tracking.estimatedDelivery).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    progressPct(): number {
        return Math.round((this.currentStageIndex / (this.stages.length - 1)) * 100);
    }

    goBack() { this.router.navigate(['/customer/won-auctions']); }
}
