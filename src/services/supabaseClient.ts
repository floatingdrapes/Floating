import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SiteConfig, CurtainItem, WallpaperItem, BookingSubmission, DEFAULT_SITE_CONFIG, Testimonial, TESTIMONIALS_DATA, UploadedImage, PortfolioItem, PORTFOLIO_DATA } from '../types';
import { BlindItem, EXTENDED_CURTAINS_DATA, EXTENDED_WALLPAPERS_DATA, EXTENDED_BLINDS_DATA } from '../data/productsData';
import { normalizeGoogleDriveUrl, extractGoogleDriveFileId, isGoogleDriveUrl } from '../utils/googleDrive';

// Storage keys for custom Supabase credentials configured via Admin Panel
const STORAGE_URL_KEY = 'floatingdrapes_supabase_url';
const STORAGE_ANON_KEY = 'floatingdrapes_supabase_anon_key';

let activeSupabaseClient: SupabaseClient | null = null;
let currentConfiguredUrl = '';
let currentConfiguredKey = '';

/**
 * Retrieves the active Supabase URL and Key from environment variables or persistent admin storage
 */
export function getSupabaseCredentials(): { url: string; key: string; isFromEnv: boolean } {
  const envUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim();
  const envKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();

  if (envUrl && envKey) {
    return { url: envUrl, key: envKey, isFromEnv: true };
  }

  const storedUrl = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) || '' : '').trim();
  const storedKey = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_ANON_KEY) || '' : '').trim();

  if (storedUrl && storedKey) {
    return {
      url: storedUrl,
      key: storedKey,
      isFromEnv: false
    };
  }

  // Built-in verified project credentials
  const defaultUrl = 'https://vgcftgxtpywmswxvztsm.supabase.co';
  const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnY2Z0Z3h0cHl3bXN3eHZ6dHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MTQxODAsImV4cCI6MjEwNTI5MDE4MH0.z0Ur4dFmbiDX9YY2rvnm7jqmgT6eU_7sd2Oqxxonq9k';

  return {
    url: defaultUrl,
    key: defaultKey,
    isFromEnv: true
  };
}

/**
 * Checks if Supabase credentials are validly supplied
 */
export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http'));
}

/**
 * Gets or dynamically creates the Supabase Client singleton
 */
export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  if (activeSupabaseClient && currentConfiguredUrl === url && currentConfiguredKey === key) {
    return activeSupabaseClient;
  }

  try {
    activeSupabaseClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    currentConfiguredUrl = url;
    currentConfiguredKey = key;
    return activeSupabaseClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Universally synchronizes Supabase credentials with the backend server so ANY device/browser
 * connects to the exact same database. If credentials already exist in env/localStorage,
 * returns immediately without blocking UI rendering.
 */
export async function initUniversalSupabase(): Promise<boolean> {
  // If already configured synchronously via environment or persistent cache, return immediately
  if (isSupabaseConfigured()) {
    // Non-blocking background verification with backend
    fetch('/api/supabase-config')
      .then(res => res.json())
      .then(data => {
        if (data.url && data.key && data.url.startsWith('http')) {
          const cleanUrl = data.url.trim();
          const cleanKey = data.key.trim();
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
            localStorage.setItem(STORAGE_ANON_KEY, cleanKey);
          }
        }
      })
      .catch(() => {});
    return true;
  }

  // Fallback for first-time devices without env variables
  try {
    const res = await fetch('/api/supabase-config');
    if (res.ok) {
      const data = await res.json();
      if (data.url && data.key && data.url.startsWith('http')) {
        const cleanUrl = data.url.trim();
        const cleanKey = data.key.trim();
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
          localStorage.setItem(STORAGE_ANON_KEY, cleanKey);
        }
        currentConfiguredUrl = cleanUrl;
        currentConfiguredKey = cleanKey;
        activeSupabaseClient = createClient(cleanUrl, cleanKey, {
          auth: { persistSession: true, autoRefreshToken: true },
          realtime: { params: { eventsPerSecond: 10 } }
        });
        return true;
      }
    }
  } catch (err) {
    console.warn('Backend Supabase config fetch notice:', err);
  }
  return isSupabaseConfigured();
}

/**
 * Saves Supabase credentials into persistent storage and refreshes client universally
 */
export function saveSupabaseCredentials(url: string, key: string): boolean {
  try {
    const cleanUrl = url.trim();
    const cleanKey = key.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
      localStorage.setItem(STORAGE_ANON_KEY, cleanKey);
    }
    currentConfiguredUrl = cleanUrl;
    currentConfiguredKey = cleanKey;
    activeSupabaseClient = createClient(cleanUrl, cleanKey, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 10 } }
    });

    // Broadcast and persist universally to backend server for mobile/cross-device access
    fetch('/api/supabase-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cleanUrl, key: cleanKey })
    }).catch((err) => console.warn('Server sync notice:', err));

    return true;
  } catch (e) {
    console.error('Failed to save Supabase credentials:', e);
    return false;
  }
}

/**
 * Removes custom stored Supabase credentials
 */
export function clearStoredSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_ANON_KEY);
  }
  activeSupabaseClient = null;
  currentConfiguredUrl = '';
  currentConfiguredKey = '';
}

