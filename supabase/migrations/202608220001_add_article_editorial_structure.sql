-- Structured editorial metadata extracted from Markdown articles.
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS table_of_contents jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS word_count integer NOT NULL DEFAULT 0;
