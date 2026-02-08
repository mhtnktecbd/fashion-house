"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useFeatures } from '@/app/providers';
import styles from './Navbar.module.css';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCategories } from '@/context/CategoryContext';
import { useSession } from 'next-auth/react';
import { useUI } from '@/context/UIContext'; // NEW
import { Search, ShoppingBag, User, Heart, Menu, LogOut, X, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import en from '@/lib/i18n/en';

export default function Navbar() {
    const features = useFeatures();
    const router = useRouter();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const { categories } = useCategories();
    const { data: session } = useSession();
    const { openCart } = useUI(); // Trigger Drawer

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Scroll State
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState({ products: [], categories: [] });
    const [showResults, setShowResults] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const searchRef = useRef(null);
    const searchCache = useRef({}); // Simple memory cache

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);

        // Load recent searches
        try {
            const stored = localStorage.getItem('ab_recent_searches');
            if (stored) setRecentSearches(JSON.parse(stored));
        } catch (e) { }

        // Outside Click for Search
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const addToRecent = (term) => {
        if (!term) return;
        const updated = [term, ...recentSearches.filter(t => t !== term)].slice(0, 6);
        setRecentSearches(updated);
        localStorage.setItem('ab_recent_searches', JSON.stringify(updated));
    };

    // Debounced Search Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            const term = searchQuery.trim().toLowerCase();
            if (term.length > 1) {
                setIsSearching(true);

                // Check Cache
                if (searchCache.current[term]) {
                    setSearchResults(searchCache.current[term]);
                    setShowResults(true);
                    setIsSearching(false);
                    return;
                }

                try {
                    // Fetch Products
                    const res = await fetch('/api/products');
                    const data = await res.json();

                    if (data.success) {
                        const matchedProducts = data.products
                            .filter(p => p.title.toLowerCase().includes(term) && p.status === 'Published')
                            .slice(0, 5); // Limit 5

                        const matchedCategories = categories
                            .filter(c => c.name.toLowerCase().includes(term))
                            .slice(0, 3); // Limit 3

                        const result = { products: matchedProducts, categories: matchedCategories };

                        // Save to Cache
                        searchCache.current[term] = result;

                        setSearchResults(result);
                        setShowResults(true);
                    }
                } catch (error) {
                    console.error("Search error", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                // Show Recent Searches if empty/shorter
                setSearchResults({ products: [], categories: [] }); // Clear results
                // If focused, we might want to show recent. Logic handled in render.
            }
        }, 200); // 200ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, categories]);

    const handleSearchSubmit = () => {
        if (!searchQuery.trim()) return;
        addToRecent(searchQuery.trim());
        setShowResults(false);
        router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    };

    // Suggestion click
    const handleSuggestionClick = (term) => {
        setSearchQuery(term);
        addToRecent(term);
        setShowResults(false);
        router.push(`/shop?q=${encodeURIComponent(term)}`);
    }

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
            <div className={`container ${styles.inner}`}>
                {/* Mobile Menu Toggle */}
                <button className={styles.mobileToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Left: Logo */}
                <div className={styles.left}>
                    <Link href="/" className={styles.logo}>
                        AuthenticBazar
                    </Link>
                </div>

                {/* Center: Main Menu */}
                <div className={`${styles.center} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
                    {categories.length > 0 ? (
                        categories
                            .filter(c => c.isActive && c.showInNavbar)
                            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                            .map(cat => (
                                <div key={cat.id} className={styles.navItemWrapper}>
                                    <Link href={`/shop/${cat.slug}`} className={styles.navLink}>
                                        {cat.name}
                                    </Link>
                                    {/* Dropdown */}
                                    {cat.subCategories && cat.subCategories.length > 0 && (
                                        <div className={styles.dropdown}>
                                            {cat.subCategories.filter(sc => sc.isActive).map(sub => (
                                                <Link key={sub.id} href={`/shop/${sub.slug}`} className={styles.dropdownLink}>
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                    ) : (
                        // Fallback
                        <>
                            <Link href="/shop/men" className={styles.navLink}>{en.nav.men}</Link>
                            <Link href="/shop/women" className={styles.navLink}>{en.nav.women}</Link>
                        </>
                    )}
                </div>

                {/* Center-Right: Smart Search */}
                <div className={styles.searchContainer} ref={searchRef}>
                    <div className={styles.searchBox}>
                        <input
                            type="text"
                            placeholder={en.nav.search}
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                            onFocus={() => setShowResults(true)}
                        />
                        <button
                            onClick={handleSearchSubmit}
                            className={styles.searchIcon}
                        >
                            <Search size={18} />
                        </button>
                    </div>

                    {/* Search Dropdown Results */}
                    {showResults && (
                        <div className={styles.searchResults}>
                            {searchQuery.length <= 1 ? (
                                // Recent Searches View
                                recentSearches.length > 0 && (
                                    <div className={styles.resultGroup}>
                                        <div className={styles.groupTitle}>Recent Searches</div>
                                        {recentSearches.map((term, idx) => (
                                            <div
                                                key={idx}
                                                className={styles.resultItem}
                                                onClick={() => handleSuggestionClick(term)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <span>{term}</span>
                                                <span className={styles.resultIcon} style={{ fontSize: '12px' }}>↺</span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                isSearching ? (
                                    <div className={styles.searchLoading}>Loading...</div>
                                ) : (
                                    <>
                                        {/* Categories */}
                                        {searchResults.categories.length > 0 && (
                                            <div className={styles.resultGroup}>
                                                <div className={styles.groupTitle}>Categories</div>
                                                {searchResults.categories.map(c => (
                                                    <Link
                                                        key={c.id}
                                                        href={`/shop/${c.slug}`}
                                                        className={styles.resultItem}
                                                        onClick={() => {
                                                            addToRecent(c.name);
                                                            setShowResults(false);
                                                        }}
                                                    >
                                                        {c.name}
                                                        <ChevronRight size={14} className={styles.resultIcon} />
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {/* Products */}
                                        {searchResults.products.length > 0 && (
                                            <div className={styles.resultGroup}>
                                                <div className={styles.groupTitle}>Products</div>
                                                {searchResults.products.map(p => (
                                                    <Link
                                                        key={p.id}
                                                        href={`/product/${p.slug}`}
                                                        className={styles.resultProduct}
                                                        onClick={() => {
                                                            addToRecent(p.title);
                                                            setShowResults(false);
                                                        }}
                                                    >
                                                        <div className={styles.thumb}>
                                                            <Image src={p.image} alt={p.title} width={32} height={32} style={{ objectFit: 'cover' }} />
                                                        </div>
                                                        <div className={styles.prodInfo}>
                                                            <span className={styles.prodTitle}>{p.title}</span>
                                                            <span className={styles.prodPrice}>৳{p.price}</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {searchResults.categories.length === 0 && searchResults.products.length === 0 && (
                                            <div className={styles.noResults}>No results found</div>
                                        )}
                                    </>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Icons */}
                <div className={styles.right}>
                    {/* User */}
                    <Link href={session ? "/my-orders" : "/auth/signin"} className={styles.iconItem}>
                        <User size={22} />
                        <span className={styles.mobileHide}>{en.nav.myAccount}</span>
                    </Link>

                    {/* Wishlist */}
                    <Link href="/wishlist" className={styles.iconItem}>
                        <div className={styles.iconWrapper}>
                            <Heart size={22} />
                            {mounted && wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
                        </div>
                    </Link>

                    {/* Cart Trigger (Drawer) */}
                    <button
                        onClick={openCart}
                        className={styles.iconItem}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <div className={styles.iconWrapper}>
                            <ShoppingBag size={22} />
                            {mounted && cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
                        </div>
                        <span className={styles.mobileHide}>৳{mounted && cartCount > 0 ? 'Total' : '0'}</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
