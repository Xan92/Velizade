/* ============================================
   FLORIST — App Logic
   SPA Routing, Product Data, Cart, Filters
   ============================================ */

// ─── PRODUCT DATA ───────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 1,
    name: "11 Qırmızı Gül Buketi",
    desc: "Klassik sevgi simvolu. Romantik anlar üçün ideal 11 gözəl qırmızı gül.",
    price: 45,
    oldPrice: null,
    category: "roses",
    img: "product_red_roses_11.png",
    badge: "Populyar",
    badgeType: "",
    featured: true,
  },
  {
    id: 2,
    name: "51 Qırmızı Gül Buketi",
    desc: "Böyük ifadə, böyük sevgi. 51 premium qırmızı güldən ibarət möhtəşəm buket.",
    price: 165,
    oldPrice: 190,
    category: "roses",
    img: "product_red_roses_51.png",
    badge: "Endirim",
    badgeType: "sale",
    featured: true,
  },
  {
    id: 3,
    name: "Şirin Pastel Səbəti",
    desc: "Pastel rəngli güllərdən hazırlanmış romantik səbət. Hər mərasimdə ideal hədiyyə.",
    price: 120,
    oldPrice: null,
    category: "baskets",
    img: "product_pastel_basket.png",
    badge: "Yeni",
    badgeType: "new",
    featured: true,
  },
  {
    id: 4,
    name: "Miks Buket",
    desc: "Müxtəlif rəngli güllərdən hazırlanmış rəngarəng və şən buket.",
    price: 75,
    oldPrice: null,
    category: "bouquets",
    img: "product_mixed_bouquet.png",
    badge: "",
    badgeType: "",
    featured: true,
  },
  {
    id: 5,
    name: "Pink Qutu Düzümü",
    desc: "Açıq çəhrayı güllər xüsusi lüks qutuda. Əsas hadisələr üçün mükəmməldir.",
    price: 140,
    oldPrice: 160,
    category: "boxes",
    img: "product_pink_box.png",
    badge: "Endirim",
    badgeType: "sale",
    featured: true,
  },
  {
    id: 6,
    name: "21 Qırmızı Gül Buketi",
    desc: "21 taze qırmızı güldən hazırlanmış klassik buket. Sevgiliyə ən güzel sürpriz.",
    price: 80,
    oldPrice: null,
    category: "roses",
    img: "product_red_roses_11.png",
    badge: "",
    badgeType: "",
    featured: false,
  },
  {
    id: 7,
    name: "Bahar Buket",
    desc: "Rəngarəng çiçəklərdən hazırlanan, baharın gəlişini xatırladan şən buket.",
    price: 65,
    oldPrice: null,
    category: "bouquets",
    img: "product_mixed_bouquet.png",
    badge: "Yeni",
    badgeType: "new",
    featured: false,
  },
  {
    id: 8,
    name: "Lüks Hədiyyə Səbəti",
    desc: "Premium çiçəklər, şokolad və bəzək elementləri ilə dolu lüks xüsusi səbət.",
    price: 200,
    oldPrice: 230,
    category: "baskets",
    img: "product_pastel_basket.png",
    badge: "Endirim",
    badgeType: "sale",
    featured: false,
  },
];

// ─── STATE ──────────────────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem("florist_cart") || "[]");
let currentView = "home";
let currentProduct = null;
let activeCategory = "all";
let priceMax = 500;
let sortMode = "default";
let wishlist = new Set(JSON.parse(localStorage.getItem("florist_wishlist") || "[]"));

// ─── UTILS ──────────────────────────────────────────────────────
function saveCart() {
  localStorage.setItem("florist_cart", JSON.stringify(cart));
}
function saveWishlist() {
  localStorage.setItem("florist_wishlist", JSON.stringify([...wishlist]));
}
function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}
function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

