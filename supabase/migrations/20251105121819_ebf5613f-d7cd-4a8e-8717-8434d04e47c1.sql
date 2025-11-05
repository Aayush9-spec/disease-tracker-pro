-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'officer', 'viewer');
CREATE TYPE public.sex AS ENUM ('M', 'F', 'O');
CREATE TYPE public.severity AS ENUM ('mild', 'moderate', 'severe');
CREATE TYPE public.outcome AS ENUM ('active', 'recovered', 'deceased');
CREATE TYPE public.source AS ENUM ('clinic', 'camp', 'survey', 'self_report');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  region_scope TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Regions table
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT,
  parent_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- Locations table
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region_id UUID REFERENCES public.regions(id) ON DELETE CASCADE NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Households table
CREATE TABLE public.households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  household_code TEXT UNIQUE NOT NULL,
  members_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

-- Persons table
CREATE TABLE public.persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  year_of_birth INTEGER,
  sex sex,
  consent BOOLEAN DEFAULT false,
  phone_enc TEXT,
  email_enc TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;

-- Diseases table
CREATE TABLE public.diseases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  icd_code TEXT,
  vector_borne BOOLEAN DEFAULT false,
  default_symptoms JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;

-- Cases table
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  disease_id UUID REFERENCES public.diseases(id) ON DELETE CASCADE NOT NULL,
  onset_date TIMESTAMPTZ,
  report_date TIMESTAMPTZ NOT NULL,
  severity severity,
  symptoms JSONB,
  temperature_c DOUBLE PRECISION,
  dehydration_level INTEGER,
  lab JSONB,
  confirmed BOOLEAN DEFAULT false,
  outcome outcome DEFAULT 'active',
  notes TEXT,
  source source DEFAULT 'survey',
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  reporter_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_cases_disease_date ON public.cases(disease_id, report_date);
CREATE INDEX idx_cases_location ON public.cases(lat, lon);

-- Case audit table
CREATE TABLE public.case_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  changed_by UUID REFERENCES auth.users(id) NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diff JSONB
);

ALTER TABLE public.case_audits ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- User roles: admin can manage
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Regions: officers and admins can manage
CREATE POLICY "Officers can view regions" ON public.regions
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'officer') OR 
    public.has_role(auth.uid(), 'viewer')
  );

CREATE POLICY "Admins can manage regions" ON public.regions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Locations
CREATE POLICY "Officers can view locations" ON public.locations
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'officer') OR 
    public.has_role(auth.uid(), 'viewer')
  );

CREATE POLICY "Officers can manage locations" ON public.locations
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'officer')
  );

-- Households
CREATE POLICY "Officers can view households" ON public.households
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'officer') OR 
    public.has_role(auth.uid(), 'viewer')
  );

CREATE POLICY "Officers can manage households" ON public.households
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'officer')
  );

-- Persons
CREATE POLICY "Officers can view persons" ON public.persons
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'officer') OR 
    public.has_role(auth.uid(), 'viewer')
  );

CREATE POLICY "Officers can manage persons" ON public.persons
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'officer')
  );

-- Diseases
CREATE POLICY "Everyone can view diseases" ON public.diseases
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'officer') OR 
    public.has_role(auth.uid(), 'viewer')
  );

CREATE POLICY "Admins can manage diseases" ON public.diseases
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Cases
CREATE POLICY "Everyone can view cases" ON public.cases
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'officer') OR 
    public.has_role(auth.uid(), 'viewer')
  );

CREATE POLICY "Officers can create cases" ON public.cases
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'officer')
  );

CREATE POLICY "Officers can update cases" ON public.cases
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'officer')
  );

-- Case audits
CREATE POLICY "Everyone can view audits" ON public.case_audits
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'officer') OR 
    public.has_role(auth.uid(), 'viewer')
  );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON public.regions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON public.persons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diseases_updated_at BEFORE UPDATE ON public.diseases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email
  );
  
  -- Assign default viewer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();