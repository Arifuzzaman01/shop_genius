import HomeBanner from '@/components/home/HomeBanner'
import TestComponent from '@/components/TestComponent'
import React from 'react'

const MainPage = () => {
  return (
    <div className='text-primary bg-shop_bg'>
      <HomeBanner />
      <TestComponent />
    </div>
  )
}

export default MainPage