# Advanced Stock Handling & Order Management Features

## 📋 Overview

This document describes the advanced stock handling, restock queue management, conflict detection, activity logging, and other enhanced features implemented in the ShopGenius Order Management System.

---

## ✅ Implemented Features

### 1. **Stock Deduction on Order Placement** ✓

#### **How It Works:**
When an order is created or updated, the system automatically deducts the ordered quantities from product stock levels.

#### **Implementation:**
- **Function:** `deductOrderStock()` in `lib/stock-management.ts`
- **Triggered:** After successful order creation
- **Process:** Iterates through order items and deducts each quantity from product stock
- **API Endpoint:** `PATCH /api/products/:id/stock`

#### **Code Example:**
```typescript
await deductOrderStock(formData.items);
// Deducts stock for each item in the order
```

#### **Benefits:**
- Real-time inventory tracking
- Prevents overselling
- Automatic stock synchronization

---

### 2. **Stock Validation & Warnings** ✓

#### **How It Works:**
Before confirming an order, the system validates that requested quantities don't exceed available stock.

#### **Validation Rules:**
1. **Check Stock Availability:**
   - Validates each item's requested quantity against current stock
   - Returns list of insufficient items

2. **Warning Messages:**
   ```
   "Only X items available in stock for 'Product Name'"
   ```

3. **Prevention:**
   - Order cannot be submitted if stock is insufficient
   - User must reduce quantity or remove item

#### **Implementation:**
- **Function:** `checkStockAvailability()` in `lib/stock-management.ts`
- **API Endpoint:** `POST /api/products/check-stock`

#### **Example Flow:**
```typescript
const stockCheck = await checkStockAvailability(formData.items);

if (!stockCheck.available) {
  const warnings = stockCheck.insufficientItems.map(item => 
    `Only ${item.available} items available for "${item.productName}"`
  );
  toast.error(warnings.join(". "));
  return; // Prevent order submission
}
```

---

### 3. **Automatic Out of Stock Status** ✓

#### **How It Works:**
When product stock reaches zero, the product status automatically changes to "Out of Stock".

#### **Implementation:**
- Checked during stock deduction
- Updates product status field
- Prevents further orders for that product

#### **Status Logic:**
```typescript
if (newStock === 0) {
  product.status = "out_of_stock";
  await updateProduct(productId, { status: "out_of_stock" });
}
```

---

### 4. **Restock Queue (Low Stock Management)** ✓

#### **Overview:**
Automated system for managing products that need restocking. Products are automatically added when stock falls below minimum threshold.

#### **Priority Levels:**

| Priority | Condition | Color | Icon |
|----------|-----------|-------|------|
| **High** | Stock = 0 or critically low | Red | TrendingDown |
| **Medium** | Stock < 50% of threshold | Yellow | AlertTriangle |
| **Low** | Stock 50-100% of threshold | Blue | Package |

#### **Queue Item Details:**
- Product ID & Name
- Current Stock Level
- Minimum Stock Threshold
- Suggested Restock Quantity
- Priority Level
- Date Added to Queue
- Status (Pending/Restocked/Removed)

#### **Features:**

**a) Automatic Addition:**
- Triggered when `product.stock < product.minStockThreshold`
- Calculates priority based on severity
- Suggests restock quantity (typically 2-3x threshold)

**b) Manual Actions:**
- ✅ **Restock:** Update stock with suggested quantity
- ✅ **Remove:** Remove from queue without restocking
- ✅ **View Details:** See complete product information

**c) Sorting:**
- Ordered by priority (High → Medium → Low)
- Within same priority: by lowest stock first

#### **UI Components:**
- **Page:** `app/(main)/manage/restock-queue/page.tsx`
- Statistics cards showing count by priority
- Color-coded queue items
- Progress bars showing stock levels
- Quick action buttons

#### **API Functions:**
```typescript
addToRestockQueue(productId, suggestedQuantity)
getRestockQueue(status)
updateRestockQueueItem(itemId, status)
removeFromRestockQueue(itemId)
```

---

### 5. **Conflict Detection** ✓

#### **Types of Conflicts Detected:**

**a) Duplicate Products in Same Order:**
- Checks if product is already added to the order
- Shows error message:
  ```
  "These products are already added to the order: Product1, Product2"
  ```
- Prevents duplicate line items

**b) Inactive/Unavailable Products:**
- Validates product status before adding to order
- Shows error:
  ```
  "This product is currently unavailable."
  ```
- Prevents ordering discontinued products

