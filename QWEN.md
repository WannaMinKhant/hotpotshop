# B2M - Hotpot Restaurant Management System

## Project Overview

B2M (also referenced as `hotpotshop`) is a **hotpot restaurant management dashboard** built with **React 19**, **TypeScript**, and **Vite**. It provides a comprehensive single-page application for managing restaurant operations including:

- **Dashboard Home** — Overview stats and key metrics
- **Cashier/POS** — Point-of-sale functionality
- **Kitchen Management** — Order preparation tracking
- **Orders** — Order management and tracking
- **Stock Control** — Inventory and reorder management
- **Customers** — Customer relationship management with tier system
- **Staff** — Employee management with role tracking
- **Reports** — Business analytics and reporting

### Architecture

The application follows a **modular component-based architecture** with:

- **React Router v6** for URL-based navigation with browser history support
- **Zustand** for state management (separate stores for products, orders, customers, staff, UI, auth, and toast notifications)
- **Supabase** as the backend/database layer with authentication
- **Tailwind CSS v4** for styling
- **TypeScript** for type safety with shared interfaces in `src/types/`

### Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite 8 |
| Routing | React Router v6 |
| Styling | Tailwind CSS 4 |
| State Management | Zustand 5 |
| Backend/Database | Supabase |
| Authentication | Supabase Auth (email/password) |
| Linting | ESLint 9 (with react-hooks, react-refresh plugins) |

## Project Structure

```
src/
├── Components/        # Feature components (Sidebar, DashboardHome, CashierPage, ToastContainer, etc.)
├── Pages/             # Page-level components (DashboardPage, LoginPage)
├── stores/            # Zustand stores (productsStore, orderStore, customerStore, staffStore, uiStore, authStore, toastStore)
├── types/             # Shared TypeScript interfaces (Staff, Product, Order, Customer, OrderItem)
├── lib/               # Supabase client and database schema
├── assets/            # Static assets
├── App.tsx            # Root application component (routing + auth setup)
├── App.css            # App-level styles
├── index.css          # Global styles (Tailwind + animations)
└── main.tsx           # Application entry point
```

## Building and Running

### Prerequisites

- Node.js (latest LTS recommended)
- npm or other package manager

### Commands

```bash
# Install dependencies
npm install

# Start development server (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

### Environment Variables

Create a `.env` file in the project root with the following variables:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-anon-key
```

## Supabase Setup

### Database Schema

Run `src/lib/supabase-schema.sql` in your Supabase SQL editor to create all tables:

- **staff** — Employee records with role and status tracking
- **products** — Inventory items with stock quantities, reorder points, pricing, unit conversion support
- **tables** — Restaurant tables with table_number, seats, and is_active status
- **categories** — Product categories with parent/subcategory support, emoji, and sort_order
- **stock_movements** — Purchase/sale/adjustment/waste/return tracking with cost records
- **orders** — Customer orders with type, status, and financial totals
- **order_items** — Line items belonging to orders (CASCADE delete on order removal)
- **recipes** — Menu items/dishes
- **recipe_ingredients** — Links recipes to products with quantities
- **customers** — Customer profiles with loyalty tier and spending history
- **user_profiles** — Auth users linked to app roles

All tables use `BIGINT GENERATED ALWAYS AS IDENTITY` for primary keys and `TIMESTAMPTZ DEFAULT NOW()` for timestamps.

After creating tables, enable Realtime for all tables in Database → Replication.

### Authentication

Supabase Auth (email/password) is configured. Users can sign up or sign in via the `/login` page. Session persistence is handled automatically via `supabase.auth.onAuthStateChange`.

## Development Conventions

- **TypeScript** is used throughout with strict typing (`verbatimModuleSyntax` enabled — use `type FormEvent` for type-only imports)
- **Zustand stores** manage client-side state with dedicated stores per domain; all Supabase operations set `error` state on failure using `e: unknown` + `instanceof Error`
- **Supabase** handles persistent data storage; schema is defined in `src/lib/supabase-schema.sql`
- **Tailwind CSS** is used for all styling — avoid inline styles where possible
- **Component naming**: PascalCase for components (e.g., `DashboardPage.tsx`, `StatCard.tsx`)
- **Store naming**: camelCase with `Store` suffix (e.g., `productsStore.ts`, `authStore.ts`)
- **Type definitions** are centralized in `src/types/index.ts` with enum type aliases (`OrderStatusEnum`, `RoleEnum`, `ProductCategory`, etc.)
- **Toast notifications** via `toastStore` — use `addToast(message, type)` instead of `alert()`
- **Form validation** — validate in modals before submitting; show inline error messages
- **React Router** — navigation via `useNavigate()`; current path extracted in `DashboardPage` for sidebar sync

## Key Data Models

### Staff
- Roles: `manager`, `chef`, `waiter`, `cashier`, `cleaner`
- Status: `on-duty`, `off-duty`, `break`

