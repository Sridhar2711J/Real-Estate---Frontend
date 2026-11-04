'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { propertyService } from '@/services/propertyService';
import { Property, ListingType } from '@/types';
import {
  Pencil,
  Building2,
  Image as ImageIcon,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  AlertCircle,
  AlertTriangle,
  Check,
  Sparkles,
  Save,
  ExternalLink,
  MapPin,
} from 'lucide-react';

const SUGGESTED_FEATURES = [
  'Modular Kitchen',
  'Covered Car Parking',
  '24/7 Gated Security',
  'Italian Marble Flooring',
  'Smart Home Automation',
  'Private Swimming Pool',
  'Hill / Sea Scenic View',
  'Clubhouse & Gym',
  'High-Speed Elevators',
  'Private Terrace Deck',
  'Power Backup',
  'Solar Water Heating',
  'Vaastu Compliant',
  'Spacious Balcony',
  'Children Play Area',
  'EV Charging Station',
];

const POPULAR_CITIES = [
  'Pune',
  'Mumbai',
  'Bangalore',
  'Hyderabad',
  'Delhi',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Goa',
  'Jaipur',
  'Surat',
  'Chandigarh',
  'Kochi',
  'Lucknow',
  'Indore',
  'Nagpur',
  'Bhopal',
  'Visakhapatnam',
  'Patna',
  'Vadodara',
];

// In-memory cache for all Indian cities from CountriesNow API
let cachedIndianCities: string[] = [];

interface EditGalleryImage {
  id: string;
  file?: File;
  previewUrl: string;
  caption: string;
  sortOrder: number;
}

