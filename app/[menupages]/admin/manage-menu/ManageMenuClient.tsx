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
  Sparkles,
  Search,
  Filter,
  Grid3x3,
  List,
  Star
} from "lucide-react";
import useSWR, { mutate } from "swr";
import { useToast } from "@/hooks/use-toast";

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
    <div className="bg-surface/20 border border-border/20 rounded-2xl p-1 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px]">
          <thead>
            <tr className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-border/20">
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-left text-xs font-bold text-muted/60 uppercase tracking-wider">Item</th>
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs font-bold text-muted/60 uppercase tracking-wider">Price</th>
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs font-bold text-muted/60 uppercase tracking-wider">Category</th>
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs font-bold text-muted/60 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {[...Array(5)].map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse">
                <td className="py-3 sm:py-4 px-3 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface/40"></div>
                    <div className="h-4 w-32 bg-surface/40 rounded"></div>
                  </div>
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">
                  <div className="h-4 w-16 mx-auto bg-surface/40 rounded"></div>
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">
                  <div className="h-6 w-20 mx-auto bg-surface/40 rounded-full"></div>
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface/40"></div>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface/40"></div>
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

export default function ManageMenuClient() {
  const params = useParams();
  const menupages = params?.menupages as string;

  const menuUrl = menupages ? `/api/menu/${menupages}` : null;
  const { data, isLoading: swrLoading, error: swrError } = useSWR(menuUrl);
  const { toast } = useToast();

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize local menu state with SWR data
  useEffect(() => {
    if (data?.success) {
      const formattedMenu = data.data.map((item: any) => ({
        id: item._id,
        name: item.name,
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl,
        editing: false
      }));
      setMenu(formattedMenu);
      
      const uniqueCats = Array.from(new Set(formattedMenu.map((m: any) => m.category))) as string[];
      setCategories(uniqueCats.length > 0 ? uniqueCats : DEFAULT_CATEGORIES);
    }
  }, [data]);

  const initialLoading = swrLoading && !data;

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImgPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addItem = async () => {
    if (!itemName || !price || !category) {
      alert("Please fill all required fields!");
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = getUnsplashImage(itemName);

      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          finalImageUrl = uploadData.url;
        }
        setUploading(false);
      }

      const res = await fetch(`/api/menu/${menupages}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemName,
          price: parseFloat(price),
          category: category,
          imageUrl: finalImageUrl,
          isAvailable: true
        })
      });

      const data = await res.json();
      if (data.success) {
        mutate(menuUrl);
        setItemName("");
        setPrice("");
        setCategory("");
        setImgPreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Failed to add item:", err);
      alert("Error adding menu item.");
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = (id: string) => {
    setMenu(menu.map(item => {
      if (item.id === id) {
        return {
          ...item,
          editing: !item.editing,
          editName: item.name,
          editPrice: item.price,
          editCategory: item.category,
          editImageUrl: item.imageUrl,
          editImageFile: null
        };
      }
      return item;
    }));
  };

  const handleEditChange = (id: string, field: string, value: any) => {
    setMenu(menu.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleEditImageChange = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMenu(menu.map(item => {
          if (item.id === id) {
            return { ...item, editImageUrl: reader.result as string, editImageFile: file };
          }
          return item;
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveEdit = async (id: string) => {
    const item = menu.find(i => i.id === id);
    if (!item) return;

    setLoading(true);
    try {
      let finalImageUrl = item.editImageUrl ?? item.imageUrl;

      if (item.editImageFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', item.editImageFile);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          finalImageUrl = uploadData.url;
        }
        setUploading(false);
      }

      const res = await fetch(`/api/menu/${menupages}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: item.id,
          name: item.editName,
          price: item.editPrice,
          category: item.editCategory,
          imageUrl: finalImageUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        const updatedItem: MenuItem = {
          ...item,
          name: item.editName || item.name,
          price: item.editPrice ?? item.price,
          category: item.editCategory || item.category,
          imageUrl: finalImageUrl,
          editing: false,
          editImageFile: null,
        };
        setMenu((prev) => prev.map((menuItem) => menuItem.id === id ? updatedItem : menuItem));
        toast({ title: "Menu updated", description: "Menu item updated successfully." });
        mutate(menuUrl);
      } else {
        toast({ title: "Update failed", description: data.message || "Unable to update item.", variant: "destructive" as any });
      }
    } catch (err: any) {
      console.error("Failed to save edit:", err);
      toast({ title: "Error", description: err?.message || "Error updating menu item.", variant: "destructive" as any });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/menu/${menupages}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id })
      });

      const data = await res.json();
      if (data.success) {
        setMenu((prev) => prev.filter((item) => item.id !== id));
        toast({ title: "Menu deleted", description: "Menu item removed successfully." });
        mutate(menuUrl);
      } else {
        toast({ title: "Delete failed", description: data.message || "Unable to delete item.", variant: "destructive" as any });
      }
    } catch (err: any) {
      console.error("Failed to delete item:", err);
      toast({ title: "Error", description: err?.message || "Error deleting menu item.", variant: "destructive" as any });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 p-4 sm:p-6 w-full min-h-[600px] shadow-2xl shadow-primary/5">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/20">
            <UtensilsCrossed className="text-primary" size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text tracking-tight">Manage Menu</h2>
            <p className="text-xs text-muted/50 uppercase tracking-[0.15em]">Update your digital items</p>
          </div>
        </div>
        
        {loading && (
          <div className="flex items-center gap-2 px-4 py-2 bg-surface/30 border border-border/20 rounded-xl">
            <Loader2 className="text-primary animate-spin" size={16} />
            <span className="text-[10px] font-medium text-muted/60 uppercase tracking-wider">
              {uploading ? "Uploading Image..." : "Processing..."}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ─── Left Column: Add New Item Form ─── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface/20 border border-border/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 sticky top-4 shadow-xl shadow-primary/5">
            <h3 className="text-lg font-bold text-text mb-6 flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                <Plus className="text-primary" size={16} strokeWidth={3} />
              </div>
              Add New Item
            </h3>
            
            <div className="space-y-5">
              {/* Image Upload Area */}
              <div className="relative group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden
                    ${imgPreview ? "border-primary/30" : "border-border/40 hover:border-primary/50 bg-surface/10"}
                  `}
                >
                  {imgPreview ? (
                    <img src={imgPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <UploadCloud className="text-primary" size={22} />
                      </div>
                      <span className="text-[10px] font-medium text-muted/50 uppercase tracking-wider">Upload Photo</span>
                      <span className="text-[8px] text-muted/30">Click to browse</span>
                    </div>
                  )}
                  {imgPreview && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <span className="text-text text-xs font-medium uppercase tracking-wider border border-primary/30 px-3 py-1.5 rounded-lg bg-primary/10">Change Image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-muted/50 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                    <Star className="w-3 h-3 text-primary/50" />
                    Item Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Classic Margherita"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-surface/30 border border-border/40 rounded-xl px-4 py-3 text-sm font-medium text-text placeholder-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/50
                    [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                    [&:-webkit-autofill]:!text-[#F9FAFB] 
                    [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-muted/50 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-primary/50" />
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-surface/30 border border-border/40 rounded-xl px-4 py-3 text-sm font-medium text-text placeholder-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/50
                      [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                      [&:-webkit-autofill]:!text-[#F9FAFB] 
                      [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-muted/50 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-primary/50" />
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-surface/30 border border-border/40 rounded-xl px-4 py-3 text-sm font-medium text-text appearance-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/50 cursor-pointer
                        [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                        [&:-webkit-autofill]:!text-[#F9FAFB] 
                        [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)]"
                      >
                        <option value="" className="bg-card text-text">Select</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat} className="bg-card text-text">{cat}</option>
                        ))}
                        <option value="new" className="bg-card text-text">+ Add New</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/40 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                {category === "new" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <label className="text-[10px] font-medium text-muted/50 uppercase tracking-wider ml-1">New Category Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Beverages"
                      onBlur={(e) => {
                        if (e.target.value) {
                          setCategories([...categories, e.target.value]);
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full bg-surface/30 border border-border/40 rounded-xl px-4 py-3 text-sm font-medium text-text placeholder-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/50
                      [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                      [&:-webkit-autofill]:!text-[#F9FAFB] 
                      [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)]"
                    />
                  </motion.div>
                )}
              </div>

              <button
                onClick={addItem}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/90 text-background font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Add to Menu
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Menu Table ─── */}
        <div className="lg:col-span-8">
          {initialLoading ? (
            <MenuItemsSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-surface/10 rounded-3xl border border-dashed border-border/30">
              <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 mb-4">
                <X className="text-rose-400" size={32} />
              </div>
              <p className="text-muted/60 font-medium uppercase tracking-wider text-xs">{error}</p>
            </div>
          ) : menu.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-surface/10 rounded-3xl border border-dashed border-border/30">
              <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 mb-4">
                <UtensilsCrossed className="text-primary/30" size={40} />
              </div>
              <p className="text-text/60 font-medium uppercase tracking-wider text-xs">Your menu is empty</p>
              <p className="text-muted/40 text-xs mt-2">Start adding items using the form on the left</p>
            </div>
          ) : (
            <div className="bg-surface/20 border border-border/20 rounded-2xl p-1 overflow-hidden shadow-xl shadow-primary/5">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/20">
                      <th className="py-4 px-6 text-left text-[10px] font-bold text-muted/60 uppercase tracking-wider">Item Details</th>
                      <th className="py-4 px-6 text-center text-[10px] font-bold text-muted/60 uppercase tracking-wider">Price</th>
                      <th className="py-4 px-6 text-center text-[10px] font-bold text-muted/60 uppercase tracking-wider">Category</th>
                      <th className="py-4 px-6 text-center text-[10px] font-bold text-muted/60 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10 bg-card/30">
                    {menu.map((item, index) => (
                      <motion.tr 
                        key={item.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        className="hover:bg-surface/20 transition-colors duration-300 group"
                      >
                        <td className="py-4 px-6">
                          {item.editing ? (
                            <div className="flex items-center gap-4">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-border/30 flex-shrink-0">
                                <img src={item.editImageUrl} alt={item.editName} className="w-full h-full object-cover" />
                                <label className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl">
                                  <ImageIcon size={14} className="text-text" />
                                  <input type="file" className="hidden" onChange={(e) => handleEditImageChange(item.id, e)} />
                                </label>
                              </div>
                              <input
                                type="text"
                                value={item.editName}
                                onChange={(e) => handleEditChange(item.id, "editName", e.target.value)}
                                className="flex-1 bg-surface/30 border border-border/40 rounded-xl px-3 py-2 text-sm font-medium text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/50
                                [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                                [&:-webkit-autofill]:!text-[#F9FAFB] 
                                [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)]"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl overflow-hidden border border-border/20 flex-shrink-0 shadow-lg shadow-primary/5">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              </div>
                              <span className="text-sm font-semibold text-text">{item.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {item.editing ? (
                            <div className="relative inline-block">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40 font-bold text-xs">₹</span>
                              <input
                                type="number"
                                value={item.editPrice}
                                onChange={(e) => handleEditChange(item.id, "editPrice", parseFloat(e.target.value))}
                                className="w-24 bg-surface/30 border border-border/40 rounded-xl pl-7 pr-2 py-2 text-sm font-medium text-text text-center focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/50
                                [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                                [&:-webkit-autofill]:!text-[#F9FAFB] 
                                [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)]"
                              />
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-text">₹{item.price}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {item.editing ? (
                            <div className="relative inline-block">
                              <select
                                value={item.editCategory}
                                onChange={(e) => handleEditChange(item.id, "editCategory", e.target.value)}
                                className="w-32 bg-surface/30 border border-border/40 rounded-xl px-3 py-2 text-xs font-medium text-text appearance-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/50 cursor-pointer
                                [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                                [&:-webkit-autofill]:!text-[#F9FAFB] 
                                [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)]"
                              >
                                {categories.map(cat => (
                                  <option key={cat} value={cat} className="bg-card text-text">{cat}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/40 pointer-events-none" size={14} />
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary border border-primary/15 rounded-lg text-[10px] font-medium uppercase tracking-wider">
                              <Tag size={10} />
                              {item.category}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            {item.editing ? (
                              <>
                                <button
                                  onClick={() => saveEdit(item.id)}
                                  className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition-all duration-300 shadow-lg shadow-emerald-500/10"
                                  title="Save Changes"
                                >
                                  <Check size={18} strokeWidth={3} />
                                </button>
                                <button
                                  onClick={() => toggleEdit(item.id)}
                                  className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500/20 transition-all duration-300 shadow-lg shadow-rose-500/10"
                                  title="Cancel Edit"
                                >
                                  <X size={18} strokeWidth={3} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => toggleEdit(item.id)}
                                  className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all duration-300 shadow-lg shadow-primary/10"
                                  title="Edit Item"
                                >
                                  <Pencil size={16} strokeWidth={2.5} />
                                </button>
                                <button
                                  onClick={() => deleteItem(item.id)}
                                  className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500/20 transition-all duration-300 shadow-lg shadow-rose-500/10"
                                  title="Delete Item"
                                >
                                  <Trash2 size={16} strokeWidth={2.5} />
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
        </div>
      </div>
    </div>
  );
}