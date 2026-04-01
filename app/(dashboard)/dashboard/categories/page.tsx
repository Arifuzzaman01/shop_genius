"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Layers, Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { fetchCategories, deleteCategory, type Category } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function CategoriesPage() {
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will also update product counts.")) return;
    
    try {
      await deleteCategory(id);
      toast.success("Category deleted successfully!");
      loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Organize your products into categories</p>
        </div>
        <Link href="/dashboard/manage/categories">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Categories</p>
            <p className="text-3xl font-bold">{categories.length}</p>
          </div>
          <Layers className="w-12 h-12 text-blue-500" />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category._id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer relative"
          >
            {/* Quick Actions */}
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Navigate to edit page
                }}
                className="p-2 bg-white/90 hover:bg-blue-50 rounded-full shadow"
                title="Edit"
              >
                <Edit className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={(e) => handleDelete(category._id)}
                className="p-2 bg-white/90 hover:bg-red-50 rounded-full shadow"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>

            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-t-lg overflow-hidden">
              {category.categoryImage?.[0] ? (
                <img
                  src={category.categoryImage[0]}
                  alt={category.categoryName}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <Layers className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {category.categoryName}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {category.description || "No description"}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {category.productCount} products
                </span>
                <Link
                  href={`/category/${category.slug}`}
                  className="text-blue-600 hover:text-blue-900 font-medium"
                >
                  View Products →
                </Link>
              </div>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-600">No categories yet</p>
            <p className="text-gray-500 mt-2">Create your first category to organize products</p>
          </div>
        )}
      </div>
    </div>
  );
}
