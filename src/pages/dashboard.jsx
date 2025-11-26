import { useCampaigns } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Activity, DollarSign, MousePointer2, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function Dashboard() {
  const { data, isLoading } = useCampaigns();

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Loading dashboard data...</div>;
  }

  const totalCampaigns = data?.total || 0;
  const activeCampaigns = data?.campaigns.filter(c => c.status === 'active').length || 0;
  const totalBudget = data?.campaigns.reduce((acc, curr) => acc + curr.budget, 0) || 0;
  
  // Platform distribution for Pie Chart
  const platformCounts = data?.campaigns.reduce((acc, curr) => {
    curr.platforms.forEach(p => {
      acc[p] = (acc[p] || 0) + 1;
    });
    return acc;
  }, {});

  const pieData = Object.entries(platformCounts || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const COLORS = ['#8b5cf6', '#10b981', '#06b6d4', '#f59e0b'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time insights across all your marketing channels.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Campaigns" 
          value={totalCampaigns} 
          icon={Activity} 
          trend="+12% from last month"
        />
        <StatsCard 
          title="Active Campaigns" 
          value={activeCampaigns} 
          icon={MousePointer2} 
          trend="Running now"
        />
        <StatsCard 
          title="Total Budget" 
          value={`$${totalBudget.toLocaleString()}`} 
          icon={DollarSign} 
          trend="Allocated"
        />
        <StatsCard 
          title="Avg. Daily Spend" 
          value="$1,240" 
          icon={BarChart3} 
          trend="+5% increase"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Main Chart Area - Platform Distribution */}
        <Card className="col-span-4 bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity / Quick List */}
        <Card className="col-span-3 bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.campaigns.slice(0, 5).map(campaign => (
                <div key={campaign.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{campaign.status} • {campaign.platforms.join(", ")}</p>
                  </div>
                  <div className="text-sm font-medium">
                    ${campaign.daily_budget}/day
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, trend }) {
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {trend.includes('+') && <ArrowUpRight className="h-3 w-3 text-green-500" />}
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}
