"use client";

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Breadcrumbs({ items }) {
    // items = [{ label: 'Men', href: '/shop/men' }, { label: 'T-Shirt', href: null }]
    // If items provided, use them. Else try to generate (fallback).

    return (
        <nav aria-label="Breadcrumb" style={{ marginBottom: '20px' }}>
            <ol style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontSize: '13px',
                color: '#666'
            }}>
                <li>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', color: '#888', transition: 'color 0.2s' }}>
                        <Home size={14} />
                    </Link>
                </li>

                {items && items.map((item, index) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                        <ChevronRight size={12} style={{ margin: '0 8px', color: '#ccc' }} />
                        {item.href ? (
                            <Link href={item.href} style={{ color: '#666', textDecoration: 'none', fontWeight: 500 }}>
                                {item.label}
                            </Link>
                        ) : (
                            <span style={{ color: '#000', fontWeight: 600 }}>{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
