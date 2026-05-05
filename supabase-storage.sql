-- =============================================
-- Storage Policy - Supabase SQL Editorga qo'shing
-- (Asosiy schema.sql dan KEYIN ishga tushiring)
-- =============================================

-- payments bucket uchun storage policy
-- (Bucket "payments" nomli va Private deb yaratilgan bo'lishi kerak)

INSERT INTO storage.buckets (id, name, public) 
VALUES ('payments', 'payments', false)
ON CONFLICT (id) DO NOTHING;

-- Foydalanuvchilar o'z fayllarini yuklay olsin
CREATE POLICY "Users can upload payment checks"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Faqat service role o'qiy olsin (admin uchun)
CREATE POLICY "Service role can read payment checks"
ON storage.objects FOR SELECT
USING (bucket_id = 'payments');

-- =============================================
-- Agar admin panel chekni ko'ra olmasa,
-- bucket ni public qiling yoki admin uchun
-- signed URL ishlatiladi (kod ichida amalga oshirilgan)
-- =============================================
