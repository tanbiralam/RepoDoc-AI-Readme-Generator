-- Payment System Schema for ReadMe Generator
-- This schema defines the database structure for storing payment and subscription information

-- -----------------------------------------------------
-- Table: payments
-- Stores all payment transactions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payment_id TEXT NOT NULL, -- Stripe payment or checkout session ID
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL, -- 'succeeded', 'failed', 'pending', etc.
  payment_method TEXT, -- 'card', 'paypal', etc.
  billing_reason TEXT, -- 'subscription_create', 'subscription_update', etc.
  invoice_id TEXT, -- Reference to Stripe invoice if applicable
  receipt_url TEXT, -- URL to the receipt
  metadata JSONB, -- Additional payment data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_payment_id_idx ON public.payments(payment_id);

-- -----------------------------------------------------
-- Extend profiles table with subscription fields
-- Make sure these columns exist in the profiles table
-- -----------------------------------------------------
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.profiles 
            ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
            ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
            ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
            ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
            ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
            ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS payment_method_id TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
        -- Do nothing, column already exists
    END;
END $$;

-- -----------------------------------------------------
-- Table: subscriptions
-- Detailed subscription information
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL,
  status TEXT NOT NULL, -- 'active', 'canceled', 'incomplete', etc.
  plan_id TEXT NOT NULL, -- 'free', 'pro', 'premium', etc.
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stripe_subscription_id)
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);

-- -----------------------------------------------------
-- Table: subscription_items
-- For tracking multiple subscription items if needed
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  stripe_subscription_item_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stripe_subscription_item_id)
);

-- -----------------------------------------------------
-- Table: invoices
-- Stores invoice information
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  status TEXT NOT NULL, -- 'draft', 'open', 'paid', 'uncollectible', 'void'
  amount_due DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  invoice_pdf TEXT, -- URL to the invoice PDF
  hosted_invoice_url TEXT, -- URL to the hosted invoice
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stripe_invoice_id)
);

CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON public.invoices(user_id);

-- -----------------------------------------------------
-- Table: pricing_plans
-- Defines the available pricing plans
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id TEXT PRIMARY KEY, -- 'free', 'pro', 'premium', etc.
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  interval TEXT NOT NULL, -- 'month', 'year', etc.
  interval_count INTEGER DEFAULT 1,
  stripe_price_id TEXT,
  features JSONB, -- JSON array of features included in this plan
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pricing plans
INSERT INTO public.pricing_plans (id, name, description, amount, currency, interval, features, stripe_price_id)
VALUES 
  ('free', 'Free', 'Basic plan with limited features', 0, 'usd', 'month', 
   '["5 ReadMe Generations per month", "Basic Templates", "GitHub Integration"]', 
   NULL),
  ('pro', 'Pro', 'Professional plan with advanced features', 9.99, 'usd', 'month', 
   '["Unlimited ReadMe Generations", "All Templates", "Priority Support", "Advanced GitHub Integration"]', 
   'price_pro_monthly')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------
-- Row Level Security Policies
-- -----------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Users can view their own payments"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Subscription items policies
CREATE POLICY "Users can view their own subscription items"
  ON public.subscription_items
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.id = subscription_id AND s.user_id = auth.uid()
  ));

-- Invoices policies
CREATE POLICY "Users can view their own invoices"
  ON public.invoices
  FOR SELECT
  USING (auth.uid() = user_id);

-- Pricing plans policies (anyone can view)
CREATE POLICY "Anyone can view pricing plans"
  ON public.pricing_plans
  FOR SELECT
  USING (true);

-- -----------------------------------------------------
-- Functions
-- -----------------------------------------------------

-- Function to update subscription status
CREATE OR REPLACE FUNCTION public.update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's profile with the subscription tier
  UPDATE public.profiles
  SET 
    subscription_tier = NEW.plan_id,
    subscription_status = NEW.status,
    subscription_start_date = NEW.current_period_start,
    subscription_end_date = NEW.current_period_end,
    subscription_cancel_at_period_end = NEW.cancel_at_period_end,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update profile when subscription changes
DROP TRIGGER IF EXISTS on_subscription_updated ON public.subscriptions;
CREATE TRIGGER on_subscription_updated
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_subscription_status(); 