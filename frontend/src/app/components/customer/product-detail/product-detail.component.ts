import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { BidService } from '../../../services/bid.service';
import { WebsocketService } from '../../../services/websocket.service';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models/product.model';
import { Bid } from '../../../models/bid.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class CustomerProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  bids: Bid[] = [];
  bidForm!: FormGroup;
  loading = true;
  submitting = false;
  error = '';
  success = '';
  productId = '';
  timeRemaining = '';
  private bidSub?: Subscription;
  private timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private productService: ProductService,
    private bidService: BidService,
    private wsService: WebsocketService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.productId = this.route.snapshot.params['id'];
    this.loadProduct();
    this.loadBids();
    this.wsService.joinProductRoom(this.productId);
    this.bidSub = this.wsService.onBidUpdate().subscribe(data => {
      if (data.productId === this.productId && this.product) {
        this.product.currentPrice = data.newBid;
        this.updateMinBid();
        this.loadBids();
      }
    });
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    this.bidForm = this.fb.group({
      bidAmount: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnDestroy() {
    this.bidSub?.unsubscribe();
    this.wsService.leaveProductRoom(this.productId);
    clearInterval(this.timerInterval);
  }

  loadProduct() {
    this.productService.getProductById(this.productId).subscribe({
      next: (p) => {
        this.product = p;
        this.updateTimer();
        this.updateMinBid();
        this.loading = false;
      },
      error: (e) => { this.error = e; this.loading = false; }
    });
  }

  loadBids() {
    this.bidService.getBidsByProduct(this.productId).subscribe({
      next: (bids) => { this.bids = bids; },
      error: () => {}
    });
  }

  updateMinBid() {
    if (this.product) {
      const min = (this.product.currentPrice || this.product.basePrice) + 1;
      this.bidForm.get('bidAmount')?.setValidators([Validators.required, Validators.min(min)]);
      this.bidForm.get('bidAmount')?.updateValueAndValidity();
    }
  }

  updateTimer() {
    if (!this.product) return;
    const diff = new Date(this.product.auctionEndTime).getTime() - Date.now();
    if (diff <= 0) { this.timeRemaining = 'Auction Ended'; return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    this.timeRemaining = d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`;
  }

  get f() { return this.bidForm.controls; }

  get minBid(): number {
    return this.product ? (this.product.currentPrice || this.product.basePrice) + 1 : 1;
  }

  onPlaceBid() {
    if (this.bidForm.invalid) return;
    this.submitting = true;
    this.error = '';
    this.success = '';

    this.bidService.placeBid({
      productId: this.productId,
      bidAmount: Number(this.f['bidAmount'].value)
    }).subscribe({
      next: (res) => {
        this.success = `Bid of ₹${res.bid.bidAmount} placed successfully!`;
        this.bidForm.reset();
        this.submitting = false;
        // Reload product to get updated currentPrice
        this.loadProduct();
        this.loadBids();
        // Clear success message after 3 seconds
        setTimeout(() => { this.success = ''; }, 3000);
      },
      error: (e) => { this.error = e; this.submitting = false; }
    });
  }
}
