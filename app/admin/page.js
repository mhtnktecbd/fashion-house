"use client";

import { useMemo } from 'react';
import {
    DollarSign,
    Box,
    Users,
    TrendingUp,
    ShoppingBag,
    Package,
    ArrowUpRight
} from 'lucide-react';
import styles from './admin.module.css';
import { useProducts } from '@/context/ProductContext';
import {
    StatCard,
    RevenueReports,
    SalesByCategory,
    DeliveryProgress,
    RecentOrdersTable
} from '@/components/admin/DashboardComponents';

const REVENUE_DATA = [
    { name: '17 Jun', revenue: 2000, sales: 1000 },
    { name: '18 Jun', revenue: 4500, sales: 2500 },
    { name: '19 Jun', revenue: 3000, sales: 1500 },
    { name: '20 Jun', revenue: 5500, sales: 3000 },
    { name: '21 Jun', revenue: 4000, sales: 2000 },
    { name: '22 Jun', revenue: 7000, sales: 4500 },
    { name: '23 Jun', revenue: 6000, sales: 3500 },
];

export default function AdminDashboard() {
    const { products } = useProducts();

    const stats = useMemo(() => {
        const activeProducts = products.filter(p => p.status !== 'Draft').length;

        // Count products by category
        const categories = {};
        products.forEach(p => {
            const cat = p.category || 'Other';
            categories[cat] = (categories[cat] || 0) + 1;
        });

        const categoryData = Object.entries(categories).map(([name, value]) => ({
            name,
            value
        }));

        return {
            activeProducts,
            categoryData
        };
    }, [products]);

    return (
        <div>
            {/* Stats Row */}
            <div className={styles.statsRow}>
                <StatCard
                    label="Total Revenue"
                    value="৳ 8,521"
                    change="+45%"
                    icon={DollarSign}
                    iconBg="rgba(45, 212, 191, 0.1)"
                    iconColor="#2dd4bf"
                />
                <StatCard
                    label="Total Products"
                    value={products.length}
                    change="+15%"
                    icon={Package}
                    iconBg="rgba(59, 130, 246, 0.1)"
                    iconColor="#3b82f6"
                />
                <StatCard
                    label="Active Products"
                    value={stats.activeProducts}
                    change="+20%"
                    icon={ShoppingBag}
                    iconBg="rgba(168, 85, 247, 0.1)"
                    iconColor="#a855f7"
                />
            </div>

            {/* Main Layout Grid */}
            <div className={styles.dashboardGrid}>
                {/* Left Column */}
                <div className={styles.columnLeft}>
                    <div className={styles.mb30}>
                        <RevenueReports data={REVENUE_DATA} />
                    </div>
                    <RecentOrdersTable />
                </div>

                {/* Right Column */}
                <div className={styles.columnRight}>
                    <div className={styles.mb30}>
                        <SalesByCategory data={stats.categoryData} />
                    </div>
                    <DeliveryProgress />
                </div>
            </div>
        </div>
    );
}
