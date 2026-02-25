# Ratings & Reviews Feature Documentation

## Overview
The Ratings & Reviews feature enables customers to rate and review products they've won, while suppliers can respond to reviews. This builds a reputation and trust system for the auction platform.

## Features

### Customer Side
- ⭐ Submit 1-5 star overall ratings
- 📝 Write detailed reviews (10-500 characters)
- 🏷️ Category ratings: Quality, Communication, Shipping (1-5 each)
- ✓ Verified purchase indicator (only auction winners can rate)
- 👍 Mark reviews as helpful
- 👎 Mark reviews as not helpful

### Supplier Side
- 📊 View all ratings/reviews on their products and profile
- 💬 Respond to customer reviews
- 📈 See rating statistics and distribution
- 👤 Seller profile shows average rating badge

### Admin Side
- ✔️ Approve/reject pending reviews
- 🚩 Flag inappropriate content
- 📋 Moderation dashboard

## Backend Implementation

### Database Model: Rating.js
Located at: `backend/src/models/Rating.js`

```javascript
{
  productId: ObjectId (ref: Product),
  suppliererId: ObjectId (ref: User),
  customerId: ObjectId (ref: User),
  rating: Number (1-5, required),
  review: String (10-500 chars min/max),
  
  // Category ratings (optional)
  qualityRating: Number (1-5),
  communicationRating: Number (1-5),
  shippingRating: Number (1-5),
  
  // Verification
  isVerifiedPurchase: Boolean,
  winningBidId: ObjectId (ref: WinningBid),
  
  // Moderation
  isApproved: Boolean (default: true),
  isHidden: Boolean (default: false),
  flaggedAsInappropriate: Boolean,
  
  // Seller response
  sellerResponse: {
    text: String,
    respondedAt: Date
  },
  
  // Community feedback
  helpfulCount: Number (default: 0),
  notHelpfulCount: Number (default: 0),
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ supplierId: 1, isApproved: 1 }` - For supplier ratings
- `{ productId: 1 }` - For product ratings
- `{ customerId: 1 }` - For customer's own ratings
- `{ createdAt: -1 }` - For recent ratings

**Virtual Field:**
- `averageCategoryRating` - Average of quality, communication, and shipping ratings

### API Endpoints

#### Public Endpoints

**GET `/api/ratings/product/:productId`**
- Get all approved ratings for a product
- Query params: `page` (default: 1), `limit` (default: 5)
- Returns: ratings list + statistics (avg rating, distribution, verified purchase count)

**GET `/api/ratings/supplier/:supplierId`**
- Get all approved ratings for a supplier
- Query params: `page` (default: 1), `limit` (default: 10)
- Returns: ratings list + statistics

**GET `/api/ratings/supplier/:supplierId/stats`**
- Get supplier rating statistics (for profile display)
- Returns: average ratings, distribution, positive rating percentage

**POST `/api/ratings/:ratingId/helpful`**
- Mark a rating as helpful
- Returns: updated helpful count

**POST `/api/ratings/:ratingId/not-helpful`**
- Mark a rating as not helpful
- Returns: updated not helpful count

#### Protected Endpoints (Authenticated Users)

**POST `/api/ratings`**
- Submit a new rating
- Body: `{ productId, supplierId, rating, review, qualityRating, communicationRating, shippingRating }`
- Validation: Verified purchase only, no duplicate ratings per product
- Returns: created rating object

**GET `/api/ratings/customer/my-ratings`**
- Get current user's submitted ratings
- Returns: array of user's ratings

**PUT `/api/ratings/:ratingId`**
- Update own rating
- Body: `{ ratingValue, review, qualityRating, communicationRating, shippingRating }`
- Returns: updated rating

**DELETE `/api/ratings/:ratingId`**
- Delete own rating
- Returns: success message

#### Supplier Only Endpoints

**POST `/api/ratings/:ratingId/respond`**
- Supplier responds to a review
- Body: `{ response }` (min 5 characters)
- Validation: Response text required, must be from product supplier
- Returns: updated rating with response

