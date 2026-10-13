// images-catalog.js
// ═══════════════════════════════════════════════════════
// 📸 مكتبة صور الأصناف
// ═══════════════════════════════════════════════════════
//
// كيف تضيف صور صنف جديد؟
// ─────────────────────────────────────────────────────
// 1. اختر معرّف بسيط للصنف (بالإنجليزي بدون مسافات)
//    مثال: dress-royal, wedding-2025, evening-red
//
// 2. أضف مدخل جديد بالشكل:
//    "معرّف-الصنف": [
//      "رابط-الصورة-1",
//      "رابط-الصورة-2",
//      "رابط-الصورة-3"
//    ],
//
// 3. احفظ الملف — الصور تظهر فوراً
//
// ⚠️ ملاحظة: الروابط لازم تكون مباشرة (تنتهي بـ .jpg .png .webp)
//
// ═══════════════════════════════════════════════════════

export const IMAGES_CATALOG = {

  // ✅ مثال 1: فستان سواريه ملكي
  "dress-royal": [
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800",
    "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800",
    "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800"
  ],

  // ✅ مثال 2: فستان زفاف كلاسيكي
  "wedding-classic": [
    "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800",
    "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800"
  ],

  // ✅ مثال 3: فستان سهرة حريري
  "evening-silk": [
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800",
    "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800",
    "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=800"
  ],

  // ✅ مثال 4: فستان كوكتيل
  "cocktail-dress": [
    "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=800",
    "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800"
  ],

  // 👇 أضف أصنافك الجديدة هنا بنفس الطريقة 👇

  // "معرف-صنفي-الجديد": [
  //   "رابط-صورة-1",
  //   "رابط-صورة-2"
  // ],

};

// دالة جلب الصور (لا تلمس)
export function getImages(identifier, count){
  const all = IMAGES_CATALOG[identifier] || [];
  if(count && count > 0) return all.slice(0, count);
  return all;
}

// دالة جلب كل المعرفات المتاحة (لا تلمس)
export function getAllIdentifiers(){
  return Object.keys(IMAGES_CATALOG);
}
