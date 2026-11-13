// products.js
// ⚠️ هنا تضيف الأصناف يدوياً. كل صنف له معرف (id) فريد.
// ⚠️ لا تنسخ الكود، بل عدل القيم هنا فقط.

export const PRODUCTS = [
  {
    id: "p1",
    name: "عباية سوداء كلاسيكية",
    price: 2500,
    category: "عبايات",
    imageUrl: "https://i.ibb.co/w04Prt6/c1f64245afb2.gif", // ضع رابط صورتك هنا
    stock: { XS: 5, S: 10, M: 8, L: 6, XL: 4 }
  },
  {
    id: "p2",
    name: "عباية مطرزة ذهبية",
    price: 3800,
    category: "عبايات",
    imageUrl: "https://i.ibb.co/w04Prt6/c1f64245afb2.gif", // ضع رابط صورتك هنا
    stock: { XS: 2, S: 4, M: 6, L: 3, XL: 1 }
  }
];
