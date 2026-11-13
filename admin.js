import { PRODUCTS as DEFAULT_PRODUCTS } from './products.js';

const ADMIN_USER = 'tarek';
const ADMIN_PASS = '808909';
const SIZES = ['XS','S','M','L','XL'];
const $ = id => document.getElementById(id);

let PRODUCTS = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
let adminAuthed = false;

// إظهار زر الإدارة
$('admin-btn').style.display = 'block';

// فتح لوحة الإدارة
$('admin-btn').onclick = (e) => { e.preventDefault(); openAdmin(); };

function openAdmin() {
  $('admin-overlay').classList.add('open');
  if (adminAuthed) {
    renderAdminTable();
  } else {
    $('admin-body').innerHTML = `
      <div class="admin-login">
        <h3>دخول الإدارة</h3>
        <input id="admin-user" placeholder="اسم المستخدم">
        <input id="admin-pass" type="password" placeholder="كلمة المرور">
        <div id="admin-err" class="err" style="color:var(--err);font-size:12px;min-height:16px"></div>
        <button class="admin-btn primary" id="admin-login-btn" style="width:100%">دخول</button>
      </div>
    `;
    $('admin-login-btn').onclick = () => {
      const u = $('admin-user').value.trim();
      const p = $('admin-pass').value;
      if (u === ADMIN_USER && p === ADMIN_PASS) {
        adminAuthed = true;
        renderAdminTable();
      } else {
        $('admin-err').textContent = 'بيانات غير صحيحة';
      }
    };
  }
}

$('admin-close').onclick = () => $('admin-overlay').classList.remove('open');

function renderAdminTable() {
  $('admin-body').innerHTML = `
    <div class="admin-actions">
      <button class="admin-btn" id="admin-save">💾 حفظ الكميات</button>
      <button class="admin-btn danger" id="admin-logout">خروج</button>
    </div>
    <div style="overflow:auto">
      <table class="admin-table">
        <thead><tr>
          <th>#</th><th>الصورة</th><th>الاسم</th><th>الفئة</th>
          <th style="min-width:200px">المخزون لكل مقاس</th>
        </tr></thead>
        <tbody id="admin-tbody"></tbody>
      </table>
    </div>
  `;
  
  const tbody = $('admin-tbody');
  tbody.innerHTML = PRODUCTS.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><img src="${p.imageUrl}" style="width:50px;height:50px;object-fit:cover;border:1px solid var(--line)"></td>
      <td>${p.name}</td>
      <td>${p.category || ''}</td>
      <td>
        <div class="stock-cell">
          ${SIZES.map(s => `<div><input data-id="${p.id}" data-size="${s}" type="number" min="0" value="${p.stock?.[s] || 0}"><div class="stock-hint">${s}</div></div>`).join('')}
        </div>
      </td>
    </tr>
  `).join('');

  $('admin-save').onclick = () => {
    const inputs = tbody.querySelectorAll('input[data-id]');
    inputs.forEach(input => {
      const id = input.dataset.id;
      const size = input.dataset.size;
      const val = Math.max(0, Number(input.value) || 0);
      const p = PRODUCTS.find(x => x.id === id);
      if (p) { p.stock[size] = val; }
    });
    localStorage.setItem('alyasimin-stock', JSON.stringify(PRODUCTS));
    alert('تم حفظ الكميات');
  };

  $('admin-logout').onclick = () => {
    adminAuthed = false;
    openAdmin();
  };
}
