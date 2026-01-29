-- Migration: Add student features tables (notifications, website visits, support tickets)
-- Date: 2025-01-XX
-- Description: Creates tables for notifications, website visits tracking, and support tickets

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT false,
    metadata JSONB, -- Additional data like product_id, transaction_id, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_student_id ON notifications(student_id);
CREATE INDEX idx_notifications_read ON notifications(student_id, read) WHERE read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Website visits table (tracks when students visit vendor websites through marketplace)
CREATE TABLE IF NOT EXISTS website_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    product_name VARCHAR(255),
    vendor_name VARCHAR(255),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_website_visits_student_id ON website_visits(student_id);
CREATE INDEX idx_website_visits_product_id ON website_visits(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_website_visits_vendor_id ON website_visits(vendor_id);
CREATE INDEX idx_website_visits_visited_at ON website_visits(visited_at DESC);
CREATE INDEX idx_website_visits_student_visited ON website_visits(student_id, visited_at DESC);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'technical', 'billing', 'account')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    admin_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_tickets_student_id ON support_tickets(student_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_student_status ON support_tickets(student_id, status);

-- Support ticket responses (for conversation thread)
CREATE TABLE IF NOT EXISTS support_ticket_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Can be student or admin
    user_role VARCHAR(20) NOT NULL CHECK (user_role IN ('student', 'admin')),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- Internal notes visible only to admins
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_ticket_responses_ticket_id ON support_ticket_responses(ticket_id);
CREATE INDEX idx_support_ticket_responses_created_at ON support_ticket_responses(created_at DESC);

-- Trigger to update support_tickets updated_at
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
