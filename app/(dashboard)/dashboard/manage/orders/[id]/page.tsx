"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Loader2, ArrowLeft, Package, User, Calendar, DollarSign, MapPin, Mail } from "lucide-react";
import { Order } from "@/app/constants/schema";
import { fetchOrderById, updateOrder, cancelOrder } from "@/lib/order-api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { formatCurrency, formatDate } from "@/lib/utils";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export default function OrderDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      const data = await fetchOrderById(orderId);
      setOrder(data);
    } catch (error) {
      console.error("Error loading order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;

    try {
      setIsUpdating(true);
      await updateOrder(order._id, { _id: order._id, status: newStatus });
      toast.success(`Order status updated to ${newStatus}! (Backend not connected)`);
      loadOrder();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      await cancelOrder(order!._id);
      toast.success("Order cancelled successfully! (Backend not connected)");
      loadOrder();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel order");
    }
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

  if (!order) {
    return (
      <ProtectedRoute>
        <Container>
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-600">Order not found</p>
            <Button
              onClick={() => router.push("/manage/orders")}
              className="mt-4"
            >
              Back to Orders
            </Button>
          </div>
        </Container>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Container>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Orders
            </button>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Order #{order.orderNumber}
                </h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(order.createdAt)}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {order.status !== "cancelled" && order.status !== "delivered" && (
                  <>
                    <Button
                      onClick={() => handleUpdateStatus("confirmed")}
                      disabled={isUpdating || order.status === "confirmed"}
                      variant="outline"
                      className="text-sm"
                    >
                      Confirm
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus("shipped")}
                      disabled={isUpdating || order.status === "shipped"}
                      variant="outline"
                      className="text-sm"
                    >
                      Ship
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus("delivered")}
                      disabled={isUpdating || order.status === "delivered"}
                      variant="outline"
                      className="text-sm"
                    >
                      Deliver
                    </Button>
                    <Button
                      onClick={handleCancelOrder}
                      disabled={isUpdating}
                      variant="destructive"
                      className="text-sm bg-red-600 hover:bg-red-700"
                    >
                      Cancel Order
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items
                </h2>
                
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 border-b pb-4 last:border-b-0">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          <span>Price: {formatCurrency(item.price)}</span>
                          {item.discount && (
                            <span className="text-green-600">-{item.discount}% OFF</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(item.price * item.quantity - (item.discount || 0))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.tax && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax:</span>
                      <span className="font-medium">{formatCurrency(order.tax)}</span>
                    </div>
                  )}
                  {order.shippingCost && (
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping:</span>
                      <span className="font-medium">
                        {order.shippingCost === 0 ? "Free" : formatCurrency(order.shippingCost)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-green-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </h2>
                  <div className="text-gray-700">
                    {order.shippingAddress.street && (
                      <p>{order.shippingAddress.street}</p>
                    )}
                    {(order.shippingAddress.city || order.shippingAddress.state || order.shippingAddress.zipCode) && (
                      <p>
                        {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zipCode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                    {order.shippingAddress.country && (
                      <p>{order.shippingAddress.country}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {order.notes && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Order Notes</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                  </div>
                  {order.customerEmail && (
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {order.customerEmail}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Order Timeline</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Order Created</p>
                      <p className="text-xs text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  
                  {order.status === "confirmed" && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Order Confirmed</p>
                        <p className="text-xs text-gray-600">{formatDate(order.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {order.status === "shipped" && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Order Shipped</p>
                        <p className="text-xs text-gray-600">{formatDate(order.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {order.status === "delivered" && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Order Delivered</p>
                        <p className="text-xs text-gray-600">{formatDate(order.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {order.status === "cancelled" && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Order Cancelled</p>
                        <p className="text-xs text-gray-600">{formatDate(order.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Order Value
                </h2>
                <div className="text-3xl font-bold mb-2">
                  {formatCurrency(order.total)}
                </div>
                <div className="text-sm opacity-90">
                  Total amount paid
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </ProtectedRoute>
  );
}
