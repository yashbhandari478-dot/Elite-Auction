import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RatingService } from '../../../services/rating.service';

@Component({
  selector: 'app-rating-submission',
  templateUrl: './rating-submission.component.html',
  styleUrls: ['./rating-submission.component.css']
})
export class RatingSubmissionComponent implements OnInit {
  ratingForm!: FormGroup;
  submitted = false;
  loading = false;
  ratingStars: number[] = [1, 2, 3, 4, 5];
  mainRating = 0;
  qualityRating = 0;
  communicationRating = 0;
  shippingRating = 0;

  constructor(
    private fb: FormBuilder,
    private ratingService: RatingService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<RatingSubmissionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.ratingForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      review: ['', [Validators.minLength(10), Validators.maxLength(500)]],
      qualityRating: [0],
      communicationRating: [0],
      shippingRating: [0]
    });
  }

  setMainRating(value: number): void {
    this.mainRating = value;
    this.ratingForm.patchValue({ rating: value });
  }

  setQualityRating(value: number): void {
    this.qualityRating = value;
    this.ratingForm.patchValue({ qualityRating: value });
  }

  setCommunicationRating(value: number): void {
    this.communicationRating = value;
    this.ratingForm.patchValue({ communicationRating: value });
  }

  setShippingRating(value: number): void {
    this.shippingRating = value;
    this.ratingForm.patchValue({ shippingRating: value });
  }

  getStarClass(star: number, currentRating: number): string {
    return star <= currentRating ? 'star-filled' : 'star-empty';
  }

  getRatingLabel(rating: number): string {
    const labels: { [key: number]: string } = {
      5: 'Excellent',
      4: 'Good',
      3: 'Average',
      2: 'Poor',
      1: 'Terrible'
    };
    return labels[rating] || '';
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.ratingForm.invalid || this.mainRating === 0) {
      this.snackBar.open('Please provide a rating and valid review', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    const ratingData: any = {
      productId: this.data.productId,
      supplierId: this.data.supplierId,
      customerId: this.data.customerId,
      rating: this.ratingForm.value.rating,
      review: this.ratingForm.value.review,
      qualityRating: this.qualityRating || null,
      communicationRating: this.communicationRating || null,
      shippingRating: this.shippingRating || null
    };

    this.ratingService.submitRating(ratingData).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.snackBar.open('Rating submitted successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close(response.rating);
      },
      error: (error: any) => {
        this.loading = false;
        const errorMsg = error.error?.message || 'Failed to submit rating';
        this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onStarHover(event: Event, action: string): void {
    const target = event.target as HTMLElement;
    if (target && target.classList) {
      if (action === 'add') {
        target.classList.add('star-hover');
      } else {
        target.classList.remove('star-hover');
      }
    }
  }
}
