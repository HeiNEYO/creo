-- Étend les types de page pour l’éditeur CRÉO (upsell, webinar, blog, membership).

ALTER TABLE public.pages DROP CONSTRAINT IF EXISTS pages_type_check;

ALTER TABLE public.pages ADD CONSTRAINT pages_type_check CHECK (
  type IN (
    'landing',
    'sales',
    'optin',
    'thankyou',
    'checkout',
    'custom',
    'upsell',
    'webinar',
    'blog',
    'membership'
  )
);
