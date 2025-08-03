"use client";

import React, { useState } from 'react';
import { CheckCircleIcon, ChevronDownIcon, ChevronRightIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import EditableText from './EditableText';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  description?: string;
  expanded?: boolean;
  pic?: string; // Person in Charge
  deadline?: string;
  priority?: 'Tinggi' | 'Sedang' | 'Rendah';
}

interface CommitteeMember {
  id: string;
  namaAnggota: string;
  jabatan: string;
}

interface InteractiveChecklistProps {
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
  onItemsChange: (items: ChecklistItem[]) => void;
  eventId: string;
  committeeMembers?: CommitteeMember[];
}

const InteractiveChecklist: React.FC<InteractiveChecklistProps> = ({
  title,
  icon,
  items,
  onItemsChange,
  eventId,
  committeeMembers = []
}) => {
  const [newItemText, setNewItemText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  const saveToDatabase = async (updatedItems: ChecklistItem[]) => {
    try {
      await fetch(`/api/progres-laporan-acara/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tugasPanitia: [{
            nama: 'Default',
            jabatan: 'PIC',
            daftarTugas: updatedItems.map(item => ({
              tugas: item.text,
              status: item.completed ? 'Selesai' : 'Belum Mulai',
              catatan: item.description || '',
              deadline: item.deadline || new Date().toISOString(),
              prioritas: item.priority || 'Sedang',
              pic: item.pic || ''
            }))
          }]
        })
      });
    } catch (error) {
      console.error('Failed to save to database:', error);
      // Optionally, show an error message to the user
    }
  };

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      completed: false,
      description: '',
      expanded: false
    };

    const updatedItems = [...items, newItem];
    onItemsChange(updatedItems);
    setNewItemText('');
    setIsAddingItem(false);

    await saveToDatabase(updatedItems);
  };

  const handleToggleComplete = async (itemId: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onItemsChange(updatedItems);

    await saveToDatabase(updatedItems);
  };

  const handleToggleExpand = (itemId: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, expanded: !item.expanded } : item
    );
    onItemsChange(updatedItems);
  };

  const handleUpdateDescription = async (itemId: string, description: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, description } : item
    );
    onItemsChange(updatedItems);

    await saveToDatabase(updatedItems);
  };

  const handleDeleteItem = async (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    onItemsChange(updatedItems);

    await saveToDatabase(updatedItems);
  };

  const handleUpdateTaskText = async (itemId: string, newText: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, text: newText } : item
    );
    onItemsChange(updatedItems);

    await saveToDatabase(updatedItems);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        {icon} {title}
      </h2>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 p-3">
              {/* Checkbox */}
              <button
                onClick={() => handleToggleComplete(item.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  item.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                {item.completed && <CheckIcon className="w-3 h-3" />}
              </button>

              {/* Task text - Editable */}
              <div className="flex-1">
                <EditableText 
                  value={item.text}
                  onChange={(newText) => handleUpdateTaskText(item.id, newText)}
                  className={`${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
                  inputClassName="text-gray-800 p-1 rounded border border-blue-400"
                  placeholder="Task name..."
                />
              </div>

              {/* Expand/collapse button */}
              <button
                onClick={() => handleToggleExpand(item.id)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Tambah/lihat keterangan"
              >
                {item.expanded ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>

              {/* Delete button */}
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="p-1 text-red-400 hover:text-red-600 transition-colors"
                title="Hapus item"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Expanded description area */}
            {item.expanded && (
              <div className="px-3 pb-3 border-t border-gray-100">
                <textarea
                  value={item.description || ''}
                  onChange={(e) => handleUpdateDescription(item.id, e.target.value)}
                  placeholder="Tambahkan keterangan, catatan, atau PIC untuk item ini..."
                  className="w-full mt-2 p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            )}
          </div>
        ))}

        {/* Add new item */}
        {isAddingItem ? (
          <div className="border border-blue-300 rounded-lg p-3 bg-blue-50">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddItem();
                } else if (e.key === 'Escape') {
                  setIsAddingItem(false);
                  setNewItemText('');
                }
              }}
              placeholder="Ketik nama tugas/item..."
              className="w-full bg-transparent outline-none text-gray-800"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setIsAddingItem(false);
                  setNewItemText('');
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Batal
              </button>
              <button
                onClick={handleAddItem}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Tambah
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingItem(true)}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Tambah item baru...
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          {items.filter(item => item.completed).length} dari {items.length} selesai
        </div>
      )}
    </div>
  );
};

export default InteractiveChecklist;