/**
 * Tests connectivity and table accessibility in Supabase
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  tablesFound?: string[];
  missingTables?: string[];
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase credentials are not configured. Please supply your Project URL and Anon API Key.'
    };
  }

  const expectedTables = ['site_config', 'curtains', 'wallpapers', 'blinds', 'testimonials', 'bookings', 'inquiries', 'uploaded_images', 'transformations'];
  const tablesFound: string[] = [];
  const missingTables: string[] = [];

  for (const table of expectedTables) {
    try {
      const { error } = await client.from(table).select('id').limit(1);
      if (error) {
        missingTables.push(table);
      } else {
        tablesFound.push(table);
      }
    } catch {
      missingTables.push(table);
    }
  }

  if (tablesFound.length === expectedTables.length) {
    return {
      success: true,
      message: `Successfully connected to Supabase! All ${expectedTables.length} tables are online and synchronized.`,
      tablesFound,
      missingTables: []
    };
  } else if (tablesFound.length > 0) {
    return {
      success: true,
      message: `Connected to Supabase! (${tablesFound.length}/${expectedTables.length} tables verified). Use the SQL schema generator in the Admin Panel to create any missing tables.`,
      tablesFound,
      missingTables
    };
  } else {
    return {
      success: false,
      message: 'Connected to Supabase endpoint, but tables were not found. Please execute the provided SQL setup script in your Supabase SQL Editor.',
      tablesFound: [],
      missingTables: expectedTables
    };
  }
}

/**
 * Fetches all universal site data from Supabase
 */
