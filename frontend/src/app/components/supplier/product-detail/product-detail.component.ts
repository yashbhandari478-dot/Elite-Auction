import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { BidService } from '../../../services/bid.service';
import { WebsocketService } from '../../../services/websocket.service';
import { Product } from '../../../models/product.model';
import { Bid } from '../../../models/bid.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-supplier-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class SupplierProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  bids: Bid[] = [];
  loading = true;
  error = '';
  success = '';
  productId = '';
  private bidSub?: Subscription;
  private timerInterval: any;
  timeRemaining = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private bidService: BidService,
    private wsService: WebsocketService
  ) {}

  ngOnInit() {
    this.productId = this.route.snapshot.params['id'];
    this.loadProduct();
    this.loadBids();
    this.wsService.joinProductRoom(this.productId);
    this.bidSub = this.wsService.onBidUpdate().subscribe(data => {
      if (data.productId === this.productId) {
        if (this.product) {
          this.product.currentPrice = data.newBid;
          this.product.highestBidder = data.bidderId;
        }
        this.loadBids();
      }
    });
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
  }

  ngOnDestroy() {
    this.bidSub?.unsubscribe();
    this.wsService.leaveProductRoom(this.productId);
    clearInterval(this.timerInterval);
  }

  loadProduct() {
    this.productService.getProductById(this.productId).subscribe({
      next: (p) => { this.product = p; this.updateTimer(); this.loading = false; },
      error: (e) => { this.error = e; this.loading = false; }
    });
  }

  loadBids() {
    this.bidService.getBidsByProduct(this.productId).subscribe({
      next: (bids) => { this.bids = bids; },
      error: () => {}
    });
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

  acceptBid() {
    if (!confirm('Accept the highest bid? This cannot be undone.')) return;
    this.productService.acceptBid(this.productId).subscribe({
      next: () => { this.success = 'Bid accepted! Auction completed.'; this.loadProduct(); },
      error: (e) => { this.error = e; }
    });
  }

  rejectBid() {
    if (!confirm('Reject the bid and cancel auction?')) return;
    this.productService.rejectBid(this.productId).subscribe({
      next: () => { this.success = 'Bid rejected. Auction cancelled.'; this.loadProduct(); },
      error: (e) => { this.error = e; }
    });
  }
}
