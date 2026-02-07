"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Settings,
    ShoppingBag,
    Users,
    BarChart3,
    LogOut,
    Search,
    Bell,
    MessageSquare,
    ClipboardList,
    Layers,
    ExternalLink,
    Image as ImageIcon,
    Truck,
    FileText,
    Tag,
    Package,
    ShieldCheck // NEW
} from 'lucide-react';

import styles from './admin.module.css';
import { adminEn } from '@/lib/i18n/admin.en';

export default function AdminLayout({ children }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    // TODO: Re-enable admin protection before production.
    /*
    if (status === 'loading') return <div>Loading Admin...</div>;
    if (session?.user?.role !== 'ADMIN') { ... }
    */

    const menuItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Products', href: '/admin/products', icon: Layers },
        { name: 'Categories', href: '/admin/categories', icon: LayoutDashboard },
        { name: 'Home Tiles', href: '/admin/home-tiles', icon: ImageIcon },
        { name: 'Home Sections', href: '/admin/home-sections', icon: LayoutDashboard },
        { name: 'Leads', href: '/admin/leads', icon: ClipboardList },
        { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
        { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
        { name: 'Coupons', href: '/admin/coupons', icon: ClipboardList },
        { name: 'Shipping', href: '/admin/shipping', icon: Truck },
        { name: 'Size Guide', href: '/admin/size-guide', icon: FileText },
        { name: 'Trust Badges', href: '/admin/trust-badges', icon: ShieldCheck }, // NEW
        { name: 'SUB CA', href: '/admin/sub-ca', icon: Layers },
        { name: 'Toggles', href: '/admin/toggles', icon: Settings },
    ];

    return (
        <div className={styles.wrapper}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <ShoppingBag size={28} />
                    <span>AB Admin</span>
                </div>

                <nav className={styles.nav}>
                    {menuItems.map((item) => {
                        const Icon = item.icon || (() => <span>🖼️</span>);
                        const isActive = pathname === item.href;

                        // Map href to dictionary key
                        let label = item.name;
                        if (item.href === '/admin') label = adminEn.sidebar.dashboard;
                        if (item.href === '/admin/orders') label = adminEn.sidebar.orders;
                        if (item.href === '/admin/products') label = adminEn.sidebar.products;
                        if (item.href === '/admin/categories') label = adminEn.sidebar.categories;
                        if (item.href === '/admin/leads') label = adminEn.sidebar.leads;
                        if (item.href === '/admin/reports') label = adminEn.sidebar.reports;
                        if (item.href === '/admin/toggles') label = adminEn.sidebar.toggles;
                        if (item.href === '/admin/home-tiles') label = adminEn.sidebar.homeTiles;
                        if (item.href === '/admin/coupons') label = 'Coupons'; // Manual Label
                        if (item.href === '/admin/shipping') label = 'Shipping'; // Manual Label

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
                            >
                                <Icon size={20} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>


                <div className={styles.navFooter}>
                    <Link href="/" target="_blank" className={`${styles.navItem} ${styles.external}`}>
                        <ExternalLink size={20} />
                        View Site
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className={styles.logoutBtn}
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Section */}
            <main className={styles.main}>
                {/* Topbar */}
                <header className={styles.topbar}>
                    <div className={styles.searchBar}>
                        <Search size={18} />
                        <input type="text" placeholder="Search analytics, orders..." />
                    </div>

                    <div className={styles.topActions}>
                        <button className={styles.iconBtn}>
                            <MessageSquare size={20} />
                        </button>
                        <button className={styles.iconBtn}>
                            <Bell size={20} />
                            <span className={styles.notificationDot}></span>
                        </button>

                        <div className={styles.profileInfo}>
                            <div style={{ textAlign: 'right' }}>
                                <div className={styles.userName}>{session?.user?.name || 'Admin User'}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Store Manager</div>
                            </div>
                            <img
                                src={session?.user?.image || 'https://ui-avatars.com/api/?name=Admin&background=2dd4bf&color=000'}
                                className={styles.avatar}
                                alt="Profile"
                            />
                        </div>
                    </div>
                </header>

                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}
