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

function buildStore() {
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
      return `<article class
