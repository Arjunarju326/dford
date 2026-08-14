'use client';

import React, { useState } from 'react';
import { ShoppingBag, Plus, Check, Trash2 } from 'lucide-react';

export default function ShoppingListPage() {
  const [items, setItems] = useState([
    { id: '1', name: 'Premium Organic Extra Virgin Olive Oil 1L', quantity: 1, checked: false, price: 799 },
    { id: '2', name: 'Fresh Basmati Rice 5kg Bag', quantity: 2, checked: true, price: 599 },
  ]);

  const [newItemText, setNewItemText] = useState('');

  const toggleCheck = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newItemText, quantity: 1, checked: false, price: 0 },
    ]);
    setNewItemText('');
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
          <ShoppingBag className="w-6 h-6 text-sky-600" />
          <span>My Smart Shopping List</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Keep track of promotional items before visiting store branches.</p>
      </div>

      {/* Add Item Form */}
      <form onSubmit={addItem} className="flex gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add an item (e.g. Milk, Olive Oil, TV)..."
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          type="submit"
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </form>

      {/* Items List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleCheck(item.id)}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {item.checked && <Check className="w-3.5 h-3.5" />}
              </button>
              <span className={`text-sm font-medium ${item.checked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                {item.name}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {item.price > 0 && <span className="text-xs font-bold text-slate-700">₹{item.price}</span>}
              <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
