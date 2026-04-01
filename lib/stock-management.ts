import { Product, ActivityLog, RestockQueueItem } from "@/app/constants/schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://shop-genius-server.vercel.app";

/**
 * Update product stock
 */
export async function updateProductStock(productId: string, quantity: number, operation: "add" | "deduct"): Promise<Product> {
    try {
        // Primary attempt: dedicated stock endpoint with PATCH.
        const patchRes = await fetch(`${API_URL}/products/${productId}/stock`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ quantity, operation }),
        });

        if (patchRes.ok) {
            return patchRes.json();
        }

        // Fallback 1: same endpoint with PUT and absolute stock payload.
        if (patchRes.status === 404 || patchRes.status === 405) {
            const currentRes = await fetch(`${API_URL}/products/${productId}`);
            if (!currentRes.ok) {
                throw new Error("Product not found.");
            }
            const currentProduct = await currentRes.json();
            const currentStock = Number(currentProduct?.stock ?? 0);
            const nextStock = operation === "deduct"
                ? Math.max(0, currentStock - quantity)
                : currentStock + quantity;

            const putRes = await fetch(`${API_URL}/products/${productId}/stock`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ stock: nextStock }),
            });

            if (putRes.ok) {
                return putRes.json();
            }

            // Fallback 2: generic product update endpoint.
            if (putRes.status === 404 || putRes.status === 405) {
                const fullPutRes = await fetch(`${API_URL}/products/${productId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...currentProduct,
                        stock: nextStock,
                        status: nextStock === 0 ? "out of stock" : currentProduct?.status || "active",
                    }),
                });

                if (fullPutRes.ok) {
                    return fullPutRes.json();
                }

                throw new Error(`Failed to update stock: ${fullPutRes.status}`);
            }

            throw new Error(`Failed to update stock: ${putRes.status}`);
        }

        if (patchRes.status === 400) {
            throw new Error("Invalid stock update. Insufficient stock.");
        }

        throw new Error(`Failed to update stock: ${patchRes.status}`);
    } catch (error) {
        console.error("Error updating product stock:", error);
        throw error;
    }
}

/**
 * Deduct stock for order items
 */
export async function deductOrderStock(orderItems: Array<{ productId: string; quantity: number }>): Promise<void> {
    try {
        // Process each item sequentially
        for (const item of orderItems) {
            await updateProductStock(item.productId, item.quantity, "deduct");
        }
    } catch (error) {
        console.error("Error deducting order stock:", error);
        throw error;
    }
}

/**
 * Check if products have sufficient stock
 */
export async function checkStockAvailability(items: Array<{ productId: string; quantity: number }>): Promise<{ 
    available: boolean; 
    insufficientItems: Array<{ productId: string; productName: string; requested: number; available: number }> 
}> {
    try {
        // In a real implementation, this would be a single API call
        // For now, we'll simulate the logic
        const res = await fetch(`${API_URL}/products/check-stock`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ items }),
        });
        
        if (!res.ok) {
            // Fail closed so order confirmation is blocked when stock cannot be verified.
            return { available: false, insufficientItems: [] };
        }
        
        return res.json();
    } catch (error) {
        console.error("Error checking stock availability:", error);
        // Fail closed to prevent accidental overselling.
        return { available: false, insufficientItems: [] };
    }
}

/**
 * Get low stock products
 */
export async function getLowStockProducts(): Promise<Product[]> {
    try {
        const res = await fetch(`${API_URL}/products/low-stock`);
        
        if (!res.ok) {
            return [];
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching low stock products:", error);
        return [];
    }
}

/**
 * Create activity log entry
 */
export async function createActivityLog(logData: {
    type: string;
    title: string;
    description: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    metadata?: { [key: string]: string | number | boolean | null };
}): Promise<ActivityLog> {
    try {
        const res = await fetch(`${API_URL}/activity-logs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(logData),
        });
        
        if (!res.ok) {
            console.warn("Failed to create activity log:", res.status);
            // Return a mock log entry for frontend display
            return {
                _id: Date.now().toString(),
                ...logData,
                createdAt: new Date(),
            } as ActivityLog;
        }

        return res.json();
    } catch (error) {
        console.error("Error creating activity log:", error);
        // Return mock data for frontend
        return {
            _id: Date.now().toString(),
            ...logData,
            createdAt: new Date(),
        } as ActivityLog;
    }
}

/**
 * Fetch recent activity logs
 */
export async function fetchActivityLogs(limit: number = 10): Promise<ActivityLog[]> {
    try {
        const res = await fetch(`${API_URL}/activity-logs?limit=${limit}`);
        
        if (!res.ok) {
            return [];
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching activity logs:", error);
        return [];
    }
}

/**
 * Add product to restock queue
 */
export async function addToRestockQueue(productId: string, suggestedQuantity?: number): Promise<RestockQueueItem> {
    try {
        const res = await fetch(`${API_URL}/restock-queue`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId, suggestedQuantity }),
        });
        
        if (!res.ok) {
            throw new Error("Failed to add to restock queue");
        }

        return res.json();
    } catch (error) {
        console.error("Error adding to restock queue:", error);
        throw error;
    }
}

/**
 * Get restock queue items
 */
export async function getRestockQueue(status: "pending" | "all" = "pending"): Promise<RestockQueueItem[]> {
    try {
        const res = await fetch(`${API_URL}/restock-queue?status=${status}`);
        
        if (!res.ok) {
            return [];
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching restock queue:", error);
        return [];
    }
}

/**
 * Mark a restock queue item as restocked
 * Backend contract: PUT /restock-queue/:id/restock
 */
export async function markRestockQueueItemRestocked(itemId: string, newStockQuantity: number): Promise<RestockQueueItem> {
    try {
        const res = await fetch(`${API_URL}/restock-queue/${itemId}/restock`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ newStockQuantity }),
        });
        
        if (!res.ok) {
            throw new Error("Failed to mark restock item as completed");
        }

        return res.json();
    } catch (error) {
        console.error("Error marking restock queue item as restocked:", error);
        throw error;
    }
}

/**
 * Remove item from restock queue
 */
export async function removeFromRestockQueue(itemId: string): Promise<void> {
    try {
        const res = await fetch(`${API_URL}/restock-queue/${itemId}`, {
            method: "DELETE",
        });
        
        if (!res.ok) {
            throw new Error("Failed to remove from restock queue");
        }
    } catch (error) {
        console.error("Error removing from restock queue:", error);
        throw error;
    }
}
