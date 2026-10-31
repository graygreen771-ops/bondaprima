/**
 * AURA VOGUE - Frontend Storefront, Cart, and Admin Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Determine page context and run appropriate initializers
    initCommon();

    if (document.getElementById('product-grid')) {
        initStorefront();
    }

    if (document.getElementById('add-product-form')) {
        initAdminDashboard();
    }
});

/* --- Common UI Handlers --- */
function initCommon() {
    // Mobile menu toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    updateCartBadge();
}

/* --- Storefront Logic --- */
let currentFilter = 'All';

function initStorefront() {
    renderProducts(StoreDB.getProducts(), currentFilter);

    // Cart Drawer Interactions
    const cartBtn = document.getElementById('cart-btn');
    const closeCart = document.getElementById('close-cart');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartBackdrop = document.getElementById('cart-backdrop');

    if (cartBtn) cartBtn.addEventListener('click', toggleCartDrawer);
    if (closeCart) closeCart.addEventListener('click', toggleCartDrawer);
    if (cartBackdrop) cartBackdrop.addEventListener('click', toggleCartDrawer);

    // Checkout Modal Interactions
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckout = document.getElementById('close-checkout');

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = getCart();
            if (cart.length === 0) {
                alert('Your shopping bag is empty.');
                return;
            }
            toggleCartDrawer();
            checkoutModal.classList.remove('hidden');
        });
    }

    if (closeCheckout) {
        closeCheckout.addEventListener('click', () => {
            checkoutModal.classList.add('hidden');
        });
    }

    // Payment Method Selection Dynamic Instruction Box
    const paymentRadios = document.querySelectorAll('input[name="payment_method"]');
    const instructionBox = document.getElementById('payment-instruction-box');

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updatePaymentInstructions(e.target.value, instructionBox);
        });
    });

    // Initialize with default selected payment
    const checkedRadio = document.querySelector('input[name="payment_method"]:checked');
    if (checkedRadio && instructionBox) {
        updatePaymentInstructions(checkedRadio.value, instructionBox);
    }

    // Checkout Form Submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmission);
    }
}

function updatePaymentInstructions(method, box) {
    if (method === 'WhatsApp') {
        box.classList.add('hidden');
        box.innerHTML = '';
    } else if (method === 'Telebirr') {
        box.classList.remove('hidden');
        box.innerHTML = `
            <p class="font-semibold text-gold mb-1">Telebirr Direct Transfer Instructions:</p>
            <p>Please send the total sum to Telebirr Merchant/Account: <strong class="text-white">${CONFIG.telebirrNumber}</strong> (${CONFIG.storeName}).</p>
            <p class="mt-1 text-neutral-400">Attach screenshot or transaction reference in WhatsApp upon checkout completion.</p>
        `;
    } else if (method === 'CBE') {
        box.classList.remove('hidden');
        box.innerHTML = `
            <p class="font-semibold text-gold mb-1">Commercial Bank of Ethiopia (CBE) Instructions:</p>
            <p>Account Name: <strong class="text-white">${CONFIG.cbeAccount.accountName}</strong></p>
            <p>Account Number: <strong class="text-white">${CONFIG.cbeAccount.accountNumber}</strong> (${CONFIG.cbeAccount.bankName})</p>
            <p class="mt-1 text-neutral-400">Include your name as the transfer reason.</p>
        `;
    }
}

function renderProducts(products, category = 'All') {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const filtered = category === 'All' ? products : products.filter(p => p.category === category);

    if (filtered.length === 0) {
        grid.innerHTML = `<p class="text-neutral-400 col-span-full text-center py-12">No masterpieces found in this category.</p>`;
        return;
    }

    grid.innerHTML = filtered.map(product => `
        <div class="group bg-cardBg border border-borderDark rounded-sm overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-gold/50">
            <div>
                <div class="relative h-96 overflow-hidden bg-neutral-900">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                    <span class="absolute top-4 left-4 bg-darkBg/80 backdrop-blur-md text-gold text-[10px] tracking-widest uppercase px-3 py-1 border border-borderDark">
                        ${product.category}
                    </span>
                </div>
                <div class="p-6">
                    <h3 class="font-serif text-lg font-bold text-white mb-2">${product.name}</h3>
                    <p class="text-neutral-400 text-xs font-light line-clamp-2 mb-4">${product.description}</p>
                </div>
            </div>
            <div class="p-6 pt-0 flex items-center justify-between border-t border-borderDark/50 mt-4">
                <span class="font-serif text-lg font-bold text-gold">${product.price.toLocaleString()} ${CONFIG.currency}</span>
                <button onclick="addToCart('${product.id}')" class="bg-transparent border border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300 px-5 py-2 text-xs uppercase tracking-widest font-semibold">
                    Add to Bag
                </button>
            </div>
        </div>
    `).join('');
}

function filterProducts(category) {
    currentFilter = category;
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('data-filter') === category) {
            btn.className = "filter-btn px-5 py-2 text-xs uppercase tracking-widest border border-gold bg-gold text-black font-semibold transition-all";
        } else {
            btn.className = "filter-btn px-5 py-2 text-xs uppercase tracking-widest border border-borderDark text-neutral-300 hover:border-gold transition-all";
        }
    });
    renderProducts(StoreDB.getProducts(), category);
}

function filterByCategory(category) {
    const shopSection = document.getElementById('shop');
    if (shopSection) {
        shopSection.scrollIntoView({ behavior: 'smooth' });
    }
    filterProducts(category);
}

/* --- Cart Management --- */
function getCart() {
    const stored = localStorage.getItem('aura_cart');
    return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
    updateCartBadge();
    renderCartDrawerContent();
}

function addToCart(productId) {
    const products = StoreDB.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);
    toggleCartDrawer();
}