export async function fetchUniversalSiteData(): Promise<{
  siteConfig: SiteConfig | null;
  curtains: CurtainItem[] | null;
  wallpapers: WallpaperItem[] | null;
  blinds: BlindItem[] | null;
  testimonials: Testimonial[] | null;
  bookings: BookingSubmission[] | null;
  inquiries: any[] | null;
  uploadedImages: UploadedImage[] | null;
  transformations: PortfolioItem[] | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      siteConfig: null,
      curtains: null,
      wallpapers: null,
      blinds: null,
      testimonials: null,
      bookings: null,
      inquiries: null,
      uploadedImages: null,
      transformations: null
    };
  }

  try {
    const [configRes, curtainsRes, wallpapersRes, blindsRes, testimonialsRes, bookingsRes, inquiriesRes, uploadedImagesRes, transformationsRes] = await Promise.allSettled([
      client.from('site_config').select('*').limit(5),
      client.from('curtains').select('*').order('created_at', { ascending: false }),
      client.from('wallpapers').select('*').order('created_at', { ascending: false }),
      client.from('blinds').select('*').order('created_at', { ascending: false }),
      client.from('testimonials').select('*').order('created_at', { ascending: false }),
      client.from('bookings').select('*').order('timestamp', { ascending: false }),
      client.from('inquiries').select('*').order('timestamp', { ascending: false }),
      client.from('uploaded_images').select('*').order('created_at', { ascending: false }).limit(50),
      client.from('transformations').select('*').order('created_at', { ascending: false })
    ]);

    let transformations: PortfolioItem[] | null = null;
    if (transformationsRes.status === 'fulfilled' && transformationsRes.value.data && transformationsRes.value.data.length > 0) {
      transformations = transformationsRes.value.data.map((item: any) => ({
        id: item.id,
        category: item.category || 'Living Room',
        title: item.title,
        description: item.description || '',
        beforeImage: item.before_image || item.beforeImage || item.before || '',
        afterImage: item.after_image || item.afterImage || item.after || ''
      }));
    }

    let siteConfig: SiteConfig | null = null;
    if (configRes.status === 'fulfilled' && configRes.value.data && configRes.value.data.length > 0) {
      const records = configRes.value.data;
      const targetRecord = records.find((r: any) => r.id === 'current_config') || records[0];
      const parsed = targetRecord.config || targetRecord.config_data || (targetRecord.heroLabel ? targetRecord : null);
      if (parsed) {
        const parsedObj = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
        const effectivePortfolio = (transformations && transformations.length > 0)
          ? transformations
          : (parsedObj.portfolioData && Array.isArray(parsedObj.portfolioData) && parsedObj.portfolioData.length > 0
              ? parsedObj.portfolioData
              : DEFAULT_SITE_CONFIG.portfolioData);

        siteConfig = {
          ...DEFAULT_SITE_CONFIG,
          ...parsedObj,
          portfolioData: effectivePortfolio,
          beforeAfterTitle: parsedObj.beforeAfterTitle || DEFAULT_SITE_CONFIG.beforeAfterTitle,
          beforeAfterSubtitle: parsedObj.beforeAfterSubtitle || DEFAULT_SITE_CONFIG.beforeAfterSubtitle,
          testimonialsSectionTitle: parsedObj.testimonialsSectionTitle || DEFAULT_SITE_CONFIG.testimonialsSectionTitle,
          testimonialsSectionSubtitle: parsedObj.testimonialsSectionSubtitle || DEFAULT_SITE_CONFIG.testimonialsSectionSubtitle,
          categoryShowcase: {
            curtains: {
              ...DEFAULT_SITE_CONFIG.categoryShowcase!.curtains,
              ...(parsedObj.categoryShowcase?.curtains || {})
            },
            wallpapers: {
              ...DEFAULT_SITE_CONFIG.categoryShowcase!.wallpapers,
              ...(parsedObj.categoryShowcase?.wallpapers || {})
            },
            blinds: {
              ...DEFAULT_SITE_CONFIG.categoryShowcase!.blinds,
              ...(parsedObj.categoryShowcase?.blinds || {})
            }
          }
        };
      }
    } else if (transformations && transformations.length > 0) {
      siteConfig = {
        ...DEFAULT_SITE_CONFIG,
        portfolioData: transformations
      };
    }

    let uploadedImages: UploadedImage[] = [];
    if (uploadedImagesRes.status === 'fulfilled' && uploadedImagesRes.value.data && uploadedImagesRes.value.data.length > 0) {
      uploadedImages = uploadedImagesRes.value.data.map((item: any) => ({
        id: item.id,
        filename: item.filename || 'image.jpg',
        file_url: item.file_url || item.base64_data || '',
        storage_path: item.storage_path || undefined,
        category: item.category || 'general',
        size_bytes: item.size_bytes || 0,
        mime_type: item.mime_type || 'image/jpeg',
        title: item.title || '',
        base64_data: item.base64_data || '',
        created_at: item.created_at || new Date().toISOString()
      }));
    }

    // Intelligently resolve Supabase image paths
    if (uploadedImages.length > 0 && siteConfig) {
      const activeConfig: SiteConfig = { ...siteConfig };

      // 1. Hero image from Supabase
      const heroUpload = uploadedImages.find(img => img.category === 'hero' && img.file_url);
      if (heroUpload && (!activeConfig.heroImageUrl || activeConfig.heroImageUrl.includes('unsplash.com'))) {
        activeConfig.heroImageUrl = heroUpload.file_url;
      }

      // 2. Curtains showcase thumbnail from Supabase
      const curtainsUpload = uploadedImages.find(img => 
        img.category === 'curtains' && 
        img.file_url && 
        (img.title.toLowerCase().includes('showcase') || img.title.toLowerCase().includes('thumbnail') || img.title.toLowerCase().includes('curtains'))
      );
      if (curtainsUpload && activeConfig.categoryShowcase?.curtains) {
        if (!activeConfig.categoryShowcase.curtains.thumbnail || activeConfig.categoryShowcase.curtains.thumbnail.includes('unsplash.com')) {
          activeConfig.categoryShowcase.curtains.thumbnail = curtainsUpload.file_url;
        }
      }

      // 3. Wallpapers showcase thumbnail from Supabase
      const wallpapersUpload = uploadedImages.find(img => 
        img.category === 'wallpapers' && 
        img.file_url && 
        (img.title.toLowerCase().includes('showcase') || img.title.toLowerCase().includes('thumbnail') || img.title.toLowerCase().includes('wallpaper'))
      );
      if (wallpapersUpload && activeConfig.categoryShowcase?.wallpapers) {
        if (!activeConfig.categoryShowcase.wallpapers.thumbnail || activeConfig.categoryShowcase.wallpapers.thumbnail.includes('unsplash.com')) {
          activeConfig.categoryShowcase.wallpapers.thumbnail = wallpapersUpload.file_url;
        }
      }

      // 4. Blinds showcase thumbnail from Supabase
      const blindsUpload = uploadedImages.find(img => 
        img.category === 'blinds' && 
        img.file_url && 
        (img.title.toLowerCase().includes('showcase') || img.title.toLowerCase().includes('thumbnail') || img.title.toLowerCase().includes('blind'))
      );
      if (blindsUpload && activeConfig.categoryShowcase?.blinds) {
        if (!activeConfig.categoryShowcase.blinds.thumbnail || activeConfig.categoryShowcase.blinds.thumbnail.includes('unsplash.com')) {
          activeConfig.categoryShowcase.blinds.thumbnail = blindsUpload.file_url;
        }
      }

      // 5. Why Choose Us image from Supabase
      const whyChooseUsUpload = uploadedImages.find(img => 
        (img.category === 'why_choose_us' || img.title.toLowerCase().includes('why choose us')) && 
        img.file_url
      );
      if (whyChooseUsUpload && (!activeConfig.whyChooseUsImageUrl || activeConfig.whyChooseUsImageUrl.includes('unsplash.com'))) {
        activeConfig.whyChooseUsImageUrl = whyChooseUsUpload.file_url;
      }

      // 6. Tailor-Made Customization Curtains image from Supabase
      const custCurtainsUpload = uploadedImages.find(img => 
        img.file_url && 
        (img.title.toLowerCase().includes('customization curtains') || (img.category === 'curtains' && img.title.toLowerCase().includes('customization')))
      );
      if (custCurtainsUpload && (!activeConfig.customizationCurtainsImage || activeConfig.customizationCurtainsImage.includes('unsplash.com'))) {
        activeConfig.customizationCurtainsImage = custCurtainsUpload.file_url;
      }

      // 7. Tailor-Made Customization Wallpaper image from Supabase
      const custWallpaperUpload = uploadedImages.find(img => 
        img.file_url && 
        (img.title.toLowerCase().includes('customization wallpaper') || (img.category === 'wallpapers' && img.title.toLowerCase().includes('customization')))
      );
      if (custWallpaperUpload && (!activeConfig.customizationWallpaperImage || activeConfig.customizationWallpaperImage.includes('unsplash.com'))) {
        activeConfig.customizationWallpaperImage = custWallpaperUpload.file_url;
      }

      siteConfig = activeConfig;
    }

    let curtains: CurtainItem[] | null = null;
    if (curtainsRes.status === 'fulfilled' && curtainsRes.value.data && curtainsRes.value.data.length > 0) {
      curtains = curtainsRes.value.data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        image: item.image,
        priceClass: item.price_class || item.priceClass || 'Premium',
        materials: Array.isArray(item.materials) ? item.materials : (item.materials ? JSON.parse(item.materials) : [])
      }));
    }

    let wallpapers: WallpaperItem[] | null = null;
    if (wallpapersRes.status === 'fulfilled' && wallpapersRes.value.data && wallpapersRes.value.data.length > 0) {
      wallpapers = wallpapersRes.value.data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        image: item.image,
        style: item.style || 'Classic',
        materials: Array.isArray(item.materials) ? item.materials : (item.materials ? JSON.parse(item.materials) : [])
      }));
    }

    let blinds: BlindItem[] | null = null;
    if (blindsRes.status === 'fulfilled' && blindsRes.value.data && blindsRes.value.data.length > 0) {
      blinds = blindsRes.value.data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        image: item.image,
        style: item.style || 'Classic',
        materials: Array.isArray(item.materials) ? item.materials : (item.materials ? JSON.parse(item.materials) : [])
      }));
    }

    let testimonials: Testimonial[] | null = null;
    if (testimonialsRes.status === 'fulfilled' && testimonialsRes.value.data && testimonialsRes.value.data.length > 0) {
      testimonials = testimonialsRes.value.data.map(item => ({
        id: item.id,
        name: item.name,
        location: item.location || '',
        role: item.role || '',
        review: item.review,
        rating: typeof item.rating === 'number' ? item.rating : 5,
        image: item.image || ''
      }));
    }

    let bookings: BookingSubmission[] | null = null;
    if (bookingsRes.status === 'fulfilled' && bookingsRes.value.data) {
      bookings = bookingsRes.value.data.map(item => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        email: item.email || '',
        preferredDate: item.preferred_date || item.preferredDate || '',
        projectType: item.project_type || item.projectType || 'Curtains Installation',
        budget: item.budget || '',
        location: item.location || '',
        message: item.message || '',
        timestamp: item.timestamp || item.created_at || new Date().toISOString()
      }));
    }

    let inquiries: any[] | null = null;
    if (inquiriesRes.status === 'fulfilled' && inquiriesRes.value.data) {
      inquiries = inquiriesRes.value.data;
    }

    // Persist to local cache immediately to ensure 0ms instantaneous loading on subsequent visits
    if (typeof window !== 'undefined') {
      try {
        if (siteConfig) localStorage.setItem('floatingdrapes_config', JSON.stringify(siteConfig));
        if (curtains && curtains.length > 0) localStorage.setItem('floatingdrapes_curtains', JSON.stringify(curtains));
        if (wallpapers && wallpapers.length > 0) localStorage.setItem('floatingdrapes_wallpapers', JSON.stringify(wallpapers));
        if (blinds && blinds.length > 0) localStorage.setItem('floatingdrapes_blinds', JSON.stringify(blinds));
        if (testimonials && testimonials.length > 0) localStorage.setItem('floatingdrapes_testimonials', JSON.stringify(testimonials));
        if (transformations && transformations.length > 0) localStorage.setItem('floatingdrapes_transformations', JSON.stringify(transformations));
        localStorage.setItem('floatingdrapes_has_synced_supabase', 'true');

        // Preload key visual assets into browser cache to eliminate visual pops
        const urlsToPreload = [
          siteConfig?.heroImageUrl,
          siteConfig?.categoryShowcase?.curtains?.thumbnail,
          siteConfig?.categoryShowcase?.wallpapers?.thumbnail,
          siteConfig?.categoryShowcase?.blinds?.thumbnail,
          siteConfig?.customizationCurtainsImage,
          siteConfig?.customizationWallpaperImage,
          siteConfig?.whyChooseUsImageUrl,
          ...(transformations || []).slice(0, 3).map(t => [t.beforeImage, t.afterImage]).flat()
        ].filter(Boolean) as string[];

        urlsToPreload.slice(0, 8).forEach(src => {
          if (src && typeof src === 'string' && src.startsWith('http')) {
            const preloader = new Image();
            preloader.src = normalizeGoogleDriveUrl(src);
          }
        });
      } catch (cacheErr) {
        console.warn('LocalStorage cache write notice:', cacheErr);
      }
    }

    return { siteConfig, curtains, wallpapers, blinds, testimonials, bookings, inquiries, uploadedImages, transformations };
  } catch (err) {
    console.error('Error fetching data from Supabase:', err);
    return {
      siteConfig: null,
      curtains: null,
      wallpapers: null,
      blinds: null,
      testimonials: null,
      bookings: null,
      inquiries: null,
      uploadedImages: null,
      transformations: null
    };
  }
}

