"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Loader2, Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { Category } from "@/app/constants/schema";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "@/lib/category-api";
import { validateCategoryForm } from "@/lib/product-category-validation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CategoryManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    status: "active" as "active" | "inactive"
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Fetch categories on mount
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
      toast.error(error instanceof Error ? error.message : "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        categoryName: category.categoryName,
        description: "",
        status: "active"
      });
    } else {
      setEditingCategory(null);
      setFormData({
        categoryName: "",
        description: "",
        status: "active"
      });
    }
    setErrors({});
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      categoryName: "",
      description: "",
      status: "active"
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate form
    const validation = validateCategoryForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors as {[key: string]: string});
      toast.error("Please fix the form errors");
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        await updateCategory({
          categoryId: editingCategory.categoryId,
          categoryName: formData.categoryName,
          description: formData.description || undefined,
          status: formData.status
        });
        toast.success("Category updated successfully!");
      } else {
        // Create new category
        await createCategory({
          categoryName: formData.categoryName,
          description: formData.description || undefined,
          status: formData.status
        });
        toast.success("Category created successfully!");
      }
      
      handleCloseForm();
      loadCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      toast.success("Category deleted successfully!");
      loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    }
  };

  if (status === "loading") {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-shop_btn_dark_green mb-4" />
            <p className="text-xl font-semibold text-gray-700">Loading...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <ProtectedRoute>
      <Container>
        <div className="min-h-[60vh] py-10">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Category Management</h1>
                <p className="text-gray-600">Create and manage product categories</p>
              </div>
              <Button 
                onClick={() => handleOpenForm()}
                className="bg-shop_btn_dark_green hover:bg-shop_light_green text-white flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Category
              </Button>
            </div>

            {/* Categories List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-shop_btn_dark_green" />
                <span className="ml-3 text-lg text-gray-600">Loading categories...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-10 text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Categories Found</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first category</p>
                <Button 
                  onClick={() => handleOpenForm()}
                  className="bg-shop_btn_dark_green hover:bg-shop_light_green text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Category
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div 
                    key={category.categoryId}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">
                          {category.categoryName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {category.productCount || 0} products
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Active
                      </span>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handleOpenForm(category)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(category.categoryId, category.categoryName)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingCategory ? "Edit Category" : "Create Category"}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.categoryName 
                        ? "border-red-500 focus:ring-red-200" 
                        : "border-gray-300 focus:ring-green-200"
                    }`}
                    placeholder="e.g., Electronics, Grocery"
                    disabled={isSubmitting}
                  />
                  {errors.categoryName && (
                    <p className="mt-1 text-sm text-red-500">{errors.categoryName}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.description 
                        ? "border-red-500 focus:ring-red-200" 
                        : "border-gray-300 focus:ring-green-200"
                    }`}
                    rows={3}
                    placeholder="Optional category description"
                    disabled={isSubmitting}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-200"
                    disabled={isSubmitting}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-shop_btn_dark_green hover:bg-shop_light_green text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingCategory ? "Update" : "Create"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Container>
    </ProtectedRoute>
  );
}
