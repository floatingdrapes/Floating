import React, { useState, useEffect, useRef } from 'react';
import { 
  X, LogIn, LogOut, Lock, Mail, Heading, Palette, Type, 
  ShoppingBag, Trash2, Edit2, Plus, Save, Check, 
  Layers, FolderOpen, Eye, Inbox, FileText, Link, HelpCircle,
  Database, RefreshCw, Copy, CheckCheck, UploadCloud, DownloadCloud,
  AlertCircle, ShieldCheck, Wifi, WifiOff, Sparkles, ExternalLink,
  Star, MessageSquare, Upload, User, Image as ImageIcon, Search,
  Filter, CheckCircle2, ArrowUpRight, Camera, Sliders
} from 'lucide-react';
import { 
  CurtainItem, 
  WallpaperItem, 
  SiteConfig, 
  BookingSubmission, 
  Testimonial, 
  UploadedImage, 
  DEFAULT_SITE_CONFIG, 
  PortfolioItem, 
  PORTFOLIO_DATA 
} from '../types';
import { BlindItem } from '../data/productsData';
import { motion, AnimatePresence } from 'motion/react';
import CustomerAvatar from './CustomerAvatar';
import { 
  getSupabaseCredentials,
  getSupabaseClient,
  saveSupabaseCredentials,
  clearStoredSupabaseCredentials,
  isSupabaseConfigured,
  testSupabaseConnection,
  fetchUniversalSiteData,
  syncSiteConfigToSupabase,
  upsertCurtainToSupabase,
  deleteCurtainFromSupabase,
  upsertWallpaperToSupabase,
  deleteWallpaperFromSupabase,
  upsertBlindToSupabase,
  deleteBlindFromSupabase,
  upsertFeedbackToSupabase,
  deleteFeedbackFromSupabase,
  upsertTransformationToSupabase,
  deleteTransformationFromSupabase,
  syncAllTransformationsToSupabase,
  deleteBookingFromSupabase,
  deleteInquiryFromSupabase,
  seedDefaultCatalogToSupabase,
  uploadImageToSupabase,
  importImageFromUrlToSupabase,
  fetchUploadedImagesFromSupabase,
  deleteUploadedImageFromSupabase,
  getStoredUploadedImages,
  SUPABASE_SQL_SCHEMA
} from '../services/supabaseClient';
import { normalizeGoogleDriveUrl, isGoogleDriveUrl, extractGoogleDriveFileId } from '../utils/googleDrive';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  onUpdateConfig: (config: SiteConfig) => void;
  curtains: CurtainItem[];
  setCurtains: React.Dispatch<React.SetStateAction<CurtainItem[]>>;
  wallpapers: WallpaperItem[];
  setWallpapers: React.Dispatch<React.SetStateAction<WallpaperItem[]>>;
  blinds: BlindItem[];
  setBlinds: React.Dispatch<React.SetStateAction<BlindItem[]>>;
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
}

