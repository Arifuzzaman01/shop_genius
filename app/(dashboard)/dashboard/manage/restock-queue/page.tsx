"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Loader2, AlertTriangle, CheckCircle, XCircle, RefreshCcw, TrendingDown, Package } from "lucide-react";
import { RestockQueueItem } from "@/app/constants/schema";
import { getRestockQueue, markRestockQueueItemRestocked, removeFromRestockQueue } from "@/lib/stock-management";
import ProtectedRoute from "@/components/ProtectedRoute";
import { formatDate } from "@/lib/utils";

const priorityRank: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2
};

export default function RestockQueuePage() {
  const { status } = useSession();
  
  const [queueItems, setQueueItems] = useState<RestockQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const queueData = await getRestockQueue("pending");
      const sortedQueue = [...queueData].sort((a, b) => {
        const priorityDiff = (priorityRank[a.priority] ?? 99) - (priorityRank[b.priority] ?? 99);
        if (priorityDiff !== 0) return priorityDiff;
        if (a.currentStock !== b.currentStock) return a.currentStock - b.currentStock;
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      });
      setQueueItems(sortedQueue);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load restock queue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestock = async (item: RestockQueueItem) => {
    if (!confirm(`Mark "${item.productName}" as restocked?`)) return;

    try {
      setIsUpdating(true);
      await markRestockQueueItemRestocked(item._id, item.suggestedRestockQuantity);
      
      toast.success(`"${item.productName}" marked as restocked!`);
      loadData();
    } catch (error) {
      console.error("Error restocking:", error);
      toast.error("Failed to update stock");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveFromQueue = async (itemId: string, productName: string) => {
    if (!confirm(`Remove "${productName}" from restock queue?`)) return;

    try {
      await removeFromRestockQueue(itemId);
      toast.success(`"${productName}" removed from queue!`);
      loadData();
    } catch (error) {
      console.error("Error removing from queue:", error);
      toast.error("Failed to remove from queue");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low": return "bg-blue-100 text-blue-800 border-blue-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <TrendingDown className="w-4 h-4" />;
      case "medium": return <AlertTriangle className="w-4 h-4" />;
      case "low": return <Package className="w-4 h-4" />;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Container>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Restock Queue</h1>
            <p className="text-gray-600">
              Manage low stock products and prioritize restocking
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-red-600">
                    {queueItems.filter(item => item.priority === "high").length}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Medium Priority</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {queueItems.filter(item => item.priority === "medium").length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Priority</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {queueItems.filter(item => item.priority === "low").length}
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Empty State */}
          {!isLoading && queueItems.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700">All Stocked Up!</p>
              <p className="text-gray-500 mt-2">No products need restocking at the moment</p>
            </div>
          )}

          {/* Queue Items List */}
          {!isLoading && queueItems.length > 0 && (
            <div className="space-y-4">
              {queueItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow p-6 border-l-4"
                  style={{
                    borderLeftColor: item.priority === "high" ? "#ef4444" : 
                                     item.priority === "medium" ? "#eab308" : "#3b82f6"
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{item.productName}</h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(item.priority)}`}>
                          {getPriorityIcon(item.priority)}
                          {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <label className="text-xs text-gray-500">Current Stock</label>
                          <p className={`text-2xl font-bold ${item.currentStock === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {item.currentStock}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Min Threshold</label>
                          <p className="text-lg font-semibold text-gray-700">{item.minStockThreshold}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Suggested Qty</label>
                          <p className="text-lg font-semibold text-green-600">{item.suggestedRestockQuantity}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Added</label>
                          <p className="text-sm text-gray-700">{formatDate(item.addedAt)}</p>
                        </div>
                      </div>

                      {/* Stock Level Indicator */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Stock Level</span>
                          <span className="text-xs font-medium text-gray-700">
                            {Math.round((item.currentStock / item.suggestedRestockQuantity) * 100)}% of suggested
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              item.currentStock === 0 ? 'bg-red-600' :
                              item.currentStock < item.minStockThreshold ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((item.currentStock / item.suggestedRestockQuantity) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        onClick={() => handleRestock(item)}
                        disabled={isUpdating}
                        className="bg-green-600 hover:bg-green-700 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Restock
                      </Button>
                      <Button
                        onClick={() => handleRemoveFromQueue(item._id, item.productName)}
                        disabled={isUpdating}
                        variant="outline"
                        className="text-sm text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">How Restock Queue Works</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Products are automatically added when stock falls below minimum threshold</li>
                  <li>• Priority is determined by how low the stock is:</li>
                  <li className="ml-4">- High: Stock is 0 or critically low</li>
                  <li className="ml-4">- Medium: Stock below 50% of threshold</li>
                  <li className="ml-4">- Low: Stock between 50-100% of threshold</li>
                  <li>• Click &quot;Restock&quot; to update product stock with suggested quantity</li>
                  <li>• Remove items from queue if they&apos;re no longer needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </ProtectedRoute>
  );
}
