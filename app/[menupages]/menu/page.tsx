import { notFound } from "next/navigation";
import MenuClient from "./MenuClient";
import { getMenuCategories, getMenuItems } from "@/lib/db/menu";
import connectDB from "@/lib/db/connect";
import Cafe from "@/lib/db/models/Cafe";

type PageProps = {
  params: { menupages: string }
}

// This is a Server Component (no 'use client' directive)
export default async function MenuPage({ params }: PageProps) {
  const { menupages } = params;

  console.log('MenuPage loading for slug:', menupages);

  // Check if cafe exists and is active
  try {
    await connectDB();
    const cafe = await Cafe.findOne({ slug: menupages }).select('slug cafeName isActive endDate subscriptionPlan');
    
    if (!cafe) {
      console.error(`Cafe with slug "${menupages}" not found in database.`);
      notFound();
    }
    
    // Check if subscription has expired
    const isExpired = cafe.subscriptionPlan !== 'Lifetime' && new Date(cafe.endDate) < new Date();

    if (!cafe.isActive || isExpired) {
      console.warn(`Cafe "${menupages}" is inactive or expired. isActive: ${cafe.isActive}, isExpired: ${isExpired}`);
      notFound();
    }
    
    // Cafe exists and is active, fetch initial data
    // Use a reliable fallback image
    const fallbackCatImg = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop&auto=format";

    // Fetch categories first to know which items to fetch, then parallelize
    const cats = await getMenuCategories(menupages);
    const firstCat = cats?.[0]?.name;
    
    // Map categories with proper fallback images
    const initialCategories = Array.isArray(cats) 
      ? cats.map((c: any) => ({ 
          name: c.name, 
          image: c.image && c.image.trim() !== '' ? c.image : fallbackCatImg 
        })) 
      : [];
    
    // In parallel, map categories and fetch items
    const [initialItemsRaw] = await Promise.all([
      firstCat ? getMenuItems(menupages, firstCat) : Promise.resolve([])
    ]);

    let initialItems: any[] = [];
    if (Array.isArray(initialItemsRaw)) {
      initialItems = initialItemsRaw.map((item: any) => ({
        id: String(item._id),
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.imageUrl || fallbackCatImg,
        description: item.description || '',
      }));
    }

    // Pass the fetched data to the client component
    return (
      <MenuClient 
        menupages={menupages} 
        initialItems={initialItems} 
        initialCategories={initialCategories} 
      />
    );

  } catch (error) {
    console.error('Error validating cafe:', error);
    notFound();
  }
}