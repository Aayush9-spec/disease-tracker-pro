import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";

const caseSchema = z.object({
  diseaseId: z.string().min(1, "Disease is required"),
  householdCode: z.string().min(1, "Household code is required"),
  reportDate: z.string().min(1, "Report date is required"),
  severity: z.enum(["mild", "moderate", "severe"]).optional(),
  confirmed: z.boolean().default(false),
  temperatureC: z.number().min(33).max(43).optional(),
  notes: z.string().max(2000).optional(),
});

const CaseNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [diseases, setDiseases] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    diseaseId: "",
    householdCode: "",
    reportDate: new Date().toISOString().split("T")[0],
    severity: "",
    confirmed: false,
    temperatureC: "",
    notes: "",
  });

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    const { data } = await supabase
      .from("diseases")
      .select("*")
      .order("name");
    
    setDiseases(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      const validated = caseSchema.parse({
        diseaseId: formData.diseaseId,
        householdCode: formData.householdCode,
        reportDate: formData.reportDate,
        severity: formData.severity || undefined,
        confirmed: formData.confirmed,
        temperatureC: formData.temperatureC ? parseFloat(formData.temperatureC) : undefined,
        notes: formData.notes || undefined,
      });

      // Find or create household
      let household = await supabase
        .from("households")
        .select("*")
        .eq("household_code", validated.householdCode)
        .single();

      let householdId = household.data?.id;

      if (!household.data) {
        // Create sample location and household
        const { data: regions } = await supabase
          .from("regions")
          .select("id")
          .limit(1)
          .single();

        if (!regions) {
          toast.error("No regions found. Please contact admin.");
          return;
        }

        const { data: location } = await supabase
          .from("locations")
          .insert({ region_id: regions.id })
          .select()
          .single();

        const { data: newHousehold } = await supabase
          .from("households")
          .insert({ 
            location_id: location.id, 
            household_code: validated.householdCode 
          })
          .select()
          .single();

        householdId = newHousehold.id;
      }

      // Create case
      const { error } = await supabase
        .from("cases")
        .insert({
          household_id: householdId,
          disease_id: validated.diseaseId,
          report_date: validated.reportDate,
          severity: validated.severity || null,
          confirmed: validated.confirmed,
          temperature_c: validated.temperatureC || null,
          notes: validated.notes || null,
        });

      if (error) throw error;

      toast.success("Case created successfully!");
      navigate("/cases");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to create case");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">New Case Report</h1>
          <p className="text-muted-foreground">Enter disease case details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Case Information</CardTitle>
            <CardDescription>Fill in all required fields</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="disease">Disease *</Label>
                <Select value={formData.diseaseId} onValueChange={(val) => setFormData({ ...formData, diseaseId: val })}>
                  <SelectTrigger id="disease">
                    <SelectValue placeholder="Select disease" />
                  </SelectTrigger>
                  <SelectContent>
                    {diseases.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="household">Household Code *</Label>
                <Input
                  id="household"
                  value={formData.householdCode}
                  onChange={(e) => setFormData({ ...formData, householdCode: e.target.value })}
                  placeholder="HH-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportDate">Report Date *</Label>
                <Input
                  id="reportDate"
                  type="date"
                  value={formData.reportDate}
                  onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select value={formData.severity} onValueChange={(val) => setFormData({ ...formData, severity: val })}>
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="33"
                  max="43"
                  value={formData.temperatureC}
                  onChange={(e) => setFormData({ ...formData, temperatureC: e.target.value })}
                  placeholder="37.5"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="confirmed"
                  checked={formData.confirmed}
                  onChange={(e) => setFormData({ ...formData, confirmed: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="confirmed">Lab Confirmed</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional case details..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Case"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/cases")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CaseNew;