/**
 * Universal Site Config Mutations
 */
export async function syncSiteConfigToSupabase(config: SiteConfig): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // If config contains portfolio transformations, sync them to transformations table as well
    if (config.portfolioData && Array.isArray(config.portfolioData) && config.portfolioData.length > 0) {
      syncAllTransformationsToSupabase(config.portfolioData).catch(() => {});
    }

    let { error } = await client.from('site_config').upsert({
      id: 'current_config',
      config: config,
      updated_at: new Date().toISOString()
    });

    if (error && (error.message?.includes('column "config"') || error.message?.includes('does not exist'))) {
      const retry = await client.from('site_config').upsert({
        id: 'current_config',
        config_data: config,
        updated_at: new Date().toISOString()
      });
      error = retry.error;
    }

    if (error) {
      console.warn('Upsert fallback to update:', error.message);
      const updateRes = await client.from('site_config').update({
        config: config,
        updated_at: new Date().toISOString()
      }).eq('id', 'current_config');
      if (!updateRes.error) return true;
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Failed to sync site config to Supabase:', err);
    return false;
  }
}

/**
 * Universal Curtains Product Mutations
 */
export async function upsertCurtainToSupabase(item: CurtainItem): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const normImage = normalizeGoogleDriveUrl(item.image);
    const payload: any = {
      id: item.id,
      name: item.name,
      description: item.description,
      image: normImage,
      price_class: item.priceClass,
      materials: item.materials,
      updated_at: new Date().toISOString()
    };
    const { error } = await client.from('curtains').upsert(payload);
    if (error) {
      console.warn('Initial curtain upsert failed, retrying simplified payload:', error.message);
      const fallback = {
        id: item.id,
        name: item.name,
        description: item.description,
        image: normImage
      };
      const res2 = await client.from('curtains').upsert(fallback);
      if (res2.error) throw res2.error;
    }
    return true;
  } catch (err) {
    console.error('Failed to upsert curtain in Supabase:', err);
    return false;
  }
}

export async function deleteCurtainFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('curtains').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to delete curtain from Supabase:', err);
    return false;
  }
}

/**
 * Universal Wallpapers Product Mutations
 */
