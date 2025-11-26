import { useCampaigns } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Search, Filter, MoreHorizontal, PlayCircle, PauseCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Campaigns() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading } = useCampaigns();
  const [search, setSearch] = useState("");

  if (isLoading) return <div className="p-8 text-center">Loading campaigns...</div>;

  const filteredCampaigns = data?.campaigns
    .filter(c => {
      // Search filter
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.platforms.some(p => p.toLowerCase().includes(search.toLowerCase()));

      // Status filter
      const matchesStatus =
        statusFilter === "all" ? true : c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your ad campaigns.</p>
        </div>
        <Link href="/campaigns/new">
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            + New Campaign
          </button>
        </Link>
      </div>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <div className="p-4 flex items-center gap-4 border-b border-border/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              className="pl-9 bg-background/50 border-border/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Status Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {["all", "active", "paused", "completed"].map((status) => {

              // Color mapping
              const colorMap = {
                all: "border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200",
                active: "border-green-500 text-green-600 hover:bg-green-50",
                paused: "border-yellow-500 text-yellow-600 hover:bg-yellow-50",
                completed: "border-slate-500 text-slate-600 hover:bg-slate-50",
              };

              // Selected state: solid color pill
              const selectedMap = {
                all: "bg-gray-700 text-white border-gray-700",
                active: "bg-green-600 text-white border-green-600",
                paused: "bg-yellow-500 text-white border-yellow-500",
                completed: "bg-slate-600 text-white border-slate-600",
              };

              const style =
                statusFilter === status ? selectedMap[status] : colorMap[status];

              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition ${style}`}
                >
                  {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              );
            })}
          </div>
          <button className="p-2 hover:bg-muted rounded-md text-muted-foreground">
            <Filter className="h-4 w-4" />
          </button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Daily</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns?.map((campaign) => (
              <TableRow key={campaign.id} className="group hover:bg-muted/30 border-border/50 cursor-pointer">
                <TableCell>
                  <StatusBadge status={campaign.status} />
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/campaigns/${campaign.id}`}>
                    <span className="group-hover:text-primary transition-colors">{campaign.name}</span>
                  </Link>
                  <div className="text-xs text-muted-foreground mt-0.5">{campaign.id}</div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {campaign.platforms.map(p => (
                      <PlatformIcon key={p} platform={p} />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">${campaign.budget.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">${campaign.daily_budget.toLocaleString()}</TableCell>
                <TableCell className="text-right align-top">
                  <div className="flex flex-col items-end gap-1">
                    <Link href={`/campaigns/${campaign.id}`}>
                      <button className="px-4 py-1.5 bg-primary text-primary-foreground text-xs rounded-full hover:bg-primary/90 transition w-max">
                        View Details
                      </button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    active: "bg-green-500/10 text-green-500 border-green-500/20",
    paused: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    completed: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };

  const icons = {
    active: PlayCircle,
    paused: PauseCircle,
    completed: CheckCircle2
  }

  const Icon = icons[status] || CheckCircle2;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.completed} capitalize`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

function PlatformIcon({ platform }) {
  return (
    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-muted rounded text-muted-foreground border border-border/50">
      {platform.slice(0, 2)}
    </span>
  );
}
