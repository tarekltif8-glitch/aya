// products.js
// ⚠️ هنا تضيف الأصناف يدوياً. كل صنف له معرف (id) فريد.
// ⚠️ لا تنسخ الكود، بل عدل القيم هنا فقط.

export const PRODUCTS = [
  {
    id: "p1",
    name: "عباية سوداء كلاسيكية",
    price: 2500,
    category: "عبايات",
    imageUrl: "https://img.mstaml.com/i173039753962930061/%D8%B5%D9%88%D8%B1-%D9%85%D9%88%D8%AF%D9%8A%D9%84%D8%A7%D8%AA-%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B1%D8%B3%D9%85%D9%8A%D8%A9-%D9%84%D9%84%D8%AF%D9%88%D8%A7%D9%85-%D9%88%D8%A3%D8%AD%D8%AF%D8%AB-%D8%A7%D9%84%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D8%B9%D8%A8%D8%A7%D9%8A%D8%A9-%D9%85%D8%B1%D9%8A%D8%AD%D8%A9-%D9%84%D9%84%D8%B9%D9%85%D9%84.jpg", // ضع رابط صورتك هنا
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
