"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Package, 
  Layers, 
  ShoppingCart, 
  Heart, 
  Settings, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  ArrowRight,
  Plus,
  BarChart3
} from "lucide-react";

// Dashboard statistics data
const statsData = [
  {
    title: "Total Products",
    value: "0",
    change: "+0%",
    icon: Package,
    color: "text-green-600",
    bgColor: "bg-green-100",
    gradient: "from-green-500 to-green-600"
  },
  {
    title: "Categories",
    value: "0",
    change: "+0%",
    icon: Layers,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    title: "Total Orders",
    value: "0",
    change: "+0%",
    icon: ShoppingCart,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    gradient: "from-purple-500 to-purple-600"
  },
  {
    title: "Revenue",
    value: "$0.00",
    change: "+0%",
    icon: DollarSign,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    gradient: "from-emerald-500 to-emerald-600"
  }
];

// Quick actions
const quickActions = [
  {
    title: "Add Product",
    href: "/manage/products",
    icon: Plus,
    color: "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    description: "Create new product",
    shortcut: "⌘P"
  },
  {
    title: "Add Category",
    href: "/manage/categories",
    icon: Layers,
    color: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    description: "Create new category",
    shortcut: "⌘C"
  },
  {
    title: "View Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    color: "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    description: "Manage orders",
    shortcut: "⌘O"
  },
  {
    title: "Browse Shop",
    href: "/shop",
    icon: Package,
    color: "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
    description: "Visit shop",
    shortcut: "⌘S"
  }
];

// Recent activity (placeholder)
const recentActivity = [
  {
    title: "Welcome!",
    description: "Get started by adding your first product or category",
    time: "Just now",
    icon: TrendingUp,
    color: "text-green-600"
  }
];

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      {/* <div className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {session?.user?.name || 'User'}! 👋
            </h1>
            <p className="text-green-50 text-lg">
              Here&apos;s what&apos;s happening with your store today.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Package className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </div> */}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-semibold">{stat.change}</span>
                </div>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
          <Link href="/dashboard/analytics" className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
            View Analytics
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className={`${action.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg group-hover:bg-opacity-30 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                    {action.shortcut}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-1">{action.title}</h3>
                <p className="text-sm text-white text-opacity-90">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products Overview */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Products</h3>
                <p className="text-sm text-gray-500">Manage your inventory</p>
              </div>
            </div>
            <Link 
              href="/manage/products"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              Manage
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active Products</span>
              </div>
              <span className="font-semibold text-gray-800">0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Low Stock</span>
              </div>
              <span className="font-semibold text-gray-800">0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Out of Stock</span>
              </div>
              <span className="font-semibold text-gray-800">0</span>
            </div>
          </div>
        </div>

        {/* Categories Overview */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Categories</h3>
                <p className="text-sm text-gray-500">Organize your products</p>
              </div>
            </div>
            <Link 
              href="/manage/categories"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              Manage
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Total Categories</span>
              </div>
              <span className="font-semibold text-gray-800">0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <span className="font-semibold text-gray-800">0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Inactive</span>
              </div>
              <span className="font-semibold text-gray-800">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
          <button className="text-gray-500 hover:text-gray-700 text-sm font-medium">
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {recentActivity.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">{activity.title}</h4>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
              </div>
            );
          })}
          
          {recentActivity.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Account Info Card */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Account Information</h2>
          <Link 
            href="/dashboard/settings"
            className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
          >
            Edit Profile
            <Settings className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {session?.user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <div className="mb-3">
              <label className="text-sm text-gray-500 block mb-1">Name</label>
              <p className="font-semibold text-gray-800">{session?.user?.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Email</label>
              <p className="font-semibold text-gray-800">{session?.user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
