/**
 * AURA VOGUE - Global Configuration & LocalStorage Persistence Layer
 */

const CONFIG = {
    storeName: "AURA VOGUE",
    tagline: "Minimalist Luxury & Contemporary Silhouettes",
    currency: "ETB",
    whatsappNumber: "+251911223344", // Replace with actual business WhatsApp
    telebirrNumber: "0911223344",     // Replace with actual Telebirr merchant/personal number
    cbeAccount: {
        accountName: "Aura Vogue Fashion PLC",
        accountNumber: "1000293847568",
        bankName: "Commercial Bank of Ethiopia (CBE)"
    },
    socialLinks: {
        instagram: "https://instagram.com/auravogue",
        telegram: "https://t.me/auravogue",
        tiktok: "https://tiktok.com/@auravogue"
    }
};

const INITIAL_PRODUCTS = [
    {
        id: "prod-1",
        name: "Oversized Cashmere Trench",
        price: 8500,
        category: "Women",
        image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
        description: "Impeccably tailored from ultra-soft Mongolian cashmere blend. Features drop shoulders and a self-tie belt."
    },
    {
        id: "prod-2",
        name: "Architectural Wool Blazer",
        price: 6200,
        category: "Men",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
        description: "Structured single-breasted blazer crafted from lightweight virgin wool with matte horn buttons."
    },
    {
        id: "prod-3",
        name: "Pleated Silk Midi Dress",
        price: 5400,
        category: "Women",
        image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80",
        description: "Fluid silk georgette dress with delicate micro-pleating and an effortless drape."
    },
    {
        id: "prod-4",
        name: "Minimalist Heavyweight Hoodie",
        price: 3200,
        category: "Unisex",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
        description: "Crafted from 480GSM organic French terry cotton. Clean lines with zero exterior branding."
    },
    {
        id: "prod-5",
        name: "Tailored Pleated Trousers",
        price: 4100,
        category: "Men",
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
        description: "High-waisted relaxed fit trousers with sharp front creases and adjustable side tabs."
    },
    {
        id: "prod-6",
        name: "Structured Leather Tote",
        price: 7500,
        category: "Unisex",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
        description: "Full-grain Italian calfskin tote designed with minimalist geometry and reinforced handles."
    }
];

// --- Storage Utilities ---
const StoreDB = {
    getProducts() {
        const stored = localStorage.getItem('aura_products');
        if (!stored) {
            localStorage.setItem('aura_products', JSON.stringify(INITIAL_PRODUCTS));
            return INITIAL_PRODUCTS;
        }
        return JSON.parse(stored);
    },
    saveProducts(products) {
        localStorage.setItem('aura_products', JSON.stringify(products));
    },
    addProduct(product) {
        const products = this.getProducts();
        products.unshift(product);
        this.saveProducts(products);
    },
    deleteProduct(id) {
        let products = this.getProducts();
        products = products.filter(p => p.id !== id);
        this.saveProducts(products);
    },
    getOrders() {
        const stored = localStorage.getItem('aura_orders');
        return stored ? JSON.parse(stored) : [];
    },
    saveOrder(order) {
        const orders = this.getOrders();
        orders.unshift(order);
        localStorage.setItem('aura_orders', JSON.stringify(orders));
    }
};
