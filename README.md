# B2M Hotpot Restaurant Management System

A complete restaurant POS and management system built with **React 19**, **TypeScript**, **Vite 8**, **Supabase**, and **Tailwind CSS 4**.

## 📋 Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Key Workflows](#key-workflows)
- [Real-Time System](#real-time-system)
- [Role-Based Access](#role-based-access)
- [Conversation Summary](#conversation-summary)
- [Build & Lint](#build--lint)

---

## Features

### 🏠 Dashboard
- **KPI Cards** — Today's revenue, active orders, tables occupied, total customers
- **Recent Orders** — Latest 5 orders with status, items, and totals
- **Popular Items** — Top 5 products by quantity sold
- **Table Status Grid** — Real-time table occupancy from database; click occupied tables to view active orders with items and totals
- **Quick Summary** — Order type breakdown (dine-in/takeout/delivery/cancelled), low stock alerts, average order value
- **Online Staff** — Full-width card above Table Status; shows all on-duty/break staff with avatars, roles, and status badges; auto-updates via Supabase Realtime when staff log in/out from any device

### 💰 Cashier/POS
- **Stock & Recipes Tabs** — Toggle between individual stock items and menu recipes
- **Nested Category Navigation** — Parent categories → Subcategories → Products (click parent with subs to reveal sub-row)
- **Order Types** — Dine-in (with table selection), Takeout, Delivery
- **Unified Cart** — Stock and recipe items combined with separate quantity controls
- **Hold Orders** — Save multiple orders to localStorage; restore across page reloads; auto-holds current cart when restoring
- **Smart Order Combining** — For dine-in, if the table already has an active order, new items are automatically added to the same order (same order number); single payment covers all items
- **Place Order** — Creates order with status "pending" — payment is handled later in Orders page
- **Search** — Filter products or recipes by name

### 🍲 Kitchen Display
- **Item-Level Kanban Board** — Pending → Cooking → Ready → Served columns; **each individual item** has its own status, not the whole order
- **Per-Item Actions** — Each item has its own `Start →`, `Ready ✓`, `Served ↩` button; items move independently through the workflow
- **Order Grouping** — Items are visually grouped by order number within each column; shows order number, table/type, and time ago
- **New Items Alert** — When items are added to an active order (not pending), a 🔔 orange indicator highlights the new items; kitchen clicks acknowledge
- **Urgency Detection** — Orders older than 15 minutes highlighted in red at order group level
- **Live Updates** — Badge count on sidebar updates in real-time (counts individual items, not orders)
- **Time-Aware** — "X min ago" labels refresh every 30 seconds
- **Auto-Serve Detection** — When all items in an order reach "served", the order status auto-updates to "served" for payment

### 📋 Orders
- **3-Tab View** — Active Orders / Today / History
- **Type Grouping** — Orders grouped by Dine-in Tables, Takeout, Delivery
- **Time Sub-Groups** — Last Hour / 1–3 Hours Ago / Older within each type
- **Search** — Filter by order number, customer name, table, or type
- **Expandable Cards** — Click to view items, totals, and actions
- **Item Status Badges** — Each item shows its kitchen status (⏳ pending, 🔥 preparing, ✅ ready, 🍽 served)
- **Actions** — Pay & Complete (served orders), View Receipt (completed), Cancel (active)
- **Right-Side Payment Panel** — Order summary, payment method selection, loading spinner during processing
- **Receipt Slip** — Column layout: receipt on top, Print/Done buttons below; auto-opens after payment

### 📦 Stock Control
- **Clickable Stat Cards** — Total Products / Low Stock / In Stock cards filter the product list
- **Active Filter Banner** — Shows current filter with "Show All" reset button
- **Product CRUD** — Add/edit/delete with emoji picker, unit conversion support
- **Stock Movements** — Purchase/sale/adjustment/waste/return tracking with history panel
- **Purchase Modal** — Enter quantity, unit, cost per unit, notes; live unit conversion preview
- **Category Tabs** — Dynamic category filter from admin

### 📖 Recipes/Menu
- **Recipe CRUD** — Menu items with description, pricing, and emoji
- **Ingredients** — Link recipes to stock products with quantities
- **Auto Stock Deduction** — Creating an order with recipes deducts ingredient stock

### 👥 Customers
- **Full CRUD** — Add/edit/delete with search filtering
- **Loyalty Tiers** — Bronze → Silver → Gold → Platinum based on spending
- **Stats** — Total customers, Gold+, total revenue, average spent

### 🧑‍💼 Staff
- **Full CRUD** — Employee management with modals
- **Roles** — Manager, Chef, Waiter, Cashier, Cleaner
- **Status** — On-duty, Off-duty, Break

### 📊 Reports
- **Period Toggle** — Today / This Week / This Month
- **KPI Cards** — Revenue, Orders, Avg Order, Customers
- **7-Day Revenue Bar Chart** — Recharts BarChart with completed orders revenue
- **Top Items Pie Chart** — Recharts donut chart with revenue share, quantity legend
- **Order Types Breakdown** — Dine-in, Takeout, Delivery with counts and revenue
- **Payment Methods** — Card, Cash, QR with percentages
- **Inventory Summary** — Total products, inventory value, low stock items

### 👤 User Accounts
- **Create Account** — Email/password signup with role assignment
- **Edit Profile** — Change name, phone, and role
- **Inline Role Change** — Dropdown selector in table row
- **Toggle Active/Inactive** — Click status button to activate/deactivate
- **Reset Password** — Dedicated modal with confirmation
- **Delete Account** — Confirmation modal before removal
- **Search** — Filter by name, email, or phone

### ⚙️ Admin Settings
- **Table Management** — Add/edit/delete restaurant tables with seat count
- **Category Management** — Create parent categories and subcategories with emoji picker

---

## Architecture

### Layout System
```
┌─────────────────────────────────────────────────────┐
│ DashboardPage (flex container)                       │
│  ┌──────────┬──────────────────────────────────────┐ │
│  │ Sidebar  │ Main Content Area                     │ │
│  │ - Logo   │  ├─ Navbar (top bar, 64px)            │ │
│  │ - Menu   │  │  - Sidebar toggle + module title   │ │
│  │ - Badges │  │  - 🔔 Notification bell            │ │
│  │          │  │  - 🌙/☀️ Theme toggle              │ │
│  │          │  │  - 🇬🇧/🇲🇲 Language toggle         │ │
│  │          │  │  - 👤 User info + role             │ │
│  │          │  │  - 🚪 Sign out                     │ │
│  │          │  ├─ Page Content (scrollable)         │ │
│  │          │  │  ├─ KPI Cards (4 stats)            │ │
│  │          │  │  ├─ Recent Orders + Popular Items  │ │
│  │          │  │  ├─ 🟢 Online Staff (full-width)   │ │
│  │          │  │  ├─ Table Status + Quick Summary   │ │
│  └──────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Dashboard Layout
```
┌── KPI Cards (4 columns) ──────────────────────────┐
│ Revenue │ Active Orders │ Tables Occupied │ Users │
├───────────────────────────────────────────────────┤
│ Recent Orders (2/3 width) │ Popular Items (1/3)  │
├───────────────────────────────────────────────────┤
│ 🟢 Online Staff (full-width card)                  │
│  ┌─┐ Name • Role • Status  ┌─┐ Name • Role • ... │
├───────────────────┬───────────────────────────────┤
│ Table Status      │ Quick Summary                 │
│  T1 T2 T3 T4 T5   │  Dine-in: X                   │
│  T6 T7 T8 T9 T10  │  Takeout: X                   │
│  [click T# → orders] │ Delivery: X                │
│                     │  Cancelled: X                 │
│                     │  Low Stock: X                 │
│                     │  Avg Order: $XX.XX            │
└───────────────────┴───────────────────────────────┘
```

### State Management
- **Zustand stores** — One store per domain (products, orders, customers, etc.)
- **Supabase** — Persistent data storage with real-time subscriptions
- **localStorage** — Theme, language preference, held orders

### Real-Time System
- **Supabase Realtime** — WebSocket subscriptions on `orders` and `staff` tables
- **Notification Store** — Fetches kitchen count and active order count; auto-refreshes on INSERT/UPDATE/DELETE
- **Sidebar Badges** — Pulsing red badges on Kitchen and Orders menu items; tooltip on hover
- **Page Auto-Refresh** — KitchenPage and OrdersPage re-fetch when badge count changes
- **Staff Online Status** — Dashboard subscribes to `staff` table changes; login/logout from any device instantly updates the Online Staff card; no polling

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router v6 |
| Charts | Recharts 2 |
| State | Zustand 5 |
| Backend | Supabase (Auth, Database, Realtime) |
| Linting | ESLint 9 |

---

## Project Structure

```
src/
├── Components/
│   ├── CashierPage.tsx        # POS: Stock/Recipes tabs, smart order combining, hold orders
│   ├── KitchenPage.tsx        # Kanban kitchen with new items alerts
│   ├── OrdersPage.tsx         # Grouped orders: Active/Today/History, right-side payment panel
│   ├── StockControlPage.tsx   # Stock CRUD, clickable stat filters, movements
│   ├── RecipesPage.tsx        # Recipe + ingredient management
│   ├── CustomersPage.tsx      # Customer profiles with loyalty tiers
│   ├── StaffPage.tsx          # Employee management
│   ├── ReportsPage.tsx        # Recharts BarChart + PieChart analytics
│   ├── UsersPage.tsx          # User account CRUD with role management
│   ├── AdminPage.tsx          # Dynamic tables + categories
│   ├── DashboardHome.tsx      # Overview: stats, tables, online staff (realtime)
│   ├── Navbar.tsx             # Top bar: toggle, notifications, theme, lang, user
│   ├── Sidebar.tsx            # Role-filtered menu navigation with badges
│   ├── ReceiptSlip.tsx        # Print receipt component
│   ├── EmojiPicker.tsx        # Full emoji keyboard
│   └── ToastContainer.tsx     # Notification toasts
├── Pages/
│   ├── DashboardPage.tsx      # Router wrapper with Sidebar + Navbar layout
│   └── LoginPage.tsx          # Email/password authentication + role redirect
├── stores/
│   ├── authStore.ts           # Supabase auth + role + staff status sync on login/logout
│   ├── categoryStore.ts       # Dynamic categories (tree structure)
│   ├── customerStore.ts       # Customers CRUD
│   ├── i18nStore.ts           # English/Burmese translations (80+ keys)
│   ├── notificationStore.ts   # Realtime badge counts + new item alerts for kitchen
│   ├── orderStore.ts          # Orders + order_items + stock deduction + addItemsToOrder
│   ├── productsStore.ts       # Products CRUD
│   ├── recipeStore.ts         # Recipes + ingredients + stock deduction
│   ├── staffStore.ts          # Staff CRUD + realtime subscription
│   ├── stockMovementStore.ts  # Stock movement history
│   ├── tableStore.ts          # Restaurant tables
│   ├── themeStore.ts          # Dark/light mode toggle
│   ├── toastStore.ts          # Toast notifications
│   └── userManagementStore.ts # User account CRUD
├── types/
│   └── index.ts               # TypeScript interfaces
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── supabase-schema.sql    # Complete database schema (11 tables)
│   ├── sync-users-to-profiles.sql # SQL script to sync existing auth users
│   ├── cleanup-duplicate-staff.sql # SQL to remove duplicate staff records
│   ├── unit-conversion.ts     # Unit conversion utilities
│   └── roles.ts               # Role permissions + labels
├── App.tsx                    # Root + auth + theme wrapper + role-based route protection
├── index.css                  # Tailwind + custom animations (bounce-slow, glow, scrollbar)
└── main.tsx                   # Entry point
```

---

## Database Schema

### Tables (11 total)
| Table | Purpose |
|-------|---------|
| `staff` | Employee records (role, status, salary) |
| `products` | Inventory items (stock, price, unit conversion) |
| `tables` | Restaurant tables (table_number, seats, is_active) |
| `categories` | Product categories (name, emoji, parent_id, sort_order) |
| `stock_movements` | Purchase/sale/adjustment/waste/return tracking |
| `orders` | Customer orders (type, status, payment) |
| `order_items` | Order line items (product, qty, price, **status**) |
| `recipes` | Menu items/dishes |
| `recipe_ingredients` | Links recipes to products with quantities |
| `customers` | Customer profiles (tier, spending history) |
| `user_profiles` | Auth users linked to app roles |

### Supabase Setup
1. Go to Supabase Dashboard → SQL Editor
2. Run `src/lib/supabase-schema.sql` to create all tables (includes RLS, indexes, realtime, seed data, auto-create profile trigger)
3. Set environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
   ```
4. If you have existing auth users without profiles, run `src/lib/sync-users-to-profiles.sql`
5. If duplicate staff records exist, run `src/lib/cleanup-duplicate-staff.sql`

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint check
```

### First Login
1. Sign up with email + password (e.g., `admin@b2m.com` / `password123`)
2. Run SQL to set admin role:
   ```sql
   UPDATE user_profiles SET role = 'admin' WHERE email = 'admin@b2m.com';
   ```
3. Go to Admin → Add tables → Add categories
4. Start using the POS

---

## Key Workflows

### Smart Order Combining (Cashier → Kitchen → Payment)
```
T1: Place Order (2 items) → ORD-123 (pending) → Kitchen sees 2 items in Pending
T1: Item A → Start Cooking → Item A moves to Cooking (Item B stays Pending)
T1: Place Order (3 more items) → Added to ORD-123 (same order!)
     Kitchen sees 🔔 on new items → Acknowledges → Cooks all 5 items
T1: Each item moves independently: pending → preparing → ready → served
T1: All 5 items served → Order auto-updates to "served"
T1: Pay & Complete → Single receipt for all 5 items → Stock deducted
```

### Kitchen Item Workflow
```
Order placed → All items start as "pending"
Kitchen sees: Items grouped by order in Pending column
Chef clicks "Start →" on individual item → That item moves to Cooking
Chef clicks "Ready ✓" on individual item → That item moves to Ready
Chef clicks "Served ↩" on individual item → That item is served
When ALL items in order are served → Order status auto-updates to "served"
```

### Placing an Order (Cashier)
1. Select **Stock** or **Recipes** tab
2. Browse categories (click parent → subcategory → products, or click parent without subs to show products directly)
3. Click items to add to cart
4. Select order type: Dine-in (pick table) / Takeout / Delivery
5. Click **📋 Place Order** → order created with status "pending"
6. If same table has an active order, items are added to it automatically

### Completing Payment (Orders)
1. Orders page → Find served order → **💰 Pay & Complete**
2. Right-side panel opens with order summary
3. Select payment method (Card/Cash/QR)
4. Loading spinner → Receipt opens automatically
5. Stock auto-deducted for each item

### Filtering Stock
1. Stock Control → Click stat cards:
   - **Total Products** → Show all
   - **Low Stock** → Show only items below reorder point
   - **In Stock** → Show only items above reorder point
2. Active filter banner appears with "Show All" reset

### Managing User Accounts
1. User Accounts → **+ Create Account**
2. Fill email, password, name, role, phone
3. **Edit** → Change name, phone, role
4. **Reset** → Set new password
5. **Toggle Status** → Click Active/Inactive badge
6. **Delete** → Remove account with confirmation

---

## Real-Time System

### How It Works
```
Order Created/Updated OR Order Item Created/Updated
        ↓
Supabase Realtime Trigger (postgres_changes on orders + order_items tables)
        ↓
notificationStore.fetchCounts()
        ↓
Kitchen count & Orders count updated in Zustand store
        ↓
Sidebar badges update instantly (red pulsing badges)
        ↓
KitchenPage/OrdersPage re-fetch if mounted
```

### Badge Logic
- **Kitchen Badge**: `COUNT(*) FROM order_items WHERE status IN ('pending', 'preparing', 'ready')`
- **Orders Badge**: `COUNT(*) FROM orders WHERE status NOT IN ('completed', 'cancelled')`

### New Items Alert Logic
```
POS adds items to order
        ↓
orderStore.addItemsToOrder() checks order status
        ↓
If status != 'pending' → fetches new item IDs from DB
        ↓
notificationStore.addNewItemId(orderItemId) for each new item
        ↓
KitchenPage shows 🔔 orange indicator on affected items
        ↓
Kitchen acknowledges → indicator removed
```

### Auto-Serve Logic
```
Kitchen marks item as 'served'
        ↓
orderStore.updateOrderItemStatus() updates item status
        ↓
Checks if ALL items in the order are now 'served'
        ↓
If yes → order.status = 'served' (auto-update)
        ↓
Order appears in OrdersPage with "💰 Pay & Complete" button
```

### Staff Online Logic
```
User logs in → authStore.setUser() → updateStaffStatus(email, 'on-duty')
        ↓
If no staff record exists → creates one with role from user_profiles
        ↓
Supabase fires realtime event on staff table
        ↓
DashboardHome receives update via staffStore.subscribe()
        ↓
Online Staff card updates instantly (< 100ms)
```

---

## Role-Based Access

### Authentication & Route Protection
- **Login Redirects to Role's Default Page** — Each role lands on their designated page automatically
- **Session Restore** — Role is fetched on page load and auth state changes
- **Module Access Control** — Users without permission to a module are redirected with a warning toast
- **Access Denied Screen** — Fallback page with "Go to Dashboard" button for unauthorized access
- **Auto Profile Creation** — Database trigger creates `user_profiles` entry when a user signs up via Supabase Auth
- **Staff Status Sync** — Login marks staff as `on-duty`, logout marks as `off-duty`; creates staff record if none exists

### Permissions Table

| Role | Access | Default Page |
|------|--------|--------------|
| **Admin** | All modules (Dashboard, Cashier, Kitchen, Orders, Stock, Recipes, Customers, Staff, Reports, Users, Admin) | `/dashboard` |
| **Manager** | All except User Accounts | `/dashboard` |
| **Cashier** | Cashier/POS, Orders | `/cashier` |
| **Chef** | Kitchen | `/kitchen` |
| **Waiter** | Orders, Kitchen, Customers | `/orders` |
| **Cleaner** | Dashboard only | `/dashboard` |

Each role sees only the menu items they have access to in the sidebar. Attempting to navigate directly to an unauthorized URL triggers a redirect.

---

## Conversation Summary

### Changes Made During This Session

#### 1. Sidebar Enhancement
- Added **recipes**, **users**, **admin** to sidebar menu items and `ModuleName` type
- Implemented role-based filtering using `rolePermissions` from `lib/roles`
- Only shows menu items the user's role has access to

#### 2. Real-Time Badge Notifications
- Created `notificationStore.ts` with Supabase Realtime subscription to `orders` table
- Kitchen badge: count of pending/preparing/ready orders
- Orders badge: count of non-completed orders
- Sidebar shows pulsing red badges with tooltip on hover
- KitchenPage and OrdersPage auto-refresh when badge count changes

#### 3. Receipt Slip Integration
- Wired `ReceiptSlip.tsx` to OrdersPage payment flow
- Added payment modal with Card/Cash/QR selection
- Receipt auto-opens after payment completion

#### 4. Dead Code Cleanup
- Removed unused `OrderSuccessAnimation.tsx`, `CrudModal.tsx`
- Removed dead stores `uiStore.ts`, `notificationStore.ts` (later recreated)
- Removed unused `useRealtime.ts`
- Updated `QWEN.md` README to match actual schema (11 tables, stores)

#### 5. User Accounts Full CRUD
- UsersPage: Create account, edit profile (name/phone/role), toggle active/inactive, reset password, delete with confirmation
- Added `syncMissingProfiles` (later removed) and `toggleActive` to `userManagementStore`
- Search filter by name, email, phone
- Stats cards: Total Users, Active, Admins, Staff

#### 6. Dashboard Online Staff
- DashboardHome fetches staff from `staffStore`
- Shows all on-duty/break staff with avatars, roles, status badges
- Separated into two distinct cards: Quick Summary and Online Staff
- Online Staff moved above Table Status card

#### 7. Real-Time Staff Status
- `staffStore` added `subscribe()` and `unsubscribe()` for Supabase Realtime
- Dashboard subscribes on mount, unsubscribes on unmount
- `authStore` calls `updateStaffStatus()` on login (on-duty) and logout (off-duty)
- If no staff record exists for the user, one is created automatically
- Fixed dev-mode duplicate subscriptions by calling `unsubscribe()` before `subscribe()`

#### 8. Navbar Creation
- Created `Navbar.tsx` with sidebar toggle, module title, notification bell, theme toggle, language toggle, user info, sign out
- Moved theme and language toggles from sidebar footer to navbar
- Sidebar simplified to logo + menu only

#### 9. Stock Filtering
- StockControlPage stat cards (Total Products, Low Stock, In Stock) are now clickable filters
- Active filter banner shows current filter with "Show All" reset button
- Combines with category tabs and search

#### 10. Orders Page Redesign
- 3-tab view: Active Orders / Today / History
- Orders grouped by type (Dine-in Tables, Takeout, Delivery)
- Time sub-groups: Last Hour, 1–3 Hours Ago, Older
- Search by order number, customer name, table, type
- Right-side payment panel with order summary, loading spinner

#### 11. Cashier/POS — Stock & Recipes Tabs
- Two tabs: Stock (individual items) and Recipes (menu items)
- Nested category navigation: Parent → Subcategories → Products
- Subcategories row appears indented with yellow border when parent has subs
- Unified cart for stock + recipe items with quantity controls
- Hold orders: save to localStorage, restore across reloads, auto-hold current cart

#### 12. Smart Order Combining
- When placing a dine-in order, POS checks if the table has an active order
- If yes: new items are added to the existing order (same order number)
- If no: new order is created
- Single payment covers all items added to the table's order
- `addItemsToOrder` in orderStore: inserts items, records stock movements, deducts stock, recalculates totals

#### 13. Cashier Payment Removed
- POS now only places orders (status: pending) — no payment selection
- "📋 Place Order" button creates order, toast directs to Orders page to pay
- Payment is handled exclusively in Orders page

#### 14. Kitchen New Items Alert
- Problem: When items are added to an order already in Cooking/Ready, kitchen misses them
- Solution: `addItemsToOrder` checks order status; if not "pending", triggers `notificationStore.addNewItemId(orderId)`
- KitchenPage shows orange banner on affected orders: "🔔 New items added — Review before cooking" with ✓ OK acknowledge button
- Works across Pending, Cooking, and Ready columns

#### 15. Role-Based Route Protection
- `App.tsx`: ProtectedRoute checks auth; DashboardLayout checks role permissions
- `LoginPage`: After login, fetches role and redirects to role's default page
- Session restore: fetches role on app load and auth state changes
- Unauthorized access: redirect with toast warning + fallback "Access Denied" screen
- SQL trigger: `handle_new_user()` auto-creates `user_profiles` entry on signup

#### 16. Layout & Scroll Fixes
- All page components changed from `h-screen` to `min-h-full` to fit within parent flex container
- CashierPage cart items area: `flex-1 overflow-y-auto scrollbar-thin min-h-0` for proper inner scrolling
- Payment modals changed to `fixed inset-0` for full-viewport coverage

#### 17. Database Enhancements
- SQL trigger `handle_new_user()` auto-creates `user_profiles` on signup
- SQL script `cleanup-duplicate-staff.sql` removes duplicate staff records per email

#### 18. README.md Updates
- Comprehensive rewrite with all new features, architecture diagrams, workflow examples
- Added Real-Time System, Role-Based Access, and Conversation Summary sections

#### 19. Kitchen Algorithm — Order-Level to Item-Level Status
- **Database**: Added `status` column to `order_items` table (`pending`, `preparing`, `ready`, `served`)
- **Migration**: `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS status...` + index
- **Types**: `OrderItem` interface now includes `status` field
- **orderStore**: `addOrder()` and `addItemsToOrder()` set `status: 'pending'` on new items
- **New function**: `updateOrderItemStatus(orderItemId, status)` — updates individual item status
- **notificationStore**: Changed from order-level (`newItemOrderIds`) to item-level (`newItemIds`); kitchen badge now counts items from `order_items`, not orders; subscribes to `order_items` table changes
- **KitchenPage rewrite**: Complete rewrite — items flattened from all orders, grouped by item status, then visually grouped by order; per-item action buttons (`Start →`, `Ready ✓`, `Served ↩`); 🔔 indicator on new items
- **OrdersPage update**: Removed order-level cooking status buttons (Start Cooking, Mark Ready, Mark Served); OrdersPage now only handles payment/cancel/view receipt; item status badges shown per item in expanded view
- **Auto-serve**: When all items in an order reach `served`, order status auto-updates to `served` for payment
- **UX fix**: Eliminated duplicate status control conflict — Kitchen manages item status, OrdersPage manages payment

#### 20. Receipt Slip Layout Fix
- Fixed ReceiptSlip overlay layout: receipt slip now stacks vertically with action buttons below
- Container uses `max-w-sm` for centered narrow layout with `overflow-y-auto` for scroll on small screens

---

## Build & Lint

```bash
npm run build   # ✅ Zero errors
npm run lint    # ✅ Zero errors, zero warnings
```

---

## License
Private project.
