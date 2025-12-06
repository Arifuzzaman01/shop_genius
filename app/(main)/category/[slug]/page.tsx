import { fetchCategories } from "@/app/constants/query";
import CategoryProducts from "@/components/categories/CategoryProducts";
import Container from "@/components/Container";
import { Title } from "@/components/ui/text";
import React from "react";

const Category = async ({ params }: { params: Promise<{ slug: string }> }) => {
  let categories = [];
  const { slug } = await params;
  
  try {
    categories = await fetchCategories();
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    // We'll still render the component but with empty categories
    // The component should handle this case gracefully
  }
  
  return (
    <div className="py-10">
      <Container>
        <Title>
          Product by Categories:{" "}
          <span className="font-bold text-green-600 tracking-wide">
            {slug && slug}
          </span>
        </Title>
        <CategoryProducts categories={categories} slug={slug} />
      </Container>
    </div>
  );
};

export default Category;