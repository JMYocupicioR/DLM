-- Official Expediente-DLM app URL (domain migration from Netlify preview)
UPDATE public.products
SET app_url = 'https://expediente-dlm.com/'
WHERE slug = 'expediente-dlm';
