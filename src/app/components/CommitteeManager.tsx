"use client";

import React, { useState } from 'react';
import { PlusIcon, TrashIcon, UserCircleIcon, PhoneIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CommitteeMember {
  id: string;
  namaAnggota: string;
  jabatan: string;
  kontak?: string;
  email?: string;
  tugasUtama?: string;
  isEditing?: boolean;
}

interface CommitteeManagerProps {
  eventId: string;
  initialMembers: CommitteeMember[];
  onSaveChanges: (updatedMembers: CommitteeMember[]) => Promise<void>;
}

const CommitteeManager: React.FC<CommitteeManagerProps> = ({ eventId, initialMembers, onSaveChanges }) => {
  const [members, setMembers] = useState<CommitteeMember[]>(initialMembers.map(m => ({ ...m, isEditing: false })));
  const [newMember, setNewMember] = useState({ namaAnggota: '', jabatan: '', kontak: '', email: '', tugasUtama: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);

  const handleAddMember = async () => {
    if (newMember.namaAnggota.trim() === '' || newMember.jabatan.trim() === '') return;
    const newMembersList = [...members, { ...newMember, id: Date.now().toString(), isEditing: false }];
    setMembers(newMembersList);
    await onSaveChanges(newMembersList);
    setNewMember({ namaAnggota: '', jabatan: '', kontak: '', email: '', tugasUtama: '' });
    setIsAdding(false);
  };

  const handleDeleteMember = async (memberId: string) => {
    const newMembersList = members.filter(member => member.id !== memberId);
    setMembers(newMembersList);
    await onSaveChanges(newMembersList);
  };

  const startEditing = (member: CommitteeMember) => {
    setEditingMember({ ...member });
  };

  const saveEdit = async () => {
    if (!editingMember) return;
    const updatedMembers = members.map(m => 
      m.id === editingMember.id ? { ...editingMember, isEditing: false } : m
    );
    setMembers(updatedMembers);
    await onSaveChanges(updatedMembers);
    setEditingMember(null);
  };

  const cancelEdit = () => {
    setEditingMember(null);
  };

  const updateEditingField = (field: keyof CommitteeMember, value: string) => {
    if (editingMember) {
      setEditingMember({ ...editingMember, [field]: value });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><UserCircleIcon className="h-6 w-6 text-blue-500"/> Panitia</h2>
      
      <div className="space-y-4">
        {members.map(member => (
          <div key={member.id} className="p-3 rounded-lg border border-gray-200 hover:border-blue-400 transition-all">
            {editingMember?.id === member.id ? (
              // --- EDITING VIEW ---
              <div className="space-y-3">
                <input type="text" value={editingMember.namaAnggota} onChange={e => updateEditingField('namaAnggota', e.target.value)} className="w-full font-bold text-lg p-1 rounded" />
                <input type="text" value={editingMember.jabatan} onChange={e => updateEditingField('jabatan', e.target.value)} className="w-full text-sm p-1 rounded bg-gray-100" />
                <input type="text" placeholder="Kontak" value={editingMember.kontak} onChange={e => updateEditingField('kontak', e.target.value)} className="w-full text-sm p-1 rounded" />
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={cancelEdit} className="p-1"><XMarkIcon className="h-5 w-5 text-gray-500"/></button>
                  <button onClick={saveEdit} className="p-1"><CheckIcon className="h-5 w-5 text-green-500"/></button>
                </div>
              </div>
            ) : (
              // --- DISPLAY VIEW ---
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserCircleIcon className='h-10 w-10 text-gray-300'/>
                  <div>
                    <p className="font-semibold text-gray-800">{member.namaAnggota}</p>
                    <p className="text-sm text-gray-500">{member.jabatan}</p>
                    {member.kontak && <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><PhoneIcon className="h-3 w-3"/> {member.kontak}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEditing(member)} className="p-1 text-gray-400 hover:text-blue-600"><PencilIcon className="h-4 w-4"/></button>
                  <button onClick={() => handleDeleteMember(member.id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </div>
        ))}

        {members.length === 0 && !isAdding && (
            <p className="text-center text-gray-500 py-4">Belum ada panitia yang ditambahkan.</p>
        )}

        {isAdding && (
          <div className="p-3 rounded-lg border border-blue-400 bg-blue-50">
             <input type="text" placeholder="Nama Anggota" value={newMember.namaAnggota} onChange={e => setNewMember(p => ({ ...p, namaAnggota: e.target.value }))} className="w-full font-bold p-1 rounded bg-transparent"/>
             <input type="text" placeholder="Jabatan" value={newMember.jabatan} onChange={e => setNewMember(p => ({ ...p, jabatan: e.target.value }))} className="w-full text-sm p-1 mt-1 rounded bg-transparent"/>
             <input type="text" placeholder="Kontak (opsional)" value={newMember.kontak} onChange={e => setNewMember(p => ({ ...p, kontak: e.target.value }))} className="w-full text-xs p-1 mt-1 rounded bg-transparent"/>
             <div className="flex justify-end gap-2 mt-2">
               <button onClick={() => setIsAdding(false)} className="text-sm text-gray-600">Batal</button>
               <button onClick={handleAddMember} className="text-sm text-blue-600 font-semibold">Simpan</button>
             </div>
          </div>
        )}

        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="w-full mt-2 p-2 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Tambah Anggota Panitia
          </button>
        )}
      </div>
    </div>
  );
}

export default CommitteeManager;

