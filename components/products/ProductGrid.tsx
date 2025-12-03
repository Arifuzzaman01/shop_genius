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
  } = useQuery<Product[]>({
    queryKey: ["products", selectedTab],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products?type=${selectedTab.toLowerCase()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      return response.json();
    },
  });

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
            <p>Error loading products: {(error as Error).message}</p>
          </div>
        </div>
      ) : (
        <div>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 mt-10">
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
