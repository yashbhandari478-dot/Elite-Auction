import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { BidService } from '../../../services/bid.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-admin-auctions',
  templateUrl: './admin-auctions.component.html',
  styleUrls: ['./admin-auctions.component.css']
})
export class AdminAuctionsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  filterStatus = 'all';
  loading = true;
  error = '';

  constructor(
    private productService: ProductService,
    private bidService: BidService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilter();
        this.loading = false;
      },
      error: (e) => { this.error = e; this.loading = false; }
    });
  }

  applyFilter() {
    this.filteredProducts = this.filterStatus === 'all'
      ? this.products
      : this.products.filter(p => p.status === this.filterStatus);
  }

  getStatusClass(status: string): string {
    const map: any = {
      active: 'badge-success',
      pending: 'badge-warning',
      completed: 'badge-info',
      cancelled: 'badge-danger'
    };
    return map[status] || 'badge-info';
  }

  getTimeRemaining(endTime: Date): string {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
}