// ─── RENDER PRODUCT CARD ────────────────────────────────────────
function renderProductCard(product) {
  const liked = wishlist.has(product.id);
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <div class="product-img-wrap">
      <img src="${product.img}" alt="${product.name}" loading="lazy" />
      ${product.badge ? `<span class="product-badge ${product.badgeType}">${product.badge}</span>` : ""}
      <button class="wishlist-heart ${liked ? "liked" : ""}" data-id="${product.id}" aria-label="Sevimli">
        ${liked ? "❤️" : "🤍"}
      </button>
    </div>
    <div class="product-info">
      <div class="product-name">${product.name}</div>
      <div class="product-desc">${product.desc}</div>
      <div class="product-price-row">
        <span class="product-price">${product.price}₼</span>
        ${product.oldPrice ? `<span class="product-price-old">${product.oldPrice}₼</span>` : ""}
      </div>
      <button class="btn-add-cart" data-id="${product.id}">Səbətə əlavə et</button>
    </div>
  `;

  // Card click → detail
  card.addEventListener("click", (e) => {
    if (e.target.closest(".wishlist-heart") || e.target.closest(".btn-add-cart")) return;
    navigateTo("product", null, product.id);
  });

  // Wishlist
  card.querySelector(".wishlist-heart").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleWishlist(product.id, card.querySelector(".wishlist-heart"));
  });

  // Add to cart
  card.querySelector(".btn-add-cart").addEventListener("click", (e) => {
    e.stopPropagation();
    addToCart(product.id);
  });

  return card;
}

// ─── FEATURED GRID ──────────────────────────────────────────────
function renderFeatured() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  grid.innerHTML = "";
  PRODUCTS.filter((p) => p.featured).forEach((p) => grid.appendChild(renderProductCard(p)));
}

// ─── SHOP GRID ──────────────────────────────────────────────────
function renderShop() {
  let products = [...PRODUCTS];

  // Category filter
  if (activeCategory !== "all") {
    products = products.filter((p) => p.category === activeCategory);
  }

  // Price filter
  products = products.filter((p) => p.price <= priceMax);

  // Search filter
  const searchVal = document.getElementById("searchInput")?.value?.toLowerCase().trim();
  if (searchVal) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchVal) ||
        p.desc.toLowerCase().includes(searchVal)
    );
  }

  // Sort
  if (sortMode === "price-asc") products.sort((a, b) => a.price - b.price);
  else if (sortMode === "price-desc") products.sort((a, b) => b.price - a.price);
  else if (sortMode === "name-asc") products.sort((a, b) => a.name.localeCompare(b.name));

  const grid = document.getElementById("shop-grid");
  const countEl = document.getElementById("productCount");
  if (!grid) return;
  grid.innerHTML = "";
  if (countEl) countEl.textContent = `${products.length} məhsul`;

  if (products.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--clr-muted);padding:60px 0">
      <div style="font-size:3rem;margin-bottom:16px">🌸</div>
      <p>Heç bir məhsul tapılmadı.</p>
    </div>`;
  } else {
    products.forEach((p) => grid.appendChild(renderProductCard(p)));
  }
}

// ─── PRODUCT DETAIL ─────────────────────────────────────────────
function renderProductDetail(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;
  currentProduct = product;

  const container = document.getElementById("product-detail-container");
  let qty = 1;

  container.innerHTML = `
    <button class="back-btn" id="backBtn">← Geri qayıt</button>
    <div class="product-detail">
      <div class="detail-img-wrap">
        <img src="${product.img}" alt="${product.name}" />
      </div>
      <div class="detail-info">
        ${product.badge ? `<span class="detail-badge">${product.badge}</span>` : ""}
        <h1 class="detail-name">${product.name}</h1>
        <div class="detail-price">${product.price}₼${product.oldPrice ? ` <span style="font-size:1.1rem;color:var(--clr-muted);text-decoration:line-through;margin-left:8px">${product.oldPrice}₼</span>` : ""}</div>
        <p class="detail-desc">${product.desc}</p>
        <div class="detail-divider"></div>
        <div class="qty-row">
          <span class="qty-label">Miqdar:</span>
          <div class="qty-control">
            <button class="qty-btn" id="qtyMinus">−</button>
            <span class="qty-num" id="qtyDisplay">1</span>
            <button class="qty-btn" id="qtyPlus">+</button>
          </div>
        </div>
        <button class="detail-add-btn" id="detailAddCart">🛒 Səbətə əlavə et</button>
      </div>
    </div>
  `;

  // Back btn
  document.getElementById("backBtn").addEventListener("click", () => navigateTo("shop"));

  // Qty controls
  document.getElementById("qtyMinus").addEventListener("click", () => {
    if (qty > 1) { qty--; document.getElementById("qtyDisplay").textContent = qty; }
  });
  document.getElementById("qtyPlus").addEventListener("click", () => {
    qty++;
    document.getElementById("qtyDisplay").textContent = qty;
  });

  // Add to cart from detail
  document.getElementById("detailAddCart").addEventListener("click", () => {
    addToCart(product.id, qty);
  });
}

// ─── CART LOGIC ─────────────────────────────────────────────────
function addToCart(productId, qty = 1) {
  const existing = cart.find((i) => i.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    const product = PRODUCTS.find((p) => p.id === productId);
    cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, qty });
  }
  saveCart();
  updateCartUI();
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter((i) => i.id !== productId);
  saveCart();
  updateCartUI();
}