export default function AdminPanel({
  isOpen,
  onClose,
  siteConfig,
  onUpdateConfig,
  curtains,
  setCurtains,
  wallpapers,
  setWallpapers,
  blinds,
  setBlinds,
  testimonials,
  setTestimonials
}: AdminPanelProps) {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Inactivity auto-logout timer ref (15 minutes limit)
  const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active control panel tab
  const [activeTab, setActiveTab] = useState<'sections' | 'captions' | 'theme' | 'products' | 'media' | 'feedback' | 'beforeAfter' | 'inquiries' | 'database'>('sections');

  // Media Library & Image Uploading states
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState<string>('all');
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');
  const [copiedMediaId, setCopiedMediaId] = useState<string | null>(null);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<'curtains' | 'wallpapers' | 'blinds' | 'hero' | 'gallery' | 'general'>('general');
  const [uploadTitle, setUploadTitle] = useState('');
  const [previewModalImage, setPreviewModalImage] = useState<UploadedImage | null>(null);
  const [isUploadingProductInline, setIsUploadingProductInline] = useState(false);
  const [mediaUploadMode, setMediaUploadMode] = useState<'file' | 'gdrive'>('file');
  const [importDriveUrl, setImportDriveUrl] = useState('');
  const [isImportingDriveUrl, setIsImportingDriveUrl] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'before' | 'after' | 'product' | 'curtainsCustomization' | 'wallpaperCustomization' | 'whyChooseUs' | 'feedback' | null>(null);

  // Captions form state
  const [captions, setCaptions] = useState<SiteConfig>({ ...siteConfig });

  // Product tab states
  const [selectedProductCategory, setSelectedProductCategory] = useState<'curtains' | 'wallpapers' | 'blinds'>('curtains');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // New product form states
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    description: '',
    image: '',
    priceClass: 'Premium', // curtains
    style: 'Classic', // wallpapers / blinds
    materials: ''
  });

  // Feedback Master Controller states
  const [editingFeedback, setEditingFeedback] = useState<Testimonial | null>(null);
  const [isAddingFeedback, setIsAddingFeedback] = useState(false);
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState('');
  const [isUploadingFeedbackImage, setIsUploadingFeedbackImage] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState<Testimonial>({
    id: '',
    name: '',
    location: '',
    role: '',
    review: '',
    rating: 5,
    image: ''
  });

  // BEFORE & AFTER MASTER CONTROLLER STATES
  const [portfolioList, setPortfolioList] = useState<PortfolioItem[]>(siteConfig.portfolioData || PORTFOLIO_DATA);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | null>(null);
  const [isAddingPortfolioItem, setIsAddingPortfolioItem] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState<PortfolioItem>({
    id: '',
    category: 'Living Room',
    title: '',
    description: '',
    beforeImage: '',
    afterImage: ''
  });
  const [isUploadingBeforeImage, setIsUploadingBeforeImage] = useState(false);
  const [isUploadingAfterImage, setIsUploadingAfterImage] = useState(false);
  const [beforeAfterSuccessMsg, setBeforeAfterSuccessMsg] = useState('');

  // Submitted private bookings state & contact inquiries state
  const [bookings, setBookings] = useState<BookingSubmission[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Supabase connection and configuration states
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isSupabaseFromEnv, setIsSupabaseFromEnv] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'disconnected' | 'testing' | 'unconfigured'>('unconfigured');
  const [supabaseStatusMessage, setSupabaseStatusMessage] = useState('');
  const [isSeedingDatabase, setIsSeedingDatabase] = useState(false);
  const [isPullingData, setIsPullingData] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [imagesConfigCopied, setImagesConfigCopied] = useState(false);

  // Reset inactivity timer on user actions
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (isAuthenticated) {
      inactivityTimerRef.current = setTimeout(() => {
        handleLogout();
        alert('You have been logged out of the Admin Panel due to 15 minutes of inactivity.');
      }, INACTIVITY_TIMEOUT_MS);
    }
  };

  // Activity listeners for automatic logout
  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetInactivityTimer();

    activityEvents.forEach((evt) => window.addEventListener(evt, handleActivity));
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, [isAuthenticated]);

  // Verify server session token or active Supabase session on mount/open
  useEffect(() => {
    const token = sessionStorage.getItem('fd_admin_token');

    // Check if Supabase client already has an active session
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user) {
          setIsAuthenticated(true);
          sessionStorage.setItem('fd_admin_user_email', data.session.user.email || '');
          setIsVerifyingSession(false);
          return;
        }
      }).catch((e) => console.warn('Supabase getSession error:', e));
    }

    if (!token) {
      setIsAuthenticated(false);
      setIsVerifyingSession(false);
      return;
    }

    // If token is a Supabase session token
    if (token.startsWith('sb.')) {
      setIsAuthenticated(true);
      setIsVerifyingSession(false);
      return;
    }

    fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.valid) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem('fd_admin_token');
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsVerifyingSession(false);
      });
  }, [isOpen]);

  // 1. Sync captions & portfolioList from siteConfig prop ONLY when not actively editing a card
  useEffect(() => {
    if (!siteConfig) return;
    setCaptions(prev => ({
      ...DEFAULT_SITE_CONFIG,
      ...prev,
      ...siteConfig,
      categoryShowcase: {
        curtains: {
          ...DEFAULT_SITE_CONFIG.categoryShowcase!.curtains,
          ...(siteConfig?.categoryShowcase?.curtains || {})
        },
        wallpapers: {
          ...DEFAULT_SITE_CONFIG.categoryShowcase!.wallpapers,
          ...(siteConfig?.categoryShowcase?.wallpapers || {})
        },
        blinds: {
          ...DEFAULT_SITE_CONFIG.categoryShowcase!.blinds,
          ...(siteConfig?.categoryShowcase?.blinds || {})
        }
      }
    }));

    if (!isAddingPortfolioItem && !editingPortfolioItem && siteConfig.portfolioData && siteConfig.portfolioData.length > 0) {
      setPortfolioList(siteConfig.portfolioData);
    }
  }, [siteConfig, isAddingPortfolioItem, editingPortfolioItem]);

  // 2. Load Supabase credentials & initial data on mount/open ONLY (not on every siteConfig edit)
  useEffect(() => {
    if (!isOpen) return;

    // Load stored credentials
    const creds = getSupabaseCredentials();
    setSupabaseUrl(creds.url);
    setSupabaseKey(creds.key);
    setIsSupabaseFromEnv(creds.isFromEnv);

    if (creds.url && creds.key) {
      setSupabaseStatus('testing');
      testSupabaseConnection().then(res => {
        if (res.success) {
          setSupabaseStatus('connected');
          setSupabaseStatusMessage(res.message);
        } else {
          setSupabaseStatus('disconnected');
          setSupabaseStatusMessage(res.message);
        }
      });
    } else {
      setSupabaseStatus('unconfigured');
      setSupabaseStatusMessage('Supabase credentials have not been configured yet.');
    }

    // Load local storage bookings as fallback
    const storedBookings = localStorage.getItem('floatingdrapes_bookings');
    if (storedBookings) {
      try {
        setBookings(JSON.parse(storedBookings));
      } catch (e) {
        console.error(e);
      }
    }

    // Load local storage contact inquiries as fallback
    const storedContacts = localStorage.getItem('floatingdrapes_contacts');
    if (storedContacts) {
      try {
        setInquiries(JSON.parse(storedContacts));
      } catch (e) {
        console.error(e);
      }
    }

    // Load local storage transformations as fallback
    const storedTransformations = localStorage.getItem('floatingdrapes_transformations');
    if (storedTransformations) {
      try {
        const parsedTransformations = JSON.parse(storedTransformations);
        if (Array.isArray(parsedTransformations) && parsedTransformations.length > 0) {
          setPortfolioList(parsedTransformations);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load uploaded media images from Supabase or local cache
    fetchUploadedImagesFromSupabase().then(images => {
      if (images) {
        setUploadedImages(images);
      }
    });

    // If Supabase is configured, fetch live records once on panel open
    if (isSupabaseConfigured()) {
      fetchUniversalSiteData().then(data => {
        if (data.bookings && data.bookings.length > 0) {
          setBookings(data.bookings);
        }
        if (data.inquiries && data.inquiries.length > 0) {
          setInquiries(data.inquiries);
        }
        if (data.testimonials && data.testimonials.length > 0) {
          setTestimonials(data.testimonials);
        }
        if (data.transformations && data.transformations.length > 0) {
          setPortfolioList(data.transformations);
        } else if (data.siteConfig?.portfolioData && data.siteConfig.portfolioData.length > 0) {
          setPortfolioList(data.siteConfig.portfolioData);
        }
      });
    }
  }, [isOpen]);

  // Database connection indicating light helper
  const renderIndicatorLight = (size: 'sm' | 'md' = 'sm') => {
    const isGreen = supabaseStatus === 'connected';
    const isYellow = supabaseStatus === 'testing';
    const dotSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5';
    const pingSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

    return (
      <div 
        className="relative inline-flex items-center justify-center cursor-default"
        title={isGreen ? 'Database: Connected (Green)' : isYellow ? 'Database: Trying to connect / checking (Yellow)' : 'Database: Disconnected (Red)'}
      >
        {isGreen && (
          <>
            <span className={`animate-ping absolute inline-flex ${pingSize} rounded-full bg-emerald-400 opacity-75`} />
            <span className={`relative inline-flex rounded-full ${dotSize} bg-emerald-500 shadow-[0_0_10px_#10b981]`} />
          </>
        )}
        {isYellow && (
          <>
            <span className={`animate-ping absolute inline-flex ${pingSize} rounded-full bg-amber-400 opacity-75`} />
            <span className={`relative inline-flex rounded-full ${dotSize} bg-amber-400 shadow-[0_0_10px_#f59e0b]`} />
          </>
        )}
        {!isGreen && !isYellow && (
          <span className={`relative inline-flex rounded-full ${dotSize} bg-rose-500 shadow-[0_0_8px_#f43f5e]`} />
        )}
      </div>
    );
  };

  // Handle Login via Supabase Auth or Backend API
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmittingLogin(true);

    const cleanEmail = email.trim();

    try {
      // 1. Direct Supabase Auth Verification First (if client is active)
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password,
          });

          if (!sbError && sbData?.user) {
            const timestamp = Date.now();
            sessionStorage.setItem('fd_admin_token', `sb.${timestamp}.${sbData.user.id}`);
            sessionStorage.setItem('fd_admin_user_email', sbData.user.email || cleanEmail);
            setIsAuthenticated(true);
            setAuthError('');
            setPassword('');
            setIsSubmittingLogin(false);
            resetInactivityTimer();
            return;
          }
        } catch (supabaseLoginErr: any) {
          console.warn('Supabase client login attempt:', supabaseLoginErr?.message);
        }
      }

      // 2. Fallback to Server Login Endpoint
      const creds = getSupabaseCredentials();
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: cleanEmail, 
          password,
          customSupabaseUrl: creds.url,
          customSupabaseKey: creds.key
        })
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`API endpoint unavailable (Status: ${res.status}).`);
      }

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        sessionStorage.setItem('fd_admin_token', data.token);
        if (data.user?.email) {
          sessionStorage.setItem('fd_admin_user_email', data.user.email);
        }
        setIsAuthenticated(true);
        setAuthError('');
        setPassword('');
        resetInactivityTimer();
      } else {
        setAuthError(data.error || 'Invalid credentials. User not found in Supabase Auth or server.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Sign out:', e);
    }
    setIsAuthenticated(false);
    sessionStorage.removeItem('fd_admin_token');
    sessionStorage.removeItem('fd_admin_user_email');
    localStorage.removeItem('floatingdrapes_admin_auth');
  };

  // Save Site Captions & sync to Supabase universally
  const handleSaveCaptions = async () => {
    onUpdateConfig(captions);
    localStorage.setItem('floatingdrapes_config', JSON.stringify(captions));

    if (isSupabaseConfigured()) {
      const success = await syncSiteConfigToSupabase(captions);
      if (success) {
        alert('Captions and site configuration saved universally to Supabase!');
      } else {
        alert('Saved locally. Note: Supabase database sync encountered an issue. Check connection settings in the Database tab.');
      }
    } else {
      alert('Captions saved locally! (Connect Supabase in the Database tab to sync universally).');
    }
  };

  // Save Theme & Fonts & sync to Supabase universally
  const handleSaveTheme = async (themePreset: 'sapphire' | 'amber' | 'emerald' | 'crimson' | 'obsidian', fontPreset: 'jakarta_playfair' | 'inter_cinzel' | 'outfit_bodoni') => {
    const updated = {
      ...captions,
      themePreset,
      fontPreset
    };
    setCaptions(updated);
    onUpdateConfig(updated);
    localStorage.setItem('floatingdrapes_config', JSON.stringify(updated));

    if (isSupabaseConfigured()) {
      await syncSiteConfigToSupabase(updated);
    }
  };

  // Update Brand Logo Link & sync to Supabase universally
  const handleSaveLogo = async (logoUrl: string) => {
    const updated = {
      ...captions,
      brandLogoUrl: logoUrl
    };
    setCaptions(updated);
    onUpdateConfig(updated);
    localStorage.setItem('floatingdrapes_config', JSON.stringify(updated));

    if (isSupabaseConfigured()) {
      await syncSiteConfigToSupabase(updated);
      alert('Brand logo link updated and synchronized universally in Supabase!');
    } else {
      alert('Brand logo link updated successfully!');
    }
  };

  // Save all Showcase & Page Sections universally
  const handleSaveShowcaseSections = async () => {
    onUpdateConfig(captions);
    localStorage.setItem('floatingdrapes_config', JSON.stringify(captions));

    if (isSupabaseConfigured()) {
      const success = await syncSiteConfigToSupabase(captions);
      if (success) {
        alert('All Homepage & Section changes (Hero Image, 3 Showcase Thumbnails, Why Choose Us, Customization) saved and synced universally to Supabase!');
      } else {
        alert('Saved locally. Note: Supabase database sync encountered an issue. Check connection in the Database tab.');
      }
    } else {
      alert('Homepage & Section changes saved locally! (Connect Supabase to sync universally).');
    }
  };

  // Upload Homepage Hero Image
  const handleUploadHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadImageToSupabase(file, {
        category: 'hero',
        title: 'Homepage Hero Luxury Living Room'
      });

      if (res.data?.file_url) {
        const newUrl = res.data.file_url;
        const updated: SiteConfig = {
          ...captions,
          heroImageUrl: newUrl
        };
        setCaptions(updated);
        onUpdateConfig(updated);
        localStorage.setItem('floatingdrapes_config', JSON.stringify(updated));
        if (isSupabaseConfigured()) {
          await syncSiteConfigToSupabase(updated);
        }
        const fresh = await fetchUploadedImagesFromSupabase();
        setUploadedImages(fresh);
        alert('Homepage Hero photo uploaded and synced universally to Supabase!');
      }
    } catch (err: any) {
      alert('Error uploading hero image: ' + (err?.message || 'Upload failed'));
    }
  };

  // Upload Dedicated Showcase Thumbnail
  const handleUploadShowcaseThumbnail = async (
    category: 'curtains' | 'wallpapers' | 'blinds',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadImageToSupabase(file, {
        category: category,
        title: `${category} showcase card thumbnail`
      });

      if (res.data?.file_url) {
        const newUrl = res.data.file_url;
        const baseShowcase = captions.categoryShowcase || DEFAULT_SITE_CONFIG.categoryShowcase!;
        const currentItem = baseShowcase[category] || DEFAULT_SITE_CONFIG.categoryShowcase![category];

        const updated: SiteConfig = {
          ...captions,
          categoryShowcase: {
            ...baseShowcase,
            [category]: {
              ...currentItem,
              thumbnail: newUrl
            }
          },
          categoryImages: {
            ...(captions.categoryImages || {}),
            [category]: newUrl
          }
        };

        setCaptions(updated);
        onUpdateConfig(updated);
        localStorage.setItem('floatingdrapes_config', JSON.stringify(updated));
        if (isSupabaseConfigured()) {
          await syncSiteConfigToSupabase(updated);
        }
        const fresh = await fetchUploadedImagesFromSupabase();
        setUploadedImages(fresh);
        alert(`${category.toUpperCase()} dedicated thumbnail updated and synced universally to Supabase!`);
      }
    } catch (err: any) {
      alert('Error uploading thumbnail: ' + (err?.message || 'Upload failed'));
    }
  };

  // Upload Tailor-Made Customization Image
  const handleUploadCustomizationImage = async (
    type: 'curtains' | 'wallpaper',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadImageToSupabase(file, {
        category: type === 'curtains' ? 'curtains' : 'wallpapers',
        title: `Tailor-Made Customization ${type}`
      });

      if (res.data?.file_url) {
        const newUrl = res.data.file_url;
        const updated: SiteConfig = {
          ...captions,
          [type === 'curtains' ? 'customizationCurtainsImage' : 'customizationWallpaperImage']: newUrl
        };

        setCaptions(updated);
        onUpdateConfig(updated);
        localStorage.setItem('floatingdrapes_config', JSON.stringify(updated));
        if (isSupabaseConfigured()) {
          await syncSiteConfigToSupabase(updated);
        }
        const fresh = await fetchUploadedImagesFromSupabase();
        setUploadedImages(fresh);
        alert(`Tailor-Made ${type.toUpperCase()} customization image updated and synced universally to Supabase!`);
      }
    } catch (err: any) {
      alert('Error uploading customization photo: ' + (err?.message || 'Upload failed'));
    }
  };

  // Upload Why Choose Us Section Image
  const handleUploadWhyChooseUsImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadImageToSupabase(file, {
        category: 'why_choose_us',
        title: 'Why Choose Us Luxury Drapes Feature'
      });

      if (res.data?.file_url) {
        const newUrl = res.data.file_url;
        const updated: SiteConfig = {
          ...captions,
          whyChooseUsImageUrl: newUrl
        };

        setCaptions(updated);
        onUpdateConfig(updated);
        localStorage.setItem('floatingdrapes_config', JSON.stringify(updated));
        if (isSupabaseConfigured()) {
          await syncSiteConfigToSupabase(updated);
        }
        const fresh = await fetchUploadedImagesFromSupabase();
        setUploadedImages(fresh);
        alert('Why Choose Us showcase photo uploaded and synced universally to Supabase!');
      }
    } catch (err: any) {
      alert('Error uploading Why Choose Us photo: ' + (err?.message || 'Upload failed'));
    }
  };

  // Delete Product from local state and Supabase
  const handleDeleteProduct = async (id: string, category: 'curtains' | 'wallpapers' | 'blinds') => {
    if (!window.confirm('Are you absolutely sure you want to delete this product?')) return;

    if (category === 'curtains') {
      const updated = curtains.filter(p => p.id !== id);
      setCurtains(updated);
      localStorage.setItem('floatingdrapes_curtains', JSON.stringify(updated));
      if (isSupabaseConfigured()) {
        await deleteCurtainFromSupabase(id);
      }
    } else if (category === 'wallpapers') {
      const updated = wallpapers.filter(p => p.id !== id);
      setWallpapers(updated);
      localStorage.setItem('floatingdrapes_wallpapers', JSON.stringify(updated));
      if (isSupabaseConfigured()) {
        await deleteWallpaperFromSupabase(id);
      }
    } else {
      const updated = blinds.filter(p => p.id !== id);
      setBlinds(updated);
      localStorage.setItem('floatingdrapes_blinds', JSON.stringify(updated));
      if (isSupabaseConfigured()) {
        await deleteBlindFromSupabase(id);
      }
    }
  };

  // Save / Edit Product & sync to Supabase
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const materialsArray = productForm.materials
      ? productForm.materials.split(',').map(m => m.trim()).filter(m => m !== '')
      : [];

    const normalizedImage = normalizeGoogleDriveUrl(productForm.image);

    if (isAddingProduct) {
      const newId = selectedProductCategory[0] + '-' + Date.now();
      const newProduct: any = {
        id: newId,
        name: productForm.name,
        description: productForm.description,
        image: normalizedImage || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
        materials: materialsArray
      };

      if (selectedProductCategory === 'curtains') {
        newProduct.priceClass = productForm.priceClass;
        const updated = [newProduct, ...curtains];
        setCurtains(updated);
        localStorage.setItem('floatingdrapes_curtains', JSON.stringify(updated));
        if (isSupabaseConfigured()) {
          await upsertCurtainToSupabase(newProduct);
        }
      } else if (selectedProductCategory === 'wallpapers') {
        newProduct.style = productForm.style;
        const updated = [newProduct, ...wallpapers];
        setWallpapers(updated);
        localStorage.setItem('floatingdrapes_wallpapers', JSON.stringify(updated));
        if (isSupabaseConfigured()) {
          await upsertWallpaperToSupabase(newProduct);
        }
      } else {
        newProduct.style = productForm.style;
        const updated = [newProduct, ...blinds];
        setBlinds(updated);
        localStorage.setItem('floatingdrapes_blinds', JSON.stringify(updated));
        if (isSupabaseConfigured()) {
          await upsertBlindToSupabase(newProduct);
        }
      }

      alert('New product added to catalog and synchronized universally!');
    } else if (editingProduct) {
      let syncSuccess = false;
      if (selectedProductCategory === 'curtains') {
        const updatedItem: CurtainItem = {
          ...editingProduct,
          name: productForm.name,
          description: productForm.description,
          image: normalizedImage,
          priceClass: productForm.priceClass as any,
          materials: materialsArray
        };
        const updated = curtains.map(p => p.id === editingProduct.id ? updatedItem : p);
        setCurtains(updated);
        localStorage.setItem('floatingdrapes_curtains', JSON.stringify(updated));
        if (isSupabaseConfigured()) {
          syncSuccess = await upsertCurtainToSupabase(updatedItem);
        }
      } else if (selectedProductCategory === 'wallpapers') {
        const updatedItem: WallpaperItem = {
          ...editingProduct,
          name: productForm.name,
          description: productForm.description,
          image: normalizedImage,
          style: productForm.style as any,
          materials: materialsArray
        };
        const updated = wallpapers.map(p => p.id === editingProduct.id ? updatedItem : p);
        setWallpapers(updated);
        localStorage.setItem('floatingdrapes_wallpapers', JSON.stringify(updated));
        if (isSupabaseConfigured()) {
          syncSuccess = await upsertWallpaperToSupabase(updatedItem);
        }
      } else {
        const updatedItem: BlindItem = {
          ...editingProduct,
          name: productForm.name,
          description: productForm.description,
          image: normalizedImage,
          style: productForm.style as any,
          materials: materialsArray
        };
        const updated = blinds.map(p => p.id === editingProduct.id ? updatedItem : p);
        setBlinds(updated);
        localStorage.setItem('floatingdrapes_blinds', JSON.stringify(updated));
        if (isSupabaseConfigured()) {
          syncSuccess = await upsertBlindToSupabase(updatedItem);
        }
      }

      if (isSupabaseConfigured()) {
        if (syncSuccess) {
          alert(`"${productForm.name}" updated directly in Supabase database! Live on all devices.`);
        } else {
          alert(`"${productForm.name}" saved! (Note: Check Database tab to ensure table permissions are active).`);
        }
      } else {
        alert(`"${productForm.name}" saved locally. (Connect Supabase in Database tab to sync to your database).`);
      }
    }

    setIsAddingProduct(false);
    setEditingProduct(null);
  };

  const startEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setIsAddingProduct(false);
    setProductForm({
      id: prod.id,
      name: prod.name,
      description: prod.description,
      image: prod.image,
      priceClass: prod.priceClass || 'Premium',
      style: prod.style || 'Classic',
      materials: prod.materials ? (Array.isArray(prod.materials) ? prod.materials.join(', ') : String(prod.materials)) : ''
    });
  };

  const startAddProduct = () => {
    setIsAddingProduct(true);
    setEditingProduct(null);
    setProductForm({
      id: '',
      name: '',
      description: '',
      image: '',
      priceClass: 'Premium',
      style: selectedProductCategory === 'wallpapers' ? 'Classic' : 'Roman',
      materials: ''
    });
  };

  // Feedback Master Controller Handlers
  const handleStartAddFeedback = () => {
    setEditingFeedback(null);
    setIsAddingFeedback(true);
    setFeedbackForm({
      id: `t_${Date.now()}`,
      name: '',
      location: 'Coimbatore',
      role: '',
      review: '',
      rating: 5,
      image: ''
    });
  };

  const handleStartEditFeedback = (item: Testimonial) => {
    setIsAddingFeedback(false);
    setEditingFeedback(item);
    setFeedbackForm({
      id: item.id,
      name: item.name,
      location: item.location || '',
      role: item.role || '',
      review: item.review,
      rating: item.rating || 5,
      image: item.image || ''
    });
  };

  // Upload image to Supabase for Testimonials
  const handleFeedbackImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Please select an image smaller than 20MB.');
      return;
    }

    setIsUploadingFeedbackImage(true);
    try {
      const res = await uploadImageToSupabase(file, {
        category: 'gallery',
        title: `Customer - ${feedbackForm.name || 'Client'}`
      });

      if (res.data?.file_url) {
        setFeedbackForm(prev => ({ ...prev, image: res.data!.file_url }));
        const fresh = await fetchUploadedImagesFromSupabase();
        setUploadedImages(fresh);
        alert('Testimonial avatar photo uploaded directly to Supabase Storage!');
      } else {
        alert(res.message || 'Upload completed.');
      }
    } catch (err: any) {
      alert('Error uploading photo to Supabase: ' + (err?.message || 'Failed'));
    } finally {
      setIsUploadingFeedbackImage(false);
    }
  };

  const handleRemoveFeedbackPhoto = () => {
    setFeedbackForm(prev => ({ ...prev, image: '' }));
  };

  // Save / Update Testimonial in Supabase table 'testimonials'
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.name.trim() || !feedbackForm.review.trim()) {
      alert('Please fill in both the customer name and review text.');
      return;
    }

    const itemToSave: Testimonial = {
      id: feedbackForm.id || `t_${Date.now()}`,
      name: feedbackForm.name.trim(),
      location: feedbackForm.location?.trim() || 'Coimbatore',
      role: feedbackForm.role?.trim() || '',
      review: feedbackForm.review.trim(),
      rating: Number(feedbackForm.rating) || 5,
      image: feedbackForm.image?.trim() || ''
    };

    let updatedList: Testimonial[];
    if (isAddingFeedback) {
      updatedList = [itemToSave, ...testimonials];
    } else {
      updatedList = testimonials.map(t => t.id === itemToSave.id ? itemToSave : t);
    }

    setTestimonials(updatedList);
    localStorage.setItem('floatingdrapes_testimonials', JSON.stringify(updatedList));

    if (isSupabaseConfigured()) {
      await upsertFeedbackToSupabase(itemToSave);
    }

    setFeedbackSuccessMsg(isAddingFeedback ? 'New feedback added directly to Supabase!' : 'Feedback entry updated in Supabase!');
    setTimeout(() => setFeedbackSuccessMsg(''), 4000);

    setIsAddingFeedback(false);
    setEditingFeedback(null);
  };

  // Delete Testimonial from Supabase and local state
  const handleDeleteFeedback = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the feedback from "${name}" from Supabase?`)) return;

    const updatedList = testimonials.filter(t => t.id !== id);
    setTestimonials(updatedList);
    localStorage.setItem('floatingdrapes_testimonials', JSON.stringify(updatedList));

    if (isSupabaseConfigured()) {
      await deleteFeedbackFromSupabase(id);
    }

    if (editingFeedback?.id === id) {
      setEditingFeedback(null);
      setIsAddingFeedback(false);
    }
  };

  // Save Testimonial Section Headers (Subtitle & Title) to Supabase site_config
  const handleSaveTestimonialSectionHeaders = async () => {
    onUpdateConfig(captions);
    localStorage.setItem('floatingdrapes_config', JSON.stringify(captions));

    if (isSupabaseConfigured()) {
      const ok = await syncSiteConfigToSupabase(captions);
      if (ok) {
        alert('Testimonials section headers saved and synced to Supabase database!');
      } else {
        alert('Saved locally. Check Database connection settings.');
      }
    } else {
      alert('Headers saved locally. Connect Supabase to sync to database.');
    }
  };

  // ----------------------------------------------------
  // BEFORE & AFTER MASTER CONTROLLER HANDLERS
  // ----------------------------------------------------
  const handleStartAddPortfolioItem = () => {
    setEditingPortfolioItem(null);
    setIsAddingPortfolioItem(true);
    setPortfolioForm({
      id: `p_${Date.now()}`,
      category: 'Living Room',
      title: '',
      description: '',
      beforeImage: '',
      afterImage: ''
    });
  };

  const handleStartEditPortfolioItem = (item: PortfolioItem) => {
    setIsAddingPortfolioItem(false);
    setEditingPortfolioItem(item);
    setPortfolioForm({
      id: item.id,
      category: item.category || 'Living Room',
      title: item.title,
      description: item.description,
      beforeImage: item.beforeImage,
      afterImage: item.afterImage
    });
  };

  const handleUploadCompareImage = async (type: 'before' | 'after', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Please select an image smaller than 20MB.');
      return;
    }

    if (type === 'before') setIsUploadingBeforeImage(true);
    if (type === 'after') setIsUploadingAfterImage(true);

    try {
      const res = await uploadImageToSupabase(file, {
        category: 'portfolio',
        title: `${portfolioForm.title || 'Transformation'} - ${type.toUpperCase()}`
      });

      if (res.data?.file_url) {
        setPortfolioForm(prev => ({
          ...prev,
          [type === 'before' ? 'beforeImage' : 'afterImage']: res.data!.file_url
        }));
        const fresh = await fetchUploadedImagesFromSupabase();
        setUploadedImages(fresh);
        setBeforeAfterSuccessMsg(`${type.toUpperCase()} image uploaded directly to Supabase Storage!`);
        setTimeout(() => setBeforeAfterSuccessMsg(''), 4000);
      } else {
        alert(res.error || 'Failed to upload image. Please try again.');
      }
    } catch (err: any) {
      alert(`Error uploading ${type} image: ${err?.message || 'Failed'}`);
    } finally {
      if (type === 'before') setIsUploadingBeforeImage(false);
      if (type === 'after') setIsUploadingAfterImage(false);
    }
  };

  const handleSavePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioForm.title.trim() || !portfolioForm.beforeImage || !portfolioForm.afterImage) {
      alert('Please fill in transformation title, before image, and after image.');
      return;
    }

    const updatedItem: PortfolioItem = {
      ...portfolioForm,
      beforeImage: normalizeGoogleDriveUrl(portfolioForm.beforeImage),
      afterImage: normalizeGoogleDriveUrl(portfolioForm.afterImage),
      title: portfolioForm.title.trim(),
      description: portfolioForm.description.trim()
    };

    let updatedList: PortfolioItem[];
    if (isAddingPortfolioItem) {
      updatedList = [updatedItem, ...portfolioList];
    } else {
      updatedList = portfolioList.map(c => c.id === updatedItem.id ? updatedItem : c);
    }

    setPortfolioList(updatedList);

    // 1. Create the new config object
    const updatedConfig: SiteConfig = {
      ...captions,
      portfolioData: updatedList
    };

    // 2. Update panel state AND broadcast to App.tsx immediately
    setCaptions(updatedConfig);
    onUpdateConfig(updatedConfig);
    
    // 3. Save locally
    localStorage.setItem('floatingdrapes_config', JSON.stringify(updatedConfig));
    localStorage.setItem('floatingdrapes_transformations', JSON.stringify(updatedList));

    // 4. Sync to Supabase: save directly to transformations table AND site_config
    if (isSupabaseConfigured()) {
      setBeforeAfterSuccessMsg('Syncing transformation to Supabase database...');
      const rowSuccess = await upsertTransformationToSupabase(updatedItem);
      const configSuccess = await syncSiteConfigToSupabase(updatedConfig);

      if (rowSuccess || configSuccess) {
        setBeforeAfterSuccessMsg(isAddingPortfolioItem 
          ? 'New transformation card created & synced universally to Supabase database!' 
          : 'Transformation card updated & synced universally to Supabase database!');
      } else {
        setBeforeAfterSuccessMsg('Saved locally! Please verify Supabase connection.');
      }
      setTimeout(() => setBeforeAfterSuccessMsg(''), 5000);
    } else {
      setBeforeAfterSuccessMsg('Saved locally! Connect Supabase in Database tab to sync universally.');
      setTimeout(() => setBeforeAfterSuccessMsg(''), 5000);
    }

    setIsAddingPortfolioItem(false);
    setEditingPortfolioItem(null);
  };

  const handleDeletePortfolioItem = async (id: string, title: string) => {
    if (!window.confirm(`Delete transformation "${title}" from Before & After section?`)) return;

    const updatedList = portfolioList.filter(c => c.id !== id);
    setPortfolioList(updatedList);

    const updatedConfig: SiteConfig = {
      ...captions,
      portfolioData: updatedList
    };

    setCaptions(updatedConfig);
    onUpdateConfig(updatedConfig);
    localStorage.setItem('floatingdrapes_config', JSON.stringify(updatedConfig));
    localStorage.setItem('floatingdrapes_transformations', JSON.stringify(updatedList));

    if (isSupabaseConfigured()) {
      await deleteTransformationFromSupabase(id);
      await syncSiteConfigToSupabase(updatedConfig);
      setBeforeAfterSuccessMsg(`Transformation "${title}" deleted from Supabase database.`);
      setTimeout(() => setBeforeAfterSuccessMsg(''), 4000);
    }

    if (editingPortfolioItem?.id === id) {
      setEditingPortfolioItem(null);
      setIsAddingPortfolioItem(false);
    }
  };

  const handleSaveBeforeAfterHeaders = async () => {
    onUpdateConfig(captions);
    localStorage.setItem('floatingdrapes_config', JSON.stringify(captions));

    if (isSupabaseConfigured()) {
      const ok = await syncSiteConfigToSupabase(captions);
      if (ok) {
        setBeforeAfterSuccessMsg('Before & After section headers saved and synced to Supabase database!');
        setTimeout(() => setBeforeAfterSuccessMsg(''), 4000);
      } else {
        setBeforeAfterSuccessMsg('Saved locally. Check Database settings.');
        setTimeout(() => setBeforeAfterSuccessMsg(''), 4000);
      }
    } else {
      setBeforeAfterSuccessMsg('Headers saved locally. Connect Supabase to sync.');
      setTimeout(() => setBeforeAfterSuccessMsg(''), 4000);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this consultation log?')) return;
    const updated = bookings.filter(b => b.id !== id);
    setBookings(updated);
    localStorage.setItem('floatingdrapes_bookings', JSON.stringify(updated));
    if (isSupabaseConfigured()) {
      await deleteBookingFromSupabase(id);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact inquiry?')) return;
    const updated = inquiries.filter(i => i.id !== id);
    setInquiries(updated);
    localStorage.setItem('floatingdrapes_contacts', JSON.stringify(updated));
    if (isSupabaseConfigured()) {
      await deleteInquiryFromSupabase(id);
    }
  };

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl || !supabaseKey) {
      alert('Please provide both your Supabase Project URL and Anon API Key.');
      return;
    }

    setSupabaseStatus('testing');
    saveSupabaseCredentials(supabaseUrl, supabaseKey);

    const testRes = await testSupabaseConnection();
    if (testRes.success) {
      setSupabaseStatus('connected');
      setSupabaseStatusMessage(testRes.message);
      alert('Supabase connected successfully! Realtime synchronization is active.');
      handlePullFromSupabase();
    } else {
      setSupabaseStatus('disconnected');
      setSupabaseStatusMessage(testRes.message);
      alert(testRes.message);
    }
  };

  const handleTestConnection = async () => {
    setSupabaseStatus('testing');
    const res = await testSupabaseConnection();
    if (res.success) {
      setSupabaseStatus('connected');
      setSupabaseStatusMessage(res.message);
      alert('Connection Verified! ' + res.message);
    } else {
      setSupabaseStatus('disconnected');
      setSupabaseStatusMessage(res.message);
      alert('Connection Failed: ' + res.message);
    }
  };

  const handleSeedSupabase = async () => {
    if (!isSupabaseConfigured()) {
      alert('Please connect your Supabase database first.');
      return;
    }

    if (!window.confirm('This will upload all 50+ rich curtain, wallpaper, and blinds products and site settings to your Supabase tables. Continue?')) {
      return;
    }

    setIsSeedingDatabase(true);
    try {
      const res = await seedDefaultCatalogToSupabase(siteConfig);
      alert(res.message);
    } finally {
      setIsSeedingDatabase(false);
    }
  };

  const handlePullFromSupabase = async () => {
    if (!isSupabaseConfigured()) {
      alert('Please connect your Supabase database first.');
      return;
    }

    setIsPullingData(true);
    try {
      const data = await fetchUniversalSiteData();
      let updatedCount = 0;

      if (data.siteConfig) {
        onUpdateConfig(data.siteConfig);
        setCaptions(data.siteConfig);
        localStorage.setItem('floatingdrapes_config', JSON.stringify(data.siteConfig));
        updatedCount++;
      }
      if (data.transformations && data.transformations.length > 0) {
        setPortfolioList(data.transformations);
        localStorage.setItem('floatingdrapes_transformations', JSON.stringify(data.transformations));
        updatedCount++;
      } else if (data.siteConfig?.portfolioData && data.siteConfig.portfolioData.length > 0) {
        setPortfolioList(data.siteConfig.portfolioData);
        localStorage.setItem('floatingdrapes_transformations', JSON.stringify(data.siteConfig.portfolioData));
      }
      if (data.curtains && data.curtains.length > 0) {
        setCurtains(data.curtains);
        localStorage.setItem('floatingdrapes_curtains', JSON.stringify(data.curtains));
        updatedCount++;
      }
      if (data.wallpapers && data.wallpapers.length > 0) {
        setWallpapers(data.wallpapers);
        localStorage.setItem('floatingdrapes_wallpapers', JSON.stringify(data.wallpapers));
        updatedCount++;
      }
      if (data.blinds && data.blinds.length > 0) {
        setBlinds(data.blinds);
        localStorage.setItem('floatingdrapes_blinds', JSON.stringify(data.blinds));
        updatedCount++;
      }
      if (data.testimonials && data.testimonials.length > 0) {
        setTestimonials(data.testimonials);
        localStorage.setItem('floatingdrapes_testimonials', JSON.stringify(data.testimonials));
        updatedCount++;
      }
      if (data.bookings) {
        setBookings(data.bookings);
        localStorage.setItem('floatingdrapes_bookings', JSON.stringify(data.bookings));
      }
      if (data.inquiries) {
        setInquiries(data.inquiries);
        localStorage.setItem('floatingdrapes_contacts', JSON.stringify(data.inquiries));
      }

      alert(`Successfully refreshed universal state from Supabase! (${updatedCount} dataset collections synchronized).`);
    } catch (e: any) {
      alert(`Error pulling from Supabase: ${e?.message || 'Failed'}`);
    } finally {
      setIsPullingData(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 3000);
  };

  const handleCopyRawImagesConfig = () => {
    const rawImageExport = {
      heroImageUrl: siteConfig.heroImageUrl || '',
      whyChooseUsImageUrl: siteConfig.whyChooseUsImageUrl || '',
      customizationCurtainsImage: siteConfig.customizationCurtainsImage || '',
      customizationWallpaperImage: siteConfig.customizationWallpaperImage || '',
      showcaseCurtainsThumbnail: siteConfig.categoryShowcase?.curtains?.thumbnail || '',
      showcaseWallpapersThumbnail: siteConfig.categoryShowcase?.wallpapers?.thumbnail || '',
      showcaseBlindsThumbnail: siteConfig.categoryShowcase?.blinds?.thumbnail || '',
      transformations: (siteConfig.portfolioData || []).map(p => ({
        id: p.id,
        category: p.category,
        title: p.title,
        description: p.description,
        beforeImage: p.beforeImage,
        afterImage: p.afterImage
      }))
    };
    navigator.clipboard.writeText(JSON.stringify(rawImageExport, null, 2));
    setImagesConfigCopied(true);
    setTimeout(() => setImagesConfigCopied(false), 3500);
  };

  const handleLoadMedia = async () => {
    setIsLoadingMedia(true);
    try {
      const images = await fetchUploadedImagesFromSupabase();
      setUploadedImages(images);
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleExecuteUpload = async (fileToUpload?: File) => {
    const file = fileToUpload || selectedUploadFile;
    if (!file) {
      setUploadErrorMsg('Please select an image file to upload.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadErrorMsg('File size exceeds 25MB limit. Please choose a smaller image.');
      return;
    }

    setIsUploadingMedia(true);
    setUploadErrorMsg('');
    setUploadSuccessMsg('');

    try {
      const res = await uploadImageToSupabase(file, {
        category: uploadCategory,
        title: uploadTitle.trim() || undefined
      });

      if (res.success && res.data) {
        setUploadSuccessMsg(res.message);
        setSelectedUploadFile(null);
        setUploadTitle('');
        const freshList = await fetchUploadedImagesFromSupabase();
        setUploadedImages(freshList);
        setTimeout(() => setUploadSuccessMsg(''), 6000);
      } else {
        setUploadErrorMsg(res.error || 'Failed to upload image.');
      }
    } catch (err: any) {
      setUploadErrorMsg(err?.message || 'An error occurred during image upload.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleExecuteDriveImport = async () => {
    if (!importDriveUrl.trim()) {
      setUploadErrorMsg('Please paste a Google Drive link or image URL.');
      return;
    }

    setIsImportingDriveUrl(true);
    setUploadErrorMsg('');
    setUploadSuccessMsg('');

    try {
      const res = await importImageFromUrlToSupabase(importDriveUrl.trim(), {
        category: uploadCategory as any,
        title: uploadTitle.trim() || undefined
      });

      if (res.success && res.data) {
        setUploadSuccessMsg(res.message);
        setImportDriveUrl('');
        setUploadTitle('');
        const freshList = await fetchUploadedImagesFromSupabase();
        setUploadedImages(freshList);
        setTimeout(() => setUploadSuccessMsg(''), 6000);
      } else {
        setUploadErrorMsg(res.error || res.message || 'Failed to import image from link.');
      }
    } catch (err: any) {
      setUploadErrorMsg(err?.message || 'An error occurred while importing link.');
    } finally {
      setIsImportingDriveUrl(false);
    }
  };

  const handleDeleteMedia = async (image: UploadedImage) => {
    if (!window.confirm(`Delete image "${image.title || image.filename}" from your Supabase database and storage?`)) return;

    const success = await deleteUploadedImageFromSupabase(image.id, image.storage_path);
    if (success) {
      setUploadedImages(prev => prev.filter(img => img.id !== image.id));
      if (previewModalImage?.id === image.id) {
        setPreviewModalImage(null);
      }
    } else {
      alert('Failed to delete image from Supabase.');
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedMediaId(id);
    setTimeout(() => setCopiedMediaId(null), 2500);
  };

  const handleApplyToProduct = (imageUrl: string, category: 'curtains' | 'wallpapers' | 'blinds') => {
    setSelectedProductCategory(category);
    setProductForm({
      id: `${category.charAt(0)}${Date.now()}`,
      name: `New ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)} Item`,
      description: '',
      image: imageUrl,
      priceClass: 'Premium',
      style: 'Classic',
      materials: ''
    });
    setIsAddingProduct(true);
    setActiveTab('products');
  };

  const handleProductInlineUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProductInline(true);
    try {
      const res = await uploadImageToSupabase(file, {
        category: selectedProductCategory,
        title: `${selectedProductCategory} item`
      });

      if (res.data?.file_url) {
        setProductForm(prev => ({ ...prev, image: res.data!.file_url }));
        const fresh = await fetchUploadedImagesFromSupabase();
        setUploadedImages(fresh);
      }
    } catch (err) {
      console.error('Inline upload error:', err);
      alert('Failed to upload image to Supabase.');
    } finally {
      setIsUploadingProductInline(false);
    }
  };

  const handleQuickUploadProductPhoto = async (
    item: any,
    category: 'curtains' | 'wallpapers' | 'blinds',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadImageToSupabase(file, {
        category,
        title: item.name
      });

      if (res.data?.file_url) {
        const newUrl = res.data.file_url;
        const updatedItem = { ...item, image: newUrl };

        if (category === 'curtains') {
          const updated = curtains.map(p => p.id === item.id ? updatedItem : p);
          setCurtains(updated);
          localStorage.setItem('floatingdrapes_curtains', JSON.stringify(updated));
          if (isSupabaseConfigured()) {
            await upsertCurtainToSupabase(updatedItem);
          }
        } else if (category === 'wallpapers') {
          const updated = wallpapers.map(p => p.id === item.id ? updatedItem : p);
          setWallpapers(updated);
          localStorage.setItem('floatingdrapes_wallpapers', JSON.stringify(updated));
          if (isSupabaseConfigured()) {
            await upsertWallpaperToSupabase(updatedItem);
          }
        } else {
          const updated = blinds.map(p => p.id === item.id ? updatedItem : p);
          setBlinds(updated);
          localStorage.setItem('floatingdrapes_blinds', JSON.stringify(updated));
          if (isSupabaseConfigured()) {
            await upsertBlindToSupabase(updatedItem);
          }
        }

        const fresh = await fetchUploadedImagesFromSupabase();
        setUploadedImages(fresh);

        alert(`New photo uploaded and updated in Supabase database for "${item.name}"!`);
      }
    } catch (err) {
      console.error('Quick upload error:', err);
      alert('Failed to upload image to Supabase.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-hidden text-white" id="admin-panel-overlay">
      <div className="relative w-full max-w-6xl h-[90vh] bg-[#00172e] border border-[#003866] shadow-[0_20px_60px_rgba(0,153,255,0.25)] flex flex-col rounded-2xl overflow-hidden" id="admin-panel-container">

        {/* TOP HEADER WITH HIGH-VISIBILITY LOGOUT BUTTON */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#003366] bg-[#001f3f]">
          <div className="flex items-center space-x-3">
            <span className="font-sans text-[11px] font-bold tracking-[0.3em] text-[#0099ff] uppercase">FLOATING DRAPES SYSTEM ENGINE</span>

            {/* Database indicating light */}
            <div 
              className="flex items-center justify-center p-1.5 bg-[#00172e] border border-[#003866] rounded-full shadow-inner"
              title={supabaseStatus === 'connected' ? 'Database: Connected (Green)' : supabaseStatus === 'testing' ? 'Database: Trying to connect (Yellow)' : 'Database: Disconnected (Red)'}
            >
              {renderIndicatorLight('sm')}
            </div>

            {isAuthenticated && (
              <span className="hidden sm:inline-block bg-[#0099ff]/15 text-[#0099ff] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border border-[#0099ff]/30 rounded">
                MASTER CONTROL
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* PROMINENT LOGOUT BUTTON - ALWAYS VISIBLE WHEN AUTHENTICATED */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-md shadow-red-900/40 border border-red-500 transition-all cursor-pointer"
                title="End master session and lock Admin Panel"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>LOGOUT</span>
              </button>
            )}

            <button 
              onClick={onClose} 
              className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Exit System Panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* NOT AUTHENTICATED - SHOW LOGIN MODAL */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-md mx-auto py-12">
            <div className="w-full bg-[#F4F9FD] border border-[#d2e5f5] rounded-2xl p-8 shadow-2xl text-[#002b49] relative">
              <div 
                className="absolute top-5 right-5 p-2 bg-white border border-[#c5def2] rounded-full shadow-sm flex items-center justify-center"
                title={supabaseStatus === 'connected' ? 'Database: Connected (Green)' : supabaseStatus === 'testing' ? 'Database: Trying to connect (Yellow)' : 'Database: Disconnected (Red)'}
              >
                {renderIndicatorLight('md')}
              </div>

              <div className="w-14 h-14 bg-[#e3f2fd] border border-[#90cdf4] rounded-full flex items-center justify-center text-[#0099ff] mx-auto mb-5 shadow-sm">
                <Lock className="h-6 w-6" />
              </div>

              <h2 className="font-serif text-2xl text-center font-bold text-[#002b49] mb-1.5">Enter Master Credentials</h2>
              <p className="font-sans text-xs text-[#335577] text-center mb-6 leading-relaxed">
                Floating Drapes control panel. Enter your admin user credentials to access the dashboard.
              </p>

              <form onSubmit={handleLogin} className="w-full space-y-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#006699] uppercase mb-1.5">Admin Email ID</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#88a3bc]" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your admin user email"
                      className="w-full bg-white border border-[#c5def2] focus:border-[#0099ff] px-11 py-2.5 text-xs text-[#002b49] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#006699] uppercase mb-1.5">Authorization Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#88a3bc]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-[#c5def2] focus:border-[#0099ff] px-11 py-2.5 text-xs text-[#002b49] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="text-red-700 text-[11px] font-medium leading-relaxed bg-red-50 border border-red-200 p-3 rounded-lg">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingLogin}
                  className="w-full bg-[#0099ff] hover:bg-[#0088ee] text-white py-3 text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer rounded-lg shadow-md shadow-[#0099ff]/25"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>{isSubmittingLogin ? 'VERIFYING WITH DATABASE...' : 'AUTHORIZE AND SIGN IN'}</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED PANEL LAYOUT */
          <div className="flex-1 flex overflow-hidden">

            {/* SIDEBAR BUTTONS */}
            <div className="w-64 border-r border-[#003366] bg-[#00172e] flex flex-col justify-between shrink-0 overflow-y-auto">
              <div className="p-4 space-y-1.5">
                <button
                  onClick={() => setActiveTab('sections')}
                  className={`w-full text-left px-4 py-3 text-xs font-bold tracking-widest uppercase flex items-center space-x-3 transition-all cursor-pointer rounded-lg ${activeTab === 'sections' ? 'bg-[#0099ff] text-white shadow-md shadow-[#0099ff]/30' : 'hover:bg-[#002b49] text-[#88ccff] hover:text-white'}`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Homepage & Sections</span>
                </button>
                <button
                  onClick={() => setActiveTab('captions')}
                  className={`w-full text-left px-4 py-3 text-xs font-bold tracking-widest uppercase flex items-center space-x-3 transition-all cursor-pointer rounded-lg ${activeTab === 'captions' ? 'bg-[#0099ff] text-white shadow-md shadow-[#0099ff]/30' : 'hover:bg-[#002b49] text-[#88ccff] hover:text-white'}`}
                >
                  <Heading className="h-4 w-4" />
                  <span>Captions & Text</span>
                </button>
                <button
                  onClick={() => setActiveTab('theme')}
                  className={`w-full text-left px-4 py-3 text-xs font-bold tracking-widest uppercase flex items-center space-x-3 transition-all cursor-pointer rounded-lg ${activeTab === 'theme' ? 'bg-[#0099ff] text-white shadow-md shadow-[#0099ff]/30' : 'hover:bg-[#002b49] text-[#88ccff] hover:text-white'}`}
                >
                  <Palette className="h-4 w-4" />
                  <span>Theme & Brand</span>
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full text-left px-4 py-3 text-xs font-bold tracking-widest uppercase flex items-center space-x-3 transition-all cursor-pointer rounded-lg ${activeTab === 'products' ? 'bg-[#0099ff] text-white shadow-md shadow-[#0099ff]/30' : 'hover:bg-[#002b49] text-[#88ccff] hover:text-white'}`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Products Catalog</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('media');
                    handleLoadMedia();
                  }}
                  className={`w-full text-left px-4 py-3 text-xs font-bold tracking-widest uppercase flex items-center space-x-3 transition-all cursor-pointer rounded-lg ${activeTab === 'media' ? 'bg-[#0099ff] text-white shadow-md shadow-[#0099ff]/30' : 'hover:bg-[#002b49] text-[#88ccff] hover:text-white'}`}
                >
                  <ImageIcon className="h-4 w-4" />
                  <span className="flex-1">Media & Uploads</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#002b49] text-[#88ccff] border border-[#003866] font-mono font-bold">{uploadedImages.length}</span>
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`w-full text-left px-4 py-3 text-xs font-bold tracking-widest uppercase flex items-center space-x-3 transition-all cursor-pointer rounded-lg ${activeTab === 'feedback' ? 'bg-[#0099ff] text-white shadow-md shadow-[#0099ff]/30' : 'hover:bg-[#002b49] text-[#88ccff] hover:text-white'}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="flex-1">Feedback Master</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#002b49] text-[#88ccff] border border-[#003866] font-mono font-bold">{testimonials.length}</span>
                </button>

                {/* BEFORE & AFTER MASTER CONTROL TAB BUTTON */}
                <button
                  onClick={() => setActiveTab('beforeAfter')}
                  className={`w-full text-left px-4 py-3 text-xs font-bold tracking-widest uppercase flex items-center space-x-3 transition-all cursor-pointer rounded-lg ${activeTab === 'beforeAfter' ? 'bg-[#0099ff] text-white shadow-md shadow-[#0099ff]/30' : 'hover:bg-[#002b49] text-[#88ccff] hover:text-white'}`}
                >
                  <Sliders className="h-4 w-4" />
                  <span className="flex-1">Before &amp; After</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#002b49] text-[#88ccff] border border-[#003866] font-mono font-bold">{portfolioList.length}</span>
                </button>

                <button
                  onClick={() => setActiveTab('inquiries')}
                  className={`w-full text-left px-4 py-3 text-xs font-bold tracking-widest uppercase flex items-center space-x-3 transition-all cursor-pointer rounded-lg ${activeTab === 'inquiries' ? 'bg-[#0099ff] text-white shadow-md shadow-[#0099ff]/30' : 'hover:bg-[#002b49] text-[#88ccff] hover:text-white'}`}
                >
                  <Inbox className="h-4 w-4" />
                  <span>Inquiries ({bookings.length + inquiries.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('database')}
                  className={`w-full text-left px-4 py-3 text-xs font-bold tracking-widest uppercase flex items-center space-x-3 transition-all cursor-pointer rounded-lg ${activeTab === 'database' ? 'bg-[#0099ff] text-white shadow-md shadow-[#0099ff]/30' : 'hover:bg-[#002b49] text-[#88ccff] hover:text-white'}`}
                >
                  <Database className="h-4 w-4" />
                  <span className="flex-1">Supabase Database</span>
                  {supabaseStatus === 'connected' && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
                </button>
              </div>

              {/* SIDEBAR LOGOUT FOOTER */}
              <div className="p-4 border-t border-[#003366] bg-[#001326] space-y-2">
                {sessionStorage.getItem('fd_admin_user_email') && (
                  <div className="px-3 py-2 bg-[#002244] border border-[#003866] text-[10px] text-[#88ccff] rounded-lg truncate">
                    <span className="block text-[8px] uppercase tracking-wider text-[#0099ff] font-bold">Logged In User</span>
                    <span className="truncate text-white font-medium">{sessionStorage.getItem('fd_admin_user_email')}</span>
                  </div>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-500 text-white py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-lg flex items-center justify-center space-x-2 shadow-md shadow-red-900/30"
                >
                  <LogOut className="h-4 w-4" />
                  <span>LOGOUT NOW</span>
                </button>
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#001428]">

              {/* TAB 0: HOMEPAGE & SECTIONS (HERO IMAGE, 3 SHOWCASE PRODUCTS, TAILOR-MADE CUSTOMIZATION) */}
              {activeTab === 'sections' && (
                <div className="space-y-8 bg-[#F4F9FD] border border-[#d2e5f5] rounded-2xl p-6 sm:p-8 text-[#002b49] shadow-xl">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#d8eaf7] pb-5 gap-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-[#002b49]">Homepage & Section Visuals</h3>
                      <p className="font-sans text-xs text-[#335577] mt-1">
                        Dedicated upload & string editor for Homepage Hero, the 3 Showcase Products ("Elegance In Every Detail"), and Tailor-Made Customization.
                      </p>
                    </div>
                    <button 
                      onClick={handleSaveShowcaseSections}
                      className="bg-[#0099ff] hover:bg-[#0088ee] text-white px-5 py-2.5 text-xs font-bold tracking-widest uppercase rounded-lg shadow-md shadow-[#0099ff]/25 transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>SAVE & SYNC TO SUPABASE</span>
                    </button>
                  </div>

                  {/* 1. HOMEPAGE HERO IMAGE SESSION */}
                  <div className="bg-white border border-[#c5def2] rounded-xl p-6 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e2effa] pb-3 gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[12px] font-bold tracking-widest text-[#0099ff] uppercase">1. HOMEPAGE HERO IMAGE</span>
                          <span className="bg-sky-50 text-[#0077c2] text-[10px] font-semibold px-2 py-0.5 rounded border border-[#b8dcfa]">Main Living Room Banner</span>
                        </div>
                        <p className="text-xs text-[#335577] mt-0.5">Upload a custom luxury room image to display on the top hero banner of the website.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Image Preview */}
                      <div className="lg:col-span-5">
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-[#b8dcfa] bg-slate-100 shadow-md group">
                          <img 
                            src={captions.heroImageUrl || DEFAULT_SITE_CONFIG.heroImageUrl || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"} 
                            alt="Hero display preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-bold uppercase tracking-wider bg-black/60 px-3 py-1.5 rounded-full border border-white/20">
                              Active Hero Visual
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="cursor-pointer bg-[#0099ff] hover:bg-[#0088ee] text-white px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center space-x-2 shadow-md shadow-[#0099ff]/25 transition-all">
                            <Camera className="h-4 w-4" />
                            <span>Upload Hero Photo</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleUploadHeroImage} 
                              className="hidden" 
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...captions, heroImageUrl: DEFAULT_SITE_CONFIG.heroImageUrl };
                              setCaptions(updated);
                              onUpdateConfig(updated);
                            }}
                            className="text-xs font-semibold text-[#006699] hover:text-[#002b49] px-3 py-2 rounded-lg border border-[#c5def2] hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Reset to Default Image
                          </button>
                        </div>

                        <div>
                          <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">
                            Or Enter Direct Image URL
                          </label>
                          <input 
                            type="text"
                            value={captions.heroImageUrl || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = { ...captions, heroImageUrl: normalizeGoogleDriveUrl(val) };
                              setCaptions(updated);
                              onUpdateConfig(updated);
                            }}
                            placeholder="Paste Google Drive link or image URL (https://...)"
                            className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                          />
                          {captions.heroImageUrl && isGoogleDriveUrl(captions.heroImageUrl) && (
                            <div className="mt-1 flex items-center space-x-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                              <span>Google Drive link recognized &amp; converted to universal stream!</span>
                            </div>
                          )}
                        </div>

                        <div className="text-[11px] text-[#557799] bg-[#f0f7fc] p-3 rounded-lg border border-[#d2e5f5] leading-relaxed">
                          💡 <strong>Universal Sync Note:</strong> When you upload or change the hero image here, it saves universally to Supabase. Every device (mobile, laptop, tablet) displays this image immediately.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. THREE PRODUCTS SHOWCASE ("ELEGANCE IN EVERY DETAIL") */}
                  <div className="bg-white border border-[#c5def2] rounded-xl p-6 shadow-sm space-y-6">
                    <div className="border-b border-[#e2effa] pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-[12px] font-bold tracking-widest text-[#0099ff] uppercase">
                          2. ELEGANCE IN EVERY DETAIL - 3 PRODUCTS SHOWCASE CARDS
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200">
                          Independent Thumbnails & Strings
                        </span>
                      </div>
                      <p className="text-xs text-[#335577] mt-0.5">
                        These 3 cards are separate from catalog products. Upload a distinct thumbnail and edit strings for Curtains, Wallpapers, and Blinds independently!
                      </p>
                    </div>

                    {/* Section Titles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f8fbfe] p-4 rounded-xl border border-[#d2e5f5]">
                      <div>
                        <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">
                          Section Eyebrow Label
                        </label>
                        <input 
                          type="text"
                          value={captions.showcaseSectionSubtitle || 'OUR PRODUCTS'}
                          onChange={(e) => setCaptions({ ...captions, showcaseSectionSubtitle: e.target.value })}
                          className="w-full bg-white border border-[#c5def2] focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">
                          Main Section Heading
                        </label>
                        <input 
                          type="text"
                          value={captions.showcaseSectionTitle || 'Elegance In Every Detail'}
                          onChange={(e) => setCaptions({ ...captions, showcaseSectionTitle: e.target.value })}
                          className="w-full bg-white border border-[#c5def2] focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff]"
                        />
                      </div>
                    </div>

                    {/* 3 Showcase Product Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* CARD 1: CURTAINS */}
                      {(() => {
                        const base = captions.categoryShowcase?.curtains || DEFAULT_SITE_CONFIG.categoryShowcase!.curtains;
                        return (
                          <div className="border border-[#c5def2] rounded-xl p-4 bg-[#fbfdff] space-y-4 flex flex-col justify-between shadow-sm">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-[#e2effa] pb-2">
                                <span className="font-serif text-sm font-bold text-[#002b49]">Product 1: Curtains</span>
                                <span className="text-[10px] bg-blue-100 text-[#006699] font-bold px-2 py-0.5 rounded">Card #1</span>
                              </div>

                              <div className="relative h-44 w-full rounded-lg overflow-hidden border border-[#b8dcfa] bg-slate-100">
                                <img 
                                  src={base.thumbnail || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80'} 
                                  alt="Curtains thumbnail"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-[#0099ff] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                                  {base.badge || '1000+'}
                                </div>
                              </div>

                              <div>
                                <label className="cursor-pointer w-full bg-[#0099ff] hover:bg-[#0088ee] text-white py-2 px-3 text-xs font-bold uppercase rounded-lg flex items-center justify-center space-x-2 shadow transition-all">
                                  <Camera className="h-3.5 w-3.5" />
                                  <span>Upload Curtains Thumbnail</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleUploadShowcaseThumbnail('curtains', e)}
                                    className="hidden" 
                                  />
                                </label>
                              </div>

                              <div>
                                <label className="block text-[9px] text-[#006699] font-bold uppercase tracking-wider mb-1">
                                  Thumbnail Image URL
                                </label>
                                <input 
                                  type="text"
                                  value={base.thumbnail || ''}
                                  onChange={(e) => {
                                    const showcase = captions.categoryShowcase || DEFAULT_SITE_CONFIG.categoryShowcase!;
                                    const updated = {
                                      ...captions,
                                      categoryShowcase: {
                                        ...showcase,
                                        curtains: { ...base, thumbnail: normalizeGoogleDriveUrl(e.target.value) }
                                      }
                                    };
                                    setCaptions(updated);
                                    onUpdateConfig(updated);
                                  }}
                                  placeholder="Paste Google Drive link or image URL..."
                                  className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff]"
                                />
                              </div>

                              <div className="space-y-2 pt-2 border-t border-[#e2effa]">
                                <span className="text-[10px] font-bold text-[#006699] uppercase tracking-wider block">
                                  Strings Edit Session
                                </span>

                                <div>
                                  <label className="block text-[9px] text-zinc-500 font-semibold mb-0.5">Card Title</label>
                                  <input 
                                    type="text"
                                    value={base.title || 'Curtains'}
                                    onChange={(e) => {
                                      const showcase = captions.categoryShowcase || DEFAULT_SITE_CONFIG.categoryShowcase!;
                                      const updated = {
                                        ...captions,
                                        categoryShowcase: {
                                          ...showcase,
                                          curtains: { ...base, title: e.target.value }
                                        }
                                      };
                                      setCaptions(updated);
                                      onUpdateConfig(updated);
                                    }}
                                    className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[9px] text-zinc-500 font-semibold mb-0.5">Designs Counter Badge</label>
                                  <input 
                                    type="text"
                                    value={base.badge || '1000+'}
                                    onChange={(e) => {
                                      const showcase = captions.categoryShowcase || DEFAULT_SITE_CONFIG.categoryShowcase!;
                                      const updated = {
                                        ...captions,
                                        categoryShowcase: {
                                          ...showcase,
                                          curtains: { ...base, badge: e.target.value }
                                        }
                                      };
                                      setCaptions(updated);
                                      onUpdateConfig(updated);
                                    }}
                                    className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[9px] text-zinc-500 font-semibold mb-0.5">Description Text</label>
                                  <textarea 
                                    rows={2}
                                    value={base.description || ''}
                                    onChange={(e) => {
                                      const showcase = captions.categoryShowcase || DEFAULT_SITE_CONFIG.categoryShowcase!;
                                      const updated = {
                                        ...captions,
                                        categoryShowcase: {
                                          ...showcase,
                                          curtains: { ...base, description: e.target.value }
                                        }
                                      };
                                      setCaptions(updated);
                                      onUpdateConfig(updated);
                                    }}
                                    className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff] resize-none"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[9px] text-zinc-500 font-semibold mb-0.5">Button Action Label</label>
                                  <input 
                                    type="text"
                                    value={base.buttonText || 'Explore Curtains'}
                                    onChange={(e) => {
                                      const showcase = captions.categoryShowcase || DEFAULT_SITE_CONFIG.categoryShowcase!;
                                      const updated = {
                                        ...captions,
                                        categoryShowcase: {
                                          ...showcase,
                                          curtains: { ...base, buttonText: e.target.value }
                                        }
                                      };
                                      setCaptions(updated);
                                      onUpdateConfig(updated);
                                    }}
                                    className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* CARD 2: WALLPAPERS */}
                      {(() => {
                        const base = captions.categoryShowcase?.wallpapers || DEFAULT_SITE_CONFIG.categoryShowcase!.wallpapers;
                        return (
                          <div className="border border-[#c5def2] rounded-xl p-4 bg-[#fbfdff] space-y-4 flex flex-col justify-between shadow-sm">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-[#e2effa] pb-2">
                                <span className="font-serif text-sm font-bold text-[#002b49]">Product 2: Wallpapers</span>
                                <span className="text-[10px] bg-blue-100 text-[#006699] font-bold px-2 py-0.5 rounded">Card #2</span>
                              </div>

                              <div className="relative h-44 w-full rounded-lg overflow-hidden border border-[#b8dcfa] bg-slate-100">
                                <img 
                                  src={base.thumbnail || 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80'} 
                                  alt="Wallpapers thumbnail"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-[#0099ff] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                                  {base.badge || '1500+'}
                                </div>
                              </div>

                              <div>
                                <label className="cursor-pointer w-full bg-[#0099ff] hover:bg-[#0088ee] text-white py-2 px-3 text-xs font-bold uppercase rounded-lg flex items-center justify-center space-x-2 shadow transition-all">
                                  <Camera className="h-3.5 w-3.5" />
                                  <span>Upload Wallpaper Thumbnail</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleUploadShowcaseThumbnail('wallpapers', e)}
                                    className="hidden" 
                                  />
                                </label>
                              </div>

                              <div>
                                <label className="block text-[9px] text-[#006699] font-bold uppercase tracking-wider mb-1">
                                  Thumbnail Image URL
                                </label>
                                <input 
                                  type="text"
                                  value={base.thumbnail || ''}
                                  onChange={(e) => {
                                    const showcase = captions.categoryShowcase || DEFAULT_SITE_CONFIG.categoryShowcase!;
                                    const updated = {
                                      ...captions,
                                      categoryShowcase: {
                                        ...showcase,
                                        wallpapers: { ...base, thumbnail: normalizeGoogleDriveUrl(e.target.value) }
                                      }
                                    };
                                    setCaptions(updated);
                                    onUpdateConfig(updated);
                                  }}
                                  placeholder="Paste Google Drive link or image URL..."
                                  className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff]"
                                />
                              </div>

                              <div className="space-y-2 pt-2 border-t border-[#e2effa]">
                                <span className="text-[10px] font-bold text-[#006699] uppercase tracking-wider block">
                                  Strings Edit Session
                                </span>

                                <div>
                                  <label className="block text-[9px] text-zinc-500 font-semibold mb-0.5">Card Title</label>
                                  <input 
                                    type="text"
                                    value={base.title || 'Wallpapers'}
                                    onChange={(e) => {
                                      const showcase = captions.categoryShowcase || DEFAULT_SITE_CONFIG.categoryShowcase!;
                                      const updated = {
                                        ...captions,
                                        categoryShowcase: {
                                          ...showcase,
                                          wallpapers: { ...base, title: e.target.value }
                                        }
                                      };
                                      setCaptions(updated);
                                      onUpdateConfig(updated);
                                    }}
                                    className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[9px] text-zinc-500 font-semibold mb-0.5">Designs Counter Badge</label>
                                  <input 
                                    type="text"
                                    value={base.badge || '1500+'}
                                    onChange={(e) => {
                                      const showcase = captions.categoryShowcase || DEFAULT_SITE_CONFIG.categoryShowcase!;
                                      const updated = {
                                        ...captions,
                                        categoryShowcase: {
                                          ...showcase,
                                          wallpapers: { ...base, badge: e.target.value }
                                        }
                                      };
                                      setCaptions(updated);
                                      onUpdateConfig(updated);
                                    }}
                                    className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[9px] text-zinc-500 font-semibold mb-0.5">Description Text</label>
                                  <textarea 
                                    rows={2}
                                    value={base.description || ''}
                                    onChange={(e) => {
                                      const showcase = captions.categoryShowcase || DEFAULT_SITE_CONFIG.categoryShowcase!;
                                      const updated = {
                                        ...captions,
                                        categoryShowcase: {
                                          ...showcase,
                                          wallpapers: { ...base, description: e.target.value }
                                        }
                                      };
                                      setCaptions(updated);
                                      onUpdateConfig(updated);
                                    }}
                                    className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff] resize-none"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[9px] text-zinc-500 font-semibold mb-0.5">Button Action Label</label>
                                  <input 
                                    type="text"
                                    value={base.buttonText || 'Explore Wallpapers'}
                                    onChange={(e) => {
                                      const showcase = captions.categoryShowcase || DEFAULT_SITE_CONFIG.categoryShowcase!;
                                      const updated = {
                                        ...captions,
                                        categoryShowcase: {
                                          ...showcase,
                                          wallpapers: { ...base, buttonText: e.target.value }
                                        }
                                      };
                                      setCaptions(updated);
                                      onUpdateConfig(updated);
                                    }}
                                    className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* CARD 3: BLINDS */}
                      {(() => {
                        const base = captions.categoryShowcase?.blinds || DEFAULT_SITE_CONFIG.categoryShowcase!.blinds;
                        return (
                          <div className="border border-[#c5def2] rounded-xl p-4 bg-[#fbfdff] space-y-4 flex flex-col justify-between shadow-sm">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-[#e2effa] pb-2">
                                <span className="font-serif text-sm font-bold text-[#002b49]">Product 3: Blinds</span>
                                <span className="text-[10px] bg-blue-100 text-[#006699] font-bold px-2 py-0.5 rounded">Card #3</span>
                              </div>

                              <div className="relative h-44 w-full rounded-lg overflow-hidden border border-[#b8dcfa] bg-slate-100">
                                <img 
                                  src={base.thumbnail || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'} 
                                  alt="Blinds thumbnail"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-[#0099ff] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                                  {base.badge || '600+'}
                                </div>
                              </div>

                              <div>
                                <label className="cursor-pointer w-full bg-[#0099ff] hover:bg-[#0088ee] text-white py-2 px-3 text-xs font-bold uppercase rounded-lg flex items-center justify-center space-x-2 shadow transition-all">
                                  <Camera className="h-3.5 w-3.5" />
                                  <span>Upload Blinds Thumbnail</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleUploadShowcaseThumbnail('blinds', e)}
                                    className="hidden" 
                                  />
                                </label>
                              </div>

                              <div>
                                <label className="block text-[9px] text-[#006699] font-bold uppercase tracking-wider mb-1">
                                  Thumbnail Image URL
                                </label>
                                <input 
                                  type="text"
                                  value={base.thumbnail || ''}
                                  onChange={(e) => {
                                    const showcase = captions.categoryShowcase || DEFAULT_SITE_CONFIG.categoryShowcase!;
                                    const updated = {
                                      ...captions,
                                      categoryShowcase: {
                                        ...showcase,
                                        blinds: { ...base, thumbnail: normalizeGoogleDriveUrl(e.target.value) }
                                      }
                                    };
                                    setCaptions(updated);
                                    onUpdateConfig(updated);
                                  }}
                                  placeholder="Paste Google Drive link or image URL..."
                                  className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff]"
                                />
                              </div>

                              <div className="space-y-2 pt-2 border-t border-[#e2effa]">
                                <span className="text-[10px] font-bold text-[#006699] uppercase tracking-wider block">
                                  Strings Edit Session
                                </span>

                                <div>
                                  <label className="block text-[9px] text-zinc-500 font-semibold mb-0.5">Card Title</label>
                                  <input 
                                    type="text"
                                    value={base.title || 'Blinds'}
                                    onChange={(e) => {
                                      const showcase = captions.categoryShowcase || DEFAULT_SITE_CONFIG.categoryShowcase!;
                                      const updated = {
                                        ...captions,
                                        categoryShowcase: {
                                          ...showcase,
                                          blinds: { ...base, title: e.target.value }
                                        }
                                      };
                                      setCaptions(updated);
                                      onUpdateConfig(updated);
                                    }}
                                    className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[9px] text-zinc-500 font-semibold mb-0.5">Designs Counter Badge</label>
                                  <input 
                                    type="text"
                                    value={base.badge || '600+'}
                                    onChange={(e) => {
                                      const showcase = captions.categoryShowcase || DEFAULT_SITE_CONFIG.categoryShowcase!;
                                      const updated = {
                                        ...captions,
                                        categoryShowcase: {
                                          ...showcase,
                                          blinds: { ...base, badge: e.target.value }
                                        }
                                      };
                                      setCaptions(updated);
                                      onUpdateConfig(updated);
                                    }}
                                    className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[9px] text-zinc-500 font-semibold mb-0.5">Description Text</label>
                                  <textarea 
                                    rows={2}
                                    value={base.description || ''}
                                    onChange={(e) => {
                                      const showcase = captions.categoryShowcase || DEFAULT_SITE_CONFIG.categoryShowcase!;
                                      const updated = {
                                        ...captions,
                                        categoryShowcase: {
                                          ...showcase,
                                          blinds: { ...base, description: e.target.value }
                                        }
                                      };
                                      setCaptions(updated);
                                      onUpdateConfig(updated);
                                    }}
                                    className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff] resize-none"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[9px] text-zinc-500 font-semibold mb-0.5">Button Action Label</label>
                                  <input 
                                    type="text"
                                    value={base.buttonText || 'Explore Blinds'}
                                    onChange={(e) => {
                                      const showcase = captions.categoryShowcase || DEFAULT_SITE_CONFIG.categoryShowcase!;
                                      const updated = {
                                        ...captions,
                                        categoryShowcase: {
                                          ...showcase,
                                          blinds: { ...base, buttonText: e.target.value }
                                        }
                                      };
                                      setCaptions(updated);
                                      onUpdateConfig(updated);
                                    }}
                                    className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 3. TAILOR-MADE CUSTOMIZATION SESSION */}
                  <div className="bg-white border border-[#c5def2] rounded-xl p-6 shadow-sm space-y-6">
                    <div className="border-b border-[#e2effa] pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-[12px] font-bold tracking-widest text-[#0099ff] uppercase">
                          3. TAILOR-MADE CUSTOMIZATION SECTION IMAGES & STRINGS
                        </span>
                        <span className="bg-purple-50 text-purple-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-purple-200">
                          Curtains & Wallpaper Customization
                        </span>
                      </div>
                      <p className="text-xs text-[#335577] mt-0.5">
                        Change the custom photography and titles for the two Tailor-Made bespoke styling cards.
                      </p>
                    </div>

                    {/* Section Titles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f8fbfe] p-4 rounded-xl border border-[#d2e5f5]">
                      <div>
                        <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">
                          Section Eyebrow Label
                        </label>
                        <input 
                          type="text"
                          value={captions.customizationSectionSubtitle || 'BESPOKE STYLING'}
                          onChange={(e) => setCaptions({ ...captions, customizationSectionSubtitle: e.target.value })}
                          className="w-full bg-white border border-[#c5def2] focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">
                          Main Section Heading
                        </label>
                        <input 
                          type="text"
                          value={captions.customizationSectionTitle || 'Tailor-Made Customization'}
                          onChange={(e) => setCaptions({ ...captions, customizationSectionTitle: e.target.value })}
                          className="w-full bg-white border border-[#c5def2] focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff]"
                        />
                      </div>
                    </div>

                    {/* 2 Customization Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* CARD 1: DESIGN YOUR OWN CURTAINS */}
                      <div className="border border-[#c5def2] rounded-xl p-5 bg-[#fbfdff] space-y-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-[#e2effa] pb-2">
                          <span className="font-serif text-sm font-bold text-[#002b49]">Card 1: Design Your Own Curtains</span>
                          <span className="text-[10px] bg-sky-100 text-[#006699] font-bold px-2 py-0.5 rounded">Curtains Bespoke</span>
                        </div>

                        <div className="relative h-48 w-full rounded-xl overflow-hidden border border-[#b8dcfa] bg-[#021E3B]">
                          <img 
                            src={captions.customizationCurtainsImage || DEFAULT_SITE_CONFIG.customizationCurtainsImage || 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=600&q=80'} 
                            alt="Curtains customization visual"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-y-0 left-0 w-[40%] bg-gradient-to-r from-[#021E3B] to-transparent pointer-events-none" />
                          <div className="absolute bottom-3 left-3 text-white text-xs font-bold drop-shadow">
                            Curtains Texture
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <label className="cursor-pointer w-full bg-[#0099ff] hover:bg-[#0088ee] text-white py-2 px-3 text-xs font-bold uppercase rounded-lg flex items-center justify-center space-x-2 shadow transition-all">
                            <Camera className="h-3.5 w-3.5" />
                            <span>Upload Photo</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleUploadCustomizationImage('curtains', e)}
                              className="hidden" 
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setMediaPickerTarget('curtainsCustomization')}
                            className="w-full bg-[#002b49] hover:bg-[#003d66] text-white py-2 px-3 text-xs font-bold uppercase rounded-lg flex items-center justify-center space-x-1.5 shadow transition-all cursor-pointer"
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            <span>Pick from Media</span>
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[9px] text-[#006699] font-bold uppercase tracking-wider">
                              Or Image URL / Google Drive Link
                            </label>
                            {isGoogleDriveUrl(captions.customizationCurtainsImage || '') && (
                              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Google Drive CDN Connected
                              </span>
                            )}
                          </div>
                          <input 
                            type="text"
                            value={captions.customizationCurtainsImage || ''}
                            onChange={(e) => {
                              const updated = { ...captions, customizationCurtainsImage: normalizeGoogleDriveUrl(e.target.value) };
                              setCaptions(updated);
                              onUpdateConfig(updated);
                            }}
                            placeholder="Paste Google Drive link or image URL..."
                            className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff]"
                          />
                        </div>

                        <div className="space-y-3 pt-2 border-t border-[#e2effa]">
                          <div>
                            <label className="block text-[9px] text-zinc-500 font-semibold mb-0.5">Card Heading</label>
                            <input 
                              type="text"
                              value={captions.customizationCurtainsTitle || 'Design Your Own Curtains'}
                              onChange={(e) => {
                                const updated = { ...captions, customizationCurtainsTitle: e.target.value };
                                setCaptions(updated);
                                onUpdateConfig(updated);
                              }}
                              className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff]"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] text-zinc-500 font-semibold mb-0.5">Card Description</label>
                            <textarea 
                              rows={2}
                              value={captions.customizationCurtainsDesc || 'Customize your curtains with your favorite fabric, color & style. Get precision fit.'}
                              onChange={(e) => {
                                const updated = { ...captions, customizationCurtainsDesc: e.target.value };
                                setCaptions(updated);
                                onUpdateConfig(updated);
                              }}
                              className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff] resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* CARD 2: DESIGN YOUR OWN WALLPAPER */}
                      <div className="border border-[#c5def2] rounded-xl p-5 bg-[#fbfdff] space-y-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-[#e2effa] pb-2">
                          <span className="font-serif text-sm font-bold text-[#002b49]">Card 2: Design Your Own Wallpaper</span>
                          <span className="text-[10px] bg-sky-100 text-[#006699] font-bold px-2 py-0.5 rounded">Wallpaper Bespoke</span>
                        </div>

                        <div className="relative h-48 w-full rounded-xl overflow-hidden border border-[#b8dcfa] bg-[#021E3B]">
                          <img 
                            src={captions.customizationWallpaperImage || DEFAULT_SITE_CONFIG.customizationWallpaperImage || 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80'} 
                            alt="Wallpaper customization visual"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-y-0 left-0 w-[40%] bg-gradient-to-r from-[#021E3B] to-transparent pointer-events-none" />
                          <div className="absolute bottom-3 left-3 text-white text-xs font-bold drop-shadow">
                            Wallpaper Texture
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <label className="cursor-pointer w-full bg-[#0099ff] hover:bg-[#0088ee] text-white py-2 px-3 text-xs font-bold uppercase rounded-lg flex items-center justify-center space-x-2 shadow transition-all">
                            <Camera className="h-3.5 w-3.5" />
                            <span>Upload Photo</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleUploadCustomizationImage('wallpaper', e)}
                              className="hidden" 
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setMediaPickerTarget('wallpaperCustomization')}
                            className="w-full bg-[#002b49] hover:bg-[#003d66] text-white py-2 px-3 text-xs font-bold uppercase rounded-lg flex items-center justify-center space-x-1.5 shadow transition-all cursor-pointer"
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            <span>Pick from Media</span>
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[9px] text-[#006699] font-bold uppercase tracking-wider">
                              Or Image URL / Google Drive Link
                            </label>
                            {isGoogleDriveUrl(captions.customizationWallpaperImage || '') && (
                              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Google Drive CDN Connected
                              </span>
                            )}
                          </div>
                          <input 
                            type="text"
                            value={captions.customizationWallpaperImage || ''}
                            onChange={(e) => {
                              const updated = { ...captions, customizationWallpaperImage: normalizeGoogleDriveUrl(e.target.value) };
                              setCaptions(updated);
                              onUpdateConfig(updated);
                            }}
                            placeholder="Paste Google Drive sharing link or image URL..."
                            className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff]"
                          />
                        </div>

                        <div className="space-y-3 pt-2 border-t border-[#e2effa]">
                          <div>
                            <label className="block text-[9px] text-zinc-500 font-semibold mb-0.5">Card Heading</label>
                            <input 
                              type="text"
                              value={captions.customizationWallpaperTitle || 'Design Your Own Wallpaper'}
                              onChange={(e) => {
                                const updated = { ...captions, customizationWallpaperTitle: e.target.value };
                                setCaptions(updated);
                                onUpdateConfig(updated);
                              }}
                              className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff]"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] text-zinc-500 font-semibold mb-0.5">Card Description</label>
                            <textarea 
                              rows={2}
                              value={captions.customizationWallpaperDesc || 'Create unique wallpaper designs that reflect your personality and style perfectly.'}
                              onChange={(e) => {
                                const updated = { ...captions, customizationWallpaperDesc: e.target.value };
                                setCaptions(updated);
                                onUpdateConfig(updated);
                              }}
                              className="w-full bg-white border border-[#c5def2] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#0099ff] resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. WHY CHOOSE US SECTION IMAGE & COPY */}
                  <div className="bg-white border border-[#c5def2] rounded-xl p-6 shadow-sm space-y-6">
                    <div className="border-b border-[#e2effa] pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-[12px] font-bold tracking-widest text-[#0099ff] uppercase">
                          4. WHY CHOOSE US - LUXURY DRAPES IMAGE & COPY
                        </span>
                        <span className="bg-amber-50 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-200">
                          Supabase Account Storage
                        </span>
                      </div>
                      <p className="text-xs text-[#335577] mt-0.5">
                        Change the featured luxury curtains image and copy for the "Why Choose Us" showcase section. When uploaded, this image is saved directly to your Supabase account and pulled whenever any user opens the site.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      <div className="lg:col-span-5">
                        <div className="relative aspect-[4/3] sm:aspect-video lg:aspect-[4/5] max-h-[360px] rounded-2xl overflow-hidden border-2 border-[#b8dcfa] bg-[#021E3B] shadow-md group">
                          <img 
                            src={captions.whyChooseUsImageUrl || DEFAULT_SITE_CONFIG.whyChooseUsImageUrl || "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80"} 
                            alt="Why Choose Us visual preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-bold uppercase tracking-wider bg-black/60 px-3 py-1.5 rounded-full border border-white/20">
                              Active Why Choose Us Visual
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-7 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="cursor-pointer bg-[#0099ff] hover:bg-[#0088ee] text-white px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center space-x-2 shadow-md shadow-[#0099ff]/25 transition-all">
                            <Camera className="h-4 w-4" />
                            <span>Upload Photo</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleUploadWhyChooseUsImage} 
                              className="hidden" 
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => setMediaPickerTarget('whyChooseUs')}
                            className="bg-[#002b49] hover:bg-[#003d66] text-white px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center space-x-2 shadow transition-all cursor-pointer"
                          >
                            <ImageIcon className="h-4 w-4" />
                            <span>Pick from Media</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...captions, whyChooseUsImageUrl: DEFAULT_SITE_CONFIG.whyChooseUsImageUrl };
                              setCaptions(updated);
                              onUpdateConfig(updated);
                            }}
                            className="text-xs font-semibold text-[#006699] hover:text-[#002b49] px-3 py-2 rounded-lg border border-[#c5def2] hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Reset to Default Image
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider">
                              Direct Image URL or Google Drive Link
                            </label>
                            {isGoogleDriveUrl(captions.whyChooseUsImageUrl || '') && (
                              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Google Drive CDN Connected
                              </span>
                            )}
                          </div>
                          <input 
                            type="text"
                            value={captions.whyChooseUsImageUrl || ''}
                            onChange={(e) => {
                              const updated = { ...captions, whyChooseUsImageUrl: normalizeGoogleDriveUrl(e.target.value) };
                              setCaptions(updated);
                              onUpdateConfig(updated);
                            }}
                            placeholder="https://... or Google Drive sharing link"
                            className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                          />
                        </div>

                        <div className="space-y-3 pt-2 border-t border-[#e2effa]">
                          <div>
                            <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">
                              Section Eyebrow Subtitle
                            </label>
                            <input 
                              type="text"
                              value={captions.whyChooseUsSubtitle || 'WHY CHOOSE US'}
                              onChange={(e) => {
                                const updated = { ...captions, whyChooseUsSubtitle: e.target.value };
                                setCaptions(updated);
                                onUpdateConfig(updated);
                              }}
                              className="w-full bg-white border border-[#c5def2] focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">
                              Main Section Title
                            </label>
                            <input 
                              type="text"
                              value={captions.whyChooseUsTitle || 'Quality, Service & Satisfaction You Can Trust'}
                              onChange={(e) => {
                                const updated = { ...captions, whyChooseUsTitle: e.target.value };
                                setCaptions(updated);
                                onUpdateConfig(updated);
                              }}
                              className="w-full bg-white border border-[#c5def2] focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">
                              Description Paragraph
                            </label>
                            <textarea 
                              rows={3}
                              value={captions.whyChooseUsDesc || ''}
                              onChange={(e) => {
                                const updated = { ...captions, whyChooseUsDesc: e.target.value };
                                setCaptions(updated);
                                onUpdateConfig(updated);
                              }}
                              className="w-full bg-white border border-[#c5def2] focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] resize-none"
                            />
                          </div>
                        </div>

                        <div className="text-[11px] text-[#557799] bg-[#f0f7fc] p-3 rounded-lg border border-[#d2e5f5] leading-relaxed">
                          💡 <strong>Universal Supabase Sync:</strong> When you upload a photo here, it saves to your Supabase account storage &amp; database table, and whenever visitors open the site, the site pulls this exact image path from Supabase.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Universal Sync Action Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#eaf4fd] border border-[#b8dcfa] rounded-xl gap-4">
                    <div>
                      <span className="font-bold text-[#0077c2] uppercase tracking-wider block text-xs">
                        Universal Cloud Sync Ready
                      </span>
                      <p className="text-xs text-[#335577] mt-0.5">
                        Click below to commit your Hero image, 3 product showcase thumbnails, Why Choose Us image, and tailor-made customization images to your database.
                      </p>
                    </div>
                    <button 
                      onClick={handleSaveShowcaseSections}
                      className="bg-[#0099ff] hover:bg-[#0088ee] text-white px-6 py-3 text-xs font-bold tracking-widest uppercase rounded-lg shadow-md shadow-[#0099ff]/25 transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <Save className="h-4 w-4" />
                      <span>SAVE ALL SECTION CHANGES</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 1: CAPTIONS AND TEXT */}
              {activeTab === 'captions' && (
                <div className="space-y-6 bg-[#F4F9FD] border border-[#d2e5f5] rounded-2xl p-6 sm:p-8 text-[#002b49] shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#d8eaf7] pb-5 gap-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-[#002b49]">Homepage Banners & Typography Binders</h3>
                      <p className="font-sans text-xs text-[#335577] mt-1">Adjust titles, body copy, about sections, and milestones. Changes sync universally to Supabase.</p>
                    </div>
                    <button 
                      onClick={handleSaveCaptions}
                      className="bg-[#0099ff] hover:bg-[#0088ee] text-white px-5 py-2.5 text-xs font-bold tracking-widest uppercase rounded-lg shadow-md shadow-[#0099ff]/25 transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>SAVE ALL CAPTIONS</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 bg-white border border-[#c5def2] rounded-xl p-5 shadow-sm">
                      <h4 className="text-[11px] font-bold tracking-widest text-[#0099ff] uppercase border-b border-[#e2effa] pb-2 mb-3">Hero Section Banners</h4>

                      <div>
                        <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">Top Accent Tagline</label>
                        <input
                          type="text"
                          value={captions.heroLabel}
                          onChange={(e) => setCaptions({ ...captions, heroLabel: e.target.value })}
                          className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">Headline Leading Text</label>
                          <input
                            type="text"
                            value={captions.heroHeadline1}
                            onChange={(e) => setCaptions({ ...captions, heroHeadline1: e.target.value })}
                            className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">Italic Word</label>
                          <input
                            type="text"
                            value={captions.heroHeadlineItalic}
                            onChange={(e) => setCaptions({ ...captions, heroHeadlineItalic: e.target.value })}
                            className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">Headline Ending Text</label>
                        <input
                          type="text"
                          value={captions.heroHeadline2}
                          onChange={(e) => setCaptions({ ...captions, heroHeadline2: e.target.value })}
                          className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">Bold Subtitle Accent</label>
                          <input
                            type="text"
                            value={captions.heroSub1}
                            onChange={(e) => setCaptions({ ...captions, heroSub1: e.target.value })}
                            className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">Colored Subtitle</label>
                          <input
                            type="text"
                            value={captions.heroSub2}
                            onChange={(e) => setCaptions({ ...captions, heroSub2: e.target.value })}
                            className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">Main Hero Description</label>
                        <textarea
                          rows={3}
                          value={captions.heroDesc}
                          onChange={(e) => setCaptions({ ...captions, heroDesc: e.target.value })}
                          className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] resize-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 bg-white border border-[#c5def2] rounded-xl p-5 shadow-sm">
                      <h4 className="text-[11px] font-bold tracking-widest text-[#0099ff] uppercase border-b border-[#e2effa] pb-2 mb-3">About Us Narrative</h4>

                      <div>
                        <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">Top Eyebrow Title</label>
                        <input
                          type="text"
                          value={captions.aboutTitle}
                          onChange={(e) => setCaptions({ ...captions, aboutTitle: e.target.value })}
                          className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">Experience Years Label</label>
                        <input
                          type="text"
                          value={captions.aboutExperience}
                          onChange={(e) => setCaptions({ ...captions, aboutExperience: e.target.value })}
                          className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">Narrative Paragraph 1</label>
                        <textarea
                          rows={4}
                          value={captions.aboutText1}
                          onChange={(e) => setCaptions({ ...captions, aboutText1: e.target.value })}
                          className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] resize-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">Narrative Paragraph 2</label>
                        <textarea
                          rows={4}
                          value={captions.aboutText2}
                          onChange={(e) => setCaptions({ ...captions, aboutText2: e.target.value })}
                          className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] resize-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: THEME & BRAND LOGO */}
              {activeTab === 'theme' && (
                <div className="space-y-8 bg-[#F4F9FD] border border-[#d2e5f5] rounded-2xl p-6 sm:p-8 text-[#002b49] shadow-xl">
                  <div className="border-b border-[#d8eaf7] pb-4">
                    <h3 className="font-serif text-2xl font-bold text-[#002b49]">Theme Styling & Typography Presets</h3>
                    <p className="font-sans text-xs text-[#335577] mt-1">Live swap styling sheets, paint palettes, typography couplings, and change your brand logo universally.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white border border-[#c5def2] rounded-xl p-6 space-y-5 shadow-sm">
                      <div className="flex items-center space-x-2 text-[#0099ff]">
                        <Palette className="h-4 w-4" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">Select Premium Color Preset</h4>
                      </div>

                      <div className="space-y-3">
                        {[
                          { id: 'sapphire', name: 'Royal Sapphire Blue', desc: 'Elite deep ocean navy backing paired with cyan highlights (Default)', primary: '#0099ff', bg: '#021e3b' },
                          { id: 'amber', name: 'Royal Amber Gold', desc: 'Warm stone grey backing paired with rich amber luster accents', primary: '#e5c158', bg: '#1c1917' },
                          { id: 'emerald', name: 'Classic Gold & Emerald', desc: 'Historical forest green backing with royal leaf gold touches', primary: '#d4af37', bg: '#064e3b' },
                          { id: 'crimson', name: 'Crimson Burgundy', desc: 'High-luxury deep wine red base matching classical opera drape textures', primary: '#cca43b', bg: '#450a0a' },
                          { id: 'obsidian', name: 'Modern Obsidian Dark', desc: 'Clean, futuristic dark backing with glowing amber control accents', primary: '#f59e0b', bg: '#121214' },
                        ].map((th) => (
                          <button
                            key={th.id}
                            onClick={() => handleSaveTheme(th.id as any, captions.fontPreset)}
                            className={`w-full p-4 border text-left flex items-center justify-between rounded-xl transition-all cursor-pointer ${captions.themePreset === th.id ? 'border-[#0099ff] bg-[#e3f2fd] shadow-sm' : 'border-[#d8eaf7] bg-[#f8fbfe] hover:border-[#0099ff]/50'}`}
                          >
                            <div className="space-y-1">
                              <span className="text-xs font-bold block text-[#002b49]">{th.name}</span>
                              <span className="text-[10px] text-[#335577] block leading-relaxed">{th.desc}</span>
                            </div>
                            <div className="flex items-center space-x-1.5 ml-4">
                              <div className="h-4 w-4 rounded-full border border-slate-300" style={{ backgroundColor: th.bg }} title="Background" />
                              <div className="h-4 w-4 rounded-full border border-slate-300" style={{ backgroundColor: th.primary }} title="Accent" />
                              {captions.themePreset === th.id && (
                                <Check className="h-4 w-4 text-[#0099ff] ml-1" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white border border-[#c5def2] rounded-xl p-6 space-y-5 shadow-sm">
                        <div className="flex items-center space-x-2 text-[#0099ff]">
                          <Type className="h-4 w-4" />
                          <h4 className="text-xs font-bold uppercase tracking-wider">Select Typographical Coupling</h4>
                        </div>

                        <div className="space-y-3">
                          {[
                            { id: 'jakarta_playfair', title: 'Plus Jakarta Sans & Playfair Display', desc: 'Sleek, fluid geometric body paired with grand classic headings (Default)' },
                            { id: 'inter_cinzel', title: 'Cinzel & Inter', desc: 'Imperial, Roman display typography paired with clean structural sans body' },
                            { id: 'outfit_bodoni', title: 'Outfit & Bodoni Moda', desc: 'Avant-garde editorial fashion pairing with warm italic curvatures' },
                          ].map((f) => (
                            <button
                              key={f.id}
                              onClick={() => handleSaveTheme(captions.themePreset, f.id as any)}
                              className={`w-full p-4 border text-left flex items-center justify-between rounded-xl transition-all cursor-pointer ${captions.fontPreset === f.id ? 'border-[#0099ff] bg-[#e3f2fd] shadow-sm' : 'border-[#d8eaf7] bg-[#f8fbfe] hover:border-[#0099ff]/50'}`}
                            >
                              <div className="space-y-1">
                                <span className="text-xs font-bold block text-[#002b49]">{f.title}</span>
                                <span className="text-[10px] text-[#335577] block leading-relaxed">{f.desc}</span>
                              </div>
                              {captions.fontPreset === f.id && (
                                <Check className="h-4 w-4 text-[#0099ff] ml-2" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border border-[#c5def2] rounded-xl p-6 space-y-4 shadow-sm">
                        <div className="flex items-center space-x-2 text-[#0099ff]">
                          <Link className="h-4 w-4" />
                          <h4 className="text-xs font-bold uppercase tracking-wider">Brand Logo Link Control</h4>
                        </div>
                        <p className="font-sans text-[11px] text-[#335577] leading-relaxed">
                          Provide any relative path or online image link to immediately replace the header and footer brand emblems.
                        </p>

                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={captions.brandLogoUrl}
                            onChange={(e) => setCaptions({ ...captions, brandLogoUrl: e.target.value })}
                            className="flex-1 bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff]"
                            placeholder="e.g. /logo.svg or external https://..."
                          />
                          <button
                            onClick={() => handleSaveLogo(captions.brandLogoUrl)}
                            className="bg-[#0099ff] hover:bg-[#0088ee] text-white px-5 py-2 text-xs font-bold tracking-wider uppercase rounded-lg shadow-md shadow-[#0099ff]/25 transition-colors cursor-pointer"
                          >
                            UPDATE
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PRODUCTS CATALOG */}
              {activeTab === 'products' && (
                <div className="space-y-6 bg-[#F4F9FD] border border-[#d2e5f5] rounded-2xl p-6 sm:p-8 text-[#002b49] shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d8eaf7] pb-5">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-[#002b49]">Dynamic Products Catalog Master Control</h3>
                      <p className="font-sans text-xs text-[#335577] mt-1">Directly edit, delete, or append newly structured curtains, wallpapers, and blinds. Automatically broadcasted to Supabase.</p>
                    </div>
                    <button
                      onClick={startAddProduct}
                      className="bg-[#0099ff] hover:bg-[#0088ee] text-white px-5 py-2.5 text-xs font-bold tracking-widest uppercase rounded-lg shadow-md shadow-[#0099ff]/25 transition-all flex items-center space-x-2 self-start cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>ADD NEW PRODUCT</span>
                    </button>
                  </div>

                  {/* CATEGORY SELECTOR */}
                  <div className="flex border border-[#c5def2] bg-white p-1 rounded-xl max-w-md shadow-sm">
                    {[
                      { id: 'curtains', label: 'Curtains Installation' },
                      { id: 'wallpapers', label: 'Wallpaper Coverings' },
                      { id: 'blinds', label: 'Bespoke Blinds' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedProductCategory(cat.id as any);
                          setIsAddingProduct(false);
                          setEditingProduct(null);
                        }}
                        className={`flex-1 py-2 text-center text-[10px] font-bold tracking-wider uppercase rounded-lg transition-colors cursor-pointer ${selectedProductCategory === cat.id ? 'bg-[#0099ff] text-white shadow-sm' : 'text-[#006699] hover:bg-[#e3f2fd]'}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* FORM TO ADD/EDIT PRODUCT */}
                  {(isAddingProduct || editingProduct) && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-[#c5def2] rounded-xl p-6 space-y-6 shadow-md"
                    >
                      <div className="flex items-center justify-between border-b border-[#e2effa] pb-3">
                        <span className="font-serif text-lg font-bold text-[#002b49]">
                          {isAddingProduct ? 'Append New Premium Product' : `Modifying: ${editingProduct.name}`}
                        </span>
                        <button 
                          onClick={() => {
                            setIsAddingProduct(false);
                            setEditingProduct(null);
                          }}
                          className="text-[#335577] hover:text-[#002b49] text-xs uppercase font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">Product Name *</label>
                            <input
                              type="text"
                              required
                              value={productForm.name}
                              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                              className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                              placeholder="e.g. Royal Silk Drapery"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider">
                                Image Link (Google Drive, CDN URL, or Supabase) *
                              </label>
                              <div className="flex items-center space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => setMediaPickerTarget('product')}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#e3f2fd] hover:bg-[#d0e8f9] text-[#006699] border border-[#90cdf4] text-[10px] font-bold tracking-wider uppercase rounded-md cursor-pointer transition-colors shadow-2xs"
                                  title="Pick image from Media Library"
                                >
                                  <ImageIcon className="h-3 w-3 text-[#0099ff]" />
                                  <span>Media</span>
                                </button>
                                <label className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#e3f2fd] hover:bg-[#d0e8f9] text-[#006699] border border-[#90cdf4] text-[10px] font-bold tracking-wider uppercase rounded-md cursor-pointer transition-colors shadow-2xs">
                                  <UploadCloud className="h-3 w-3 text-[#0099ff]" />
                                  <span>{isUploadingProductInline ? 'Uploading...' : 'Upload File'}</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    disabled={isUploadingProductInline}
                                    onChange={handleProductInlineUpload} 
                                    className="hidden" 
                                  />
                                </label>
                              </div>
                            </div>
                            <input
                              type="text"
                              required
                              value={productForm.image}
                              onChange={(e) => {
                                const val = e.target.value;
                                setProductForm({ ...productForm, image: normalizeGoogleDriveUrl(val) });
                              }}
                              className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                              placeholder="Paste Google Drive link or image URL..."
                            />
                            {productForm.image && isGoogleDriveUrl(productForm.image) && (
                              <div className="mt-1.5 flex items-center space-x-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                <span>Google Drive link recognized &amp; converted to universal stream!</span>
                              </div>
                            )}
                            {productForm.image && (
                              <div className="mt-2 flex items-center space-x-2.5 bg-[#f8fbfe] border border-[#c5def2] p-2 rounded-lg">
                                <img 
                                  src={normalizeGoogleDriveUrl(productForm.image)} 
                                  alt="Preview" 
                                  className="h-10 w-10 object-cover rounded-md border border-[#c5def2] bg-white" 
                                  referrerPolicy="no-referrer"
                                />
                                <div className="text-[10px] truncate">
                                  <span className="font-semibold text-[#002b49] block truncate">Active Image Selected</span>
                                  <span className="text-[#335577] truncate block max-w-[280px]">{normalizeGoogleDriveUrl(productForm.image)}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {selectedProductCategory === 'curtains' ? (
                            <div>
                              <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">Price Class Classification</label>
                              <select
                                value={productForm.priceClass}
                                onChange={(e) => setProductForm({ ...productForm, priceClass: e.target.value })}
                                className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                              >
                                <option value="Premium">Premium</option>
                                <option value="Signature">Signature</option>
                                <option value="Reserve">Reserve Luxury</option>
                              </select>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">Design Style Type</label>
                              {selectedProductCategory === 'wallpapers' ? (
                                <select
                                  value={productForm.style}
                                  onChange={(e) => setProductForm({ ...productForm, style: e.target.value })}
                                  className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                                >
                                  <option value="Classic">Classic</option>
                                  <option value="Botanical">Botanical</option>
                                  <option value="Textured">Textured</option>
                                  <option value="Modern">Modern</option>
                                </select>
                              ) : (
                                <select
                                  value={productForm.style}
                                  onChange={(e) => setProductForm({ ...productForm, style: e.target.value })}
                                  className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                                >
                                  <option value="Roman">Roman Shade</option>
                                  <option value="Roller">Roller Shade</option>
                                  <option value="Venetian">Venetian blind</option>
                                  <option value="Motorized">Motorized blind</option>
                                  <option value="Zebra">Zebra blind</option>
                                </select>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">Material Composition (Comma-separated)</label>
                            <input
                              type="text"
                              value={productForm.materials}
                              onChange={(e) => setProductForm({ ...productForm, materials: e.target.value })}
                              className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                              placeholder="e.g. Pure Merino Wool, Thermal Sateen, Brass Rings"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">Product Narrative Description *</label>
                            <textarea
                              rows={4}
                              required
                              value={productForm.description}
                              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                              className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] resize-none transition-colors"
                              placeholder="Type elegant marketing detail description..."
                            />
                          </div>

                          <div className="pt-4 flex justify-end space-x-3">
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingProduct(false);
                                setEditingProduct(null);
                              }}
                              className="border border-[#c5def2] hover:bg-[#e3f2fd] text-[#002b49] px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors"
                            >
                              CANCEL
                            </button>
                            <button
                              type="submit"
                              className="bg-[#0099ff] hover:bg-[#0088ee] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-md shadow-[#0099ff]/25 transition-colors cursor-pointer"
                            >
                              {isAddingProduct ? 'CONFIRM ADDITION' : 'SAVE CHANGES'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* PRODUCTS TABLE */}
                  <div className="border border-[#c5def2] bg-white rounded-xl overflow-x-auto shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#c5def2] bg-[#e3f2fd] text-[10px] font-bold tracking-wider text-[#006699] uppercase">
                          <th className="p-4 w-16">Preview</th>
                          <th className="p-4 w-48">Product Detail</th>
                          <th className="p-4">Narrative Description</th>
                          <th className="p-4 w-32">Classification</th>
                          <th className="p-4 w-28 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2effa]">
                        {selectedProductCategory === 'curtains' && curtains.map((item) => (
                          <tr key={item.id} className="hover:bg-[#f8fbfe] transition-colors">
                            <td className="p-4">
                              <img src={item.image} alt={item.name} className="h-12 w-12 object-cover rounded-lg border border-[#c5def2]" />
                            </td>
                            <td className="p-4 font-semibold">
                              <span className="block text-[#002b49] text-xs font-bold">{item.name}</span>
                              <span className="block text-[10px] text-[#335577] mt-0.5 font-normal">ID: {item.id}</span>
                            </td>
                            <td className="p-4 text-[11px] text-[#335577] max-w-sm line-clamp-2">
                              {item.description}
                            </td>
                            <td className="p-4">
                              <span className="inline-block px-2 py-0.5 bg-[#e3f2fd] text-[#0077c2] border border-[#90cdf4] text-[9px] font-bold tracking-wider uppercase rounded-md">
                                {item.priceClass}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1 whitespace-nowrap">
                              <label 
                                className="p-1.5 hover:bg-[#e3f2fd] text-[#006699] hover:text-[#0099ff] rounded-lg transition-colors inline-block cursor-pointer align-middle"
                                title="Upload Photo Directly to Supabase"
                              >
                                <Camera className="h-3.5 w-3.5" />
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={(e) => handleQuickUploadProductPhoto(item, 'curtains', e)} 
                                  className="hidden" 
                                />
                              </label>
                              <button 
                                onClick={() => startEditProduct(item)}
                                className="p-1.5 hover:bg-[#e3f2fd] text-[#006699] hover:text-[#0099ff] rounded-lg transition-colors inline-block cursor-pointer align-middle"
                                title="Edit Product"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(item.id, 'curtains')}
                                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors inline-block cursor-pointer align-middle"
                                title="Delete Product"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {selectedProductCategory === 'wallpapers' && wallpapers.map((item) => (
                          <tr key={item.id} className="hover:bg-[#f8fbfe] transition-colors">
                            <td className="p-4">
                              <img src={item.image} alt={item.name} className="h-12 w-12 object-cover rounded-lg border border-[#c5def2]" />
                            </td>
                            <td className="p-4 font-semibold">
                              <span className="block text-[#002b49] text-xs font-bold">{item.name}</span>
                              <span className="block text-[10px] text-[#335577] mt-0.5 font-normal">ID: {item.id}</span>
                            </td>
                            <td className="p-4 text-[11px] text-[#335577] max-w-sm line-clamp-2">
                              {item.description}
                            </td>
                            <td className="p-4">
                              <span className="inline-block px-2 py-0.5 bg-[#e3f2fd] text-[#0077c2] border border-[#90cdf4] text-[9px] font-bold tracking-wider uppercase rounded-md">
                                {item.style}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1 whitespace-nowrap">
                              <label 
                                className="p-1.5 hover:bg-[#e3f2fd] text-[#006699] hover:text-[#0099ff] rounded-lg transition-colors inline-block cursor-pointer align-middle"
                                title="Upload Photo Directly to Supabase"
                              >
                                <Camera className="h-3.5 w-3.5" />
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={(e) => handleQuickUploadProductPhoto(item, 'wallpapers', e)} 
                                  className="hidden" 
                                />
                              </label>
                              <button 
                                onClick={() => startEditProduct(item)}
                                className="p-1.5 hover:bg-[#e3f2fd] text-[#006699] hover:text-[#0099ff] rounded-lg transition-colors inline-block cursor-pointer align-middle"
                                title="Edit Product"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(item.id, 'wallpapers')}
                                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors inline-block cursor-pointer align-middle"
                                title="Delete Product"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {selectedProductCategory === 'blinds' && blinds.map((item) => (
                          <tr key={item.id} className="hover:bg-[#f8fbfe] transition-colors">
                            <td className="p-4">
                              <img src={item.image} alt={item.name} className="h-12 w-12 object-cover rounded-lg border border-[#c5def2]" />
                            </td>
                            <td className="p-4 font-semibold">
                              <span className="block text-[#002b49] text-xs font-bold">{item.name}</span>
                              <span className="block text-[10px] text-[#335577] mt-0.5 font-normal">ID: {item.id}</span>
                            </td>
                            <td className="p-4 text-[11px] text-[#335577] max-w-sm line-clamp-2">
                              {item.description}
                            </td>
                            <td className="p-4">
                              <span className="inline-block px-2 py-0.5 bg-[#e3f2fd] text-[#0077c2] border border-[#90cdf4] text-[9px] font-bold tracking-wider uppercase rounded-md">
                                {item.style}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1 whitespace-nowrap">
                              <label 
                                className="p-1.5 hover:bg-[#e3f2fd] text-[#006699] hover:text-[#0099ff] rounded-lg transition-colors inline-block cursor-pointer align-middle"
                                title="Upload Photo Directly to Supabase"
                              >
                                <Camera className="h-3.5 w-3.5" />
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={(e) => handleQuickUploadProductPhoto(item, 'blinds', e)} 
                                  className="hidden" 
                                />
                              </label>
                              <button 
                                onClick={() => startEditProduct(item)}
                                className="p-1.5 hover:bg-[#e3f2fd] text-[#006699] hover:text-[#0099ff] rounded-lg transition-colors inline-block cursor-pointer align-middle"
                                title="Edit Product"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(item.id, 'blinds')}
                                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors inline-block cursor-pointer align-middle"
                                title="Delete Product"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: MEDIA LIBRARY & SUPABASE IMAGE UPLOADS */}
              {activeTab === 'media' && (
                <div className="space-y-8 bg-[#F4F9FD] border border-[#d2e5f5] rounded-2xl p-6 sm:p-8 text-[#002b49] shadow-xl">
                  {/* HEADER BANNER */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#d8eaf7] gap-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold flex items-center space-x-2.5 text-[#002b49]">
                        <ImageIcon className="h-6 w-6 text-[#0099ff]" />
                        <span>Supabase Media &amp; Image Upload Center</span>
                        <span className="text-xs px-2.5 py-0.5 bg-[#e3f2fd] text-[#0077c2] border border-[#90cdf4] font-sans font-bold rounded-md">
                          {uploadedImages.length} Files in Database
                        </span>
                      </h3>
                      <p className="font-sans text-xs text-[#335577] mt-1">
                        Upload photography, fabrics, wallpapers, and room visualizers directly into your Supabase account. Files are saved in Supabase Storage with metadata recorded in the <code className="bg-[#e3f2fd] text-[#006699] px-1.5 py-0.5 rounded font-mono text-[11px]">public.uploaded_images</code> database table.
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <button
                        onClick={handleLoadMedia}
                        disabled={isLoadingMedia}
                        className="px-4 py-2 bg-white hover:bg-[#e3f2fd] text-[#006699] border border-[#c5def2] rounded-lg text-xs font-bold tracking-wider uppercase transition-colors flex items-center space-x-2 cursor-pointer shadow-2xs"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoadingMedia ? 'animate-spin text-[#0099ff]' : ''}`} />
                        <span>Refresh Media</span>
                      </button>
                    </div>
                  </div>

                  {/* SUPABASE STATUS INDICATOR STRIP */}
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    supabaseStatus === 'connected' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <div className="flex items-center space-x-2.5">
                      {supabaseStatus === 'connected' ? (
                        <>
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-bold tracking-wide">
                            Connected to Supabase Project: Uploads save directly to your Supabase Storage bucket &amp; database table!
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                          <span className="text-xs font-medium">
                            Supabase database is currently unlinked or testing. Connect your Supabase credentials in the <strong>Database</strong> tab to persist images in your cloud account. Local fallback caching is active.
                          </span>
                        </>
                      )}
                    </div>
                    {supabaseStatus !== 'connected' && (
                      <button
                        onClick={() => setActiveTab('database')}
                        className="text-[11px] font-bold text-[#0077c2] underline hover:text-[#005588] shrink-0"
                      >
                        Go to Database Setup &rarr;
                      </button>
                    )}
                  </div>

                  {/* UPLOAD STUDIO CARD */}
                  <div className="bg-white border border-[#c5def2] rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e2effa] mb-5 gap-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#006699] flex items-center space-x-2">
                        <UploadCloud className="h-4 w-4 text-[#0099ff]" />
                        <span>Add New Media Asset to Supabase</span>
                      </h4>

                      {/* Mode Switcher Tabs */}
                      <div className="inline-flex p-1 bg-[#f0f7fd] border border-[#c5def2] rounded-lg">
                        <button
                          type="button"
                          onClick={() => setMediaUploadMode('file')}
                          className={`px-3 py-1.5 text-xs font-bold tracking-wider uppercase rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                            mediaUploadMode === 'file'
                              ? 'bg-[#0099ff] text-white shadow-sm'
                              : 'text-[#006699] hover:text-[#002b49]'
                          }`}
                        >
                          <FolderOpen className="h-3.5 w-3.5" />
                          <span>Local File</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMediaUploadMode('gdrive')}
                          className={`px-3 py-1.5 text-xs font-bold tracking-wider uppercase rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                            mediaUploadMode === 'gdrive'
                              ? 'bg-[#0099ff] text-white shadow-sm'
                              : 'text-[#006699] hover:text-[#002b49]'
                          }`}
                        >
                          <Link className="h-3.5 w-3.5" />
                          <span>Google Drive Link / URL</span>
                        </button>
                      </div>
                    </div>

                    {/* MODE 1: LOCAL FILE UPLOAD (DRAG & DROP) */}
                    {mediaUploadMode === 'file' && (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingOver(true);
                        }}
                        onDragLeave={() => setIsDraggingOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingOver(false);
                          const files = e.dataTransfer.files;
                          if (files && files[0]) {
                            setSelectedUploadFile(files[0]);
                            if (!uploadTitle) {
                              setUploadTitle(files[0].name.replace(/\.[^/.]+$/, ''));
                            }
                          }
                        }}
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                          isDraggingOver 
                            ? 'border-[#0099ff] bg-[#e3f2fd]/60 scale-[1.005]' 
                            : 'border-[#c5def2] bg-[#f8fbfe] hover:bg-[#eef7fc]'
                        }`}
                      >
                        <input
                          type="file"
                          id="supabase-media-file-input"
                          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelectedUploadFile(file);
                              if (!uploadTitle) {
                                setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
                              }
                            }
                          }}
                        />

                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="h-14 w-14 rounded-full bg-[#e3f2fd] flex items-center justify-center text-[#0099ff] shadow-inner">
                            <UploadCloud className="h-7 w-7" />
                          </div>
                          <div>
                            <p className="font-serif text-base font-bold text-[#002b49]">
                              {selectedUploadFile ? selectedUploadFile.name : 'Drag & Drop your image file here'}
                            </p>
                            <p className="font-sans text-xs text-[#52779a] mt-0.5">
                              {selectedUploadFile 
                                ? `Size: ${(selectedUploadFile.size / (1024 * 1024)).toFixed(2)} MB • Type: ${selectedUploadFile.type || 'image'}` 
                                : 'Supports JPG, PNG, WebP, GIF, SVG up to 25MB'}
                            </p>
                          </div>

                          <label
                            htmlFor="supabase-media-file-input"
                            className="px-5 py-2.5 bg-[#0099ff] hover:bg-[#0088ee] text-white text-xs font-bold tracking-wider uppercase rounded-lg cursor-pointer shadow-md shadow-[#0099ff]/25 transition-all inline-flex items-center space-x-2"
                          >
                            <FolderOpen className="h-3.5 w-3.5" />
                            <span>{selectedUploadFile ? 'Select Different File' : 'Browse Local Files'}</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* MODE 2: GOOGLE DRIVE LINK & DIRECT IMAGE URL IMPORT */}
                    {mediaUploadMode === 'gdrive' && (
                      <div className="space-y-4 p-5 bg-[#f8fbfe] border border-[#c5def2] rounded-xl">
                        <div>
                          <label className="block text-[11px] font-bold tracking-wider uppercase text-[#006699] mb-1.5">
                            Google Drive Share Link or Direct Image URL *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={importDriveUrl}
                              onChange={(e) => {
                                const val = e.target.value;
                                setImportDriveUrl(val);
                                if (!uploadTitle && val) {
                                  const id = extractGoogleDriveFileId(val);
                                  if (id) setUploadTitle(`Drive Photo ${id.substring(0, 6)}`);
                                }
                              }}
                              placeholder="Paste link: https://drive.google.com/file/d/1Xyz.../view?usp=sharing"
                              className="w-full bg-white border border-[#c5def2] focus:border-[#0099ff] text-[#002b49] px-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                            />
                            {importDriveUrl && (
                              <button
                                type="button"
                                onClick={() => setImportDriveUrl('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {/* Dynamic Google Drive detection badge */}
                          {importDriveUrl && isGoogleDriveUrl(importDriveUrl) && (
                            <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
                              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                              <div className="flex-1 text-[11px]">
                                <span className="font-bold">Google Drive Link Recognized!</span>
                                <span className="block text-emerald-700 truncate">
                                  Auto-converting to direct stream: {normalizeGoogleDriveUrl(importDriveUrl)}
                                </span>
                              </div>
                            </div>
                          )}

                          <p className="font-sans text-[11px] text-[#52779a] mt-1.5 leading-relaxed">
                            💡 <strong>Tip:</strong> Supports all Google Drive link formats. In Google Drive, click <em>Share &rarr; Anyone with the link can view</em> so your website visitors can see the image universally.
                          </p>
                        </div>

                        {/* Live Preview of Google Drive or URL image */}
                        {importDriveUrl.trim() && (
                          <div className="flex items-center space-x-3 p-3 bg-white border border-[#c5def2] rounded-lg">
                            <div className="h-16 w-16 rounded-md overflow-hidden bg-slate-100 border border-[#c5def2] shrink-0">
                              <img
                                src={normalizeGoogleDriveUrl(importDriveUrl)}
                                alt="Link preview"
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="text-xs truncate">
                              <span className="font-bold text-[#002b49] block">Image Preview</span>
                              <span className="text-[#52779a] text-[11px] truncate block max-w-md">
                                {normalizeGoogleDriveUrl(importDriveUrl)}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-[#006699] mb-1">
                              Image Title / Label (Optional)
                            </label>
                            <input
                              type="text"
                              value={uploadTitle}
                              onChange={(e) => setUploadTitle(e.target.value)}
                              placeholder="e.g. Living Room Sheer White Curtains"
                              className="w-full bg-white border border-[#c5def2] focus:border-[#0099ff] text-[#002b49] px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-[#006699] mb-1">
                              Target Category / Placement
                            </label>
                            <select
                              value={uploadCategory}
                              onChange={(e) => setUploadCategory(e.target.value as any)}
                              className="w-full bg-white border border-[#c5def2] focus:border-[#0099ff] text-[#002b49] px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                            >
                              <option value="curtains">Curtains Product Catalog</option>
                              <option value="wallpapers">Wallpapers Product Catalog</option>
                              <option value="blinds">Blinds Product Catalog</option>
                              <option value="hero">Homepage Hero &amp; Banners</option>
                              <option value="gallery">Showcase &amp; Testimonials</option>
                              <option value="general">General Media</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#e2effa]">
                          <button
                            type="button"
                            disabled={isImportingDriveUrl || !importDriveUrl.trim()}
                            onClick={handleExecuteDriveImport}
                            className="px-6 py-2.5 bg-[#0099ff] hover:bg-[#0088ee] text-white text-xs font-bold tracking-widest uppercase rounded-lg shadow-md shadow-[#0099ff]/25 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                          >
                            {isImportingDriveUrl ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>PROCESSING & SAVING TO SUPABASE...</span>
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                <span>IMPORT &amp; SAVE TO SUPABASE</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Metadata & Confirmation Strip */}
                    {selectedUploadFile && (
                      <div className="mt-5 p-4 bg-[#f8fbfe] border border-[#c5def2] rounded-xl space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-[#006699] mb-1">
                              Image Title / Label (Optional)
                            </label>
                            <input
                              type="text"
                              value={uploadTitle}
                              onChange={(e) => setUploadTitle(e.target.value)}
                              placeholder="e.g. Belgian Charcoal Velvet Swatch"
                              className="w-full bg-white border border-[#c5def2] focus:border-[#0099ff] text-[#002b49] px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-[#006699] mb-1">
                              Target Category / Placement
                            </label>
                            <select
                              value={uploadCategory}
                              onChange={(e) => setUploadCategory(e.target.value as any)}
                              className="w-full bg-white border border-[#c5def2] focus:border-[#0099ff] text-[#002b49] px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                            >
                              <option value="curtains">Curtains Product Catalog</option>
                              <option value="wallpapers">Wallpapers Product Catalog</option>
                              <option value="blinds">Blinds Product Catalog</option>
                              <option value="hero">Homepage Hero &amp; Banners</option>
                              <option value="gallery">Showcase &amp; Testimonials</option>
                              <option value="general">General Media</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#e2effa]">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUploadFile(null);
                              setUploadTitle('');
                            }}
                            className="px-4 py-2 border border-[#c5def2] hover:bg-white text-[#52779a] hover:text-[#002b49] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            disabled={isUploadingMedia}
                            onClick={() => handleExecuteUpload()}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-widest uppercase rounded-lg shadow-md shadow-emerald-600/25 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                          >
                            {isUploadingMedia ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>UPLOADING TO SUPABASE...</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="h-4 w-4" />
                                <span>SAVE FILE TO SUPABASE ACCOUNT</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    {uploadSuccessMsg && (
                      <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-start space-x-3 text-xs leading-relaxed">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-bold block">Upload Confirmed!</span>
                          <p>{uploadSuccessMsg}</p>
                        </div>
                      </div>
                    )}

                    {uploadErrorMsg && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl flex items-start space-x-3 text-xs leading-relaxed">
                        <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-bold block">Upload Error</span>
                          <p>{uploadErrorMsg}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MEDIA GALLERY SECTION */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#006699]">
                          Uploaded Database Assets ({uploadedImages.length})
                        </h4>
                      </div>

                      {/* Filter & Search Bar */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={mediaSearchQuery}
                            onChange={(e) => setMediaSearchQuery(e.target.value)}
                            placeholder="Filter by title or filename..."
                            className="bg-white border border-[#c5def2] focus:border-[#0099ff] text-[#002b49] pl-9 pr-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors w-48 sm:w-60"
                          />
                        </div>

                        <select
                          value={mediaCategoryFilter}
                          onChange={(e) => setMediaCategoryFilter(e.target.value)}
                          className="bg-white border border-[#c5def2] focus:border-[#0099ff] text-[#002b49] px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                        >
                          <option value="all">All Categories</option>
                          <option value="curtains">Curtains</option>
                          <option value="wallpapers">Wallpapers</option>
                          <option value="blinds">Blinds</option>
                          <option value="hero">Hero &amp; Banners</option>
                          <option value="gallery">Showcase &amp; Reviews</option>
                          <option value="general">General</option>
                        </select>
                      </div>
                    </div>

                    {/* Filtered Media Grid */}
                    {(() => {
                      const filtered = uploadedImages.filter(img => {
                        const matchesCategory = mediaCategoryFilter === 'all' || img.category === mediaCategoryFilter;
                        const q = mediaSearchQuery.toLowerCase().trim();
                        const matchesSearch = !q || 
                          (img.title && img.title.toLowerCase().includes(q)) || 
                          img.filename.toLowerCase().includes(q);
                        return matchesCategory && matchesSearch;
                      });

                      if (isLoadingMedia) {
                        return (
                          <div className="py-16 text-center bg-white border border-[#c5def2] rounded-xl space-y-3">
                            <RefreshCw className="h-7 w-7 text-[#0099ff] animate-spin mx-auto" />
                            <p className="text-xs text-[#52779a]">Querying uploaded files from Supabase...</p>
                          </div>
                        );
                      }

                      if (filtered.length === 0) {
                        return (
                          <div className="py-16 text-center bg-white border border-[#c5def2] rounded-xl space-y-3 shadow-sm">
                            <ImageIcon className="h-10 w-10 text-slate-300 mx-auto" />
                            <p className="font-serif text-base font-bold text-[#002b49]">No media files found</p>
                            <p className="text-xs text-[#52779a] max-w-sm mx-auto">
                              {mediaSearchQuery || mediaCategoryFilter !== 'all'
                                ? 'No uploaded images match your current filter criteria.'
                                : 'Upload your first photography file using the drag-and-drop zone above to store it in Supabase.'}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {filtered.map((image) => {
                            const isCopied = copiedMediaId === image.id;
                            const sizeKb = image.size_bytes ? (image.size_bytes / 1024).toFixed(0) + ' KB' : '';
                            const dateFormatted = image.created_at ? new Date(image.created_at).toLocaleDateString() : '';

                            return (
                              <div
                                key={image.id}
                                className="bg-white border border-[#c5def2] hover:border-[#0099ff] rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg group"
                              >
                                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setPreviewModalImage(image)}>
                                  <img
                                    src={image.file_url}
                                    alt={image.title || image.filename}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 text-white">
                                    <span className="text-[11px] font-bold tracking-wider uppercase bg-black/60 px-2.5 py-1 rounded backdrop-blur-xs flex items-center space-x-1">
                                      <Eye className="h-3 w-3" />
                                      <span>Preview</span>
                                    </span>
                                  </div>

                                  <span className="absolute top-2 left-2 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm bg-white/95 text-[#006699] border border-[#c5def2]">
                                    {image.category || 'general'}
                                  </span>
                                </div>

                                <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3">
                                  <div>
                                    <h5 className="font-semibold text-xs text-[#002b49] truncate" title={image.title || image.filename}>
                                      {image.title || image.filename}
                                    </h5>
                                    <div className="flex items-center justify-between text-[10px] text-[#52779a] mt-1">
                                      <span>{sizeKb || 'Image'}</span>
                                      <span>{dateFormatted}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5 pt-2 border-t border-[#e2effa]">
                                    <button
                                      onClick={() => handleCopyUrl(image.file_url, image.id)}
                                      className={`w-full py-1.5 px-2.5 text-[10px] font-bold tracking-wider uppercase rounded-md flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                                        isCopied 
                                          ? 'bg-emerald-600 text-white' 
                                          : 'bg-[#e3f2fd] hover:bg-[#d0e8f9] text-[#006699] border border-[#90cdf4]'
                                      }`}
                                    >
                                      {isCopied ? (
                                        <>
                                          <Check className="h-3 w-3" />
                                          <span>COPIED URL!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-3 w-3" />
                                          <span>COPY SUPABASE URL</span>
                                        </>
                                      )}
                                    </button>

                                    <div className="grid grid-cols-3 gap-1 pt-1">
                                      <button
                                        onClick={() => handleApplyToProduct(image.file_url, 'curtains')}
                                        className="py-1 px-1 bg-white hover:bg-[#e3f2fd] text-[#006699] border border-[#c5def2] text-[9px] font-semibold rounded truncate transition-colors cursor-pointer"
                                        title="Create new curtain product with this image"
                                      >
                                        + Curtain
                                      </button>
                                      <button
                                        onClick={() => handleApplyToProduct(image.file_url, 'wallpapers')}
                                        className="py-1 px-1 bg-white hover:bg-[#e3f2fd] text-[#006699] border border-[#c5def2] text-[9px] font-semibold rounded truncate transition-colors cursor-pointer"
                                        title="Create new wallpaper product with this image"
                                      >
                                        + Wallpaper
                                      </button>
                                      <button
                                        onClick={() => handleApplyToProduct(image.file_url, 'blinds')}
                                        className="py-1 px-1 bg-white hover:bg-[#e3f2fd] text-[#006699] border border-[#c5def2] text-[9px] font-semibold rounded truncate transition-colors cursor-pointer"
                                        title="Create new blind product with this image"
                                      >
                                        + Blind
                                      </button>
                                    </div>

                                    <div className="flex justify-end pt-1">
                                      <button
                                        onClick={() => handleDeleteMedia(image)}
                                        className="text-[10px] text-slate-400 hover:text-red-600 flex items-center space-x-1 transition-colors cursor-pointer"
                                        title="Delete from Supabase"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="bg-[#eef7fc] border border-[#c5def2] rounded-xl p-5 text-xs text-[#002b49] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 font-bold text-[#006699] uppercase tracking-wider">
                        <Database className="h-4 w-4" />
                        <span>Supabase Storage &amp; Database Configuration Guide</span>
                      </div>
                      <button
                        onClick={handleCopySql}
                        className="text-[11px] font-bold text-[#0077c2] bg-white border border-[#c5def2] hover:bg-[#e3f2fd] px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{sqlCopied ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
                      </button>
                    </div>
                    <p className="text-[#335577] leading-relaxed">
                      Images uploaded here are saved into the Supabase PostgreSQL table <code className="bg-white px-1 py-0.5 rounded border border-[#c5def2] font-mono">public.uploaded_images</code> and public CDN bucket <code className="bg-white px-1 py-0.5 rounded border border-[#c5def2] font-mono">images</code>. If you just connected a fresh Supabase project, execute the full schema in your Supabase SQL Editor to enable all tables and storage permissions.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB: FEEDBACK & REVIEWS MASTER CONTROLLER (FULLY ARTICULATED TESTIMONIALS MANAGER) */}
              {activeTab === 'feedback' && (
                <div className="space-y-8 bg-[#F4F9FD] border border-[#d2e5f5] rounded-2xl p-6 sm:p-8 text-[#002b49] shadow-xl">
                  {/* HEADER BANNER */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#d8eaf7] gap-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold flex items-center space-x-2 text-[#002b49]">
                        <span>Customer Feedback &amp; Testimonials Master Controller</span>
                        <span className="text-xs px-2.5 py-0.5 bg-[#e3f2fd] text-[#0077c2] border border-[#90cdf4] font-sans font-bold rounded-md">
                          {testimonials.length} Active Reviews
                        </span>
                      </h3>
                      <p className="font-sans text-xs text-[#335577] mt-1">
                        Edit, upload avatar photos, modify customer reviews, 5-star ratings, and edit storefront section titles. All changes save directly to your Supabase PostgreSQL database and Storage.
                      </p>
                    </div>

                    {!isAddingFeedback && !editingFeedback && (
                      <button
                        onClick={handleStartAddFeedback}
                        className="px-5 py-2.5 bg-[#0099ff] text-white hover:bg-[#0088ee] text-xs font-bold tracking-wider uppercase flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0 shadow-md shadow-[#0099ff]/25 rounded-lg"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add New Testimonial</span>
                      </button>
                    )}
                  </div>

                  {/* SECTION HEADINGS EDIT BLOCK */}
                  <div className="bg-white border border-[#c5def2] rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#e2effa] pb-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#006699]">
                          Storefront Testimonials Section Titles &amp; Headings
                        </h4>
                        <p className="text-[11px] text-[#335577] mt-0.5">
                          Change what appears in the header block above the testimonials on the main website.
                        </p>
                      </div>
                      <button
                        onClick={handleSaveTestimonialSectionHeaders}
                        className="bg-[#0099ff] hover:bg-[#0088ee] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg shadow transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Save Section Headings</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">
                          Eyebrow Subtitle (Small blue banner)
                        </label>
                        <input
                          type="text"
                          value={captions.testimonialsSectionSubtitle || 'CLIENT FEEDBACK'}
                          onChange={(e) => setCaptions({ ...captions, testimonialsSectionSubtitle: e.target.value })}
                          className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff]"
                          placeholder="CLIENT FEEDBACK"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">
                          Main Section Heading
                        </label>
                        <input
                          type="text"
                          value={captions.testimonialsSectionTitle || 'What Our Clients Say'}
                          onChange={(e) => setCaptions({ ...captions, testimonialsSectionTitle: e.target.value })}
                          className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff]"
                          placeholder="What Our Clients Say"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SUCCESS NOTIFICATION */}
                  {feedbackSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center space-x-2 shadow-sm">
                      <CheckCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{feedbackSuccessMsg}</span>
                    </div>
                  )}

                  {/* ADD / EDIT FEEDBACK FORM */}
                  {(isAddingFeedback || editingFeedback) && (
                    <div className="bg-white border border-[#c5def2] rounded-xl p-6 space-y-6 shadow-md relative">
                      <div className="flex items-center justify-between border-b border-[#e2effa] pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-[#0099ff] text-white rounded-md">
                            {isAddingFeedback ? 'Create New' : 'Editing Entry'}
                          </span>
                          <h4 className="font-serif text-lg font-bold text-[#002b49]">
                            {isAddingFeedback ? 'Add Customer Testimonial' : `Edit Review from "${feedbackForm.name}"`}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingFeedback(false);
                            setEditingFeedback(null);
                          }}
                          className="p-1.5 text-slate-400 hover:text-[#002b49] rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                          title="Close form"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                        {/* ROW 1: NAME, LOCATION, ROLE */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-[#006699] mb-1.5">
                              Customer Name *
                            </label>
                            <input
                              type="text"
                              value={feedbackForm.name}
                              onChange={(e) => setFeedbackForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g. Priya Sharma"
                              required
                              className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] px-3.5 py-2 text-xs text-[#002b49] placeholder:text-slate-400 outline-none rounded-lg focus:ring-1 focus:ring-[#0099ff] transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-[#006699] mb-1.5">
                              Location / City
                            </label>
                            <input
                              type="text"
                              value={feedbackForm.location || ''}
                              onChange={(e) => setFeedbackForm(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="e.g. Race Course, Coimbatore"
                              className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] px-3.5 py-2 text-xs text-[#002b49] placeholder:text-slate-400 outline-none rounded-lg focus:ring-1 focus:ring-[#0099ff] transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-[#006699] mb-1.5">
                              Customer Role / Title
                            </label>
                            <input
                              type="text"
                              value={feedbackForm.role || ''}
                              onChange={(e) => setFeedbackForm(prev => ({ ...prev, role: e.target.value }))}
                              placeholder="e.g. Villa Owner / Interior Designer"
                              className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] px-3.5 py-2 text-xs text-[#002b49] placeholder:text-slate-400 outline-none rounded-lg focus:ring-1 focus:ring-[#0099ff] transition-colors"
                            />
                          </div>
                        </div>

                        {/* ROW 2: STAR RATING */}
                        <div>
                          <label className="block text-[10px] font-bold tracking-wider uppercase text-[#006699] mb-1.5">
                            Star Rating: {feedbackForm.rating || 5} of 5 Stars
                          </label>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setFeedbackForm(prev => ({ ...prev, rating: star }))}
                                className="p-1 hover:scale-110 transition-transform cursor-pointer"
                                title={`${star} Stars`}
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    star <= (feedbackForm.rating || 5)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="text-xs text-[#335577] ml-2 font-mono">
                              ({feedbackForm.rating === 5 ? '5.0 - Exceptional Experience' : `${feedbackForm.rating}.0 Stars`})
                            </span>
                          </div>
                        </div>

                        {/* ROW 3: PROFILE ICON & AVATAR MASTER CONTROLLER */}
                        <div className="p-5 bg-[#f8fbfe] border border-[#c5def2] rounded-xl space-y-4">
                          <div className="flex items-center justify-between border-b border-[#e2effa] pb-3">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-[#0099ff]" />
                              <span className="text-xs font-bold tracking-wider uppercase text-[#002b49]">
                                Profile Icon & Avatar Master Controller (Supabase Storage)
                              </span>
                            </div>
                            <span className="text-[10px] text-[#006699] font-medium bg-[#e3f2fd] px-2 py-0.5 rounded-md">
                              Direct to Supabase Storage
                            </span>
                          </div>

                          <p className="text-xs text-[#335577] leading-relaxed">
                            Upload a photograph for the client, or paste an image link. If no profile photo is uploaded, our system will automatically generate an elegant medallion displaying the <strong className="text-[#002b49]">first letter of the customer's name</strong> on the live storefront.
                          </p>

                          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                            <div className="flex flex-col items-center justify-center p-4 bg-white border border-[#c5def2] rounded-xl shrink-0 min-w-[140px] shadow-sm">
                              <span className="text-[9px] uppercase tracking-widest text-[#006699] mb-2 font-bold">
                                Live Icon Preview
                              </span>
                              <CustomerAvatar
                                name={feedbackForm.name || 'Customer'}
                                image={feedbackForm.image}
                                size="xl"
                              />
                              <span className="text-[10px] text-[#002b49] font-bold mt-2 truncate max-w-[120px]">
                                {feedbackForm.name || 'Customer Name'}
                              </span>
                            </div>

                            <div className="flex-1 w-full space-y-3">
                              {feedbackForm.image ? (
                                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                                  <div className="flex items-center space-x-2 text-emerald-700 text-xs font-medium">
                                    <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                                    <span>Custom Profile Photo Active in Supabase</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleRemoveFeedbackPhoto}
                                    className="text-xs text-red-600 hover:text-red-700 underline font-medium cursor-pointer"
                                  >
                                    Remove Photo (Use First Letter)
                                  </button>
                                </div>
                              ) : (
                                <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-lg">
                                  <div className="flex items-center space-x-2 text-sky-800 text-xs font-medium">
                                    <Sparkles className="h-4 w-4 shrink-0 text-[#0099ff]" />
                                    <span>
                                      First-Letter Avatar Active: &quot;
                                      {(feedbackForm.name?.trim()?.charAt(0) || 'C').toUpperCase()}
                                      &quot;
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#335577] mt-0.5">
                                    No photo uploaded. The storefront will display an initial medallion with letter &quot;{(feedbackForm.name?.trim()?.charAt(0) || 'C').toUpperCase()}&quot;.
                                  </p>
                                </div>
                              )}

                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <label className="px-4 py-2 bg-[#0099ff] hover:bg-[#0088ee] text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center space-x-2 cursor-pointer transition-colors shrink-0 rounded-lg shadow-sm">
                                  <Upload className="h-3.5 w-3.5" />
                                  <span>{isUploadingFeedbackImage ? 'Uploading...' : 'Upload Avatar'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={isUploadingFeedbackImage}
                                    onChange={handleFeedbackImageFileUpload}
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setMediaPickerTarget('feedback')}
                                  className="px-3.5 py-2 bg-[#002b49] hover:bg-[#003d66] text-white text-xs font-bold uppercase rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                                >
                                  <ImageIcon className="h-3.5 w-3.5" />
                                  <span>Pick Media</span>
                                </button>
                                <div className="flex-1 relative">
                                  <input
                                    type="text"
                                    value={feedbackForm.image || ''}
                                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, image: normalizeGoogleDriveUrl(e.target.value) }))}
                                    placeholder="Paste Google Drive sharing link or CDN URL (https://...)"
                                    className="w-full bg-white border border-[#c5def2] focus:border-[#0099ff] px-3.5 py-2 text-xs text-[#002b49] placeholder:text-slate-400 outline-none rounded-lg focus:ring-1 focus:ring-[#0099ff] transition-colors"
                                  />
                                  {isGoogleDriveUrl(feedbackForm.image || '') && (
                                    <div className="absolute right-2 top-2 text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                      Google Drive Linked
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ROW 4: REVIEW TEXTAREA */}
                        <div>
                          <label className="block text-[10px] font-bold tracking-wider uppercase text-[#006699] mb-1.5">
                            Customer Review / Testimonial Text *
                          </label>
                          <textarea
                            rows={4}
                            value={feedbackForm.review}
                            onChange={(e) => setFeedbackForm(prev => ({ ...prev, review: e.target.value }))}
                            placeholder="Type or paste the client's verified testimonial..."
                            required
                            className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] p-3.5 text-xs text-[#002b49] placeholder:text-slate-400 outline-none rounded-lg focus:ring-1 focus:ring-[#0099ff] transition-colors resize-y leading-relaxed"
                          />
                        </div>

                        {/* FORM ACTION BUTTONS */}
                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#e2effa]">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingFeedback(false);
                              setEditingFeedback(null);
                            }}
                            className="px-5 py-2.5 border border-[#c5def2] hover:bg-[#e3f2fd] text-[#002b49] text-xs font-bold tracking-wider uppercase rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-[#0099ff] text-white hover:bg-[#0088ee] text-xs font-bold tracking-wider uppercase flex items-center space-x-2 transition-all cursor-pointer font-sans shadow-md shadow-[#0099ff]/25 rounded-lg"
                          >
                            <Save className="h-4 w-4" />
                            <span>{isAddingFeedback ? 'Save & Publish Feedback' : 'Save Feedback Changes'}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* SEARCH AND FEEDBACK LIST */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="relative flex-1 max-w-md">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={feedbackSearch}
                          onChange={(e) => setFeedbackSearch(e.target.value)}
                          placeholder="Search feedback by customer name, location, or words..."
                          className="w-full bg-white border border-[#c5def2] focus:border-[#0099ff] pl-9 pr-4 py-2.5 text-xs text-[#002b49] placeholder:text-slate-400 outline-none rounded-lg shadow-sm focus:ring-1 focus:ring-[#0099ff] transition-colors"
                        />
                      </div>
                      <span className="text-xs text-[#335577] font-medium">
                        Showing {testimonials.filter(t => 
                          t.name.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
                          t.review.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
                          (t.location && t.location.toLowerCase().includes(feedbackSearch.toLowerCase()))
                        ).length} of {testimonials.length} reviews
                      </span>
                    </div>

                    {/* FEEDBACK TABLE */}
                    <div className="border border-[#c5def2] overflow-x-auto bg-white rounded-xl shadow-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#c5def2] bg-[#e3f2fd] text-[10px] font-bold tracking-wider uppercase text-[#006699]">
                            <th className="p-3.5">Customer & Avatar</th>
                            <th className="p-3.5">Avatar Mode</th>
                            <th className="p-3.5">Rating</th>
                            <th className="p-3.5">Testimonial Content</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2effa]">
                          {testimonials
                            .filter(t => 
                              t.name.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
                              t.review.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
                              (t.location && t.location.toLowerCase().includes(feedbackSearch.toLowerCase()))
                            )
                            .map((item) => (
                              <tr key={item.id} className="hover:bg-[#f8fbfe] transition-colors">
                                <td className="p-3.5 whitespace-nowrap">
                                  <div className="flex items-center space-x-3">
                                    <CustomerAvatar name={item.name} image={item.image} size="md" />
                                    <div>
                                      <p className="font-bold text-[#002b49] text-xs">{item.name}</p>
                                      <p className="text-[11px] text-[#335577]">
                                        {[item.role, item.location].filter(Boolean).join(' • ') || 'Client'}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3.5 whitespace-nowrap">
                                  {item.image ? (
                                    <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                                      Custom Photo
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-[#e3f2fd] text-[#0077c2] border border-[#90cdf4] rounded">
                                      Initial: &quot;{item.name.trim().charAt(0).toUpperCase()}&quot;
                                    </span>
                                  )}
                                </td>
                                <td className="p-3.5 whitespace-nowrap">
                                  <div className="flex items-center space-x-1 text-amber-400">
                                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                                    ))}
                                    <span className="text-[11px] text-[#335577] ml-1 font-semibold">({item.rating || 5}.0)</span>
                                  </div>
                                </td>
                                <td className="p-3.5 max-w-xs text-[#335577] line-clamp-2 leading-relaxed">
                                  &quot;{item.review}&quot;
                                </td>
                                <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                                  <button
                                    onClick={() => handleStartEditFeedback(item)}
                                    className="p-1.5 hover:bg-[#e3f2fd] text-[#006699] hover:text-[#0099ff] rounded-lg transition-colors inline-block cursor-pointer"
                                    title="Edit Feedback & Profile Icon"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFeedback(item.id, item.name)}
                                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors inline-block cursor-pointer"
                                    title="Delete Feedback"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          {testimonials.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-[#335577] text-xs">
                                No customer testimonials added yet. Click &quot;Add New Feedback&quot; to create your first client review.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------------------------- */}
              {/* TAB: BEFORE & AFTER MASTER CONTROLLER                                            */}
              {/* -------------------------------------------------------------------------------- */}
              {activeTab === 'beforeAfter' && (
                <div className="space-y-8 bg-[#F4F9FD] border border-[#d2e5f5] rounded-2xl p-6 sm:p-8 text-[#002b49] shadow-xl">
                  {/* HEADER BANNER */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#d8eaf7] gap-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold flex items-center space-x-2.5 text-[#002b49]">
                        <Sliders className="h-6 w-6 text-[#0099ff]" />
                        <span>Before &amp; After Master Controller</span>
                        <span className="text-xs px-2.5 py-0.5 bg-[#e3f2fd] text-[#0077c2] border border-[#90cdf4] font-sans font-bold rounded-md">
                          {portfolioList.length} Transformations
                        </span>
                      </h3>
                      <p className="font-sans text-xs text-[#335577] mt-1">
                        Upload custom Before &amp; After transformation photos, edit descriptions, and update section titles. All images are processed through Supabase Storage and stored directly in your Supabase database.
                      </p>
                    </div>

                    {!isAddingPortfolioItem && !editingPortfolioItem && (
                      <button
                        onClick={handleStartAddPortfolioItem}
                        className="px-5 py-2.5 bg-[#0099ff] text-white hover:bg-[#0088ee] text-xs font-bold tracking-wider uppercase flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0 shadow-md shadow-[#0099ff]/25 rounded-lg"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Transformation Card</span>
                      </button>
                    )}
                  </div>

                  {/* SECTION HEADINGS EDIT BLOCK */}
                  <div className="bg-white border border-[#c5def2] rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#e2effa] pb-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#006699]">
                          Storefront Before &amp; After Section Headers
                        </h4>
                        <p className="text-[11px] text-[#335577] mt-0.5">
                          Change what appears in the header block above the transformation slider cards.
                        </p>
                      </div>
                      <button
                        onClick={handleSaveBeforeAfterHeaders}
                        className="bg-[#0099ff] hover:bg-[#0088ee] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg shadow transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Save Section Headings</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">
                          Eyebrow Subtitle (Small blue banner)
                        </label>
                        <input
                          type="text"
                          value={captions.beforeAfterSubtitle || 'BEFORE & AFTER'}
                          onChange={(e) => setCaptions({ ...captions, beforeAfterSubtitle: e.target.value })}
                          className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff]"
                          placeholder="BEFORE & AFTER"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#006699] font-bold uppercase tracking-wider mb-1">
                          Main Section Heading
                        </label>
                        <input
                          type="text"
                          value={captions.beforeAfterTitle || 'See The Transformation'}
                          onChange={(e) => setCaptions({ ...captions, beforeAfterTitle: e.target.value })}
                          className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff]"
                          placeholder="See The Transformation"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SUCCESS NOTIFICATION */}
                  {beforeAfterSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center space-x-2 shadow-sm">
                      <CheckCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{beforeAfterSuccessMsg}</span>
                    </div>
                  )}

                  {/* ADD / EDIT PORTFOLIO TRANSFORMATION FORM */}
                  {(isAddingPortfolioItem || editingPortfolioItem) && (
                    <div className="bg-white border border-[#c5def2] rounded-xl p-6 space-y-6 shadow-md relative">
                      <div className="flex items-center justify-between border-b border-[#e2effa] pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-[#0099ff] text-white rounded-md">
                            {isAddingPortfolioItem ? 'Create New' : 'Editing Card'}
                          </span>
                          <h4 className="font-serif text-lg font-bold text-[#002b49]">
                            {isAddingPortfolioItem ? 'Add New Comparison Transformation' : `Editing: ${portfolioForm.title}`}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingPortfolioItem(false);
                            setEditingPortfolioItem(null);
                          }}
                          className="p-1.5 text-slate-400 hover:text-[#002b49] rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSavePortfolioSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-[#006699] mb-1.5">
                              Transformation Title *
                            </label>
                            <input
                              type="text"
                              value={portfolioForm.title}
                              onChange={(e) => setPortfolioForm(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="e.g. Modern Living Room Makeover"
                              required
                              className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] px-3.5 py-2 text-xs text-[#002b49] outline-none rounded-lg focus:ring-1 focus:ring-[#0099ff] transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-[#006699] mb-1.5">
                              Room Category
                            </label>
                            <select
                              value={portfolioForm.category || 'Living Room'}
                              onChange={(e) => setPortfolioForm(prev => ({ ...prev, category: e.target.value }))}
                              className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] px-3.5 py-2 text-xs text-[#002b49] outline-none rounded-lg focus:ring-1 focus:ring-[#0099ff] transition-colors"
                            >
                              <option value="Living Room">Living Room</option>
                              <option value="Bedroom">Bedroom</option>
                              <option value="Dining Room">Dining Room</option>
                              <option value="Kids Room">Kids Room</option>
                              <option value="Office">Executive Office</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-[#006699] mb-1.5">
                              Description Copy *
                            </label>
                            <input
                              type="text"
                              value={portfolioForm.description}
                              onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="e.g. Replaced outdated curtains with luxury silk drapes..."
                              required
                              className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] px-3.5 py-2 text-xs text-[#002b49] outline-none rounded-lg focus:ring-1 focus:ring-[#0099ff] transition-colors"
                            />
                          </div>
                        </div>

                        {/* PHOTO UPLOADS: BEFORE & AFTER PIPELINE */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* BEFORE IMAGE */}
                          <div className="p-4 bg-[#f8fbfe] border border-[#c5def2] rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#002b49] uppercase tracking-wider block">
                                1. "BEFORE" Photo (File, Drive Link, or Supabase)
                              </span>
                              <span className="text-[10px] text-[#006699] font-medium bg-[#e3f2fd] px-2 py-0.5 rounded">
                                Universal Sync
                              </span>
                            </div>

                            {portfolioForm.beforeImage && (
                              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#c5def2] bg-white">
                                <img 
                                  src={normalizeGoogleDriveUrl(portfolioForm.beforeImage)} 
                                  alt="Before preview" 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <label className="cursor-pointer bg-[#0099ff] hover:bg-[#0088ee] text-white px-3 py-2 text-xs font-bold uppercase rounded-lg flex items-center space-x-1.5 shadow transition-all shrink-0">
                                <Camera className="h-3.5 w-3.5" />
                                <span>{isUploadingBeforeImage ? 'Uploading...' : 'Upload File'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={isUploadingBeforeImage}
                                  onChange={(e) => handleUploadCompareImage('before', e)}
                                  className="hidden"
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => setMediaPickerTarget('before')}
                                className="px-2.5 py-2 bg-[#e3f2fd] hover:bg-[#cbe7fb] text-[#006699] border border-[#90cdf4] text-xs font-bold uppercase rounded-lg transition-colors flex items-center space-x-1 shrink-0"
                                title="Select from uploaded Media Library"
                              >
                                <ImageIcon className="h-3.5 w-3.5 text-[#0099ff]" />
                                <span className="hidden sm:inline">Media</span>
                              </button>

                              <input
                                type="text"
                                value={portfolioForm.beforeImage}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPortfolioForm(prev => ({ ...prev, beforeImage: normalizeGoogleDriveUrl(val) }));
                                }}
                                placeholder="Paste Google Drive link or image URL..."
                                className="flex-1 min-w-0 bg-white border border-[#c5def2] focus:border-[#0099ff] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none"
                              />
                            </div>

                            {/* Google Drive Link detection badge */}
                            {portfolioForm.beforeImage && isGoogleDriveUrl(portfolioForm.beforeImage) && (
                              <div className="flex items-center space-x-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                                <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                <span className="truncate">Google Drive link recognized &amp; converted to universal stream!</span>
                              </div>
                            )}
                          </div>

                          {/* AFTER IMAGE */}
                          <div className="p-4 bg-[#f8fbfe] border border-[#c5def2] rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#002b49] uppercase tracking-wider block">
                                2. "AFTER" Photo (File, Drive Link, or Supabase)
                              </span>
                              <span className="text-[10px] text-[#006699] font-medium bg-[#e3f2fd] px-2 py-0.5 rounded">
                                Universal Sync
                              </span>
                            </div>

                            {portfolioForm.afterImage && (
                              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#c5def2] bg-white">
                                <img 
                                  src={normalizeGoogleDriveUrl(portfolioForm.afterImage)} 
                                  alt="After preview" 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <label className="cursor-pointer bg-[#0099ff] hover:bg-[#0088ee] text-white px-3 py-2 text-xs font-bold uppercase rounded-lg flex items-center space-x-1.5 shadow transition-all shrink-0">
                                <Camera className="h-3.5 w-3.5" />
                                <span>{isUploadingAfterImage ? 'Uploading...' : 'Upload File'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={isUploadingAfterImage}
                                  onChange={(e) => handleUploadCompareImage('after', e)}
                                  className="hidden"
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => setMediaPickerTarget('after')}
                                className="px-2.5 py-2 bg-[#e3f2fd] hover:bg-[#cbe7fb] text-[#006699] border border-[#90cdf4] text-xs font-bold uppercase rounded-lg transition-colors flex items-center space-x-1 shrink-0"
                                title="Select from uploaded Media Library"
                              >
                                <ImageIcon className="h-3.5 w-3.5 text-[#0099ff]" />
                                <span className="hidden sm:inline">Media</span>
                              </button>

                              <input
                                type="text"
                                value={portfolioForm.afterImage}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPortfolioForm(prev => ({ ...prev, afterImage: normalizeGoogleDriveUrl(val) }));
                                }}
                                placeholder="Paste Google Drive link or image URL..."
                                className="flex-1 min-w-0 bg-white border border-[#c5def2] focus:border-[#0099ff] text-[#002b49] px-2.5 py-1.5 text-xs rounded-lg focus:outline-none"
                              />
                            </div>

                            {/* Google Drive Link detection badge */}
                            {portfolioForm.afterImage && isGoogleDriveUrl(portfolioForm.afterImage) && (
                              <div className="flex items-center space-x-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                                <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                <span className="truncate">Google Drive link recognized &amp; converted to universal stream!</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* FORM ACTIONS */}
                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#e2effa]">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingPortfolioItem(false);
                              setEditingPortfolioItem(null);
                            }}
                            className="px-5 py-2.5 border border-[#c5def2] hover:bg-[#e3f2fd] text-[#002b49] text-xs font-bold tracking-wider uppercase rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-[#0099ff] text-white hover:bg-[#0088ee] text-xs font-bold tracking-wider uppercase flex items-center space-x-2 transition-all cursor-pointer font-sans shadow-md shadow-[#0099ff]/25 rounded-lg"
                          >
                            <Save className="h-4 w-4" />
                            <span>{isAddingPortfolioItem ? 'Publish Transformation Card' : 'Save Transformation Changes'}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* TRANSFORMATIONS CARDS LIST */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolioList.map((item) => (
                      <div key={item.id} className="bg-white border border-[#c5def2] rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-1 p-2 bg-slate-50 border-b border-[#e2effa]">
                          <div className="relative aspect-[4/3] rounded overflow-hidden bg-slate-100">
                            <img src={item.beforeImage} alt="Before" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 left-1 bg-[#021E3B] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">BEFORE</span>
                          </div>
                          <div className="relative aspect-[4/3] rounded overflow-hidden bg-slate-100">
                            <img src={item.afterImage} alt="After" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 bg-[#029BFA] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">AFTER</span>
                          </div>
                        </div>

                        <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="font-serif text-sm font-bold text-[#002b49] truncate">{item.title}</h4>
                              <span className="text-[9px] font-semibold text-[#0077c2] bg-[#e3f2fd] px-1.5 py-0.5 rounded">{item.category}</span>
                            </div>
                            <p className="font-sans text-xs text-[#335577] line-clamp-2 mt-1">{item.description}</p>
                          </div>

                          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#e2effa]">
                            <button
                              onClick={() => handleStartEditPortfolioItem(item)}
                              className="p-1.5 hover:bg-[#e3f2fd] text-[#006699] hover:text-[#0099ff] rounded-lg transition-colors cursor-pointer"
                              title="Edit Transformation"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePortfolioItem(item.id, item.title)}
                              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                              title="Delete Transformation"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: INQUIRIES & CONSULTATIONS */}
              {activeTab === 'inquiries' && (
                <div className="space-y-8 bg-[#F4F9FD] border border-[#d2e5f5] rounded-2xl p-6 sm:p-8 text-[#002b49] shadow-xl">
                  <div className="border-b border-[#d8eaf7] pb-5">
                    <h3 className="font-serif text-2xl font-bold text-[#002b49]">Inbound Leads & Consultation Inquiries</h3>
                    <p className="font-sans text-xs text-[#335577] mt-1">Review live inquiry submissions dispatched by clients requesting on-site consultations or custom quotes.</p>
                  </div>

                  {/* Section A: Consultation Bookings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#006699] flex items-center space-x-2">
                        <span>Consultation Bookings ({bookings.length})</span>
                      </h4>
                    </div>

                    {bookings.length === 0 ? (
                      <div className="text-center py-12 bg-white border border-[#c5def2] rounded-xl space-y-2 shadow-sm">
                        <Inbox className="h-8 w-8 text-slate-400 mx-auto" />
                        <p className="font-sans text-xs text-[#335577]">No consultation bookings registered yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <div 
                            key={booking.id} 
                            className="bg-white border border-[#c5def2] rounded-xl p-6 relative group transition-all hover:border-[#0099ff] shadow-sm"
                            id={`booking-card-${booking.id}`}
                          >
                            <button 
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="absolute top-4 right-4 p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                              title="Delete Log"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="md:col-span-1 space-y-1">
                                <span className="block text-[10px] font-bold tracking-widest text-[#006699] uppercase">CLIENT ACCOUNT</span>
                                <strong className="block text-[#002b49] font-serif text-base">{booking.name}</strong>
                                <span className="block text-xs text-[#335577]">{booking.phone}</span>
                                {booking.email && <span className="block text-xs text-[#0099ff] underline">{booking.email}</span>}
                              </div>

                              <div className="md:col-span-1 space-y-1">
                                <span className="block text-[10px] font-bold tracking-widest text-[#006699] uppercase">CONSULT PARAMETERS</span>
                                <span className="block text-xs font-semibold text-[#002b49]">Project: {booking.projectType}</span>
                                <span className="block text-xs text-[#335577]">Budget: {booking.budget || 'Unspecified'}</span>
                                <span className="block text-xs text-[#335577]">Preferred: {booking.preferredDate || 'Flexible'}</span>
                              </div>

                              <div className="md:col-span-2 space-y-1">
                                <span className="block text-[10px] font-bold tracking-widest text-[#006699] uppercase">LOGGED TIMESTAMP</span>
                                <span className="block text-[11px] text-[#335577]">{new Date(booking.timestamp).toLocaleString()}</span>
                                {booking.message && (
                                  <p className="text-xs bg-[#f8fbfe] p-3.5 mt-2 border border-[#d2e5f5] text-[#335577] italic rounded-lg leading-relaxed">
                                    "{booking.message}"
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section B: Contact Messages */}
                  <div className="space-y-4 pt-5 border-t border-[#d8eaf7]">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#006699] flex items-center space-x-2">
                        <span>General Contact Enquiries ({inquiries.length})</span>
                      </h4>
                    </div>

                    {inquiries.length === 0 ? (
                      <div className="text-center py-12 bg-white border border-[#c5def2] rounded-xl space-y-2 shadow-sm">
                        <Mail className="h-8 w-8 text-slate-400 mx-auto" />
                        <p className="font-sans text-xs text-[#335577]">No general contact form messages registered yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {inquiries.map((inq) => (
                          <div 
                            key={inq.id} 
                            className="bg-white border border-[#c5def2] rounded-xl p-6 relative group transition-all hover:border-[#0099ff] shadow-sm"
                            id={`inquiry-card-${inq.id}`}
                          >
                            <button 
                              onClick={() => handleDeleteInquiry(inq.id)}
                              className="absolute top-4 right-4 p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                              title="Delete Log"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="md:col-span-1 space-y-1">
                                <span className="block text-[10px] font-bold tracking-widest text-[#006699] uppercase">INQUIRER</span>
                                <strong className="block text-[#002b49] font-serif text-base">{inq.name}</strong>
                                <span className="block text-xs text-[#335577]">{inq.phone}</span>
                                {inq.email && <span className="block text-xs text-[#0099ff] underline">{inq.email}</span>}
                              </div>

                              <div className="md:col-span-1 space-y-1">
                                <span className="block text-[10px] font-bold tracking-widest text-[#006699] uppercase">CATEGORY & LOCATION</span>
                                <span className="block text-xs font-semibold text-[#002b49]">{inq.project_type || inq.projectType}</span>
                                <span className="block text-xs text-[#335577]">{inq.location || 'Location Not Specified'}</span>
                              </div>

                              <div className="md:col-span-2 space-y-1">
                                <span className="block text-[10px] font-bold tracking-widest text-[#006699] uppercase">MESSAGE & DATE</span>
                                <span className="block text-[11px] text-[#335577]">{new Date(inq.timestamp).toLocaleString()}</span>
                                {inq.message && (
                                  <p className="text-xs bg-[#f8fbfe] p-3.5 mt-2 border border-[#d2e5f5] text-[#335577] italic rounded-lg leading-relaxed">
                                    "{inq.message}"
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 5: UNIVERSAL SUPABASE DATABASE */}
              {activeTab === 'database' && (
                <div className="space-y-8 bg-[#F4F9FD] border border-[#d2e5f5] rounded-2xl p-6 sm:p-8 text-[#002b49] shadow-xl">
                  <div className="border-b border-[#d8eaf7] pb-5">
                    <h3 className="font-serif text-2xl font-bold text-[#002b49]">Supabase Universal Database & Realtime Sync Engine</h3>
                    <p className="font-sans text-xs text-[#335577] mt-1">
                      Connect your Supabase database project so that product edits, captions, themes, bookings, and inquiries persist centrally and update in real-time across all visitor devices.
                    </p>
                  </div>

                  {/* Status Card */}
                  <div className={`p-5 rounded-xl border ${supabaseStatus === 'connected' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : supabaseStatus === 'testing' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-white border-[#c5def2] text-[#002b49]'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start space-x-3.5">
                        <div className={`p-2.5 rounded-full mt-0.5 ${supabaseStatus === 'connected' ? 'bg-emerald-100 text-emerald-600' : 'bg-sky-100 text-[#0099ff]'}`}>
                          <Database className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold uppercase tracking-wider">
                              {supabaseStatus === 'connected' ? 'Universal Database Connected' : supabaseStatus === 'testing' ? 'Verifying Supabase Connection...' : 'Supabase Not Connected'}
                            </h4>
                            {isSupabaseFromEnv && (
                              <span className="bg-[#e3f2fd] text-[#0077c2] text-[9px] px-2 py-0.5 font-bold uppercase border border-[#90cdf4] rounded">
                                Loaded from .env
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#335577] mt-1 leading-relaxed">
                            {supabaseStatusMessage || 'Enter your Supabase Project URL and Anon Key below to establish universal live database persistence.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-start sm:self-center">
                        <button
                          onClick={handleTestConnection}
                          disabled={!supabaseUrl || !supabaseKey}
                          className="border border-[#c5def2] bg-white hover:bg-[#e3f2fd] text-[#002b49] disabled:opacity-40 px-3.5 py-2 text-xs font-bold tracking-wider uppercase rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
                        >
                          <RefreshCw className="h-3.5 w-3.5 text-[#0099ff]" />
                          <span>TEST STATUS</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Configuration Form */}
                  <div className="bg-white border border-[#c5def2] rounded-xl p-6 space-y-6 shadow-sm">
                    <div className="flex items-center space-x-2 text-[#0099ff]">
                      <ShieldCheck className="h-4 w-4" />
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#002b49]">Supabase Project API Credentials</h4>
                    </div>

                    <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-[#006699] font-bold uppercase mb-1 tracking-wider">
                            Supabase Project URL *
                          </label>
                          <input
                            type="text"
                            required
                            value={supabaseUrl}
                            onChange={(e) => setSupabaseUrl(e.target.value)}
                            placeholder="https://your-project-id.supabase.co"
                            className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] transition-colors"
                          />
                          <span className="text-[10px] text-[#335577] mt-1 block">
                            Found in Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
                          </span>
                        </div>

                        <div>
                          <label className="block text-[10px] text-[#006699] font-bold uppercase mb-1 tracking-wider">
                            Supabase Anon Public API Key *
                          </label>
                          <input
                            type="password"
                            required
                            value={supabaseKey}
                            onChange={(e) => setSupabaseKey(e.target.value)}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            className="w-full bg-[#f8fbfe] border border-[#c5def2] focus:bg-white focus:border-[#0099ff] text-[#002b49] px-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0099ff] font-mono transition-colors"
                          />
                          <span className="text-[10px] text-[#335577] mt-1 block">
                            Found in Supabase Dashboard &gt; Project Settings &gt; API &gt; Project API keys (anon public)
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="submit"
                          className="bg-[#0099ff] hover:bg-[#0088ee] text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase rounded-lg shadow-md shadow-[#0099ff]/25 transition-all flex items-center space-x-2 cursor-pointer"
                        >
                          <Save className="h-3.5 w-3.5" />
                          <span>SAVE & ACTIVATE SUPABASE</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            clearStoredSupabaseCredentials();
                            setSupabaseUrl('');
                            setSupabaseKey('');
                            setSupabaseStatus('unconfigured');
                            setSupabaseStatusMessage('Credentials cleared.');
                            alert('Supabase credentials cleared.');
                          }}
                          className="border border-[#c5def2] hover:bg-red-50 hover:border-red-200 text-red-500 px-4 py-2.5 text-xs font-bold tracking-widest uppercase rounded-lg transition-colors cursor-pointer"
                        >
                          DISCONNECT
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* One-Click Synchronization Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Push Catalog to Supabase */}
                    <div className="bg-white border border-[#c5def2] rounded-xl p-6 space-y-4 shadow-sm">
                      <div className="flex items-center space-x-2 text-[#0099ff]">
                        <UploadCloud className="h-4 w-4" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#002b49]">Push & Seed Local Catalog to Supabase</h4>
                      </div>
                      <p className="text-xs text-[#335577] leading-relaxed">
                        Populate your Supabase tables with all 50+ rich curtain models, textured wallpaper collections, bespoke motorized blinds, and site configuration in 1 second.
                      </p>
                      <button
                        onClick={handleSeedSupabase}
                        disabled={!isSupabaseConfigured() || isSeedingDatabase}
                        className="bg-[#0099ff] hover:bg-[#0088ee] disabled:opacity-40 text-white px-5 py-2.5 text-xs font-bold tracking-widest uppercase rounded-lg shadow-md shadow-[#0099ff]/25 transition-colors flex items-center space-x-2 cursor-pointer"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>{isSeedingDatabase ? 'SEEDING DATABASE...' : 'SEED COMPLETE CATALOG (50+ ITEMS)'}</span>
                      </button>
                    </div>

                    {/* Pull Universal Data from Supabase */}
                    <div className="bg-white border border-[#c5def2] rounded-xl p-6 space-y-4 shadow-sm">
                      <div className="flex items-center space-x-2 text-[#0099ff]">
                        <DownloadCloud className="h-4 w-4" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#002b49]">Pull Live Universal State from Supabase</h4>
                      </div>
                      <p className="text-xs text-[#335577] leading-relaxed">
                        Fetch the latest universal catalog, site captions, active theme, and consultation bookings directly from Supabase to refresh your local browser cache.
                      </p>
                      <button
                        onClick={handlePullFromSupabase}
                        disabled={!isSupabaseConfigured() || isPullingData}
                        className="border border-[#c5def2] hover:bg-[#e3f2fd] disabled:opacity-40 text-[#002b49] px-5 py-2.5 text-xs font-bold tracking-widest uppercase rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 text-[#0099ff] ${isPullingData ? 'animate-spin' : ''}`} />
                        <span>{isPullingData ? 'PULLING FROM SUPABASE...' : 'REFRESH & SYNC FROM SUPABASE'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Export Active Images for Raw Code Card */}
                  <div className="bg-white border border-[#c5def2] rounded-xl p-6 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center space-x-2 text-[#0099ff]">
                        <Layers className="h-4 w-4" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#002b49]">Export Active Images for Raw Code</h4>
                      </div>
                      <button
                        onClick={handleCopyRawImagesConfig}
                        className="bg-[#002b49] hover:bg-[#003960] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center space-x-2 cursor-pointer w-fit"
                      >
                        {imagesConfigCopied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{imagesConfigCopied ? 'IMAGE CONFIG COPIED!' : 'COPY IMAGE CONFIG JSON'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-[#335577] leading-relaxed">
                      Copies all current Page 1 &amp; Page 2 image URLs (Hero, Curtains/Wallpapers/Blinds Showcase, Customization, Why Choose Us, and Transformations) to your clipboard. You can paste this in chat anytime to bake your images permanently into the source code!
                    </p>
                  </div>

                  {/* SQL Schema Generator Card */}
                  <div className="bg-white border border-[#c5def2] rounded-xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-[#0099ff]">
                        <FileText className="h-4 w-4" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#002b49]">Supabase SQL Table Schema & RLS Setup Script</h4>
                      </div>
                      <button
                        onClick={handleCopySql}
                        className="bg-[#0099ff] hover:bg-[#0088ee] text-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-md shadow-[#0099ff]/25 transition-colors flex items-center space-x-1.5 cursor-pointer"
                      >
                        {sqlCopied ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{sqlCopied ? 'COPIED TO CLIPBOARD!' : 'COPY SQL SCRIPT'}</span>
                      </button>
                    </div>

                    <div className="text-xs text-[#335577] space-y-2">
                      <p>
                        <strong>How to run:</strong> Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-[#0099ff] underline inline-flex items-center space-x-1 font-semibold"><span>Supabase Dashboard</span> <ExternalLink className="h-3 w-3 inline" /></a> &gt; <strong>SQL Editor</strong> &gt; <strong>New query</strong> &gt; Paste this script &gt; Click <strong>Run</strong>.
                      </p>
                      <p className="text-[11px] text-[#335577]">
                        This script creates <code>site_config</code>, <code>curtains</code>, <code>wallpapers</code>, <code>blinds</code>, <code>testimonials</code>, <code>bookings</code>, <code>inquiries</code>, and <code>uploaded_images</code> tables with Row Level Security (RLS), public storage bucket policies, and Realtime replication for instant universal updates.
                      </p>
                    </div>

                    <div className="relative">
                      <pre className="bg-[#001f35] border border-[#003960] p-4 text-[11px] font-mono text-sky-100 rounded-lg overflow-x-auto max-h-64 scrollbar-thin scrollbar-thumb-sky-700">
                        {SUPABASE_SQL_SCHEMA}
                      </pre>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* FULL SCREEN MEDIA LIGHTBOX PREVIEW MODAL */}
      <AnimatePresence>
        {previewModalImage && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setPreviewModalImage(null)}>
            <div 
              className="relative max-w-4xl w-full bg-[#00172e] border border-[#003866] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#003366] bg-[#001f3f]">
                <div className="flex items-center space-x-2 text-white">
                  <ImageIcon className="h-5 w-5 text-[#0099ff]" />
                  <span className="font-semibold text-sm truncate">{previewModalImage.title || previewModalImage.filename}</span>
                </div>
                <button 
                  onClick={() => setPreviewModalImage(null)}
                  className="p-1.5 hover:bg-[#002b49] text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 flex flex-col items-center justify-center bg-black/40 max-h-[70vh] overflow-hidden">
                <img 
                  src={previewModalImage.file_url} 
                  alt={previewModalImage.title || previewModalImage.filename}
                  className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-xl"
                />
              </div>

              <div className="p-5 border-t border-[#003366] bg-[#00172e] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 text-slate-300">
                  <p><strong>Category:</strong> <span className="uppercase text-[#0099ff]">{previewModalImage.category || 'general'}</span></p>
                  <p><strong>Direct CDN URL:</strong> <span className="font-mono text-[11px] text-slate-400 truncate max-w-md inline-block align-bottom">{previewModalImage.file_url}</span></p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyUrl(previewModalImage.file_url, previewModalImage.id)}
                    className="px-4 py-2 bg-[#0099ff] hover:bg-[#0088ee] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    {copiedMediaId === previewModalImage.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedMediaId === previewModalImage.id ? 'COPIED!' : 'COPY URL'}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteMedia(previewModalImage);
                    }}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>DELETE</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK MEDIA PICKER MODAL (For Before/After & Products) */}
      <AnimatePresence>
        {mediaPickerTarget && (
          <div 
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" 
            onClick={() => setMediaPickerTarget(null)}
          >
            <div 
              className="relative max-w-3xl w-full max-h-[85vh] bg-[#00172e] border border-[#003866] rounded-2xl overflow-hidden shadow-2xl flex flex-col text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#003366] bg-[#001f3f]">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5 text-[#0099ff]" />
                  <span className="font-bold text-sm">
                    Select Image from Supabase Media Library ({uploadedImages.length})
                  </span>
                </div>
                <button 
                  onClick={() => setMediaPickerTarget(null)}
                  className="p-1.5 hover:bg-[#002b49] text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 bg-[#001428]">
                {uploadedImages.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No images uploaded yet. You can upload images in the "Media &amp; Uploads" tab or paste a Google Drive link.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {uploadedImages.map((img) => (
                      <div 
                        key={img.id}
                        onClick={() => {
                          if (mediaPickerTarget === 'before') {
                            setPortfolioForm(prev => ({ ...prev, beforeImage: img.file_url }));
                          } else if (mediaPickerTarget === 'after') {
                            setPortfolioForm(prev => ({ ...prev, afterImage: img.file_url }));
                          } else if (mediaPickerTarget === 'product') {
                            setProductForm(prev => ({ ...prev, image: img.file_url }));
                          } else if (mediaPickerTarget === 'curtainsCustomization') {
                            const updated = { ...captions, customizationCurtainsImage: img.file_url };
                            setCaptions(updated);
                            onUpdateConfig(updated);
                          } else if (mediaPickerTarget === 'wallpaperCustomization') {
                            const updated = { ...captions, customizationWallpaperImage: img.file_url };
                            setCaptions(updated);
                            onUpdateConfig(updated);
                          } else if (mediaPickerTarget === 'whyChooseUs') {
                            const updated = { ...captions, whyChooseUsImageUrl: img.file_url };
                            setCaptions(updated);
                            onUpdateConfig(updated);
                          } else if (mediaPickerTarget === 'feedback') {
                            setFeedbackForm(prev => ({ ...prev, image: img.file_url }));
                          }
                          setMediaPickerTarget(null);
                        }}
                        className="group relative aspect-square bg-[#001d3d] border border-[#003866] hover:border-[#0099ff] rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-md"
                      >
                        <img 
                          src={normalizeGoogleDriveUrl(img.file_url)} 
                          alt={img.title || img.filename}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-[10px]">
                          <span className="font-bold truncate text-white">{img.title || img.filename}</span>
                          <span className="text-[#0099ff] uppercase font-bold text-[9px]">{img.category || 'general'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-[#003366] bg-[#001f3f] flex justify-end">
                <button
                  type="button"
                  onClick={() => setMediaPickerTarget(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
