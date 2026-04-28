"use client";

import { useState } from 'react';

type ItemStatus = 'OK' | 'Low' | 'Critical';

interface PantryItem {
  id: string;
  name: string;
  daysLeft: number;
}

export default function DashboardPage() {
  const [items, setItems] = useState<PantryItem[]>([
    { id: '1', name: "Full Cream Milk (1L)", daysLeft: 2 },
    { id: '2', name: "Eggs (Tray of 6)", daysLeft: 5 },
    { id: '3', name: "Brown Bread", daysLeft: 1 },
    { id: '4', name: "Instant Coffee", daysLeft: 14 },
  ]);

  const [restockingIds, setRestockingIds] = useState<Set<string>>(new Set());

  // Helper to determine status based on days left
  const getStatus = (daysLeft: number): ItemStatus => {
    if (daysLeft <= 1) return 'Critical';
    if (daysLeft <= 3) return 'Low';
    return 'OK';
  };

  // Action: Simulate time passing
  const simulateDayPassed = () => {
    setItems(currentItems => 
      currentItems.map(item => ({
        ...item,
        daysLeft: Math.max(0, item.daysLeft - 1)
      }))
    );
  };

  // Action: Add a random item
  const addRandomItem = () => {
    const randomItems = ["Apples (1kg)", "Butter (100g)", "Oats (500g)", "Green Tea", "Pasta"];
    const randomName = randomItems[Math.floor(Math.random() * randomItems.length)];
    const randomDays = Math.floor(Math.random() * 10) + 2;
    
    setItems([...items, { id: Date.now().toString(), name: randomName, daysLeft: randomDays }]);
  };

  // Action: Mock Restock API Call
  const handleRestock = async (item: PantryItem) => {
    setRestockingIds(prev => new Set(prev).add(item.id));
    
    try {
      const response = await fetch('/api/restock', {
        method: 'POST',
        body: JSON.stringify({ itemsToRestock: [item.name] }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        // Reset the item's days left to simulate a successful delivery
        setTimeout(() => {
          setItems(currentItems => 
            currentItems.map(i => i.id === item.id ? { ...i, daysLeft: 7 } : i)
          );
          setRestockingIds(prev => {
            const next = new Set(prev);
            next.delete(item.id);
            return next;
          });
          alert(`Successfully ordered ${item.name} via Swiggy MCP!`);
        }, 1500); // 1.5s artificial delay
      }
    } catch (error) {
      console.error("Restock failed", error);
      setRestockingIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const pendingRestocks = items.filter(i => getStatus(i.daysLeft) === 'Critical').length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Pantry Inventory</h1>
          <p className="text-zinc-400">Manage your essential items and view predictive restock alerts.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={addRandomItem}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
          >
            + Add Item
          </button>
          <button 
            onClick={simulateDayPassed}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          >
            ⏭ Simulate 1 Day
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard title="Items Tracked" value={items.length.toString()} />
        <StatusCard title="Pending Restocks" value={pendingRestocks.toString()} alert={pendingRestocks > 0} />
        <StatusCard title="AI Status" value="Active" />
      </div>

      <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">Current Stock Levels</h2>
        <div className="space-y-4">
          {items.map(item => (
            <InventoryItem 
              key={item.id}
              item={item}
              status={getStatus(item.daysLeft)}
              isRestocking={restockingIds.has(item.id)}
              onRestock={() => handleRestock(item)}
            />
          ))}
          
          {items.length === 0 && (
            <p className="text-zinc-500 text-center py-8">Your pantry is empty. Add items to track them.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, value, alert }: { title: string, value: string, alert?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border transition-colors ${alert ? 'bg-orange-500/10 border-orange-500/20' : 'bg-white/5 border-white/5'}`}>
      <h3 className="text-zinc-400 font-medium mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${alert ? 'text-orange-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function InventoryItem({ 
  item, 
  status,
  isRestocking,
  onRestock
}: { 
  item: PantryItem, 
  status: ItemStatus,
  isRestocking: boolean,
  onRestock: () => void
}) {
  const getStatusColor = () => {
    switch(status) {
      case 'Critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Low': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return 'text-green-400 bg-green-400/10 border-green-400/20';
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] gap-4">
      <div>
        <h4 className="font-medium text-white">{item.name}</h4>
        <p className="text-sm text-zinc-500">Est. {item.daysLeft} days remaining</p>
      </div>
      
      <div className="flex items-center gap-3">
        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor()}`}>
          {status}
        </div>
        
        {status === 'Critical' && (
          <button 
            onClick={onRestock}
            disabled={isRestocking}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isRestocking 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
            }`}
          >
            {isRestocking ? 'Restocking...' : '1-Click Approve'}
          </button>
        )}
      </div>
    </div>
  );
}
