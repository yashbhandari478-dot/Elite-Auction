import { Component, OnInit } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { WinningBid } from '../../../models/bid.model';

@Component({
    selector: 'app-supplier-sales',
    templateUrl: './supplier-sales.component.html',
    styleUrls: ['./supplier-sales.component.css']
})
export class SupplierSalesComponent implements OnInit {
    sales: WinningBid[] = [];
    loading = false;
    error = '';
    successMessage = '';

    // Delivery status update modal
    showUpdateModal = false;
    selectedSale: WinningBid | null = null;
    updateForm = {
        deliveryStatus: '',
        location: '',
        description: ''
    };
    updateLoading = false;

    deliveryStatusOptions = [
        { value: 'dispatched', label: '📦 Dispatched' },
        { value: 'in_transit', label: '🚛 In Transit' },
        { value: 'out_for_delivery', label: '🏃 Out for Delivery' },
        { value: 'delivered', label: '✅ Delivered' }
    ];

    constructor(private bidService: BidService) { }

    ngOnInit(): void {
        this.loadSales();
    }

    loadSales(): void {
        this.loading = true;
        this.bidService.getSupplierWinningBids().subscribe({
            next: (sales) => {
                this.sales = sales;
                this.loading = false;
            },
            error: (err) => {
                this.error = err.error?.message || 'Failed to load sales';
                this.loading = false;
            }
        });
    }

    openUpdateModal(sale: WinningBid): void {
        this.selectedSale = sale;
        this.updateForm = { deliveryStatus: '', location: '', description: '' };
        this.showUpdateModal = true;
    }

    closeModal(): void {
        this.showUpdateModal = false;
        this.selectedSale = null;
    }

    submitDeliveryUpdate(): void {
        if (!this.selectedSale || !this.updateForm.deliveryStatus) {
            this.error = 'Please select a delivery status';
            return;
        }
        this.updateLoading = true;
        this.bidService.updateDeliveryStatus(
            this.selectedSale._id!,
            this.updateForm.deliveryStatus,
            this.updateForm.location,
            this.updateForm.description
        ).subscribe({
            next: () => {
                this.showSuccess('Delivery status updated successfully!');
                this.closeModal();
                this.loadSales();
                this.updateLoading = false;
            },
            error: (err) => {
                this.error = err.error?.message || 'Failed to update delivery status';
                this.updateLoading = false;
            }
        });
    }

    getDeliveryStatusLabel(status: string | undefined): string {
        const labels: Record<string, string> = {
            order_placed: 'Order Placed',
            payment_confirmed: 'Payment Confirmed',
            dispatched: 'Dispatched',
            in_transit: 'In Transit',
            out_for_delivery: 'Out for Delivery',
            delivered: 'Delivered'
        };
        return labels[status || ''] || status || 'Pending';
    }

    getStatusClass(status: string | undefined): string {
        const classes: Record<string, string> = {
            order_placed: 'status-placed',
            payment_confirmed: 'status-confirmed',
            dispatched: 'status-dispatched',
            in_transit: 'status-transit',
            out_for_delivery: 'status-ofd',
            delivered: 'status-delivered'
        };
        return classes[status || ''] || '';
    }

    canUpdateDelivery(sale: WinningBid): boolean {
        return sale.paymentStatus === 'completed' && sale.deliveryStatus !== 'delivered';
    }

    getTotalRevenue(): number {
        return this.sales.filter(s => s.paymentStatus === 'completed')
            .reduce((sum, s) => sum + s.winningAmount, 0);
    }

    getPendingCount(): number {
        return this.sales.filter(s => s.paymentStatus === 'pending').length;
    }

    private showSuccess(msg: string): void {
        this.successMessage = msg;
        setTimeout(() => this.successMessage = '', 4000);
    }
}
