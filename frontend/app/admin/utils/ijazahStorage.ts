// Utility untuk mendapatkan data ijazah dari semua halaman
// Ini adalah SINGLE SOURCE OF TRUTH untuk data ijazah

import { IjazahData } from '../../types/ijazah'; // <-- IMPORT DARI TYPES

// HAPUS interface IjazahData di sini, gunakan dari types

// Simpan data di localStorage sebagai fallback
const STORAGE_KEY = 'ijazah_digital_data';

export const getIjazahData = (): IjazahData[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: IjazahData[] = JSON.parse(stored);
      // Pastikan setiap data memiliki properti selected
      return data.map(item => ({
        ...item,
        selected: item.selected !== undefined ? item.selected : false
      }));
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  
  return [];
};

export const saveIjazahData = (data: IjazahData[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Dispatch event untuk notifikasi komponen lain
    window.dispatchEvent(new Event('ijazahDataUpdated'));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const addIjazah = (newData: Omit<IjazahData, 'id' | 'status' | 'selected'>): IjazahData => {
  const currentData = getIjazahData();
  const newId = currentData.length > 0 
    ? Math.max(...currentData.map(d => d.id)) + 1 
    : 1;
  
  const completeData: IjazahData = {
    ...newData,
    id: newId,
    status: 'Pending', // Default status
    selected: false    // Default selected
  };
  
  const updatedData = [...currentData, completeData];
  saveIjazahData(updatedData);
  
  return completeData;
};

export const updateIjazahStatus = (id: number, status: 'Minted' | 'Pending'): void => {
  const currentData = getIjazahData();
  const updatedData = currentData.map(item =>
    item.id === id ? { ...item, status } : item
  );
  
  saveIjazahData(updatedData);
};

export const deleteIjazah = (id: number): void => {
  const currentData = getIjazahData();
  const updatedData = currentData.filter(item => item.id !== id);
  
  saveIjazahData(updatedData);
};

// Export IjazahData type untuk digunakan di komponen lain
export type { IjazahData };