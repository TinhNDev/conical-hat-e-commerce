# Database Schema

This project now has a backend-oriented relational data model for authentication, permissions, catalog data, customers, carts, orders, reviews, and audit history.

## Main Domains

### Users and auth

- `User`: application account, profile, role, lifecycle status, Stripe customer link
- `RefreshToken`: long-lived login sessions
- `EmailVerificationToken`: email verification workflow
- `PasswordResetToken`: password reset workflow

### Permissions

- `Permission`: reusable permission definitions such as `manage_products` or `manage_orders`
- `RolePermission`: default permissions for each `UserRole`
- `UserPermissionOverride`: per-user permission exceptions

This allows role-based access control plus targeted overrides without hardcoding all access logic in application code.

### Catalog

- `Category`: top-level grouping for products
- `Product`: main sellable product record
- `ProductImage`: ordered image gallery for a product
- `ProductVariant`: price/option-specific sellable variant

Stripe IDs are stored alongside local records so the app can sync with Stripe while still keeping its own product database.

### Customer data

- `Address`: saved shipping or billing addresses for a user
- `WishlistItem`: user-to-product saved items
- `CartItem`: persistent cart rows per user

### Orders

- `Order`: checkout-level record, payment state, fulfillment state, address snapshots, totals
- `OrderItem`: immutable line items attached to an order

`OrderItem` stores product snapshots such as name, SKU, image, and unit price so historical orders remain correct even if product data changes later.

### Reviews and audit

- `Review`: one review per user per product, with moderation status
- `AuditLog`: admin and system action history for sensitive operations

## Relationship Summary

- One `User` has many `Address`, `Order`, `Review`, `WishlistItem`, `CartItem`, `RefreshToken`, `EmailVerificationToken`, `PasswordResetToken`, `UserPermissionOverride`, and `AuditLog`
- One `Category` has many `Product`
- One `Product` belongs to one optional `Category`
- One `Product` has many `ProductImage`, `ProductVariant`, `Review`, `WishlistItem`, `CartItem`, and `OrderItem`
- One `Order` has many `OrderItem`
- One `Permission` has many `RolePermission` and `UserPermissionOverride`

## Core Design Decisions

- Keep local product tables even if Stripe remains the payment/catalog integration
- Store Stripe IDs on local entities instead of using Stripe as the only source of truth
- Use order snapshots for historical accuracy
- Separate role defaults from user overrides for permission flexibility
- Keep audit logs for admin-side changes
- Track both `paymentStatus` and `fulfillmentStatus` because they change independently

## Suggested Implementation Order

1. Run a Prisma migration for the new tables
2. Seed `Permission` and `RolePermission`
3. Move storefront product reads behind Prisma, with optional Stripe sync jobs
4. Persist cart, wishlist, and orders in the database
5. Move admin product/customer views from Stripe-only records to local database records

## Migration Note

After reviewing the schema, generate and apply a migration:

```bash
npm run db:generate
npm run db:migrate -- --name expand_store_schema
```

For production:

```bash
npm run db:deploy
```