export async function upsertWallpaperToSupabase(item: WallpaperItem): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const normImage = normalizeGoogleDriveUrl(item.image);
    const payload: any = {
      id: item.id,
      name: item.name,
      description: item.description,
      image: normImage,
      style: item.style,
      materials: item.materials,
      updated_at: new Date().toISOString()
    };
    const { error } = await client.from('wallpapers').upsert(payload);
    if (error) {
      console.warn('Initial wallpaper upsert failed, retrying simplified payload:', error.message);
      const fallback = {
        id: item.id,
        name: item.name,
        description: item.description,
        image: normImage
      };
      const res2 = await client.from('wallpapers').upsert(fallback);
      if (res2.error) throw res2.error;
    }
    return true;
  } catch (err) {
    console.error('Failed to upsert wallpaper in Supabase:', err);
    return false;
  }
}

export async function deleteWallpaperFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('wallpapers').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to delete wallpaper from Supabase:', err);
    return false;
  }
}

/**
 * Universal Blinds Product Mutations
 */
export async function upsertBlindToSupabase(item: BlindItem): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const normImage = normalizeGoogleDriveUrl(item.image);
    const payload: any = {
      id: item.id,
      name: item.name,
      description: item.description,
      image: normImage,
      style: item.style,
      materials: item.materials,
      updated_at: new Date().toISOString()
    };
    const { error } = await client.from('blinds').upsert(payload);
    if (error) {
      console.warn('Initial blind upsert failed, retrying simplified payload:', error.message);
      const fallback = {
        id: item.id,
        name: item.name,
        description: item.description,
        image: normImage
      };
      const res2 = await client.from('blinds').upsert(fallback);
      if (res2.error) throw res2.error;
    }
    return true;
  } catch (err) {
    console.error('Failed to upsert blind in Supabase:', err);
    return false;
  }
}

export async function deleteBlindFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('blinds').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to delete blind from Supabase:', err);
    return false;
  }
}

/**
 * Universal Consultations & Bookings Mutations
 */
export async function insertBookingToSupabase(booking: BookingSubmission): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('bookings').insert({
      id: booking.id,
      name: booking.name,
      phone: booking.phone,
      email: booking.email || '',
      preferred_date: booking.preferredDate || '',
      project_type: booking.projectType,
      budget: booking.budget || '',
      location: booking.location || '',
      message: booking.message || '',
      timestamp: booking.timestamp || new Date().toISOString()
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to insert booking into Supabase:', err);
    return false;
  }
}

export async function deleteBookingFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('bookings').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to delete booking from Supabase:', err);
    return false;
  }
}

/**
 * Universal Contact & Inquiries Mutations
 */
export async function insertInquiryToSupabase(inquiry: {
  id: string;
  name: string;
  phone: string;
  email: string;
  projectType: string;
  location: string;
  message: string;
  timestamp: string;
}): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('inquiries').insert({
      id: inquiry.id,
      name: inquiry.name,
      phone: inquiry.phone,
      email: inquiry.email,
      project_type: inquiry.projectType,
      location: inquiry.location,
      message: inquiry.message,
      timestamp: inquiry.timestamp
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to insert inquiry into Supabase:', err);
    return false;
  }
}

export async function deleteInquiryFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('inquiries').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to delete inquiry from Supabase:', err);
    return false;
  }
}

/**
 * Universal Feedback / Testimonials Mutations
 */
export async function upsertFeedbackToSupabase(item: Testimonial): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('testimonials').upsert({
      id: item.id,
      name: item.name,
      location: item.location || '',
      role: item.role || '',
      review: item.review,
      rating: item.rating || 5,
      image: item.image || '',
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to upsert testimonial in Supabase:', err);
    return false;
  }
}

export async function deleteFeedbackFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('testimonials').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to delete testimonial from Supabase:', err);
    return false;
  }
}

/**
 * Universal Transformations / Before & After Mutations
 */
export async function upsertTransformationToSupabase(item: PortfolioItem): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const normBefore = normalizeGoogleDriveUrl(item.beforeImage);
    const normAfter = normalizeGoogleDriveUrl(item.afterImage);
    const payload: any = {
      id: item.id,
      title: item.title,
      description: item.description || '',
      before_image: normBefore,
      after_image: normAfter,
      category: item.category || 'Living Room',
      updated_at: new Date().toISOString()
    };
    const { error } = await client.from('transformations').upsert(payload);
    if (error) {
      console.warn('Initial transformation upsert notice:', error.message);
      // Fallback with camelCase properties if table was created with camelCase
      const fallback = {
        id: item.id,
        title: item.title,
        description: item.description || '',
        beforeImage: normBefore,
        afterImage: normAfter,
        category: item.category || 'Living Room'
      };
      const res2 = await client.from('transformations').upsert(fallback);
      if (res2.error) {
        console.warn('Fallback transformation upsert notice:', res2.error.message);
      }
    }
    return true;
  } catch (err) {
    console.warn('Failed to upsert transformation in Supabase:', err);
    return false;
  }
}

export async function deleteTransformationFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('transformations').delete().eq('id', id);
    if (error) {
      console.warn('Transformation delete notice:', error.message);
    }
    return true;
  } catch (err) {
    console.warn('Failed to delete transformation from Supabase:', err);
    return false;
  }
}

export async function syncAllTransformationsToSupabase(items: PortfolioItem[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !items || items.length === 0) return false;

  try {
    const payload = items.map((item, index) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      before_image: normalizeGoogleDriveUrl(item.beforeImage),
      after_image: normalizeGoogleDriveUrl(item.afterImage),
      category: item.category || 'Living Room',
      updated_at: new Date(Date.now() - index * 1000).toISOString()
    }));
    const { error } = await client.from('transformations').upsert(payload);
    if (error) {
      console.warn('Batch transformations upsert notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Batch transformations sync error:', err);
    return false;
  }
}

