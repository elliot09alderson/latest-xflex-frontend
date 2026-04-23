const IMG = {
  women: 'https://res.cloudinary.com/dbrpqazmg/image/upload/v1775708916/zxcom/products/women-tshirt-black.jpg',
  men: 'https://res.cloudinary.com/dbrpqazmg/image/upload/v1775708919/zxcom/products/men-tshirt-black.jpg',
  bag: 'https://res.cloudinary.com/dbrpqazmg/image/upload/v1775708921/zxcom/products/zxcom-shopping-bag.jpg',
  logo: 'https://res.cloudinary.com/dbrpqazmg/image/upload/v1775708923/zxcom/products/zxcom-logo-banner.jpg',
};

const allProducts = [
  { id: 1, name: 'ZXCOM Women Classic Black T-Shirt', image: IMG.women, price: 999, rating: 4.5, reviews: 3241, freeDelivery: true, tag: 'Bestseller', category: 'women' },
  { id: 2, name: 'ZXCOM Men Signature Black T-Shirt', image: IMG.men, price: 999, rating: 4.4, reviews: 2876, freeDelivery: true, tag: 'Trending', category: 'men' },
];

export const trendingProducts = [
  { id: 1, name: 'ZXCOM Women Classic Black T-Shirt', image: IMG.women, price: 999, rating: 4.5, orders: '12.5k', category: 'women' },
  { id: 2, name: 'ZXCOM Men Signature Black T-Shirt', image: IMG.men, price: 999, rating: 4.4, orders: '8.2k', category: 'men' },
];

export function getProductById(id) {
  return allProducts.find((p) => p.id === Number(id)) ||
    trendingProducts.find((p) => p.id === String(id));
}

export function getSimilarProducts(product, limit = 8) {
  return allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

export default allProducts;
