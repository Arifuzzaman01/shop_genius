"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Users, Mail, ShoppingCart, DollarSign } from "lucide-react";

// Mock customer data (replace with real API when backend is ready)
const mockCustomers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    orders: 5,
    totalSpent: 599.95,
    lastOrder: "2024-01-15",
    avatar: null
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    orders: 3,
    totalSpent: 299.97,
    lastOrder: "2024-01-10",
    avatar: null
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    orders: 8,
    totalSpent: 1299.92,
    lastOrder: "2024-01-18",
    avatar: null
  }
];

export default function CustomersPage() {
  const { data: session, status } = useSession();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    avgOrders: 0,
    avgSpent: 0
  });

  useEffect(() => {
    // TODO: Replace with real API call
    setTimeout(() => {
      setCustomers(mockCustomers);
      setStats({
        total: mockCustomers.length,
        avgOrders: mockCustomers.reduce((sum, c) => sum + c.orders, 0) / mockCustomers.length,
        avgSpent: mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / mockCustomers.length
      });
      setIsLoading(false);
    }, 500);
  }, []);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600 mt-1">View and manage your customer base</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Orders/Customer</p>
              <p className="text-3xl font-bold text-purple-600">{stats.avgOrders.toFixed(1)}</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Spent/Customer</p>
              <p className="text-3xl font-bold text-emerald-600">${stats.avgSpent.toFixed(2)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Customer List</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Order</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {customer.avatar ? (
                        <img
                          src={customer.avatar}
                          alt={customer.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {customer.name.charAt(0)}
                        </div>
                      )}
                      <div className="font-medium text-gray-900">{customer.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {customer.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                    ${customer.totalSpent.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(customer.lastOrder).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
