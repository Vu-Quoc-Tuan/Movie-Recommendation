CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    email TEXT,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access users" ON public.users;

CREATE POLICY "Service role full access users" ON public.users FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Public read users" ON public.users;

CREATE POLICY "Public read users" ON public.users FOR SELECT TO public USING (true);

CREATE TABLE IF NOT EXISTS public.user_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_history DROP CONSTRAINT IF EXISTS user_history_user_id_fkey;

ALTER TABLE public.user_history 
ADD CONSTRAINT user_history_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access history" ON public.user_history;

CREATE POLICY "Service role full access history" ON public.user_history FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Public read history" ON public.user_history;

CREATE POLICY "Public read history" ON public.user_history FOR SELECT TO public USING (true);
