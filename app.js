// Initialize Store UI from config & dynamic localStorage products
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".footer-store-name").forEach(el => el.textContent = STORE_CONFIG.storeName);
    document.getElementById("store-logo-name").textContent = STORE_CONFIG.storeName;
    document.getElementById("store-tagline").textContent = STORE_CONFIG.tagline;
    document.getElementById("footer-whatsapp").textContent = STORE_CONFIG.whatsappNumber;

    if(STORE_CONFIG.socials) {
        document.getElementById("social-ig").href = STORE_CONFIG.socials.instagram;
        document.getElementById("social-tg").href = STORE_CONFIG.socials.telegram;
        document.getElementById("social-tt").href = STORE_CONFIG.socials.tiktok;
    }

    const products = getStoredProducts();
    renderProducts(products);
    updateCartCount();

    // Mobile Menu Toggle
    document.getElementById("mobile-menu-btn").addEventListener("click", () => {
        document.getElementById("mobile-menu").classList.toggle("hidden");
    });

    // Cart Drawer Toggles
    document.getElementById("cart-toggle-btn").addEventListener("click", toggleCart);
    document.getElementById("close-cart").addEventListener("click", toggleCart);
    document.getElementById("cart-backdrop").addEventListener("click", toggleCart);

    // Checkout Modal Toggles
    document.getElementById("checkout-btn").addEventListener("click", () => {
        if(cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        toggleCart();
        document.getElementById("checkout-modal").classList.remove("hidden");
    });

    document.getElementById("close-checkout").addEventListener("click", () => {
        document.getElementById("checkout-modal").classList.add("hidden");
    });

    // Payment radio listener
    document.querySelectorAll("input[name='payment']").forEach(radio => {
        radio.addEventListener("change", (e) => {
            const bankBox = document.getElementById("bank-instructions");
            const bankText = document.getElementById("bank-detail-text");
            if (e.target.value === "Telebirr") {
                bankBox.classList.remove("hidden");
                bankText.innerHTML = `Send <b>Total</b> via Telebirr to <b>${STORE_CONFIG.telebirrNumber}</b> (${STORE_CONFIG.cbeAccountName}) & attach screenshot.`;
            } else if (e.target.value === "CBE") {
                bankBox.classList.remove("hidden");
                bankText.innerHTML = `Transfer to CBE Account: <b>${STORE_CONFIG.cbeAccount}</b> (${STORE_CONFIG.cbeAccountName}) & attach screenshot.`;
            } else {
                bankBox.classList.add("hidden");
            }
        });
    });

    // Order form submit
    document.getElementById("order-form").addEventListener("submit", handleCheckoutSubmit);
});

let cart = JSON.parse(localStorage.getItem("aura_cart")) || [];

