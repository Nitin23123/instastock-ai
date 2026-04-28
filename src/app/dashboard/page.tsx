export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Pantry Inventory</h1>
        <p className="text-zinc-400">Manage your essential items and view predictive restock alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Cards */}
        <StatusCard title="Items Tracked" value="12" />
        <StatusCard title="Pending Restocks" value="2" alert />
        <StatusCard title="Monthly Spent" value="₹ 4,250" />
      </div>

      {/* Inventory List Skeleton */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">Current Stock Levels</h2>
        <div className="space-y-4">
          <InventoryItem name="Full Cream Milk (1L)" status="Low" daysLeft="1 day" />
          <InventoryItem name="Eggs (Tray of 6)" status="OK" daysLeft="4 days" />
          <InventoryItem name="Brown Bread" status="Critical" daysLeft="0 days" />
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, value, alert }: { title: string, value: string, alert?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border ${alert ? 'bg-orange-500/10 border-orange-500/20' : 'bg-white/5 border-white/5'}`}>
      <h3 className="text-zinc-400 font-medium mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${alert ? 'text-orange-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function InventoryItem({ name, status, daysLeft }: { name: string, status: string, daysLeft: string }) {
  const getStatusColor = () => {
    switch(status) {
      case 'Critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Low': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return 'text-green-400 bg-green-400/10 border-green-400/20';
    }
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
      <div>
        <h4 className="font-medium text-white">{name}</h4>
        <p className="text-sm text-zinc-500">Est. {daysLeft} remaining</p>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor()}`}>
        {status}
      </div>
    </div>
  );
}
