# Security Setup Guide - Oak.io

This document contains instructions for configuring security features that require
manual setup in external dashboards (Supabase, Vercel).

---

## 1. Vercel Rate Limiting

1. Go to your **Vercel Project Dashboard** > **Settings** > **Firewall**
2. Add a **Rate Limiting Rule**:
   - Name: `General Rate Limit`
   - Condition: All requests
   - Rate Limit: `100 requests per 60 seconds per IP`
   - Action: `Block` (or `Challenge`)
3. Save and deploy

---

## 2. Supabase Rate Limiting

1. Go to **Supabase Dashboard** > **Settings** > **API**
2. Review the default rate limits
3. Recommended settings:
   - Auth endpoints: 30 requests/hour per IP
   - REST API: 1000 requests/hour per authenticated user

---

## 3. Supabase RLS & Database Security

Run the SQL migration file to set up all RLS policies, CHECK constraints, and triggers:

1. Go to **Supabase Dashboard** > **SQL Editor**
2. Open and run the file: `supabase/migrations/001_security_rls_and_constraints.sql`
3. Verify the output shows RLS enabled and policies created for all tables

---

## 4. Session Timeout

1. Go to **Supabase Dashboard** > **Auth** > **Settings**
2. Configure JWT expiry: `3600` seconds (1 hour)
3. Refresh tokens are handled automatically by `@supabase/supabase-js`

---

## 5. npm Audit

Run regularly:
```bash
npm audit
npm audit fix
```

Consider enabling Dependabot on GitHub:
- Go to **Repository Settings** > **Code security and analysis**
- Enable **Dependabot alerts** and **Dependabot security updates**
