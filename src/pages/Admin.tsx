import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const Admin = () => {
  const [diseases, setDiseases] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [newDisease, setNewDisease] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [diseasesRes, regionsRes] = await Promise.all([
      supabase.from("diseases").select("*").order("name"),
      supabase.from("regions").select("*").order("name"),
    ]);

    setDiseases(diseasesRes.data || []);
    setRegions(regionsRes.data || []);
  };

  const addDisease = async () => {
    if (!newDisease.trim()) return;
    
    setLoading(true);
    const { error } = await supabase
      .from("diseases")
      .insert({ name: newDisease.trim() });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Disease added");
      setNewDisease("");
      fetchData();
    }
    setLoading(false);
  };

  const addRegion = async () => {
    if (!newRegion.trim()) return;
    
    setLoading(true);
    const { error } = await supabase
      .from("regions")
      .insert({ name: newRegion.trim() });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Region added");
      setNewRegion("");
      fetchData();
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Administration</h1>
          <p className="text-muted-foreground">Manage diseases, regions, and system settings</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Diseases</CardTitle>
              <CardDescription>Manage disease types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="New disease name"
                  value={newDisease}
                  onChange={(e) => setNewDisease(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addDisease()}
                />
                <Button onClick={addDisease} disabled={loading}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>ICD Code</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diseases.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell className="text-muted-foreground">{d.icd_code || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regions</CardTitle>
              <CardDescription>Manage geographic regions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="New region name"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addRegion()}
                />
                <Button onClick={addRegion} disabled={loading}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regions.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-muted-foreground">{r.code || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Admin;