### Product
- Categories: `bases`, `meats`, `seafood`, `veggies`, `noodles`, `drinks`, `sauces`
- Tracks stock quantity, reorder points, price, and cost price

### Order
- Types: `dine-in`, `takeout`, `delivery`
- Status flow: `pending` → `preparing` → `ready` → `served` → `completed` / `cancelled`
- Contains order items with quantity, unit price, and notes

### Customer
- Tiers: `bronze`, `silver`, `gold`, `platinum`
- Tracks total orders, total spent, and last visit

### Stock Movement
- Types: `purchase`, `sale`, `adjustment`, `waste`, `return`
- Tracks quantity, unit, cost per unit, total cost, reference, and notes
- Auto-updates product stock on create

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | LoginPage | Email/password authentication |
| `/dashboard` | DashboardHome | Overview stats, recent orders, popular items |
| `/cashier` | CashierPage | POS system — add products to cart, process payments |
| `/kitchen` | KitchenPage | Kanban board: pending → cooking → ready → delivered |
| `/orders` | OrdersPage | Full order management with status transitions + payment + receipt |
| `/stock` | StockControlPage | Product CRUD with inline stock editing |
| `/recipes` | RecipesPage | Recipe CRUD with ingredient management |
| `/customers` | CustomersPage | Customer CRUD with loyalty tiers |
| `/staff` | StaffPage | Staff CRUD with roles and duty status |
| `/reports` | ReportsPage | Analytics with period filters and revenue charts |
| `/users` | UsersPage | User account management with role assignment |
| `/admin` | AdminPage | Dynamic table and category management |

## Stores

| Store | Purpose |
|-------|---------|
| `productsStore` | Product CRUD + search + stock/reorder point updates (Supabase) |
| `orderStore` | Order CRUD + order_items management; generates unique `ORD-YYYYMMDD-XXX` order numbers; auto-decrements product stock on sale |
| `customerStore` | Customer CRUD (Supabase) |
| `staffStore` | Staff CRUD (Supabase) |
| `stockMovementStore` | Stock movement tracking (purchase/sale/adjustment/waste/return); auto-updates product stock |
| `recipeStore` | Recipe CRUD with ingredient management; deducts stock on order |
| `categoryStore` | Product category CRUD with parent/subcategory support |
| `tableStore` | Restaurant table CRUD with seat count |
| `userManagementStore` | User account CRUD (email/password auth) |
| `authStore` | Supabase auth session, user, sign out |
| `toastStore` | Toast notifications (success/error/warning/info, auto-dismiss) |
| `themeStore` | Dark/light theme toggle with localStorage persistence |
| `i18nStore` | English/Burmese localization with 80+ translation keys |

## Utilities

| Module | Purpose |
|--------|---------|
| `lib/unit-conversion.ts` | Unit conversion between compatible units (weight: mg/g/kg/lb/oz, volume: ml/L/gal/cup, etc.) |
| `lib/supabase-schema.sql` | Complete database schema with 6 tables + indexes |

## Order Number System

Orders use a server-generated unique number: `ORD-YYYYMMDD-XXX` (e.g., `ORD-20260405-347`). Generated in `orderStore.addOrder()` — consistent across Cashier, Dashboard, Kitchen, Orders, and Reports pages.

## Stock Management

### Stock Movements
Every stock change is tracked in the `stock_movements` table with:
- **Types**: `purchase` (incoming), `sale` (outgoing via orders), `adjustment` (manual set), `waste` (spoilage), `return` (customer return)
- **Auto-update**: Purchase/return adds to stock; sale/waste subtracts; adjustment sets exact quantity
- **Sales auto-track**: When an order is created, each line item creates a `sale` movement and decrements product stock

### Unit Conversion
Products support:
- `unit` — main display unit (e.g., `kg`)
- `base_unit` — smallest unit (e.g., `g`)
- `conversion_factor` — how many base units in 1 main unit (e.g., `1000` for kg→g)
- Compatible unit groups: weight (mg/g/kg/lb/oz), volume (ml/L/gal/cup/floz), length (mm/cm/m/in/ft), count (pcs/pack/box/pouch/block/bunch/dozen)
- Purchase modal shows live conversion preview when entering a different unit

### Emoji Picker
Built-in emoji keyboard organized by restaurant categories (Hotpot Bases, Meats, Seafood, Vegetables, Noodles, Drinks, Sauces, Other). Quick-select row for most common items. Available during product add/edit.

## Completed Features

### Phase 1 — Critical Fixes ✅
- Fixed missing type exports (`OrderStatusEnum`, `RoleEnum`, `StatusEnum`, `ProductCategory`, `CustomerTier`)
- Fixed `StaffPage` — replaced non-existent `StaffMember` with `Staff` type, wired to `staffStore`
- Fixed `CustomersPage` — replaced hardcoded data with `customerStore` integration
- Consolidated duplicate product stores (`productStore.ts` deleted, `productsStore.ts` is single source)
- Fixed all Supabase store error handling — all catch blocks now set `error` state properly
- Fixed all TypeScript errors and ESLint violations
- Disabled overly strict `react-hooks/purity` rule for practical `Date.now()` usage