// Render Products Grid
function renderProducts(productsToRender) {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    if(productsToRender.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-brand-muted py-10">No products found in this category.</p>`;
        return;
    }

    productsToRender.forEach(product => {
        const card = document.createElement("div");
        card.className = "group bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between";
        card.innerHTML = `
            <div class="relative overflow-hidden aspect-[4/5] bg-gray-100">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 uppercase tracking-wider">${product.category}</span>
            </div>
            <div class="p-5 flex flex-col flex-1 justify-between">
                <div>
                    <h3 class="font-serif text-lg font-bold text-brand-dark">${product.name}</h3>
                    <p class="text-xs text-brand-muted mt-1 line-clamp-2">${product.description}</p>
                </div>
                <div class="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                    <span class="font-bold text-lg text-brand-dark">${product.price.toLocaleString()} ${STORE_CONFIG.currency}</span>
                    <button onclick="addToCart(${product.id})" class="bg-brand-dark hover:bg-brand-accent text-white px-4 py-2 text-sm font-semibold rounded-sm transition-colors">Add to Bag</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filter Categories
function filterCategory(category) {
    const buttons = document.querySelectorAll("#filter-buttons button");
    buttons.forEach(btn => {
        if(btn.textContent.trim() === category || (category === 'All' && btn.textContent.trim() === 'All')) {
            btn.className = "px-4 py-2 text-sm font-medium bg-brand-dark text-white rounded-sm";
        } else {
            btn.className = "px-4 py-2 text-sm font-medium bg-gray-200 text-brand-dark hover:bg-gray-300 rounded-sm";
        }
    });

    const products = getStoredProducts();
    if(category === "All") {
        renderProducts(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

// Cart Functions
function toggleCart() {
    const drawer = document.getElementById("cart-drawer");
    drawer.classList.toggle("hidden");
    if(!drawer.classList.contains("hidden")) {
        renderCartItems();
    }
}

function addToCart(productId) {
    const products = getStoredProducts();
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if(existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    toggleCart();
}

function updateQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if(item) {
        item.quantity += delta;
        if(item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
    }
    saveCart();
    updateCartCount();
    renderCartItems();
}

function saveCart() {
    localStorage.setItem("aura_cart", JSON.stringify(cart));
}

function updateCartCount() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-count").textContent = totalCount;
}

function renderCartItems() {
    const container = document.getElementById("cart-items-container");
    container.innerHTML = "";

    if(cart.length === 0) {
        container.innerHTML = `<p class="text-center text-brand-muted py-10">Your shopping bag is empty.</p>`;
        document.getElementById("cart-subtotal").textContent = `0 ${STORE_CONFIG.currency}`;
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const div = document.createElement("div");
        div.className = "flex items-center py-4 space-x-4";
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="w-16 h-20 object-cover rounded-sm">
            <div class="flex-1">
                <h4 class="font-serif font-bold text-sm">${item.name}</h4>
                <p class="text-xs text-brand-muted mt-0.5">${item.price.toLocaleString()} ${STORE_CONFIG.currency}</p>
                <div class="flex items-center space-x-3 mt-2">
                    <button onclick="updateQuantity(${item.id}, -1)" class="w-6 h-6 bg-gray-200 text-xs rounded hover:bg-gray-300">-</button>
                    <span class="text-sm font-semibold">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)" class="w-6 h-6 bg-gray-200 text-xs rounded hover:bg-gray-300">+</button>
                </div>
            </div>
            <span class="font-bold text-sm">${(item.price * item.quantity).toLocaleString()} ${STORE_CONFIG.currency}</span>
        `;
        container.appendChild(div);
    });

    document.getElementById("cart-subtotal").textContent = `${subtotal.toLocaleString()} ${STORE_CONFIG.currency}`;
}

// Checkout Form Submission & WhatsApp Redirect
function handleCheckoutSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("cust-name").value;
    const phone = document.getElementById("cust-phone").value;
    const address = document.getElementById("cust-address").value;
    const paymentMethod = document.querySelector("input[name='payment']:checked").value;

    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let orderText = `*NEW ORDER - ${STORE_CONFIG.storeName}*\n\n`;
    orderText += `*Customer Details:*\n- Name: ${name}\n- Phone: ${phone}\n- Address: ${address}\n- Payment Method: ${paymentMethod}\n\n`;
    orderText += `*Order Items:*\n`;
    cart.forEach(item => {
        orderText += `• ${item.name} x${item.quantity} - ${(item.price * item.quantity).toLocaleString()} ${STORE_CONFIG.currency}\n`;
    });
    orderText += `\n*Total Amount: ${total.toLocaleString()} ${STORE_CONFIG.currency}*`;

    if(paymentMethod === "Telebirr" || paymentMethod === "CBE") {
        alert(`Order noted! Please complete your transfer of ${total.toLocaleString()} ${STORE_CONFIG.currency} via ${paymentMethod} and attach the screenshot in the WhatsApp chat that will open now.`);
    }

    const encodedMessage = encodeURIComponent(orderText);
    const cleanNumber = STORE_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

    cart = [];
    saveCart();
    updateCartCount();
    document.getElementById("checkout-modal").classList.add("hidden");

    window.open(whatsappUrl, '_blank');
}
