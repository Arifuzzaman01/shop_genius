# Test Order Data for Backend Testing

## 🧪 Sample Test Orders

Use these exact structures to test your backend API endpoint.

---

### **Test Order 1: Single Item**

```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "orderItems": [
    {
      "productId": "67e5c7a2d5b3e8f9a1234567",
      "productName": "Wireless Mouse",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States"
  }
}
```

**Expected Response:** 201 Created with order object

---

### **Test Order 2: Multiple Items**

```json
{
  "customerName": "Jane Smith",
  "customerEmail": "jane.smith@example.com",
  "orderItems": [
    {
      "productId": "67e5c7a2d5b3e8f9a1234567",
      "productName": "iPhone 13 Pro",
      "quantity": 1,
      "price": 1199.99
    },
    {
      "productId": "67e5c7a2d5b3e8f9a1234568",
      "productName": "AirPods Pro",
      "quantity": 2,
      "price": 249.99
    },
    {
      "productId": "67e5c7a2d5b3e8f9a1234569",
      "productName": "USB-C Cable",
      "quantity": 3,
      "price": 19.99
    }
  ],
  "shippingAddress": {
    "street": "456 Oak Avenue",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "country": "United States"
  }
}
```

**Expected Response:** 201 Created with order object including all 3 items

---

### **Test Order 3: Minimum Required Fields**

```json
{
  "customerName": "Test User",
  "customerEmail": "test@example.com",
  "orderItems": [
    {
      "productId": "67e5c7a2d5b3e8f9a1234567",
      "productName": "Test Product",
      "quantity": 1,
      "price": 9.99
    }
  ],
  "shippingAddress": {
    "street": "789 Test St",
    "city": "Chicago",
    "state": "IL",
    "zipCode": "60601",
    "country": "USA"
  }
}
```

---

## 🔍 cURL Commands for Testing

### **Test 1: Create Single Item Order**

```bash
curl -X POST https://shop-genius-server.vercel.app/api/orders \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "orderItems": [
      {
        "productId": "67e5c7a2d5b3e8f9a1234567",
        "productName": "Wireless Mouse",
        "quantity": 2,
        "price": 29.99
      }
    ],
    "shippingAddress": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "United States"
    }
  }'
```

---

### **Test 2: Check Products Endpoint**

```bash
curl https://shop-genius-server.vercel.app/api/products | jq '.'
```

This will show you what products are available in the database.

---

### **Test 3: Get All Orders**

```bash
curl https://shop-genius-server.vercel.app/api/orders | jq '.'
```

---

## 🐛 Debugging Steps

### **Step 1: Check Available Products**

Run this to see what product IDs exist:

```bash
curl https://shop-genius-server.vercel.app/api/products
```

Look for valid `_id` values to use in `productId` field.

---

### **Step 2: Test with Real Product ID**

Replace `PRODUCT_ID_HERE` with an actual ID from Step 1:

```bash
curl -X POST https://shop-genius-server.vercel.app/api/orders \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"customerName\": \"Test Customer\",
    \"customerEmail\": \"test@example.com\",
    \"orderItems\": [
      {
        \"productId\": \"PRODUCT_ID_HERE\",
        \"productName\": \"Test Product\",
        \"quantity\": 1,
        \"price\": 29.99
      }
    ],
    \"shippingAddress\": {
      \"street\": \"123 Test St\",
      \"city\": \"Test City\",
      \"state\": \"TS\",
      \"zipCode\": \"12345\",
      \"country\": \"Test Country\"
    }
  }"
```

---

## ⚠️ Common Issues & Solutions

### **Issue 1: 500 Internal Server Error**

**Possible Causes:**
1. Invalid product ID (doesn't exist in database)
2. Product has no stock
3. Missing required fields
4. Backend validation error

**Solution:**
- Check browser console for detailed error message
- Verify product IDs exist by calling `/api/products`
- Ensure all required fields are present
- Check backend logs on Vercel

---

### **Issue 2: 400 Bad Request**

**Cause:** Missing or malformed data

**Solution:**
- Verify JSON structure matches examples above
- Ensure all required fields are present
- Check email format is valid
- Verify quantities are > 0

---

### **Issue 3: 404 Not Found**

**Cause:** Wrong endpoint URL

**Solution:**
- Use exactly: `https://shop-genius-server.vercel.app/api/orders`
- Not: `/api/order` or `/orders` or `/api/create-order`

---

## 📊 Expected Console Output

When you create an order successfully, you should see:

```javascript
// Frontend Console:

Creating order with data: {
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "orderItems": [
    {
      "productId": "67e5c7a2d5b3e8f9a1234567",
      "productName": "Wireless Mouse",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States"
  }
}

Request body being sent: { ... same as above ... }

Response status: 201

Order created successfully: {
  "_id": "order_abc123",
  "orderNumber": "ORD-XYZ789",
  "customerName": "John Doe",
  ...
}
```

---

## 🎯 Quick Frontend Test

In your browser console (F12), run this:

```javascript
// Test order creation directly
const testData = {
  customerName: "Test Customer",
  customerEmail: "test@example.com",
  orderItems: [{
    productId: "PASTE_REAL_PRODUCT_ID_HERE",
    productName: "Test Product",
    quantity: 1,
    price: 29.99
  }],
  shippingAddress: {
    street: "123 Test St",
    city: "Test City", 
    state: "TS",
    zipCode: "12345",
    country: "USA"
  }
};

fetch('https://shop-genius-server.vercel.app/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(testData)
})
.then(res => {
  console.log('Status:', res.status);
  return res.text();
})
.then(text => {
  console.log('Raw response:', text);
  try {
    const data = JSON.parse(text);
    console.log('Parsed response:', data);
  } catch(e) {
    console.error('Not JSON response');
  }
})
.catch(err => console.error('Error:', err));
```

---

## 📝 Checklist Before Testing

- [ ] Backend is deployed and running on Vercel
- [ ] Database has at least one product with stock > 0
- [ ] You have a valid product `_id` from the database
- [ ] Environment variable `NEXT_PUBLIC_API_URL` is set correctly
- [ ] Browser DevTools open to see console logs
- [ ] Network tab open to inspect requests

---

## 🚀 Production URL

Your backend is deployed at:
```
https://shop-genius-server.vercel.app
```

All API calls go to:
```
https://shop-genius-server.vercel.app/api/[endpoint]
```

For orders specifically:
```
POST https://shop-genius-server.vercel.app/api/orders
```

---

## ✨ Success Criteria

A successful order creation returns:

```json
{
  "_id": "generated_order_id",
  "orderNumber": "ORD-ABC123",
  "customerName": "Customer Name",
  "customerEmail": "email@example.com",
  "orderItems": [...],
  "total": 99.99,
  "status": "pending",
  "shippingAddress": {...},
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

And shows HTTP Status: **201 Created**

---

**Use these test cases to verify your backend is working correctly!** 🎉
