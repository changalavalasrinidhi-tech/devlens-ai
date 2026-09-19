/**
 * Sample Frontend Client for DevLens testing.
 */

import axios from "axios";

export interface Item {
  id: number;
  name: str;
  price: number;
  description?: string;
}

export class InventoryClient {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:8000") {
    this.baseUrl = baseUrl;
  }

  async fetchAllItems(): Promise<Item[]> {
    const response = await fetch(`${this.baseUrl}/api/items`);
    return response.json();
  }

  async saveNewItem(item: Item): Promise<Item> {
    const response = await fetch(`${this.baseUrl}/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    return response.json();
  }

  async getItemDetails(id: number): Promise<Item> {
    const res = await axios.get(`${this.baseUrl}/api/items/${id}`);
    return res.data;
  }

  async deleteItemById(id: number): Promise<void> {
    await axios.delete(`${this.baseUrl}/api/items/${id}`);
  }
}

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};