function changeCartQty(productId, delta) {
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(productId);
  else {
    saveCart();
    updateCartUI();
  }
}

function updateCartUI() {
  // Count badge
  const countEl = document.getElementById("cartCount");
  const count = getCartCount();
  countEl.textContent = count;
  countEl.classList.add("bump");
  setTimeout(() => countEl.classList.remove("bump"), 300);

  // Cart items
  const itemsEl = document.getElementById("cartItems");
  const footerEl = document.getElementById("cartFooter");

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <span class="empty-icon">🌸</span>
        <p>Səbətiniz boşdur</p>
        <button class="btn-primary" onclick="closeCart();navigateTo('shop')">Alışa başla</button>
      </div>`;
    footerEl.innerHTML = "";
    return;
  }

  itemsEl.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}" />
      <div class="cart-item-body">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price}₼</div>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" data-id="${item.id}" data-delta="-1">−</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button class="cart-qty-btn" data-id="${item.id}" data-delta="1">+</button>
          <button class="cart-remove-btn" data-id="${item.id}" aria-label="Sil">✕</button>
        </div>
      </div>
    </div>`
    )
    .join("");

  // Events
  itemsEl.querySelectorAll(".cart-qty-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      changeCartQty(parseInt(btn.dataset.id), parseInt(btn.dataset.delta))
    );
  });
  itemsEl.querySelectorAll(".cart-remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(parseInt(btn.dataset.id)));
  });

  const total = getCartTotal();
  footerEl.innerHTML = `
    <div class="cart-subtotal">
      <span>Cəmi:</span>
      <span>${total}₼</span>
    </div>
    <button class="cart-checkout-btn">Sifarişi Tamamla</button>
  `;
  footerEl.querySelector(".cart-checkout-btn").addEventListener("click", () => {
    if (cart.length === 0) return;
    closeCart();
    navigateTo("checkout");
  });
}

