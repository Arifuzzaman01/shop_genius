"use client";

import { useEffect, useState } from "react";
import HomeTabBar from "./HomeTabBar";
import { Loader2 } from "lucide-react";
import NoProducts from "./NoProducts";
import { productTypes } from "@/app/constants/data";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import { Product } from "@/app/constants/schema";

const ProductGrid = () => {
  const [selectedTab, setSelectedTab] = useState(productTypes[0]?.title || "");

  const {
    isPending,
    error,
    data: products,
    refetch,
    isFetching,
  } = useQuery<Product[]>({
    queryKey: ["products", selectedTab],
    queryFn: async () => {
      // Use a default URL if the environment variable is not set
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const response = await fetch(
        `${baseUrl}/products?type=${selectedTab.toLowerCase()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    // Add some caching and refetching options
    // staleTime: 5 * 60 * 1000, // 5 minutes
    // refetchOnWindowFocus: false,
    // retry: 1, // Retry once on failure
  });

  useEffect(() => {
    refetch();
  }, [selectedTab, refetch]);

  // Show skeleton loaders while fetching
  if (isPending || isFetching) {
    return (
      <div>
        <HomeTabBar selectedTab={selectedTab} onTabSelect={setSelectedTab} />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 mt-10">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="border rounded-md overflow-hidden bg-white animate-pulse">
              <div className="bg-gray-200 h-48 w-full"></div>
              <div className="p-3 flex flex-col gap-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <HomeTabBar selectedTab={selectedTab} onTabSelect={setSelectedTab} />

      {error ? (
        <div className="flex flex-col items-center justify-center py-10 min-h-80 gap-4 bg-gray-100 mt-10 w-full rounded-md">
          <div className="flex flex-col gap-2 text-red-500 items-center">
            <p className="font-medium">Error loading products</p>
            <p className="text-sm text-gray-600">{(error as Error).message}</p>
            <button 
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-shop_light_green text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 mt-10">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <NoProducts selectedTab={selectedTab} />
          )}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;