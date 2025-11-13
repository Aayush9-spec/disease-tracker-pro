import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type } = await req.json();

    // Generate analytics data
    if (type === 'summary') {
      // Fetch cases data
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('*');

      if (casesError) throw casesError;

      // Fetch diseases data
      const { data: diseases, error: diseasesError } = await supabase
        .from('diseases')
        .select('*');

      if (diseasesError) throw diseasesError;

      // Calculate analytics
      const analytics = {
        totalCases: cases?.length || 0,
        activeCases: cases?.filter(c => c.outcome === 'active').length || 0,
        recoveredCases: cases?.filter(c => c.outcome === 'recovered').length || 0,
        deceasedCases: cases?.filter(c => c.outcome === 'deceased').length || 0,
        confirmedCases: cases?.filter(c => c.confirmed).length || 0,
        severityBreakdown: {
          mild: cases?.filter(c => c.severity === 'mild').length || 0,
          moderate: cases?.filter(c => c.severity === 'moderate').length || 0,
          severe: cases?.filter(c => c.severity === 'severe').length || 0,
          critical: cases?.filter(c => c.severity === 'critical').length || 0,
        },
        diseaseBreakdown: diseases?.map(disease => ({
          name: disease.name,
          count: cases?.filter(c => c.disease_id === disease.id).length || 0,
        })) || [],
        timestamp: new Date().toISOString(),
      };

      console.log('Generated analytics:', analytics);

      return new Response(
        JSON.stringify(analytics),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate dummy data for testing
    if (type === 'generate_dummy') {
      // This would generate dummy case data
      // For now, just return a success message
      return new Response(
        JSON.stringify({ 
          message: 'Dummy data generation endpoint ready',
          note: 'Connect this to create test cases for demo purposes'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid type parameter' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analytics function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
