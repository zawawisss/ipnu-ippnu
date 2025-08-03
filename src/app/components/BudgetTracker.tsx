"use client";

import React, { useState, useMemo } from 'react';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface BudgetItem {
  id: string;
  item: string;
  kategori: string;
  anggaranRencana: number;
  realisasi: number;
}

interface BudgetTrackerProps {
  eventId: string;
  initialBudgetItems: BudgetItem[];
  onSaveChanges: (updatedItems: BudgetItem[]) => Promise<void>;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ eventId, initialBudgetItems, onSaveChanges }) => {
  const [items, setItems] = useState<BudgetItem[]>(initialBudgetItems);
  const [newItem, setNewItem] = useState({ item: '', kategori: 'Lainnya', anggaranRencana: 0, realisasi: 0 });
  const [isAdding, setIsAdding] = useState(false);
  
  // Quick templates untuk budget items
  const budgetTemplates = {
    'Seminar/Workshop': [
      { item: 'Sewa Ruangan', kategori: 'Venue', anggaranRencana: 500000, realisasi: 0 },
      { item: 'Snack & Makan Siang', kategori: 'Konsumsi', anggaranRencana: 750000, realisasi: 0 },
      { item: 'Sound System', kategori: 'Peralatan', anggaranRencana: 300000, realisasi: 0 },
      { item: 'Spanduk & Sertifikat', kategori: 'Publikasi', anggaranRencana: 200000, realisasi: 0 },
      { item: 'Honor Narasumber', kategori: 'Honor', anggaranRencana: 1000000, realisasi: 0 }
    ],
    'Event Sosial': [
      { item: 'Perlengkapan Kegiatan', kategori: 'Logistik', anggaranRencana: 400000, realisasi: 0 },
      { item: 'Konsumsi Relawan', kategori: 'Konsumsi', anggaranRencana: 300000, realisasi: 0 },
      { item: 'Transport Tim', kategori: 'Transport', anggaranRencana: 200000, realisasi: 0 },
      { item: 'Foto & Video', kategori: 'Dokumentasi', anggaranRencana: 150000, realisasi: 0 }
    ]
  };

  const totals = useMemo(() => {
    return items.reduce((acc, item) => {
      acc.totalRencana += item.anggaranRencana;
      acc.totalRealisasi += item.realisasi;
      return acc;
    }, { totalRencana: 0, totalRealisasi: 0 });
  }, [items]);

  const handleAddItem = async () => {
    if (newItem.item.trim() === '') return;
    const newItemsList = [...items, { ...newItem, id: Date.now().toString() }];
    setItems(newItemsList);
    await onSaveChanges(newItemsList);
    setNewItem({ item: '', kategori: 'Lainnya', anggaranRencana: 0, realisasi: 0 });
    setIsAdding(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    const newItemsList = items.filter(item => item.id !== itemId);
    setItems(newItemsList);
    await onSaveChanges(newItemsList);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Anggaran</h2>
      
      {/* Totals Display */}
      <div className="grid grid-cols-2 gap-4 text-center mb-6">
        <div>
          <p className="text-sm text-gray-500">Rencana</p>
          <p className="text-2xl font-bold text-gray-800">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totals.totalRencana)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Realisasi</p>
          <p className="text-2xl font-bold text-green-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totals.totalRealisasi)}</p>
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-2 mb-4">
        {items.map(item => (
          <div key={item.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50">
            <div>
              <p className="font-semibold text-gray-800">{item.item}</p>
              <p className="text-xs text-gray-500">{item.kategori}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.realisasi)}</p>
              <p className="text-xs text-gray-400 line-through">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.anggaranRencana)}</p>
            </div>
             <button onClick={() => handleDeleteItem(item.id)} className="text-gray-400 hover:text-red-500 ml-4">
                <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Item Form */}
      {isAdding ? (
        <div className="space-y-3 pt-4 border-t">
          <input type="text" placeholder="Nama item" value={newItem.item} onChange={e => setNewItem(p => ({ ...p, item: e.target.value }))} className="w-full border p-2 rounded-lg"/>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Anggaran" value={newItem.anggaranRencana} onChange={e => setNewItem(p => ({ ...p, anggaranRencana: Number(e.target.value) }))} className="w-full border p-2 rounded-lg"/>
            <input type="number" placeholder="Realisasi" value={newItem.realisasi} onChange={e => setNewItem(p => ({ ...p, realisasi: Number(e.target.value) }))} className="w-full border p-2 rounded-lg"/>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsAdding(false)} className="bg-gray-200 py-2 px-4 rounded-lg">Batal</button>
            <button onClick={handleAddItem} className="bg-blue-600 text-white py-2 px-4 rounded-lg">Simpan</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsAdding(true)} className="w-full mt-4 bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Tambah Item Anggaran
        </button>
      )}
    </div>
  );
}

export default BudgetTracker;

