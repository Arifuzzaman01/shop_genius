"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Loader2, Plus, Edit, Trash2, AlertCircle, Package, DollarSign, Hash } from "lucide-react";
import { Product, Category, ProductFormData } from "@/app/constants/schema";
import { fetchProducts } from "@/lib/product-api";
import { fetchCategories } from "@/lib/category-api";
import { validateProductForm } from "@/lib/product-category-validation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { formatCurrency } from "@/lib/utils";

export default function ProductManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    description: "",
    price: "",
    stock: "",
    minStockThreshold: "5",
    category: [],
    brand: "",
    productImage: "",
    status: "active",
    discount: "",
    featured: false
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Fetch data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        productName: product.productName,
        description: product.description || "",
        price: product.price.toString(),
        stock: product.stock.toString(),
        minStockThreshold: "5",
        category: product.category || [],
        brand: product.brand || "",
        productImage: product.productImage?.[0] || "",
        status: product.status === "out of stock" ? "out_of_stock" : "active",
        discount: product.discount?.toString() || "",
        featured: product.featured || false
      });
    } else {
      setEditingProduct(null);
      setFormData({
        productName: "",
        description: "",
        price: "",
        stock: "",
        minStockThreshold: "5",
        category: [],
        brand: "",
        productImage: "",
        status: "active",
        discount: "",
        featured: false
      });
    }
    setErrors({});
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      productName: "",
      description: "",
      price: "",
      stock: "",
      minStockThreshold: "5",
      category: [],
      brand: "",
      productImage: "",
      status: "active",
      discount: "",
      featured: false
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate form
    const validation = validateProductForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors as {[key: string]: string});
      toast.error("Please fix the form errors");
      setIsSubmitting(false);
      return;
    }

    try {
      // TODO: Implement API call when backend is ready
      // For now, just show success message
      if (editingProduct) {
        toast.success("Product updated successfully! (Backend not connected)");
      } else {
        toast.success("Product created successfully! (Backend not connected)");
      }
      
      handleCloseForm();
      loadData();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete the product "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // TODO: Implement API call when backend is ready
      toast.success("Product deleted successfully! (Backend not connected)");
      loadData();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.includes(categoryId)
        ? prev.category.filter(id => id !== categoryId)
        : [...prev.category, categoryId]
    }));
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
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Product Management</h1>
                <p className="text-gray-600">Add and manage your product inventory</p>
              </div>
              <Button 
                onClick={() => handleOpenForm()}
                className="bg-shop_btn_dark_green hover:bg-shop_light_green text-white flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </Button>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-shop_btn_dark_green" />
                <span className="ml-3 text-lg text-gray-600">Loading products...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-10 text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6">Get started by adding your first product</p>
                <Button 
                  onClick={() => handleOpenForm()}
                  className="bg-shop_btn_dark_green hover:bg_shop_light_green text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Product
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                  const isLowStock = product.stock <= 5;
                  const isOutOfStock = product.stock === 0;
                  
                  return (
                    <div 
                      key={product._id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Product Image */}
                      <div className="h-48 bg-gray-100 relative">
                        {product.productImage?.[0] ? (
                          <img 
                            src={product.productImage[0]} 
                            alt={product.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <Package className="w-16 h-16" />
                          </div>
                        )}
                        {product.featured && (
                          <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">
                            Featured
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                          {product.productName}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-xl font-bold text-green-600">
                            {formatCurrency(product.price)}
                          </span>
                          {product.discount && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(product.price + (product.price * product.discount / 100))}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Hash className="w-4 h-4" />
                            <span>Stock: {product.stock}</span>
                            {isLowStock && !isOutOfStock && (
                              <span className="text-orange-600 font-semibold">(Low)</span>
                            )}
                          </div>
                          {product.brand && (
                            <div className="text-sm text-gray-500">
                              Brand: {product.brand}
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="mb-4">
                          {isOutOfStock ? (
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              In Stock
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleOpenForm(product)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(product._id, product.productName)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingProduct ? "Edit Product" : "Create Product"}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.productName 
                        ? "border-red-500 focus:ring-red-200" 
                        : "border-gray-300 focus:ring-green-200"
                    }`}
                    placeholder="e.g., Wireless Mouse"
                    disabled={isSubmitting}
                  />
                  {errors.productName && (
                    <p className="mt-1 text-sm text-red-500">{errors.productName}</p>
                  )}
                </div>

                {/* Price and Stock Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.price 
                          ? "border-red-500 focus:ring-red-200" 
                          : "border-gray-300 focus:ring-green-200"
                      }`}
                      placeholder="0.00"
                      disabled={isSubmitting}
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                    )}
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.stock 
                          ? "border-red-500 focus:ring-red-200" 
                          : "border-gray-300 focus:ring-green-200"
                      }`}
                      placeholder="0"
                      disabled={isSubmitting}
                    />
                    {errors.stock && (
                      <p className="mt-1 text-sm text-red-500">{errors.stock}</p>
                    )}
                  </div>
                </div>

                {/* Minimum Stock Threshold */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStockThreshold}
                    onChange={(e) => setFormData({ ...formData, minStockThreshold: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.minStockThreshold 
                        ? "border-red-500 focus:ring-red-200" 
                        : "border-gray-300 focus:ring-green-200"
                    }`}
                    placeholder="5"
                    disabled={isSubmitting}
                  />
                  {errors.minStockThreshold && (
                    <p className="mt-1 text-sm text-red-500">{errors.minStockThreshold}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Product will be marked as low stock when quantity falls below this threshold
                  </p>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories <span className="text-red-500">*</span>
                  </label>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                    {categories.length === 0 ? (
                      <p className="text-sm text-gray-500">No categories available. Please create categories first.</p>
                    ) : (
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <label key={category.categoryId} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.category.includes(category.categoryId)}
                              onChange={() => handleCategoryToggle(category.categoryId)}
                              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                              disabled={isSubmitting}
                            />
                            <span className="text-sm text-gray-700">{category.categoryName}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                  )}
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.brand 
                        ? "border-red-500 focus:ring-red-200" 
                        : "border-gray-300 focus:ring-green-200"
                    }`}
                    placeholder="e.g., Apple, Samsung"
                    disabled={isSubmitting}
                  />
                  {errors.brand && (
                    <p className="mt-1 text-sm text-red-500">{errors.brand}</p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-200"
                    rows={3}
                    placeholder="Product description"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.discount 
                        ? "border-red-500 focus:ring-red-200" 
                        : "border-gray-300 focus:ring-green-200"
                    }`}
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                  {errors.discount && (
                    <p className="mt-1 text-sm text-red-500">{errors.discount}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "out_of_stock" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-200"
                    disabled={isSubmitting}
                  >
                    <option value="active">Active</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                {/* Featured */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Mark as Featured Product
                  </label>
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
                    className="flex-1 bg-shop_btn_dark_green hover:bg_shop_light_green text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingProduct ? "Update" : "Create"
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
