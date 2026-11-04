'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { inquiryService } from '@/services/inquiryService';
import {
    User,
    MessageSquare,
    Heart,
    ChevronRight,
    LogOut,
    Compass,
    CheckCircle2
} from 'lucide-react';

export default function BuyerAccountSidebar() {
    const pathname = usePathname();
    const { user, logout, savedPropertyIds } = useAuth();
    const [savedCount, setSavedCount] = React.useState<number>(0);
    const [inquiryCount, setInquiryCount] = React.useState<number>(0);

    React.useEffect(() => {
        if (Array.isArray(savedPropertyIds)) {
            setSavedCount(savedPropertyIds.length);
        } else {
            try {
                const stored = typeof window !== 'undefined' ? localStorage.getItem('realnest_saved_properties') : null;
                if (stored) {
                    const ids = JSON.parse(stored);
                    if (Array.isArray(ids)) {
                        setSavedCount(ids.length);
                    }
                }
            } catch {
                // ignore
            }
        }
    }, [savedPropertyIds]);

    React.useEffect(() => {
        let isMounted = true;
        const fetchCounts = async () => {
            try {
                if (user) {
                    const res = await inquiryService.getInquiryCounts();
                    if (isMounted && res && res.success) {
                        setInquiryCount(res.total);
                    }
                } else {
                    setInquiryCount(0);
                }
            } catch {
                // ignore
            }
        };

        fetchCounts();

        const handleUpdated = () => {
            fetchCounts();
        };

        window.addEventListener('inquiry:updated', handleUpdated);
        return () => {
            isMounted = false;
            window.removeEventListener('inquiry:updated', handleUpdated);
        };
    }, [user]);

    const bookmarkCount = Array.isArray(savedPropertyIds) ? savedPropertyIds.length : savedCount;

    const navItems = [
        {
            name: 'My Profile',
            href: '/buyer/profile',
            icon: User,
            description: 'Account settings & info',
            badge: null,
        },
        {
            name: 'My Inquiries',
            href: '/buyer/inquiries',
            icon: MessageSquare,
            description: 'Messages & tour requests',
            badge: inquiryCount > 0 ? inquiryCount : null,
            badgeColor: 'bg-[#e76f51] text-white',
        },
        {
            name: 'Bookmark',
            href: '/buyer/bookmarks',
            icon: Heart,
            description: 'Saved favorite properties',
            badge: bookmarkCount > 0 ? bookmarkCount : null,
            badgeColor: 'bg-rose-500 text-white',
        },
    ];

    const isActive = (href: string) => {
        return pathname === href || pathname.startsWith(href + '/');
    };

    return (
        <aside className="w-full">
            {/* Mobile / Tablet Horizontal Navigation Bar (< lg screens) */}
            <div className="lg:hidden mb-6 bg-white rounded-lg p-2 border border-slate-200/80 shadow-xs">
                <div className="grid grid-cols-3 gap-1.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-md text-xs font-semibold transition-all duration-200 text-center ${active
                                        ? 'bg-[#fef0eb] text-[#e76f51] font-bold border border-[#e76f51]/30 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                                    }`}
                            >
                                <div className="relative">
                                    <Icon className={`w-4 h-4 ${active ? 'text-[#e76f51]' : 'text-slate-500'}`} />
                                    {item.badge !== null && (
                                        <span
                                            className={`sm:hidden absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-1 text-[9px] font-extrabold rounded-md flex items-center justify-center ${active ? 'bg-[#e76f51] text-white' : 'bg-[#e76f51] text-white'
                                                }`}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <span className="truncate">{item.name}</span>
                                {item.badge !== null && (
                                    <span
                                        className={`hidden sm:inline-flex ml-1 px-1.5 py-0.2 rounded-md text-[10px] font-bold ${active ? 'bg-[#e76f51] text-white' : 'bg-slate-100 text-slate-700'
                                            }`}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Desktop Sidebar (lg+ screens) */}
            <div className="hidden lg:block bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden sticky top-24">
                {/* User Profile Header Card */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
                    <div className="flex items-center gap-3.5">
                        <div className="relative w-12 h-12 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 ring-2 ring-slate-100">
                            {user?.avatar ? (
                                <Image
                                    src={user.avatar}
                                    alt={user.name || 'User'}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                />
                            ) : (
                                <span>{user?.name?.charAt(0) || 'U'}</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-sm text-slate-900 truncate">
                                    {user?.name || 'Buyer Account'}
                                </h3>
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#e76f51] shrink-0" />
                            </div>
                            <p className="text-xs text-slate-500 truncate">{user?.email || 'buyer@example.com'}</p>
                            <div className="mt-1 flex items-center gap-1.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-[#e76f51] border border-orange-100">
                                    Buyer Account
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Section */}
                <div className="p-3">
                    <p className="px-3 pt-2 pb-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                        Menu Navigation
                    </p>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`group relative flex items-center justify-between p-3 rounded-md transition-all duration-200 cursor-pointer ${active
                                            ? 'bg-[#fef0eb] text-slate-900 font-bold border border-[#e76f51]/30 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 font-medium border border-transparent'
                                        }`}
                                >
                                    {/* Left accent bar for active item */}
                                    {active && (
                                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#e76f51] rounded-r-md" />
                                    )}

                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className={`p-2 rounded-md transition-colors shrink-0 ${active
                                                    ? 'bg-[#e76f51] text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs tracking-tight ${active ? 'text-slate-950 font-bold' : 'text-slate-800'}`}>
                                                    {item.name}
                                                </span>
                                            </div>
                                            <p
                                                className={`text-[11px] truncate ${active ? 'text-slate-500' : 'text-slate-400'
                                                    }`}
                                            >
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                        {item.badge !== null && (
                                            <span
                                                className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${active ? 'bg-[#e76f51] text-white shadow-xs' : item.badgeColor
                                                    }`}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                        <ChevronRight
                                            className={`w-3.5 h-3.5 transition-transform ${active
                                                    ? 'text-[#e76f51] translate-x-0.5'
                                                    : 'text-slate-400 group-hover:translate-x-0.5'
                                                }`}
                                        />
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Sign Out Footer */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                    <button
                        type="button"
                        onClick={() => logout()}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </span>
                        <span className="text-[11px] text-slate-400">Exit account</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
