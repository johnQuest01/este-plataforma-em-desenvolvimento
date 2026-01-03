// types/inventory.ts

export interface Variation {
  id: string;
  size: string;
  color: string;
  type: string; // ex: Regata, Manga Longa
  quantity: number;
  barcode?: string; // Para leitura futura
}

export interface Product {
  id: string;
  name: string;
  image: string;
  variations: Variation[];
}

export interface Seller {
  id: string;
  name: string;
}  