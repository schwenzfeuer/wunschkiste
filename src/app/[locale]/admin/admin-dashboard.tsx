"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Users, Gift, MousePointerClick, Eye } from "lucide-react";

type Period = "7d" | "30d" | "90d" | "all";

interface AnalyticsData {
  summary: {
    totalUsers: number;
    totalWishlists: number;
    totalProducts: number;
    totalAffiliateClicks: number;
    totalShareViews: number;
  };
  dailyEvents: Record<string, string | number>[];
  topShops: { shop: string; clicks: number }[];
  countries: { country: string; count: number }[];
}

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const lineChartConfig: ChartConfig = {
  page_view: { label: "Seitenaufrufe", color: "var(--color-chart-1)" },
  affiliate_click: { label: "Affiliate-Klicks", color: "var(--color-chart-2)" },
  registration: { label: "Registrierungen", color: "var(--color-chart-3)" },
  wishlist_created: { label: "Wunschkisten", color: "var(--color-chart-4)" },
  cta_click: { label: "CTA-Klicks", color: "var(--color-chart-5)" },
};

const barChartConfig: ChartConfig = {
  clicks: { label: "Klicks", color: "var(--color-chart-2)" },
};

const pieChartConfig: ChartConfig = {
  count: { label: "Besucher" },
};

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>("30d");

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["admin-analytics", period],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  const periods: { value: Period; label: string }[] = [
    { value: "7d", label: "7 Tage" },
    { value: "30d", label: "30 Tage" },
    { value: "90d", label: "90 Tage" },
    { value: "all", label: "Gesamt" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl">Analytics</h1>
        <div className="flex gap-1">
          {periods.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading || !data ? (
        <p className="text-foreground/40">Laden...</p>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard
              title="Nutzer"
              value={data.summary.totalUsers}
              icon={<Users className="size-4 text-foreground/50" />}
            />
            <SummaryCard
              title="Wunschkisten"
              value={data.summary.totalWishlists}
              icon={<Gift className="size-4 text-foreground/50" />}
            />
            <SummaryCard
              title="Affiliate-Klicks"
              value={data.summary.totalAffiliateClicks}
              icon={<MousePointerClick className="size-4 text-foreground/50" />}
            />
            <SummaryCard
              title="Share-Aufrufe"
              value={data.summary.totalShareViews}
              icon={<Eye className="size-4 text-foreground/50" />}
            />
          </div>

          {/* Events Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Events pro Tag</CardTitle>
            </CardHeader>
            <CardContent>
              {data.dailyEvents.length === 0 ? (
                <p className="py-8 text-center text-foreground/40">Keine Daten vorhanden</p>
              ) : (
                <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
                  <LineChart data={data.dailyEvents}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v: string) => {
                        const d = new Date(v);
                        return `${d.getDate()}.${d.getMonth() + 1}.`;
                      }}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="page_view"
                      stroke="var(--color-page_view)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="affiliate_click"
                      stroke="var(--color-affiliate_click)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="registration"
                      stroke="var(--color-registration)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="wishlist_created"
                      stroke="var(--color-wishlist_created)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="cta_click"
                      stroke="var(--color-cta_click)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Shops */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Top Shops</CardTitle>
              </CardHeader>
              <CardContent>
                {data.topShops.length === 0 ? (
                  <p className="py-8 text-center text-foreground/40">Keine Daten vorhanden</p>
                ) : (
                  <ChartContainer config={barChartConfig} className="h-[250px] w-full">
                    <BarChart data={data.topShops} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="shop" type="category" width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="clicks" fill="var(--color-clicks)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Countries */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Länder</CardTitle>
              </CardHeader>
              <CardContent>
                {data.countries.length === 0 ? (
                  <p className="py-8 text-center text-foreground/40">Keine Daten vorhanden</p>
                ) : (
                  <ChartContainer config={pieChartConfig} className="h-[250px] w-full">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent nameKey="country" />} />
                      <Pie
                        data={data.countries}
                        dataKey="count"
                        nameKey="country"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                      >
                        {data.countries.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-foreground/50">{title}</p>
          {icon}
        </div>
        <p className="mt-2 text-3xl font-bold">{value.toLocaleString("de-DE")}</p>
      </CardContent>
    </Card>
  );
}
