import { create } from 'zustand';
import { Cartridge } from '@prisma/client';

export interface CartridgeState {
  loading: boolean;
  error: boolean;
  items: Cartridge[];
  fetchCartriges: () => Promise<void>;
  addCartrige: (values: any) => Promise<void>;
}

export const useCartrigeStore = create<CartridgeState>((set, get) => ({
  loading: true,
  error: false,
  items: [],
  fetchCartriges: async () => {},

  addCartrige: async () => {},
}));
