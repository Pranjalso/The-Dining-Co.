"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UtensilsCrossed, 
  Image as ImageIcon, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  ChevronDown, 
  UploadCloud, 
  Plus, 
  Tag, 
  Loader2,
  Crown,
  Star,
  FolderOpen,
  Edit3
} from "lucide-react";
import useSWR, { mutate } from "swr";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  editing?: boolean;
  editName?: string;
  editPrice?: number;
  editCategory?: string;
  editImageUrl?: string;
  editImageFile?: File | null;
};

const DEFAULT_CATEGORIES = ["Pizza", "Burger", "Pasta", "Drinks", "Desserts"];

const getUnsplashImage = (name: string): string => {
  const query = encodeURIComponent(name.toLowerCase());
  
  if (name.toLowerCase().includes('pizza')) {
    if (name.includes('Marinara')) return "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop&auto=format";
    if (name.includes('Margherita')) return "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=200&fit=crop&auto=format";
    if (name.includes('Chicago')) return "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=200&h=200&fit=crop&auto=format";
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&auto=format";
  }
  
  if (name.toLowerCase().includes('burger')) {
    if (name.includes('Veggie')) return "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=200&h=200&fit=crop&auto=format";
    if (name.includes('Turkey')) return "https://images.unsplash.com/photo-1550317138-10000687a72b?w=200&h=200&fit=crop&auto=format";
    if (name.includes('Cheese')) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&auto=format";
    return "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=200&fit=crop&auto=format";
  }
  
  return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop&auto=format";
};

