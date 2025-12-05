"use client";

import React from 'react'
import HomeBanner from '@/components/home/HomeBanner'
import Container from '@/components/Container'
import ProductGrid from '@/components/products/ProductGrid'
import HomeCategories from '@/components/home/HomeCategories'
import { useCategories } from '../constants/query'

const MainPage = () => {
  const { data: categories, isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <Container>
        <HomeBanner />
        <div className="py-10">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-100 p-3 rounded">
                  <div className="bg-gray-200 rounded-full w-16 h-16"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ProductGrid />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <HomeBanner />
      <div className="py-10">
        <ProductGrid />
        <HomeCategories categories={categories || []} />
       
      </div>
    </Container>
  )
}

export default MainPage