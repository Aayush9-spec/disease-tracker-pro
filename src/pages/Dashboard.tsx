import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCases: 0,
    confirmedRate: 0,
    activeCases: 0,
    recoveredCases: 0,
  });
  const [diseaseData, setDiseaseData] = useState<any[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total cases
      const { count: totalCases } = await supabase
        .from("cases")
        .select("*", { count: "exact", head: true });

      // Fetch confirmed rate
      const { count: confirmedCount } = await supabase
        .from("cases")
        .select("*", { count: "exact", head: true })
        .eq("confirmed", true);

      // Fetch outcome stats
      const { count: activeCases } = await supabase
        .from("cases")
        .select("*", { count: "exact", head: true })
        .eq("outcome", "active");

      const { count: recoveredCases } = await supabase
        .from("cases")
        .select("*", { count: "exact", head: true })
        .eq("outcome", "recovered");

      // Fetch disease distribution
      const { data: cases } = await supabase
        .from("cases")
        .select("disease_id, diseases(name)")
        .limit(1000);

      if (cases) {
        const diseaseCount: Record<string, number> = {};
        cases.forEach((c: any) => {
          const name = c.diseases?.name || "Unknown";
          diseaseCount[name] = (diseaseCount[name] || 0) + 1;
        });

        const diseaseChartData = Object.entries(diseaseCount).map(([name, value]) => ({
          name,
          value,
        }));

        setDiseaseData(diseaseChartData);
      }

      // Fetch time series (last 30 days)
      const { data: recentCases } = await supabase
        .from("cases")
        .select("report_date")
        .gte("report_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("report_date", { ascending: true });

      if (recentCases) {
        const dateCount: Record<string, number> = {};
        recentCases.forEach((c: any) => {
          const date = new Date(c.report_date).toLocaleDateString();
          dateCount[date] = (dateCount[date] || 0) + 1;
        });

        const timeSeriesChartData = Object.entries(dateCount).map(([date, cases]) => ({
          date,
          cases,
        }));

        setTimeSeriesData(timeSeriesChartData);
      }

      setStats({
        totalCases: totalCases || 0,
        confirmedRate: totalCases ? Math.round(((confirmedCount || 0) / totalCases) * 100) : 0,
        activeCases: activeCases || 0,
        recoveredCases: recoveredCases || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Disease Surveillance Dashboard</h1>
          <p className="text-muted-foreground">Monitor and analyze regional disease cases in real-time</p>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCases}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Confirmed Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.confirmedRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Lab confirmed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeCases}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recovered</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.recoveredCases}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully recovered</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Cases Over Time (Last 30 Days)</CardTitle>
              <CardDescription>Daily case reports trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="cases" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disease Distribution</CardTitle>
              <CardDescription>Cases by disease type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={diseaseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {diseaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;