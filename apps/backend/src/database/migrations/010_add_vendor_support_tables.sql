-- Migration: Add vendor support tickets tables
-- Description: Creates tables for vendor support tickets and responses

-- Vendor support tickets table
CREATE TABLE IF NOT EXISTS vendor_support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'technical', 'billing', 'account', 'integration', 'product')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    admin_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_support_tickets_vendor_id ON vendor_support_tickets(vendor_id);
CREATE INDEX idx_vendor_support_tickets_status ON vendor_support_tickets(status);
CREATE INDEX idx_vendor_support_tickets_category ON vendor_support_tickets(category);
CREATE INDEX idx_vendor_support_tickets_created_at ON vendor_support_tickets(created_at DESC);
CREATE INDEX idx_vendor_support_tickets_vendor_status ON vendor_support_tickets(vendor_id, status);

-- Vendor support ticket responses (for conversation thread)
CREATE TABLE IF NOT EXISTS vendor_support_ticket_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES vendor_support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Can be vendor or admin
    user_role VARCHAR(20) NOT NULL CHECK (user_role IN ('vendor', 'admin')),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- Internal notes visible only to admins
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_support_ticket_responses_ticket_id ON vendor_support_ticket_responses(ticket_id);
CREATE INDEX idx_vendor_support_ticket_responses_created_at ON vendor_support_ticket_responses(created_at DESC);

-- Trigger to update vendor_support_tickets updated_at
CREATE TRIGGER update_vendor_support_tickets_updated_at BEFORE UPDATE ON vendor_support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