export async function fetchTransformationsFromSupabase(): Promise<PortfolioItem[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('transformations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return null;
    }

    return data.map((item: any) => ({
      id: item.id,
      category: item.category || 'Living Room',
      title: item.title,
      description: item.description || '',
      beforeImage: item.before_image || item.beforeImage || item.before || '',
      afterImage: item.after_image || item.afterImage || item.after || ''
    }));
  } catch (err) {
    console.warn('Failed to fetch transformations from Supabase:', err);
    return null;
  }
}

/**
 * Local cache key for uploaded images
 */
const STORAGE_MEDIA_KEY = 'floatingdrapes_uploaded_images';

export function getStoredUploadedImages(): UploadedImage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_MEDIA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredUploadedImages(images: UploadedImage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_MEDIA_KEY, JSON.stringify(images));
  } catch (e) {
    console.warn('Failed to cache images in localStorage:', e);
  }
}

/**
 * Compresses an image client-side to ensure fast uploads, minimal payload, and reliable storage
 */
export async function compressImageClientSide(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = () => resolve({ blob: file, dataUrl: (reader.result as string) || '' });
      reader.onerror = () => resolve({ blob: file, dataUrl: '' });
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve({ blob: file, dataUrl: (reader.result as string) || '' });
        reader.readAsDataURL(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      canvas.toBlob(
        (blob) => {
          resolve({ blob: blob || file, dataUrl });
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve({ blob: file, dataUrl: (reader.result as string) || '' });
      reader.readAsDataURL(file);
    };
    img.src = objectUrl;
  });
}

/**
 * Uploads an image file to Supabase Storage bucket 'images' and saves metadata to public.uploaded_images table
 */
export async function uploadImageToSupabase(
  file: File,
  options?: {
    category?: 'curtains' | 'wallpapers' | 'blinds' | 'hero' | 'gallery' | 'general' | 'why_choose_us' | 'customization' | 'portfolio';
    title?: string;
  }
): Promise<{
  success: boolean;
  data?: UploadedImage;
  message: string;
  error?: string;
}> {
  const { blob: uploadBlob, dataUrl } = await compressImageClientSide(file, 1600, 0.85);

  const client = getSupabaseClient();
  const id = 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const cleanCategory = options?.category || 'general';
  const cleanTitle = options?.title?.trim() || file.name.replace(/\.[^/.]+$/, '');
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `${cleanCategory}/${Date.now()}_${sanitizedName}`;

  let finalUrl = dataUrl;
  let isStorageUploaded = false;

  if (client) {
    try {
      let uploadResult = await client.storage
        .from('images')
        .upload(storagePath, uploadBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg'
        });

      if (uploadResult.error && uploadResult.error.message?.toLowerCase().includes('not found')) {
        try {
          await client.storage.createBucket('images', { public: true });
          uploadResult = await client.storage
            .from('images')
            .upload(storagePath, uploadBlob, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type || 'image/jpeg'
            });
        } catch {
          // ignore bucket creation error
        }
      }

      if (!uploadResult.error && uploadResult.data) {
        const { data: publicUrlData } = client.storage.from('images').getPublicUrl(storagePath);
        if (publicUrlData?.publicUrl) {
          finalUrl = publicUrlData.publicUrl;
          isStorageUploaded = true;
        }
      } else if (uploadResult.error) {
        console.warn('Supabase storage upload notice:', uploadResult.error.message);
      }
    } catch (storageErr) {
      console.warn('Storage attempt skipped or bucket unavailable:', storageErr);
    }

    try {
      const record: any = {
        id,
        filename: file.name,
        file_url: finalUrl,
        storage_path: isStorageUploaded ? storagePath : null,
        category: cleanCategory,
        size_bytes: uploadBlob.size || file.size,
        mime_type: file.type || 'image/jpeg',
        title: cleanTitle,
        base64_data: dataUrl,
        created_at: new Date().toISOString()
      };

      const { error: dbErr } = await client
        .from('uploaded_images')
        .insert([record]);

      if (!dbErr) {
        const currentCache = getStoredUploadedImages();
        const updated = [record as UploadedImage, ...currentCache];
        saveStoredUploadedImages(updated);

        return {
          success: true,
          data: record as UploadedImage,
          message: isStorageUploaded 
            ? 'Image successfully uploaded to Supabase Storage and registered in database!'
            : 'Image saved directly to your Supabase uploaded_images database table!'
        };
      } else {
        console.warn('Supabase DB table insertion noticed:', dbErr.message);
      }
    } catch (dbErr: any) {
      console.warn('Supabase database insert error:', dbErr);
    }
  }

  // Fallback: save to local cache if Supabase is offline
  const fallbackRecord: UploadedImage = {
    id,
    filename: file.name,
    file_url: dataUrl,
    category: cleanCategory,
    size_bytes: uploadBlob.size || file.size,
    mime_type: file.type || 'image/jpeg',
    title: cleanTitle,
    base64_data: dataUrl,
    created_at: new Date().toISOString()
  };

  const currentCache = getStoredUploadedImages();
  const updated = [fallbackRecord, ...currentCache];
  saveStoredUploadedImages(updated);

  return {
    success: true,
    data: fallbackRecord,
    message: client 
      ? 'Image saved locally and ready.'
      : 'Image saved locally.'
  };
}

/**
 * Imports an image from a Google Drive link or direct URL, saves metadata and optional base64
 * to Supabase 'uploaded_images' table and local cache so it works universally across all devices.
 */
