"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";
import NoProducts from "../products/NoProducts";
import ProductCard from "../products/ProductCard";
import { Category, Product } from "@/app/constants/schema";
import { useQuery } from "@tanstack/react-query";

interface Props {
  categories: Category[];
  slug: string;
}

const CategoryProducts = ({ categories, slug }: Props) => {
  const [currentSlug, setCurrentSlug] = useState(slug);
  const router = useRouter();

  const { data: allProducts, refetch, isLoading, error } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        
        const url = "http://localhost:5000/products";
        
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        return data;
      } catch (err) {
        console.error("Error fetching products:", err);
        throw err;
      }
    },
    
    enabled: true,
  
    staleTime: 0,
    gcTime: 0,
  });

  
  const filteredProducts = allProducts?.filter((product) => {

    return product.category.some(cat => 
      cat.toLowerCase() === currentSlug.toLowerCase()
    );
  }) || [];

  
  useEffect(() => {
    if (slug && slug !== currentSlug) {
      setCurrentSlug(slug);
    }
  }, [slug, currentSlug]);

  const handleCategoryChange = (categoryId: string, categorySlug?: string) => {
   
    const targetSlug = categorySlug || categoryId;
    // console.log("New slug:", targetSlug, "Current slug:", currentSlug);

    setCurrentSlug(targetSlug);
    router.push(`/category/${targetSlug}`, { scroll: false });
  };

  return (
    <div className="p-5 md:flex items-start gap-5">
      <div className="flex md:flex-col md:min-w-40 max-w-full overflow-x-auto border">
        {categories?.map((item) => (
          <Button
            onClick={() => handleCategoryChange(item?.categoryId, item?.slug)}
            key={item.categoryId}
            className={`bg-transparent border-0 p-0 rounded-none text-darkColor shadow-none hover:text-white font-semibold hoverEffect border-b last:border-b-0 capitalize transition-colors ${item?.slug == currentSlug || item?.categoryId == currentSlug ? "bg-shop_orange border-shop_orange text-white" : ""}`}
          >
            <p className="w-full text-left px-2">{item.categoryName}</p>
          </Button>
        ))}
      </div>
      <div className="flex-1">
        {isLoading ? (
          <div>
            <div className="flex flex-col items-center justify-center py-10 min-h-80 space-y-4 bg-gray-100 text-center rounded-xl w-full">
              <div className="flex items-center text-blue-600 gap-2.5">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Products is Loading...</span>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 min-h-80 space-y-4 bg-gray-100 text-center rounded-xl w-full">
            <div className="flex flex-col items-center text-red-600 gap-2.5">
              <span>Error loading products</span>
              <span className="text-sm">{(error as Error).message}</span>
              <Button
                onClick={() => refetch()}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : filteredProducts && Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {filteredProducts.map((product: Product) => (
              <AnimatePresence key={product._id}>
                <motion.div>
                  <ProductCard product={product} />
                </motion.div>
              </AnimatePresence>
            ))}
          </div>
        ) : (
          <NoProducts selectedTab={currentSlug} />
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;