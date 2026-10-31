'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TOP_CITIES } from '@/data/mockProperties';
import { PropertyImage } from '@/types';
import {
  Building2,
  UploadCloud,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  MapPin,
  IndianRupee,
  Plus,
  Trash2,
  Star,
  Image as ImageIcon,
  Check,
  X,
  FileImage,
  Layers,
  Bed,
  Bath,
  Maximize2
} from 'lucide-react';

const PRESET_LIBRARY = [
  {
    label: 'Modern Skyline Living Room',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Contemporary Building Exterior',
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Master Bedroom with Balcony',
    url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Modular Kitchen & Breakfast Bar',
    url: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Luxury Villa Garden & Lawn',
    url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Commercial Glass Hub Space',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  }
];

export default function NewPropertyPage() {
  const router = useRouter();
  const { addProperty } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Core Property Fields (based strictly on Property schema)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('Pune');
  const [location, setLocation] = useState('Baner');
  const [address, setAddress] = useState('');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('3');
  const [area, setArea] = useState('1650');

  // Custom Features added one-by-one
  const [featureInput, setFeatureInput] = useState('');
  const [featuresList, setFeaturesList] = useState<string[]>([
    'Modular Kitchen',
    'Covered Parking',
    '24/7 Security & CCTV',
    'Power Backup'
  ]);

  // Image Management: Multiple Images + Cover Image
  const [coverImage, setCoverImage] = useState<string>(PRESET_LIBRARY[0].url);
  const [images, setImages] = useState<PropertyImage[]>([
    {
      id: 'img-init-1',
      url: PRESET_LIBRARY[0].url,
      sortOrder: 0,
      caption: 'Main Living Room View'
    },
    {
      id: 'img-init-2',
      url: PRESET_LIBRARY[1].url,
      sortOrder: 1,
      caption: 'Exterior Architecture'
    }
  ]);
  const [singleImageUrlInput, setSingleImageUrlInput] = useState('');
  const [coverImageUrlInput, setCoverImageUrlInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Add a feature one by one
  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed && !featuresList.includes(trimmed)) {
      setFeaturesList([...featuresList, trimmed]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (item: string) => {
    setFeaturesList(featuresList.filter((f) => f !== item));
  };

  // Add image URL one by one
  const handleAddImageUrlOneByOne = () => {
    const url = singleImageUrlInput.trim();
    if (!url) return;

    const newImage: PropertyImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      url,
      sortOrder: images.length,
      caption: `Photo ${images.length + 1}`
    };

    setImages((prev) => [...prev, newImage]);
    // If no cover image yet, set this as cover
    if (!coverImage) {
      setCoverImage(url);
    }
    setSingleImageUrlInput('');
  };

  // Add multiple image files at once
  const handleMultipleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const resultUrl = event.target?.result as string;
        if (resultUrl) {
          const newImg: PropertyImage = {
            id: `img-file-${Date.now()}-${index}`,
            url: resultUrl,
            sortOrder: images.length + index,
            caption: file.name
          };
          setImages((prev) => [...prev, newImg]);
          if (!coverImage && index === 0) {
            setCoverImage(resultUrl);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload dedicated cover image
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const resultUrl = event.target?.result as string;
      if (resultUrl) {
        setCoverImage(resultUrl);
        // Also ensure it is present in the gallery
        const exists = images.some((img) => img.url === resultUrl);
        if (!exists) {
          setImages((prev) => [
            {
              id: `img-cover-${Date.now()}`,
              url: resultUrl,
              sortOrder: 0,
              caption: 'Cover Image'
            },
            ...prev
          ]);
        }
      }
    };
    reader.readAsDataURL(file);

    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = '';
    }
  };

  // Set any gallery image as the cover image
  const handleSetCover = (url: string) => {
    setCoverImage(url);
  };

  // Remove an image from the gallery
  const handleRemoveImage = (id: string, url: string) => {
    const filtered = images.filter((img) => img.id !== id);
    setImages(filtered);
    // If the removed image was the cover, fallback to first remaining image
    if (coverImage === url && filtered.length > 0) {
      setCoverImage(filtered[0].url);
    }
  };

  // Quick preset selector
  const handleAddPreset = (presetUrl: string, label: string) => {
    const alreadyExists = images.some((i) => i.url === presetUrl);
    if (!alreadyExists) {
      const newImg: PropertyImage = {
        id: `img-preset-${Date.now()}`,
        url: presetUrl,
        sortOrder: images.length,
        caption: label
      };
      setImages((prev) => [...prev, newImg]);
    }
    if (!coverImage) {
      setCoverImage(presetUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !area || !city || !location) {
      alert('Please fill all mandatory property fields.');
      return;
    }

    if (images.length === 0 && !coverImage) {
      alert('Please add at least one image or set a cover image for the property.');
      return;
    }

    setLoading(true);

    const activeCover = coverImage || (images.length > 0 ? images[0].url : PRESET_LIBRARY[0].url);

    // description and features are kept strictly as separate variables
    const newProp = addProperty({
      title,
      description: description.trim() || `Stunning ${bedrooms} BHK ${propertyType} located in ${location}, ${city}. Built-up area: ${area} sq.ft.`,
      features: featuresList,
      price: Number(price),
      propertyType,
      city,
      location,
      address: address.trim(),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      area: Number(area),
      coverImage: activeCover,
      images: images.length > 0 ? images : [{ id: `img-def`, url: activeCover, sortOrder: 0 }]
    });

    setTimeout(() => {
      setLoading(false);
      router.push(`/property/${newProp.id}`);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Seller Property Post
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Add New Property
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fill in your property specifications and upload photos with a dedicated cover image.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Core Property Details */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-700" />
              1. Basic Property Information
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Property Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 3 BHK Ultra-Luxury Skyline Apartment in Baner"
                className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Property Type Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Property Type *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { label: 'Apartment', value: 'apartment' },
                  { label: 'Villa', value: 'villa' },
                  { label: 'House', value: 'house' },
                  { label: 'Plot', value: 'plot' },
                  { label: 'Commercial', value: 'commercial' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setPropertyType(item.value)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      propertyType === item.value
                        ? 'border-slate-950 bg-slate-900 text-white shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe special features, ventilation, balcony views, society amenities..."
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* SECTION 2: Pricing, Dimensions & Location */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-slate-700" />
              2. Price, Size &amp; Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Price (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 16500000 (1.65 Cr)"
                  className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Built-up Area (Sq.ft) *
                </label>
                <input
                  type="number"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. 1850"
                  className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bedrooms *
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bathrooms *
                </label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="1">1 Bathroom</option>
                  <option value="2">2 Bathrooms</option>
                  <option value="3">3 Bathrooms</option>
                  <option value="4">4 Bathrooms</option>
                  <option value="5">5+ Bathrooms</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  City *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                >
                  {TOP_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Location / Locality *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Baner, Bandra West, Whitefield"
                  className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Address Field */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Detailed Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Flat 402, High Street Towers, Baner Main Road"
                className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* SECTION 3: ADD FEATURES ONE BY ONE (FEATURE INPUT ADDED ONE BY ONE OPTION) */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              3. Add Features (One by One)
            </h3>
            <p className="text-xs text-slate-500">
              Type custom highlights or amenities and click &quot;Add Feature&quot; to include them one by one.
            </p>

            {/* Input to add feature one by one */}
            <div className="flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="e.g. Italian Marble, Swimming Pool, Balcony View..."
                className="flex-1 h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="h-11 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Feature
              </button>
            </div>

            {/* Feature Tags List */}
            {featuresList.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {featuresList.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                  >
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(feature)}
                      className="text-slate-400 hover:text-rose-600 rounded-full p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 4: MULTIPLE IMAGE UPLOAD, ADD ONE BY ONE, AND COVER IMAGE */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-slate-700" />
                4. Image Upload &amp; Cover Image Selection
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload multiple images at once, add image URLs one by one, and designate your main cover image.
              </p>
            </div>

            {/* A. DEDICATED COVER IMAGE SECTION */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-slate-900">Current Cover Image (Main Thumbnail)</span>
                </div>
                <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                  Primary Card Photo
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {coverImage ? (
                  <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-slate-200 border-2 border-amber-400 shadow-sm shrink-0">
                    <Image src={coverImage} alt="Cover preview" fill className="object-cover" />
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" /> Cover
                    </div>
                  </div>
                ) : (
                  <div className="w-full sm:w-48 h-32 rounded-xl border-2 border-dashed border-amber-300 flex items-center justify-center text-xs text-amber-700 font-medium">
                    No Cover Set
                  </div>
                )}

                <div className="flex-1 space-y-2 w-full">
                  <p className="text-xs text-slate-600">
                    Upload a custom cover photo or enter an image URL:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="file"
                      ref={coverFileInputRef}
                      onChange={handleCoverFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-4 h-4 text-slate-600" />
                      Upload Cover File
                    </button>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <input
                      type="url"
                      value={coverImageUrlInput}
                      onChange={(e) => setCoverImageUrlInput(e.target.value)}
                      placeholder="Or paste direct Cover Image URL (https://...)"
                      className="flex-1 h-10 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    {coverImageUrlInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImage(coverImageUrlInput.trim());
                          setCoverImageUrlInput('');
                        }}
                        className="h-10 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shrink-0 cursor-pointer"
                      >
                        Set
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* B. MULTIPLE IMAGE UPLOAD OPTIONS */}
            <div className="space-y-4 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Gallery Images ({images.length} added)
              </label>

              {/* Upload Multiple Image Files Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleMultipleFilesUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-100/70 transition-all text-center flex flex-col items-center justify-center gap-1.5 group cursor-pointer"
                >
                  <FileImage className="w-6 h-6 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  <span className="text-xs font-bold text-slate-800">
                    Upload Multiple Images (File Selector)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Select multiple JPG, PNG, or WebP files at once
                  </span>
                </button>

                {/* Input to Add Image URL one by one */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Add Image URL (One by One)
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Paste an image link and click Add
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={singleImageUrlInput}
                      onChange={(e) => setSingleImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrlOneByOne();
                        }
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 h-10 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrlOneByOne}
                      className="h-10 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Presets selector */}
              <div>
                <span className="text-xs font-semibold text-slate-600 block mb-2">
                  Or pick from curated real estate library presets:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_LIBRARY.map((preset) => {
                    const isAdded = images.some((i) => i.url === preset.url);
                    return (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => handleAddPreset(preset.url, preset.label)}
                        className={`relative rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all group ${
                          isAdded ? 'border-slate-900 ring-2 ring-slate-900/20' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                        title={preset.label}
                      >
                        <Image src={preset.url} alt={preset.label} fill className="object-cover" />
                        {isAdded && (
                          <div className="absolute top-1 right-1 bg-slate-900 text-white rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Uploaded Gallery Thumbnails Grid */}
              {images.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Uploaded Property Images:</span>
                    <span>Click &quot;★ Set as Cover&quot; on any photo to make it the primary card image.</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {images.map((img) => {
                      const isThisCover = coverImage === img.url;
                      return (
                        <div
                          key={img.id}
                          className={`group relative rounded-2xl overflow-hidden bg-slate-100 border-2 transition-all ${
                            isThisCover
                              ? 'border-amber-500 ring-2 ring-amber-400/20 shadow-md'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="relative aspect-[4/3] w-full">
                            <Image src={img.url} alt="Uploaded" fill className="object-cover" />
                          </div>

                          {/* Cover indicator tag */}
                          {isThisCover && (
                            <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                              <Star className="w-3 h-3 fill-white" /> Cover Image
                            </div>
                          )}

                          {/* Card bottom actions overlay */}
                          <div className="p-2 bg-white flex items-center justify-between gap-1 border-t border-slate-100">
                            {!isThisCover ? (
                              <button
                                type="button"
                                onClick={() => handleSetCover(img.url)}
                                className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                              >
                                <Star className="w-3 h-3" /> Set Cover
                              </button>
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Selected
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img.id, img.url)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Delete photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Submit & Cancel */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/dashboard"
              className="px-6 py-2.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-[#e76f51] text-white text-xs sm:text-sm font-bold hover:bg-[#d65a3d] transition-all shadow-md shadow-[#e76f51]/25 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Publish Property</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