function openCart() {
  document.getElementById("cartSidebar").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  document.getElementById("cartSidebar").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

// ─── WISHLIST ───────────────────────────────────────────────────
function toggleWishlist(productId, btn) {
  if (wishlist.has(productId)) {
    wishlist.delete(productId);
    btn.classList.remove("liked");
    btn.textContent = "🤍";
  } else {
    wishlist.add(productId);
    btn.classList.add("liked");
    btn.textContent = "❤️";
  }
  saveWishlist();
}

// ─── CHECKOUT ───────────────────────────────────────────────────
function renderCheckout() {
  const container = document.getElementById("checkout-content");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="success-view">
        <div class="success-icon">🛒</div>
        <h2 class="success-title">Səbətiniz boşdur</h2>
        <p class="success-desc">Sifariş vermək üçün əvvəlcə səbətinizə məhsul əlavə edin.</p>
        <button class="btn-primary" onclick="navigateTo('shop')">Mağazaya Qayıt</button>
      </div>
    `;
    return;
  }

  const total = getCartTotal();
  const summaryHtml = cart.map(item => `
    <div class="checkout-summary-item">
      <span>${item.qty}x ${item.name}</span>
      <span>${item.price * item.qty}₼</span>
    </div>
  `).join("");

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const minDate = `${year}-${month}-${day}`;

  container.innerHTML = `
    <button class="back-btn" id="checkoutBackBtn" style="margin-bottom:24px">← Səbətə qayıt</button>
    <div class="checkout-layout">
      <div class="checkout-card">
        <h2>Sifarişi Rəsmiləşdir</h2>
        <form id="checkoutForm">
          <div class="form-group">
            <label class="form-label">Ad və Soyad</label>
            <input type="text" class="input-field" id="orderName" required placeholder="Məsələn: Əli Məmmədov" />
          </div>
          <div class="form-group">
            <label class="form-label">Telefon Nömrəsi</label>
            <input type="tel" class="input-field" id="orderPhone" required pattern="^(\\+994|0)(50|51|55|70|77|99|10)[0-9]{7}$" title="Nömrə Azərbaycan formatında olmalıdır (məsələn: 0551234567 və ya +994551234567)" placeholder="0551234567" />
          </div>
          <div class="form-group">
            <label class="form-label">Çatdırılma Ünvanı</label>
            <input type="text" class="input-field" id="orderAddress" required placeholder="Küçə, bina, mənzil..." />
          </div>
          <div class="form-group">
            <label class="form-label">Çatdırılma Günü</label>
            <input type="date" class="input-field" id="orderDate" required min="${minDate}" />
          </div>
          <div class="form-group">
            <label class="form-label">Çatdırılma Saatı</label>
            <select class="input-field" id="orderTime" required>
              <option value="">Əvvəlcə gün seçin...</option>
            </select>
          </div>
          <button type="submit" class="submit-btn" style="margin-top: 16px;">Sifarişi Təsdiqlə</button>
        </form>
      </div>
      <div class="checkout-card" style="height: fit-content;">
        <h2>Sifarişin Xülasəsi</h2>
        <div class="checkout-summary-items">
          ${summaryHtml}
        </div>
        <div class="checkout-total">
          <span>Yekun Məbləğ:</span>
          <span>${total}₼</span>
        </div>
      </div>
    </div>
  `;

  const dateInput = document.getElementById("orderDate");
  const timeSelect = document.getElementById("orderTime");
  
  // Dəqiq saat forması (Sadə, 24 saat formatı)
  function updateTimeOptions() {
    timeSelect.innerHTML = '<option value="">Saat seçin...</option>';
    const selectedDate = dateInput.value;
    if (!selectedDate) return;

    const isToday = selectedDate === minDate;
    const currentHour = new Date().getHours();
    
    // Mağazanın çatdırılma saatları (məsəlçün 09:00 - 22:00 arası)
    let addedCount = 0;
    for (let h = 9; h <= 22; h++) {
      // Əgər bugündürsə, indiki saatı və keçmiş saatları göstərmə (minimum 1 saat sonra)
      if (isToday && h <= currentHour) continue;
      
      const hourStr = String(h).padStart(2, '0') + ":00";
      timeSelect.innerHTML += `<option value="${hourStr}">${hourStr}</option>`;
      addedCount++;
    }
    
    // Əgər gün bitibsə (gecə 22:00-dan sonradırsa)
    if (addedCount === 0 && isToday) {
      timeSelect.innerHTML = '<option value="">Bu gün üçün çatdırılma bitib</option>';
      timeSelect.disabled = true;
    } else {
      timeSelect.disabled = false;
    }
  }

  // Tarix dəyişəndə saat bölməsini yeniləyirik
  dateInput.addEventListener("change", updateTimeOptions);
  
  // İlk yüklənəndə tarix seçilibsə yenilənsin
  if(dateInput.value) {
    updateTimeOptions();
  }

  document.getElementById("checkoutBackBtn").addEventListener("click", () => {
    navigateTo("shop");
    openCart();
  });

  document.getElementById("checkoutForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("orderName").value;
    const phone = document.getElementById("orderPhone").value;
    const address = document.getElementById("orderAddress").value;
    const date = document.getElementById("orderDate").value;
    const time = document.getElementById("orderTime").value;

    const requestDate = new Date(`${date}T${time}`);
    if (requestDate < new Date()) {
      alert("Xahiş edirik, keçmiş saatı seçməyin.");
      return;
    }

    const submitBtn = e.target.querySelector(".submit-btn");
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Göndərilir...";
    submitBtn.disabled = true;

    // ----- Telegram Bot Məlumatları (BURANI ÖZ MƏLUMATLARINIZLA DƏYİŞİN) -----
    // 1. Telegramda @BotFather-a "/newbot" yazıb bot yaradın və Tokeni bura yazın:
    const TELEGRAM_BOT_TOKEN = "8755927473:AAFFcAXkzWDOHty6fWckMfG21ev3BiVjOMc"; 
    // 2. Telegramda @userinfobot-a "/start" yazıb öz İD nömrənizi öyrənin və bura yazın:
    const TELEGRAM_CHAT_ID = "1238464292"; 

    // ----- Telegram Mesaj Şablonu -----
    let text = `📦 YENİ SİFARİŞ - Velizade Flowers 🌸\n\n`;
    text += `👤 Müştəri:  ${name}\n`;
    text += `📞 Telefon:  ${phone}\n`;
    text += `📍 Ünvan:  ${address}\n`;
    text += `📅 Çatdırılma:  ${date} (${time})\n\n`;
    text += `🛍️ Sifariş siyahısı:\n`;
    
    cart.forEach(item => {
      text += `- ${item.qty}x ${item.name} (${item.price * item.qty} AZN)\n`;
    });
    
    text += `\n💰 Yekun:  ${total} AZN`;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN.trim()}/sendMessage`;
    
    // Brauzerin "CORS (preflight)" blokunu keçmək üçün JSON əvəzinə URL encoded form istifadə edirik
    const params = new URLSearchParams();
    params.append("chat_id", TELEGRAM_CHAT_ID.trim());
    params.append("text", text);

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errData => {
          throw new Error(JSON.stringify(errData));
        });
      }
      return response.json();
    })
    .then(data => {
      // Sifariş uğurlu oldu, səbəti sıfırla
      cart = [];
      saveCart();
      updateCartUI();

      // Uğur (Success) mesajını göstər
      container.innerHTML = `
        <div class="success-view">
          <div class="success-icon">✨</div>
          <h2 class="success-title">Təşəkkür edirik, ${name}!</h2>
          <p class="success-desc">
            Sifarişiniz dərhal qəbul edildi. Çiçəkləriniz <strong>${date}</strong> tarixində, <strong>${time}</strong> aralığında bildirdiyiniz ünvana çatdırılacaq. Təsdiq üçün tezliklə sizinlə əlaqə saxlayacağıq.
          </p>
          <button class="btn-primary" onclick="navigateTo('home')">Ana Səhifəyə Qayıt</button>
        </div>
      `;
      window.scrollTo({ top: 0, behavior: "smooth" });
    })
    .catch(error => {
      alert("XƏTA: " + error.message);
      submitBtn.innerText = originalText;
      submitBtn.disabled = false;
    });
  });
}

