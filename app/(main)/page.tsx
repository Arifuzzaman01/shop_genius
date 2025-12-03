"use client"
import React from 'react'
import HomeBanner from '@/components/home/HomeBanner'
import Container from '@/components/Container'
import ProductGrid from '@/components/products/ProductGrid'
import HomeCategories from '@/components/home/HomeCategories'
import { useQuery } from '@tanstack/react-query'

// Define the Category interface
interface Category {
  _id: string;
  title: string;
  slug?: {
    current: string;
  };
  image?: {
    asset?: {
      url: string;
    };
  };
  productCount?: number;
}

const MainPage = () => {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/products/by-category`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch categories: ${res.status} ${res.statusText}`);
        }
        
        return res.json();
      } catch (err) {
        console.error("Error fetching categories:", err);
        // Return empty array as fallback
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
  

  return (
    <Container>
      <HomeBanner />
      <div className="py-10">
        <ProductGrid />
        <HomeCategories categories={categories || []} />
        {/* <ShopByBrand />
        <LatestBlog /> */}
      </div>
    </Container>
  )
}

export default MainPage