### Controller: ratingController.js

Located at: `backend/src/controllers/ratingController.js`

**Functions:**
- `submitRating()` - POST /api/ratings
- `getSupplierRatings()` - GET /api/ratings/supplier/:id
- `getProductRatings()` - GET /api/ratings/product/:id
- `getMyRatings()` - GET /api/ratings/customer/my-ratings
- `updateRating()` - PUT /api/ratings/:id
- `deleteRating()` - DELETE /api/ratings/:id
- `markHelpful()` - POST /api/ratings/:id/helpful
- `markNotHelpful()` - POST /api/ratings/:id/not-helpful
- `getSupplierStats()` - GET /api/ratings/supplier/:id/stats
- `respondToRating()` - POST /api/ratings/:id/respond (supplier only)

### Routes: ratingRoutes.js

Located at: `backend/src/routes/ratingRoutes.js`

All endpoints mounted at `/api/ratings`

## Frontend Implementation

### Service: rating.service.ts

Located at: `frontend/src/app/services/rating.service.ts`

**Methods:**
- `submitRating(rating: Rating)` - POST
- `getProductRatings(productId, page, limit)` - GET
- `getSupplierRatings(supplierId, page, limit)` - GET
- `getSupplierStats(supplierId)` - GET
- `getMyRatings()` - GET
- `updateRating(ratingId, updates)` - PUT
- `deleteRating(ratingId)` - DELETE
- `markHelpful(ratingId)` - POST
- `markNotHelpful(ratingId)` - POST
- `respondToRating(ratingId, response)` - POST (supplier)

**Models:**
```typescript
interface Rating {
  _id?: string;
  productId: string;
  supplierId: string;
  customerId: string;
  rating: number; // 1-5
  review?: string;
  qualityRating?: number;
  communicationRating?: number;
  shippingRating?: number;
  isVerifiedPurchase?: boolean;
  isApproved?: boolean;
  sellerResponse?: { text: string; respondedAt: Date };
  helpfulCount?: number;
  notHelpfulCount?: number;
  createdAt?: Date;
}

interface RatingStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
  verifiedPurchaseCount: number;
  positiveRatingsPercent?: number;
}
```

### Components

#### 1. RatingSubmissionComponent

Located at: `frontend/src/app/components/shared/rating-submission/`

**Purpose:** Modal dialog for submitting a new rating

**Features:**
- Star rating picker (1-5 stars with visual feedback)
- Optional category ratings (Quality, Communication, Shipping)
- Review text field (10-500 char limit)
- Form validation
- Loading state during submission
- Error handling with snackbar notifications

**Usage:**
```typescript
import { MatDialog } from '@angular/material/dialog';
import { RatingSubmissionComponent } from './components/shared/rating-submission/rating-submission.component';

// In component:
constructor(private dialog: MatDialog) {}

openRatingModal(productId: string, supplierId: string) {
  this.dialog.open(RatingSubmissionComponent, {
    width: '600px',
    data: { productId, supplierId }
  }).afterClosed().subscribe(result => {
    if (result) {
      // Rating was submitted
    }
  });
}
```

**Files:**
- `rating-submission.component.ts` - Component logic
- `rating-submission.component.html` - Template
- `rating-submission.component.css` - Styling

#### 2. RatingDisplayComponent

Located at: `frontend/src/app/components/shared/rating-display/`

**Purpose:** Display ratings and reviews for a product or supplier

**Features:**
- Rating statistics summary (avg rating, distribution graph)
- Filter by star rating
- Sort options: newest, most helpful, highest rating, lowest rating
- Individual review cards with:
  - Customer name and verified purchase badge
  - Star rating display
  - Review text
  - Seller response (if available)
  - Helpful/not helpful counts
- Pagination
- Responsive design

**Usage:**
```html
<app-rating-display 
  [productId]="productId" 
  [supplierId]="supplierId">
</app-rating-display>
```

