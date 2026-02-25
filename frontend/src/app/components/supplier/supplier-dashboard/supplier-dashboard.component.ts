import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-supplier-dashboard',
  templateUrl: './supplier-dashboard.component.html',
  styleUrls: ['./supplier-dashboard.component.css']
})
export class SupplierDashboardComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  stats = {
    totalProducts: 0,
    activeAuctions: 0,
    completedAuctions: 0,
    pendingProducts: 0
  };

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getSupplierProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  calculateStats() {
    this.stats.totalProducts = this.products.length;
    this.stats.activeAuctions = this.products.filter(p => p.status === 'active').length;
    this.stats.completedAuctions = this.products.filter(p => p.status === 'completed').length;
    this.stats.pendingProducts = this.products.filter(p => p.status === 'pending').length;
  }

  deleteProduct(productId: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => this.loadProducts(),
        error: (error) => alert('Error: ' + error)
      });
    }
  }
}
