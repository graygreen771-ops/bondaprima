const STORE_CONFIG = {
    storeName: "AURA VOGUE",
    tagline: "Redefining Modern Minimalist Luxury",
    currency: "ETB",
    whatsappNumber: "+251911234567", // Replace with your WhatsApp number
    telebirrNumber: "0911234567",
    cbeAccount: "1000123456789",
    cbeAccountName: "Aura Vogue Fashion",
    socials: {
        instagram: "https://instagram.com",
        telegram: "https://t.me/auravogue",
        tiktok: "https://tiktok.com"
    }
};

// Initial products fallback if localStorage is empty
const INITIAL_PRODUCTS = [
    {
        id: 1,
        name: "Minimalist Oversized Linen Shirt",
        price: 2499,
        category: "Men",
        image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop",
        description: "Breathable pure linen crafted for effortless everyday style."
    },
    {
        id: 2,
        name: "Modern Chic Wrap Dress",
        price: 3899,
        category: "Women",
        image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop",
        description: "Contemporary haute couture silhouette with premium drape."
    },
    {
        id: 3,
        name: "Structured Urban Trench Coat",
        price: 5299,
        category: "Unisex",
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop",
        description: "Sleek, water-resistant outerwear designed for all-season layering."
    },
    {
        id: 4,
        name: "Tailored Pleated Trousers",
        price: 2899,
        category: "Men",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
        description: "Crisp pleats and a relaxed tailored fit for sophisticated comfort."
    }
];

// Helper to get products (checks localStorage first, falls back to INITIAL_PRODUCTS)
function getStoredProducts() {
    const saved = localStorage.getItem("aura_products");
    if (!saved) {
        localStorage.setItem("aura_products", JSON.stringify(INITIAL_PRODUCTS));
        return INITIAL_PRODUCTS;
    }
    return JSON.parse(saved);
}

function saveStoredProducts(products) {
    localStorage.setItem("aura_products", JSON.stringify(products));
}
