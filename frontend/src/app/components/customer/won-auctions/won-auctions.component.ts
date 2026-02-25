import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BidService } from '../../../services/bid.service';
import { RatingService } from '../../../services/rating.service';
import { RatingSubmissionComponent } from '../../shared/rating-submission/rating-submission.component';
import { WinningBid } from '../../../models/bid.model';

@Component({
  selector: 'app-won-auctions',
  templateUrl: './won-auctions.component.html',
  styleUrls: ['./won-auctions.component.css']
})
export class WonAuctionsComponent implements OnInit {
  wonAuctions: WinningBid[] = [];
  loading = true;
  error = '';
  today = new Date();


  /* Modal state */
  selectedAuction: WinningBid | null = null;
  showPaymentModal = false;

  /* Multi-step */
  paymentStep: 'method' | 'details' | 'delivery' | 'confirmation' = 'method';
  paymentProcessing = false;

  /* Payment */
  selectedPaymentMethod = '';
  paymentMethods = [
    { id: 'credit_card', name: '💳 Credit Card', description: 'Visa, Mastercard, AMEX', needsCard: true },
    { id: 'debit_card', name: '🏧 Debit Card', description: 'Debit cards accepted', needsCard: true },
    { id: 'upi', name: '📱 UPI', description: 'GPay, PhonePe, Paytm', needsCard: false },
    { id: 'net_banking', name: '🏦 Net Banking', description: 'Transfer via your bank', needsCard: false },
    { id: 'wallet', name: '💰 Digital Wallet', description: 'PayPal, Skrill, etc.', needsCard: false }
  ];

  /* Card details */
  cardDetails = {
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  };

  /* Delivery details */
  deliveryDetails = {
    fullName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: ''
  };

  constructor(
    private bidService: BidService,
    private ratingService: RatingService,
    private dialog: MatDialog
  ) { }

  ngOnInit() { this.loadWonAuctions(); }

  loadWonAuctions() {
    this.loading = true;
    this.error = '';
    this.bidService.getMyWinningBids().subscribe({
      next: (auctions) => { this.wonAuctions = auctions; this.loading = false; },
      error: (e) => { this.error = e.error?.message || e.message || 'Error loading won auctions'; this.loading = false; }
    });
  }

  /* ── Modal open/close ── */
  openPaymentModal(auction: WinningBid) {
    this.selectedAuction = auction;
    this.showPaymentModal = true;
    this.paymentStep = 'method';
    this.selectedPaymentMethod = '';
    this.cardDetails = { cardholderName: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '' };
    this.deliveryDetails = { fullName: '', address: '', city: '', state: '', pincode: '', phone: '', email: '' };
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedAuction = null;
    this.paymentProcessing = false;
  }

  /* ── Step helpers ── */
  get selectedMethod() {
    return this.paymentMethods.find(m => m.id === this.selectedPaymentMethod);
  }

  /* Step 1 → Step 2 (card) OR Step 3 (other) */
  selectPaymentMethod() {
    if (!this.selectedPaymentMethod) return;
    if (this.selectedMethod?.needsCard) {
      this.paymentStep = 'details';
    } else {
      this.paymentStep = 'delivery';
    }
  }

  goBackToMethod() { this.paymentStep = 'method'; }

  /* Step 2 → Step 3 */
  proceedFromPaymentDetails() {
    const c = this.cardDetails;
    if (!c.cardholderName || !c.cardNumber || !c.expiryMonth || !c.expiryYear || !c.cvv) {
      alert('Please fill in all card details.'); return;
    }
    this.paymentStep = 'delivery';
  }

  goBackToDetails() {
    this.paymentStep = this.selectedMethod?.needsCard ? 'details' : 'method';
  }

  /* Step 3 → API → Step 4 */
  proceedFromDelivery() {
    const d = this.deliveryDetails;
    if (!d.fullName || !d.address || !d.city || !d.state || !d.pincode || !d.phone || !d.email) {
      alert('Please fill in all delivery details.'); return;
    }
    if (!this.selectedAuction?._id) return;
    this.paymentProcessing = true;

    this.bidService.processPayment(this.selectedAuction._id, this.selectedPaymentMethod, this.deliveryDetails).subscribe({
      next: () => {
        const target = this.wonAuctions.find(a => a._id === this.selectedAuction!._id);
        if (target) { target.paymentStatus = 'completed'; target.status = 'accepted'; }
        this.paymentStep = 'confirmation';
        this.paymentProcessing = false;
        // Auto-close after 3 seconds
        setTimeout(() => this.closePaymentModal(), 3000);
      },
      error: (e) => {
        this.paymentProcessing = false;
        alert('Payment failed: ' + (e.error?.message || e.message || 'Unknown error'));
      }
    });
  }

