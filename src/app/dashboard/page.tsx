"use client";

import { useState, useEffect } from 'react';

type ItemStatus = 'OK' | 'Low' | 'Critical';

interface PantryItem {
  id: string;
  name: string;
  price: number;
  
  // Velocity tracking
  totalQuantity: number;
  consumedQuantity: number;
  unit: string;
  daysTracked: number;
  
  autoPilot: boolean;
  alternative?: { name: string; price: number; discount: string };
}

const BUDGET = 5000;

export default function DashboardPage() {
  const [items, setItems] = useState<PantryItem[]>([
    { 
      id: '1', name: "Full Cream Milk", price: 80, 
      totalQuantity: 2000, consumedQuantity: 1500, unit: 'ml', daysTracked: 3, 
      autoPilot: true 
    },
    { 
      id: '2', name: "Eggs", price: 60, 
      totalQuantity: 12, consumedQuantity: 4, unit: 'pcs', daysTracked: 2, 
      autoPilot: false 
    },
    { 
      id: '3', name: "White Bread", price: 45, 
      totalQuantity: 20, consumedQuantity: 18, unit: 'slices', daysTracked: 5, 
      autoPilot: false,
      alternative: { name: "Multigrain Bread", price: 55, discount: "20% off" }
    },
  ]);

  const [spent, setSpent] = useState(4250);
  const [restockingIds, setRestockingIds] = useState<Set<string>>(new Set());
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: 100, quantity: 10, unit: 'pcs' });

  // Helper: Calculate derived fields
  const calculateDerived = (item: PantryItem) => {
    const rate = item.consumedQuantity / Math.max(1, item.daysTracked);
    const remaining = item.totalQuantity - item.consumedQuantity;
    const daysLeft = rate > 0 ? Math.ceil(remaining / rate) : 10; // Default 10 if unused
    
    let status: ItemStatus = 'OK';
    if (daysLeft <= 1 || remaining <= 0) status = 'Critical';
    else if (daysLeft <= 3) status = 'Low';

    return { rate, remaining, daysLeft, status };
  };

  // Action: Simulate time passing
  const simulateDayPassed = () => {
    setItems(currentItems => {
      const updatedItems = currentItems.map(item => {
        const updated = { ...item, daysTracked: item.daysTracked + 1 };
        const { status } = calculateDerived(updated);
        
        // AUTO-PILOT LOGIC: If critical and autopilot is on, trigger restock immediately
        if (status === 'Critical' && updated.autoPilot && !restockingIds.has(item.id)) {
          // Check budget guardrails first
          if (spent + updated.price <= BUDGET) {
             handleRestock(updated);
          } else {
             console.warn(`Budget Guardrail prevented auto-restock of ${updated.name}`);
             alert(`⚠️ Budget Guardrail: Auto-Pilot halted for ${updated.name}. Exceeds ₹${BUDGET} limit!`);
             // Turn off autopilot to prevent loop
             updated.autoPilot = false;
          }
        }
        return updated;
      });
      return updatedItems;
    });
  };

  // Action: Log Usage (Velocity Tracking)
  const logUsage = (id: string, amount: number) => {
    setItems(currentItems => 
      currentItems.map(item => {
        if (item.id === id) {
          const newConsumed = Math.min(item.totalQuantity, item.consumedQuantity + amount);
          return { ...item, consumedQuantity: newConsumed };
        }
        return item;
      })
    );
  };

  // CRUD: Add Item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;
    
    const item: PantryItem = {
      id: Date.now().toString(),
      name: newItem.name,
      price: newItem.price,
      totalQuantity: newItem.quantity,
      consumedQuantity: 0,
      unit: newItem.unit,
      daysTracked: 1,
      autoPilot: false
    };
    
    setItems([...items, item]);
    setShowAddModal(false);
    setNewItem({ name: '', price: 100, quantity: 10, unit: 'pcs' });
  };

  // CRUD: Delete Item
  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  // Action: Toggle Auto-Pilot
  const toggleAutoPilot = (id: string) => {
    setItems(currentItems => 
      currentItems.map(item => item.id === id ? { ...item, autoPilot: !item.autoPilot } : item)
    );
  };

  // Action: Mock Restock API Call
  const handleRestock = async (item: PantryItem, isAlternative: boolean = false) => {
    const finalPrice = isAlternative && item.alternative ? item.alternative.price : item.price;
    const finalName = isAlternative && item.alternative ? item.alternative.name : item.name;

    // Budget Guardrail Check
    if (spent + finalPrice > BUDGET) {
      alert(`⚠️ Budget Warning: Cannot restock ${finalName}. It will put you over your ₹${BUDGET} monthly limit!`);
      return;
    }

    setRestockingIds(prev => new Set(prev).add(item.id));
    
    try {
      const response = await fetch('/api/restock', {
        method: 'POST',
        body: JSON.stringify({ itemsToRestock: [finalName] }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setTimeout(() => {
          setItems(currentItems => 
            currentItems.map(i => {
              if (i.id === item.id) {
                // Reset item logic after delivery
                return {
                  ...i,
                  name: finalName, // Update name if alternative was chosen
                  price: finalPrice,
                  consumedQuantity: 0,
                  daysTracked: 1, // Reset velocity history
                  alternative: undefined // Clear alternative
                };
              }
              return i;
            })
          );
          setSpent(prev => prev + finalPrice);
          setRestockingIds(prev => {
            const next = new Set(prev);
            next.delete(item.id);
            return next;
          });
        }, 1500); 
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

  const pendingRestocks = items.filter(i => calculateDerived(i).status === 'Critical').length;
  const budgetPercentage = (spent / BUDGET) * 100;

  return (
    <div className="max-w-5xl mx-auto space-y-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Pantry Intelligence</h1>
          <p className="text-zinc-400">Velocity-based tracking, budgets, and MCP autonomous fulfillment.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
          >
            + New Item
          </button>
          <button 
            onClick={simulateDayPassed}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          >
            ⏭ Simulate 1 Day
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusCard title="Tracked Items" value={items.length.toString()} />
        <StatusCard title="Pending Restocks" value={pendingRestocks.toString()} alert={pendingRestocks > 0} />
        <div className={`p-6 rounded-2xl border transition-colors ${budgetPercentage > 90 ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/5'} col-span-1 md:col-span-2`}>
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-zinc-400 font-medium">Monthly Budget</h3>
            <p className="text-sm font-semibold">₹{spent} / ₹{BUDGET}</p>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${budgetPercentage > 90 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(100, budgetPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
          <h2 className="text-lg font-semibold">Real-Time Inventory</h2>
        </div>
        
        <div className="divide-y divide-white/5">
          {items.map(item => {
            const { remaining, daysLeft, status } = calculateDerived(item);
            const isRestocking = restockingIds.has(item.id);
            
            return (
              <div key={item.id} className="p-6 hover:bg-white/[0.01] transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Item Info & Velocity */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg text-white">{item.name}</h4>
                      <div className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getStatusColor(status)}`}>
                        {status}
                      </div>
                      {item.autoPilot && (
                        <div className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Auto-Pilot On
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-zinc-400">
                      <span>Remaining: <strong className="text-zinc-200">{remaining} {item.unit}</strong></span>
                      <span>Est. <strong className="text-zinc-200">{daysLeft === Infinity ? '?' : daysLeft} days</strong> left</span>
                      <span>₹{item.price}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Log Usage Button */}
                    <button 
                      onClick={() => logUsage(item.id, Math.ceil(item.totalQuantity * 0.1))} // consume 10%
                      disabled={remaining <= 0}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/10 hover:bg-white/5 text-zinc-300 disabled:opacity-50"
                      title="Log that you used some of this item"
                    >
                      Log Usage
                    </button>
                    
                    {/* Toggle Auto-Pilot */}
                    <button 
                      onClick={() => toggleAutoPilot(item.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${item.autoPilot ? 'border-blue-500/50 bg-blue-500/10 text-blue-400' : 'border-white/10 hover:bg-white/5 text-zinc-400'}`}
                    >
                      {item.autoPilot ? '🤖 Auto-Pilot' : 'Manual'}
                    </button>

                    {/* Delete */}
                    <button onClick={() => deleteItem(item.id)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>

                    {/* Restock Buttons (Only if critical and manual) */}
                    {status === 'Critical' && !item.autoPilot && (
                      <button 
                        onClick={() => handleRestock(item)}
                        disabled={isRestocking}
                        className={`px-4 py-1.5 ml-2 rounded-lg text-sm font-medium transition-all ${
                          isRestocking ? 'bg-zinc-800 text-zinc-500' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                        }`}
                      >
                        {isRestocking ? 'Restocking...' : 'Approve Restock'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Smart Alternative Prompt */}
                {status === 'Critical' && item.alternative && !item.autoPilot && !isRestocking && (
                  <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span>🌱</span>
                      <span className="text-emerald-400 font-medium">Smart Swap Suggestion:</span>
                      <span className="text-zinc-300">{item.alternative.name} ({item.alternative.discount}) - ₹{item.alternative.price}</span>
                    </div>
                    <button 
                      onClick={() => handleRestock(item, true)}
                      className="text-xs font-semibold px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-md hover:bg-emerald-500/30 transition-colors"
                    >
                      Accept Swap
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          
          {items.length === 0 && (
            <p className="text-zinc-500 text-center py-12">Your pantry is empty. Add items to track them.</p>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Add Custom Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Item Name</label>
                <input required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500" placeholder="e.g. Basmati Rice" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Price (₹)</label>
                  <input type="number" required value={newItem.price} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Total Quantity</label>
                  <input type="number" required value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Unit (e.g. kg, L, pcs)</label>
                <input required value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-zinc-200">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
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

function getStatusColor(status: ItemStatus) {
  switch(status) {
    case 'Critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'Low': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    default: return 'text-green-400 bg-green-400/10 border-green-400/20';
  }
}
