/**
 * API Utility Functions for Dashboard Integration
 * Connects frontend to all backend endpoints
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==================== CATEGORIES API ====================

export interface Category {
  _id: string;
  categoryName: string;
  slug: string;
  description?: string;
  categoryImage?: string[];
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  categoryName: string;
  description?: string;
  categoryImage?: string[];
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchCategoryById(id: string): Promise<Category> {
  const res = await fetch(`${API_URL}/categories/${id}`);
  if (!res.ok) throw new Error('Failed to fetch category');
  return res.json();
}

export async function createCategory(data: CreateCategoryInput): Promise<Category> {
  const res = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
}

export async function updateCategory(id: string, data: Partial<CreateCategoryInput>): Promise<Category> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update category');
  return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete category');
}

export async function fetchCategoryProducts(id: string): Promise<any[]> {
  const res = await fetch(`${API_URL}/categories/${id}/products`);
  if (!res.ok) throw new Error('Failed to fetch category products');
  return res.json();
}

// ==================== PRODUCTS API ====================

export interface Product {
  _id: string;
  productName: string;
  slug: string;
  productImage: string[];
  description: string;
  price: number;
  category: string[];
  stock: number;
  minStockThreshold: number;
  status: 'active' | 'out of stock' | 'low stock' | 'sales' | 'hot' | 'new';
  brand?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  productName: string;
  slug: string;
  productImage: string[];
  description: string;
  price: number;
  category: string[];
  stock?: number;
  minStockThreshold?: number;
  brand?: string;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`${API_URL}/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json();
}

export async function updateProduct(id: string, data: Partial<CreateProductInput>): Promise<Product> {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete product');
}

export async function updateProductStock(
  id: string, 
  stock: number, 
  minStockThreshold?: number
): Promise<Product> {
  const res = await fetch(`${API_URL}/products/${id}/stock`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock, minStockThreshold }),
  });
  if (!res.ok) throw new Error('Failed to update product stock');
  return res.json();
}

export async function fetchLowStockProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products/filters/low-stock`);
  if (!res.ok) throw new Error('Failed to fetch low stock products');
  return res.json();
}

// ==================== ORDERS API ====================

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderItems: OrderItem[];
  totalAmount: number;
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  isPaid: boolean;
  paidAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
}

export async function fetchOrders(params?: { status?: string; date?: "today" | "week" | "month" }): Promise<Order[]> {
  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }
  if (params?.date) {
    searchParams.set("date", params.date);
  }

  const url = searchParams.toString()
    ? `${API_URL}/orders?${searchParams.toString()}`
    : `${API_URL}/orders`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function fetchOrdersByFilter(params?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  email?: string;
}): Promise<Order[]> {
  const queryString = new URLSearchParams(params as any).toString();
  const url = queryString 
    ? `${API_URL}/orders?${queryString}`
    : `${API_URL}/orders`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function fetchOrderById(id: string): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}`);
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
}

export async function createOrder(data: CreateOrderInput): Promise<Order> {
  console.log('Creating order with data:', JSON.stringify(data, null, 2));
  
  const requestBody = {
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    orderItems: data.orderItems.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price
    })),
    shippingAddress: {
      street: data.shippingAddress.street,
      city: data.shippingAddress.city,
      state: data.shippingAddress.state,
      zipCode: data.shippingAddress.zipCode,
      country: data.shippingAddress.country
    }
  };
  
  console.log('Request body being sent:', JSON.stringify(requestBody, null, 2));
  
  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Raw error response:', errorText);
      let errorMessage = `Server error: ${res.status}`;
      try {
        const parsed = JSON.parse(errorText) as { message?: string };
        errorMessage = parsed.message || errorMessage;
      } catch {
        // Keep default message when response is not JSON.
      }
      throw new Error(errorMessage);
    }
    
    const result = await res.json();
    console.log('Order created successfully:', result);
    return result;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function updateOrderStatus(
  id: string, 
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderStatus: status }),
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
}

export async function cancelOrder(id: string): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}/cancel`, {
    method: 'PUT',
  });
  if (!res.ok) throw new Error('Failed to cancel order');
  return res.json();
}

export async function fetchOrderStats(): Promise<{
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
}> {
  const res = await fetch(`${API_URL}/orders/stats/summary`);
  if (!res.ok) throw new Error('Failed to fetch order statistics');
  return res.json();
}

// ==================== RESTOCK QUEUE API ====================

export type RestockPriority = 'high' | 'medium' | 'low';

export interface RestockQueueItem {
  _id: string;
  productId: string;
  productName: string;
  productImage?: string;
  currentStock: number;
  minStockThreshold: number;
  suggestedRestockQuantity: number;
  priority: RestockPriority;
  addedAt: Date;
  restockedAt?: Date;
  status: 'pending' | 'restocked' | 'removed';
  notes?: string;
}

export async function fetchRestockQueue(): Promise<RestockQueueItem[]> {
  const res = await fetch(`${API_URL}/restock-queue`);
  if (!res.ok) throw new Error('Failed to fetch restock queue');
  return res.json();
}

export async function addToRestockQueue(productId: string): Promise<RestockQueueItem> {
  const res = await fetch(`${API_URL}/restock-queue/${productId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to add to restock queue');
  return res.json();
}

export async function markAsRestocked(
  id: string, 
  newStockQuantity: number,
  notes?: string
): Promise<RestockQueueItem> {
  const res = await fetch(`${API_URL}/restock-queue/${id}/restock`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newStockQuantity, notes }),
  });
  if (!res.ok) throw new Error('Failed to mark as restocked');
  return res.json();
}

export async function removeFromRestockQueue(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/restock-queue/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove from queue');
}

export async function fetchRestockQueueByPriority(priority: RestockPriority): Promise<RestockQueueItem[]> {
  const res = await fetch(`${API_URL}/restock-queue/priority/${priority}`);
  if (!res.ok) throw new Error('Failed to fetch queue by priority');
  return res.json();
}

export async function fetchRestockQueueStats(): Promise<{
  totalItems: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  pendingItems: number;
  restockedItems: number;
}> {
  const res = await fetch(`${API_URL}/restock-queue/stats/summary`);
  if (!res.ok) throw new Error('Failed to fetch restock queue stats');
  return res.json();
}

// ==================== ANALYTICS API ====================

export interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  orders: {
    current: number;
    previous: number;
    growth: number;
  };
  customers: {
    current: number;
    previous: number;
    growth: number;
  };
  products: {
    current: number;
    previous: number;
    growth: number;
  };
  dailyOrders?: Array<{
    day: string;
    orders: number;
    revenue: number;
  }>;
  topProducts?: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export async function fetchAnalytics(timeRange?: string): Promise<AnalyticsData> {
  const url = timeRange 
    ? `${API_URL}/analytics?timeRange=${timeRange}`
    : `${API_URL}/analytics`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}