export async function importImageFromUrlToSupabase(
  rawUrl: string,
  options?: {
    category?: 'curtains' | 'wallpapers' | 'blinds' | 'hero' | 'gallery' | 'general' | 'portfolio' | 'why_choose_us' | 'customization';
    title?: string;
  }
): Promise<{
  success: boolean;
  data?: UploadedImage;
  message: string;
  error?: string;
}> {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return { success: false, message: 'Please provide a valid image URL or Google Drive link.' };
  }

  const cleanUrl = rawUrl.trim();
  const directCdnUrl = normalizeGoogleDriveUrl(cleanUrl);
  const fileId = extractGoogleDriveFileId(cleanUrl);
  const isDrive = Boolean(fileId);

  const cleanCategory = options?.category || 'general';
  const cleanTitle = options?.title?.trim() || (isDrive ? `Google Drive Photo (${fileId!.substring(0, 8)})` : 'Imported Web Image');
  const id = 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

  let finalUrl = directCdnUrl;
  let base64Data: string | undefined;
  let mimeType = 'image/jpeg';
  let sizeBytes = 0;

  // Try server-side import endpoint to get cached image bytes if available
  try {
    const res = await fetch('/api/import-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: cleanUrl,
        title: cleanTitle,
        category: cleanCategory
      })
    });

    if (res.ok) {
      const serverData = await res.json();
      if (serverData.directUrl) finalUrl = serverData.directUrl;
      if (serverData.base64Data) base64Data = serverData.base64Data;
      if (serverData.mimeType) mimeType = serverData.mimeType;
      if (serverData.sizeBytes) sizeBytes = serverData.sizeBytes;
    }
  } catch (err) {
    console.warn('Server import-image API notice (using client normalization):', err);
  }

  const client = getSupabaseClient();
  const record: UploadedImage = {
    id,
    filename: isDrive ? `gdrive_${fileId}.jpg` : 'imported_image.jpg',
    file_url: finalUrl,
    category: cleanCategory,
    size_bytes: sizeBytes,
    mime_type: mimeType,
    title: cleanTitle,
    base64_data: base64Data,
    created_at: new Date().toISOString()
  };

  if (client) {
    try {
      const { error: dbErr } = await client
        .from('uploaded_images')
        .insert([record]);

      if (!dbErr) {
        const currentCache = getStoredUploadedImages();
        const updated = [record, ...currentCache.filter(img => img.id !== id)];
        saveStoredUploadedImages(updated);

        return {
          success: true,
          data: record,
          message: isDrive
            ? 'Google Drive image recognized and saved to your universal Supabase database!'
            : 'Image link successfully saved to your universal Supabase database!'
        };
      }
    } catch (err) {
      console.warn('DB insertion notice for imported image:', err);
    }
  }

  // Fallback to local cache
  const currentCache = getStoredUploadedImages();
  const updated = [record, ...currentCache.filter(img => img.id !== id)];
  saveStoredUploadedImages(updated);

  return {
    success: true,
    data: record,
    message: isDrive
      ? 'Google Drive image recognized and saved locally!'
      : 'Image URL recognized and saved locally!'
  };
}

/**
 * Fetches all uploaded images from Supabase database table 'uploaded_images'
 */
export async function fetchUploadedImagesFromSupabase(): Promise<UploadedImage[]> {
  const client = getSupabaseClient();
  const localImages = getStoredUploadedImages();

  if (!client) {
    return localImages;
  }

  try {
    const { data, error } = await client
      .from('uploaded_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Could not query uploaded_images table from Supabase:', error.message);
      return localImages;
    }

    if (data && data.length > 0) {
      const formatted: UploadedImage[] = data.map((item: any) => ({
        id: item.id,
        filename: item.filename || 'image.jpg',
        file_url: item.file_url || item.base64_data || '',
        storage_path: item.storage_path || undefined,
        category: item.category || 'general',
        size_bytes: item.size_bytes || 0,
        mime_type: item.mime_type || 'image/jpeg',
        title: item.title || item.filename,
        base64_data: item.base64_data,
        created_at: item.created_at || new Date().toISOString()
      }));

      saveStoredUploadedImages(formatted);
      return formatted;
    }

    return localImages;
  } catch (err) {
    console.warn('Error fetching uploaded images:', err);
    return localImages;
  }
}

/**
 * Deletes an uploaded image from Supabase database and storage
 */
export async function deleteUploadedImageFromSupabase(id: string, storagePath?: string): Promise<boolean> {
  const client = getSupabaseClient();

  const localImages = getStoredUploadedImages();
  const updated = localImages.filter(img => img.id !== id);
  saveStoredUploadedImages(updated);

  if (!client) return true;

  try {
    await client.from('uploaded_images').delete().eq('id', id);

    if (storagePath) {
      await client.storage.from('images').remove([storagePath]);
    }

    return true;
  } catch (err) {
    console.error('Failed to delete uploaded image from Supabase:', err);
    return false;
  }
}

/**
 * One-Click Seed Catalog: Uploads current comprehensive catalog into Supabase
 */