// Skeleton Loader Component for Menu Items
const MenuItemsSkeleton = () => {
  return (
    <div className="bg-white border border-border rounded-xl sm:rounded-2xl p-1 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px]">
          <thead>
            <tr className="bg-surface border-b border-border">
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-left text-xs font-bold text-muted uppercase tracking-wider">Item</th>
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs font-bold text-muted uppercase tracking-wider">Price</th>
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs font-bold text-muted uppercase tracking-wider">Category</th>
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs font-bold text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[...Array(5)].map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse">
                <td className="py-3 sm:py-4 px-3 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface"></div>
                    <div className="h-4 w-32 bg-surface rounded"></div>
                  </div>
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">
                  <div className="h-4 w-16 mx-auto bg-surface rounded"></div>
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">
                  <div className="h-6 w-20 mx-auto bg-surface rounded-full"></div>
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface"></div>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function ManageMenuPage() {
  const params = useParams();
  const menupages = params?.menupages as string;
  const menuUrl = menupages ? `/api/menu/${menupages}` : null;
  const { data, isLoading: swrLoading, mutate: mutateMenu } = useSWR(menuUrl);

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Synchronize local menu state with SWR data
  useEffect(() => {
    if (data?.success && Array.isArray(data.data)) {
      const items: MenuItem[] = data.data.map((it: any) => ({
        id: it._id,
        name: it.name,
        price: it.price,
        category: it.category,
        imageUrl: it.imageUrl,
      }));
      setMenu(items);
      
      const uniqueCats = Array.from(new Set(items.map(i => i.category)));
      const combinedCats = Array.from(new Set([...DEFAULT_CATEGORIES, ...uniqueCats])).sort();
      setCategories(combinedCats);
    }
  }, [data]);

  const initialLoading = swrLoading && !data;

  const transformCloudinary = (url: string, w: number, h: number) => {
    if (!url.includes('res.cloudinary.com')) return url;
    return url.replace('/upload/', `/upload/f_auto,q_auto,c_fill,g_auto,w_${w},h_${h}/`);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    const imageUrl = URL.createObjectURL(file);
    setImgPreview(imageUrl);
    setImgFile(file);
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setCategories(prev => [...prev, trimmed].sort());
      setCategory(trimmed);
      setNewCategory("");
      setShowAddCategory(false);
    } else if (trimmed) {
      const existing = categories.find(c => c.toLowerCase() === trimmed.toLowerCase());
      if (existing) setCategory(existing);
      setNewCategory("");
      setShowAddCategory(false);
    }
  };

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    const res = await fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    const json = await res.json();
    setUploading(false);
    if (!res.ok || !json?.success) {
      throw new Error(json?.message || "Upload failed");
    }
    return json.data.url as string;
  };

  const handleAdd = async () => {
    if (!itemName.trim() || !price || !category || !imgFile) {
      setError(!imgFile ? 'Image is required' : 'Please fill all fields');
      return;
    }
    if (Number(price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }
    const currentCategory = category;
    setLoading(true);
    setError(null);
    try {
      const existingSameName = menu.find(m => m.name.toLowerCase().trim() === itemName.trim().toLowerCase());
      if (existingSameName) {
        throw new Error('Item with this name already exists');
      }
      const finalImage = await uploadImage(imgFile);
      const payload = {
        name: itemName.trim(),
        price: Number(price),
        category: currentCategory,
        imageUrl: finalImage,
      };
      const res = await fetch(`/api/menu/${menupages}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to create item");
      }
      const it = json.data;
      const newItem: MenuItem = {
        id: it._id,
        name: it.name,
        price: it.price,
        category: it.category,
        imageUrl: it.imageUrl,
      };
      setMenu(prev => {
        const next = [...prev, newItem];
        next.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
        return next;
      });
      if (!categories.includes(newItem.category)) {
        setCategories(prev => [...prev, newItem.category].sort());
      }
      setItemName("");
      setPrice("");
      setImgPreview(null);
      setImgFile(null);
      if (fileRef.current) fileRef.current.value = "";
      // Refresh cached data
      mutateMenu();
    } catch (e: any) {
      setError(e?.message || "Failed to add");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (id: string) => {
    setMenu(menu.map(m => m.id === id ? { 
      ...m,
      editing: true,
      editName: m.name,
      editPrice: m.price,
      editCategory: m.category,
      editImageUrl: m.imageUrl || "",
      editImageFile: null,
    } : m));
  };

  const cancelEdit = (id: string) => {
    setMenu(menu.map(m => m.id === id ? { ...m, editing: false } : m));
  };

  const updateEditField = (id: string, field: string, value: string | number) => {
    setMenu(menu.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleEditImageUpload = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    const imageUrl = URL.createObjectURL(file);
    updateEditField(id, 'editImageUrl', imageUrl);
    setMenu(menu.map(m => m.id === id ? { ...m, editImageFile: file } : m));
  };

  const onDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/menu/${menupages}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to delete item");
      }
      
      // Update local state immediately
      setMenu(prev => prev.filter(item => item.id !== id));
      
      // Refresh cached data
      mutateMenu();
    } catch (e: any) {
      setError(e?.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const onSaveEdit = async (id: string) => {
    const item = menu.find(m => m.id === id);
    if (!item) return;
    setLoading(true);
    setError(null);
    try {
      let newImageUrl = item.editImageUrl || item.imageUrl;
      if (item.editImageFile) {
        newImageUrl = await uploadImage(item.editImageFile);
      }
      const payload: any = {
        name: item.editName || item.name,
        price: item.editPrice ?? item.price,
        category: item.editCategory || item.category,
        imageUrl: newImageUrl,
      };
      const res = await fetch(`/api/menu/${menupages}?id=${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        const updatedCategory = payload.category;
        
        // Update local state immediately
        setMenu(prev => prev.map(m => {
          if (m.id === id) {
            return {
              ...m,
              name: payload.name,
              price: payload.price,
              category: updatedCategory,
              imageUrl: newImageUrl,
              editing: false,
              editImageFile: null,
            };
          }
          return m;
        }));
        
        // Update categories if this is a new category
        if (!categories.includes(updatedCategory)) {
          setCategories(prev => [...prev, updatedCategory].sort());
        }
        
        // Refresh cached data
        mutateMenu();
      } else {
        throw new Error(json?.message || "Failed to update item");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 w-full min-h-[800px] shadow-sm overflow-x-hidden">
      
      {/* ─── Page Header ─── */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
            <UtensilsCrossed className="text-primary" size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
              Menu Management
            </h1>
            <p className="text-sm sm:text-base text-muted mt-1 font-medium">
              Manage your restaurant menu items, prices, and categories
            </p>
          </div>
        </div>
      </div>

      {/* ─── Add New Menu Item Section ─── */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 sm:mb-10"
      >
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
            <UtensilsCrossed size={16} className="text-primary" />
          </div>
          <h2 className="font-bold text-lg sm:text-xl text-text">Add New Menu Item</h2>
        </div>

        <div className="bg-[#FBF8F3] border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            
            {/* Image Upload */}
            <div 
              onClick={() => fileRef.current?.click()}
              className="w-full lg:w-56 h-40 sm:h-48 bg-white border-2 border-dashed border-border hover:border-primary rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative overflow-hidden"
            >
              {imgPreview ? (
                <img src={imgPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-2 sm:mb-3 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud size={22} className="text-primary" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-muted px-2 text-center">Click to upload image</p>
                  <p className="text-[10px] sm:text-xs text-muted/60 mt-1 px-2 text-center">PNG, JPG upto 10 MB</p>
                </>
              )}
              {imgPreview && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <span className="text-text text-xs font-medium uppercase tracking-wider border border-primary/30 px-3 py-1.5 rounded-lg bg-primary/10">Change Image</span>
                </div>
              )}
              <input 
                type="file" 
                ref={fileRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-muted mb-1 ml-1 flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-primary/60" />
                  Item Name
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="eg.: Margherita Pizza"
                  className="w-full bg-white border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-text placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-muted mb-1 ml-1 flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-primary/60" />
                  Price ₹
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="eg.: 149"
                  className="w-full bg-white border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-text placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-muted mb-1 ml-1 flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-primary/60" />
                  Category
                </label>
                <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
                  <div className="relative w-full sm:flex-1">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all duration-300 hover:border-primary cursor-pointer"
                    >
                      <option value="" className="bg-white text-text">Select Category</option>
                      {categories.map(c => <option key={c} value={c} className="bg-white text-text">{c}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/60 pointer-events-none" />
                  </div>

                  {!showAddCategory ? (
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(true)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-3 bg-white border border-border rounded-xl text-xs sm:text-sm font-medium text-muted hover:text-primary hover:border-primary hover:bg-surface transition-all duration-300 whitespace-nowrap group"
                    >
                      <Plus size={16} className="text-muted/60 group-hover:text-primary" />
                      <span>New Category</span>
                    </button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2 overflow-hidden"
                    >
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/60" />
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Enter category name"
                          className="w-full bg-white border border-border rounded-xl pl-8 pr-3 py-2 sm:py-3 text-xs sm:text-sm font-medium text-text placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary"
                          autoFocus
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleAddCategory}
                          disabled={!newCategory.trim()}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          <Check size={14} className="inline mr-1" />
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowAddCategory(false);
                            setNewCategory("");
                          }}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 bg-white border border-border hover:border-primary text-muted hover:text-text rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap"
                        >
                          <X size={14} className="inline mr-1" />
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleAdd}
                  disabled={!itemName.trim() || !price || !category || !imgFile || uploading}
                  className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Save Item
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── Current Menu Items Section ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
            <FolderOpen size={16} className="text-primary" />
          </div>
          <h2 className="font-bold text-lg sm:text-xl text-text">Current Menu Items</h2>
          {initialLoading && !menu.length && <Loader2 size={16} className="animate-spin text-muted/40 ml-2" />}
        </div>

        {initialLoading && !menu.length ? (
          <MenuItemsSkeleton />
        ) : (
          <div className="bg-white border border-border rounded-xl sm:rounded-2xl p-1 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="py-3 sm:py-4 px-3 sm:px-6 text-left text-xs font-bold text-muted uppercase tracking-wider">Item</th>
                    <th className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs font-bold text-muted uppercase tracking-wider">Price</th>
                    <th className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs font-bold text-muted uppercase tracking-wider">Category</th>
                    <th className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs font-bold text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-border">
                  {menu.map((item, index) => (
                    <motion.tr 
                      key={item.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className={`hover:bg-surface/50 transition-colors duration-300 ${item.editing ? 'bg-amber-50/50' : ''}`}
                    >
                      
                      <td className="py-3 sm:py-4 px-3 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0 overflow-hidden border border-border shadow-sm">
                            {item.editing ? (
                              item.editImageUrl ? (
                                <img 
                                  src={item.editImageUrl} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = getUnsplashImage(item.name);
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-surface flex items-center justify-center relative group cursor-pointer">
                                  <ImageIcon size={14} className="text-primary/60" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => handleEditImageUpload(item.id, e)}
                                  />
                                </div>
                              )
                            ) : (
                              <img 
                                src={transformCloudinary(item.imageUrl, 80, 80)} 
                                alt={item.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = getUnsplashImage(item.name);
                                }}
                              />
                            )}
                          </div>
                          
                          {item.editing ? (
                            <input 
                              value={item.editName}
                              onChange={(e) => updateEditField(item.id, 'editName', e.target.value)}
                              className="flex-1 bg-white border border-primary/40 rounded-xl px-3 py-1.5 text-sm font-medium text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
                              placeholder="Item name"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-text">
                              {item.name}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">
                        {item.editing ? (
                          <input 
                            type="number"
                            value={item.editPrice}
                            onChange={(e) => updateEditField(item.id, 'editPrice', Number(e.target.value))}
                            className="w-20 mx-auto bg-white border border-primary/40 rounded-xl px-2 py-1.5 text-sm font-medium text-text text-center focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
                            placeholder="Price"
                          />
                        ) : (
                          <span className="text-sm font-bold text-text">₹{item.price}</span>
                        )}
                      </td>

                      <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">
                        {item.editing ? (
                          <div className="relative w-32 mx-auto">
                            <select
                              value={item.editCategory}
                              onChange={(e) => updateEditField(item.id, 'editCategory', e.target.value)}
                              className="w-full bg-white border border-primary/40 rounded-xl px-3 py-1.5 text-sm font-medium text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all duration-300"
                            >
                              {categories.map(c => <option key={c} value={c} className="bg-white text-text">{c}</option>)}
                            </select>
                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/60 pointer-events-none" />
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-semibold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            {item.category}
                          </span>
                        )}
                      </td>

                      <td className="py-3 sm:py-4 px-3 sm:px-6">
                        <div className="flex items-center justify-center gap-2">
                          {item.editing ? (
                            <>
                              <button 
                                onClick={() => onSaveEdit(item.id)}
                                className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center hover:bg-emerald-100 transition-all duration-300 shadow-sm"
                                title="Save changes"
                              >
                                <Check size={16} strokeWidth={2.5} />
                              </button>
                              <button 
                                onClick={() => cancelEdit(item.id)}
                                className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center hover:bg-rose-100 transition-all duration-300 shadow-sm"
                                title="Cancel editing"
                              >
                                <X size={16} strokeWidth={2.5} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => startEdit(item.id)}
                                className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all duration-300 shadow-sm"
                                title="Edit item"
                              >
                                <Edit3 size={16} strokeWidth={2} />
                              </button>
                              <button 
                                onClick={() => onDelete(item.id)}
                                className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center hover:bg-rose-100 transition-all duration-300 shadow-sm"
                                title="Delete item"
                              >
                                <Trash2 size={16} strokeWidth={2} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.section>
    </div>
  );
}