#### **Implementation:**
```typescript
// Check for duplicates
const productIds = formData.items.map(item => item.productId);
const duplicates = productIds.filter((id, index) => 
  productIds.indexOf(id) !== index
);

if (duplicates.length > 0) {
  toast.error("These products are already added to the order");
  return;
}
```

---

### 6. **Activity Log System** ✓

#### **Overview:**
Comprehensive logging of all system actions for audit trails and tracking.

#### **Activity Types:**
- `order_created` - New order placed
- `order_updated` - Order details modified
- `order_cancelled` - Order cancelled
- `stock_updated` - Product stock changed
- `product_added` - New product created
- `product_updated` - Product details modified
- `restock_queued` - Product added to restock queue
- `restock_completed` - Product restocked

#### **Log Entry Structure:**
```typescript
interface ActivityLog {
  _id: string;
  type: ActivityType;
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  relatedEntityId?: string;  // Order ID, Product ID, etc.
  relatedEntityType?: string; // "order", "product", etc.
  metadata?: Record<string, any>; // Additional data
  createdAt: Date;
}
```

#### **Examples:**

**Order Created:**
```
10:15 AM — Order #1023 created by John Doe
Total: $299.99 | Items: 3
```

**Stock Updated:**
```
10:20 AM — Stock updated for "iPhone 13"
Previous: 10 | New: 7 | Deducted: 3
```

**Restock Queued:**
```
10:30 AM — Product "Headphone" added to Restock Queue
Current Stock: 2 | Priority: High
```

**Order Shipped:**
```
11:00 AM — Order #1023 marked as Shipped
Status: Pending → Shipped
```

#### **Implementation:**
- **Function:** `createActivityLog()` in `lib/stock-management.ts`
- **API Endpoint:** `POST /api/activity-logs`
- **Fetch Recent:** `fetchActivityLogs(limit)`

---

### 7. **Enhanced Dashboard (Planned)** ⏳

#### **Key Metrics to Display:**

**Today's Statistics:**
- Total Orders Today
- Pending Orders Count
- Completed Orders Today
- Revenue Today
- Low Stock Items Count

**Product Summary Cards:**
```
iPhone 13 — 3 left (Low Stock) ⚠️
T-Shirt — 20 available (OK) ✅
Headphones — 0 left (Out of Stock) 🚫
```

**Recent Activity Feed:**
- Last 5-10 system actions
- Timestamp for each action
- Clickable to view details

**Analytics Chart:**
- Orders/Revenue over time (7/30 days)
- Line or bar chart visualization
- Filter by date range

---

### 8. **Search, Filter & Pagination** ⏳

#### **Product Search & Filter:**
- Search by product name
- Filter by category
- Filter by stock status (In Stock, Low Stock, Out of Stock)
- Sort by name, price, stock level

#### **Order Search & Filter:**
- Search by order number or customer name
- Filter by date range
- Filter by status
- Filter by total amount range

#### **Pagination:**
- Configurable page size (10, 25, 50, 100)
- Page navigation controls
- Total count display
- Jump to page functionality

---

### 9. **Analytics Chart (Optional)** ⏳

#### **Visualization Options:**

**Orders Over Time:**
- Line chart showing daily orders
- Toggle between 7/30/90 days
- Compare with previous period

**Revenue Analytics:**
- Bar chart of daily/weekly revenue
- Running totals
- Average order value trend

**Stock Levels:**
- Pie chart of stock distribution
- Categories with low stock alerts
- Top products by stock value

#### **Recommended Library:**
- **Recharts** - Lightweight, React-friendly
- **Chart.js** - Feature-rich, easy to use
- **Victory** - Highly customizable

---

## 🔧 Technical Implementation Details

### Stock Management API (`lib/stock-management.ts`)

#### **Functions:**

1. **`updateProductStock(productId, quantity, operation)`**
   - Updates product stock level
   - Operation: "add" or "deduct"
   - Returns updated product

2. **`deductOrderStock(items)`**
   - Deducts stock for multiple items
   - Processes sequentially
   - Rolls back on error

3. **`checkStockAvailability(items)`**
   - Validates stock levels
   - Returns availability status
   - Lists insufficient items

4. **`getLowStockProducts()`**
   - Fetches products below threshold
   - Returns array of products
   - Used for restock queue

5. **`createActivityLog(logData)`**
   - Creates activity log entry
   - Stores metadata
   - Returns created log

