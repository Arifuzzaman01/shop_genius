import React from 'react'
import HomeBanner from '@/components/home/HomeBanner'
import Container from '@/components/Container'
import ProductGrid from '@/components/products/ProductGrid'

const MainPage = () => {
  return (
    <Container>
      <HomeBanner />
      <div className="py-10">
        <ProductGrid />
        {/* 
        <HomeCategories categories={categories} />
        <ShopByBrand />
        <LatestBlog /> */}
      </div>
    </Container>
  )
}

export default MainPage