function updateCartQuantity(productId, delta) {
    let cart = getCart();
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
    }
    saveCart(cart);
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const countSpan = document.getElementById('cart-item-count');
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (badge) badge.innerText = totalCount;
    if (countSpan) countSpan.innerText = totalCount;
}

function toggleCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) {
        drawer.classList.toggle('hidden');
        renderCartDrawerContent();
    }
}

function renderCartDrawerContent() {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    if (!container) return;

    const cart = getCart();

    if (cart.length === 0) {
        container.innerHTML = `<p class="text-neutral-400 text-center py-12 text-sm">Your shopping bag is empty.</p>`;
        if (subtotalEl) subtotalEl.innerText = `0 ${CONFIG.currency}`;
        return;
    }

    let subtotal = 0;

    container.innerHTML = cart.map(item => {
        subtotal += item.price * item.quantity;
        return `
            <div class="flex items-center space-x-4 py-4">
                <img src="${item.image}" alt="${item.name}" class="w-20 h-24 object-cover border border-borderDark">
                <div class="flex-1">
                    <h4 class="font-serif text-sm font-bold text-white mb-1">${item.name}</h4>
                    <p class="text-gold text-xs font-semibold mb-3">${item.price.toLocaleString()} ${CONFIG.currency}</p>
                    <div class="flex items-center space-x-3">
                        <button onclick="updateCartQuantity('${item.id}', -1)" class="w-6 h-6 border border-borderDark flex items-center justify-center text-neutral-400 hover:text-gold">-</button>
                        <span class="text-xs text-white">${item.quantity}</span>
                        <button onclick="updateCartQuantity('${item.id}', 1)" class="w-6 h-6 border border-borderDark flex items-center justify-center text-neutral-400 hover:text-gold">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (subtotalEl) {
        subtotalEl.innerText = `${subtotal.toLocaleString()} ${CONFIG.currency}`;
    }
}

/* --- Checkout Handling & WhatsApp Encoding --- */
function handleCheckoutSubmission(e) {
    e.preventDefault();
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;

    const cart = getCart();
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Format Order summary for WhatsApp
    let orderDetails = `*NEW ORDER - ${CONFIG.storeName}*\n\n`;
    orderDetails += `*Customer Name:* ${name}\n`;
    orderDetails += `*Phone:* ${phone}\n`;
    orderDetails += `*Delivery Address:* ${address}\n`;
    orderDetails += `*Payment Method:* ${paymentMethod}\n\n`;
    orderDetails += `*Items Ordered:*\n`;
    cart.forEach((item, idx) => {
        orderDetails += `${idx + 1}. ${item.name} (${item.category}) x${item.quantity} - ${(item.price * item.quantity).toLocaleString()} ${CONFIG.currency}\n`;
    });
    orderDetails += `\n*Total Amount:* ${subtotal.toLocaleString()} ${CONFIG.currency}`;

    // Save order to LocalStorage database
    StoreDB.saveOrder({
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        name,
        phone,
        address,
        paymentMethod,
        items: cart,
        total: subtotal,
        date: new Date().toISOString()
    });

    // Clear cart
    localStorage.removeItem('aura_cart');
    updateCartBadge();

    // Close modal
    document.getElementById('checkout-modal').classList.add('hidden');

    // Open WhatsApp URL
    const encodedMessage = encodeURIComponent(orderDetails);
    const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    
    alert(`Order placed successfully! Redirecting you to WhatsApp to finalize with our concierge.`);
    window.open(whatsappUrl, '_blank');
    window.location.reload();
}

/* --- Admin Dashboard Logic --- */
function initAdminDashboard() {
    renderAdminStats();
    renderAdminProductTable();

    const form = document.getElementById('add-product-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newProduct = {
                id: 'prod-' + Date.now(),
                name: document.getElementById('new-name').value.trim(),
                price: parseFloat(document.getElementById('new-price').value),
                category: document.getElementById('new-category').value,
                image: document.getElementById('new-image').value.trim(),
                description: document.getElementById('new-desc').value.trim()
            };

            StoreDB.addProduct(newProduct);
            alert('Product published successfully to inventory.');
            form.reset();
            renderAdminStats();
            renderAdminProductTable();
        });
    }
}

function renderAdminStats() {
    const prodCountEl = document.getElementById('stat-product-count');
    const orderCountEl = document.getElementById('stat-order-count');

    if (prodCountEl) prodCountEl.innerText = StoreDB.getProducts().length;
    if (orderCountEl) orderCountEl.innerText = StoreDB.getOrders().length;
}

function renderAdminProductTable() {
    const tbody = document.getElementById('admin-product-list');
    if (!tbody) return;

    const products = StoreDB.getProducts();

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-neutral-400">No inventory found.</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr class="hover:bg-darkBg/50 transition-colors">
            <td class="py-4 px-4 flex items-center space-x-3">
                <img src="${product.image}" alt="${product.name}" class="w-10 h-12 object-cover border border-borderDark">
                <span class="font-medium text-white">${product.name}</span>
            </td>
            <td class="py-4 px-4 text-neutral-400">${product.category}</td>
            <td class="py-4 px-4 text-gold font-semibold">${product.price.toLocaleString()} ${CONFIG.currency}</td>
            <td class="py-4 px-4 text-right">
                <button onclick="deleteProductItem('${product.id}')" class="text-red-400 hover:text-red-300 transition-colors text-xs uppercase tracking-widest border border-red-500/30 px-3 py-1.5 bg-red-500/10">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function deleteProductItem(id) {
    if (confirm('Are you sure you want to permanently delete this product from inventory?')) {
        StoreDB.deleteProduct(id);
        renderAdminStats();
        renderAdminProductTable();
    }
}
