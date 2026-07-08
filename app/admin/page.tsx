"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { 
  Crown, 
  Plus, 
  Users, 
  Calendar, 
  Search, 
  Edit, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  Sparkles,
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  Key,
  Gift,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  Store,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TOAST SYSTEM
// ============================================
const Toast = ({ 
  message, 
  type = 'success', 
  onClose 
}: { 
  message: { title: string; description?: string }; 
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-sky-400" />
  };

  const gradients = {
    success: 'from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-500/30',
    error: 'from-rose-500/20 via-rose-500/10 to-transparent border-rose-500/30',
    info: 'from-sky-500/20 via-sky-500/10 to-transparent border-sky-500/30'
  };

  const progressColors = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    info: 'bg-sky-500'
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[type]} border backdrop-blur-xl shadow-2xl shadow-primary/10 min-w-[320px] max-w-md`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${type === 'success' ? 'text-emerald-400' : type === 'error' ? 'text-rose-400' : 'text-sky-400'}`}>
            {message.title}
          </p>
          {message.description && (
            <p className="text-sm text-text/70 mt-0.5">
              {message.description}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-text/40 hover:text-text/80 transition-all duration-300 hover:rotate-90"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <motion.div 
        className={`h-0.5 ${progressColors[type]}`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: "linear" }}
      />
    </motion.div>
  );
};

