/*
  main.js - All interactive behaviour for the demo store.
  Each page includes data.js first, then this file.
  Functions check which elements exist, so one file works for every page.

  DEMO ONLY: cart, accounts and orders are stored in the browser's localStorage.
  This is NOT secure and is not a real database. Never use real passwords here.
*/

/* ---------- localStorage keys ---------- */
const CART_KEY = "ff_cart";        // [{ id, qty }]
const USERS_KEY = "ff_users";      // [{ name, email, password }]  (demo only!)
const SESSION_KEY = "ff_session";  // email of logged-in demo user
const ORDERS_KEY = "ff_orders";    // [{ id, email, date, items, total, shipping }]
const MIN_PASSWORD = 8;

/* ---------- Small helpers ---------- */
function load(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null ? fallback : value;
  } catch (e) {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function money(n) {
  return "$" + n.toFixed(2);
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
/* Escape text before putting it into HTML (prevents HTML injection) */
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
function showMessage(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = "form-message " + (type || "");
}

/* ---------- Cart functions ---------- */
function getCart() { return load(CART_KEY, []); }
function saveCart(cart) { save(CART_KEY, cart); updateCartCount(); }

function addToCart(id) {
  const cart = getCart();
  const line = cart.find(function (item) { return item.id === id; });
  if (line) { line.qty += 1; } else { cart.push({ id: id, qty: 1 }); }
  saveCart(cart);
  const product = getProductById(id);
  showToast(product.name + " added to cart");
}
function updateQty(id, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter(function (item) { return item.id !== id; });
  } else {
    cart.forEach(function (item) { if (item.id === id) item.qty = qty; });
  }
  saveCart(cart);
}
function cartTotal(cart) {
  return cart.reduce(function (sum, item) {
    const p = getProductById(item.id);
    return p ? sum + p.price * item.qty : sum;
  }, 0);
}
function updateCartCount() {
  const count = getCart().reduce(function (sum, item) { return sum + item.qty; }, 0);
  document.querySelectorAll(".cart-count").forEach(function (el) { el.textContent = count; });
}

/* Short pop-up message at the bottom of the screen */
function showToast(text) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(function () { toast.classList.remove("show"); }, 2000);
}

/* ---------- Product cards ---------- */
function productCardHTML(p) {
  return (
    '<article class="product-card">' +
      '<div class="product-image" role="img" aria-label="Placeholder image of ' + escapeHTML(p.name) + '">' +
        '<span aria-hidden="true">' + p.icon + '</span>' +
        '<span class="product-tag">' + escapeHTML(p.category) + '</span>' +
      '</div>' +
      '<div class="product-body">' +
        '<h3>' + escapeHTML(p.name) + '</h3>' +
        '<p>' + escapeHTML(p.description) + '</p>' +
        '<div class="product-footer">' +
          '<span class="price">' + money(p.price) + '</span>' +
          '<button class="btn btn-primary add-btn" data-id="' + p.id + '">Add to Cart</button>' +
        '</div>' +
      '</div>' +
    '</article>'
  );
}
/* One click listener handles every "Add to Cart" button (event delegation) */
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".add-btn");
  if (btn) addToCart(btn.dataset.id);
});

/* ---------- Homepage: featured products ---------- */
function renderFeatured() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  grid.innerHTML = ["p1", "p2", "p4", "p8"].map(function (id) {
    return productCardHTML(getProductById(id));
  }).join("");
}

/* Header search box: sends the user to the catalog with ?q=... */
function setupHeaderSearch() {
  const form = document.getElementById("header-search");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const q = form.querySelector("input").value.trim();
    window.location.href = "products.html?q=" + encodeURIComponent(q);
  });
}

/* ---------- Catalog: search + category filter ---------- */
function renderCatalog() {
  const container = document.getElementById("catalog");
  if (!container) return;
  const searchInput = document.getElementById("search-input");
  const categorySelect = document.getElementById("category-select");

  // Fill category dropdown from the product data
  const categories = [...new Set(PRODUCTS.map(function (p) { return p.category; }))];
  categories.forEach(function (c) {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    categorySelect.appendChild(opt);
  });

  // Read ?q= and ?cat= from the URL (used by header search and homepage categories)
  const params = new URLSearchParams(window.location.search);
  searchInput.value = params.get("q") || "";
  if (params.get("cat")) categorySelect.value = params.get("cat");

  function draw() {
    const q = searchInput.value.trim().toLowerCase();
    const cat = categorySelect.value;
    const matches = PRODUCTS.filter(function (p) {
      const textMatch = (p.name + " " + p.description).toLowerCase().includes(q);
      const catMatch = cat === "all" || p.category === cat;
      return textMatch && catMatch;
    });

    document.getElementById("result-count").textContent =
      matches.length + (matches.length === 1 ? " product found" : " products found");

    if (matches.length === 0) {
      container.innerHTML = '<p class="empty-state">No products match your search. Try another word or category.</p>';
      return;
    }
    // Group the matching products by category
    const shownCats = categories.filter(function (c) {
      return matches.some(function (p) { return p.category === c; });
    });
    container.innerHTML = shownCats.map(function (c) {
      const cards = matches.filter(function (p) { return p.category === c; }).map(productCardHTML).join("");
      return '<section class="category-group"><h2>' + escapeHTML(c) + '</h2><div class="product-grid">' + cards + '</div></section>';
    }).join("");
  }

  searchInput.addEventListener("input", draw);
  categorySelect.addEventListener("change", draw);
  draw();
}

