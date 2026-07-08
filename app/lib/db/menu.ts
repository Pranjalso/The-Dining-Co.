import connectDB from './connect';
import MenuItem from './models/MenuItem';

export async function getMenuCategories(slug: string) {
  await connectDB();
  
  // Aggregate distinct categories with a representative image
  const results = await (MenuItem as any).aggregate([
    { $match: { cafeSlug: slug } },
    { $sort: { category: 1, name: 1 } },
    {
      $group: {
        _id: '$category',
        image: { $first: '$imageUrl' },
      },
    },
    { $project: { _id: 0, name: '$_id', image: 1 } },
    { $sort: { name: 1 } },
  ]);

  return results;
}

export async function getMenuItems(slug: string, category?: string, ids?: string[]) {
  await connectDB();

  let query: any = { cafeSlug: slug };
  
  if (category) {
    query.category = category;
  }

  if (ids && ids.length > 0) {
    const items = await MenuItem.find({
      cafeSlug: slug,
      _id: { $in: ids },
    });

    const byId = new Map(items.map(i => [String(i._id), i]));
    const ordered = ids
      .map(id => byId.get(id))
      .filter(Boolean);

    return ordered;
  }

  const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });
  return menuItems;
}
