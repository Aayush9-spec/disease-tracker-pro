import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, BarChart3, MapPin, Shield, Users, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-health.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Activity className="h-4 w-4" />
                Production-Ready Health Surveillance
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Track Disease Outbreaks with
                <span className="text-primary"> Precision</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                HealthWatch empowers health officers and administrators to collect, analyze, and visualize regional disease cases in real-time. Make data-driven decisions to protect communities.
              </p>
              <div className="flex gap-4">
                <Button asChild size="lg" className="text-base">
                  <Link to="/auth">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link to="/dashboard">View Demo</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Health surveillance dashboard visualization" 
                className="rounded-2xl shadow-2xl border border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comprehensive Disease Surveillance</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to monitor, analyze, and respond to disease outbreaks in your region
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Case Entry</h3>
              <p className="text-muted-foreground">
                Fast, accessible data capture with strict validation for Fever, Typhoid, Jaundice, Malaria, and Diarrhea cases.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Insightful Analytics</h3>
              <p className="text-muted-foreground">
                Time series analysis, disease distribution charts, and trend tracking to identify patterns early.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-chart-3" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Geographic Mapping</h3>
              <p className="text-muted-foreground">
                Interactive heatmaps and clustering to visualize disease hotspots across regions.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Compliant</h3>
              <p className="text-muted-foreground">
                Role-based access control, encrypted PII data, and audit trails for complete security.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-chart-5/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-chart-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Role Support</h3>
              <p className="text-muted-foreground">
                Admin, Officer, and Viewer roles with granular permissions for team collaboration.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-info" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automated Alerts</h3>
              <p className="text-muted-foreground">
                Threshold-based alerts notify admins when case counts exceed defined limits.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Protect Your Community?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join health departments using HealthWatch to monitor and respond to disease outbreaks faster.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link to="/auth">Start Tracking Cases Now</Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 HealthWatch. Production-ready disease surveillance platform.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;