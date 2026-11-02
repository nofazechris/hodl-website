/** Products mirrored from the official HODLindustries Shopify store (snapshot 2026-10-31). */
export const STORE_URL = 'https://hodluntildeath.myshopify.com';

export interface Product {
  handle: string;
  title: string;
  tag: string;
  /** Display price in USD, as shown on the store. */
  price: string;
  image: string;
  alt: string;
}

export const productUrl = (p: Pick<Product, 'handle'>): string => `${STORE_URL}/products/${p.handle}`;

export const featured: Product & { blurb: string; label: string } = {
  handle: 'embroidered-beanie',
  title: 'Embroidered Beanie',
  tag: 'Featured · Headwear · Embroidered',
  price: '$17.24',
  image: '/img/embroidered-beanie.jpg',
  alt: 'HODL embroidered beanie, black',
  label: 'SECURED · DROP 01',
  blurb: 'Blackened knit, low-key embroidery. Conviction you pull over your head on a cold day.',
};

export const lookbook: Product[] = [
  { handle: 'unisex-hoodie', title: 'Unisex Hoodie', tag: 'Hoodie', price: '$43.37', image: '/img/unisex-hoodie.jpg', alt: 'HODL unisex hoodie' },
  { handle: 'structured-twill-cap', title: 'Structured Twill Cap', tag: 'Headwear', price: '$21.72', image: '/img/structured-twill-cap.jpg', alt: 'HODL structured twill cap' },
  { handle: 'utility-backpack-2', title: 'Utility backpack', tag: 'Gear', price: '$55.00', image: '/img/utility-backpack-2.jpg', alt: 'HODL utility backpack' },
  { handle: 'trucker-cap', title: 'Trucker Cap', tag: 'Headwear', price: '$16.03', image: '/img/trucker-cap.jpg', alt: 'HODL trucker cap' },
  { handle: 'unisex-windbreaker', title: 'Unisex windbreaker', tag: 'Outerwear', price: '$26.02', image: '/img/unisex-windbreaker.jpg', alt: 'HODL unisex windbreaker' },
  { handle: 'all-over-print-bandana', title: 'All-over print bandana', tag: 'Bandana', price: '$12.00', image: '/img/all-over-print-bandana.jpg', alt: 'HODL all-over print bandana' },
  { handle: 'can-cooler', title: 'Can cooler', tag: 'Drinkware', price: '$3.84', image: '/img/can-cooler.jpg', alt: 'HODL can cooler' },
  { handle: 'frame-cap', title: 'Frame Cap', tag: 'Headwear', price: '$25.31', image: '/img/frame-cap.jpg', alt: 'HODL frame cap' },
  { handle: 'embroidered-beanie-1', title: 'Embroidered Beanie', tag: 'Headwear', price: '$15.68', image: '/img/embroidered-beanie-1.jpg', alt: 'HODL embroidered beanie' },
];