/* ---------- Cart page ---------- */
function renderCart() {
  const wrap = document.getElementById("cart-items");
  if (!wrap) return;
  const cart = getCart();
  const summary = document.getElementById("cart-summary");

  if (cart.length === 0) {
    wrap.innerHTML = '<div class="empty-state"><p>Your cart is empty.</p><a class="btn btn-primary" href="products.html">Browse products</a></div>';
    summary.hidden = true;
    return;
  }
  summary.hidden = false;
  wrap.innerHTML = cart.map(function (item) {
    const p = getProductById(item.id);
    if (!p) return "";
    return (
      '<div class="cart-row">' +
        '<div class="cart-thumb" aria-hidden="true">' + p.icon + '</div>' +
        '<div class="cart-info"><h3>' + escapeHTML(p.name) + '</h3><p>' + money(p.price) + ' each</p></div>' +
        '<label class="qty-label">Qty <input type="number" min="1" max="99" value="' + item.qty + '" data-id="' + p.id + '" class="qty-input" aria-label="Quantity for ' + escapeHTML(p.name) + '"></label>' +
        '<span class="line-total">' + money(p.price * item.qty) + '</span>' +
        '<button class="btn btn-ghost remove-btn" data-id="' + p.id + '" aria-label="Remove ' + escapeHTML(p.name) + '">Remove</button>' +
      '</div>'
    );
  }).join("");
  document.getElementById("cart-total").textContent = money(cartTotal(cart));
}
function setupCartEvents() {
  const wrap = document.getElementById("cart-items");
  if (!wrap) return;
  wrap.addEventListener("change", function (e) {
    if (e.target.classList.contains("qty-input")) {
      const qty = parseInt(e.target.value, 10);
      updateQty(e.target.dataset.id, isNaN(qty) ? 1 : Math.min(qty, 99));
      renderCart();
    }
  });
  wrap.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-btn")) {
      updateQty(e.target.dataset.id, 0);
      renderCart();
    }
  });
}

/* ---------- Checkout page ---------- */
function setupCheckout() {
  const form = document.getElementById("checkout-form");
  if (!form) return;
  const cart = getCart();
  const summary = document.getElementById("order-summary");

  if (cart.length === 0) {
    document.getElementById("checkout-area").innerHTML =
      '<div class="empty-state"><p>Your cart is empty, so there is nothing to check out.</p><a class="btn btn-primary" href="products.html">Browse products</a></div>';
    return;
  }

  summary.innerHTML = cart.map(function (item) {
    const p = getProductById(item.id);
    return '<li><span>' + escapeHTML(p.name) + ' × ' + item.qty + '</span><span>' + money(p.price * item.qty) + '</span></li>';
  }).join("") + '<li class="summary-total"><span>Total</span><span>' + money(cartTotal(cart)) + '</span></li>';

  // Pre-fill email if a demo user is logged in
  const session = load(SESSION_KEY, null);
  if (session) form.email.value = session;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const msg = document.getElementById("checkout-message");
    const data = {
      name: form.fullname.value.trim(),
      email: form.email.value.trim(),
      address: form.address.value.trim(),
      city: form.city.value.trim(),
      postcode: form.postcode.value.trim()
    };
    // Basic validation
    if (!data.name || !data.address || !data.city || !data.postcode) {
      return showMessage(msg, "Please fill in every field.", "error");
    }
    if (!isValidEmail(data.email)) {
      return showMessage(msg, "Please enter a valid email address.", "error");
    }
    if (!/^[A-Za-z0-9 \-]{3,10}$/.test(data.postcode)) {
      return showMessage(msg, "Postcode should be 3–10 letters or numbers.", "error");
    }

    // Save a demo order, then clear the cart
    const orders = load(ORDERS_KEY, []);
    const order = {
      id: "FF-" + Date.now().toString().slice(-6),
      email: data.email.toLowerCase(),
      date: new Date().toLocaleString(),
      items: getCart(),
      total: cartTotal(getCart()),
      shipping: data
    };
    orders.push(order);
    save(ORDERS_KEY, orders);
    saveCart([]);

    document.getElementById("checkout-area").innerHTML =
      '<div class="success-box"><h2>Thank you, ' + escapeHTML(data.name) + '!</h2>' +
      '<p>Demo order <strong>' + order.id + '</strong> was saved in this browser. No payment was taken and nothing will be shipped.</p>' +
      '<a class="btn btn-primary" href="account.html">View order history</a></div>';
  });
}