export default function EditPropertyClient() {
  const router = useRouter();
  const params = useParams();

  const propertyId =
    typeof params?.slug === 'string'
      ? params.slug
      : Array.isArray(params?.slug)
      ? params.slug[0]
      : '';

  // Property loaded from API
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [title, setTitle] = useState('');
  const [listingType, setListingType] = useState<ListingType>('sale');
  const [propertyType, setPropertyType] = useState('apartment');
  const [status, setStatus] = useState<'active' | 'inactive' | 'sold'>('active');
  const [city, setCity] = useState('');
  const [citySearchInput, setCitySearchInput] = useState('');
  const [indianCities, setIndianCities] = useState<string[]>(cachedIndianCities);
  const [loadingCitiesApi, setLoadingCitiesApi] = useState<boolean>(cachedIndianCities.length === 0);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [description, setDescription] = useState('');

  // Features - dynamic add
  const [features, setFeatures] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState('');

  // Cover Image - file upload only
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Gallery Images - file upload only, sort order, captions
  const [images, setImages] = useState<EditGalleryImage[]>([]);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const topRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (errorMsg || success) {
      scrollToTop();
    }
  }, [errorMsg, success]);

  // Fetch property from API
  useEffect(() => {
    let isMounted = true;
    async function loadProperty() {
      setLoading(true);
      try {
        const res = await propertyService.getPropertyById(propertyId);
        if (isMounted && res && res.success && res.property) {
          setProperty(res.property);
        }
      } catch (err) {
        console.error('Failed to load property for editing:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (propertyId) {
      loadProperty();
    }

    return () => {
      isMounted = false;
    };
  }, [propertyId]);

  // Populate form when property is loaded
  useEffect(() => {
    if (property) {
      setTitle(property.title || '');
      setListingType(property.listingType || 'sale');
      setStatus((property.status as 'active' | 'inactive' | 'sold') || 'active');
      setPropertyType(property.propertyType || 'apartment');
      setCity(property.city || '');
      setCitySearchInput(property.city || '');
      setLocation(property.location || '');
      setAddress(property.address || '');
      setPrice(property.price !== undefined ? String(property.price) : '');
      setArea(property.area !== undefined ? String(property.area) : '');
      setBedrooms(property.bedrooms !== undefined ? String(property.bedrooms) : '');
      setBathrooms(property.bathrooms !== undefined ? String(property.bathrooms) : '');
      setCoverPreview(property.coverImage || '');
      setCoverFile(null);
      setDescription(property.description || '');
      setFeatures(Array.isArray(property.features) ? property.features : []);
      if (Array.isArray(property.images) && property.images.length > 0) {
        setImages(
          property.images.map((img, i) => ({
            id: img.id || `existing-${i}`,
            previewUrl: img.url,
            caption: img.caption || '',
            sortOrder: img.sortOrder ?? i + 1,
          }))
        );
      } else {
        setImages([]);
      }
    }
  }, [property]);

  // City selection handler
  const handleSelectCity = (selectedName: string) => {
    setCity(selectedName);
    setCitySearchInput(selectedName);
    setShowCityDropdown(false);
  };

  // Close city dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Indian cities from CountriesNow API: https://countriesnow.space/api/v0.1/countries/cities
  useEffect(() => {
    if (cachedIndianCities.length > 0) {
      setIndianCities(cachedIndianCities);
      setLoadingCitiesApi(false);
      return;
    }

    let isMounted = true;
    async function loadIndiaCities() {
      setLoadingCitiesApi(true);
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: 'india' }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json && !json.error && Array.isArray(json.data) && json.data.length > 0) {
            cachedIndianCities = json.data;
            if (isMounted) {
              setIndianCities(json.data);
            }
          }
        }
      } catch (err) {
        console.warn('CountriesNow cities API load failed, using local list:', err);
      } finally {
        if (isMounted) {
          setLoadingCitiesApi(false);
        }
      }
    }

    loadIndiaCities();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter Indian cities from CountriesNow based on current search input
  const filteredIndianCities = useMemo(() => {
    const query = citySearchInput.trim().toLowerCase();
    const sourceList = indianCities.length > 0 ? indianCities : POPULAR_CITIES;
    if (!query) {
      return POPULAR_CITIES;
    }
    const startsWithMatches: string[] = [];
    const includesMatches: string[] = [];
    for (const c of sourceList) {
      const lower = c.toLowerCase();
      if (lower.startsWith(query)) {
        startsWithMatches.push(c);
      } else if (lower.includes(query)) {
        includesMatches.push(c);
      }
      if (startsWithMatches.length + includesMatches.length >= 60) break;
    }
    return [...startsWithMatches, ...includesMatches].slice(0, 50);
  }, [indianCities, citySearchInput]);

  // Feature actions
  const addFeatureItem = (featName: string) => {
    const trimmed = featName.trim();
    if (!trimmed) return;
    if (!features.some((f) => f.toLowerCase() === trimmed.toLowerCase())) {
      setFeatures((prev) => [...prev, trimmed]);
    }
  };

  const handleCustomFeatureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFeature.trim()) {
      addFeatureItem(customFeature);
      setCustomFeature('');
    }
  };

  const removeFeatureItem = (feat: string) => {
    setFeatures((prev) => prev.filter((f) => f !== feat));
  };

  // Cover image file selection
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, or WebP).');
      scrollToTop();
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Cover image exceeds the 10MB file size limit.');
      scrollToTop();
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  // Gallery multi-file upload
  const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg('');
    const newItems: EditGalleryImage[] = [];

    Array.from(files).forEach((file, index) => {
      if (!file.type.startsWith('image/')) {
        setErrorMsg(`"${file.name}" is not a valid image file.`);
        scrollToTop();
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg(`"${file.name}" exceeds the 10MB file size limit.`);
        scrollToTop();
        return;
      }

      newItems.push({
        id: `img-new-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        caption: file.name.replace(/\.[^/.]+$/, ''),
        sortOrder: images.length + index + 1,
      });
    });

    if (newItems.length > 0) {
      setImages((prev) => {
        const combined = [...prev, ...newItems];
        return combined.map((item, i) => ({ ...item, sortOrder: i + 1 }));
      });
    }

    if (galleryFileInputRef.current) {
      galleryFileInputRef.current.value = '';
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated.map((img, i) => ({ ...img, sortOrder: i + 1 }));
    });
  };

  const handleMoveDown = (index: number) => {
    setImages((prev) => {
      if (index >= prev.length - 1) return prev;
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated.map((img, i) => ({ ...img, sortOrder: i + 1 }));
    });
  };

  const handleRemoveGalleryImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((img, i) => ({ ...img, sortOrder: i + 1 }));
    });
  };

  const handleCaptionChange = (index: number, caption: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, caption } : img))
    );
  };

  const handleSetAsCover = (item: EditGalleryImage) => {
    setCoverFile(item.file ? item.file : null);
    setCoverPreview(item.previewUrl);
  };

  // Update handler
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Title is required (*).');
      scrollToTop();
      return;
    }
    if (!propertyType) {
      setErrorMsg('Property Type is required (*).');
      scrollToTop();
      return;
    }
    if (!city.trim()) {
      setErrorMsg('City is required (*).');
      scrollToTop();
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Location is required (*).');
      scrollToTop();
      return;
    }
    if (!price || !String(price).trim()) {
      setErrorMsg('Price is required (*).');
      scrollToTop();
      return;
    }
    if (!area || !String(area).trim()) {
      setErrorMsg('Area is required (*).');
      scrollToTop();
      return;
    }
    if (!bedrooms || !String(bedrooms).trim()) {
      setErrorMsg('Bedrooms is required (*).');
      scrollToTop();
      return;
    }
    if (!bathrooms || !String(bathrooms).trim()) {
      setErrorMsg('Bathrooms is required (*).');
      scrollToTop();
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Detailed Description is required (*).');
      scrollToTop();
      return;
    }
    if (!coverPreview && !coverFile) {
      setErrorMsg('Cover Image is required (*). Please upload an image file.');
      scrollToTop();
      return;
    }

    setSaving(true);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('listingType', listingType);
    formData.append('status', status);
    formData.append('propertyType', propertyType);
    formData.append('city', city.trim());
    formData.append('location', location.trim());
    if (address.trim()) formData.append('address', address.trim());
    formData.append('price', String(price).trim());
    formData.append('area', String(area).trim());
    formData.append('bedrooms', String(bedrooms).trim());
    formData.append('bathrooms', String(bathrooms).trim());
    formData.append('description', description.trim());
    formData.append('features', JSON.stringify(features));

    if (coverFile) {
      formData.append('coverImage', coverFile);
    } else if (coverPreview) {
      formData.append('coverImage', coverPreview);
    }

    // Newly uploaded gallery files
    images.forEach((img) => {
      if (img.file) {
        formData.append('images', img.file);
      }
    });

    // Metadata for newly uploaded files
    formData.append(
      'imagesMetadata',
      JSON.stringify(
        images
          .filter((img) => img.file)
          .map((img) => ({
            caption: img.caption,
            sortOrder: img.sortOrder,
          }))
      )
    );

    // Existing images kept
    formData.append(
      'existingImages',
      JSON.stringify(
        images
          .filter((img) => !img.file)
          .map((img) => ({
            url: img.previewUrl,
            caption: img.caption,
            sortOrder: img.sortOrder,
          }))
      )
    );

    try {
      const res = await propertyService.updateProperty(property.id, formData);

      if (res && res.success) {
        setSuccess(true);
        scrollToTop();
        setTimeout(() => {
          router.push('/seller/properties');
        }, 900);
      } else {
        setErrorMsg(res?.message || 'Failed to update property listing.');
        scrollToTop();
      }
    } catch (err: any) {
      console.error('Failed to update property:', err);
      setErrorMsg(err?.message || 'Failed to update property.');
      scrollToTop();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-12 border border-slate-200/80 shadow-xs text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#e76f51] mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-white rounded-lg p-10 border border-slate-200/80 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Property Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          We could not locate property with ID <strong className="text-slate-800">{propertyId}</strong>. It may have been removed or you do not have permission to view it.
        </p>
        <Link
          href="/seller/properties"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Properties Directory
        </Link>
      </div>
    );
  }

  // Make sure current saved values always appear in the selects
  const bedroomOptions = [
    { v: '1', l: '1 BHK' },
    { v: '2', l: '2 BHK' },
    { v: '3', l: '3 BHK' },
    { v: '4', l: '4 BHK' },
    { v: '5', l: '5+ BHK' },
  ];
  const bathroomOptions = [
    { v: '1', l: '1 Bath' },
    { v: '2', l: '2 Baths' },
    { v: '3', l: '3 Baths' },
    { v: '4', l: '4 Baths' },
    { v: '5', l: '5+ Baths' },
  ];
  const bedroomHasValue = bedroomOptions.some((o) => o.v === bedrooms);
  const bathroomHasValue = bathroomOptions.some((o) => o.v === bathrooms);

  return (
    <div ref={topRef} className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 rounded-md bg-orange-50 text-[#e76f51]">
              <Pencil className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Edit Property Listing
            </h1>
            <span
              className={`ml-2 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${
                status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : status === 'inactive'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {status === 'active' ? '● Active' : status === 'inactive' ? '○ Inactive' : '✕ Sold Out'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Update listing details, pricing, media, specifications, and availability status.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href={`/property/${property.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            title="Preview Public Listing"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Public Page
          </Link>
          <Link
            href="/seller/properties"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Properties
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="text-rose-500 hover:text-rose-800 cursor-pointer p-0.5 rounded"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Property changes saved successfully! Redirecting to properties list...</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleUpdate} className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-8">

        {/* Section 1: Basic Property Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#e76f51]" />
            Basic Property Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label htmlFor="title" className="block text-xs font-bold text-slate-700 mb-1.5">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Luxurious 3 BHK Sun-drenched Penthouse"
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all font-medium"
              />
            </div>

            {/* Listing Type / Purpose */}
            <div>
              <label htmlFor="listingType" className="block text-xs font-bold text-slate-700 mb-1.5">
                Listing Type <span className="text-rose-500">*</span>
              </label>
              <select
                id="listingType"
                name="listingType"
                required
                value={listingType}
                onChange={(e) => setListingType(e.target.value as ListingType)}
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#e76f51] font-medium cursor-pointer"
              >
                <option value="sale">For Sale (Buy)</option>
                <option value="rent">For Rent (Lease)</option>
              </select>
            </div>

            <div>
              <label htmlFor="propertyType" className="block text-xs font-bold text-slate-700 mb-1.5">
                Property Type <span className="text-rose-500">*</span>
              </label>
              <select
                id="propertyType"
                name="propertyType"
                required
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#e76f51] font-medium cursor-pointer"
              >
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="house">House</option>
                <option value="penthouse">Penthouse</option>
                <option value="plot">Plot / Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-xs font-bold text-slate-700 mb-1.5">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'sold')}
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#e76f51] font-medium cursor-pointer"
              >
                <option value="active">Active (Available)</option>
                <option value="inactive">Inactive (Draft / Hidden)</option>
                <option value="sold">Sold Out</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Location & Address */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#e76f51]" />
            Location &amp; Address
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* City (Searchable with CountriesNow Indian Cities API & Quick Select) */}
            <div className="relative" ref={cityDropdownRef}>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="city-search" className="block text-xs font-bold text-slate-700">
                  City (India) <span className="text-rose-500">*</span>
                </label>
                {city && (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Selected: {city}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  id="city-search"
                  type="text"
                  required
                  value={citySearchInput}
                  onChange={(e) => {
                    setCitySearchInput(e.target.value);
                    setCity(e.target.value);
                    setShowCityDropdown(true);
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                  placeholder="Search Indian city (e.g. Pune, Mumbai, Bangalore)..."
                  autoComplete="off"
                  className="w-full h-10 pl-9 pr-9 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 font-medium transition-all"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                {loadingCitiesApi && indianCities.length === 0 ? (
                  <RefreshCw className="w-4 h-4 text-[#e76f51] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                ) : citySearchInput ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCity('');
                      setCitySearchInput('');
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    title="Clear city"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </div>

              {/* Hidden input to ensure city is submitted in form */}
              <input type="hidden" name="city" value={city} required />

              {/* Autocomplete Dropdown */}
              {showCityDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                  {/* Top Header Badge */}
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100 flex items-center justify-start">
                    <span className="text-slate-400 font-normal">Click to select</span>
                  </div>

                  {filteredIndianCities.length > 0 ? (
                    <div className="py-1">
                      {filteredIndianCities.map((cityName, index) => (
                        <button
                          key={`${cityName}-${index}`}
                          type="button"
                          onClick={() => handleSelectCity(cityName)}
                          className="w-full text-left px-3.5 py-2 hover:bg-orange-50/70 transition-colors flex items-center justify-between group cursor-pointer border-b border-slate-50 last:border-0"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#e76f51] shrink-0" />
                            <span className="text-xs font-semibold text-slate-800 group-hover:text-[#e76f51] truncate">
                              {cityName}
                            </span>
                          </div>
                          {city.toLowerCase() === cityName.toLowerCase() && (
                            <Check className="w-3.5 h-3.5 text-[#e76f51] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-500">
                      <span>No matching Indian city found for &quot;{citySearchInput}&quot;. You can keep it as custom city.</span>
                    </div>
                  )}

                  {/* Popular Cities Quick Select (shown when no search input typed) */}
                  {!citySearchInput.trim() && (
                    <div className="p-2.5 bg-slate-50/50 border-t border-slate-100">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                        Popular Cities (Quick Select)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_CITIES.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleSelectCity(c)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                              city.toLowerCase() === c.toLowerCase()
                                ? 'bg-[#e76f51] text-white border-[#e76f51]'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-50 hover:border-orange-200 hover:text-[#e76f51]'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-xs font-bold text-slate-700 mb-1.5">
                Location <span className="text-rose-500">*</span>
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Koregaon Park, Baner, Bandra West"
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-xs font-bold text-slate-700 mb-1.5">
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Flat 402, Sunshine Towers, Lane 5, Main Road"
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Pricing & Specifications */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#e76f51]" />
            Pricing &amp; Layout Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="price" className="block text-xs font-bold text-slate-700 mb-1.5">
                {listingType === 'rent' ? 'Monthly Rent (₹)' : 'Price (₹)'} <span className="text-rose-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={listingType === 'rent' ? 'e.g. 35000' : 'e.g. 15000000'}
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] font-medium"
              />
            </div>

            <div>
              <label htmlFor="area" className="block text-xs font-bold text-slate-700 mb-1.5">
                Area (sq.ft) <span className="text-rose-500">*</span>
              </label>
              <input
                id="area"
                name="area"
                type="number"
                required
                min="50"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. 1650"
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] font-medium"
              />
            </div>

            <div>
              <label htmlFor="bedrooms" className="block text-xs font-bold text-slate-700 mb-1.5">
                Bedrooms <span className="text-rose-500">*</span>
              </label>
              <select
                id="bedrooms"
                name="bedrooms"
                required
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#e76f51] font-medium cursor-pointer"
              >
                <option value="">Select Bedrooms</option>
                {bedrooms && !bedroomHasValue && <option value={bedrooms}>{bedrooms} BHK</option>}
                {bedroomOptions.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-xs font-bold text-slate-700 mb-1.5">
                Bathrooms <span className="text-rose-500">*</span>
              </label>
              <select
                id="bathrooms"
                name="bathrooms"
                required
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#e76f51] font-medium cursor-pointer"
              >
                <option value="">Select Bathrooms</option>
                {bathrooms && !bathroomHasValue && <option value={bathrooms}>{bathrooms} Baths</option>}
                {bathroomOptions.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.l}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Detailed Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-xs font-bold text-slate-700">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description outlining room layouts, balcony views, ventilation, vicinity to schools/transit, and handover status..."
            className="w-full p-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all resize-none"
          />
          <p className="text-[11px] text-slate-400">
            Provide a complete and accurate overview of the property to build buyer confidence.
          </p>
        </div>

        {/* Section 5: Features */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#e76f51]" />
              Features
            </h3>
            <span className="text-xs text-slate-500 font-medium">{features.length} selected</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (customFeature.trim()) {
                      addFeatureItem(customFeature);
                      setCustomFeature('');
                    }
                  }
                }}
                placeholder="Type a custom feature and press Add (e.g. Private Terrace, Vaastu Compliant)..."
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] font-medium"
              />
            </div>
            <button
              type="button"
              onClick={handleCustomFeatureSubmit}
              className="inline-flex items-center justify-center gap-1.5 px-4 h-10 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Feature
            </button>
          </div>

          {features.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-600">Selected Features:</p>
              <div className="flex flex-wrap gap-2">
                {features.map((feat) => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-[#e76f51] border border-orange-200"
                  >
                    <span>{feat}</span>
                    <button
                      type="button"
                      onClick={() => removeFeatureItem(feat)}
                      className="hover:bg-orange-200/60 rounded-full p-0.5 text-[#e76f51] transition-colors cursor-pointer"
                      title="Remove feature"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5 pt-1">
            <p className="text-xs font-semibold text-slate-500">Quick suggestions (click to add/toggle):</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_FEATURES.map((item) => {
                const isSelected = features.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => (isSelected ? removeFeatureItem(item) : addFeatureItem(item))}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500 font-semibold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-slate-400" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 6: Cover Image */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#e76f51]" />
              Cover Image <span className="text-rose-500">*</span>
            </h3>
          </div>

          <input
            type="file"
            ref={coverFileInputRef}
            accept="image/*"
            onChange={handleCoverFileChange}
            className="hidden"
          />

          <div
            onClick={() => coverFileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-[#e76f51] bg-slate-50 hover:bg-orange-50/20 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-[#e76f51] mb-2">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              Click to browse &amp; upload Cover Image
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              PNG, JPG, WebP supported (Max 10MB). Upload directly from your device.
            </p>
          </div>

          {coverPreview ? (
            <div className="relative mt-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-w-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPreview} alt="Cover Preview" className="w-full h-56 object-cover" />
              <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded bg-black/70 hover:bg-black text-white text-[11px] font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCoverFile(null);
                    setCoverPreview('');
                  }}
                  className="p-1 rounded bg-rose-600/90 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                  title="Remove cover"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs z-20">
                Primary Cover Image
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>No cover image selected yet. Please upload an image file before saving.</span>
            </div>
          )}
        </div>

        {/* Section 7: Gallery */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#e76f51]" />
                Images (Property Gallery)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload multiple property photos, add captions, and arrange display order.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={galleryFileInputRef}
                multiple
                accept="image/*"
                onChange={handleGalleryFilesChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => galleryFileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs font-bold rounded-md transition-colors cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Photos
              </button>
            </div>
          </div>

          {images.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                <span>Total Photos: {images.length}</span>
                <span>Use arrows to sort display order</span>
              </div>

              <div className="space-y-2.5">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                        #{index + 1}
                      </span>

                      <div className="w-16 h-16 rounded-md overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.previewUrl}
                          alt={img.caption || `Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Caption / Label
                        </label>
                        <input
                          type="text"
                          value={img.caption || ''}
                          onChange={(e) => handleCaptionChange(index, e.target.value)}
                          placeholder="e.g. Spacious Living Room"
                          className="w-full h-8 px-2.5 text-xs rounded border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:border-[#e76f51] font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleSetAsCover(img)}
                        title="Make this the Cover Image"
                        className={`px-2.5 py-1.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          coverPreview === img.previewUrl
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {coverPreview === img.previewUrl ? 'Is Cover' : 'Set as Cover'}
                      </button>

                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                        title="Move Up"
                        className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={() => handleMoveDown(index)}
                        title="Move Down"
                        className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        title="Delete image"
                        className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-lg border border-dashed border-slate-200 text-center bg-slate-50">
              <p className="text-xs font-semibold text-slate-500">No additional property photos uploaded yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Click &quot;Upload Photos&quot; to add living room, bedroom, kitchen, and bathroom photos.
              </p>
            </div>
          )}
        </div>

        {/* Section 8: Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/seller/properties"
              className="px-5 py-2.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm shadow-[#e76f51]/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}