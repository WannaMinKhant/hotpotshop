# B2M Hotpot Restaurant Management System

A complete restaurant POS and management system built with React 19, TypeScript, Vite 8, Supabase, and Tailwind CSS 4.

## Features

### Core Modules
- **Dashboard** — Revenue stats, active orders, table status grid, recent orders, popular items
- **Cashier/POS** — Product grid, cart management, order placement, table selection
- **Kitchen Display** — Kanban board (Pending → Preparing → Ready → Served)
- **Orders** — Full order management with status tracking, payment, and receipt printing
- **Stock Control** — Product CRUD, purchase tracking, stock movement history, unit conversion
- **Recipes/Menu** — Recipe management with ingredient tracking and automatic stock deduction
- **Customers** — Customer profiles with loyalty tiers (Bronze/Silver/Gold/Platinum)
- **Staff** — Employee management with roles and duty status
- **Reports** — Revenue trend charts, hourly distribution, payment methods, top items, inventory summary
- **User Accounts** — Staff login account creation with role assignment
- **Admin Settings** — Dynamic table management, dynamic category management with subcategories

### Dynamic System
- **Dynamic Tables** — Admin defines restaurant tables with seat count; Cashier dropdown reflects changes
- **Dynamic Categories** — Admin creates product categories with emojis and subcategories; appears in Cashier tabs and Stock filter
- **Real-time Data** — Kitchen and Orders badges update live; stock changes reflect immediately

### Theme & Localization
- **Dark/Light Mode** — Toggle from sidebar footer; persists in localStorage
- **English/Burmese** — 80+ translated labels; toggle from sidebar footer (🇬🇧 EN / 🇲🇲 MM)

### Order Flow
1. Cashier selects products → adds to cart → places order
2. Order appears in Kitchen Kanban board (real-time badge)
3. Kitchen progresses: Pending → Preparing → Ready → Served
4. "Pay & Complete" opens payment modal → select Card/Cash/QR
5. Receipt slip auto-opens for printing
6. Stock auto-deducts for each sold item

### Role-Based Access
| Role | Access |
|------|--------|
| Admin | All modules |
| Manager | All except User Accounts |
| Cashier | Cashier/POS, Orders |
| Chef | Kitchen |
| Waiter | Orders, Kitchen, Customers |
| Cleaner | Dashboard only |

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

## Project Structure

```
src/
├── Components/          # Feature components
│   ├── CashierPage.tsx       # POS with dynamic tables/categories
│   ├── KitchenPage.tsx       # Kanban kitchen display
│   ├── OrdersPage.tsx        # Order management + payment + receipt
│   ├── StockControlPage.tsx  # Stock CRUD + movements + dynamic categories
│   ├── RecipesPage.tsx       # Recipe + ingredient management
│   ├── CustomersPage.tsx     # Customer profiles
│   ├── StaffPage.tsx         # Employee management
│   ├── ReportsPage.tsx       # Charts and analytics
│   ├── UsersPage.tsx         # User account CRUD
│   ├── AdminPage.tsx         # Dynamic tables + categories
│   ├── DashboardHome.tsx     # Overview dashboard
│   ├── ReceiptSlip.tsx       # Print receipt
│   ├── EmojiPicker.tsx       # Full emoji keyboard
│   ├── Sidebar.tsx           # Navigation + theme/lang toggles
│   └── ToastContainer.tsx    # Notification toasts
├── Pages/
│   ├── DashboardPage.tsx     # Router wrapper
│   └── LoginPage.tsx         # Auth login
├── stores/                   # Zustand stores
│   ├── authStore.ts          # Supabase auth session
│   ├── categoryStore.ts      # Dynamic categories CRUD
│   ├── customerStore.ts      # Customers
│   ├── i18nStore.ts          # English/Burmese translations
│   ├── notificationStore.ts  # Realtime badge counts
│   ├── orderStore.ts         # Orders + stock deduction
│   ├── productStore.ts       # Products
│   ├── recipeStore.ts        # Recipes + ingredients
│   ├── stockMovementStore.ts # Stock movement history
│   ├── tableStore.ts         # Dynamic tables
│   ├── themeStore.ts         # Dark/light mode
│   ├── toastStore.ts         # Notifications
│   └── userManagementStore.ts# User accounts
├── types/
│   └── index.ts              # TypeScript interfaces
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── supabase-schema.sql   # Complete database schema
│   ├── unit-conversion.ts    # Unit conversion utilities
│   └── roles.ts              # Role permissions config
├── App.tsx                   # Root + auth + theme wrapper
├── index.css                 # Tailwind + light mode overrides
└── main.tsx                  # Entry point
```

## Database Schema

### Tables
| Table | Purpose |
|-------|---------|
| `staff` | Employee records (role, status, salary) |
| `products` | Inventory items (stock, price, unit conversion) |
| `tables` | Restaurant tables (table_number, seats, is_active) |
| `categories` | Product categories (name, emoji, parent_id, sort_order) |
| `stock_movements` | Purchase/sale/adjustment/waste/return tracking |
| `orders` | Customer orders (type, status, payment) |
| `order_items` | Order line items (product, qty, price) |
| `recipes` | Menu items/dishes |
| `recipe_ingredients` | Links recipes to products with quantities |
| `customers` | Customer profiles (tier, spending history) |
| `user_profiles` | Auth users linked to app roles |

### Supabase Setup
1. Go to Supabase Dashboard → SQL Editor
2. Run `src/lib/supabase-schema.sql` to create all tables
3. Enable Realtime for all tables in Database → Replication
4. Set environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
   ```

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
3. Go to Admin Settings → Add tables → Add categories
4. Start using the POS

## Key Workflows

### Creating a Category (Admin)
1. Admin → 📂 Product Categories → + Add Category
2. Enter name, pick emoji, set sort order
3. Optionally set a parent for subcategories
4. Category appears in Cashier tabs and Stock filter

### Adding a Table (Admin)
1. Admin → 🪑 Tables → + Add Table
2. Set table number and seats
3. Table appears in Cashier dropdown

### Placing an Order (Cashier)
1. Select Dine-in/Takeout → Pick table if dine-in
2. Browse categories → Click products to add to cart
3. Adjust quantities → Click "Place Order"
4. Order sent to Kitchen (real-time)

### Completing Payment (Orders)
1. Orders page → Find served order → "Pay & Complete"
2. Select payment method (Card/Cash/QR)
3. Receipt opens automatically for printing
4. Stock auto-deducted

### Stock Purchase (Stock Control)
1. Find product → Click "📥 Purchase"
2. Enter quantity, unit, cost per unit, notes
3. Stock increases, movement recorded
4. Unit conversion preview shown if units differ

## License
Private project.