**Files:**
- `rating-display.component.ts` - Component logic with filtering/sorting
- `rating-display.component.html` - Template with summary and review list
- `rating-display.component.css` - Comprehensive styling

## UI Integration

### Pages with Rating Features

#### 1. Won Auctions Page
**Location:** `frontend/src/app/components/customer/won-auctions/`

**Changes:**
- Added "⭐ Rate & Review" button for completed auctions (payment done)
- Button opens RatingSubmissionComponent modal
- Calls `openRatingModal(auction)` which extracts product and supplier IDs

#### 2. Product Detail Page (Customer)
**Location:** `frontend/src/app/components/customer/product-detail/`

**Changes:**
- Added RatingDisplayComponent at bottom of page
- Shows all ratings and reviews for the product
- Spans full width below the product details and bid history
- CSS updated to make ratings-card full-width in grid

## Module Integration

### app.module.ts Updates
```typescript
// Imports
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RatingSubmissionComponent } from './components/shared/rating-submission/rating-submission.component';
import { RatingDisplayComponent } from './components/shared/rating-display/rating-display.component';

// Declarations
declarations: [
  RatingSubmissionComponent,
  RatingDisplayComponent,
  // ... other components
]

// Imports array
imports: [
  MatDialogModule,
  MatSnackBarModule,
  // ... other imports
]
```

## Flow Diagrams

### Rating Submission Flow
```
Customer wins auction
    ↓
Completes payment
    ↓
Clicks "⭐ Rate & Review" button
    ↓
RatingSubmissionComponent modal opens
    ↓
Customer fills rating, review, category ratings
    ↓
Submits form → POST /api/ratings
    ↓
Backend verifies verified purchase (winning bid exists)
    ↓
Creates Rating document with approved: true
    ↓
Returns success → Modal closes, snackbar notification
```

### Rating Display Flow
```
Customer views product detail page
    ↓
RatingDisplayComponent loads on init
    ↓
Calls getProductRatings(productId, page=1, limit=5)
    ↓
Backend returns ratings + statistics
    ↓
Component displays summary card, distribution graph, and reviews list
    ↓
User can filter by star rating or sort by: newest/helpful/rating
    ↓
Click "Helpful" → POST /api/ratings/:id/helpful
    ↓
Increments helpfulCount and updates display
```

## Error Handling

### Common Validation Rules

1. **Duplicate Rating Prevention**
   - Only one rating per customer per product
   - Error: "You have already rated this product"

2. **Verified Purchase Only**
   - Only customers who won the auction can rate
   - Must have completed payment
   - If not verified: rating is created but may require approval

3. **Review Text Validation**
   - Minimum: 10 characters
   - Maximum: 500 characters
   - Optional field

4. **Rating Scale Validation**
   - Main rating: 1-5 (required)
   - Category ratings: 1-5 (optional)

5. **Seller Response Rules**
   - Only supplier of the product can respond
   - Response text minimum: 5 characters
   - One response per rating

## Styling Notes

### Color Scheme
- ⭐ Star color: #ffc107 (filled), #ddd (empty)
- Verified badge: #4caf50 (green)
- Rating cards: White background with subtle border/shadow
- Distribution bars: #ffc107 (yellow/amber)

### Components Use Material Design
- MatDialog for modals
- Reactive Forms for validation
- RxJS observables for data loading
- Angular Material components imported from app.module

## Testing Scenarios

### Manual Testing Checklist
- [ ] Customer can submit rating after payment completion
- [ ] Cannot submit duplicate rating
- [ ] Can leave review empty (rating only)
- [ ] Category ratings are optional
- [ ] Verified purchase badge shows for auction winners
- [ ] Can filter ratings by star count
- [ ] Can sort by newest/helpful
- [ ] Helpful count increments
- [ ] Supplier can respond to ratings
- [ ] Pagination works for large review count
- [ ] Responsive design on mobile
- [ ] Loading states display correctly
- [ ] Error messages appear for submission failures

