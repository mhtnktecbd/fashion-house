export const homeSections = [
    {
        id: 'section_1',
        type: 'category_grid',
        title: 'All Collections',
        subtitle: 'Explore our latest collections',
        enabled: true,
        viewAllLink: '/shop',
        order: 0,
        items: [
            { title: 'Men', slug: 'men', image: '/images/men-collection.jpg' },
            { title: 'Women', slug: 'women', image: '/images/women-collection.jpg' },
            { title: 'Kids', slug: 'kids', image: '/images/kids-collection.jpg' },
            { title: 'Sports', slug: 'sports', image: '/images/sports-collection.jpg' }
        ]
    },
    {
        id: 'section_2',
        type: 'product_grid',
        title: 'New Arrivals',
        subtitle: 'Check out the latest trends',
        enabled: true,
        viewAllLink: '/shop?sort=newest',
        order: 1,
        mode: 'newest', // 'manual' | 'newest' | 'tag'
        limit: 8,
        productSlugs: []
    }
];