### Phase 2 — Core Data Integration ✅
- **DashboardHome** — Connected to real data from `orderStore`, `productsStore`, `customerStore`; computes today's revenue, active orders, popular items, avg order value, low stock count
- **KitchenPage** — Fetches real orders from `orderStore`; Kanban columns map to `pending→preparing→ready→served` status flow; auto-computes urgency based on order age; live 30-second "time ago" updates
- **CashierPage** — Products loaded from `productsStore` (Supabase); payment buttons call `orderStore.addOrder()` creating order + order_items; clears cart on success with toast notification

### Phase 3 — Full CRUD & Reports ✅
- **CustomersPage** — Full CRUD with add/edit/delete modals, form validation (required fields, email format), stats bar, search filtering
- **StaffPage** — Full CRUD with add/edit/delete modals, form validation, role/status selectors, stats, role filter
- **ReportsPage** — Period toggle (today/week/month); KPI cards; revenue trend bar chart; top items by revenue; order type breakdown; payment method breakdown; inventory summary

### Phase 4 — Routing, Auth, UX Polish ✅
- **React Router v6** — URL-based navigation; browser history; deep linking; sidebar syncs with URL path
- **Supabase Auth** — Login page with email/password sign-in and sign-up; protected routes; session persistence; sign out button in sidebar
- **Toast Notifications** — `toastStore` with 4 types, slide-in animation, auto-dismiss at 4s, manual dismiss; used in Cashier, Auth, and all CRUD operations
- **Form Validation** — All modals validate required fields and email format with inline error messages

### Phase 5 — Order Consistency, Stock Management, Unit Conversion ✅
- **Order numbers** — Server-generated `ORD-YYYYMMDD-XXX` format; consistent across all pages
- **Auto stock decrement** — Creating an order automatically creates `sale` stock movements and decrements product stock
- **Stock movements table** — New `stock_movements` table tracks purchase/sale/adjustment/waste/return with cost tracking
- **Purchase modal** — Enter quantity, cost per unit, notes; live unit conversion preview; auto-updates product stock
- **Stock history panel** — Per-product movement log with type badges, quantities, costs, and notes
- **Quick stock actions** — One-click purchase/sale/adjustment/waste/return buttons on stock history panel
- **Unit conversion** — `lib/unit-conversion.ts` with weight/volume/length/count groups; compatible unit detection
- **Emoji picker** — Full emoji keyboard with 8 categories (Food, Drinks, Condiments, Symbols, People, Places, Time, Money) and 200+ emojis
- **Extended product model** — Added `base_unit`, `conversion_factor`, `cost_price` fields

### Phase 6 — Dynamic Tables, Categories, Hold Orders ✅
- **Dynamic tables** — `tables` table in Supabase; managed from Admin page; Cashier reads tables from DB
- **Dynamic categories** — `categories` table with parent/subcategory support; managed from Admin page
- **Two-level category navigation** — Cashier shows parent categories; clicking one with subcategories shows sub-row
- **Hold orders** — Cart can be held (saved to localStorage), multiple holds supported, persists across page reloads
- **Admin Page** — Manage tables (add/edit/delete with seat count) and categories (add/edit/delete with subcategories and emoji picker)

### Phase 7 — Reports Charts ✅
- **Recharts 2** integrated for data visualization
- **Revenue Trend Bar Chart** — Responsive `BarChart` with 7-day comparison, hover tooltips, dynamic color intensity
- **Top Selling Items Pie Chart** — Donut chart with legend, hover tooltips showing qty sold, sidebar revenue list
- **All charts** update when switching Today/Week/Month period

### Phase 8 — Localization (EN/MM) + Dark/Light Theme ✅
- **Dark/Light mode** — `themeStore` with localStorage persistence; toggle from sidebar footer (🌙/☀️)
- **Light mode CSS** — `index.css` has `.light` class overrides for all dark theme colors
- **English/Burmese (EN/MM)** — `i18nStore` with 80+ translation keys; toggle from sidebar footer (🇬🇧/🇲🇲)
- **Translated pages** — Sidebar menu items, Reports page title/KPI labels
- **App wrapper** — `<div className={theme}>` applies `dark` or `light` class to root

## Notes

- The Supabase schema file (`src/lib/supabase-schema.sql`) contains the complete database structure
- The app uses a dark theme (`bg-[#1e2128]`) as the default background
- All stores use proper error handling with `e: unknown` type safety
- Build and lint pass cleanly: `npm run build` + `npm run lint` — zero errors, zero warnings
