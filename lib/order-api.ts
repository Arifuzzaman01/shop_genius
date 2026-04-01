import { Order, CreateOrderInput, UpdateOrderInput } from "@/app/constants/schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://shop-genius-server.vercel.app";

/**
 * Fetch all orders with optional filtering
 */
export async function fetchOrders(status?: string): Promise<Order[]> {
    const url = status 
        ? `${API_URL}/orders?status=${status}`
        : `${API_URL}/orders`;
    
    try {
        const res = await fetch(url);
        
        if (!res.ok) {
            if (res.status === 404) {
                throw new Error("Orders endpoint not found.");
            }
            if (res.status >= 500) {
                throw new Error("Server temporarily unavailable.");
            }
            throw new Error(`Failed to fetch orders: ${res.status}`);
        }

        // Check content type to avoid HTML error pages
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("API returned non-JSON response:", res.status);
            throw new Error("Invalid response from server");
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
    }
}

/**
 * Fetch a single order by ID
 */
export async function fetchOrderById(orderId: string): Promise<Order> {
    try {
        const res = await fetch(`${API_URL}/orders/${orderId}`);
        
        if (!res.ok) {
            if (res.status === 404) {
                throw new Error("Order not found.");
            }
            if (res.status >= 500) {
                throw new Error("Server temporarily unavailable.");
            }
            throw new Error(`Failed to fetch order: ${res.status}`);
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("API returned non-JSON response:", res.status);
            throw new Error("Invalid response from server");
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching order:", error);
        throw error;
    }
}

/**
 * Create a new order
 */
export async function createOrder(orderData: CreateOrderInput): Promise<Order> {
    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });
        
        if (!res.ok) {
            if (res.status === 400) {
                throw new Error("Invalid order data. Please check all fields.");
            }
            if (res.status >= 500) {
                throw new Error("Server temporarily unavailable.");
            }
            throw new Error(`Failed to create order: ${res.status}`);
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("API returned non-JSON response:", res.status);
            throw new Error("Invalid response from server");
        }

        return res.json();
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
}

/**
 * Update an existing order
 */
export async function updateOrder(orderId: string, orderData: UpdateOrderInput): Promise<Order> {
    try {
        const res = await fetch(`${API_URL}/orders/${orderId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });
        
        if (!res.ok) {
            if (res.status === 404) {
                throw new Error("Order not found.");
            }
            if (res.status === 400) {
                throw new Error("Invalid order data. Please check all fields.");
            }
            if (res.status >= 500) {
                throw new Error("Server temporarily unavailable.");
            }
            throw new Error(`Failed to update order: ${res.status}`);
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("API returned non-JSON response:", res.status);
            throw new Error("Invalid response from server");
        }

        return res.json();
    } catch (error) {
        console.error("Error updating order:", error);
        throw error;
    }
}

/**
 * Cancel an order (update status to cancelled)
 */
export async function cancelOrder(orderId: string): Promise<Order> {
    return updateOrder(orderId, { _id: orderId, status: "cancelled" });
}

/**
 * Delete an order permanently
 */
export async function deleteOrder(orderId: string): Promise<void> {
    try {
        const res = await fetch(`${API_URL}/orders/${orderId}`, {
            method: "DELETE",
        });
        
        if (!res.ok) {
            if (res.status === 404) {
                throw new Error("Order not found.");
            }
            if (res.status >= 500) {
                throw new Error("Server temporarily unavailable.");
            }
            throw new Error(`Failed to delete order: ${res.status}`);
        }
    } catch (error) {
        console.error("Error deleting order:", error);
        throw error;
    }
}
