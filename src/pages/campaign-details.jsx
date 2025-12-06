import { useCampaign, getCampaignStreamUrl } from "@/lib/api";
import { useRoute } from "wouter";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from "recharts";
import { Activity, MousePointer2, Eye, DollarSign, PauseCircle, PlayCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function CampaignDetails() {
  const [statusFilter, setStatusFilter] = useState("all");


  const [, params] = useRoute("/campaigns/:id");
  const id = params?.id || "";
  const { data: campaign, isLoading } = useCampaign(id);

  const [realtimeData, setRealtimeData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const tooltipFormatter = (value) =>
    typeof value === "number" ? value.toLocaleString() : value;
  const ranges = [
    { label: "1h", ms: 60 * 60 * 1000 },
    { label: "24h", ms: 24 * 60 * 60 * 1000 },
    { label: "7d", ms: 7 * 24 * 60 * 60 * 1000 },
    { label: "30d", ms: 30 * 24 * 60 * 60 * 1000 }
  ];
  const [activeRange, setActiveRange] = useState("24h");

  const filteredData = realtimeData.filter(
    d => Date.now() - new Date(d.timestamp).getTime() <=
      (ranges.find(r => r.label === activeRange)?.ms || Infinity)
  );
  const tooltipLabelFormatter = (label) =>
    format(new Date(label), "PPp");
  // Real-time SSE Connection
  // Real-time SSE Connection
  useEffect(() => {
    if (!id) return;

    let eventSource;
    let retryTimeout;

    const connect = () => {
      // Close existing connection if any before creating a new one
      if (eventSource) {
        eventSource.close();
      }

      eventSource = new EventSource(getCampaignStreamUrl(id));

      eventSource.onopen = () => {
        console.log("SSE Connected");
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const newData = JSON.parse(event.data);

          setRealtimeData(prev => {
            const newArr = [...prev, newData];
            // Keep last 30 data points for better visibility
            if (newArr.length > 30) return newArr.slice(newArr.length - 30);
            return newArr;
          });
        } catch (err) {
          console.error("Error parsing SSE data", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE Error", err);
        setIsConnected(false);
        eventSource.close();

        // Attempt to reconnect after 3 seconds
        retryTimeout = setTimeout(() => {
          console.log("Attempting to reconnect...");
          connect();
        }, 3000);
      };
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [id]);

  if (isLoading || !campaign) return <div className="p-8 flex items-center justify-center h-screen">Loading campaign details...</div>;

  const latestMetric = realtimeData[realtimeData.length - 1] || { clicks: 0, impressions: 0, spend: 0, conversions: 0 };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            ID: <span className="font-mono text-xs bg-muted px-1 rounded">{campaign.id}</span> •
            Budget: ${campaign.budget.toLocaleString()} •
            Started: {format(new Date(campaign.created_at), "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Live Stream
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Disconnected
            </span>
          )}
        </div>
      </div>

      {/* Real-time Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Real-time Impressions"
          value={latestMetric.impressions.toLocaleString()}
          icon={Eye}
          color="text-blue-400"
        />
        <MetricCard
          title="Real-time Clicks"
          value={latestMetric.clicks.toLocaleString()}
          icon={MousePointer2}
          color="text-purple-400"
        />
        <MetricCard
          title="Live Spend"
          value={`$${latestMetric.spend.toFixed(2)}`}
          icon={DollarSign}
          color="text-green-400"
        />
        <MetricCard
          title="Conversions"
          value={latestMetric.conversions}
          icon={Activity}
          color="text-orange-400"
        />
      </div>
      <div className="flex gap-2 mb-4">
        {ranges.map(r => (
          <button
            key={r.label}
            onClick={() => setActiveRange(r.label)}
            className={`
        px-3 py-1.5 text-xs rounded-full border transition
        ${activeRange === r.label
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border hover:bg-muted/70"}
      `}
          >
            {r.label}
          </button>
        ))}
      </div>
      {/* Charts Grid - 2x2 Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Impressions - Area Chart */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Eye className="h-4 w-4 text-blue-500" />
              Impressions (Volume)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realtimeData}>
                  <defs>
                    <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="15%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="4" stroke="hsl(var(--border))" vertical={false} />

                  {/* X Axis with readable timestamp */}
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(t) => format(new Date(t), "HH:mm")}
                    interval="preserveEnd"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />

                  {/* Y Axis with label */}
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickFormatter={(v) => v.toLocaleString()}
                    label={{ value: "Impressions", angle: -90, position: "insideLeft" }}
                  />

                  <Tooltip
                    formatter={tooltipFormatter}
                    labelFormatter={tooltipLabelFormatter}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: 8
                    }}
                  />

                  {/* Zero baseline */}
                  <Line type="monotone" dataKey="impressions" stroke="#3b82f6" strokeWidth={2} />

                  <Area
                    type="monotone"
                    dataKey="impressions"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorImpressions)"
                  />
                </AreaChart>
              </ResponsiveContainer>

            </div>
          </CardContent>
        </Card>

        {/* 2. Clicks - Bar Chart */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MousePointer2 className="h-4 w-4 text-purple-500" />
              Clicks (Activity)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={realtimeData}>
                  <CartesianGrid strokeDasharray="4" stroke="hsl(var(--border))" vertical={false} />

                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(t) => format(new Date(t), "HH:mm")}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />

                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickFormatter={(v) => v.toLocaleString()}
                    label={{ value: "Clicks", angle: -90, position: "insideLeft" }}
                  />

                  <Tooltip
                    formatter={tooltipFormatter}
                    labelFormatter={tooltipLabelFormatter}
                    cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
                  />

                  <Bar
                    dataKey="clicks"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 3. Live Spend - Line Chart */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              Live Spend (Trend)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={realtimeData}>
                  <CartesianGrid strokeDasharray="4" stroke="hsl(var(--border))" vertical={false} />

                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(t) => format(new Date(t), "HH:mm")}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />

                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                    label={{ value: "Spend $", angle: -90, position: "insideLeft" }}
                  />

                  <Tooltip
                    formatter={(v) => `$${v.toFixed(2)}`}
                    labelFormatter={tooltipLabelFormatter}
                  />

                  <Line
                    type="stepAfter"
                    dataKey="spend"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 4. Conversions - Composed/Scatter Style (using Area for visual weight) */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Activity className="h-4 w-4 text-orange-500" />
              Conversions (Impact)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realtimeData}>
                  <defs>
                    <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="20%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="4" stroke="hsl(var(--border))" vertical={false} />

                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(t) => format(new Date(t), "HH:mm")}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />

                  <YAxis
                    tickFormatter={(v) => v.toLocaleString()}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    label={{ value: "Conversions", angle: -90, position: "insideLeft" }}
                  />

                  <Tooltip
                    formatter={tooltipFormatter}
                    labelFormatter={tooltipLabelFormatter}
                  />

                  <Area
                    type="monotone"
                    dataKey="conversions"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="url(#colorConversions)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color }) {
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div className="text-2xl font-bold font-mono mt-2">{value}</div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
  const styles = {
    active: "text-green-500 border-green-500/20 bg-green-500/10",
    paused: "text-yellow-500 border-yellow-500/20 bg-yellow-500/10",
    completed: "text-slate-500 border-slate-500/20 bg-slate-500/10",
  };

  const icons = {
    active: PlayCircle,
    paused: PauseCircle,
    completed: CheckCircle2
  }

  const Icon = icons[status] || CheckCircle2;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-medium border ${styles[status] || styles.completed} capitalize`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}
