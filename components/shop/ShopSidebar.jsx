"use client";

import { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

export default function ShopSidebar({ categories, activeCategory, activeSubCategory, mobileOpen, setMobileOpen, onSelectCategory, onSelectSubCategory }) {

    // If mobileOpen is true, show drawer styles
    const sidebarClass = mobileOpen
        ? "fixed inset-0 z-50 bg-white p-4 overflow-y-auto transition-transform transform translate-x-0 w-80 shadow-2xl"
        : "hidden lg:block w-64 flex-shrink-0 bg-white border-r border-gray-100 pr-6 sticky top-24 h-[calc(100vh-100px)] overflow-y-auto";

    // Accordion state
    const [expanded, setExpanded] = useState(activeCategory ? [activeCategory] : []);

    const toggleExpand = (catName) => {
        if (expanded.includes(catName)) {
            setExpanded(expanded.filter(c => c !== catName));
        } else {
            setExpanded([...expanded, catName]);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={sidebarClass}>
                <div className="flex justify-between items-center mb-6 lg:hidden">
                    <h2 className="text-xl font-bold">Filters</h2>
                    <button onClick={() => setMobileOpen(false)}><X /></button>
                </div>

                <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 mb-4 px-2 uppercase text-xs tracking-wider">Categories</h3>

                    {categories.map((cat) => {
                        const isExpanded = expanded.includes(cat.name);
                        const isActive = activeCategory === cat.name;

                        return (
                            <div key={cat.id} className="border-b border-gray-50 last:border-0">
                                <div
                                    className={`flex items-center justify-between py-2 px-2 cursor-pointer hover:bg-gray-50 rounded-lg group ${isActive ? 'bg-gray-50' : ''}`}
                                    onClick={() => {
                                        toggleExpand(cat.name);
                                        // Optional: Select category on expand
                                        // onSelectCategory(cat.name); 
                                    }}
                                >
                                    <span className={`font-medium ${isActive ? 'text-black' : 'text-gray-600 group-hover:text-black'}`}>
                                        {cat.name}
                                    </span>
                                    {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                                </div>

                                {isExpanded && (
                                    <div className="ml-4 pl-2 border-l border-gray-100 mt-1 mb-2 space-y-1">
                                        <div
                                            onClick={() => onSelectCategory(cat.name, null)} // 'All' in this category
                                            className={`py-1.5 px-2 text-sm cursor-pointer rounded md:hover:bg-gray-50 ${isActive && !activeSubCategory ? 'font-semibold text-black bg-gray-100' : 'text-gray-500'}`}
                                        >
                                            All {cat.name}
                                        </div>
                                        {cat.subCategories.map((sub) => (
                                            <div
                                                key={sub.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectCategory(cat.name, sub.name);
                                                }}
                                                className={`py-1.5 px-2 text-sm cursor-pointer flex justify-between items-center rounded md:hover:bg-gray-50
                                                    ${activeSubCategory === sub.name && isActive ? 'font-semibold text-black bg-gray-100' : 'text-gray-500 hover:text-black'}
                                                `}
                                            >
                                                <span>{sub.name}</span>
                                                {/* <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{sub.count}</span> */}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </aside>
        </>
    );
}
