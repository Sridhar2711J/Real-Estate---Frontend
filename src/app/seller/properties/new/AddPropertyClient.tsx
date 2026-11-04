'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { propertyService } from '@/services/propertyService';
import { PropertyImage } from '@/types';
import {
  PlusCircle,
  Building2,
  Image as ImageIcon,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  Link as LinkIcon,
  FileText,
  AlertCircle,
  Check,
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

export default function AddPropertyClient() {
  const router = useRouter();
  const { user } = useAuth();

  // Form states matching Property interface in src/types/index.ts
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [status, setStatus] = useState<'active' | 'inactive' | 'sold'>('active');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [description, setDescription] = useState('');

  // Features - multiple dynamic add, no default selection
  const [features, setFeatures] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState('');

  // Cover Image - file upload or URL
  const [coverImage, setCoverImage] = useState('');
  const [coverInputMode, setCoverInputMode] = useState<'upload' | 'url'>('upload');
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Property Images - multiple upload, sort order, captions
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [urlImageInput, setUrlImageInput] = useState('');
  const [urlImageCaption, setUrlImageCaption] = useState('');
  const [showUrlAddModal, setShowUrlAddModal] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const topRef = useRef<HTMLDivElement>(null);

  // Smoothly scroll to the top of the content container & window
  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Scroll to top whenever an error or success banner is triggered
  useEffect(() => {
    if (errorMsg || success) {
      scrollToTop();
    }
  }, [errorMsg, success]);

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

  // Cover image upload via file - uploads to /uploads/properties/ via propertyService.uploadImage
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      setUploadingCover(true);
      const res = await propertyService.uploadImage(file);
      if (res && res.success && res.imageUrl) {
        setCoverImage(res.imageUrl);
      } else {
        setErrorMsg(res?.message || 'Failed to upload cover image.');
        scrollToTop();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred while uploading cover image.');
      scrollToTop();
    } finally {
      setUploadingCover(false);
      if (coverFileInputRef.current) {
        coverFileInputRef.current.value = '';
      }
    }
  };

  const handleApplyCoverUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (coverUrlInput.trim()) {
      setCoverImage(coverUrlInput.trim());
      setCoverUrlInput('');
    }
  };

  // Gallery multi-file upload - uploads directly to /uploads/properties/ via propertyService.uploadImage
  const handleGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setUploadingGallery(true);
    setErrorMsg('');

    try {
      for (const file of fileList) {
        if (!file.type.startsWith('image/')) {
          setErrorMsg(`"${file.name}" is not a valid image file.`);
          scrollToTop();
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          setErrorMsg(`"${file.name}" exceeds the 10MB file size limit.`);
          scrollToTop();
          continue;
        }

        const res = await propertyService.uploadImage(file);
        if (res && res.success && res.imageUrl) {
          const defaultCaption = file.name.replace(/\.[^/.]+$/, '');
          setImages((prev) => [
            ...prev,
            {
              id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              url: res.imageUrl,
              sortOrder: prev.length + 1,
              caption: defaultCaption,
            },
          ]);
        } else {
          setErrorMsg(res?.message || `Failed to upload image "${file.name}".`);
          scrollToTop();
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred while uploading gallery images.');
      scrollToTop();
    } finally {
      setUploadingGallery(false);
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = '';
      }
    }
  };

  // Gallery URL add
  const handleAddUrlImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlImageInput.trim()) return;

    setImages((prev) => [
      ...prev,
      {
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url: urlImageInput.trim(),
        sortOrder: prev.length + 1,
        caption: urlImageCaption.trim() || undefined,
      },
    ]);

    setUrlImageInput('');
    setUrlImageCaption('');
    setShowUrlAddModal(false);
  };

  // Sort: Move Up
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

  // Sort: Move Down
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

  // Sort: Delete item
  const handleRemoveGalleryImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((img, i) => ({ ...img, sortOrder: i + 1 }));
    });
  };

  // Caption change
  const handleCaptionChange = (index: number, caption: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, caption } : img))
    );
  };

  // Make gallery image the cover image
  const handleSetAsCover = (url: string) => {
    setCoverImage(url);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    if (!price || Number(price) <= 0) {
      setErrorMsg('Price is required (*). Please enter a valid amount.');
      scrollToTop();
      return;
    }
    if (!area || Number(area) <= 0) {
      setErrorMsg('Area is required (*). Please enter square footage.');
      scrollToTop();
      return;
    }
    if (!bedrooms || Number(bedrooms) < 0) {
      setErrorMsg('Bedrooms is required (*).');
      scrollToTop();
      return;
    }
    if (!bathrooms || Number(bathrooms) < 0) {
      setErrorMsg('Bathrooms is required (*).');
      scrollToTop();
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Detailed Description is required (*).');
      scrollToTop();
      return;
    }
    if (!coverImage.trim()) {
      setErrorMsg('Cover Image is required (*). Please upload or enter an image URL.');
      scrollToTop();
      return;
    }

    setSubmitting(true);

    const finalImages: PropertyImage[] =
      images.length > 0
        ? images.map((img, i) => ({
            ...img,
            sortOrder: img.sortOrder ?? i + 1,
          }))
        : [
            {
              id: `img-${Date.now()}-1`,
              url: coverImage,
              sortOrder: 1,
              caption: 'Front Cover View',
            },
          ];

    try {
      const res = await propertyService.createProperty({
        title: title.trim(),
        propertyType,
        status,
        city: city.trim(),
        location: location.trim(),
        address: address.trim() || undefined,
        price: Number(price),
        area: Number(area),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        description: description.trim(),
        features: features,
        coverImage: coverImage.trim(),
        images: finalImages,
      });

      if (res && res.success) {
        setSuccess(true);
        scrollToTop();
        setTimeout(() => {
          router.push('/seller/properties');
        }, 800);
      } else {
        setErrorMsg(res?.message || 'Failed to create property listing.');
        scrollToTop();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred while creating the property.');
      scrollToTop();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={topRef} className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-orange-50 text-[#e76f51]">
              <PlusCircle className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Add New Property
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fill in the details below matching your property specifications and publish your listing.
          </p>
        </div>

        <Link
          href="/seller/properties"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors self-start sm:self-center cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Properties
        </Link>
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
          <span>Property added successfully! Redirecting to properties list...</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-8">
        
        {/* Section 1: Basic Property Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#e76f51]" />
            Basic Property Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
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

            {/* Property Type */}
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

            {/* Status */}
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
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-xs font-bold text-slate-700 mb-1.5">
                City <span className="text-rose-500">*</span>
              </label>
              <select
                id="city"
                name="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#e76f51] font-medium cursor-pointer"
              >
                <option value="">Select City</option>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Goa">Goa</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Ahmedabad">Ahmedabad</option>
              </select>
            </div>

            {/* Location */}
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

            {/* Address */}
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
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-xs font-bold text-slate-700 mb-1.5">
                Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 15000000"
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] font-medium"
              />
            </div>

            {/* Area */}
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

            {/* Bedrooms */}
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
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </select>
            </div>

            {/* Bathrooms */}
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
                <option value="1">1 Bath</option>
                <option value="2">2 Baths</option>
                <option value="3">3 Baths</option>
                <option value="4">4 Baths</option>
                <option value="5">5+ Baths</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Detailed Description (Required *) */}
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

        {/* Section 5: Features (Multiple Add Option, No Default Value) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#e76f51]" />
              Features
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {features.length} selected
            </span>
          </div>

          {/* Custom Feature Input */}
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

          {/* Current Selected Features Chips */}
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

          {/* Quick Suggestions (None pre-selected by default) */}
          <div className="space-y-1.5 pt-1">
            <p className="text-xs font-semibold text-slate-500">Quick suggestions (click to add/toggle):</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_FEATURES.map((item) => {
                const isSelected = features.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        removeFeatureItem(item);
                      } else {
                        addFeatureItem(item);
                      }
                    }}
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

        {/* Section 6: Cover Image (Upload & URL Option) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#e76f51]" />
              Cover Image <span className="text-rose-500">*</span>
            </h3>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setCoverInputMode('upload')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  coverInputMode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setCoverInputMode('url')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  coverInputMode === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Image URL
              </button>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={coverFileInputRef}
            accept="image/*"
            onChange={handleCoverFileChange}
            className="hidden"
          />

          {coverInputMode === 'upload' ? (
            <div
              onClick={() => !uploadingCover && coverFileInputRef.current?.click()}
              className={`border-2 border-dashed border-slate-300 hover:border-[#e76f51] bg-slate-50 hover:bg-orange-50/20 rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors ${
                uploadingCover ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-[#e76f51] mb-2">
                {uploadingCover ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-[#e76f51]" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {uploadingCover
                  ? 'Uploading & Optimizing Cover Image...'
                  : 'Click to browse & upload Cover Image'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                PNG, JPG, WebP supported (Max 10MB). Automatically saved to uploads/properties as WebP.
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={coverUrlInput}
                onChange={(e) => setCoverUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/... or any direct image URL"
                className="flex-1 h-10 px-3.5 text-xs font-mono rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51]"
              />
              <button
                type="button"
                onClick={handleApplyCoverUrl}
                className="px-4 h-10 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition-colors cursor-pointer shrink-0"
              >
                Apply URL
              </button>
            </div>
          )}

          {/* Cover Image Preview */}
          {coverImage ? (
            <div className="relative mt-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-w-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage}
                alt="Cover Preview"
                className="w-full h-56 object-cover"
              />
              {uploadingCover && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs font-semibold gap-2 z-10 backdrop-blur-2xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#e76f51]" />
                  <span>Uploading to uploads/properties...</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
                <button
                  type="button"
                  disabled={uploadingCover}
                  onClick={() => coverFileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded bg-black/70 hover:bg-black text-white text-[11px] font-semibold backdrop-blur-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Change
                </button>
                <button
                  type="button"
                  disabled={uploadingCover}
                  onClick={() => setCoverImage('')}
                  className="p-1 rounded bg-rose-600/90 hover:bg-rose-700 text-white transition-colors cursor-pointer disabled:opacity-50"
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
              <span>No cover image selected yet. Please upload or provide a URL before submitting.</span>
            </div>
          )}
        </div>

        {/* Section 7: Property Images (Images) with Multi-Upload & Sort Option */}
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
              {/* Hidden Gallery Multi-File Input */}
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
                disabled={uploadingGallery}
                onClick={() => !uploadingGallery && galleryFileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs font-bold rounded-md transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {uploadingGallery ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" /> Upload Photos
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowUrlAddModal(!showUrlAddModal)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5" /> Add URL
              </button>
            </div>
          </div>

          {/* Uploading progress notification */}
          {uploadingGallery && (
            <div className="p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              <span>Uploading and optimizing property photos to uploads/properties... Please wait.</span>
            </div>
          )}

          {/* Add Image by URL Panel */}
          {showUrlAddModal && (
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">Add Property Image via URL</h4>
                <button
                  type="button"
                  onClick={() => setShowUrlAddModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="url"
                  value={urlImageInput}
                  onChange={(e) => setUrlImageInput(e.target.value)}
                  placeholder="Image URL (https://...)"
                  className="h-9 px-3 text-xs rounded border border-slate-300 bg-white text-slate-900 font-mono"
                />
                <input
                  type="text"
                  value={urlImageCaption}
                  onChange={(e) => setUrlImageCaption(e.target.value)}
                  placeholder="Caption (e.g. Master Bedroom, Balcony View)"
                  className="h-9 px-3 text-xs rounded border border-slate-300 bg-white text-slate-900 font-medium"
                />
              </div>
              <button
                type="button"
                onClick={handleAddUrlImage}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded transition-colors cursor-pointer"
              >
                Add to Gallery
              </button>
            </div>
          )}

          {/* Uploaded Gallery List with Sorting Options */}
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
                      {/* Sort Order Badge */}
                      <span className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                        #{index + 1}
                      </span>

                      {/* Thumbnail Preview */}
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.caption || `Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Caption Input */}
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

                    {/* Actions: Sort Options & Delete */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      {/* Set as Cover */}
                      <button
                        type="button"
                        onClick={() => handleSetAsCover(img.url)}
                        title="Make this the Cover Image"
                        className={`px-2.5 py-1.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          coverImage === img.url
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {coverImage === img.url ? 'Is Cover' : 'Set as Cover'}
                      </button>

                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                        title="Move Up"
                        className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={() => handleMoveDown(index)}
                        title="Move Down"
                        className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      {/* Delete */}
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

        {/* Section 8: Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Link
            href="/seller/properties"
            className="px-5 py-2.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm shadow-[#e76f51]/20 transition-all cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Publishing Listing...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Publish Listing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
