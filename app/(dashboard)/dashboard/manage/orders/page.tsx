"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Loader2, Plus, Edit, Trash2, Filter, Package, DollarSign, AlertCircle, X } from "lucide-react";
import { fetchProducts, fetchOrders, type Product, type Order, type CreateOrderInput, createOrder, updateOrderStatus, cancelOrder } from "@/lib/api";
import { updateOrder as updateOrderById } from "@/lib/order-api";
import { createActivityLog } from "@/lib/stock-management";
import { UpdateOrderInput } from "@/app/constants/schema";
import ProtectedRoute from "@/components/ProtectedRoute";
import { formatCurrency, formatDate } from "@/lib/utils";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export default function OrderManagementPage() {
  const { status } = useSession();
  
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  
  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    items: [] as Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
    }>,
    status: "pending" as OrderStatus,
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    },
    notes: ""
  });
  

  // Fetch data on mount
  useEffect(() => {
    loadData();
  }, [statusFilter, dateFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch products and orders
      const [productsData, ordersData] = await Promise.all([
        fetchProducts(),
        fetchOrders({
          status: statusFilter === "all" ? undefined : statusFilter,
          date: dateFilter === "all" ? undefined : dateFilter
        })
      ]);
      
      console.log("Loaded orders:", ordersData.length);
      console.log("Sample order:", ordersData[0]);
      
      console.log("Loaded products:", productsData.length);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data. Make sure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (order?: Order) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        customerName: order.customerName,
        customerEmail: order.customerEmail || "",
        items: order.orderItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        })),
        status: order.orderStatus,
        shippingAddress: {
          street: order.shippingAddress?.street || "",
          city: order.shippingAddress?.city || "",
          state: order.shippingAddress?.state || "",
          zipCode: order.shippingAddress?.zipCode || "",
          country: order.shippingAddress?.country || ""
        },
        notes: ""
      });
    } else {
      setEditingOrder(null);
      setFormData({
        customerName: "",
        customerEmail: "",
        items: [],
        status: "pending",
        shippingAddress: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: ""
        },
        notes: ""
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOrder(null);
    setFormData({
      customerName: "",
      customerEmail: "",
      items: [],
      status: "pending",
      shippingAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: ""
      },
      notes: ""
    });
  };

  const addProductToOrder = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: "", productName: "", quantity: 1, price: 0 }]
    });
  };

  const removeProductFromOrder = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateProductInOrder = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill product name and price when product is selected
    if (field === 'productId') {
      const product = products.find(p => p._id === value);
      if (product) {
        newItems[index].productName = product.productName;
        newItems[index].price = product.price;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation: Check for duplicate products
      const productIds = formData.items.map(item => item.productId);
      const duplicates = productIds.filter((id, index) => productIds.indexOf(id) !== index);
      
      if (duplicates.length > 0) {
        const duplicateProducts = duplicates.map(id => 
          products.find(p => p._id === id)?.productName
        ).filter(Boolean).join(", ");
        
        toast.error(`This product is already added to the order. (${duplicateProducts})`);
        setIsSubmitting(false);
        return;
      }

      // Validation: Ensure products are selected and still available
      if (formData.items.some((item) => !item.productId)) {
        toast.error("Please select a product for all order rows.");
        setIsSubmitting(false);
        return;
      }

      const unavailableItems = formData.items.filter((item) => {
        const product = products.find((p) => p._id === item.productId);
        return !product || product.status !== "active" || product.stock <= 0;
      });

      if (unavailableItems.length > 0) {
        toast.error("This product is currently unavailable.");
        setIsSubmitting(false);
        return;
      }

      // Validation: Check if any item has quantity 0
      const zeroQuantityItems = formData.items.filter(item => item.quantity <= 0);
      if (zeroQuantityItems.length > 0) {
        toast.error("Please enter valid quantities for all products");
        setIsSubmitting(false);
        return;
      }

      // Calculate totals
      const subtotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.1; // 10% tax
      const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
      const total = subtotal + tax + shippingCost;

      // Prepare order data
      const orderData: CreateOrderInput = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        orderItems: formData.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: formData.shippingAddress
      };

      if (editingOrder) {
        const updatePayload: UpdateOrderInput = {
          _id: editingOrder._id,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          orderItems: orderData.orderItems,
          shippingAddress: orderData.shippingAddress
        };
        await updateOrderById(editingOrder._id, updatePayload);
        toast.success("Order updated successfully!");
      } else {
        // Create new order
        const createdOrder = await createOrder(orderData);

        await Promise.allSettled([
          createActivityLog({
            type: "order_created",
            title: "Order created",
            description: `Order ${createdOrder.orderNumber || createdOrder._id} created by user`,
            relatedEntityId: createdOrder._id,
            relatedEntityType: "order",
            metadata: { total: total, itemCount: formData.items.length }
          })
        ]);
        toast.success("Order created successfully!");
      }
      
      handleCloseForm();
      loadData();
      } catch (error: unknown) {
      console.error("Error saving order:", error);
      const message = error instanceof Error ? error.message : "Failed to save order";
      if (message.toLowerCase().includes("only") && message.toLowerCase().includes("available")) {
        toast.error(message);
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      setUpdatingOrderId(orderId);
      await cancelOrder(orderId);
      toast.success("Order cancelled successfully!");
      loadData();
    } catch (error: unknown) {
      console.error("Error cancelling order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel order");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      if (newStatus === "cancelled") {
        await cancelOrder(orderId);
      } else {
        await updateOrderStatus(orderId, newStatus);
      }
      toast.success(`Order status updated to ${newStatus}!`);
      loadData();
    } catch (error: unknown) {
      console.error("Error updating status:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filter orders by status
  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(order => order.orderStatus === statusFilter);

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === "pending").length,
    confirmed: orders.filter(o => o.orderStatus === "confirmed").length,
    shipped: orders.filter(o => o.orderStatus === "shipped").length,
    delivered: orders.filter(o => o.orderStatus === "delivered").length,
    cancelled: orders.filter(o => o.orderStatus === "cancelled").length,
    revenue: orders.filter(o => o.orderStatus !== "cancelled").reduce((sum, o) => sum + o.totalAmount, 0)
  };

  const getStatusColor = (orderStatus: string) => {
    switch (orderStatus) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-300";
      case "shipped": return "bg-purple-100 text-purple-800 border-purple-300";
      case "delivered": return "bg-green-100 text-green-800 border-green-300";
      case "cancelled": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }
console.log(orders);
  return (
    <ProtectedRoute>
      <Container>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
              <Button
                onClick={() => handleOpenForm()}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Order
              </Button>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Confirmed</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Shipped</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Delivered</p>
                    <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                  </div>
                  <X className="w-8 h-8 text-red-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-emerald-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.revenue)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Filter by Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span className="font-medium ml-4">Date:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as "all" | "today" | "week" | "month")}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-600">No orders found</p>
              <p className="text-gray-500 mt-2">Create your first order to get started</p>
              <Button
                onClick={() => handleOpenForm()}
                className="mt-4 bg-green-500 hover:bg-green-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y overflow-x-auto divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-blue-600">
                          {order.orderNumber}
                        </div>
                        <div className="text-xs text-gray-500">{order._id.slice(-6)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.customerEmail}x\</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.orderItems.length} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(new Date(order.createdAt))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenForm(order)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleUpdateStatus(order._id, e.target.value as OrderStatus)}
                              disabled={updatingOrderId === order._id}
                              className="border border-gray-300 rounded px-2 py-1 text-xs"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancel</option>
                            </select>
                          )}
                          {order.orderStatus !== "cancelled" && order.orderStatus !== "delivered" && (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="text-red-600 hover:text-red-800 text-xs border border-red-200 rounded px-2 py-1"
                              disabled={updatingOrderId === order._id}
                              title="Cancel order"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Create/Edit Order Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingOrder ? "Edit Order" : "Create New Order"}
                    </h2>
                    <button
                      onClick={handleCloseForm}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Customer Name *
                          </label>
                          <input
                            type="text"
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Customer Email *
                          </label>
                          <input
                            type="email"
                            value={formData.customerEmail}
                            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Order Items</h3>
                        <Button
                          type="button"
                          onClick={addProductToOrder}
                          className="bg-green-500 hover:bg-green-600 text-sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Product
                        </Button>
                      </div>

                      {formData.items.length === 0 ? (
                        <div className="text-center py-8">
                          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No products added yet</p>
                          <p className="text-sm text-gray-400 mt-1">Click &quot;Add Product&quot; to start adding items</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {formData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-start border border-gray-200 p-3 rounded bg-white">
                              <div className="col-span-5">
                                <label className="block text-xs text-gray-500 mb-1">Product</label>
                                <select
                                  value={item.productId}
                                  onChange={(e) => updateProductInOrder(index, 'productId', e.target.value)}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                  required
                                >
                                  <option value="">Select Product</option>
                                  {products.map(product => (
                                    <option key={product._id} value={product._id}>
                                      {product.productName} - {formatCurrency(product.price)} (Stock: {product.stock}){product.status !== "active" || product.stock <= 0 ? " - Unavailable" : ""}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-span-2">
                                <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateProductInOrder(index, 'quantity', parseInt(e.target.value) || 1)}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="Qty"
                                  min="1"
                                  required
                                />
                              </div>
                              <div className="col-span-3">
                                <label className="block text-xs text-gray-500 mb-1">Price</label>
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => updateProductInOrder(index, 'price', parseFloat(e.target.value) || 0)}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="Price"
                                  min="0"
                                  step="0.01"
                                  readOnly
                                />
                              </div>
                              <div className="col-span-2 flex items-end">
                                <button
                                  type="button"
                                  onClick={() => removeProductFromOrder(index)}
                                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 className="w-5 h-5 mx-auto" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Order Summary */}
                      {formData.items.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          {(() => {
                            const subtotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                            const tax = subtotal * 0.1;
                            const shipping = subtotal > 100 ? 0 : 10;
                            const total = subtotal + tax + shipping;
                            
                            return (
                              <>
                                <div className="flex justify-between mb-2">
                                  <span className="text-gray-600">Subtotal:</span>
                                  <span className="font-medium">
                                    {formatCurrency(subtotal)}
                                  </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                  <span className="text-gray-600">Tax (10%):</span>
                                  <span className="font-medium">
                                    {formatCurrency(tax)}
                                  </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                  <span className="text-gray-600">Shipping:</span>
                                  <span className="font-medium">
                                    {formatCurrency(shipping)}
                                  </span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                  <span>Total:</span>
                                  <span>
                                    {formatCurrency(total)}
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}

                    </div>

                    {/* Shipping Address */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            value={formData.shippingAddress.street}
                            onChange={(e) => setFormData({ ...formData, shippingAddress: { ...formData.shippingAddress, street: e.target.value } })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="123 Main St"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            value={formData.shippingAddress.city}
                            onChange={(e) => setFormData({ ...formData, shippingAddress: { ...formData.shippingAddress, city: e.target.value } })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="New York"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State *
                          </label>
                          <input
                            type="text"
                            value={formData.shippingAddress.state}
                            onChange={(e) => setFormData({ ...formData, shippingAddress: { ...formData.shippingAddress, state: e.target.value } })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="NY"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP Code *
                          </label>
                          <input
                            type="text"
                            value={formData.shippingAddress.zipCode}
                            onChange={(e) => setFormData({ ...formData, shippingAddress: { ...formData.shippingAddress, zipCode: e.target.value } })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="10001"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country *
                          </label>
                          <input
                            type="text"
                            value={formData.shippingAddress.country}
                            onChange={(e) => setFormData({ ...formData, shippingAddress: { ...formData.shippingAddress, country: e.target.value } })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="USA"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                      <Button
                        type="button"
                        onClick={handleCloseForm}
                        variant="outline"
                        className="border-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || formData.items.length === 0}
                        className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            {editingOrder ? 'Update Order' : 'Create Order'}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </ProtectedRoute>
  );
}
