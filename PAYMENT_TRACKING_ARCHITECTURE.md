# Payment Tracking Architecture for Vendor Websites

## Overview

This document outlines the architecture for tracking payments that occur on vendor websites when using the Awoof verification widget. This ensures Awoof can track transactions and collect commissions even when payments are processed on vendor sites.

---

## Two Payment Scenarios

### Scenario A: Payment on Awoof Platform (Current)
- Student purchases on Awoof marketplace
- Payment processed via Paystack split payment
- Commission automatically deducted
- Transaction tracked in Awoof database

### Scenario B: Payment on Vendor Website (New Requirement)
- Student visits vendor website
- Awoof widget verifies student (returns verification token)
- Vendor applies student discount
- Vendor processes payment on their own Paystack account
- **Challenge:** Awoof needs to track this payment to collect commission

---

## Recommended Solution: Hybrid Approach

### Option 1: Paystack Split Payment (Recommended - Most Secure)

**How it works:**
1. Vendor configures Paystack with Awoof as a subaccount
2. When vendor processes payment, Paystack automatically splits:
   - Vendor receives: `amount - commission`
   - Awoof receives: `commission`
3. Paystack webhook notifies Awoof of successful payment
4. Awoof records transaction automatically

**Pros:**
- ✅ Automatic commission collection
- ✅ No manual reporting needed
- ✅ Fraud-proof (Paystack handles split)
- ✅ Real-time transaction tracking
- ✅ No vendor code changes needed (just Paystack config)

**Cons:**
- ⚠️ Requires Paystack subaccount setup
- ⚠️ Vendor must use Paystack

**Implementation:**
- Vendor sets up Paystack subaccount with Awoof commission rate
- Awoof receives Paystack webhooks for all vendor transactions
- Webhook handler validates and records transactions

---

### Option 2: Transaction Reporting API (Fallback - For Non-Paystack Vendors)

**How it works:**
1. Widget verifies student and returns verification token
2. Vendor processes payment (any payment gateway)
3. Vendor calls Awoof API to report transaction
4. Awoof validates:
   - Verification token (student, expiry, vendor)
   - Payment reference (if Paystack, verify with Paystack API)
   - Duplicate check
5. Awoof records transaction and calculates commission

**Pros:**
- ✅ Works with any payment gateway
- ✅ Vendor has control
- ✅ Flexible integration

**Cons:**
- ⚠️ Requires vendor to implement API call
- ⚠️ Potential for fraud (vendor could report fake payments)
- ⚠️ Requires payment validation logic

**Implementation:**
- API endpoint: `POST /api/vendors/transactions/report`
- Requires verification token, payment reference, amount, product ID
- Validates token, verifies payment, records transaction

---

## Recommended Architecture: Option 1 + Option 2

**Primary:** Use Paystack Split Payment for vendors using Paystack
**Fallback:** Use Transaction Reporting API for vendors using other gateways

---

## Database Schema Updates Needed

### Add to `transactions` table:
```sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS 
    verification_token VARCHAR(500),
    payment_source VARCHAR(50) DEFAULT 'awoof' CHECK (payment_source IN ('awoof', 'vendor_paystack', 'vendor_other')),
    vendor_payment_reference VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE;
```

### New table: `verification_tokens` (for widget verification)
```sql
CREATE TABLE IF NOT EXISTS verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    product_id UUID REFERENCES products(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_verification_tokens_student_vendor ON verification_tokens(student_id, vendor_id);
CREATE INDEX idx_verification_tokens_expires_at ON verification_tokens(expires_at);
```

---

## API Endpoints Needed

### 1. Transaction Reporting Endpoint (Option 2)
```
POST /api/vendors/transactions/report
Body: {
  verificationToken: string,
  paymentReference: string,
  amount: number,
  productId: string,
  paymentGateway?: 'paystack' | 'other'
}
```

### 2. Paystack Webhook Handler (Option 1)
```
POST /api/webhooks/paystack/vendor-payment
Headers: {
  x-paystack-signature: string
}
Body: Paystack webhook payload
```

### 3. Verification Token Validation
```
POST /api/vendors/verify-token
Body: {
  token: string,
  productId: string
}
```

---

## Security & Fraud Prevention

### For Transaction Reporting API:
1. **Verification Token Validation**
   - Check token exists and not expired
   - Verify token belongs to vendor
   - Verify token not already used
   - Check student is verified

2. **Payment Validation**
   - If Paystack: Verify payment reference with Paystack API
   - Check payment amount matches product price
   - Verify payment status is "success"
   - Check for duplicate payment references

3. **Rate Limiting**
   - Limit transaction reports per vendor
   - Prevent spam/fraud attempts

4. **HMAC Signature**
   - Require HMAC signature for webhook calls
   - Validate signature before processing

### For Paystack Split Payment:
1. **Webhook Signature Validation**
   - Validate Paystack webhook signature
   - Prevent replay attacks

2. **Idempotency**
   - Check if transaction already recorded
   - Prevent duplicate processing

---

## Implementation Priority

### Phase 1: Transaction Reporting API (Quick Win)
- Implement transaction reporting endpoint
- Add verification token system
- Basic validation and fraud prevention
- Works for all payment gateways

### Phase 2: Paystack Split Payment (Recommended)
- Set up Paystack subaccount system
- Implement webhook handler
- Automatic commission collection
- More secure and automated

### Phase 3: Enhanced Validation
- Payment gateway integrations (beyond Paystack)
- Advanced fraud detection
- Reconciliation system
- Dispute handling

---

## Vendor Integration Flow

### With Widget + Transaction Reporting:

1. **Student visits vendor website**
2. **Vendor calls widget:** `Awoof.verify()`
3. **Widget verifies student** → Returns verification token
4. **Vendor applies discount** based on token
5. **Student completes payment** on vendor site
6. **Vendor reports transaction:**
   ```javascript
   fetch('https://api.awoof.com/api/vendors/transactions/report', {
     method: 'POST',
     headers: {
       'Authorization': 'Bearer VENDOR_API_KEY',
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       verificationToken: token,
       paymentReference: paystackRef,
       amount: 15000,
       productId: 'product-uuid',
       paymentGateway: 'paystack'
     })
   })
   ```
7. **Awoof validates and records** transaction
8. **Commission calculated and tracked**

---

## Next Steps

1. **Update database schema** (add verification_tokens table)
2. **Create transaction reporting endpoint**
3. **Implement verification token system** (for widget)
4. **Add Paystack payment validation**
5. **Create webhook handler** for Paystack split payments
6. **Update payment controller** to handle both scenarios
7. **Add fraud prevention measures**
8. **Create vendor integration documentation**

---

## Questions to Consider

1. **Commission Collection:**
   - How to collect commission if vendor uses other payment gateways?
   - Manual invoicing vs automatic collection?

2. **Verification Token Expiry:**
   - How long should tokens be valid? (Recommend: 15-30 minutes)
   - Should tokens be single-use or reusable?

3. **Payment Validation:**
   - For non-Paystack vendors, how to verify payments?
   - Require payment proof/receipt upload?

4. **Dispute Resolution:**
   - What if vendor reports payment but student disputes?
   - How to handle refunds?

