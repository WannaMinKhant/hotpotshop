# Real-Time Data Streaming Setup

## Overview
The B2M Restaurant Management System now has **real-time data streaming** for Orders and Kitchen modules with **live badge notifications** in the sidebar.

## What's Implemented

### 1. **Notification Store** (`src/stores/notificationStore.ts`)
- Real-time badge counts for Kitchen and Orders
- Supabase Realtime subscription to `orders` table
- Auto-refreshes counts on any order change (INSERT, UPDATE, DELETE)
- Properly typed with `RealtimeChannel` from Supabase

**Badge Logic:**
- **Kitchen Badge**: Shows count of orders in `pending`, `preparing`, and `ready` status
- **Orders Badge**: Shows count of non-completed orders (excludes `completed` and `cancelled`)

### 2. **Sidebar Integration**
- Subscribes to real-time updates on mount
- Unsubscribes on unmount (cleanup)
- Displays red badges on Kitchen and Orders menu items
- Badges update instantly when orders change
- Active module badge uses darker background for visibility

### 3. **Kitchen & Orders Pages**
- Both pages re-fetch orders when notification count changes
- Kitchen: Refreshes when `kitchenCount` changes
- Orders: Refreshes when `ordersCount` changes
- 30-second "time ago" refresh still active

## How It Works

```
Order Created/Updated
        ↓
Supabase Realtime Trigger
        ↓
notificationStore.fetchCounts()
        ↓
Kitchen count & Orders count updated
        ↓
Sidebar badges update instantly
        ↓
KitchenPage/OrdersPage re-fetch if mounted
```

## Setup Requirements

### 1. **Enable Realtime in Supabase**
Run this SQL script in Supabase SQL Editor to enable realtime on all tables:

```sql
-- Enable replication for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE staff;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_movements;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE recipe_ingredients;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
```

**Note:** This is already included in the `supabase-schema.sql` script (Step 5).

### 2. **Database Schema**
The complete schema is in `src/lib/supabase-schema.sql`. Run this file to:
- Drop all existing tables
- Recreate all 11 tables with proper indexes
- Enable Row Level Security (RLS)
- Enable Realtime on all tables
- Seed default data (15 tables, 7 categories)

## Testing Real-Time

1. **Open two browser tabs** logged into the app
2. **Tab 1**: Go to Cashier, create a new order
3. **Tab 2**: Watch the Kitchen and Orders badges update instantly
4. **Tab 2**: Click Kitchen to see the new order appear

## Badge Count Logic

### Kitchen Badge
```typescript
COUNT(*) FROM orders 
WHERE status IN ('pending', 'preparing', 'ready')
```

### Orders Badge
```typescript
COUNT(*) FROM orders 
WHERE status NOT IN ('completed', 'cancelled')
```

## Performance Considerations

- **Debounced Updates**: Counts refresh on every order change, but Supabase handles the filtering
- **Single Subscription**: Only one realtime channel for all order events
- **Proper Cleanup**: Unsubscribes on component unmount to prevent memory leaks
- **Efficient Queries**: Uses `count: 'exact', head: true` to avoid fetching full rows

## Future Enhancements

- [ ] Add sound notification on new kitchen order
- [ ] Flash animation on badge update
- [ ] WebSocket connection status indicator
- [ ] Per-user notification preferences
- [ ] Batch updates for high-volume restaurants

## Files Modified

1. `src/stores/notificationStore.ts` - Real-time subscription & count management
2. `src/Components/Sidebar.tsx` - Badge display & subscription setup
3. `src/Components/KitchenPage.tsx` - Re-fetch on count change
4. `src/Components/OrdersPage.tsx` - Re-fetch on count change

## Verification

```bash
npm run build  # ✅ Zero errors
npm run lint   # ✅ Zero errors, zero warnings
```

All TypeScript types are properly defined with `RealtimeChannel` from `@supabase/supabase-js`.
