-- ============================================================
-- License Change Request Pipeline + Contract Terms
-- Migration: 00008_license_change_requests_and_contracts
-- ============================================================

-- Request status lifecycle: pending → approved → applied OR pending → rejected
CREATE TYPE public.license_change_status AS ENUM (
  'pending',
  'approved',
  'applied',
  'rejected',
  'cancelled'
);

CREATE TYPE public.billing_term AS ENUM (
  'monthly',
  'prepaid',
  'contract_allowance'
);

-- License Change Requests
CREATE TABLE public.license_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  target_user_id UUID NOT NULL REFERENCES public.profiles(id),
  current_license_type public.license_type NOT NULL,
  requested_license_type public.license_type NOT NULL,
  status public.license_change_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  billing_term public.billing_term NOT NULL DEFAULT 'monthly',
  invoice_reference TEXT,
  requires_prepayment BOOLEAN DEFAULT FALSE,
  payment_received BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ,
  request_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization Contract Terms
CREATE TABLE public.organization_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  contract_name TEXT NOT NULL DEFAULT 'Standard Agreement',
  billing_term public.billing_term NOT NULL DEFAULT 'monthly',
  quarterly_change_allowance INT DEFAULT 0,
  contract_start DATE,
  contract_end DATE,
  requires_prepayment_for_changes BOOLEAN DEFAULT FALSE,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contract Change Usage (quarterly tracking)
CREATE TABLE public.contract_change_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.organization_contracts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  quarter TEXT NOT NULL,
  changes_used INT NOT NULL DEFAULT 0,
  change_request_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contract_id, quarter)
);

-- Indexes
CREATE INDEX idx_lcr_org ON public.license_change_requests(organization_id);
CREATE INDEX idx_lcr_status ON public.license_change_requests(status);
CREATE INDEX idx_lcr_target ON public.license_change_requests(target_user_id);
CREATE INDEX idx_lcr_created ON public.license_change_requests(created_at DESC);
CREATE INDEX idx_contracts_org ON public.organization_contracts(organization_id);
CREATE INDEX idx_change_usage_quarter ON public.contract_change_usage(contract_id, quarter);

-- RLS
ALTER TABLE public.license_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_change_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_admins_view_requests" ON public.license_change_requests
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "org_admins_create_requests" ON public.license_change_requests
  FOR INSERT WITH CHECK (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    AND requested_by = auth.uid()
  );

CREATE POLICY "org_admins_cancel_requests" ON public.license_change_requests
  FOR UPDATE USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    AND status = 'pending'
  );

CREATE POLICY "org_members_view_contracts" ON public.organization_contracts
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "org_members_view_usage" ON public.contract_change_usage
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lcr_updated_at
  BEFORE UPDATE ON public.license_change_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.organization_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_change_usage_updated_at
  BEFORE UPDATE ON public.contract_change_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