/* ---------- Demo accounts ---------- */
function setupAccount() {
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  if (!registerForm) return;

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const msg = document.getElementById("register-message");
    const name = registerForm.regname.value.trim();
    const email = registerForm.regemail.value.trim().toLowerCase();
    const password = registerForm.regpassword.value;
    const users = load(USERS_KEY, []);

    if (!name) return showMessage(msg, "Please enter your name.", "error");
    if (!isValidEmail(email)) return showMessage(msg, "Please enter a valid email address.", "error");
    if (password.length < MIN_PASSWORD) return showMessage(msg, "Password must be at least " + MIN_PASSWORD + " characters.", "error");
    if (users.some(function (u) { return u.email === email; })) return showMessage(msg, "An account with this email already exists.", "error");

    // DEMO ONLY: a real site would hash the password on a secure server.
    users.push({ name: name, email: email, password: password });
    save(USERS_KEY, users);
    save(SESSION_KEY, email);
    renderAccount();
  });

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const msg = document.getElementById("login-message");
    const email = loginForm.loginemail.value.trim().toLowerCase();
    const password = loginForm.loginpassword.value;
    if (!isValidEmail(email)) return showMessage(msg, "Please enter a valid email address.", "error");
    const user = load(USERS_KEY, []).find(function (u) { return u.email === email && u.password === password; });
    if (!user) return showMessage(msg, "Email or password is incorrect.", "error");
    save(SESSION_KEY, email);
    renderAccount();
  });

  document.getElementById("logout-btn").addEventListener("click", function () {
    localStorage.removeItem(SESSION_KEY);
    renderAccount();
  });

  renderAccount();
}
function renderAccount() {
  const authArea = document.getElementById("auth-area");
  const dashboard = document.getElementById("dashboard");
  if (!authArea) return;
  const email = load(SESSION_KEY, null);
  const user = load(USERS_KEY, []).find(function (u) { return u.email === email; });

  if (!user) {
    authArea.hidden = false;
    dashboard.hidden = true;
    return;
  }
  authArea.hidden = true;
  dashboard.hidden = false;
  document.getElementById("welcome-name").textContent = user.name;

  const orders = load(ORDERS_KEY, []).filter(function (o) { return o.email === user.email; });
  const list = document.getElementById("order-history");
  if (orders.length === 0) {
    list.innerHTML = '<p class="empty-state">No demo orders yet. Orders placed with your email address will appear here.</p>';
    return;
  }
  list.innerHTML = orders.slice().reverse().map(function (o) {
    const items = o.items.map(function (i) {
      const p = getProductById(i.id);
      return '<li>' + escapeHTML(p ? p.name : i.id) + ' × ' + i.qty + '</li>';
    }).join("");
    return '<article class="order-card"><header><strong>' + o.id + '</strong><span>' + escapeHTML(o.date) + '</span></header><ul>' + items + '</ul><p class="price">Total: ' + money(o.total) + '</p></article>';
  }).join("");
}

/* ---------- Contact form (demo, nothing is sent) ---------- */
function setupContact() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const msg = document.getElementById("contact-message");
    if (!form.cname.value.trim() || !form.cmessage.value.trim()) return showMessage(msg, "Please fill in your name and message.", "error");
    if (!isValidEmail(form.cemail.value.trim())) return showMessage(msg, "Please enter a valid email address.", "error");
    form.reset();
    showMessage(msg, "Thanks! This is a demo, so your message was not actually sent.", "success");
  });
}

/* ---------- Mobile menu ---------- */
function setupMenu() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle) return;
  toggle.addEventListener("click", function () {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
}

/* ---------- Start everything when the page loads ---------- */
document.addEventListener("DOMContentLoaded", function () {
  setupMenu();
  setupHeaderSearch();
  updateCartCount();
  renderFeatured();
  renderCatalog();
  renderCart();
  setupCartEvents();
  setupCheckout();
  setupAccount();
  setupContact();
});