export async function seedDefaultCatalogToSupabase(customConfig?: SiteConfig): Promise<{
  success: boolean;
  message: string;
  counts: { curtains: number; wallpapers: number; blinds: number; testimonials: number };
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase client is not initialized. Please connect your credentials first.',
      counts: { curtains: 0, wallpapers: 0, blinds: 0, testimonials: 0 }
    };
  }

  try {
    // 1. Seed Site Config
    await client.from('site_config').upsert({
      id: 'current_config',
      config: customConfig || DEFAULT_SITE_CONFIG,
      updated_at: new Date().toISOString()
    });

    // 2. Seed Curtains
    const curtainsPayload = EXTENDED_CURTAINS_DATA.map((c, i) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      image: c.image,
      price_class: c.priceClass,
      materials: c.materials,
      created_at: new Date(Date.now() - i * 1000).toISOString()
    }));
    await client.from('curtains').upsert(curtainsPayload);

    // 3. Seed Wallpapers
    const wallpapersPayload = EXTENDED_WALLPAPERS_DATA.map((w, i) => ({
      id: w.id,
      name: w.name,
      description: w.description,
      image: w.image,
      style: w.style,
      materials: w.materials,
      created_at: new Date(Date.now() - i * 1000).toISOString()
    }));
    await client.from('wallpapers').upsert(wallpapersPayload);

    // 4. Seed Blinds
    const blindsPayload = EXTENDED_BLINDS_DATA.map((b, i) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      image: b.image,
      style: b.style,
      materials: b.materials,
      created_at: new Date(Date.now() - i * 1000).toISOString()
    }));
    await client.from('blinds').upsert(blindsPayload);

    // 5. Seed Testimonials / Feedbacks
    const testimonialsPayload = TESTIMONIALS_DATA.map((t, i) => ({
      id: t.id,
      name: t.name,
      location: t.location,
      role: t.role || '',
      review: t.review,
      rating: t.rating || 5,
      image: t.image || '',
      created_at: new Date(Date.now() - i * 1000).toISOString()
    }));
    await client.from('testimonials').upsert(testimonialsPayload);

    // 6. Seed Transformations / Before & After Cards
    const transformationsPayload = PORTFOLIO_DATA.map((p, i) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      before_image: p.beforeImage,
      after_image: p.afterImage,
      category: p.category || 'Living Room',
      created_at: new Date(Date.now() - i * 1000).toISOString(),
      updated_at: new Date(Date.now() - i * 1000).toISOString()
    }));
    try {
      await client.from('transformations').upsert(transformationsPayload);
    } catch {
      // Table may not exist yet
    }

    return {
      success: true,
      message: `Universal seed completed! Seeded ${curtainsPayload.length} curtains, ${wallpapersPayload.length} wallpapers, ${blindsPayload.length} blinds, ${testimonialsPayload.length} testimonials, and ${transformationsPayload.length} transformations to Supabase.`,
      counts: {
        curtains: curtainsPayload.length,
        wallpapers: wallpapersPayload.length,
        blinds: blindsPayload.length,
        testimonials: testimonialsPayload.length
      }
    };
  } catch (err: any) {
    console.error('Failed to seed Supabase database:', err);
    return {
      success: false,
      message: `Seeding error: ${err?.message || 'Database transaction rejected. Ensure tables exist in Supabase.'}`,
      counts: { curtains: 0, wallpapers: 0, blinds: 0, testimonials: 0 }
    };
  }
}

/**
 * Universal Realtime Subscription Listener
 */
export function subscribeToUniversalChanges(onUpdate: (table: string, payload: any) => void) {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel = client
      .channel('universal-site-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_config' },
        payload => onUpdate('site_config', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'curtains' },
        payload => onUpdate('curtains', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wallpapers' },
        payload => onUpdate('wallpapers', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blinds' },
        payload => onUpdate('blinds', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'testimonials' },
        payload => onUpdate('testimonials', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transformations' },
        payload => onUpdate('transformations', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        payload => onUpdate('bookings', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        payload => onUpdate('inquiries', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'uploaded_images' },
        payload => onUpdate('uploaded_images', payload)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('⚡ Universal Supabase Realtime synchronization active.');
        }
      });

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.error('Error setting up Supabase Realtime listener:', err);
    return null;
  }
}

/**
 * Ready-to-use PostgreSQL SQL Schema for Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- ========================================================================
-- FLOATING DRAPES UNIVERSAL SUPABASE DATABASE SCHEMA
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.site_config (
  id TEXT PRIMARY KEY,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.curtains (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  price_class TEXT DEFAULT 'Premium',
  materials JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.wallpapers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  style TEXT DEFAULT 'Classic',
  materials JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.blinds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  style TEXT DEFAULT 'Classic',
  materials JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  role TEXT,
  review TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_date TEXT,
  project_type TEXT NOT NULL,
  budget TEXT,
  location TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  project_type TEXT,
  location TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.uploaded_images (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT,
  category TEXT DEFAULT 'general',
  size_bytes BIGINT DEFAULT 0,
  mime_type TEXT,
  title TEXT,
  base64_data TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transformations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  before_image TEXT NOT NULL,
  after_image TEXT NOT NULL,
  category TEXT DEFAULT 'Living Room',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curtains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blinds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformations ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public All site_config" ON public.site_config;
  CREATE POLICY "Public All site_config" ON public.site_config FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public All curtains" ON public.curtains;
  CREATE POLICY "Public All curtains" ON public.curtains FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public All wallpapers" ON public.wallpapers;
  CREATE POLICY "Public All wallpapers" ON public.wallpapers FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public All blinds" ON public.blinds;
  CREATE POLICY "Public All blinds" ON public.blinds FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public All testimonials" ON public.testimonials;
  CREATE POLICY "Public All testimonials" ON public.testimonials FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public All bookings" ON public.bookings;
  CREATE POLICY "Public All bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public All inquiries" ON public.inquiries;
  CREATE POLICY "Public All inquiries" ON public.inquiries FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public All uploaded_images" ON public.uploaded_images;
  CREATE POLICY "Public All uploaded_images" ON public.uploaded_images FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public All transformations" ON public.transformations;
  CREATE POLICY "Public All transformations" ON public.transformations FOR ALL USING (true) WITH CHECK (true);
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Storage Access" ON storage.objects;
  CREATE POLICY "Public Storage Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');

  DROP POLICY IF EXISTS "Public Storage Insert" ON storage.objects;
  CREATE POLICY "Public Storage Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');

  DROP POLICY IF EXISTS "Public Storage Update" ON storage.objects;
  CREATE POLICY "Public Storage Update" ON storage.objects FOR UPDATE USING (bucket_id = 'images') WITH CHECK (bucket_id = 'images');

  DROP POLICY IF EXISTS "Public Storage Delete" ON storage.objects;
  CREATE POLICY "Public Storage Delete" ON storage.objects FOR DELETE USING (bucket_id = 'images');
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;
`;
