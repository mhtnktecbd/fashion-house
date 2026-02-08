"use client";

import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function FilterBar({
    searchQuery,
    setSearchQuery,
    activeCategory,
    activeSubCategory,
    setMobileSidebarOpen,
    totalProducts,
    sort,
    setSort,
    onClearFilters
}) {
    return (
        <div className="bg-white  border-b border-gray-200 mb-6 py-4 sticky top-0 z-20 shadow-sm lg:static lg:shadow-none lg:border-0 lg:p-0">
            <div className="flex flex-col gap-4">

                {/* Search & Mobile Toggle Row */}
                <div className="flex gap-3">
                    <button
                        className="lg:hidden flex items-center justify-center w-12 h-12 border border-gray-200 rounded-lg shrink-0"
                        onClick={() => setMobileSidebarOpen(true)}
                    >
                        <SlidersHorizontal size={20} className="text-gray-600" />
                    </button>

                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-lg transition-all outline-none text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Desktop Sort (Visible on large, or adjust) */}
                    <div className="hidden lg:block relative min-w-[180px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <ArrowUpDown className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="pl-9 pr-8 h-12 w-full bg-white border border-gray-200 rounded-lg cursor-pointer text-sm outline-none focus:border-black appearance-none"
                        >
                            <option value="newest">Newest Arrivals</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Filter Chips / Active Filters */}
                {(activeCategory || activeSubCategory || searchQuery) && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">Active Filters:</span>

                        {activeCategory && (
                            <div className="h-8 px-3 flex items-center bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                                {activeCategory}
                                {!activeSubCategory && (
                                    <button onClick onSelectCategory={() => onClearFilters('category')} className="ml-2 hover:text-blue-900"><X size={12} /></button>
                                )}
                            </div>
                        )}

                        {activeSubCategory && (
                            <div className="h-8 px-3 flex items-center bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
                                {activeSubCategory}
                                <button onClick={() => onClearFilters('subCategory')} className="ml-2 hover:text-indigo-900"><X size={12} /></button>
                            </div>
                        )}

                        {searchQuery && (
                            <div className="h-8 px-3 flex items-center bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                                "{searchQuery}"
                                <button onClick={() => setSearchQuery('')} className="ml-2 hover:text-black"><X size={12} /></button>
                            </div>
                        )}

                        <button
                            onClick={() => onClearFilters('all')}
                            className="text-xs text-gray-500 hover:text-red-600 underline ml-2"
                        >
                            Clear all
                        </button>

                        <div className="ml-auto text-xs text-gray-500 lg:block hidden">
                            Showing {totalProducts} results
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