const ToastContainer = ({ 
  toasts, 
  removeToast 
}: { 
  toasts: Array<{ id: string; title: string; description?: string; type?: 'success' | 'error' | 'info' }>;
  removeToast: (id: string) => void;
}) => {
  return (
    <div className="fixed top-6 right-6 z-[9999] space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={{ title: toast.title, description: toast.description }}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// INTERFACE
// ============================================
interface Cafe {
  _id: string;
  cafeName: string;
  ownerName: string;
  email?: string;
  city: string;
  location: string;
  subscriptionPlan: string;
  contactNumber?: string;
  startDate: string;
  endDate: string;
  username: string;
  slug: string;
  isActive: boolean;
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function SuperAdmin() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [saving, setSaving] = useState(false);
  const [cafeName, setCafeName] = useState('');
  const [slug, setSlug] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [plan, setPlan] = useState('demo');
  const [showSuccess, setShowSuccess] = useState(false);
  const [menuLink, setMenuLink] = useState('');
  const [adminLink, setAdminLink] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editOwner, setEditOwner] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editSlug, setEditSlug] = useState<string>('');
  const [editEmail, setEditEmail] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPlan, setEditPlan] = useState('1');
  const [editEndDate, setEditEndDate] = useState('');
  const [editContactNumber, setEditContactNumber] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editStartDate, setEditStartDate] = useState('');

  // Toast state
  const [toasts, setToasts] = useState<Array<{id: string; title: string; description?: string; type?: 'success' | 'error' | 'info'}>>([]);

  const showToast = ({ title, description, type = 'success' }: { title: string; description?: string; type?: 'success' | 'error' | 'info' }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [cityFilter, setCityFilter] = useState<string>('All Cities');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const planLabelFromCode = (code: string) => {
    const map: Record<string, string> = {
      demo1: 'Demo (1 Day)',
      demo: 'Demo (7 Days)',
      '1': '1 Month',
      '3': '3 Months',
      '6': '6 Months',
      '12': '12 Months',
      lifetime: 'Lifetime',
    };
    return map[code] || 'Demo (7 Days)';
  };
  const planCodeFromLabel = (label: string) => {
    const rev: Record<string, string> = {
      'Demo (1 Day)': 'demo1',
      'Demo (7 Days)': 'demo',
      '1 Month': '1',
      '3 Months': '3',
      '6 Months': '6',
      '12 Months': '12',
      'Lifetime': 'lifetime',
    };
    return rev[label] || 'demo';
  };

  const modalRef = useRef<HTMLDivElement>(null);

  const paramsStr = new URLSearchParams();
  if (cityFilter && cityFilter !== 'All Cities') paramsStr.set('city', cityFilter);
  if (statusFilter === 'active' || statusFilter === 'inactive') paramsStr.set('status', statusFilter);
  if (debouncedSearch) paramsStr.set('search', debouncedSearch);
  const queryString = paramsStr.toString();
  const cafesUrl = activeTab === 'manage' ? `/api/cafes${queryString ? `?${queryString}` : ''}` : null;

  const { data: swrData, isLoading: loading, error } = useSWR(cafesUrl, {
     revalidateOnFocus: true,
     onSuccess: (data) => {
       if (data.success && data.data && cityFilter === 'All Cities') {
         const cities = data.data
           .map((c: Cafe) => c.city)
           .filter((city: string) => city && typeof city === 'string' && city.trim() !== '')
           .map((city: string) => city.trim());
         const unique = Array.from(new Set(cities)).sort();
         setCityOptions(unique as string[]);
       }
     }
   });

   const cafes: Cafe[] = swrData?.success ? swrData.data : [];
  const stats = swrData?.stats || { total: 0, active: 0, inactive: 0 };

  useEffect(() => {
    if (error) {
      showToast({
        title: "Failed to fetch cafes",
        description: error.message || "Please check your connection",
        type: "error"
      });
    }
  }, [error]);

  useEffect(() => {
    const refreshSession = async () => {
      const refreshUrl = '/api/auth/refresh';
        
      try {
        const res = await fetch(refreshUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({}),
        });
        if (!res.ok) {
          console.warn('Session refresh failed');
        }
      } catch (err) {
        console.error('Error refreshing session:', err);
      }
    };

    const interval = setInterval(refreshSession, 1000 * 60 * 30);
    refreshSession();

    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!startDate) return;

    const date = new Date(startDate);
    
    if (plan === 'demo1') {
      date.setDate(date.getDate() + 1);
    } else if (plan === 'demo') {
      date.setDate(date.getDate() + 7);
    } else {
      date.setMonth(date.getMonth() + parseInt(plan));
    }

    setEndDate(date.toISOString().split('T')[0]);
  }, [startDate, plan]);

  useEffect(() => {
    if (!editStartDate) return;

    const date = new Date(editStartDate);
    
    if (editPlan === 'demo1') {
      date.setDate(date.getDate() + 1);
    } else if (editPlan === 'demo') {
      date.setDate(date.getDate() + 7);
    } else if (editPlan === 'lifetime') {
      date.setFullYear(date.getFullYear() + 100);
    } else {
      date.setMonth(date.getMonth() + parseInt(editPlan));
    }

    setEditEndDate(date.toISOString().split('T')[0]);
  }, [editStartDate, editPlan]);

  const generateSlug = (name: string) => {
    const newSlug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    setSlug(newSlug);
  };

  const handleCafeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setCafeName(name);
    generateSlug(name);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;

    setSaving(true);
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const planMap: Record<string, string> = {
      demo1: 'Demo (1 Day)',
      demo: 'Demo (7 Days)',
      '1': '1 Month',
      '3': '3 Months',
      '6': '6 Months',
      '12': '12 Months',
    };
    const payload = {
      cafeName,
      ownerName: (fd.get('ownerName') as string) || '',
      email: (fd.get('email') as string) || '',
      city: (fd.get('city') as string) || '',
      location: (fd.get('location') as string) || '',
      subscriptionPlan: planMap[plan] || 'Demo (7 Days)',
      contactNumber: (fd.get('contactNumber') as string) || '',
      startDate,
      endDate,
      username: (fd.get('username') as string) || '',
      password: (fd.get('password') as string) || '',
    };

    fetch('/api/cafes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to create cafe');
        }
        const createdSlug = data?.data?.slug || slug;
        const fallbackBase = typeof window !== 'undefined' ? window.location.origin : 'https://thediningco.com';
        setMenuLink(data.links?.menu || `${fallbackBase}/${createdSlug}/menu`);
        setAdminLink(data.links?.admin || `${fallbackBase}/${createdSlug}/admin`);
        setShowSuccess(true);
        
        showToast({
          title: "Cafe Added Successfully",
          description: `${cafeName} has been created with ${planMap[plan]} plan`,
          type: "success"
        });
        
        setTimeout(() => {
          document.getElementById('successMsg')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        if (cafesUrl) mutate(cafesUrl);
        
        setCafeName('');
        setSlug('');
        form.reset();
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
      })
      .catch((err) => {
        showToast({
          title: "Failed to create cafe",
          description: err.message || 'Unknown error',
          type: "error"
        });
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const toggleCafeStatus = (slugValue: string, isActive: boolean) => {
    fetch(`/api/cafes/${slugValue}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isActive }),
    })
      .then((res) => {
        if (cafesUrl) mutate(cafesUrl);
        showToast({
          title: isActive ? "Cafe Activated" : "Cafe Deactivated",
          description: `Status updated successfully`,
          type: "success"
        });
      })
      .catch(() => {
        showToast({
          title: "Failed to update status",
          description: "Please try again",
          type: "error"
        });
      });
  };

  const openEditModal = (name: string, owner: string, city: string, email: string = '', location: string = '', currentPlan: string = '1', endDate: string = '', startDate: string = '', cafeSlug?: string, contactNumber: string = '', username: string = '') => {
    setEditName(name);
    setEditOwner(owner);
    setEditCity(city);
    setEditEmail(email);
    setEditLocation(location);
    setEditPlan(currentPlan);
    setEditEndDate(endDate);
    setEditContactNumber(contactNumber);
    setEditUsername(username);
    setEditStartDate(startDate || new Date().toISOString().split('T')[0]);
    if (cafeSlug) setEditSlug(cafeSlug);
    setShowModal(true);
  };

  const closeEditModal = () => {
    setShowModal(false);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const subscriptionPlan = planLabelFromCode(editPlan);
      const res = await fetch(`/api/cafes/${editSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cafeName: editName,
          ownerName: editOwner,
          city: editCity,
          email: editEmail,
          location: editLocation,
          subscriptionPlan,
          contactNumber: editContactNumber,
          username: editUsername,
          slug: editSlug,
          startDate: editStartDate,
          endDate: editEndDate,
        }),
      });
      if (res.status === 401) {
        router.push('/adminlogin');
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update');
      }
      closeEditModal();
      if (cafesUrl) mutate(cafesUrl);
      showToast({
        title: "Plan Extended Successfully",
        description: `${editName} now has ${subscriptionPlan} plan until ${new Date(editEndDate).toLocaleDateString()}`,
        type: "success"
      });
    } catch (e: any) {
      showToast({
        title: "Update Failed",
        description: e.message || 'Please try again',
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  if (!isClient) {
    return null;
  }

  // ============================================
  // FORM SECTION COMPONENTS - FIXED (NO BLINKING)
  // ============================================
  const FormSection = ({ 
    title, 
    icon: Icon, 
    children, 
    delay = 0 
  }: { 
    title: string; 
    icon: any; 
    children: React.ReactNode; 
    delay?: number;
  }) => (
    <div className="bg-surface/10 rounded-2xl p-6 border border-border/20">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h4 className="text-sm font-semibold text-text">{title}</h4>
        <div className="flex-1 h-px bg-border/20" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );

  const FormField = ({ 
    label, 
    name, 
    type = 'text', 
    placeholder, 
    required = false, 
    value, 
    onChange, 
    readOnly = false,
    icon: Icon,
    autoComplete = 'off'
  }: { 
    label: string; 
    name?: string; 
    type?: string; 
    placeholder?: string; 
    required?: boolean; 
    value?: string; 
    onChange?: (e: any) => void; 
    readOnly?: boolean;
    icon: any;
    autoComplete?: string;
  }) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <Icon className="w-3.5 h-3.5 text-primary/60" />
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        type={type}
        name={name}
        className="w-full h-[52px] px-4 bg-surface/30 border border-border/40 rounded-xl text-sm text-text placeholder-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/50 
        [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
        [&:-webkit-autofill]:!text-[#F9FAFB] 
        [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)] 
        [&:-webkit-autofill]:caret-text 
        [&:-webkit-autofill]:!border-primary/30
        [&:-webkit-autofill]:hover:!border-primary/50
        [&:-webkit-autofill]:focus:!border-primary
        [&:-webkit-autofill]:focus:!ring-2
        [&:-webkit-autofill]:focus:!ring-primary/20"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-background text-text font-sans antialiased relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* ===== HEADER ===== */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 bg-card/80 backdrop-blur-xl border border-border/40 rounded-2xl mb-8 shadow-2xl shadow-primary/5"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -5 }}
              className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/20"
            >
              <Crown className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
                The <span className="text-primary">Dining</span> Co.
              </h1>
              <p className="text-xs text-muted/50 uppercase tracking-[0.15em]">Super Admin Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface/20 rounded-xl border border-border/20">
              <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary/70 text-background rounded-full flex items-center justify-center text-xs font-bold shadow-lg shadow-primary/30">
                SA
              </div>
              <span className="text-sm text-muted/60 hidden sm:inline">Super Admin</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                } finally {
                  window.location.href = '/adminlogin';
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted/50 hover:text-text border border-border/30 rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group"
            >
              <LogOut className="w-4 h-4 group-hover:text-primary transition-colors" />
              <span className="group-hover:text-primary transition-colors hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </motion.header>

        {/* ===== CENTERED TABS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="relative flex p-1.5 bg-card/40 border border-border/30 rounded-2xl shadow-xl shadow-primary/5 w-full sm:w-auto">
            <div className="relative flex w-full sm:w-auto">
              <motion.div
                className="absolute top-1.5 bottom-1.5 w-1/2 bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-lg shadow-primary/30"
                animate={{ x: activeTab === 'add' ? 0 : '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              <button
                className={`relative z-10 flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-8 sm:px-12 py-3 rounded-xl text-sm font-medium transition-colors duration-300 ${
                  activeTab === 'add' ? 'text-background' : 'text-muted/50 hover:text-text'
                }`}
                onClick={() => setActiveTab('add')}
              >
                <Plus className="w-4 h-4" />
                <span>Add Cafes</span>
              </button>
              <button
                className={`relative z-10 flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-8 sm:px-12 py-3 rounded-xl text-sm font-medium transition-colors duration-300 ${
                  activeTab === 'manage' ? 'text-background' : 'text-muted/50 hover:text-text'
                }`}
                onClick={() => setActiveTab('manage')}
              >
                <Users className="w-4 h-4" />
                <span>Manage Cafes</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ===== ADD SECTION ===== */}
        <AnimatePresence mode="wait">
          {activeTab === 'add' && (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-6 lg:p-8 shadow-2xl shadow-primary/5">
                <div className="mb-8">
                  <h2 className="flex items-center gap-3 text-xl font-bold text-text">
                    <motion.div
                      animate={{ rotate: [0, 180, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5 text-primary" />
                    </motion.div>
                    Create New Cafe Profile
                  </h2>
                  <p className="text-sm text-muted/40 mt-1">Fill in the details below to add a new cafe to the platform</p>
                </div>

                <form onSubmit={handleCreateProfile}>
                  <FormSection title="Restaurant Information" icon={Store}>
                    <FormField
                      label="Cafe Name"
                      icon={Building2}
                      placeholder="e.g. Beans & Brews"
                      required
                      value={cafeName}
                      onChange={handleCafeNameChange}
                      autoComplete="off"
                    />
                    <FormField
                      label="Owner Name"
                      icon={User}
                      placeholder="Full Name"
                      required
                      name="ownerName"
                      autoComplete="off"
                    />
                    <FormField
                      label="Email ID"
                      icon={Mail}
                      type="email"
                      placeholder="owner@example.com"
                      required
                      name="email"
                      autoComplete="email"
                    />
                    <FormField
                      label="Contact Number"
                      icon={Phone}
                      placeholder="e.g. +91 98765 43210"
                      required
                      name="contactNumber"
                      autoComplete="tel"
                    />
                  </FormSection>

                  <FormSection title="Location Details" icon={MapPin}>
                    <FormField
                      label="City"
                      icon={MapPin}
                      placeholder="e.g. New York"
                      required
                      name="city"
                      autoComplete="address-level2"
                    />
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-muted">
                        <MapPin className="w-3.5 h-3.5 text-primary/60" />
                        Location (Full Address) <span className="text-primary">*</span>
                      </label>
                      <input
                        name="location"
                        className="w-full h-[52px] px-4 bg-surface/30 border border-border/40 rounded-xl text-sm text-text placeholder-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/50 
                        [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                        [&:-webkit-autofill]:!text-[#F9FAFB] 
                        [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)] 
                        [&:-webkit-autofill]:caret-text 
                        [&:-webkit-autofill]:!border-primary/30
                        [&:-webkit-autofill]:hover:!border-primary/50
                        [&:-webkit-autofill]:focus:!border-primary
                        [&:-webkit-autofill]:focus:!ring-2
                        [&:-webkit-autofill]:focus:!ring-primary/20"
                        placeholder="123 Street Name, City, State, ZIP"
                        required
                        autoComplete="street-address"
                      />
                    </div>
                  </FormSection>

                  <FormSection title="Subscription Details" icon={Gift}>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-muted">
                        <Gift className="w-3.5 h-3.5 text-primary/60" />
                        Subscription Plan <span className="text-primary">*</span>
                      </label>
                      <select
                        className="w-full h-[52px] px-4 bg-surface/30 border border-border/40 rounded-xl text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 appearance-none cursor-pointer hover:border-primary/50 
                        [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                        [&:-webkit-autofill]:!text-[#F9FAFB] 
                        [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)] 
                        [&:-webkit-autofill]:caret-text 
                        [&:-webkit-autofill]:!border-primary/30"
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                        required
                      >
                        <option value="demo1" className="bg-card text-text">Demo (1 Day)</option>
                        <option value="demo" className="bg-card text-text">Demo (7 Days)</option>
                        <option value="1" className="bg-card text-text">1 Month</option>
                        <option value="3" className="bg-card text-text">3 Months</option>
                        <option value="6" className="bg-card text-text">6 Months</option>
                        <option value="12" className="bg-card text-text">12 Months</option>
                      </select>
                    </div>
                    <FormField
                      label="Start Date"
                      icon={Calendar}
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      autoComplete="off"
                    />
                    <FormField
                      label="End Date"
                      icon={Calendar}
                      type="date"
                      value={endDate}
                      readOnly
                      autoComplete="off"
                    />
                    <FormField
                      label="Generated Slug"
                      icon={Key}
                      value={slug}
                      readOnly
                      autoComplete="off"
                    />
                  </FormSection>

                  <FormSection title="Login Credentials" icon={Shield}>
                    <FormField
                      label="Cafe Username"
                      icon={User}
                      placeholder="Login Username"
                      required
                      name="username"
                      autoComplete="username"
                    />
                    <FormField
                      label="Cafe Password"
                      icon={Key}
                      type="password"
                      placeholder="Login Password"
                      required
                      name="password"
                      autoComplete="new-password"
                    />
                  </FormSection>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="mt-8 w-full flex items-center justify-center gap-3 h-[56px] bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/90 text-background font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 text-base"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Create New Profile
                      </>
                    )}
                  </motion.button>
                </form>

                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 overflow-hidden"
                    >
                      <div className="flex items-start gap-4 p-5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-emerald-400 font-semibold">Cafe Profile Created Successfully!</h4>
                          <div className="mt-2 space-y-1.5 text-sm text-muted/60">
                            <div>
                              <span className="font-medium text-text/70">Menu Page:</span>{' '}
                              <a href={menuLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-colors">
                                {menuLink}
                              </a>
                            </div>
                            <div>
                              <span className="font-medium text-text/70">Admin Page:</span>{' '}
                              <a href={adminLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-colors">
                                {adminLink}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ===== MANAGE SECTION ===== */}
          {activeTab === 'manage' && (
            <motion.div
              key="manage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { 
                    icon: <Store className="w-5 h-5" />, 
                    value: stats?.total ?? 0, 
                    label: 'Total Cafes', 
                    color: 'primary',
                    subtitle: 'All registered cafes'
                  },
                  { 
                    icon: <CheckCircle className="w-5 h-5" />, 
                    value: stats?.active ?? 0, 
                    label: 'Active Cafes', 
                    color: 'emerald',
                    subtitle: 'Currently active'
                  },
                  { 
                    icon: <XCircle className="w-5 h-5" />, 
                    value: stats?.inactive ?? 0, 
                    label: 'Inactive Cafes', 
                    color: 'rose',
                    subtitle: 'Currently inactive'
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-6 text-center relative overflow-hidden shadow-xl shadow-primary/5 group"
                  >
                    <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${stat.color === 'primary' ? 'bg-primary/10 text-primary' : stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} group-hover:scale-110 transition-transform duration-300`}>
                      {stat.icon}
                    </div>
                    <h3 className={`text-3xl font-bold ${stat.color === 'primary' ? 'text-primary' : stat.color === 'emerald' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stat.value}
                    </h3>
                    <p className="text-sm text-text/70 mt-1 font-medium">{stat.label}</p>
                    <p className="text-xs text-muted/40 mt-0.5">{stat.subtitle}</p>
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${stat.color === 'primary' ? 'bg-primary' : stat.color === 'emerald' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  </motion.div>
                ))}
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/30 group-hover:text-muted/60 transition-colors duration-300" />
                  <input
                    className="w-full h-[52px] pl-11 pr-4 bg-card/40 border border-border/30 rounded-xl text-sm text-text placeholder-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/40 
                    [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                    [&:-webkit-autofill]:!text-[#F9FAFB] 
                    [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)] 
                    [&:-webkit-autofill]:caret-text 
                    [&:-webkit-autofill]:!border-primary/30"
                    placeholder="Search cafes, owner or city"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="h-[52px] px-4 bg-card/40 border border-border/30 rounded-xl text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 appearance-none cursor-pointer hover:border-primary/40 min-w-[140px] 
                  [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                  [&:-webkit-autofill]:!text-[#F9FAFB] 
                  [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)] 
                  [&:-webkit-autofill]:caret-text 
                  [&:-webkit-autofill]:!border-primary/30"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="All Cities" className="bg-card text-text">All Cities</option>
                  {cityOptions.map((city: string) => (
                    <option key={city} value={city} className="bg-card text-text">{city}</option>
                  ))}
                </select>
                <select
                  className="h-[52px] px-4 bg-card/40 border border-border/30 rounded-xl text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 appearance-none cursor-pointer hover:border-primary/40 min-w-[140px] 
                  [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                  [&:-webkit-autofill]:!text-[#F9FAFB] 
                  [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)] 
                  [&:-webkit-autofill]:caret-text 
                  [&:-webkit-autofill]:!border-primary/30"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all" className="bg-card text-text">All Status</option>
                  <option value="active" className="bg-card text-text">Active</option>
                  <option value="inactive" className="bg-card text-text">Inactive</option>
                </select>
              </div>

              {/* Table */}
              <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl overflow-hidden shadow-2xl shadow-primary/5">
                <div className="overflow-x-auto max-h-[550px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/20">
                  <table className="w-full min-w-[1000px]">
                    <thead className="bg-surface/30 sticky top-0 z-10 backdrop-blur-sm">
                      <tr>
                        {['Cafe Name', 'Owner', 'Contact', 'City', 'Plan', 'End Date', 'Status', 'Action'].map((header, i) => (
                          <th key={i} className="px-4 py-4 text-left text-xs font-semibold text-muted/40 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {loading && Array.from({ length: 5 }).map((_, i) => (
                        <tr key={`skeleton-${i}`}>
                          {Array.from({ length: 8 }).map((_, j) => (
                            <td key={j} className="px-4 py-4">
                              <div className="h-3.5 bg-surface/20 rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))}
                      {!loading && cafes.slice((page - 1) * pageSize, page * pageSize).map((cafe: Cafe, index) => {
                        const isExpired = cafe.subscriptionPlan !== 'Lifetime' && new Date(cafe.endDate) < new Date();
                        return (
                          <motion.tr
                            key={cafe._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.03 }}
                            className="hover:bg-surface/10 transition-colors duration-300 group"
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center">
                                  <Store className="w-3.5 h-3.5 text-primary/50" />
                                </div>
                                <span className="text-sm font-medium text-text">{cafe.cafeName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-text/70">{cafe.ownerName}</td>
                            <td className="px-4 py-4 text-sm text-muted/50">{cafe.contactNumber || '—'}</td>
                            <td className="px-4 py-4 text-sm text-muted/50">{cafe.city}</td>
                            <td className="px-4 py-4">
                              <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/15 rounded-full">
                                {cafe.subscriptionPlan}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-muted/50">
                              {cafe.subscriptionPlan === 'Lifetime' ? '♾️ Lifetime' : new Date(cafe.endDate).toISOString().split('T')[0]}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={!!cafe.isActive && !isExpired}
                                    onChange={(e) => toggleCafeStatus(cafe.slug, e.target.checked)}
                                    disabled={isExpired}
                                  />
                                  <div className={`w-10 h-5 bg-border/40 rounded-full peer peer-checked:bg-emerald-500/60 transition-all duration-300 ${isExpired ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                    <div className={`w-3.5 h-3.5 bg-white rounded-full transition-all duration-300 mt-0.75 ml-0.75 ${cafe.isActive && !isExpired ? 'translate-x-[22px] bg-emerald-400' : ''}`} />
                                  </div>
                                </label>
                                <span className={`text-xs font-medium ${cafe.isActive && !isExpired ? 'text-emerald-400' : isExpired ? 'text-rose-400' : 'text-muted/40'}`}>
                                  {cafe.isActive && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-background border border-primary/15 hover:border-primary rounded-xl text-xs font-medium transition-all duration-300"
                                disabled={saving}
                                onClick={() =>
                                  openEditModal(
                                    cafe.cafeName,
                                    cafe.ownerName,
                                    cafe.city,
                                    cafe.email || '',
                                    cafe.location,
                                    planCodeFromLabel(cafe.subscriptionPlan),
                                    new Date(cafe.endDate).toISOString().split('T')[0],
                                    new Date(cafe.startDate).toISOString().split('T')[0],
                                    cafe.slug,
                                    cafe.contactNumber || '',
                                    cafe.username || ''
                                  )
                                }
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Extend
                              </motion.button>
                            </td>
                          </motion.tr>
                        );
                      })}
                      {!loading && cafes.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-16 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                <Store className="w-10 h-10 text-primary/30" />
                              </div>
                              <h3 className="text-lg font-semibold text-text">No cafes found</h3>
                              <p className="text-sm text-muted/40 max-w-sm">Get started by creating your first cafe profile and managing your restaurant portfolio</p>
                              <button
                                onClick={() => setActiveTab('add')}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-medium hover:bg-primary hover:text-background transition-all duration-300"
                              >
                                <Plus className="w-4 h-4" />
                                Create Cafe
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-4 bg-surface/10 border-t border-border/20">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 px-4 py-2 bg-card/40 border border-border/30 rounded-xl text-sm text-muted/40 hover:text-text hover:border-primary/30 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </motion.button>
                  <span className="text-sm text-muted/40">
                    Page {page} of {Math.max(1, Math.ceil(cafes.length / pageSize))}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 px-4 py-2 bg-card/40 border border-border/30 rounded-xl text-sm text-muted/40 hover:text-text hover:border-primary/30 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => setPage((p) => (p < Math.ceil(cafes.length / pageSize)) ? p + 1 : p)}
                    disabled={page >= Math.ceil(cafes.length / pageSize)}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== EDIT MODAL - FIXED WITH BETTER SCROLLING ===== */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-card/90 backdrop-blur-sm border border-border/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl shadow-primary/10 flex flex-col"
                ref={modalRef}
              >
                {/* Modal Header - Fixed */}
                <div className="flex items-center justify-between p-6 bg-surface/20 border-b border-border/20 flex-shrink-0">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-text">
                    <Edit className="w-5 h-5 text-primary" />
                    Extend Subscription Plan
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeEditModal}
                    className="text-muted/40 hover:text-text transition-colors p-1 rounded-lg hover:bg-surface/20"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Modal Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(
                      [
                        { icon: Building2, label: 'Cafe Name', value: editName, setter: setEditName, autoComplete: 'off' },
                        { icon: User, label: 'Owner Name', value: editOwner, setter: setEditOwner, autoComplete: 'off' },
                        { icon: Mail, label: 'Email ID', value: editEmail, setter: setEditEmail, type: 'email', autoComplete: 'email' },
                        { icon: MapPin, label: 'City', value: editCity, setter: setEditCity, autoComplete: 'address-level2' },
                        { icon: MapPin, label: 'Location', value: editLocation, setter: setEditLocation, full: true, autoComplete: 'street-address' },
                        { icon: Gift, label: 'Subscription Plan', value: editPlan, setter: setEditPlan, type: 'select' },
                        { icon: Calendar, label: 'Start Date', value: editStartDate, setter: setEditStartDate, type: 'date' },
                        { icon: Calendar, label: 'New End Date', value: editEndDate, readOnly: true },
                        { icon: Phone, label: 'Contact Number', value: editContactNumber, setter: setEditContactNumber, autoComplete: 'tel' },
                        { icon: User, label: 'Username', value: editUsername, setter: setEditUsername, autoComplete: 'username' },
                        { icon: Key, label: 'Slug (URL ID)', value: editSlug, setter: setEditSlug, full: true, autoComplete: 'off' },
                      ] as Array<{
                        icon: any;
                        label: string;
                        value: string;
                        setter?: (value: string) => void;
                        type?: 'text' | 'email' | 'select' | 'date';
                        autoComplete?: string;
                        full?: boolean;
                        readOnly?: boolean;
                      }>
                    ).map((field, index) => (
                      <div 
                        key={index} 
                        className={`space-y-1.5 ${field.full ? 'sm:col-span-2' : ''}`}
                      >
                        <label className="flex items-center gap-1.5 text-xs font-medium text-muted">
                          <field.icon className="w-3.5 h-3.5 text-primary/50" />
                          {field.label}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            className="w-full h-[52px] px-4 bg-surface/30 border border-border/40 rounded-xl text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 appearance-none cursor-pointer hover:border-primary/50 
                            [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                            [&:-webkit-autofill]:!text-[#F9FAFB] 
                            [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)] 
                            [&:-webkit-autofill]:caret-text 
                            [&:-webkit-autofill]:!border-primary/30"
                            value={field.value}
                            onChange={(e) => {
                              if (field.setter) {
                                field.setter(e.target.value);
                              }
                            }}
                          >
                            <option value="demo1" className="bg-card text-text">Demo (1 Day)</option>
                            <option value="demo" className="bg-card text-text">Demo (7 Days)</option>
                            <option value="1" className="bg-card text-text">1 Month</option>
                            <option value="3" className="bg-card text-text">3 Months</option>
                            <option value="6" className="bg-card text-text">6 Months</option>
                            <option value="12" className="bg-card text-text">12 Months</option>
                            <option value="lifetime" className="bg-card text-text">Lifetime</option>
                          </select>
                        ) : field.readOnly ? (
                          <input
                            type="text"
                            className="w-full h-[52px] px-4 bg-surface/20 border border-border/30 rounded-xl text-sm text-text/40 cursor-not-allowed 
                            [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                            [&:-webkit-autofill]:!text-[#F9FAFB] 
                            [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)] 
                            [&:-webkit-autofill]:caret-text 
                            [&:-webkit-autofill]:!border-primary/30"
                            value={field.value}
                            readOnly
                          />
                        ) : field.type === 'date' ? (
                          <input
                            type="date"
                            className="w-full h-[52px] px-4 bg-surface/30 border border-border/40 rounded-xl text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/50 
                            [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                            [&:-webkit-autofill]:!text-[#F9FAFB] 
                            [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)] 
                            [&:-webkit-autofill]:caret-text 
                            [&:-webkit-autofill]:!border-primary/30"
                            value={field.value}
                            onChange={(e) => {
                              if (field.setter) {
                                field.setter(e.target.value);
                              }
                            }}
                          />
                        ) : (
                          <input
                            type={field.type || 'text'}
                            className="w-full h-[52px] px-4 bg-surface/30 border border-border/40 rounded-xl text-sm text-text placeholder-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/50 
                            [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                            [&:-webkit-autofill]:!text-[#F9FAFB] 
                            [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)] 
                            [&:-webkit-autofill]:caret-text 
                            [&:-webkit-autofill]:!border-primary/30"
                            value={field.value}
                            onChange={(e) => {
                              if (field.setter) {
                                field.setter(e.target.value);
                              }
                            }}
                            placeholder={field.label}
                            autoComplete={field.autoComplete}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Footer - Fixed at bottom with sticky positioning */}
                <div className="flex flex-col-reverse sm:flex-row items-center gap-3 p-6 bg-surface/20 border-t border-border/20 flex-shrink-0 sticky bottom-0 bg-card/95 backdrop-blur-sm">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeEditModal}
                    className="w-full sm:w-auto px-6 py-2.5 border border-border/30 rounded-xl text-sm font-medium text-muted/40 hover:text-text hover:border-primary/30 transition-all duration-300"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveChanges}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 h-[52px] px-8 bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/90 text-background font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed text-base"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Extend Plan
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.15);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.3);
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }

        /* Fix for select dropdown options */
        select option {
          background-color: #1E293B !important;
          color: #F9FAFB !important;
        }
        
        select optgroup {
          background-color: #1E293B !important;
          color: #F9FAFB !important;
        }
        
        /* Fix for select text color */
        select {
          color: #F9FAFB !important;
        }
        
        /* Fix for select placeholder */
        select:invalid {
          color: #9CA3AF !important;
        }
      `}</style>
    </div>
  );
}