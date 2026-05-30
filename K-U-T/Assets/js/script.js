// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  cursorFollower.style.left = followerX + 'px';
  cursorFollower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

document.querySelectorAll('a, button, .product-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '14px'; cursor.style.height = '14px';
    cursorFollower.style.width = '50px'; cursorFollower.style.height = '50px';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '8px'; cursor.style.height = '8px';
    cursorFollower.style.width = '32px'; cursorFollower.style.height = '32px';
  });
});

// ===== NAV SCROLL =====
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== MOBILE NAV =====
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
hamburger.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
});
function closeMobileNav() {
  mobileNav.classList.remove('open');
}

// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem('kut_cart') || '[]');

function saveCart() { localStorage.setItem('kut_cart', JSON.stringify(cart)); }
function updateCartCount() {
  document.getElementById('cartCount').textContent = cart.reduce((a, b) => a + b.qty, 0);
}
function updateCartTotal() {
  const total = cart.reduce((a, b) => a + b.price * b.qty, 0);
  document.getElementById('cartTotal').textContent = '₦' + total.toLocaleString();
}

function renderCart() {
  const container = document.getElementById('cartItems');
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <p>YOUR CART IS EMPTY</p>
      </div>`;
    return;
  }
  container.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div style="flex:1">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₦${item.price.toLocaleString()} × ${item.qty}</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${i})">✕</button>
    </div>
  `).join('');
  updateCartTotal();
}

function addToCart(btn) {
  const card = btn.closest('.product-card');
  const name = card.dataset.name;
  const price = parseInt(card.dataset.price);
  const existing = cart.find(i => i.name === name);
  if (existing) { existing.qty++; }
  else { cart.push({ name, price, qty: 1 }); }
  saveCart();
  updateCartCount();
  renderCart();
  showToast('Added to cart — ' + name.split('—')[0].trim());
  openCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartCount();
  renderCart();
}

// ===== CART DRAWER =====
const cartBtn = document.getElementById('cartBtn');
const cartClose = document.getElementById('cartClose');
const cartOverlay = document.getElementById('cartOverlay');
const cartDrawer = document.getElementById('cartDrawer');

function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
cartBtn.addEventListener('click', () => { renderCart(); openCart(); });
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// Checkout via WhatsApp
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (cart.length === 0) { showToast('Your cart is empty!'); return; }
  const items = cart.map(i => `• ${i.name} (x${i.qty}) — ₦${(i.price * i.qty).toLocaleString()}`).join('%0A');
  const total = cart.reduce((a, b) => a + b.price * b.qty, 0);
  const msg = `Hello KUT! 🔥 I'd like to order:%0A${items}%0A%0ATotal: ₦${total.toLocaleString()}`;
  window.open(`https://wa.me/2348116869081?text=${msg}`, '_blank');
});

// ===== ACCOUNT MODAL =====
const accountBtn = document.getElementById('accountBtn');
const accountClose = document.getElementById('accountClose');
const accountOverlay = document.getElementById('accountOverlay');

accountBtn.addEventListener('click', () => {
  accountOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
});
accountClose.addEventListener('click', () => {
  accountOverlay.classList.remove('open');
  document.body.style.overflow = '';
});
accountOverlay.addEventListener('click', (e) => {
  if (e.target === accountOverlay) {
    accountOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
});

function showTab(tab) {
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('signupForm').classList.toggle('hidden', tab !== 'signup');
  document.getElementById('loginTabBtn').classList.toggle('active', tab === 'login');
  document.getElementById('signupTabBtn').classList.toggle('active', tab === 'signup');
  document.getElementById('authMessage').textContent = '';
}

function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  const msg = document.getElementById('authMessage');
  if (!email || !pass) { msg.className = 'auth-message error'; msg.textContent = 'Please fill in all fields.'; return; }
  const users = JSON.parse(localStorage.getItem('kut_users') || '[]');
  const user = users.find(u => u.email === email && u.password === pass);
  if (user) {
    msg.className = 'auth-message success';
    msg.textContent = `Welcome back, ${user.name}! 🔥`;
    localStorage.setItem('kut_logged_in', JSON.stringify(user));
    document.getElementById('accountBtn').textContent = user.name.split(' ')[0].toUpperCase();
    setTimeout(() => { accountOverlay.classList.remove('open'); document.body.style.overflow = ''; }, 1500);
  } else {
    msg.className = 'auth-message error';
    msg.textContent = 'Invalid email or password.';
  }
}

function handleSignup() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const pass = document.getElementById('signupPassword').value;
  const msg = document.getElementById('authMessage');
  if (!name || !email || !pass) { msg.className = 'auth-message error'; msg.textContent = 'Please fill in all fields.'; return; }
  if (pass.length < 6) { msg.className = 'auth-message error'; msg.textContent = 'Password must be at least 6 characters.'; return; }
  const users = JSON.parse(localStorage.getItem('kut_users') || '[]');
  if (users.find(u => u.email === email)) { msg.className = 'auth-message error'; msg.textContent = 'Account already exists.'; return; }
  users.push({ name, email, password: pass });
  localStorage.setItem('kut_users', JSON.stringify(users));
  localStorage.setItem('kut_logged_in', JSON.stringify({ name, email }));
  msg.className = 'auth-message success';
  msg.textContent = `Account created! Welcome to KUT, ${name.split(' ')[0]}! 🔥`;
  document.getElementById('accountBtn').textContent = name.split(' ')[0].toUpperCase();
  setTimeout(() => { accountOverlay.classList.remove('open'); document.body.style.overflow = ''; }, 1800);
}

// ===== FILTER TABS =====
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.product-card').forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ===== TOAST =====
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== SCROLL REVEAL =====
const reveals = document.querySelectorAll('.product-card, .contact-card, .about-inner, .stat, .section-header');
reveals.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });

reveals.forEach(el => observer.observe(el));

// ===== INIT =====
updateCartCount();
updateCartTotal();

const loggedIn = JSON.parse(localStorage.getItem('kut_logged_in') || 'null');
if (loggedIn) {
  document.getElementById('accountBtn').textContent = loggedIn.name.split(' ')[0].toUpperCase();
}
