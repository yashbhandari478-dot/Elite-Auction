import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  categoryForm!: FormGroup;
  editMode = false;
  editingId: string | null = null;
  loading = true;
  submitting = false;
  error = '';
  success = '';
  showForm = false;

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.initForm();
  }

  initForm() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: ['']
    });
  }

  loadCategories() {
    this.loading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (cats) => { this.categories = cats; this.loading = false; },
      error: (e) => { this.error = e; this.loading = false; }
    });
  }

  get f() { return this.categoryForm.controls; }

  openAddForm() {
    this.editMode = false;
    this.editingId = null;
    this.categoryForm.reset();
    this.showForm = true;
    this.error = '';
    this.success = '';
  }

  openEditForm(category: Category) {
    this.editMode = true;
    this.editingId = category._id!;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl || ''
    });
    this.showForm = true;
    this.error = '';
    this.success = '';
  }

  cancelForm() {
    this.showForm = false;
    this.categoryForm.reset();
    this.editMode = false;
    this.editingId = null;
  }

  onSubmit() {
    if (this.categoryForm.invalid) return;
    this.submitting = true;
    this.error = '';

    if (this.editMode && this.editingId) {
      this.categoryService.updateCategory(this.editingId, this.categoryForm.value).subscribe({
        next: () => {
          this.success = 'Category updated successfully!';
          this.submitting = false;
          this.showForm = false;
          this.loadCategories();
        },
        error: (e) => { this.error = e; this.submitting = false; }
      });
    } else {
      this.categoryService.createCategory(this.categoryForm.value).subscribe({
        next: () => {
          this.success = 'Category created successfully!';
          this.submitting = false;
          this.showForm = false;
          this.loadCategories();
        },
        error: (e) => { this.error = e; this.submitting = false; }
      });
    }
  }

  toggleActive(category: Category) {
    this.categoryService.updateCategory(category._id!, { isActive: !category.isActive }).subscribe({
      next: () => this.loadCategories(),
      error: (e) => alert('Error: ' + e)
    });
  }

  deleteCategory(id: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => { this.success = 'Category deleted.'; this.loadCategories(); },
        error: (e) => alert('Error: ' + e)
      });
    }
  }
}
