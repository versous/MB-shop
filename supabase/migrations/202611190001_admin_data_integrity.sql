CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;
ALTER TABLE public.store_settings ALTER COLUMN whatsapp_number SET DEFAULT '';
UPDATE public.store_settings
SET whatsapp_number = ''
WHERE whatsapp_number = '+2250700000000';

DELETE FROM public.analytics_events
WHERE visitor_id IN ('vis-101', 'vis-102', 'vis-103', 'vis-104', 'vis-105', 'vis-106');

DELETE FROM public.orders AS orders
USING (
    VALUES
        ('CMD-2411-1001', 'Kouamé Jean-Marc'),
        ('CMD-2411-1002', 'Aïcha Koné'),
        ('CMD-2411-1003', 'Marc-André Bamba'),
        ('CMD-2411-1004', 'Yasmine Touré'),
        ('CMD-2411-1005', 'Éric Diallo')
) AS demo_orders(order_number, customer_name)
WHERE orders.order_number = demo_orders.order_number
  AND orders.customer_name = demo_orders.customer_name;

SELECT setval(
    'public.order_number_seq',
    GREATEST(
        COALESCE(
            (SELECT MAX(substring(order_number FROM '([0-9]+)$')::BIGINT)
             FROM public.orders
             WHERE order_number ~ '[0-9]+$'),
            0
        ) + 1,
        1
    ),
    false
);

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'CMD-' || TO_CHAR(NOW(), 'YYMM') || '-' ||
            LPAD(NEXTVAL('public.order_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    table_name TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        FOREACH table_name IN ARRAY ARRAY['products', 'orders', 'store_settings', 'analytics_events']
        LOOP
            IF NOT EXISTS (
                SELECT 1
                FROM pg_publication_tables
                WHERE pubname = 'supabase_realtime'
                  AND schemaname = 'public'
                  AND tablename = table_name
            ) THEN
                EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
            END IF;
        END LOOP;
    END IF;
END;
$$;
