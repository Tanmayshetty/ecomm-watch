export interface FlipkartProductData {
  cardPrice: number;
  currentPrice: number;
  type: string;
  priceNotify: number;
  url: string;
  productId: number;
  history: ProductHistory[];
  isSoldOut: boolean;
  shouldNotify: boolean;
  lowestPrice: number;
  header: string;
  ecommName: string;
}

export interface FlipkartProcessed {
  [key: string]: FlipkartProductData[];
}

export interface FlipkartLinks {
  url: string;
  type: string;
  priceNotify: number;
  soldOut?: boolean;
  header: string;
}

export interface ProductHistory {
  price: number;
  cardPrice: number;
  date: string;
  shouldNotify: boolean;
}
