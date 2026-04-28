export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/5 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-bold text-lg">
            I
          </div>
          <span className="text-xl font-semibold tracking-tight">InstaStock AI</span>
        </div>
        
        <nav className="flex flex-col gap-2">
          <NavItem active>Pantry Inventory</NavItem>
          <NavItem>Restock Logs</NavItem>
          <NavItem>Settings</NavItem>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function NavItem({ children, active }: { children: React.ReactNode, active?: boolean }) {
  return (
    <a 
      href="#" 
      className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${active ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
    >
      {children}
    </a>
  );
}
