import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const Cases = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from("cases")
        .select(`
          *,
          disease:diseases(name),
          household:households(household_code)
        `)
        .order("report_date", { ascending: false })
        .limit(100);

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case "mild": return "default";
      case "moderate": return "secondary";
      case "severe": return "destructive";
      default: return "outline";
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Disease", "Report Date", "Severity", "Confirmed", "Outcome"];
    const rows = cases.map(c => [
      c.id,
      c.disease?.name || "N/A",
      format(new Date(c.report_date), "yyyy-MM-dd"),
      c.severity || "N/A",
      c.confirmed ? "Yes" : "No",
      c.outcome || "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cases_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Case Management</h1>
            <p className="text-muted-foreground">View and manage disease case reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button asChild>
              <Link to="/cases/new">
                <Plus className="h-4 w-4 mr-2" />
                New Case
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
            <CardDescription>Latest 100 case reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Disease</TableHead>
                    <TableHead>Household</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Confirmed</TableHead>
                    <TableHead>Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : cases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No cases found</TableCell>
                    </TableRow>
                  ) : (
                    cases.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{format(new Date(c.report_date), "MMM dd, yyyy")}</TableCell>
                        <TableCell className="font-medium">{c.disease?.name || "N/A"}</TableCell>
                        <TableCell className="text-muted-foreground">{c.household?.household_code || "N/A"}</TableCell>
                        <TableCell>
                          {c.severity ? (
                            <Badge variant={getSeverityColor(c.severity)}>{c.severity}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {c.confirmed ? (
                            <Badge variant="default">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{c.outcome || "active"}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Cases;