// ─── NAVIGATION / ROUTING ───────────────────────────────────────
function navigateTo(view, category = null, productId = null) {
  // Hide all views
  document.querySelectorAll(".view").forEach(el => el.classList.remove("active"));
  document.getElementById(`view-${view}`).classList.add("active");

  currentView = view;
  if (category) activeCategory = category;

  if (view === "home") {
    document.getElementById("header").classList.remove("scrolled");
    renderFeatured();
  } else if (view === "shop") {
    document.getElementById("header").classList.add("scrolled");
    // Sync sidebar radio
    const radios = document.querySelectorAll('input[name="cat"]');
    radios.forEach((r) => { if (r.value === activeCategory) r.checked = true; });
    // Update breadcrumb
    const catLabels = { all:"Mağaza", roses:"Güllər", bouquets:"Buketlər", baskets:"Səbətlər", boxes:"Qutu Düzümü" };
    const bc = document.getElementById("shopBreadcrumb");
    if (bc) bc.textContent = catLabels[activeCategory] || "Mağaza";
    renderShop();
  } else if (view === "product" && productId) {
    document.getElementById("header").classList.add("scrolled");
    renderProductDetail(productId);
  } else if (view === "checkout") {
    document.getElementById("header").classList.add("scrolled");
    renderCheckout();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── GLOBAL CLICK DELEGATION ────────────────────────────────────
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-view]");
  if (!el) return;
  e.preventDefault();
  const view = el.dataset.view;
  const cat = el.dataset.cat || null;
  navigateTo(view, cat);
});

// ─── HEADER SCROLL ──────────────────────────────────────────────
window.addEventListener("scroll", () => {
  document.getElementById("header").classList.toggle("scrolled", window.scrollY > 20);
});

// ─── SEARCH ─────────────────────────────────────────────────────
const searchWrap = document.querySelector(".search-wrap");
const searchBtn = document.querySelector(".search-btn");
const searchInput = document.getElementById("searchInput");

searchBtn.addEventListener("click", () => {
  searchWrap.classList.toggle("open");
  if (searchWrap.classList.contains("open")) searchInput.focus();
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    navigateTo("shop");
    searchWrap.classList.remove("open");
  }
});

// ─── SHOP FILTERS ───────────────────────────────────────────────
document.querySelectorAll('input[name="cat"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    activeCategory = radio.value;
    renderShop();
  });
});

const priceRange = document.getElementById("priceRange");
const priceVal = document.getElementById("priceVal");
priceRange?.addEventListener("input", () => {
  priceMax = parseInt(priceRange.value);
  priceVal.textContent = priceMax + "₼";
  renderShop();
});

document.getElementById("sortSelect")?.addEventListener("change", (e) => {
  sortMode = e.target.value;
  renderShop();
});

// ─── CART TOGGLE ────────────────────────────────────────────────
document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("cartOverlay").addEventListener("click", closeCart);

// ─── HAMBURGER ──────────────────────────────────────────────────
const hamburger = document.getElementById("hamburger");
const mainNav = document.getElementById("mainNav");
hamburger.addEventListener("click", () => {
  mainNav.classList.toggle("open");
});
// Close nav on outside click
document.addEventListener("click", (e) => {
  if (!e.target.closest("#mainNav") && !e.target.closest("#hamburger")) {
    mainNav.classList.remove("open");
  }
});

// ─── INIT ───────────────────────────────────────────────────────
updateCartUI();
navigateTo("home");
