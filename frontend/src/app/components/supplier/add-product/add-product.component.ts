import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  productForm!: FormGroup;
  categories: Category[] = [];
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.initForm();
  }

  loadCategories() {
    this.categoryService.getActiveCategories().subscribe({
      next: (cats) => { this.categories = cats; },
      error: () => {}
    });
  }

  initForm() {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000);

    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]],
      category: ['', Validators.required],
      basePrice: ['', [Validators.required, Validators.min(1)]],
      images: [''],
      auctionStartTime: [this.toDatetimeLocal(now), Validators.required],
      auctionEndTime: [this.toDatetimeLocal(oneHourLater), Validators.required]
    });
  }

  toDatetimeLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  get f() { return this.productForm.controls; }

  onSubmit() {
    if (this.productForm.invalid) return;

    const startTime = new Date(this.f['auctionStartTime'].value);
    const endTime = new Date(this.f['auctionEndTime'].value);

    if (endTime <= startTime) {
      this.error = 'Auction end time must be after start time.';
      return;
    }

    this.loading = true;
    this.error = '';

    const imagesVal = this.f['images'].value;
    const imagesArr = imagesVal
      ? imagesVal.split(',').map((s: string) => s.trim()).filter((s: string) => s)
      : [];

    const productData = {
      name: this.f['name'].value,
      description: this.f['description'].value,
      category: this.f['category'].value,
      basePrice: Number(this.f['basePrice'].value),
      images: imagesArr,
      auctionStartTime: startTime,
      auctionEndTime: endTime
    };

    this.productService.createProduct(productData).subscribe({
      next: () => {
        this.success = 'Product created successfully!';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/supplier/products']), 1500);
      },
      error: (e) => { this.error = e; this.loading = false; }
    });
  }
}
