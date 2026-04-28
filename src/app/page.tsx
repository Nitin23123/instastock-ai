import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-orange-500/30 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-orange-600/30 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[150px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-bold text-lg">
            I
          </div>
          <span className="text-xl font-semibold tracking-tight">InstaStock AI</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
            Dashboard
          </Link>
          <a href="https://github.com/Nitin23123/instastock-ai" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors">
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-orange-400 text-sm font-medium mb-8 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          Powered by Swiggy Builders Club & MCP
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400 leading-[1.1]">
          Never run out of <br className="hidden sm:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
            essentials again.
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed">
          InstaStock AI is your autonomous pantry manager. It predicts when you're running low on daily staples and automatically orchestrates restocks via Swiggy Instamart.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            href="/dashboard"
            className="h-12 px-8 flex items-center justify-center rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            Launch Dashboard
          </Link>
          <a 
            href="#features"
            className="h-12 px-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all backdrop-blur-sm"
          >
            See how it works
          </a>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            title="Predictive AI" 
            description="Our reasoning engine learns your consumption habits over time to anticipate needs before you run out."
            icon="🧠"
          />
          <FeatureCard 
            title="MCP Integration" 
            description="Directly interfaces with Swiggy Instamart's Catalog and Ordering MCP servers for zero-friction fulfillment."
            icon="🔌"
          />
          <FeatureCard 
            title="Smart Approvals" 
            description="Get notified on your phone with a pre-built cart. One tap approval to replenish your pantry."
            icon="📱"
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}
