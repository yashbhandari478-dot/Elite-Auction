import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  pendingProducts: Product[] = [];
  loading = true;
  error = '';
  success = '';
  filterStatus = 'all';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadPendingProducts();
  }

  loadPendingProducts() {
    this.loading = true;
    this.productService.getPendingProducts().subscribe({
      next: (products) => {
        this.pendingProducts = products;
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
      }
    });
  }

  approveProduct(productId: string, product: Product) {
    if (confirm(`Are you sure you want to approve "${product.name}"?`)) {
      this.productService.approveProduct(productId).subscribe({
        next: () => {
          this.success = `"${product.name}" approved successfully!`;
          this.loadPendingProducts();
          setTimeout(() => { this.success = ''; }, 3000);
        },
        error: (error) => {
          this.error = error;
        }
      });
    }
  }

  rejectProduct(productId: string, product: Product) {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason !== null) {
      this.productService.rejectProduct(productId, { reason }).subscribe({
        next: () => {
          this.success = `"${product.name}" rejected successfully!`;
          this.loadPendingProducts();
          setTimeout(() => { this.success = ''; }, 3000);
        },
        error: (error) => {
          this.error = error;
        }
      });
    }
  }

  getSupplierInfo(product: Product): string {
    return product.supplierName || 'Unknown Supplier';
  }
}
