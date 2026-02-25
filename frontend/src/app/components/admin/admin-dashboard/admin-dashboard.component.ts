import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ProductService } from '../../../services/product.service';
import { BidService } from '../../../services/bid.service';
import { User } from '../../../models/user.model';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalUsers: 0,
    totalSuppliers: 0,
    totalCustomers: 0,
    totalProducts: 0,
    activeAuctions: 0,
    completedAuctions: 0,
    totalBids: 0
  };

  earnings = {
    totalRevenue: 0,          // GMV – total winning amounts paid
    platformCommission: 0,    // 5% from suppliers
    buyersPremiums: 0,        // 3% from customers
    totalPlatformRevenue: 0,  // Admin's actual earnings
    completedPayments: 0,
    pendingPayments: 0
  };

  recentWins: any[] = [];
  loading = true;

  constructor(
    private userService: UserService,
    private productService: ProductService,
    private bidService: BidService
  ) { }

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.loading = true;

    Promise.all([
      this.userService.getAllUsers(1, 1000).toPromise(),
      this.productService.getAllProducts().toPromise(),
      this.bidService.getAllBids(1, 1000).toPromise(),
      this.bidService.getAdminStats().toPromise()          // earnings data
    ]).then(([usersRes, products, bidsRes, adminStats]: [any, any, any, any]) => {
      // User/product/bid counts
      const users: User[] = usersRes?.users ?? usersRes ?? [];
      const productList: Product[] = products ?? [];
      const bidList: any[] = bidsRes?.bids ?? bidsRes ?? [];

      this.stats.totalUsers = users.length;
      this.stats.totalSuppliers = users.filter((u: User) => u.role === 'supplier').length;
      this.stats.totalCustomers = users.filter((u: User) => u.role === 'customer').length;
      this.stats.totalProducts = productList.length;
      this.stats.activeAuctions = productList.filter((p: Product) => p.status === 'active').length;
      this.stats.completedAuctions = productList.filter((p: Product) => p.status === 'completed').length;
      this.stats.totalBids = bidList.length;

      // Earnings from getAdminStats()
      if (adminStats?.success && adminStats.stats) {
        const s = adminStats.stats;
        this.earnings.totalRevenue = s.totalRevenue || 0;
        this.earnings.platformCommission = s.totalPlatformFees || 0;
        this.earnings.buyersPremiums = s.totalBuyersPremiums || 0;
        this.earnings.totalPlatformRevenue = s.totalPlatformRevenue || 0;
        this.earnings.completedPayments = s.completedPayments || 0;
        this.earnings.pendingPayments = s.pendingPayments || 0;
      }

      this.recentWins = adminStats?.recentWins ?? [];
      this.loading = false;
    }).catch(error => {
      console.error('Error loading statistics:', error);
      this.loading = false;
    });
  }
}
