import { Link, useLocation } from "wouter";
import { LayoutDashboard, BarChart3, Settings, Activity, PieChart } from "lucide-react";

export function Layout({ children }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/campaigns", label: "Campaigns", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight text-foreground">Mixo</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(124,58,237,0.1)]" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-400" />
            <div className="text-xs">
              <div className="font-medium text-foreground">Suraj</div>
              <div className="text-muted-foreground">suraj@mixo.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
