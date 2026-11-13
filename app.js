// app.js
import { PRODUCTS as DEFAULT_PRODUCTS } from './products.js';

const TG_TOKEN = '8930560233:AAGLXXXkt8hIkmH1ylrMKCMa4C5LZPh0Lus';
const TG_CHAT_ID = '8562530371';
const SIZES = ['XS','S','M','L','XL'];
const $ = id => document.getElementById(id);

let PRODUCTS = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
let bag = [];
let saved = new Set();
let currentUser = null;
let pendingCheckout = false;
let generatedCode = null;
let pendingVerifyEmail = null;

const money = n => new Intl.NumberFormat('ar-LY',{style:'currency',currency:'LYD',maximumFractionDigits:0}).format(n) + ' د.ل';

// --- بناء المتجر ---
function buildStore() {
  // عرض الشخصيات في المنصة
  const line = $('line');
  line.innerHTML = '';
  line.style.display = 'flex';
  line.style.alignItems = 'center';
  line.style.justifyContent = 'center';
  line.style.gap = '20px';
  line.style.padding = '20px';
  
  if (PRODUCTS.length === 0) {
    line.innerHTML = '<p style="color:#737b86;">لا توجد أصناف حالياً.</p>';
  } else {
    PRODUCTS.forEach(p => {
      const div = document.createElement('div');
      div.style.cssText = `
        width: 220px; height: 400px; 
        background: url('${p.imageUrl}') center/cover;
        border-radius: 10px; position: relative;
        border: 2px solid #e6ebf0;
      `;
      div.innerHTML = `<div style="position:absolute; bottom:0; right:0; left:0; background:rgba(0,0,0,0.6); color:#fff; padding:10px; text-align:center; font-weight:bold;">${p.name}</div>`;
      line.appendChild(div);
    });
  }

  // عرض بطاقات الأصناف في القائمة الجانبية
  const rail = $('rail');
  rail.innerHTML = '';
  if (PRODUCTS.length === 0) {
    rail.innerHTML = '<p style="text-align:center; padding:20px; color:#737b86;">لا توجد أصناف حالياً.</p>';
    return;
  }

  PRODUCTS.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div style="position:relative">
        <button class="fav" data-id="${p.id}"><svg viewBox="0 0 24 24"><path d="M12 20S3.5 15 3.5 9A4.6 4.6 0 0 1 12 6.6 4.6 4.6 0 0 1 20.5 9C20.5 15 12 20 12 20Z"/></svg></button>
        <div class="shot" data-id="${p.id}"><img src="${p.imageUrl}" alt="${p.name}"></div>
      </div>
      <div class="meta">
        <h3>${p.name}</h3>
        <span>${money(p.price)}</span>
        <button class="add" data-id="${p.id}">+</button>
      </div>
    `;
    rail.appendChild(card);
  });

  attachStoreEvents();
  persistCart();
}

// --- ربط أحداث المتجر ---
function attachStoreEvents() {
  const rail = $('rail');
  
  rail.addEventListener('click', e => {
    const fav = e.target.closest('.fav');
    if (fav) { toggleSave(fav.dataset.id); return; }
    
    const add = e.target.closest('.add');
    if (add) {
      const p = PRODUCTS.find(x => x.id === add.dataset.id);
      if (!p) return;
      const firstSize = SIZES.find(s => (p.stock?.[s] || 0) > 0);
      if (!firstSize) { showToast('نفد المخزون'); return; }
      addToBag(p.id, firstSize);
      return;
    }
    
    const shot = e.target.closest('.shot');
    if (shot) { openProduct(shot.dataset.id); return; }
  });

  $('nav-cart').onclick = e => { e.preventDefault(); openCart(); };
  $('nav-shop').onclick = e => { e.preventDefault(); openShop(); };
  $('panel-close').onclick = () => $('commerce').close();
}

// --- حالة السلة والحفظ ---
function loadLocal() {
  try {
    bag = JSON.parse(localStorage.getItem('alyasimin-bag') || '[]');
    saved = new Set(JSON.parse(localStorage.getItem('alyasimin-saved') || '[]'));
  } catch (_) {}
}
function saveLocal() {
  try {
    localStorage.setItem('alyasimin-bag', JSON.stringify(bag));
    localStorage.setItem('alyasimin-saved', JSON.stringify([...saved]));
  } catch (_) {}
}
function persistCart() {
  $('cart').textContent = bag.reduce((s, r) => s + r.qty, 0);
  document.querySelectorAll('.fav').forEach(btn => {
    const id = btn.dataset.id;
    btn.setAttribute('aria-pressed', String(saved.has(id)));
  });
}

// --- عرض المنتج والسلة والدفع ---
const dialog = $('commerce'), panelBody = $('panel-body');
function panel(title) {
  $('panel-title').textContent = title;
  if (!dialog.open) dialog.showModal();
  panelBody.scrollTop = 0;
}

function openProduct(id) {
  const p = PRODUCTS.find(x => x.id === id); if (!p) return;
  panel('اكتشفي القطعة');
  panelBody.innerHTML = `
    <div class="panel-kicker">${p.category}</div>
    <div class="panel-image"><img src="${p.imageUrl}" alt="${p.name}"></div>
    <h3 class="panel-title">${p.name}</h3>
    <div class="product-price">${money(p.price)}</div>
    <p class="panel-copy">${p.desc || ''}</p>
    <div class="field-label">اختاري المقاس</div>
    <div class="sizes" id="size-options">
      ${SIZES.map(s => {
        const st = p.stock?.[s] || 0;
        return `<button class="size-option" data-size="${s}" ${st < 1 ? 'disabled' : ''} aria-pressed="false">${s}${st < 1 ? ' —' : ` (${st})`}</button>`;
      }).join('')}
    </div>
    <p class="size-note">${Object.values(p.stock || {}).reduce((a,b) => a + (+b || 0), 0) > 0 ? 'المخزون محدود.' : 'نفد المخزون حالياً.'}</p>
    <button class="primary wide" data-action="product-add" ${Object.values(p.stock || {}).every(v => v < 1) ? 'disabled' : ''}>أضيفي إلى السلة</button>
    <button class="secondary wide" data-action="product-save">${saved.has(p.id) ? 'إزالة من المحفوظات' : 'احفظي هذه القطعة'}</button>
  `;
  panelBody.querySelectorAll('.size-option').forEach(btn => {
    btn.onclick = () => {
      panelBody.querySelectorAll('.size-option').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      panelBody._selectedSize = btn.dataset.size;
    };
  });
  panelBody.querySelector('[data-action="product-add"]').onclick = () => {
    const size = panelBody._selectedSize || SIZES.find(s => (p.stock?.[s] || 0) > 0);
    if (size) addToBag(p.id, size);
  };
  panelBody.querySelector('[data-action="product-save"]').onclick = () => toggleSave(p.id);
}

function openCart() {
  panel('سلة التسوق');
  if (!bag.length) {
    panelBody.innerHTML = `<div class="empty"><h3>سلتك فارغة</h3><p>ابحثي عن قطعة تقع في حبها.</p><button class="primary wide" data-action="all">استعراض المجموعة</button></div>`;
    panelBody.querySelector('[data-action="all"]').onclick = openShop;
    return;
  }
  const subtotal = bag.reduce((s, r) => s + (+r.price) * r.qty, 0);
  panelBody.innerHTML = `
    <div class="panel-kicker">${bag.reduce((s, r) => s + r.qty, 0)} قطعة</div>
    ${bag.map((row, i) => {
      const p = PRODUCTS.find(x => x.id === row.id); if (!p) return '';
      return `<article class="cart-row">
        <div class="cart-shot"><img src="${p.imageUrl}" alt="${p.name}"></div>
        <div>
          <h3>${p.name}</h3>
          <p class="row-price">${money(p.price * row.qty)}</p>
          <label class="size-note">المقاس
            <select data-row-size="${i}">
              ${SIZES.map(s => `<option ${s === row.size ? 'selected' : ''} ${(p.stock?.[s] || 0) < 1 ? 'disabled' : ''}>${s}</option>`).join('')}
            </select>
          </label>
          <div class="row-controls">
            <div class="quantity">
              <button data-qty="${i}" data-delta="-1">−</button>
              <span>${row.qty}</span>
              <button data-qty="${i}" data-delta="1">+</button>
            </div>
            <button class="remove" data-remove="${i}">إزالة</button>
          </div>
        </div>
      </article>`;
    }).join('')}
    <div class="total-line"><span>المجموع الفرعي</span><span>${money(subtotal)}</span></div>
    <div class="total-line grand"><span>الإجمالي</span><span>${money(subtotal)}</span></div>
    <button class="primary wide" data-action="checkout">متابعة الدفع</button>
    <button class="secondary wide" data-action="all">متابعة التسوق</button>
  `;
  panelBody.querySelector('[data-action="all"]').onclick = openShop;
  panelBody.querySelector('[data-action="checkout"]').onclick = openCheckout;
  panelBody.querySelectorAll('[data-qty]').forEach(btn => {
    btn.onclick = () => {
      const i = Number(btn.dataset.qty);
      const row = bag[i]; if (!row) return;
      const p = PRODUCTS.find(x => x.id === row.id);
      const newQty = row.qty + Number(btn.dataset.delta);
      if (newQty < 1) { bag.splice(i, 1); }
      else {
        if ((p.stock?.[row.size] || 0) < newQty) { showToast('الكمية المتوفرة غير كافية'); return; }
        row.qty = newQty;
      }
      saveLocal(); openCart();
    };
  });
  panelBody.querySelectorAll('[data-remove]').forEach(btn => {
    btn.onclick = () => { bag.splice(Number(btn.dataset.remove), 1); saveLocal(); openCart(); };
  });
  panelBody.querySelectorAll('[data-row-size]').forEach(sel => {
    sel.onchange = () => {
      const i = Number(sel.dataset.rowSize);
      if (bag[i]) { bag[i].size = sel.value; saveLocal(); openCart(); }
    };
  });
}

function openCheckout() {
  if (!bag.length) { openCart(); return; }
  if (!currentUser) {
    showToast('يرجى تسجيل الدخول لإتمام الطلب');
    pendingCheckout = true;
    openAuth('login');
    return;
  }
  panel('إتمام الطلب');
  panelBody.innerHTML = `
    <h3 class="panel-title">التفاصيل الأخيرة</h3>
    <form class="checkout-form" id="checkout-form">
      <label>الاسم الكامل<input name="name" value="${escapeHtml(currentUser.name || '')}" required></label>
      <label>البريد الإلكتروني<input name="email" value="${escapeHtml(currentUser.email || '')}" required></label>
      <label>رقم الهاتف<input name="phone" value="${escapeHtml(currentUser.phone || '')}" required></label>
      <label>عنوان التوصيل<input name="address" required></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <label>المدينة<input name="city" required></label>
        <label>ملاحظات<input name="note"></label>
      </div>
      <hr class="panel-divider">
      <div class="total-line"><span>${bag.reduce((s, r) => s + r.qty, 0)} قطع</span><span>${money(bag.reduce((s, r) => s + r.price * r.qty, 0))}</span></div>
      <div class="total-line grand"><span>الإجمالي</span><span>${money(bag.reduce((s, r) => s + r.price * r.qty, 0))}</span></div>
      <button type="submit" class="primary wide" id="place-order-btn">إرسال الطلب</button>
      <button type="button" class="secondary wide" data-action="bag">العودة للسلة</button>
    </form>
  `;
  panelBody.querySelector('[data-action="bag"]').onclick = openCart;
  $('checkout-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = $('place-order-btn'); btn.disabled = true; btn.textContent = 'جارٍ التحقق...';
    try {
      const formData = new FormData(e.target);
      const orderItems = [];
      for (const row of bag) {
        const p = PRODUCTS.find(x => x.id === row.id);
        const stock = p?.stock?.[row.size] || 0;
        if (stock < row.qty) { showToast(`المخزون غير كافٍ: ${p.name} (${row.size})`); btn.disabled = false; btn.textContent = 'إرسال الطلب'; return; }
        orderItems.push({ id: row.id, name: p.name, size: row.size, qty: row.qty, price: p.price });
      }
      for (const it of orderItems) {
        const p = PRODUCTS.find(x => x.id === it.id);
        if (p) p.stock[it.size] = Math.max(0, (p.stock[it.size] || 0) - it.qty);
      }
      const total = orderItems.reduce((s, r) => s + r.price * r.qty, 0);
      const orderData = {
        uid: currentUser.uid,
        userEmail: currentUser.email,
        customer: {
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          address: formData.get('address'),
          city: formData.get('city'),
          note: formData.get('note') || ''
        },
        items: orderItems,
        total,
        createdAt: new Date().toISOString(),
        status: 'new'
      };
      
      const message = buildTelegramMessage(orderData);
      await sendTelegram(message);
      
      bag = []; saveLocal(); persistCart();
      btn.disabled = false;
      panel('تم استلام الطلب');
      panelBody.innerHTML = `
        <div class="success-mark">✓</div>
        <div class="panel-kicker">شكراً لثقتك</div>
        <h3 class="panel-title">تم استلام طلبك بنجاح</h3>
        <p class="panel-copy">سنتواصل معك قريباً لتأكيد التوصيل.</p>
        <button class="primary wide" data-action="close">العودة إلى المتجر</button>
      `;
      panelBody.querySelector('[data-action="close"]').onclick = () => dialog.close();
    } catch (err) {
      console.error(err);
      showToast('تعذّر إتمام الطلب: ' + (err.message || err));
      btn.disabled = false; btn.textContent = 'إرسال الطلب';
    }
  };
}

function addToBag(id, size) {
  const p = PRODUCTS.find(x => x.id === id); if (!p) return;
  const st = p.stock?.[size] || 0;
  const existing = bag.find(r => r.id === id && r.size === size);
  const currentQty = existing?.qty || 0;
  if (currentQty + 1 > st) { showToast('الكمية المتوفرة غير كافية'); return; }
  if (existing) existing.qty++;
  else bag.push({ id, size, qty: 1, price: p.price, name: p.name });
  saveLocal(); persistCart();
  showToast(`${p.name} أُضيف إلى سلتك`);
  dialog.close();
  setTimeout(openCart, 150);
}

function toggleSave(id) {
  if (saved.has(id)) saved.delete(id); else saved.add(id);
  saveLocal(); persistCart();
  showToast(saved.has(id) ? 'أُضيفت إلى المحفوظات' : 'أُزيلت من المحفوظات');
}

function openShop() {
  panel('المجموعة');
  panelBody.innerHTML = `
    <h3 class="panel-title">نعومة. قوة. أنتِ.</h3>
    <div class="catalog-grid" id="catalog-grid"></div>
  `;
  const grid = $('catalog-grid');
  if (!PRODUCTS.length) {
    grid.innerHTML = '<p style="text-align:center;padding:30px;color:#737b86;">لا توجد أصناف حالياً.</p>';
    return;
  }
  PRODUCTS.forEach(p => {
    grid.innerHTML += `
      <div class="catalog-piece">
        <button class="catalog-photo" data-id="${p.id}"><img src="${p.imageUrl}" alt="${p.name}"></button>
        <h3>${p.name}</h3>
        <p>${money(p.price)}</p>
      </div>
    `;
  });
  grid.querySelectorAll('.catalog-photo').forEach(btn => {
    btn.onclick = () => openProduct(btn.dataset.id);
  });
}

// --- تسجيل الدخول والتأكيد ---
const authModal = $('auth-modal');

function openAuth(tab = 'login') {
  authModal.classList.add('open');
  switchAuthTab(tab);
}
function closeAuth() { authModal.classList.remove('open'); }
function switchAuthTab(tab) {
  document.querySelectorAll('[data-auth-tab]').forEach(b => b.classList.toggle('active', b.dataset.authTab === tab));
  $('auth-login-view').classList.toggle('hidden', tab !== 'login');
  $('auth-signup-view').classList.toggle('hidden', tab !== 'signup');
  $('auth-verify-view').classList.add('hidden');
}
document.querySelectorAll('[data-auth-tab]').forEach(b => b.addEventListener('click', () => switchAuthTab(b.dataset.authTab)));
$('to-signup').onclick = () => switchAuthTab('signup');
$('to-login').onclick = () => switchAuthTab('login');
$('auth-close-btn').onclick = closeAuth;
authModal.addEventListener('click', e => { if (e.target === authModal) closeAuth(); });

// --- إنشاء حساب وإرسال الكود ---
$('signup-btn').onclick = async () => {
  const name = $('signup-name').value.trim();
  const email = $('signup-email').value.trim();
  const phone = $('signup-phone').value.trim();
  const pass = $('signup-pass').value;
  $('signup-err').textContent = '';
  
  if (!name || !email || !phone || pass.length < 6) {
    $('signup-err').textContent = 'أكملي كل الحقول، كلمة المرور 6 أحرف على الأقل';
    return;
  }
  
  // توليد كود تحقق
  generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // إرسال بيانات الحساب والكود إلى تيليجرام
  await sendTelegram(`📧 طلب تأكيد حساب جديد:\nالاسم: ${name}\nالإيميل: ${email}\nالهاتف: ${phone}\nكود التحقق: ${generatedCode}`);
  
  // حفظ المستخدم مؤقتاً
  const user = { name, email, phone, pass };
  localStorage.setItem('alyasimin-pending-user', JSON.stringify(user));
  pendingVerifyEmail = email;
  
  $('auth-login-view').classList.add('hidden');
  $('auth-signup-view').classList.add('hidden');
  $('auth-verify-view').classList.remove('hidden');
  $('verify-err').textContent = '';
};

// --- التحقق من الكود ---
$('verify-btn').onclick = () => {
  const code = $('verify-code').value.trim();
  if (!generatedCode) { $('verify-err').textContent = 'يرجى إنشاء حساب أولاً'; return; }
  if (code === generatedCode) {
    const pendingUser = JSON.parse(localStorage.getItem('alyasimin-pending-user') || '{}');
    const users = JSON.parse(localStorage.getItem('alyasimin-users') || '{}');
    users[pendingUser.email] = { ...pendingUser, verified: true };
    localStorage.setItem('alyasimin-users', JSON.stringify(users));
    localStorage.removeItem('alyasimin-pending-user');
    
    currentUser = { uid: pendingUser.email, email: pendingUser.email, name: pendingUser.name, phone: pendingUser.phone };
    closeAuth();
    showToast('تم تأكيد حسابك بنجاح!');
    if (pendingCheckout) { pendingCheckout = false; setTimeout(openCheckout, 300); }
  } else {
    $('verify-err').textContent = 'كود غير صحيح، حاولي مرة أخرى.';
  }
};

// --- إعادة إرسال الكود ---
$('resend-btn').onclick = async () => {
  if (!generatedCode || !pendingVerifyEmail) return;
  await sendTelegram(`🔄 إعادة إرسال كود التحقق:\nالإيميل: ${pendingVerifyEmail}\nالكود: ${generatedCode}`);
  showToast('أُعيد إرسال الكود إلى الإدارة');
};

// --- تسجيل الدخول ---
$('login-btn').onclick = () => {
  const userInput = $('login-email').value.trim();
  const pass = $('login-pass').value;
  $('login-err').textContent = '';
  
  if (!userInput || !pass) { $('login-err').textContent = 'أدخلي البريد وكلمة المرور'; return; }
  
  const users = JSON.parse(localStorage.getItem('alyasimin-users') || '{}');
  let foundUser = null;
  for (const key in users) {
    if (users[key].email === userInput && users[key].pass === pass) {
      foundUser = users[key];
      break;
    }
  }
  
  if (foundUser) {
    currentUser = { uid: foundUser.email, email: foundUser.email, name: foundUser.name, phone: foundUser.phone };
    closeAuth();
    showToast('مرحباً ' + foundUser.name);
    if (pendingCheckout) { pendingCheckout = false; setTimeout(openCheckout, 300); }
  } else {
    $('login-err').textContent = 'بيانات الدخول غير صحيحة';
  }
};

// --- دوال مساعدة ---
function showToast(msg) {
  $('toast-message').textContent = msg;
  $('toast').classList.add('visible');
  setTimeout(() => $('toast').classList.remove('visible'), 3200);
}
function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

async function sendTelegram(text) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text })
    });
    return res.ok;
  } catch (err) {
    console.warn('Telegram failed:', err);
    return false;
  }
}

function buildTelegramMessage(o) {
  const L = [];
  L.push('🛍️ طلب جديد من ALYASIMIN ABAYA');
  L.push('━━━━━━━━━━━━━━');
  L.push('👤 بيانات العميل:');
  L.push(`الاسم: ${o.customer.name}`);
  L.push(`📞 الهاتف: ${o.customer.phone}`);
  L.push(`📧 الإيميل: ${o.customer.email}`);
  L.push(`📍 العنوان: ${o.customer.address}`);
  L.push(`🏙️ المدينة: ${o.customer.city}`);
  if (o.customer.note) L.push(`📝 ملاحظات: ${o.customer.note}`);
  L.push('━━━━━━━━━━━━━━');
  L.push('🧾 القطع:');
  o.items.forEach((it, i) => L.push(`${i + 1}. ${it.name} — المقاس ${it.size} — الكمية ${it.qty} — ${money(it.price * it.qty)}`));
  L.push('━━━━━━━━━━━━━━');
  L.push(`💰 الإجمالي: ${money(o.total)}`);
  L.push(`🕐 ${new Date().toLocaleString('ar-LY')}`);
  return L.join('\n');
}

// --- بدء التشغيل ---
loadLocal();
buildStore();