## Future Enhancements

1. **Admin Moderation Dashboard**
   - Approve/reject pending reviews
   - Flag inappropriate content
   - Ban users from posting reviews

2. **Image Uploads**
   - Customers can upload product photos with reviews
   - Shows in review cards

3. **Review Analytics**
   - Supplier dashboard showing:
     - Total reviews trend
     - Average rating over time
     - Most helpful reviews
     - Common keywords from reviews

4. **Reputation Score**
   - Aggregate supplier rating into profile badge
   - Display trust score prominently

5. **Review Recommendations**
   - ML: detect helpful reviews
   - Highlight most relevant/helpful reviews first

6. **Email Notifications**
   - Notify supplier when rated
   - Notify customer when seller responds

7. **Review Badges**
   - Top reviewers badge
   - Helpful reviewer achievements

## API Response Examples

### Submit Rating (Success)
```json
{
  "success": true,
  "message": "Rating submitted successfully",
  "rating": {
    "_id": "507f1f77bcf86cd799439011",
    "productId": "507f1f77bcf86cd799439012",
    "supplierId": "507f1f77bcf86cd799439013",
    "customerId": "507f1f77bcf86cd799439014",
    "rating": 5,
    "review": "Great product! Arrived on time and exactly as described.",
    "qualityRating": 5,
    "communicationRating": 4,
    "shippingRating": 5,
    "isVerifiedPurchase": true,
    "isApproved": true,
    "helpfulCount": 0,
    "notHelpfulCount": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Product Ratings
```json
{
  "success": true,
  "total": 12,
  "page": 1,
  "pages": 3,
  "stats": {
    "totalReviews": 12,
    "averageRating": "4.67",
    "ratingDistribution": {
      "5": 8,
      "4": 3,
      "3": 1,
      "2": 0,
      "1": 0
    },
    "verifiedPurchaseCount": 12
  },
  "ratings": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "customerName": "John Doe",
      "rating": 5,
      "review": "Excellent quality!",
      "isVerifiedPurchase": true,
      "helpfulCount": 5,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Security Considerations

1. **JWT Authentication**
   - All POST/PUT/DELETE endpoints require valid JWT token
   - Extracted from Authorization header

2. **Ownership Verification**
   - Users can only update/delete their own ratings
   - Only supplier of product can respond

3. **MongoDB Sanitization**
   - Express-mongo-sanitize middleware prevents injection
   - Applied globally on all routes

4. **Rate Limiting**
   - General limiter: 200 requests per 15 minutes
   - Applied to all routes

5. **Input Validation**
   - Review text length: 10-500 characters
   - Rating: 1-5 scale validation
   - Response text: minimum 5 characters

## Performance Optimizations

1. **Indexes**
   - Optimized for common queries (supplier, product, customer lookups)
   - CreatedAt index for sorting

2. **Pagination**
   - Default limit: 5-10 items per page
   - Reduces payload size

3. **Aggregation Pipeline**
   - Statistics calculated server-side
   - Reduces data transfer

4. **MongoDB Lean Queries**
   - Returns plain objects, not Mongoose documents
   - Faster serialization

## Troubleshooting

### Issue: Cannot submit rating
**Solution:** Verify:
1. User is authenticated (JWT token valid)
2. User won the auction (check WinningBid record)
3. Payment is completed
4. No duplicate rating exists

### Issue: Ratings not showing
**Solution:** Check:
1. Ratings exist in database with `isApproved: true` and `isHidden: false`
2. Product ID is passed correctly to component
3. API endpoint is responding with data

### Issue: Seller response not appearing
**Solution:** Verify:
1. Supplier ID matches product supplier
2. Response is at least 5 characters
3. Rating exists and is approved

## Support & Maintenance

For issues or feature requests related to the Ratings & Reviews system, check:
- Backend logs: `logs/error.log`
- MongoDB for rating documents
- Browser console for frontend errors
- Network tab for API response debugging
