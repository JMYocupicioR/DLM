-- Migration: Link subscription_plans to Stripe Products/Prices (test mode)
-- Stripe test account: acct_1TIONJDi1QBAI60c (Entorno de prueba de DeepLux.org)
-- IMPORTANT: When switching to live mode, run a similar UPDATE with the live price IDs.

UPDATE public.subscription_plans SET
  stripe_price_id        = 'price_1TNkWzDi1QBAI60cgJuoK2oK',
  stripe_price_id_annual = 'price_1TNkX1Di1QBAI60cK2Ifr6Zf'
WHERE slug = 'profesional-basico';

UPDATE public.subscription_plans SET
  stripe_price_id        = 'price_1TNkX2Di1QBAI60cnlHJzMuH',
  stripe_price_id_annual = 'price_1TNkX3Di1QBAI60civByyIIB'
WHERE slug = 'suite-medica';

UPDATE public.subscription_plans SET
  stripe_price_id        = 'price_1TNkX4Di1QBAI60cB9PteBZc',
  stripe_price_id_annual = 'price_1TNkX5Di1QBAI60c0pDZmpO2'
WHERE slug = 'investigador';

UPDATE public.subscription_plans SET
  stripe_price_id        = 'price_1TNkX6Di1QBAI60czxYkZoK3',
  stripe_price_id_annual = 'price_1TNkX7Di1QBAI60cEX3j3ODX'
WHERE slug = 'clinica-starter';

UPDATE public.subscription_plans SET
  stripe_price_id        = 'price_1TNkX9Di1QBAI60cR74Huymy',
  stripe_price_id_annual = 'price_1TNkXADi1QBAI60cu7b1FaWz'
WHERE slug = 'clinica-pro';

UPDATE public.subscription_plans SET
  stripe_price_id        = 'price_1TNkXBDi1QBAI60cEuDnvroq',
  stripe_price_id_annual = 'price_1TNkXDDi1QBAI60ce4eehy6g'
WHERE slug = 'empresa-basico';

UPDATE public.subscription_plans SET
  stripe_price_id        = 'price_1TNkXEDi1QBAI60cE3KLCVP4',
  stripe_price_id_annual = 'price_1TNkXEDi1QBAI60cbExzWlaM'
WHERE slug = 'empresa-pro';
