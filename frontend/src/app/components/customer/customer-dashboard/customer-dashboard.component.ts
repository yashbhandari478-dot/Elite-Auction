import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { BidService } from '../../../services/bid.service';
import { WebsocketService } from '../../../services/websocket.service';
import { Product } from '../../../models/product.model';
import { Category } from '../../../models/category.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  featuredProduct: Product | null = null;
  categories: Category[] = [];
  selectedCategory = 'all';
  searchTerm = '';
  loading = true;
  error = '';
  email = '';
  private bidUpdateSubscription?: Subscription;

  trustBadges = [
    { icon: '✅', title: 'Verified Sellers', desc: 'Identity checks complete' },
    { icon: '🛡️', title: 'Buyer Protection', desc: 'Full payment security' },
    { icon: '📦', title: 'Insured Shipping', desc: 'Global concierge delivery' },
    { icon: '🏅', title: 'Authenticity Guarantee', desc: 'Third-party certification' }
  ];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private bidService: BidService,
    private websocketService: WebsocketService
  ) { }

  ngOnInit() {
    try {
      console.log('=== Customer Dashboard Init ===');
      this.loadCategories();
      this.loadProducts();
      this.setupWebSocket();
    } catch (error) {
      console.error('Error in customer dashboard init:', error);
      this.error = 'Error loading dashboard. Please refresh.';
      this.loading = false;
    }
  }

  ngOnDestroy() {
    if (this.bidUpdateSubscription) {
      this.bidUpdateSubscription.unsubscribe();
    }
  }

  loadCategories() {
    this.categoryService.getActiveCategories().subscribe({
      next: (categories) => {
        console.log('Categories loaded:', categories.length);
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadProducts() {
    this.loading = true;
    this.error = '';
    this.productService.getActiveProducts().subscribe({
      next: (products) => {
        console.log('Products loaded:', products.length);
        this.products = products;
        // Pick the product with the highest current price as featured
        if (products.length > 0) {
          this.featuredProduct = [...products].sort(
            (a, b) => (b.currentPrice || b.basePrice) - (a.currentPrice || a.basePrice)
          )[0];
        }
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Error loading products. Please refresh.';
        this.loading = false;
      }
    });
  }

  setupWebSocket() {
    try {
      this.bidUpdateSubscription = this.websocketService.onBidUpdate().subscribe({
        next: (data) => {
          const product = this.products.find(p => p._id === data.productId);
          if (product) {
            product.currentPrice = data.newBid;
            product.highestBidder = data.bidderId;
            if (this.featuredProduct?._id === data.productId) {
              this.featuredProduct!.currentPrice = data.newBid;
            }
          }
        },
        error: (error) => {
          console.error('WebSocket error:', error);
        }
      });
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = this.selectedCategory === 'all' || product.category === this.selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  getTimeRemaining(endTime: Date): string {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return '00:00:00';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  getProductImage(product: Product): string {
    return product.images && product.images.length > 0
      ? product.images[0]
      : 'https://placehold.co/400x300?text=No+Image';
  }
}
