"use client";

import { useEffect, useState } from "react";
import HomeTabBar from "./HomeTabBar";


import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";
import NoProducts from "./NoProducts";
// import ProductCard from "./ProductCard";
// import { Product } from "@/sanity.types";
import { productTypes } from "@/app/constants/data";
import { useQuery } from "@tanstack/react-query";

const ProductGrid = () => {

  const [selectedTab, setSelectedTab] = useState(productTypes[0]?.title || "");
  console.log("Selected Tab:", selectedTab)
  // Using TanStack Query properly
  const { isPending, error, data, refetch } = useQuery({
    queryKey: ['products', selectedTab],
    queryFn: async () => {
      
      const response = await fetch(`/api/products?type=${selectedTab}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute
  });

  // Refetch when tab changes
  useEffect(() => {
    refetch();
  }, [selectedTab, refetch]);

  return (
    <div>
      <HomeTabBar selectedTab={selectedTab} onTabSelect={setSelectedTab} />
      {isPending ? (
        <div className="flex items-center justify-center py-10 min-h-80 gap-2 bg-gray-100 mt-10 w-full">
          <div className="flex gap-2 text-shop_light_green items-center ">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p>Product is loading...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-10 min-h-80 gap-2 bg-gray-100 mt-10 w-full">
          <div className="flex gap-2 text-red-500 items-center ">
            <p>Error loading products: {error.message}</p>
          </div>
        </div>
      ) : (
        // Mock rendering since we don't have actual ProductCard imported
        <div className="mt-10">
          <p className="text-center text-gray-500">No products available for {selectedTab}</p>
        </div>
        // Uncomment when ProductCard is available:
        /*
        data?.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 mt-10 ">
            {data?.map((product) => (
              <AnimatePresence key={product?._id}>
                <motion.div
                  layout
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              </AnimatePresence>
            ))}
          </div>
        ) : (
          <NoProducts selectedTab={selectedTab} />
        )
        */
      )}
    </div>
  );
};

export default ProductGrid;