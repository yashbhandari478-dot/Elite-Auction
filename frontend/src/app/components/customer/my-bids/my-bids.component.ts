import { Component, OnInit } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { Bid } from '../../../models/bid.model';

@Component({
  selector: 'app-my-bids',
  templateUrl: './my-bids.component.html',
  styleUrls: ['./my-bids.component.css']
})
export class MyBidsComponent implements OnInit {
  bids: Bid[] = [];
  filteredBids: Bid[] = [];
  filterStatus = 'all';
  loading = true;
  error = '';

  constructor(private bidService: BidService) {}

  ngOnInit() {
    this.loadBids();
  }

  loadBids() {
    this.loading = true;
    this.bidService.getMyBids().subscribe({
      next: (bids) => {
        this.bids = bids;
        this.applyFilter();
        this.loading = false;
      },
      error: (e) => { this.error = e; this.loading = false; }
    });
  }

  applyFilter() {
    if (this.filterStatus === 'winning') {
      this.filteredBids = this.bids.filter(b => b.isWinning);
    } else if (this.filterStatus === 'outbid') {
      this.filteredBids = this.bids.filter(b => !b.isWinning);
    } else {
      this.filteredBids = this.bids;
    }
  }

  get winningCount(): number { return this.bids.filter(b => b.isWinning).length; }
  get outbidCount(): number { return this.bids.filter(b => !b.isWinning).length; }
}
