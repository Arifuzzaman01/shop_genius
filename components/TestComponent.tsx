import React from 'react';
import { cn } from '@/lib/utils';

const TestComponent = () => {
  return (
    <div className={cn('bg-shop_dark_green', 'text-white', 'p-4')}>
      <h2 className={cn('text-xl', 'font-bold')}>Test Component</h2>
      <p className={cn('mt-2', 'text-shop_light_green')}>
        This is a test to see if cn() function works with custom classes
      </p>
    </div>
  );
};

export default TestComponent;