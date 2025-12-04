import React from "react";
import { SubTitle } from "../ui/text";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/app/constants/schema";

const HomeCategories = ({ categories }: { categories: Category[] }) => {
  // console.log("categories", categories);
  
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white border border-shop_light_green/20 my-10 md:my-20 p-5 md:p-7 rounded-md">
        <SubTitle className="text-xl font-bold text-center border-b pb-3">
          Popular Categories
        </SubTitle>
        <div className="text-center py-5 text-gray-500">
          No categories available
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-shop_light_green/20 my-10 md:my-20 p-5 md:p-7 rounded-md">
      <SubTitle className="text-xl font-bold text-center border-b pb-3">
        Popular Categories
      </SubTitle>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
        {categories?.map((category) => (
          <div key={category?.categoryId || category?.categoryName} className="group flex items-center gap-3 bg-shop_light_bg">
            {category?.image?.asset?.url ? (
              <div className="overflow-hidden border border-shop_orange/30 hover:border-shop_orange w-20 h-20 p-1">
                <Link href={`/category/${category?.slug || category?.categoryId || '#'}`}>
                  <Image
                    src={category?.image?.asset?.url}
                    alt={category?.categoryName || "Category image"}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-110 hoverEffect cursor-pointer"
                    onError={(e) => {
                      // Fallback for image error
                      const target = e.target as HTMLImageElement;
                      target.src = "https://i.ibb.co.com/vvzT6Rfc/banner.jpg";
                    }}
                  />
                </Link>
              </div>
            ) : (
              <Link href={`/category/${category?.slug || category?.categoryId || '#'}`} className="bg-gray-200 overflow-hidden border border-shop_orange/30 hover:border-shop_orange w-20 h-20 p-1 flex items-center justify-center">
                <span className="text-gray-500 text-xs text-center">No image</span>
              </Link>
            )}
            <div className="p-2 space-y-1">
              <h3 className="font-semibold text-base">{category?.categoryName}</h3>
              <p className="text-sm">
                <span className="font-semibold">
                  {category.productCount !== undefined ? `(${category.productCount})` : "(0)"}
                </span> items available
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeCategories;