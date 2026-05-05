-- =============================================
-- FileConvert.uz - Supabase Database Schema
-- Supabase SQL Editorga ko'chiring va ishga tushiring
-- =============================================

-- 1. Foydalanuvchilar jadvali (Supabase auth bilan)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  daily_conversions_used INTEGER DEFAULT 0,
  last_conversion_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. To'lovlar jadvali
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 29900,
  currency TEXT DEFAULT 'UZS',
  card_last4 TEXT,
  card_holder TEXT,
  check_image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Konvertatsiyalar tarixi
CREATE TABLE public.conversions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_email TEXT,
  original_filename TEXT NOT NULL,
  original_format TEXT NOT NULL,
  target_format TEXT NOT NULL,
  file_size BIGINT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  download_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Sozlamalar jadvali (admin uchun)
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default sozlamalar
INSERT INTO public.settings (key, value) VALUES
  ('premium_price', '29900'),
  ('premium_duration_days', '30'),
  ('payment_card_number', '8600 1234 5678 9012'),
  ('payment_card_holder', 'Karimov Kamron'),
  ('free_daily_limit', '2'),
  ('site_name', 'FileConvert.uz');

-- 5. Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Conversions policies
CREATE POLICY "Users can view own conversions" ON public.conversions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversions" ON public.conversions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Settings public read
CREATE POLICY "Anyone can read settings" ON public.settings
  FOR SELECT USING (true);

-- 6. Trigger: yangi user yaratilganda profile ham yaratilsin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Trigger: updated_at avtomatik yangilansin
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 8. Service role uchun barcha ruxsatlar (API ishlatadi)
CREATE POLICY "Service role full access profiles" ON public.profiles
  FOR ALL USING (true);
CREATE POLICY "Service role full access payments" ON public.payments
  FOR ALL USING (true);
CREATE POLICY "Service role full access conversions" ON public.conversions
  FOR ALL USING (true);
CREATE POLICY "Service role full access settings" ON public.settings
  FOR ALL USING (true);
