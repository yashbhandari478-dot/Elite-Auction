import { Component, Input, OnInit } from '@angular/core';
import { RatingService, Rating, RatingStats } from '../../../services/rating.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-rating-display',
  templateUrl: './rating-display.component.html',
  styleUrls: ['./rating-display.component.css']
})
export class RatingDisplayComponent implements OnInit {
  @Input() productId!: string;
  @Input() supplierId!: string;

  ratings: Rating[] = [];
  stats!: RatingStats;
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  loading = false;
  filterRating = 0; // 0 = all ratings
  sortBy = 'newest'; // 'newest', 'helpful', 'rating-high', 'rating-low'

  constructor(
    private ratingService: RatingService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadRatings();
  }

  loadRatings(): void {
    this.loading = true;

    this.ratingService.getProductRatings(this.productId, this.currentPage, this.pageSize)
      .subscribe({
        next: (response: any) => {
          this.ratings = response.ratings || [];
          this.stats = response.stats!;
          this.totalPages = response.pages || 1;
          this.applyFiltersAndSort();
          this.loading = false;
        },
        error: (error: any) => {
          this.loading = false;
          this.snackBar.open('Failed to load ratings', 'Close', { duration: 3000 });
        }
      });
  }

  applyFiltersAndSort(): void {
    let filtered = [...this.ratings];

    // Apply filter
    if (this.filterRating > 0) {
      filtered = filtered.filter(r => r.rating === this.filterRating);
    }

    // Apply sort
    switch (this.sortBy) {
      case 'helpful':
        filtered.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        break;
      case 'rating-high':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-low':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'newest':
      default:
        filtered.reverse();
    }

    this.ratings = filtered;
  }

  getRatingStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  getRatingDistributionCount(stars: number): number {
    if (!this.stats || !this.stats.ratingDistribution) return 0;
    const key = stars as unknown as keyof typeof this.stats.ratingDistribution;
    const count = this.stats.ratingDistribution[key];
    if (this.stats.totalReviews === 0) return 0;
    return Math.round((count / this.stats.totalReviews) * 100);
  }

  getWidthPercent(count: number): number {
    if (!this.stats || this.stats.totalReviews === 0) return 0;
    return Math.round((count / this.stats.totalReviews) * 100);
  }

  markHelpful(ratingId: string): void {
    this.ratingService.markHelpful(ratingId).subscribe({
      next: () => {
        const rating = this.ratings.find(r => r._id === ratingId);
        if (rating) {
          rating.helpfulCount = (rating.helpfulCount || 0) + 1;
        }
        this.snackBar.open('Thank you for finding this helpful!', 'Close', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Failed to mark rating', 'Close', { duration: 3000 });
      }
    });
  }

  onPageChange(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRatings();
    }
  }

  onFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filterRating = parseInt(target.value, 10);
    this.applyFiltersAndSort();
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value;
    this.applyFiltersAndSort();
  }
}
