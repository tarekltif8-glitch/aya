// products.js
export const PRODUCTS = [
  {
    id: "p1",
    name: "عباية سوداء كلاسيكية",
    price: 2500,
    category: "عبايات",
    look: 1, // الشخصية رقم 1
    imageUrl: "https://images.unsplash.com/photo-1583391733958-6111720861ce?q=80&w=600", 
    desc: "عباية سوداء أنيقة بقصّة كلاسيكية تناسب كل المناسبات.",
    stock: { XS: 5, S: 10, M: 8, L: 6, XL: 4 }
  },
  {
    id: "p2",
    name: "عباية مطرزة ذهبية",
    price: 3800,
    category: "عبايات",
    look: 2, // الشخصية رقم 2
    imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=600", 
    desc: "عباية مطرزة بخيوط ذهبية، لمسة فخامة لإطلالتك.",
    stock: { XS: 2, S: 4, M: 6, L: 3, XL: 1 }
  }
];