  /* ── Input formatters ── */
  onCardNumberInput(val: string) {
    this.cardDetails.cardNumber = val.replace(/\D/g, '').slice(0, 19);
  }
  onCVVInput(val: string) {
    this.cardDetails.cvv = val.replace(/\D/g, '').slice(0, 4);
  }
  onPincodeInput(val: string) {
    this.deliveryDetails.pincode = val.replace(/\D/g, '').slice(0, 6);
  }
  onPhoneInput(val: string) {
    this.deliveryDetails.phone = val.replace(/\D/g, '').slice(0, 10);
  }

  printBill() {
    const receiptContent = document.getElementById('printReceipt')?.innerHTML;
    if (!receiptContent) return;
    const w = window.open('', '_blank', 'width=600,height=800');
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Elite Auction Bill</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #111; }
          .receipt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .receipt-logo { font-size: 1.4rem; font-weight: 800; }
          .receipt-meta { font-size: 0.82rem; color: #555; text-align: right; }
          .receipt-divider { border: none; border-top: 1px dashed #ccc; margin: 16px 0; }
          .receipt-section { margin-bottom: 16px; }
          .receipt-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.9rem; border-bottom: 1px solid #f0f0f0; }
          .total-row { font-size: 1.05rem; font-weight: 700; border-top: 2px solid #111; margin-top: 8px; }
          .total-row strong { color: #2563eb; }
          .receipt-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #888; letter-spacing: .06em; margin-bottom: 8px; }
          .receipt-address { font-size: 0.88rem; line-height: 1.7; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
          .receipt-footer { text-align: center; margin-top: 24px; font-size: 0.82rem; color: #888; }
          @media print { @page { margin: 20mm; } }
        </style>
      </head>
      <body>${receiptContent}</body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  }

  /* ── Fee / Price Helpers ── */
  readonly BUYERS_PREMIUM_RATE = 0.03; // 3%

  getBuyersPremium(auction: WinningBid): number {
    // Use stored value if already paid, else estimate
    if (auction.buyersPremium != null) return auction.buyersPremium;
    return Math.round(auction.winningAmount * this.BUYERS_PREMIUM_RATE * 100) / 100;
  }

  getBuyerTotal(auction: WinningBid): number {
    if (auction.customerTotalAmount != null) return auction.customerTotalAmount;
    return Math.round((auction.winningAmount + this.getBuyersPremium(auction)) * 100) / 100;
  }

  get totalSpent(): number {
    return this.wonAuctions
      .filter(a => a.status === 'accepted')
      .reduce((sum, a) => sum + a.winningAmount, 0);
  }

  get totalSpentWithPremium(): number {
    return this.wonAuctions
      .filter(a => a.paymentStatus === 'completed')
      .reduce((sum, a) => sum + this.getBuyerTotal(a), 0);
  }

  getStatusClass(status: string): string {
    const map: any = { accepted: 'badge-success', pending: 'badge-warning', rejected: 'badge-danger' };
    return map[status] || 'badge-info';
  }

  getPaymentClass(status: string): string {
    const map: any = { completed: 'badge-success', pending: 'badge-warning', failed: 'badge-danger' };
    return map[status] || 'badge-info';
  }

  getProductId(auction: any): string {
    const pid = auction.productId;
    if (!pid) return '';
    if (typeof pid === 'string') return pid;
    return pid._id || pid.id || String(pid);
  }

  openRatingModal(auction: WinningBid) {
    const productId = typeof auction.productId === 'string' ? auction.productId : auction.productId?._id;
    const supplierId = typeof auction.supplierId === 'string' ? auction.supplierId : auction.supplierId?._id;

    this.dialog.open(RatingSubmissionComponent, {
      width: '600px',
      disableClose: false,
      data: {
        productId,
        supplierId,
        productName: auction.productName,
        supplierName: auction.supplierName
      }
    }).afterClosed().subscribe((result: any) => {
      if (result) {
        // Rating was submitted successfully
        // You could update the UI to show the rating button is disabled now
      }
    });
  }
}