6. **`addToRestockQueue(productId, suggestedQty)`**
   - Adds product to queue
   - Calculates priority
   - Returns queue item

7. **`getRestockQueue(status)`**
   - Fetches queue items
   - Filter by status
   - Returns sorted list

8. **`updateRestockQueueItem(itemId, status)`**
   - Updates item status
   - Marks as restocked/removed
   - Returns updated item

---

## 📊 Database Schema Extensions

### Activity Log Collection/Table
```javascript
{
  _id: ObjectId,
  type: String, // enum: activity types
  title: String,
  description: String,
  userId: ObjectId,
  userName: String,
  relatedEntityId: ObjectId,
  relatedEntityType: String,
  metadata: Object,
  createdAt: Date
}
```

### Restock Queue Collection/Table
```javascript
{
  _id: ObjectId,
  productId: ObjectId,
  productName: String,
  productImage: String,
  currentStock: Number,
  minStockThreshold: Number,
  suggestedRestockQuantity: Number,
  priority: String, // enum: high, medium, low
  addedAt: Date,
  restockedAt: Date,
  status: String // pending, restocked, removed
}
```

---

## 🎯 Business Logic Rules

### Priority Calculation
```typescript
function calculatePriority(current: number, threshold: number): RestockPriority {
  if (current === 0 || current < threshold * 0.25) return "high";
  if (current < threshold * 0.5) return "medium";
  return "low";
}
```

### Suggested Restock Quantity
```typescript
function calculateSuggestedQuantity(current: number, threshold: number): number {
  // Suggest 2-3x the threshold minus current stock
  const base = threshold * 2.5;
  return Math.max(0, Math.round(base - current));
}
```

---

## 🚀 Usage Examples

### Creating an Order with Stock Handling

```typescript
const handleSubmit = async (formData) => {
  // 1. Check for duplicates
  const duplicates = checkDuplicates(formData.items);
  if (duplicates.length > 0) {
    toast.error("Duplicate products in order");
    return;
  }

  // 2. Validate stock
  const stockCheck = await checkStockAvailability(formData.items);
  if (!stockCheck.available) {
    toast.error("Insufficient stock");
    return;
  }

  // 3. Create order
  const order = await createOrder(formData);

  // 4. Deduct stock
  await deductOrderStock(formData.items);

  // 5. Check for low stock
  const lowStock = await getLowStockProducts();
  for (const product of lowStock) {
    await addToRestockQueue(product._id);
  }

  // 6. Log activity
  await createActivityLog({
    type: "order_created",
    title: "Order Created",
    description: `Order #${order.orderNumber} created`,
    relatedEntityId: order._id
  });

  toast.success("Order created successfully!");
};
```

---

## ⚠️ Important Notes

### Backend Integration Required
All frontend code is complete, but backend endpoints need implementation:
- `/api/products/:id/stock` - Stock updates
- `/api/products/check-stock` - Stock validation
- `/api/products/low-stock` - Low stock products
- `/api/activity-logs` - Activity logging
- `/api/restock-queue` - Restock queue management

### Error Handling
- Graceful fallbacks if API calls fail
- Mock data returned for development
- Console warnings for failed operations

### Performance Considerations
- Batch stock updates where possible
- Use transactions for critical operations
- Implement caching for frequently accessed data
- Paginate large datasets

---

## 📝 Future Enhancements

1. **Email Notifications:**
   - Low stock alerts
   - Restock reminders
   - Order status updates

2. **Advanced Analytics:**
   - Sales forecasting
   - Seasonal trends
   - Inventory turnover rates

3. **Automation:**
   - Auto-generate purchase orders
   - Scheduled restock checks
   - Smart reorder points

4. **Multi-Warehouse:**
   - Track stock across locations
   - Transfer between warehouses
   - Location-based fulfillment

5. **Barcode Scanning:**
   - Quick product identification
   - Streamlined restocking
   - Inventory counting

---

## 🎉 Summary

The ShopGenius Order Management System now includes:

✅ **Stock Deduction** - Automatic on order placement  
✅ **Stock Validation** - Prevent overselling  
✅ **Out of Stock Handling** - Automatic status updates  
✅ **Restock Queue** - Automated low stock management  
✅ **Conflict Detection** - Duplicates & inactive products  
✅ **Activity Logging** - Complete audit trail  
⏳ **Enhanced Dashboard** - Ready to implement  
⏳ **Search & Filter** - Ready to implement  
⏳ **Analytics Charts** - Ready to implement  

**All core features are implemented and ready for backend integration!** 🚀
