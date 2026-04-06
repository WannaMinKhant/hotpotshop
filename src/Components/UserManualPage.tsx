import { useState } from 'react';
import { useI18nStore } from '../stores/i18nStore';

type ManualSection = 'overview' | 'login' | 'dashboard' | 'cashier' | 'kitchen' | 'orders' | 'orders-by-date' | 'stock' | 'recipes' | 'customers' | 'staff' | 'reports' | 'users' | 'admin';

interface Section {
  id: ManualSection;
  titleKey: string;
  icon: string;
  contentEN: ContentBlock[];
  contentMM: ContentBlock[];
}

interface ContentBlock {
  type: 'heading' | 'text' | 'list' | 'table' | 'note' | 'warning';
  content: string | string[];
}

const UserManualPage = () => {
  const [activeSection, setActiveSection] = useState<ManualSection>('overview');
  const { t, lang } = useI18nStore();

  const manualSections: Section[] = [
    {
      id: 'overview',
      titleKey: 'manual.overview',
      icon: '📖',
      contentEN: [
        { type: 'heading', content: 'B2M Hotpot Restaurant Management System' },
        { type: 'text', content: 'Welcome to the B2M Hotpot POS system! This comprehensive guide will help you understand all features and functions available in the application.' },
        { type: 'heading', content: 'Key Features' },
        { type: 'list', content: [
          '📊 Real-time dashboard with business insights',
          '💰 Point of Sale (POS) system with hold orders',
          '🍲 Kitchen display with item-level tracking',
          '📋 Order management with payment processing',
          '📅 Orders & Purchases by date filtering',
          '📦 Stock control with movement tracking',
          '📖 Recipe management with ingredient tracking',
          '👥 Customer relationship management with loyalty tiers',
          '🧑‍💼 Staff management with role-based access',
          '📈 Reports with profit/loss analytics',
          '⚙️ Admin settings for tables and categories',
        ]},
        { type: 'heading', content: 'User Roles' },
        { type: 'table', content: ['Role|Access', '👑 Admin|All modules', '👔 Manager|All except User Accounts', '💰 Cashier|Cashier, Orders, Orders by Date', '👨‍🍳 Chef|Kitchen only', '🤵 Waiter|Orders, Kitchen, Customers', '🧹 Cleaner|Dashboard only'] },
        { type: 'note', content: 'Each role sees only the menu items they have access to in the sidebar.' },
      ],
      contentMM: [
        { type: 'heading', content: 'B2M Hotpot စားသောက်ဆိုင် စီမံခန့်ခွဲမှုစနစ်' },
        { type: 'text', content: 'B2M Hotpot POS စနစ်မှ ကြိုဆိုပါတယ်။ ဤလမ်းညွှန်စာအုပ်က စနစ်အတွင်းရှိ လုပ်ဆောင်ချက်အားလုံးကို အလွယ်တကူ အသုံးပြုနိုင်ရန် ကူညီပေးပါလိမ့်မည်။' },
        { type: 'heading', content: 'အဓိက လုပ်ဆောင်ချက်များ' },
        { type: 'list', content: [
          '📊 လုပ်ငန်း၏ အခြေအနေများကို အချိန်နှင့်တပြေးညီ ကြည့်ရှုနိုင်သော ဒက်ရှ်ဘုတ်',
          '💰 အော်ဒါများကို ခေတ္တဆိုင်းငံ့ (Hold) ထားနိုင်သော အရောင်း (POS) စနစ်',
          '🍲 ဟင်းပွဲတစ်ပွဲချင်းစီ၏ အခြေအနေကို စောင့်ကြည့်နိုင်သော မီးဖိုချောင်စနစ်',
          '📋 ငွေပေးချေမှုများနှင့် အော်ဒါများကို စီမံခန့်ခွဲခြင်း',
          '📅 ရက်စွဲအလိုက် အော်ဒါများနှင့် အဝယ်စာရင်းများကို ကြည့်ရှုခြင်း',
          '📦 ပစ္စည်းအဝင်အထွက်များကို ခြေရာခံနိုင်သော ကုန်လက်ကျန် (Stock) စီမံခန့်ခွဲမှု',
          '📖 ပါဝင်ပစ္စည်းများကို တွက်ချက်ပေးနိုင်သော ဟင်းပွဲ (Recipe) စီမံခန့်ခွဲမှု',
          '👥 ဖောက်သည်များကို Member အဆင့်အလိုက် ခွဲခြားစီမံနိုင်မှု',
          '🧑‍💼 ရာထူးအလိုက် လုပ်ပိုင်ခွင့်များ သတ်မှတ်နိုင်သော ဝန်ထမ်းစီမံခန့်ခွဲမှု',
          '📈 အမြတ်/အရှုံးနှင့် လုပ်ငန်းအခြေအနေ သုံးသပ်ချက် အစီရင်ခံစာများ',
          '⚙️ စားပွဲများနှင့် ကုန်ပစ္စည်းအမျိုးအစားများကို သတ်မှတ်ခြင်း',
        ]},
        { type: 'heading', content: 'အသုံးပြုသူ ရာထူးနှင့် လုပ်ပိုင်ခွင့်များ' },
        { type: 'table', content: ['ရာထူး|လုပ်ပိုင်ခွင့်', '👑 Admin|လုပ်ဆောင်ချက်အားလုံး အသုံးပြုနိုင်သည်', '👔 Manager|အသုံးပြုသူအကောင့် စီမံခြင်းမှလွဲ၍ အားလုံး အသုံးပြုနိုင်သည်', '💰 Cashier|အရောင်းကောင်တာ၊ အော်ဒါများနှင့် ရက်စွဲအလိုက်စာရင်းများ', '👨‍🍳 Chef|မီးဖိုချောင်စနစ်သာ', '🤵 Waiter|အော်ဒါ၊ မီးဖိုချောင်နှင့် ဖောက်သည်စာရင်း', '🧹 Cleaner|ဒက်ရှ်ဘုတ်သာ'] },
        { type: 'note', content: 'ရာထူးတစ်ခုစီအတွက် မိမိတို့ ဝင်ရောက်ခွင့်ရှိသော မီနူးများကိုသာ ဘေးဘက်ဘား (Sidebar) တွင် မြင်တွေ့ရမည်ဖြစ်ပါသည်။' },
      ],
    },
    {
      id: 'login',
      titleKey: 'manual.login',
      icon: '🔐',
      contentEN: [
        { type: 'heading', content: 'How to Login' },
        { type: 'list', content: [
          '1. Open the application in your browser',
          '2. Enter your registered email address',
          '3. Enter your password',
          '4. Click "Sign In" to access the system',
        ]},
        { type: 'heading', content: 'First-Time Setup' },
        { type: 'list', content: [
          '1. Click "Sign Up" on the login page',
          '2. Create an account with email and password',
          '3. An admin must assign your role via User Accounts page',
          '4. Login with your credentials',
        ]},
        { type: 'heading', content: 'Session Management' },
        { type: 'list', content: [
          '• Sessions persist across page reloads',
          '• Click "Sign Out" in the sidebar to logout',
          '• Staff status auto-updates on login/logout',
          '• Login marks you as "On-Duty"',
          '• Logout marks you as "Off-Duty"',
        ]},
        { type: 'warning', content: 'If you cannot access a page, contact your manager to request appropriate role permissions.' },
      ],
      contentMM: [
        { type: 'heading', content: 'စနစ်သို့ ဝင်ရောက်ခြင်း (Login)' },
        { type: 'list', content: [
          '၁။ သင့် Browser တွင် အက်ပ်ကိုဖွင့်ပါ။',
          '၂။ စာရင်းသွင်းထားသော အီးမေးလ်ကို ထည့်ပါ။',
          '၃။ စကားဝှက် (Password) ကို ထည့်ပါ။',
          '၄။ "Sign In" ကိုနှိပ်၍ စနစ်ထဲသို့ ဝင်ရောက်ပါ။',
        ]},
        { type: 'heading', content: 'ပထမဆုံးအကြိမ် အသုံးပြုခြင်း' },
        { type: 'list', content: [
          '၁။ Login စာမျက်နှာရှိ "Sign Up" ကိုနှိပ်ပါ။',
          '၂။ အီးမေးလ်နှင့် စကားဝှက်ကိုအသုံးပြု၍ အကောင့်အသစ်ဖွင့်ပါ။',
          '၃။ Admin မှ User Accounts စာမျက်နှာမှတစ်ဆင့် သင့်အတွက် ရာထူး သတ်မှတ်ပေးပါလိမ့်မည်။',
          '၄။ ထို့နောက် သင့်အကောင့်ဖြင့် ဝင်ရောက်အသုံးပြုနိုင်ပါသည်။',
        ]},
        { type: 'heading', content: 'စနစ်အသုံးပြုမှု မှတ်တမ်းစီမံခြင်း (Session Management)' },
        { type: 'list', content: [
          '• စာမျက်နှာကို Refresh လုပ်သော်လည်း စနစ်ထဲမှ ထွက်သွားမည်မဟုတ်ပါ။',
          '• စနစ်မှထွက်ရန် Sidebar ရှိ "Sign Out" ကိုနှိပ်ပါ။',
          '• Login ဝင်ခြင်း/ထွက်ခြင်း ပြုလုပ်ပါက ဝန်ထမ်း၏ တာဝန်ထမ်းဆောင်မှု အခြေအနေကို အလိုအလျောက် ပြောင်းလဲပေးမည်ဖြစ်သည်။',
          '• စနစ်ထဲဝင်ပါက "တာဝန်ချိန် (On-Duty)" အဖြစ် ပြသမည်။',
          '• စနစ်မှထွက်ပါက "တာဝန်ချိန်ပြင်ပ (Off-Duty)" အဖြစ် ပြသမည်။',
        ]},
        { type: 'warning', content: 'အကယ်၍ စာမျက်နှာတစ်ခုခုသို့ ဝင်ရောက်၍မရပါက လိုအပ်သော လုပ်ပိုင်ခွင့်များ ရရှိရန် သင့်မန်နေဂျာထံ ဆက်သွယ်ပါ။' },
      ],
    },
    {
      id: 'dashboard',
      titleKey: 'manual.dashboard',
      icon: '📊',
      contentEN: [
        { type: 'heading', content: 'Dashboard Overview' },
        { type: 'text', content: 'The dashboard is your central hub for monitoring restaurant operations at a glance.' },
        { type: 'heading', content: 'KPI Cards' },
        { type: 'list', content: [
          "💰 Today's Revenue - Total revenue from completed orders today",
          '📋 Active Orders - Count of orders in progress (pending → served)',
          '🪑 Tables Occupied - Shows occupied vs total tables (e.g., 5/15)',
          '👥 Total Customers - Total registered customers in the system',
        ]},
        { type: 'heading', content: 'Recent Orders' },
        { type: 'list', content: [
          'Shows latest 5 orders with full details',
          'Columns: Order ID, Table, Items, Total, Status, Time',
          'Status colors: Yellow (Pending), Blue (Cooking), Purple (Ready), Green (Completed), Red (Cancelled)',
        ]},
        { type: 'heading', content: 'Top 5 Popular Items' },
        { type: 'list', content: [
          'Most ordered items by quantity',
          'Shows rank, name, order count, and revenue',
        ]},
        { type: 'heading', content: 'Online Staff' },
        { type: 'list', content: [
          'Shows all staff currently on-duty or on break',
          'Real-time updates when staff login/logout',
          'Displays avatar, name, role, and status badge',
        ]},
        { type: 'heading', content: 'Table Status' },
        { type: 'list', content: [
          'Visual grid of all restaurant tables',
          'Green = Available, Red = Occupied',
          'Click occupied tables to view active orders',
          'Shows order count per table',
        ]},
        { type: 'heading', content: 'Quick Summary' },
        { type: 'list', content: [
          'Dine-in, Takeout, Delivery order counts',
          'Cancelled orders count',
          'Low stock items alert',
          'Average order value',
        ]},
        { type: 'heading', content: 'Order Types & Payment Methods' },
        { type: 'list', content: [
          '📊 Order Types breakdown with revenue per type',
          '💳 Payment methods (Card/Cash/QR) with counts and percentages',
        ]},
      ],
      contentMM: [
        { type: 'heading', content: 'ဒက်ရှ်ဘုတ် အကျဉ်းချုပ်' },
        { type: 'text', content: 'ဒက်ရှ်ဘုတ်သည် စားသောက်ဆိုင်၏ လည်ပတ်မှုအခြေအနေ တစ်ခုလုံးကို ခြုံငုံကြည့်ရှုနိုင်သော အဓိကစာမျက်နှာ ဖြစ်ပါသည်။' },
        { type: 'heading', content: 'အဓိက အချက်အလက် ကတ်များ (KPI Cards)' },
        { type: 'list', content: [
          '💰 ယနေ့ဝင်ငွေ - ယနေ့ ပြီးစီးခဲ့သော အော်ဒါများမှ ရရှိသည့် စုစုပေါင်းဝင်ငွေ',
          '📋 လက်ရှိ အော်ဒါများ - လက်ရှိ ပြင်ဆင်နေဆဲ အော်ဒါ အရေအတွက်',
          '🪑 စားပွဲအသုံးပြုမှု - ဧည့်သည်ရှိနေသောစားပွဲ နှင့် စုစုပေါင်းစားပွဲ အရေအတွက် (ဥပမာ ၅/၁၅)',
          '👥 စုစုပေါင်း ဖောက်သည် - စနစ်အတွင်း စာရင်းသွင်းထားသော ဖောက်သည်စုစုပေါင်း',
        ]},
        { type: 'heading', content: 'နောက်ဆုံးဝင်ထားသော အော်ဒါများ' },
        { type: 'list', content: [
          'နောက်ဆုံးရရှိထားသော အော်ဒါ ၅ ခု၏ အသေးစိတ်ကို ပြသပေးပါသည်။',
          'ပါဝင်သော အချက်များ - အော်ဒါ ID၊ စားပွဲနံပါတ်၊ ဟင်းပွဲများ၊ စုစုပေါင်းကျသင့်ငွေ၊ အခြေအနေ၊ အချိန်',
          'အခြေအနေအရောင်များ - အဝါ (စောင့်ဆိုင်းဆဲ)၊ အပြာ (ချက်ပြုတ်နေဆဲ)၊ ခရမ်း (အသင့်ဖြစ်)၊ အစိမ်း (ပြီးစီး)၊ အနီ (ပယ်ဖျက်)',
        ]},
        { type: 'heading', content: 'အရောင်းရဆုံး ဟင်းပွဲ ၅ မျိုး' },
        { type: 'list', content: [
          'အများဆုံး ရောင်းချရသည့် ဟင်းပွဲများကို အရေအတွက်အလိုက် ပြသပေးပါသည်။',
          'အဆင့်၊ အမည်၊ ရောင်းရအရေအတွက်နှင့် ရရှိသောဝင်ငွေတို့ကို ပြသပေးပါသည်။',
        ]},
        { type: 'heading', content: 'လက်ရှိ တာဝန်ထမ်းဆောင်နေသော ဝန်ထမ်းများ' },
        { type: 'list', content: [
          'တာဝန်ချိန်အတွင်းရှိနေသော သို့မဟုတ် နားနေသော ဝန်ထမ်းအားလုံးကို ပြသပေးပါသည်။',
          'ဝန်ထမ်းများ စနစ်သို့ ဝင်/ထွက် ပြုလုပ်သည်နှင့် တစ်ပြိုင်နက် အလိုအလျောက် ပြောင်းလဲပြသပေးပါသည်။',
          'ပရိုဖိုင်ပုံ၊ အမည်၊ ရာထူးနှင့် လက်ရှိအခြေအနေတို့ကို ပြသပေးပါသည်။',
        ]},
        { type: 'heading', content: 'စားပွဲများ၏ အခြေအနေ' },
        { type: 'list', content: [
          'ဆိုင်ရှိစားပွဲအားလုံးကို ပုံစံကားချပ်ဖြင့် ပြသပေးပါသည်။',
          'အစိမ်းရောင် = စားပွဲလွတ်၊ အနီရောင် = ဧည့်သည်ရှိ',
          'ဧည့်သည်ရှိသော စားပွဲများကို နှိပ်၍ လက်ရှိအော်ဒါများကို ကြည့်ရှုနိုင်ပါသည်။',
          'စားပွဲတစ်လုံးချင်းစီရှိ အော်ဒါအရေအတွက်ကို ပြသပေးပါသည်။',
        ]},
        { type: 'heading', content: 'အမြန် အကျဉ်းချုပ်' },
        { type: 'list', content: [
          'ဆိုင်စား၊ ပါဆယ်၊ ပါဆယ်ပို့ အော်ဒါ အရေအတွက်များ',
          'ပယ်ဖျက်လိုက်သော အော်ဒါအရေအတွက်',
          'ကုန်လက်ကျန်နည်းနေသော ပစ္စည်းများအတွက် သတိပေးချက်',
          'အော်ဒါတစ်ခု၏ ပျမ်းမျှ ကျသင့်ငွေ',
        ]},
        { type: 'heading', content: 'အော်ဒါ အမျိုးအစားများနှင့် ငွေပေးချေမှု ပုံစံများ' },
        { type: 'list', content: [
          '📊 အော်ဒါအမျိုးအစားအလိုက် ရရှိသော ဝင်ငွေများကို ခွဲခြမ်းပြသထားပါသည်။',
          '💳 ငွေပေးချေမှု ပုံစံများ (ကတ်/ငွေသား/QR) အလိုက် အရေအတွက်နှင့် ရာခိုင်နှုန်းများကို ပြသထားပါသည်။',
        ]},
      ],
    },
    {
      id: 'cashier',
      titleKey: 'manual.cashier',
      icon: '💰',
      contentEN: [
        { type: 'heading', content: 'Point of Sale System' },
        { type: 'text', content: 'The Cashier page is where you create new orders and add items to existing orders.' },
        { type: 'heading', content: 'Stock & Recipes Tabs' },
        { type: 'list', content: [
          '📦 Stock Tab - Individual stock items (ingredients)',
          '📖 Recipes Tab - Menu items/dishes with bundled ingredients',
          'Both tabs show in unified cart',
        ]},
        { type: 'heading', content: 'Category Navigation' },
        { type: 'list', content: [
          'Click parent categories to filter',
          'Categories with subcategories show sub-row',
          'Click "All" to show all products',
        ]},
        { type: 'heading', content: 'Order Types' },
        { type: 'list', content: [
          '🍽️ Dine-in - Requires table selection',
          '🥡 Takeout - Customer pickup',
          '🚚 Delivery - Customer delivery',
        ]},
        { type: 'heading', content: 'Smart Order Combining' },
        { type: 'list', content: [
          'When placing dine-in order, system checks if table has active order',
          'If yes: Items added to same order (same order number)',
          'If no: Creates new order',
          'Single payment covers all items on table order',
        ]},
        { type: 'heading', content: 'Hold Orders' },
        { type: 'list', content: [
          'Click "Hold Order" to save cart to browser',
          'Multiple holds supported',
          'Persists across page reloads',
          'Click "Restore" to continue held order',
        ]},
        { type: 'heading', content: 'Placing an Order' },
        { type: 'list', content: [
          '1. Select items from Stock or Recipes tab',
          '2. Items appear in cart with quantity controls',
          '3. Select order type (Dine-in/Takeout/Delivery)',
          '4. Click "📋 Place Order"',
          '5. Order created with status "pending"',
          '6. Toast notification confirms order placement',
        ]},
        { type: 'warning', content: 'Cashier does NOT handle payment. Payment is done later in Orders page.' },
      ],
      contentMM: [
        { type: 'heading', content: 'အရောင်းကောင်တာ စနစ် (POS)' },
        { type: 'text', content: 'အရောင်းကောင်တာ စာမျက်နှာသည် အော်ဒါအသစ်များ ကောက်ယူခြင်းနှင့် လက်ရှိအော်ဒါများထဲသို့ ဟင်းပွဲများ ထပ်မံထည့်သွင်းခြင်းတို့ကို လုပ်ဆောင်နိုင်သော နေရာဖြစ်ပါသည်။' },
        { type: 'heading', content: 'ကုန်ပစ္စည်း (Stock) နှင့် ဟင်းပွဲ (Recipes) တက်ဘ်များ' },
        { type: 'list', content: [
          '📦 စတော့ Tab - သီးခြားရောင်းချသော ကုန်ပစ္စည်းများနှင့် အအေးများ',
          '📖 ဟင်းပွဲ Tab - ချက်ပြုတ်ပြင်ဆင်ရသော မီနူးဟင်းပွဲများ',
          'မည်သည့် Tab မှ ရွေးချယ်သည်ဖြစ်စေ အော်ဒါစာရင်းထဲသို့ အတူတကွ ဝင်ရောက်သွားမည်ဖြစ်ပါသည်။',
        ]},
        { type: 'heading', content: 'ကုန်ပစ္စည်းအမျိုးအစားအလိုက် ရှာဖွေခြင်း' },
        { type: 'list', content: [
          'အဓိကအမျိုးအစားများကို နှိပ်၍ အလွယ်တကူ ရှာဖွေနိုင်ပါသည်။',
          'ကဏ္ဍခွဲများ ပါဝင်သော အမျိုးအစားဖြစ်ပါက အောက်တွင် ထပ်မံပြသပေးပါမည်။',
          '"All" ကိုနှိပ်ပါက ကုန်ပစ္စည်းအားလုံးကို ပြသပေးပါမည်။',
        ]},
        { type: 'heading', content: 'အော်ဒါ အမျိုးအစားများ' },
        { type: 'list', content: [
          '🍽️ ဆိုင်စား (Dine-in) - စားပွဲနံပါတ် ရွေးချယ်ပေးရန် လိုအပ်ပါသည်။',
          '🥡 ပါဆယ် (Takeout) - လာရောက်ထုတ်ယူမည့် အော်ဒါများအတွက်။',
          '🚚 အိမ်တိုင်ရာရောက် (Delivery) - ပို့ဆောင်ပေးရမည့် အော်ဒါများအတွက်။',
        ]},
        { type: 'heading', content: 'အော်ဒါများကို အလိုအလျောက် ပေါင်းစပ်ပေးခြင်း (Smart Combining)' },
        { type: 'list', content: [
          'ဆိုင်စားအော်ဒါ ကောက်ယူသည့်အခါ ရွေးချယ်လိုက်သောစားပွဲတွင် ယခင်ကောက်ထားသော အော်ဒါ ရှိ/မရှိကို စနစ်မှ အလိုအလျောက် စစ်ဆေးပေးပါသည်။',
          'အကယ်၍ ရှိနေပါက - ထိုစားပွဲ၏ မူလအော်ဒါထဲသို့သာ အလိုအလျောက် ထပ်ပေါင်းထည့်ပေးမည် ဖြစ်ပါသည်။ (ဘေလ်နံပါတ် တူညီမည်)',
          'အကယ်၍ မရှိပါက - အော်ဒါအသစ်တစ်ခု ဖန်တီးပေးပါမည်။',
          'စားပွဲတစ်လုံးအတွက် ငွေပေးချေမှုကို တစ်ကြိမ်တည်းဖြင့် ရှင်းလင်းနိုင်ပါသည်။',
        ]},
        { type: 'heading', content: 'အော်ဒါများကို ခေတ္တဆိုင်းငံ့ထားခြင်း (Hold Orders)' },
        { type: 'list', content: [
          '"Hold Order" ကိုနှိပ်ခြင်းဖြင့် လက်ရှိရွေးချယ်ထားသော စာရင်းကို Browser တွင် ခေတ္တသိမ်းဆည်းထားနိုင်ပါသည်။',
          'အော်ဒါများကို အကန့်အသတ်မရှိ Hold ပြုလုပ်ထားနိုင်ပါသည်။',
          'စာမျက်နှာကို Refresh လုပ်သော်လည်း ပျောက်ပျက်သွားမည် မဟုတ်ပါ။',
          '"Restore" ကိုနှိပ်၍ ဆိုင်းငံ့ထားသော အော်ဒါများကို ပြန်လည်လုပ်ဆောင်နိုင်ပါသည်။',
        ]},
        { type: 'heading', content: 'အော်ဒါတင်ခြင်း (Placing an Order)' },
        { type: 'list', content: [
          '၁။ စတော့ သို့မဟုတ် ဟင်းပွဲ Tab မှ လိုအပ်သော ဟင်းပွဲများကို ရွေးချယ်ပါ။',
          '၂။ ရွေးချယ်လိုက်သော ဟင်းပွဲများသည် ဘေးဘက်စာရင်းတွင် အရေအတွက် အတိုးအလျှော့ ပြုလုပ်နိုင်သော ပုံစံဖြင့် ပေါ်လာပါမည်။',
          '၃။ အော်ဒါအမျိုးအစားကို ရွေးချယ်ပါ (ဆိုင်စား/ပါဆယ်/ပို့ဆောင်)။',
          '၄။ "📋 Place Order" ခလုတ်ကို နှိပ်ပါ။',
          '၅။ အော်ဒါကို "စောင့်ဆိုင်းဆဲ (Pending)" အခြေအနေဖြင့် ဖန်တီးသွားပါမည်။',
          '၆။ အော်ဒါအောင်မြင်ကြောင်း အသိပေးစာ (Notification) ပေါ်လာပါမည်။',
        ]},
        { type: 'warning', content: 'အရောင်းကောင်တာ (Cashier) စာမျက်နှာတွင် ငွေရှင်းလင်းခြင်းကို လုပ်ဆောင်နိုင်မည်မဟုတ်ပါ။ ငွေပေးချေမှုများကို Orders စာမျက်နှာမှတစ်ဆင့် ပြုလုပ်ပေးရပါမည်။' },
      ],
    },
    {
      id: 'kitchen',
      titleKey: 'manual.kitchen',
      icon: '🍲',
      contentEN: [
        { type: 'heading', content: 'Kitchen Kanban Board' },
        { type: 'text', content: 'Kitchen displays shows individual items (not whole orders) moving through preparation stages.' },
        { type: 'heading', content: 'Three Columns' },
        { type: 'list', content: [
          '⏳ Pending - Items waiting to be cooked',
          '🔥 Cooking - Items currently being prepared',
          '✅ Ready - Items ready to be served',
        ]},
        { type: 'heading', content: 'Per-Item Actions' },
        { type: 'list', content: [
          'Pending → Cooking: Click "Start →"',
          'Cooking → Ready: Click "Ready ✓"',
          'Ready → Served: Click "Served ↩"',
          'Each item moves independently',
        ]},
        { type: 'heading', content: 'Order Grouping' },
        { type: 'list', content: [
          'Items grouped by order number within each column',
          'Shows order number, table/type, and time ago',
          'URGENT badge appears if order older than 15 minutes',
        ]},
        { type: 'heading', content: 'New Items Alert' },
        { type: 'list', content: [
          '🔔 Orange indicator on new items added to active order',
          'Kitchen clicks acknowledge to remove indicator',
          'Helps track items added after order started cooking',
        ]},
        { type: 'heading', content: 'Removing Items (Pending Only)' },
        { type: 'list', content: [
          'Click "✕ Remove" button on pending items',
          'Confirmation dialog appears',
          'Item removed from order and kitchen',
          'Order total recalculated automatically',
          'Stock returned to inventory',
        ]},
        { type: 'heading', content: 'Auto-Serve Detection' },
        { type: 'text', content: 'When ALL items in an order reach "served", the order status auto-updates to "served" and appears in Orders page for payment.' },
        { type: 'note', content: 'Sidebar badge shows count of pending items. Badge updates in real-time.' },
      ],
      contentMM: [
        { type: 'heading', content: 'မီးဖိုချောင် စောင့်ကြည့်ဘုတ်ပြား (Kitchen Board)' },
        { type: 'text', content: 'မီးဖိုချောင်စာမျက်နှာတွင် အော်ဒါတစ်ရွက်လုံး အနေဖြင့်မဟုတ်ဘဲ ဟင်းပွဲတစ်ပွဲချင်းစီ၏ ချက်ပြုတ်ပြင်ဆင်မှု အဆင့်ဆင့်ကို အသေးစိတ် ပြသပေးထားပါသည်။' },
        { type: 'heading', content: 'အဆင့် သုံးဆင့်' },
        { type: 'list', content: [
          '⏳ စောင့်ဆိုင်းဆဲ (Pending) - ချက်ပြုတ်ရန် စောင့်ဆိုင်းနေသော ဟင်းပွဲများ',
          '🔥 ချက်ပြုတ်နေဆဲ (Cooking) - လက်ရှိ ချက်ပြုတ်ပြင်ဆင်နေသော ဟင်းပွဲများ',
          '✅ အသင့်ဖြစ် (Ready) - ဧည့်သည်ထံ သွားရောက်ပို့ဆောင်ရန် အသင့်ဖြစ်နေသော ဟင်းပွဲများ',
        ]},
        { type: 'heading', content: 'ဟင်းပွဲတစ်ပွဲချင်းစီအတွက် လုပ်ဆောင်ချက်များ' },
        { type: 'list', content: [
          'စောင့်ဆိုင်းဆဲမှ ချက်ပြုတ်နေဆဲသို့ ပြောင်းရန် - "Start →" ကိုနှိပ်ပါ။',
          'ချက်ပြုတ်နေဆဲမှ အသင့်ဖြစ်သို့ ပြောင်းရန် - "Ready ✓" ကိုနှိပ်ပါ။',
          'အသင့်ဖြစ်မှ ပို့ဆောင်ပြီးသို့ ပြောင်းရန် - "Served ↩" ကိုနှိပ်ပါ။',
          'ဟင်းပွဲတစ်ပွဲချင်းစီကို သီးခြားစီ အဆင့်ပြောင်းရွှေ့နိုင်ပါသည်။',
        ]},
        { type: 'heading', content: 'အော်ဒါများကို အုပ်စုဖွဲ့ပြသခြင်း' },
        { type: 'list', content: [
          'ကော်လံတစ်ခုစီအတွင်းရှိ ဟင်းပွဲများကို သက်ဆိုင်ရာ ဘေလ်နံပါတ်အလိုက် စုစည်းပြသထားပါသည်။',
          'ဘေလ်နံပါတ်၊ စားပွဲ/အော်ဒါအမျိုးအစား နှင့် အော်ဒါစတင်ချိန်မှ ကြာမြင့်ချိန်တို့ကို ပြသပေးပါသည်။',
          'အော်ဒါမှာယူထားသည်မှာ ၁၅ မိနစ် ကျော်လွန်သွားပါက "URGENT (အရေးပေါ်)" အဖြစ် ပြသပေးပါမည်။',
        ]},
        { type: 'heading', content: 'ဟင်းပွဲအသစ်များအတွက် သတိပေးချက်' },
        { type: 'list', content: [
          '🔔 လက်ရှိချက်ပြုတ်နေသော အော်ဒါထဲသို့ ဟင်းပွဲအသစ်များ ထပ်တိုးလာပါက လိမ္မော်ရောင်ဖြင့် အသိပေးပါမည်။',
          'မီးဖိုချောင်မှ အဆိုပါဟင်းပွဲကို နှိပ်၍ သိရှိကြောင်း အတည်ပြုပေးရပါမည်။',
          'ဤလုပ်ဆောင်ချက်သည် ချက်ပြုတ်နေဆဲ အော်ဒါများတွင် နောက်မှထပ်မှာသော ဟင်းပွဲများကို လွတ်မသွားစေရန် ကူညီပေးပါသည်။',
        ]},
        { type: 'heading', content: 'ဟင်းပွဲများကို ပယ်ဖျက်ခြင်း (စောင့်ဆိုင်းဆဲ ဟင်းပွဲများသာ)' },
        { type: 'list', content: [
          'စောင့်ဆိုင်းဆဲ ဟင်းပွဲများ၏ ဘေးရှိ "✕ Remove" ခလုတ်ကို နှိပ်ပါ။',
          'အတည်ပြုချက် တောင်းခံသည့် အကွက်ပေါ်လာပါမည်။',
          'ထိုဟင်းပွဲကို အော်ဒါစာရင်းနှင့် မီးဖိုချောင်မှ ဖယ်ရှားလိုက်မည် ဖြစ်ပါသည်။',
          'အော်ဒါ၏ စုစုပေါင်းကျသင့်ငွေကို အလိုအလျောက် ပြန်လည်တွက်ချက်ပေးပါမည်။',
          'နုတ်ထားသော ပါဝင်ပစ္စည်းများကို ကုန်လက်ကျန်ထဲသို့ ပြန်လည်ပေါင်းထည့်ပေးမည် ဖြစ်ပါသည်။',
        ]},
        { type: 'heading', content: 'အော်ဒါတစ်ခုလုံး ပြီးစီးကြောင်း အလိုအလျောက် သိရှိခြင်း' },
        { type: 'text', content: 'အော်ဒါတစ်ခုအတွင်းရှိ ဟင်းပွဲအားလုံး "Served (ပို့ဆောင်ပြီး)" အဆင့်သို့ ရောက်ရှိသွားပါက၊ အဆိုပါအော်ဒါ၏ အခြေအနေကို အလိုအလျောက် "Served" သို့ ပြောင်းလဲပေးမည်ဖြစ်ပြီး ငွေရှင်းလင်းရန်အတွက် Orders စာမျက်နှာတွင် ပေါ်လာမည်ဖြစ်ပါသည်။' },
        { type: 'note', content: 'ဘေးဘက်ဘား (Sidebar) ပေါ်တွင် ချက်ပြုတ်ရန် ကျန်ရှိနေသော ဟင်းပွဲအရေအတွက်ကို အချိန်နှင့်တပြေးညီ ပြသပေးထားပါသည်။' },
      ],
    },
    {
      id: 'orders',
      titleKey: 'manual.orders',
      icon: '📋',
      contentEN: [
        { type: 'heading', content: 'Orders Page' },
        { type: 'text', content: 'Manage all orders, process payments, and view order history.' },
        { type: 'heading', content: 'Three Tabs' },
        { type: 'list', content: [
          '🔥 Active Orders - Orders in progress (pending → served)',
          '📅 Today - All orders from today',
          '📜 History - Orders from previous days',
        ]},
        { type: 'heading', content: 'Order Grouping' },
        { type: 'list', content: [
          'Orders grouped by type: Dine-in Tables, Takeout, Delivery',
          'Sub-groups by time: Last Hour, 1-3 Hours Ago, Older',
        ]},
        { type: 'heading', content: 'Expanding Orders' },
        { type: 'list', content: [
          'Click order card to expand',
          'Shows all items with individual status badges',
          'Item statuses: ⏳ pending, 🔥 preparing, ✅ ready, 🍽 served',
          'Shows totals and available actions',
        ]},
        { type: 'heading', content: 'Removing Items (Pending Only)' },
        { type: 'list', content: [
          'Expanded order shows "✕" button next to pending items',
          'Click to remove item from order',
          'Confirmation dialog appears',
          'Order total recalculates',
          'Stock returned to inventory',
        ]},
        { type: 'heading', content: 'Processing Payment' },
        { type: 'list', content: [
          '1. Find order with "served" status',
          '2. Click "💰 Pay & Complete"',
          '3. Right-side panel opens with order summary',
          '4. Select payment method: Card/Cash/QR',
          '5. Click "Complete Payment"',
          '6. Loading spinner processes',
          '7. Receipt slip auto-opens',
        ]},
        { type: 'heading', content: 'Canceling Orders' },
        { type: 'list', content: [
          'Active orders show "🗑 Cancel" button',
          'Click to cancel with confirmation',
          'Cancelled orders move to history',
        ]},
        { type: 'heading', content: 'View Receipt' },
        { type: 'list', content: [
          'Completed orders show "🧾 View Receipt" button',
          'Opens receipt slip with order details',
          'Can print receipt from slip',
        ]},
      ],
      contentMM: [
        { type: 'heading', content: 'အော်ဒါများ စီမံခန့်ခွဲသည့် စာမျက်နှာ' },
        { type: 'text', content: 'အော်ဒါအားလုံးကို စီမံခန့်ခွဲခြင်း၊ ငွေရှင်းပေးခြင်းနှင့် အော်ဒါမှတ်တမ်းများကို ကြည့်ရှုနိုင်ပါသည်။' },
        { type: 'heading', content: 'အဓိက တက်ဘ် (Tab) သုံးခု' },
        { type: 'list', content: [
          '🔥 လက်ရှိ အော်ဒါများ - လုပ်ဆောင်နေဆဲဖြစ်သော အော်ဒါများ (စောင့်ဆိုင်းဆဲမှ ပို့ဆောင်ပြီးအထိ)',
          '📅 ယနေ့ - ယနေ့အတွင်း ရောင်းချထားသော အော်ဒါများအားလုံး',
          '📜 မှတ်တမ်း - ယခင်ရက်များမှ အော်ဒါမှတ်တမ်းများ',
        ]},
        { type: 'heading', content: 'အော်ဒါများကို အုပ်စုခွဲခြားခြင်း' },
        { type: 'list', content: [
          'အော်ဒါအမျိုးအစားအလိုက် ခွဲခြားပြသသည် (ဆိုင်စား၊ ပါဆယ်၊ အိမ်တိုင်ရာရောက်ပို့)',
          'အချိန်ပိုင်းအလိုက် ထပ်မံခွဲခြားပြသသည် (လွန်ခဲ့သော ၁ နာရီအတွင်း၊ ၁ နာရီမှ ၃ နာရီအတွင်း၊ ထို့ထက်စောသော)',
        ]},
        { type: 'heading', content: 'အော်ဒါအသေးစိတ် ကြည့်ရှုခြင်း' },
        { type: 'list', content: [
          'အော်ဒါကတ်ကို နှိပ်၍ အသေးစိတ်ကို ဖွင့်ကြည့်နိုင်ပါသည်။',
          'ပါဝင်သော ဟင်းပွဲအားလုံးကို သက်ဆိုင်ရာ အခြေအနေပြ အမှတ်အသားများဖြင့် ပြသပေးထားပါသည်။',
          'ဟင်းပွဲအခြေအနေများ - ⏳ စောင့်ဆိုင်းဆဲ၊ 🔥 ပြင်ဆင်နေဆဲ၊ ✅ အသင့်ဖြစ်၊ 🍽 ပို့ဆောင်ပြီး',
          'စုစုပေါင်း ကျသင့်ငွေနှင့် လုပ်ဆောင်နိုင်သော ခလုတ်များကို ပြသပေးပါသည်။',
        ]},
        { type: 'heading', content: 'ဟင်းပွဲများကို ပယ်ဖျက်ခြင်း (စောင့်ဆိုင်းဆဲ ဟင်းပွဲများသာ)' },
        { type: 'list', content: [
          'အော်ဒါအသေးစိတ်တွင် စောင့်ဆိုင်းဆဲ ဟင်းပွဲများဘေး၌ "✕" ခလုတ်ကို တွေ့ရပါမည်။',
          'ထိုခလုတ်ကို နှိပ်၍ ဟင်းပွဲကို အော်ဒါထဲမှ ဖယ်ရှားနိုင်ပါသည်။',
          'အတည်ပြုချက် တောင်းခံသည့် အကွက်ပေါ်လာပါမည်။',
          'အော်ဒါ၏ စုစုပေါင်းကျသင့်ငွေကို အလိုအလျောက် ပြန်လည်တွက်ချက်ပေးပါမည်။',
          'နုတ်ထားသော ပါဝင်ပစ္စည်းများကို ကုန်လက်ကျန်ထဲသို့ ပြန်လည်ပေါင်းထည့်ပေးမည် ဖြစ်ပါသည်။',
        ]},
        { type: 'heading', content: 'ငွေပေးချေမှု လုပ်ဆောင်ခြင်း (Payment)' },
        { type: 'list', content: [
          '၁။ "Served (ပို့ဆောင်ပြီး)" အခြေအနေရှိသော အော်ဒါကို ရှာပါ။',
          '၂။ "💰 Pay & Complete" ကိုနှိပ်ပါ။',
          '၃။ ညာဘက်အခြမ်းတွင် အော်ဒါအကျဉ်းချုပ် ပေါ်လာပါမည်။',
          '၄။ ငွေပေးချေမည့် ပုံစံကို ရွေးချယ်ပါ (ကတ်/ငွေသား/QR)။',
          '၅။ "Complete Payment" ကိုနှိပ်ပါ။',
          '၆။ စနစ်မှ မှတ်တမ်းတင်ခြင်းကို လုပ်ဆောင်ပါမည်။',
          '၇။ ဘေလ်ဖြတ်ပိုင်း (Receipt Slip) အလိုအလျောက် ပေါ်လာပါမည်။',
        ]},
        { type: 'heading', content: 'အော်ဒါများကို ပယ်ဖျက်ခြင်း (Cancel)' },
        { type: 'list', content: [
          'လက်ရှိအော်ဒါများတွင် "🗑 Cancel" ခလုတ်ကို တွေ့ရပါမည်။',
          'နှိပ်ပြီး အတည်ပြုပါက အော်ဒါပယ်ဖျက်ခြင်း ပြီးမြောက်ပါမည်။',
          'ပယ်ဖျက်လိုက်သော အော်ဒါများသည် မှတ်တမ်း (History) ထဲသို့ ရောက်ရှိသွားပါမည်။',
        ]},
        { type: 'heading', content: 'ဘေလ်ဖြတ်ပိုင်း ကြည့်ရှုခြင်း (Receipt)' },
        { type: 'list', content: [
          'ပြီးစီးသွားသော အော်ဒါများတွင် "🧾 View Receipt" ခလုတ်ကို တွေ့ရပါမည်။',
          'အော်ဒါအသေးစိတ်ပါဝင်သော ဘေလ်ဖြတ်ပိုင်းကို ဖွင့်ပြပေးပါမည်။',
          'ဘေလ်ဖြတ်ပိုင်းကို Print ထုတ်ယူနိုင်ပါသည်။',
        ]},
      ],
    },
    {
      id: 'orders-by-date',
      titleKey: 'manual.ordersByDate',
      icon: '📅',
      contentEN: [
        { type: 'heading', content: 'Date-Based Filtering' },
        { type: 'text', content: 'View orders and stock purchases within specific date ranges.' },
        { type: 'heading', content: 'Date Filters' },
        { type: 'list', content: [
          '📅 Start Date - Beginning of date range',
          '📅 End Date - End of date range',
          '🔄 Clear Dates - Reset to show all data',
        ]},
        { type: 'heading', content: 'Summary Cards' },
        { type: 'list', content: [
          'Orders Tab: Total Revenue, Total Orders, Completed, Cancelled',
          'Purchases Tab: Total Cost, Total Items, Purchases Count, Avg Cost',
        ]},
        { type: 'heading', content: 'Orders Tab (📋)' },
        { type: 'list', content: [
          'Shows all orders within date range',
          'Columns: Order #, Customer, Type, Items, Date & Time, Status, Total',
          'Sorted by date (newest first)',
          '15 rows per page with pagination',
        ]},
        { type: 'heading', content: 'Purchases Tab (📦)' },
        { type: 'list', content: [
          'Shows stock movements with type "purchase"',
          'Columns: Product, Reference, Quantity, Cost/Unit, Total Cost, Notes, Date & Time',
          'Sorted by date (newest first)',
          '15 rows per page with pagination',
        ]},
        { type: 'heading', content: 'Pagination' },
        { type: 'list', content: [
          'Shows "Showing X-Y of Z records"',
          'Prev/Next buttons with disabled states',
          'Numbered page buttons (max 7 shown)',
          'Current page highlighted in yellow',
        ]},
      ],
      contentMM: [
        { type: 'heading', content: 'ရက်စွဲအလိုက် စစ်ထုတ်ကြည့်ရှုခြင်း' },
        { type: 'text', content: 'သတ်မှတ်ထားသော ရက်စွဲအပိုင်းအခြားအတွင်းရှိ အော်ဒါများနှင့် ကုန်ပစ္စည်းအဝယ်စာရင်းများကို ကြည့်ရှုနိုင်ပါသည်။' },
        { type: 'heading', content: 'ရက်စွဲ စစ်ထုတ်စနစ်များ' },
        { type: 'list', content: [
          '📅 စတင်ရက် - ရှာဖွေမည့် ကာလအစ',
          '📅 ပြီးဆုံးရက် - ရှာဖွေမည့် ကာလအဆုံး',
          '🔄 ရက်စွဲများကို ရှင်းလင်းရန် - အချက်အလက်အားလုံးကို ပြန်လည်ပြသရန်',
        ]},
        { type: 'heading', content: 'အကျဉ်းချုပ် ကတ်များ' },
        { type: 'list', content: [
          'အော်ဒါ Tab - စုစုပေါင်းဝင်ငွေ၊ အော်ဒါအရေအတွက်၊ ပြီးစီးမှု၊ ပယ်ဖျက်မှု',
          'အဝယ်စာရင်း Tab - စုစုပေါင်းကုန်ကျငွေ၊ ပစ္စည်းအရေအတွက်၊ ဝယ်ယူမှုအကြိမ်ရေ၊ ပျမ်းမျှကုန်ကျငွေ',
        ]},
        { type: 'heading', content: 'အော်ဒါများ Tab (📋)' },
        { type: 'list', content: [
          'ရွေးချယ်ထားသော ရက်စွဲအတွင်းရှိ အော်ဒါအားလုံးကို ပြသပေးပါသည်။',
          'ပါဝင်သော ကော်လံများ - အော်ဒါအမှတ်၊ ဖောက်သည်အမည်၊ အမျိုးအစား၊ ဟင်းပွဲများ၊ ရက်စွဲနှင့်အချိန်၊ အခြေအနေ၊ စုစုပေါင်းကျသင့်ငွေ',
          'ရက်စွဲအသစ်များကို အပေါ်ဆုံးတွင် ထားရှိပြသပေးပါသည်။',
          'စာမျက်နှာတစ်ခုလျှင် အချက်အလက် ၁၅ ကြောင်း ပြသပေးပါသည်။',
        ]},
        { type: 'heading', content: 'အဝယ်စာရင်း Tab (📦)' },
        { type: 'list', content: [
          '"Purchase (အဝယ်)" အမျိုးအစားဖြင့် ဝင်ထားသော ကုန်ပစ္စည်းစာရင်းများကို ပြသပေးပါသည်။',
          'ပါဝင်သော ကော်လံများ - ကုန်ပစ္စည်းအမည်၊ ဘောက်ချာအမှတ်၊ အရေအတွက်၊ ခုရေတန်ဖိုး၊ စုစုပေါင်းကုန်ကျငွေ၊ မှတ်ချက်၊ ရက်စွဲနှင့်အချိန်',
          'ရက်စွဲအသစ်များကို အပေါ်ဆုံးတွင် ထားရှိပြသပေးပါသည်။',
          'စာမျက်နှာတစ်ခုလျှင် အချက်အလက် ၁၅ ကြောင်း ပြသပေးပါသည်။',
        ]},
        { type: 'heading', content: 'စာမျက်နှာ ခွဲခြားခြင်း (Pagination)' },
        { type: 'list', content: [
          '"Showing X-Y of Z records" (မှတ်တမ်းစုစုပေါင်း Z အနက် X မှ Y အထိ ပြသထားသည်) ဟု ပြသထားပါသည်။',
          'အရှေ့/အနောက် သွားနိုင်သော ခလုတ်များ ပါဝင်ပါသည်။',
          'စာမျက်နှာနံပါတ် ခလုတ်များကို အများဆုံး ၇ ခုအထိ ပြသပေးပါသည်။',
          'လက်ရှိကြည့်ရှုနေသော စာမျက်နှာကို အဝါရောင်ဖြင့် ပြသပေးထားပါသည်။',
        ]},
      ],
    },
    {
      id: 'stock',
      titleKey: 'manual.stock',
      icon: '📦',
      contentEN: [
        { type: 'heading', content: 'Stock Management' },
        { type: 'text', content: 'Manage inventory, track stock movements, and configure products.' },
        { type: 'heading', content: 'Stat Cards (Clickable Filters)' },
        { type: 'list', content: [
          '📊 Total Products - Click to show all products',
          '⚠️ Low Stock - Click to show only items below reorder point',
          '✅ In Stock - Click to show only items above reorder point',
          '💰 Inventory Value - Shows total value (non-clickable)',
        ]},
        { type: 'heading', content: 'Adding a Product' },
        { type: 'list', content: [
          '1. Click "+ Add Product" button',
          '2. Step 1: Basic Info - Name, emoji, category',
          '3. Step 2: Pricing - Selling price and cost price',
          '4. Step 3: Stock Setup - Units, initial stock, reorder point',
          '5. Review summary and click "Add Product"',
        ]},
        { type: 'heading', content: 'Product Table' },
        { type: 'list', content: [
          'Shows: Product, Category, Stock, Reorder, Status, Cost, Price, Actions',
          '10 rows per page with pagination',
          'Newest products appear first (reverse order)',
          'Status: ⚠️ LOW (red) or ✅ OK (green)',
        ]},
        { type: 'heading', content: 'Stock History' },
        { type: 'list', content: [
          'Click "📋 History" on any product',
          'Shows all movements: purchase, sale, adjustment, waste, return',
          'Columns: Type, Quantity, Unit, Cost, Total Cost, Reference, Notes, Date',
        ]},
        { type: 'heading', content: 'Purchase Stock' },
        { type: 'list', content: [
          'Click "📥 Purchase" on any product',
          'Enter quantity, unit, cost per unit, notes',
          'Live unit conversion preview',
          'Updates stock and creates movement record',
        ]},
        { type: 'heading', content: 'Editing Products' },
        { type: 'list', content: [
          'Click "Edit" button',
          'Modify stock, reorder point, price, cost price, units',
          'Click "Save" to apply changes',
        ]},
        { type: 'heading', content: 'Archiving Products (Soft Delete)' },
        { type: 'list', content: [
          'Click "Delete" button',
          'System checks usage in orders, recipes, movements',
          'Shows warning modal with usage statistics',
          'Archiving hides product but preserves historical data',
          'Orders and recipes continue to reference archived products',
        ]},
        { type: 'warning', content: 'Archived products cannot be used in new orders but remain visible in historical data.' },
      ],
      contentMM: [
        { type: 'heading', content: 'ကုန်လက်ကျန် (Stock) စီမံခန့်ခွဲခြင်း' },
        { type: 'text', content: 'ကုန်ပစ္စည်းများကို ထည့်သွင်းခြင်း၊ လက်ကျန်အဝင်အထွက်များကို ခြေရာခံခြင်းနှင့် ဆက်တင်များကို လုပ်ဆောင်နိုင်ပါသည်။' },
        { type: 'heading', content: 'အချက်အလက် ကတ်များ (နှိပ်၍ စစ်ထုတ်နိုင်သည်)' },
        { type: 'list', content: [
          '📊 စုစုပေါင်း ကုန်ပစ္စည်း - နှိပ်၍ ပစ္စည်းအားလုံးကို ကြည့်ရန်',
          '⚠️ လက်ကျန်နည်းနေသော ပစ္စည်း - သတ်မှတ်ထားသော အနည်းဆုံးပမာဏ (Reorder Point) အောက် ရောက်နေသော ပစ္စည်းများသာကြည့်ရန်',
          '✅ လက်ကျန်လုံလောက်သော ပစ္စည်း - သတ်မှတ်ထားသော ပမာဏအထက် ရှိနေသော ပစ္စည်းများသာကြည့်ရန်',
          '💰 ကုန်ပစ္စည်း စုစုပေါင်းတန်ဖိုး - လက်ရှိကုန်လက်ကျန်၏ ငွေကြေးတန်ဖိုး (နှိပ်၍မရပါ)',
        ]},
        { type: 'heading', content: 'ကုန်ပစ္စည်းအသစ် ထည့်သွင်းခြင်း' },
        { type: 'list', content: [
          '၁။ "+ Add Product" ကိုနှိပ်ပါ။',
          '၂။ အဆင့် ၁ - အခြေခံအချက်အလက်များ (အမည်၊ Icon (Emoji)၊ အမျိုးအစား)',
          '၃။ အဆင့် ၂ - ဈေးနှုန်း (ရောင်းဈေး၊ ဝယ်ရင်းဈေး)',
          '၄။ အဆင့် ၃ - ကုန်လက်ကျန် သတ်မှတ်ချက် (ရေတွက်ပုံ (Unit)၊ လက်ရှိအရေအတွက်၊ ထပ်မှာရန် သတိပေးရမည့်ပမာဏ)',
          '၅။ အကျဉ်းချုပ်ကို ပြန်လည်စစ်ဆေးပြီး "Add Product" ကို နှိပ်၍ သိမ်းဆည်းပါ။',
        ]},
        { type: 'heading', content: 'ကုန်ပစ္စည်း ဇယား' },
        { type: 'list', content: [
          'ပါဝင်သော အချက်များ - ကုန်ပစ္စည်းအမည်၊ အမျိုးအစား၊ လက်ကျန်အရေအတွက်၊ သတိပေးပမာဏ၊ အခြေအနေ၊ ဝယ်ရင်းဈေး၊ ရောင်းဈေး၊ လုပ်ဆောင်ချက်များ',
          'စာမျက်နှာတစ်ခုလျှင် အချက်အလက် ၁၀ ကြောင်း ပြသပေးပါသည်။',
          'နောက်ဆုံးထည့်သွင်းထားသော ကုန်ပစ္စည်းများကို အပေါ်ဆုံးတွင် ပြသပေးပါသည်။',
          'အခြေအနေ - ⚠️ LOW (လက်ကျန်နည်း - အနီ) သို့မဟုတ် ✅ OK (လုံလောက်သည် - အစိမ်း)',
        ]},
        { type: 'heading', content: 'ကုန်လက်ကျန် အဝင်အထွက် မှတ်တမ်း' },
        { type: 'list', content: [
          'ကုန်ပစ္စည်းတစ်ခုချင်းစီရှိ "📋 History" ခလုတ်ကို နှိပ်ပါ။',
          'အဝင်အထွက်မှတ်တမ်း အားလုံးကို ပြသပေးပါမည် - အဝယ်၊ အရောင်း၊ စာရင်းညှိခြင်း၊ အလေအလွင့်၊ ပြန်သွင်းခြင်း',
          'ပါဝင်သော ကော်လံများ - အမျိုးအစား၊ အရေအတွက်၊ ယူနစ်၊ ခုရေတန်ဖိုး၊ စုစုပေါင်း၊ ဘောက်ချာအမှတ်၊ မှတ်ချက်၊ ရက်စွဲ',
        ]},
        { type: 'heading', content: 'ကုန်ပစ္စည်း အသစ်ဝယ်ယူခြင်း (Purchase)' },
        { type: 'list', content: [
          'ကုန်ပစ္စည်းတစ်ခုချင်းစီရှိ "📥 Purchase" ကိုနှိပ်ပါ။',
          'အရေအတွက်၊ ယူနစ်၊ ယူနစ်တစ်ခု၏ တန်ဖိုး၊ မှတ်ချက် တို့ကို ရိုက်ထည့်ပါ။',
          'ယူနစ် အပြောင်းအလဲ တွက်ချက်မှုကို ချက်ချင်း ကြည့်ရှုနိုင်ပါသည်။',
          'ကုန်လက်ကျန်ကို အလိုအလျောက် ပေါင်းထည့်ပေးပြီး မှတ်တမ်းအသစ် ဖန်တီးပေးပါမည်။',
        ]},
        { type: 'heading', content: 'ကုန်ပစ္စည်းအချက်အလက်များ ပြင်ဆင်ခြင်း' },
        { type: 'list', content: [
          '"Edit" ခလုတ်ကို နှိပ်ပါ။',
          'လက်ကျန်အရေအတွက်၊ သတိပေးပမာဏ၊ ဈေးနှုန်းများ၊ ယူနစ်တို့ကို ပြင်ဆင်နိုင်ပါသည်။',
          '"Save" ကိုနှိပ်၍ အပြောင်းအလဲများကို သိမ်းဆည်းပါ။',
        ]},
        { type: 'heading', content: 'ကုန်ပစ္စည်းများကို မှတ်တမ်းအဖြစ် သိမ်းဆည်းခြင်း (Soft Delete)' },
        { type: 'list', content: [
          '"Delete" ခလုတ်ကို နှိပ်ပါ။',
          'ယခင်အသုံးပြုခဲ့သော အော်ဒါများ၊ ဟင်းပွဲများနှင့် မှတ်တမ်းများရှိ/မရှိကို စနစ်မှ စစ်ဆေးပေးပါမည်။',
          'အသုံးပြုထားမှု စာရင်းနှင့်တကွ သတိပေးစာ ပေါ်လာပါမည်။',
          'ပယ်ဖျက်လိုက်ပါက ကုန်ပစ္စည်းကို ဖျောက်ထားမည်ဖြစ်သော်လည်း ယခင်မှတ်တမ်းများ မပျောက်ပျက်စေရန် ထိန်းသိမ်းထားမည် ဖြစ်ပါသည်။',
          'ယခင်အော်ဒါများနှင့် ဟင်းပွဲများတွင် အဆိုပါ ကုန်ပစ္စည်းကို ဆက်လက် တွေ့မြင်ရမည် ဖြစ်ပါသည်။',
        ]},
        { type: 'warning', content: 'မှတ်တမ်းအဖြစ် သိမ်းဆည်းလိုက်သော ကုန်ပစ္စည်းများကို အော်ဒါအသစ်များတွင် အသုံးပြုနိုင်မည် မဟုတ်တော့ပါ။ သို့သော် ယခင်မှတ်တမ်းဟောင်းများတွင်မူ ဆက်လက်မြင်တွေ့ရမည် ဖြစ်ပါသည်။' },
      ],
    },
    {
      id: 'recipes',
      titleKey: 'manual.recipes',
      icon: '📖',
      contentEN: [
        { type: 'heading', content: 'Recipe Management' },
        { type: 'text', content: 'Create menu items with ingredients linked to stock products.' },
        { type: 'heading', content: 'Adding a Recipe' },
        { type: 'list', content: [
          '1. Click "+ Add Recipe"',
          '2. Enter name, category, description, price',
          '3. Select emoji for visual identification',
          '4. Add ingredients from stock products',
          '5. Set quantity and unit per ingredient',
          '6. Click "Add Recipe" to save',
        ]},
        { type: 'heading', content: 'Ingredients' },
        { type: 'list', content: [
          'Each recipe has multiple ingredients',
          'Ingredients link to products in stock',
          'Quantity and unit specified per ingredient',
          'Edit ingredients after recipe creation',
        ]},
        { type: 'heading', content: 'Auto Stock Deduction' },
        { type: 'text', content: 'When an order includes a recipe item, the system automatically deducts all ingredient quantities from stock when the order is placed.' },
        { type: 'heading', content: 'Editing Recipes' },
        { type: 'list', content: [
          'Click "Edit" on recipe card',
          'Modify name, category, description, price',
          'Add/remove/edit ingredients',
          'Toggle active/inactive status',
        ]},
        { type: 'heading', content: 'Recipe Cards' },
        { type: 'list', content: [
          'Shows: Emoji, name, category, price',
          'Ingredient count badge',
          'Active status indicator',
          'Edit and Delete buttons',
        ]},
      ],
      contentMM: [
        { type: 'heading', content: 'ဟင်းပွဲနှင့် ပါဝင်ပစ္စည်းများ စီမံခန့်ခွဲခြင်း' },
        { type: 'text', content: 'ကုန်လက်ကျန်စာရင်း (Stock) ရှိ ပစ္စည်းများနှင့် ချိတ်ဆက်ထားသော ပါဝင်ပစ္စည်းများဖြင့် မီနူးဟင်းပွဲများ ဖန်တီးနိုင်ပါသည်။' },
        { type: 'heading', content: 'ဟင်းပွဲအသစ် ထည့်သွင်းခြင်း' },
        { type: 'list', content: [
          '၁။ "+ Add Recipe" ကို နှိပ်ပါ။',
          '၂။ အမည်၊ အမျိုးအစား၊ အညွှန်းစာ နှင့် ဈေးနှုန်းတို့ကို ရိုက်ထည့်ပါ။',
          '၃။ မှတ်မိလွယ်စေရန် Icon (Emoji) ရွေးချယ်ပါ။',
          '၄။ Stock ထဲရှိ ကုန်ပစ္စည်းများကို ပါဝင်ပစ္စည်းအဖြစ် ထည့်သွင်းပါ။',
          '၅။ ပါဝင်ပစ္စည်းတစ်ခုချင်းစီအတွက် လိုအပ်သော အရေအတွက်နှင့် ယူနစ်ကို သတ်မှတ်ပါ။',
          '၆။ "Add Recipe" ကို နှိပ်၍ သိမ်းဆည်းပါ။',
        ]},
        { type: 'heading', content: 'ပါဝင်ပစ္စည်းများ (Ingredients)' },
        { type: 'list', content: [
          'ဟင်းပွဲတစ်ပွဲတွင် ပါဝင်ပစ္စည်းပေါင်းများစွာ ထည့်သွင်းနိုင်ပါသည်။',
          'ပါဝင်ပစ္စည်းများသည် Stock ရှိ ကုန်ပစ္စည်းများနှင့် တိုက်ရိုက် ချိတ်ဆက်ထားပါသည်။',
          'ပါဝင်ပစ္စည်းတစ်ခုချင်းစီအတွက် သုံးစွဲမည့် အရေအတွက်နှင့် ယူနစ်ကို တိကျစွာ သတ်မှတ်ပေးရပါမည်။',
          'ဟင်းပွဲဖန်တီးပြီးနောက်မှလည်း ပါဝင်ပစ္စည်းများကို ပြန်လည်ပြင်ဆင်နိုင်ပါသည်။',
        ]},
        { type: 'heading', content: 'ကုန်လက်ကျန်မှ အလိုအလျောက် နုတ်ယူခြင်း' },
        { type: 'text', content: 'ဧည့်သည်မှ ဟင်းပွဲတစ်ပွဲကို မှာယူလိုက်သည်နှင့် တစ်ပြိုင်နက်၊ ထိုဟင်းပွဲတွင်ပါဝင်သော ပါဝင်ပစ္စည်းများအားလုံးကို သတ်မှတ်ထားသော ပမာဏအတိုင်း Stock ထဲမှ အလိုအလျောက် လျှော့ချပေးမည် ဖြစ်ပါသည်။' },
        { type: 'heading', content: 'ဟင်းပွဲများ ပြင်ဆင်ခြင်း' },
        { type: 'list', content: [
          'ဟင်းပွဲကတ်ပေါ်ရှိ "Edit" ခလုတ်ကို နှိပ်ပါ။',
          'အမည်၊ အမျိုးအစား၊ အညွှန်းစာ နှင့် ဈေးနှုန်းတို့ကို ပြင်ဆင်နိုင်ပါသည်။',
          'ပါဝင်ပစ္စည်းများကို အသစ်ထည့်ခြင်း၊ ဖယ်ရှားခြင်း၊ ပြင်ဆင်ခြင်းများ ပြုလုပ်နိုင်ပါသည်။',
          'မီနူးကို ရောင်းချမည် (Active) သို့မဟုတ် ခေတ္တပိတ်ထားမည် (Inactive) ကို ပြောင်းလဲနိုင်ပါသည်။',
        ]},
        { type: 'heading', content: 'ဟင်းပွဲ ကတ်များ' },
        { type: 'list', content: [
          'ပါဝင်သော အချက်များ - Icon (Emoji)၊ အမည်၊ အမျိုးအစား၊ ဈေးနှုန်း',
          'ပါဝင်ပစ္စည်း အရေအတွက် ပြသပေးသော အမှတ်အသား',
          'ရောင်းချနေ/မနေ (Active/Inactive) အခြေအနေပြ အမှတ်အသား',
          'ပြင်ဆင်ရန် (Edit) နှင့် ဖယ်ရှားရန် (Delete) ခလုတ်များ',
        ]},
      ],
    },
    {
      id: 'customers',
      titleKey: 'manual.customers',
      icon: '👥',
      contentEN: [
        { type: 'heading', content: 'Customer Management' },
        { type: 'text', content: 'Manage customer profiles and track loyalty information.' },
        { type: 'heading', content: 'Stat Cards' },
        { type: 'list', content: [
          '👥 Total Customers - Total registered customers',
          '🏆 Gold+ - Customers with Gold tier or higher',
          '💰 Total Revenue - Combined spending across all customers',
          '📊 Avg Spent - Average spending per customer',
        ]},
        { type: 'heading', content: 'Loyalty Tiers' },
        { type: 'list', content: [
          '🥉 Bronze - Default tier for new customers',
          '🥈 Silver - Regular customers',
          '🥇 Gold - Valued customers',
          '💎 Platinum - Top-tier customers',
        ]},
        { type: 'heading', content: 'Adding a Customer' },
        { type: 'list', content: [
          '1. Click "+ Add Customer"',
          '2. Enter name, phone, email (optional)',
          '3. Notes field for special preferences',
          '4. Tier auto-calculates based on spending',
          '5. Click "Add Customer" to save',
        ]},
        { type: 'heading', content: 'Customer Table' },
        { type: 'list', content: [
          'Shows: Name, Phone, Email, Total Orders, Total Spent, Tier, Last Visit',
          'Search by name, phone, or email',
          'Edit and Delete buttons per row',
        ]},
        { type: 'heading', content: 'Editing Customers' },
        { type: 'list', content: [
          'Click "Edit" button',
          'Modify name, phone, email, notes',
          'Tier updates automatically based on spending',
        ]},
        { type: 'note', content: 'Customer tier automatically upgrades based on total_spent threshold (configurable in database).' },
      ],
      contentMM: [
        { type: 'heading', content: 'ဖောက်သည် (Customer) စီမံခန့်ခွဲခြင်း' },
        { type: 'text', content: 'ဖောက်သည်များ၏ ကိုယ်ရေးအချက်အလက်များကို စီမံခန့်ခွဲခြင်းနှင့် ၎င်းတို့၏ သုံးစွဲမှုမှတ်တမ်း (Loyalty) ကို ခြေရာခံနိုင်ပါသည်။' },
        { type: 'heading', content: 'အချက်အလက် ကတ်များ' },
        { type: 'list', content: [
          '👥 စုစုပေါင်း ဖောက်သည် - စာရင်းသွင်းထားသော ဖောက်သည် အရေအတွက်',
          '🏆 Gold+ - ရွှေအဆင့် (Gold Tier) နှင့်အထက်ရှိသော ဖောက်သည်များ',
          '💰 စုစုပေါင်း ဝင်ငွေ - ဖောက်သည်အားလုံး၏ စုစုပေါင်း သုံးစွဲထားသော ငွေပမာဏ',
          '📊 ပျမ်းမျှ သုံးစွဲငွေ - ဖောက်သည်တစ်ဦးချင်းစီ၏ ပျမ်းမျှ သုံးစွဲငွေ',
        ]},
        { type: 'heading', content: 'ဖောက်သည် အဆင့်များ (Loyalty Tiers)' },
        { type: 'list', content: [
          '🥉 Bronze (ကြေး) - ဖောက်သည်အသစ်များအတွက် ပုံသေအဆင့်',
          '🥈 Silver (ငွေ) - ပုံမှန်လာရောက်စားသုံးသော ဖောက်သည်များ',
          '🥇 Gold (ရွှေ) - အထူး တန်ဖိုးထားရသော ဖောက်သည်များ',
          '💎 Platinum (ပလက်တီနမ်) - ထိပ်တန်း VIP ဖောက်သည်များ',
        ]},
        { type: 'heading', content: 'ဖောက်သည်အသစ် ထည့်သွင်းခြင်း' },
        { type: 'list', content: [
          '၁။ "+ Add Customer" ကိုနှိပ်ပါ။',
          '၂။ အမည်၊ ဖုန်းနံပါတ်၊ အီးမေးလ် (ထည့်ချင်မှသာ) တို့ကို ရိုက်ထည့်ပါ။',
          '၃။ အထူးနှစ်သက်မှုများ ရှိပါက မှတ်ချက် (Notes) နေရာတွင် ရေးမှတ်ထားနိုင်ပါသည်။',
          '၄။ ဖောက်သည်၏ အဆင့်ကို သုံးစွဲငွေအပေါ်မူတည်၍ အလိုအလျောက် သတ်မှတ်ပေးပါမည်။',
          '၅။ "Add Customer" ကို နှိပ်၍ သိမ်းဆည်းပါ။',
        ]},
        { type: 'heading', content: 'ဖောက်သည် စာရင်း ဇယား' },
        { type: 'list', content: [
          'ပါဝင်သော အချက်များ - အမည်၊ ဖုန်း၊ အီးမေးလ်၊ စုစုပေါင်း အော်ဒါအရေအတွက်၊ စုစုပေါင်း သုံးစွဲငွေ၊ အဆင့်၊ နောက်ဆုံးလာရောက်ခဲ့သည့်ရက်',
          'အမည်၊ ဖုန်းနံပါတ် သို့မဟုတ် အီးမေးလ်တို့ဖြင့် ရှာဖွေနိုင်ပါသည်။',
          'အချက်အလက်ကြောင်းတိုင်းတွင် ပြင်ဆင်ရန် (Edit) နှင့် ဖယ်ရှားရန် (Delete) ခလုတ်များ ပါဝင်ပါသည်။',
        ]},
        { type: 'heading', content: 'ဖောက်သည် အချက်အလက်များ ပြင်ဆင်ခြင်း' },
        { type: 'list', content: [
          '"Edit" ခလုတ်ကို နှိပ်ပါ။',
          'အမည်၊ ဖုန်း၊ အီးမေးလ်၊ မှတ်ချက် တို့ကို ပြင်ဆင်နိုင်ပါသည်။',
          'ဖောက်သည်၏ အဆင့်မှာ သုံးစွဲငွေအလိုက် အလိုအလျောက် ပြောင်းလဲသွားမည် ဖြစ်ပါသည်။',
        ]},
        { type: 'note', content: 'ဖောက်သည်၏ အဆင့် (Tier) သည် စုစုပေါင်းသုံးစွဲငွေ (total_spent) ကန့်သတ်ချက်များအပေါ် မူတည်၍ အလိုအလျောက် မြင့်တက်သွားမည် ဖြစ်ပါသည်။ (Database တွင် သတ်မှတ်ချက်များ ပြင်ဆင်နိုင်ပါသည်)' },
      ],
    },
    {
      id: 'staff',
      titleKey: 'manual.staff',
      icon: '🧑‍💼',
      contentEN: [
        { type: 'heading', content: 'Staff Management' },
        { type: 'text', content: 'Manage employee records, roles, and duty status.' },
        { type: 'heading', content: 'Stat Cards' },
        { type: 'list', content: [
          '🧑‍💼 Total Staff - Total employees',
          '🟢 On-Duty - Currently working staff',
          '💼 Off-Duty - Not currently working',
          '☕ On Break - Currently on break',
        ]},
        { type: 'heading', content: 'Staff Roles' },
        { type: 'list', content: [
          '👔 Manager - Full access except user accounts',
          '👨‍🍳 Chef - Kitchen access only',
          '💰 Cashier - Cashier and Orders access',
          '🤵 Waiter - Orders, Kitchen, Customers',
          '🧹 Cleaner - Dashboard only',
        ]},
        { type: 'heading', content: 'Adding Staff' },
        { type: 'list', content: [
          '1. Click "+ Add Staff"',
          '2. Enter name, role, phone, email',
          '3. Select status (on-duty, off-duty, break)',
          '4. Optional: salary and hire date',
          '5. Click "Add Staff" to save',
        ]},
        { type: 'heading', content: 'Staff Table' },
        { type: 'list', content: [
          'Shows: Name, Role, Phone, Email, Status, Salary, Hire Date',
          'Filter by role using dropdown',
          'Search by name, phone, or email',
          'Status badges show current duty status',
        ]},
        { type: 'heading', content: 'Editing Staff' },
        { type: 'list', content: [
          'Click "Edit" button',
          'Modify name, role, phone, email, status',
          'Update salary or hire date',
        ]},
        { type: 'heading', content: 'Status Sync' },
        { type: 'list', content: [
          'Login via auth automatically marks staff as "on-duty"',
          'Logout automatically marks as "off-duty"',
          'Dashboard Online Staff card updates in real-time',
          'Creates staff record if none exists on login',
        ]},
      ],
      contentMM: [
        { type: 'heading', content: 'ဝန်ထမ်း စီမံခန့်ခွဲခြင်း' },
        { type: 'text', content: 'ဝန်ထမ်း မှတ်တမ်းများ၊ ရာထူးများနှင့် လက်ရှိတာဝန်ထမ်းဆောင်မှု အခြေအနေများကို စီမံခန့်ခွဲပါ။' },
        { type: 'heading', content: 'အချက်အလက် ကတ်များ' },
        { type: 'list', content: [
          '🧑‍💼 စုစုပေါင်း ဝန်ထမ်း - လုပ်ငန်းရှိ ဝန်ထမ်းအားလုံး',
          '🟢 တာဝန်ချိန် (On-Duty) - လက်ရှိ အလုပ်လုပ်နေသော ဝန်ထမ်းများ',
          '💼 တာဝန်ချိန်ပြင်ပ (Off-Duty) - လက်ရှိ အလုပ်မလုပ်နေသော ဝန်ထမ်းများ',
          '☕ နားနေချိန် (On Break) - လက်ရှိ အနားယူနေသော ဝန်ထမ်းများ',
        ]},
        { type: 'heading', content: 'ဝန်ထမ်း ရာထူးများ (Roles)' },
        { type: 'list', content: [
          '👔 Manager - အကောင့်များ စီမံခြင်းမှလွဲ၍ လုပ်ဆောင်ချက်အားလုံးကို အသုံးပြုနိုင်ပါသည်။',
          '👨‍🍳 Chef - မီးဖိုချောင်စနစ်ကိုသာ အသုံးပြုနိုင်ပါသည်။',
          '💰 Cashier - အရောင်းကောင်တာနှင့် အော်ဒါစီမံခြင်းများကို အသုံးပြုနိုင်ပါသည်။',
          '🤵 Waiter - အော်ဒါ၊ မီးဖိုချောင်နှင့် ဖောက်သည်စာရင်းတို့ကို အသုံးပြုနိုင်ပါသည်။',
          '🧹 Cleaner - ဒက်ရှ်ဘုတ်ကိုသာ ကြည့်ရှုနိုင်ပါသည်။',
        ]},
        { type: 'heading', content: 'ဝန်ထမ်းအသစ် ထည့်သွင်းခြင်း' },
        { type: 'list', content: [
          '၁။ "+ Add Staff" ကိုနှိပ်ပါ။',
          '၂။ အမည်၊ ရာထူး၊ ဖုန်းနံပါတ်၊ အီးမေးလ်တို့ကို ရိုက်ထည့်ပါ။',
          '၃။ အခြေအနေကို ရွေးချယ်ပါ (တာဝန်ချိန် / တာဝန်ချိန်ပြင်ပ / နားနေချိန်)။',
          '၄။ လစာနှင့် အလုပ်စတင်ဝင်ရောက်သည့်ရက်စွဲကို ထည့်လိုပါက ထည့်သွင်းနိုင်ပါသည်။',
          '၅။ "Add Staff" ကို နှိပ်၍ သိမ်းဆည်းပါ။',
        ]},
        { type: 'heading', content: 'ဝန်ထမ်း စာရင်း ဇယား' },
        { type: 'list', content: [
          'ပါဝင်သော အချက်များ - အမည်၊ ရာထူး၊ ဖုန်း၊ အီးမေးလ်၊ အခြေအနေ၊ လစာ၊ အလုပ်ဝင်သည့်ရက်',
          'Dropdown မှတစ်ဆင့် ရာထူးအလိုက် စစ်ထုတ်ကြည့်ရှုနိုင်ပါသည်။',
          'အမည်၊ ဖုန်းနံပါတ် သို့မဟုတ် အီးမေးလ်တို့ဖြင့် ရှာဖွေနိုင်ပါသည်။',
          'အခြေအနေပြ အမှတ်အသားများဖြင့် လက်ရှိတာဝန်ထမ်းဆောင်မှု အခြေအနေကို ပြသပေးထားပါသည်။',
        ]},
        { type: 'heading', content: 'ဝန်ထမ်း အချက်အလက်များ ပြင်ဆင်ခြင်း' },
        { type: 'list', content: [
          '"Edit" ခလုတ်ကို နှိပ်ပါ။',
          'အမည်၊ ရာထူး၊ ဖုန်း၊ အီးမေးလ်၊ အခြေအနေ တို့ကို ပြင်ဆင်နိုင်ပါသည်။',
          'လစာ သို့မဟုတ် အလုပ်ဝင်သည့်ရက်စွဲတို့ကို ပြင်ဆင်နိုင်ပါသည်။',
        ]},
        { type: 'heading', content: 'အလိုအလျောက် အခြေအနေ ပြောင်းလဲခြင်း (Status Sync)' },
        { type: 'list', content: [
          'အကောင့်ဖြင့် Login ဝင်လိုက်သည်နှင့် ဝန်ထမ်းကို "တာဝန်ချိန် (On-duty)" အဖြစ် အလိုအလျောက် မှတ်သားပါမည်။',
          'စနစ်မှ ပြန်ထွက် (Logout) လိုက်ပါက "တာဝန်ချိန်ပြင်ပ (Off-duty)" အဖြစ် အလိုအလျောက် ပြောင်းလဲပါမည်။',
          'ဒက်ရှ်ဘုတ်ရှိ အွန်လိုင်း ဝန်ထမ်းစာရင်းကို အချိန်နှင့်တပြေးညီ ပြောင်းလဲပြသပေးပါမည်။',
          'Login ဝင်ချိန်တွင် ဝန်ထမ်းမှတ်တမ်း မရှိသေးပါက အလိုအလျောက် ဖန်တီးပေးမည် ဖြစ်ပါသည်။',
        ]},
      ],
    },
    {
      id: 'reports',
      titleKey: 'manual.reports',
      icon: '📈',
      contentEN: [
        { type: 'heading', content: 'Business Analytics' },
        { type: 'text', content: 'View business insights, revenue trends, and profit/loss analytics.' },
        { type: 'heading', content: 'Period Toggle' },
        { type: 'list', content: [
          '📅 Today - Data from today only',
          '📊 This Week - Last 7 days',
          '📆 This Month - Last 30 days',
        ]},
        { type: 'heading', content: 'KPI Cards' },
        { type: 'list', content: [
          '💰 Revenue - Total revenue from completed orders',
          '📋 Orders - Total order count',
          '📊 Avg Order - Average order value',
          '👥 Customers - Total registered customers',
        ]},
        { type: 'heading', content: '7-Day Revenue Chart' },
        { type: 'list', content: [
          'Bar chart showing daily revenue',
          'Hover for detailed tooltip',
          'Shows revenue and order count per day',
        ]},
        { type: 'heading', content: 'Top 5 Items' },
        { type: 'list', content: [
          'Pie chart showing revenue share by product',
          'Legend shows quantity sold',
          'List below with rankings and amounts',
        ]},
        { type: 'heading', content: '💰 Profit & Loss' },
        { type: 'list', content: [
          '💵 Total Revenue - 100%',
          '📦 Total Cost - Calculated from product cost prices',
          '✅ Profit / ❌ Loss - Net profit or loss with percentage',
          'Visual profit margin bar (green/red)',
          'Summary cards: Net Profit/Loss, Avg Order Profit',
        ]},
        { type: 'heading', content: 'Inventory Summary' },
        { type: 'list', content: [
          'Total Products count',
          'Inventory Value (stock × cost)',
          'Low Stock Items count',
          'Total Customers count',
        ]},
        { type: 'heading', content: '📋 Order Details Table' },
        { type: 'list', content: [
          '✅ Completed / ❌ Cancelled tabs',
          'Each row shows: Order #, Customer, Type, Items, Revenue, Cost, Profit/Loss, Margin',
          'Click row to expand order details',
          'Shows individual item profit calculations',
          '10 rows per page with pagination',
        ]},
        { type: 'note', content: 'Profit/loss calculations use product cost_price field. Ensure cost prices are set for accurate analytics.' },
      ],
      contentMM: [
        { type: 'heading', content: 'လုပ်ငန်း စွမ်းဆောင်ရည် ခွဲခြမ်းစိတ်ဖြာခြင်း' },
        { type: 'text', content: 'လုပ်ငန်း၏ စွမ်းဆောင်ရည်၊ ဝင်ငွေ တိုးတက်မှု အခြေအနေနှင့် အမြတ်/အရှုံး ခွဲခြမ်းစိတ်ဖြာမှုများကို ကြည့်ရှုနိုင်ပါသည်။' },
        { type: 'heading', content: 'အချိန်ကာလ ရွေးချယ်ခြင်း' },
        { type: 'list', content: [
          '📅 ယနေ့ - ယနေ့အတွင်း ရရှိသော အချက်အလက်များသာ',
          '📊 ဤအပတ် - လွန်ခဲ့သော ၇ ရက်အတွင်းရှိ အချက်အလက်များ',
          '📆 ဤလ - လွန်ခဲ့သော ၃၀ ရက်အတွင်းရှိ အချက်အလက်များ',
        ]},
        { type: 'heading', content: 'အဓိက အချက်အလက် ကတ်များ (KPI Cards)' },
        { type: 'list', content: [
          '💰 ဝင်ငွေ - ပြီးစီးခဲ့သော အော်ဒါများမှ ရရှိသည့် စုစုပေါင်းဝင်ငွေ',
          '📋 အော်ဒါများ - စုစုပေါင်း အော်ဒါအရေအတွက်',
          '📊 ပျမ်းမျှ - အော်ဒါတစ်ခု၏ ပျမ်းမျှ ကျသင့်ငွေ',
          '👥 ဖောက်သည် - စနစ်အတွင်း မှတ်ပုံတင်ထားသော ဖောက်သည် စုစုပေါင်း',
        ]},
        { type: 'heading', content: '၇ ရက်စာ ဝင်ငွေပြ ဇယား (Bar Chart)' },
        { type: 'list', content: [
          'နေ့စဉ် ဝင်ငွေပြောင်းလဲမှုကို Bar Chart ဖြင့် ပြသထားပါသည်။',
          'ဘားတန်းများပေါ်သို့ မောက်စ်တင်ကြည့်ပါက အသေးစိတ် အချက်အလက်များကို မြင်ရပါမည်။',
          'နေ့အလိုက် ရရှိသော ဝင်ငွေနှင့် အော်ဒါအရေအတွက်ကို ပြသပေးပါသည်။',
        ]},
        { type: 'heading', content: 'အရောင်းရဆုံး ထိပ်ဆုံး ဟင်းပွဲ ၅ မျိုး' },
        { type: 'list', content: [
          'ကုန်ပစ္စည်းအလိုက် ရရှိသော ဝင်ငွေဝေစုကို Pie Chart ဖြင့် ပြသထားပါသည်။',
          'ဘေးဘက်တွင် ရောင်းချရသော အရေအတွက်များကို ပြသထားပါသည်။',
          'အောက်ဘက်တွင် အဆင့်၊ ရောင်းရငွေ နှင့်တကွ အသေးစိတ် စာရင်းကို ပြသပေးထားပါသည်။',
        ]},
        { type: 'heading', content: '💰 အမြတ် နှင့် အရှုံး (Profit & Loss)' },
        { type: 'list', content: [
          '💵 စုစုပေါင်း ဝင်ငွေ - ၁၀၀%',
          '📦 စုစုပေါင်း ကုန်ကျငွေ - ကုန်ပစ္စည်းများ၏ ဝယ်ရင်းဈေး (Cost Price) မှ တွက်ချက်ထားပါသည်။',
          '✅ အမြတ် / ❌ အရှုံး - အသားတင် အမြတ် သို့မဟုတ် အရှုံးကို ရာခိုင်နှုန်းနှင့်တကွ ပြသထားပါသည်။',
          'အမြတ် အတိုင်းအတာကို အရောင်ဘားတန်း (အစိမ်း/အနီ) ဖြင့် အလွယ်တကူ မြင်တွေ့နိုင်ပါသည်။',
          'အကျဉ်းချုပ် ကတ်များ - အသားတင် အမြတ်/အရှုံး၊ အော်ဒါတစ်ခု၏ ပျမ်းမျှအမြတ်',
        ]},
        { type: 'heading', content: 'ကုန်ပစ္စည်း အကျဉ်းချုပ်' },
        { type: 'list', content: [
          'စုစုပေါင်း ကုန်ပစ္စည်း အရေအတွက်',
          'ကုန်ပစ္စည်းများ၏ တန်ဖိုး (လက်ကျန်အရေအတွက် × ဝယ်ရင်းဈေး)',
          'လက်ကျန်နည်းနေသော ပစ္စည်းအရေအတွက်',
          'စုစုပေါင်း ဖောက်သည် အရေအတွက်',
        ]},
        { type: 'heading', content: '📋 အော်ဒါ အသေးစိတ် ဇယား' },
        { type: 'list', content: [
          '✅ ပြီးစီး / ❌ ပယ်ဖျက် တက်ဘ် (Tab) များ ခွဲခြားထားပါသည်။',
          'အချက်အလက်ကြောင်းတိုင်းတွင် - အော်ဒါအမှတ်၊ ဖောက်သည်အမည်၊ အမျိုးအစား၊ ဟင်းပွဲများ၊ ဝင်ငွေ၊ ကုန်ကျငွေ၊ အမြတ်/အရှုံး နှင့် အမြတ်ရာခိုင်နှုန်း တို့ကို ပြသထားပါသည်။',
          'အော်ဒါ အသေးစိတ်ကို ကြည့်ရှုရန် အချက်အလက်ကြောင်းကို နှိပ်ပါ။',
          'ပါဝင်သော ဟင်းပွဲတစ်ပွဲချင်းစီအတွက် အမြတ် တွက်ချက်မှုများကို အသေးစိတ် ပြသပေးထားပါသည်။',
          'စာမျက်နှာတစ်ခုလျှင် အချက်အလက် ၁၀ ကြောင်း ပြသပေးပါသည်။',
        ]},
        { type: 'note', content: 'အမြတ်/အရှုံး တွက်ချက်မှုများသည် ကုန်ပစ္စည်းများ၏ ဝယ်ရင်းဈေး (cost_price) ကို အခြေခံ၍ တွက်ချက်ခြင်းဖြစ်ပါသည်။ တိကျသော ခွဲခြမ်းစိတ်ဖြာမှုများ ရရှိစေရန် ဝယ်ရင်းဈေးများကို မှန်ကန်စွာ သတ်မှတ်ပေးထားရန် လိုအပ်ပါသည်။' },
      ],
    },
    {
      id: 'users',
      titleKey: 'manual.users',
      icon: '🔑',
      contentEN: [
        { type: 'heading', content: 'User Account Management' },
        { type: 'text', content: 'Manage application login accounts and roles (Admin only).' },
        { type: 'heading', content: 'Stat Cards' },
        { type: 'list', content: [
          '🔑 Total Users - Total login accounts',
          '✅ Active - Active accounts',
          '👑 Admins - Admin role accounts',
          '🧑‍💼 Staff - Non-admin accounts',
        ]},
        { type: 'heading', content: 'Creating Account' },
        { type: 'list', content: [
          '1. Click "+ Create Account"',
          '2. Enter email, password, name, phone',
          '3. Select role (admin, manager, cashier, chef, waiter, cleaner)',
          '4. Click "Create Account" to save',
          '5. User can now login with email/password',
        ]},
        { type: 'heading', content: 'Editing Profile' },
        { type: 'list', content: [
          'Click "Edit" button',
          'Modify name, phone, or role',
          'Click "Save" to apply',
        ]},
        { type: 'heading', content: 'Reset Password' },
        { type: 'list', content: [
          'Click "🔒 Reset" button',
          'Enter new password',
          'Confirmation required',
        ]},
        { type: 'heading', content: 'Toggle Active/Inactive' },
        { type: 'list', content: [
          'Click status badge (Active/Inactive)',
          'Inactive users cannot login',
          'Toggle back to reactivate',
        ]},
        { type: 'heading', content: 'Delete Account' },
        { type: 'list', content: [
          'Click "Delete" button',
          'Confirmation modal appears',
          'Account and profile permanently removed',
        ]},
        { type: 'warning', content: 'Deleting a user account is permanent. The user will immediately lose access to the system.' },
      ],
      contentMM: [
        { type: 'heading', content: 'အသုံးပြုသူအကောင့်များ စီမံခန့်ခွဲခြင်း' },
        { type: 'text', content: 'အက်ပလီကေးရှင်းသို့ ဝင်ရောက်အသုံးပြုမည့် အကောင့်များနှင့် ရာထူးများကို စီမံခန့်ခွဲပါ။ (Admin များသာ ဝင်ရောက်နိုင်ပါသည်)' },
        { type: 'heading', content: 'အချက်အလက် ကတ်များ' },
        { type: 'list', content: [
          '🔑 စုစုပေါင်း အသုံးပြုသူ - စနစ်သို့ ဝင်ရောက်ခွင့်ရှိသော အကောင့်အရေအတွက်',
          '✅ တက်ကြွ (Active) - အသုံးပြုခွင့် ဖွင့်ပေးထားသော အကောင့်များ',
          '👑 Admin - Admin ရာထူးရှိသော အကောင့်များ',
          '🧑‍💼 ဝန်ထမ်း - Admin မဟုတ်သော အခြားအကောင့်များ',
        ]},
        { type: 'heading', content: 'အကောင့်အသစ် ဖန်တီးခြင်း' },
        { type: 'list', content: [
          '၁။ "+ Create Account" ကိုနှိပ်ပါ။',
          '၂။ အီးမေးလ်၊ စကားဝှက်၊ အမည် နှင့် ဖုန်းနံပါတ်တို့ကို ရိုက်ထည့်ပါ။',
          '၃။ ရာထူးကို ရွေးချယ်ပါ (admin, manager, cashier, chef, waiter, cleaner)။',
          '၄။ "Create Account" ကို နှိပ်၍ သိမ်းဆည်းပါ။',
          '၅။ အဆိုပါအသုံးပြုသူသည် အီးမေးလ်နှင့် စကားဝှက်ကိုအသုံးပြု၍ စနစ်သို့ ချက်ချင်း ဝင်ရောက်နိုင်ပြီ ဖြစ်ပါသည်။',
        ]},
        { type: 'heading', content: 'ပရိုဖိုင် အချက်အလက်များ ပြင်ဆင်ခြင်း' },
        { type: 'list', content: [
          '"Edit" ခလုတ်ကို နှိပ်ပါ။',
          'အမည်၊ ဖုန်း၊ ရာထူးတို့ကို ပြင်ဆင်နိုင်ပါသည်။',
          '"Save" ကိုနှိပ်၍ အပြောင်းအလဲများကို သိမ်းဆည်းပါ။',
        ]},
        { type: 'heading', content: 'စကားဝှက် ပြန်လည်သတ်မှတ်ခြင်း (Reset Password)' },
        { type: 'list', content: [
          '"🔒 Reset" ခလုတ်ကို နှိပ်ပါ။',
          'စကားဝှက်အသစ်ကို ရိုက်ထည့်ပါ။',
          'လုပ်ဆောင်ချက်ကို အတည်ပြုပေးရန် လိုအပ်ပါသည်။',
        ]},
        { type: 'heading', content: 'အကောင့်ဖွင့်/ပိတ် ပြုလုပ်ခြင်း (Active/Inactive)' },
        { type: 'list', content: [
          'အခြေအနေပြ အမှတ်အသား (Active/Inactive) ကို နှိပ်ပါ။',
          'Inactive ဖြစ်နေသော အသုံးပြုသူများသည် စနစ်ထဲသို့ ဝင်ရောက်နိုင်မည် မဟုတ်ပါ။',
          'အကောင့်ပြန်ဖွင့်ပေးရန် တစ်ချက်ပြန်နှိပ်ပါ။',
        ]},
        { type: 'heading', content: 'အကောင့်ကို အပြီးတိုင် ဖျက်သိမ်းခြင်း' },
        { type: 'list', content: [
          '"Delete" ခလုတ်ကို နှိပ်ပါ။',
          'အတည်ပြုချက် တောင်းခံသည့် အကွက်ပေါ်လာပါမည်။',
          'အကောင့်နှင့် ပရိုဖိုင်အချက်အလက်များကို အပြီးတိုင် ဖယ်ရှားလိုက်မည် ဖြစ်ပါသည်။',
        ]},
        { type: 'warning', content: 'အသုံးပြုသူအကောင့် ဖျက်သိမ်းခြင်းသည် အပြီးတိုင် ဖယ်ရှားခြင်းဖြစ်ပါသည်။ အဆိုပါအသုံးပြုသူသည် စနစ်သို့ ဝင်ရောက်ခွင့်ကို ချက်ချင်း ဆုံးရှုံးသွားမည်ဖြစ်ပါသည်။' },
      ],
    },
    {
      id: 'admin',
      titleKey: 'manual.admin',
      icon: '⚙️',
      contentEN: [
        { type: 'heading', content: 'Admin Settings' },
        { type: 'text', content: 'Configure restaurant tables and product categories.' },
        { type: 'heading', content: 'Table Management' },
        { type: 'list', content: [
          'Add/edit/delete restaurant tables',
          'Set table number and seat count',
          'Activate/deactivate tables',
          'Tables appear in Cashier for dine-in orders',
          'Dashboard Table Status reflects configured tables',
        ]},
        { type: 'heading', content: 'Category Management' },
        { type: 'list', content: [
          'Create parent categories (e.g., Meats, Veggies)',
          'Create subcategories under parents',
          'Assign emoji to each category',
          'Set sort order for display sequence',
          'Categories filter products in Cashier and Stock pages',
        ]},
        { type: 'heading', content: 'Adding Tables' },
        { type: 'list', content: [
          '1. Go to Table Management section',
          '2. Click "+ Add Table"',
          '3. Enter table number and seats',
          '4. Click "Add Table" to save',
        ]},
        { type: 'heading', content: 'Adding Categories' },
        { type: 'list', content: [
          '1. Go to Category Management section',
          '2. Click "+ Add Category"',
          '3. Enter name, select parent (optional)',
          '4. Pick emoji from emoji picker',
          '5. Set sort order',
          '6. Click "Add Category" to save',
        ]},
        { type: 'note', content: 'Changes to tables and categories reflect immediately across all pages.' },
      ],
      contentMM: [
        { type: 'heading', content: 'စနစ်ပိုင်းဆိုင်ရာ ဆက်တင်များ (Admin)' },
        { type: 'text', content: 'စားသောက်ဆိုင်ရှိ စားပွဲများနှင့် ကုန်ပစ္စည်းအမျိုးအစားများကို သတ်မှတ်ပြင်ဆင်နိုင်ပါသည်။' },
        { type: 'heading', content: 'စားပွဲများ စီမံခန့်ခွဲခြင်း' },
        { type: 'list', content: [
          'ဆိုင်ရှိ စားပွဲများကို အသစ်ထည့်ခြင်း၊ ပြင်ဆင်ခြင်း၊ ဖယ်ရှားခြင်းများ ပြုလုပ်နိုင်ပါသည်။',
          'စားပွဲနံပါတ်နှင့် ထိုင်ခုံအရေအတွက်တို့ကို သတ်မှတ်နိုင်ပါသည်။',
          'စားပွဲများကို ဖွင့်/ပိတ် (Activate/Deactivate) ပြုလုပ်နိုင်ပါသည်။',
          'ထည့်သွင်းထားသော စားပွဲများကို အရောင်းကောင်တာ (Cashier) တွင် ဆိုင်စားအော်ဒါ ကောက်ယူရန်အတွက် မြင်တွေ့ရပါမည်။',
          'ဒက်ရှ်ဘုတ်ရှိ စားပွဲအခြေအနေပြ ကွက်လပ်တွင်လည်း သတ်မှတ်ထားသော စားပွဲများအတိုင်း ပြသပေးမည် ဖြစ်ပါသည်။',
        ]},
        { type: 'heading', content: 'အမျိုးအစား စီမံခန့်ခွဲခြင်း' },
        { type: 'list', content: [
          'အဓိက ကုန်ပစ္စည်းအမျိုးအစားများ (ဥပမာ - အသားများ၊ ဟင်းသီးဟင်းရွက်များ) ကို ဖန်တီးနိုင်ပါသည်။',
          'အဓိကအမျိုးအစားများအောက်တွင် ကဏ္ဍခွဲများကိုပါ ထပ်မံဖန်တီးနိုင်ပါသည်။',
          'အမျိုးအစားတစ်ခုချင်းစီအတွက် Icon (Emoji) များ သတ်မှတ်ပေးနိုင်ပါသည်။',
          'ပြသလိုသော အစီအစဉ်အတိုင်း (Sort Order) သတ်မှတ်ပေးနိုင်ပါသည်။',
          'ဤအမျိုးအစားများကို အရောင်းကောင်တာ (Cashier) နှင့် ကုန်လက်ကျန် (Stock) စာမျက်နှာများတွင် ကုန်ပစ္စည်းများကို စစ်ထုတ်ရှာဖွေရန် အသုံးပြုပါသည်။',
        ]},
        { type: 'heading', content: 'စားပွဲအသစ် ထည့်သွင်းခြင်း' },
        { type: 'list', content: [
          '၁။ စားပွဲများ စီမံခန့်ခွဲခြင်း (Table Management) အပိုင်းသို့ သွားပါ။',
          '၂။ "+ Add Table" ကိုနှိပ်ပါ။',
          '၃။ စားပွဲနံပါတ်နှင့် ထိုင်ခုံအရေအတွက်ကို ရိုက်ထည့်ပါ။',
          '၄။ "Add Table" ကို နှိပ်၍ သိမ်းဆည်းပါ။',
        ]},
        { type: 'heading', content: 'အမျိုးအစားအသစ် ထည့်သွင်းခြင်း' },
        { type: 'list', content: [
          '၁။ အမျိုးအစား စီမံခန့်ခွဲခြင်း (Category Management) အပိုင်းသို့ သွားပါ။',
          '၂။ "+ Add Category" ကိုနှိပ်ပါ။',
          '၃။ အမည်ကို ရိုက်ထည့်ပါ။ လိုအပ်ပါက အဓိကအမျိုးအစား (Parent) ကို ရွေးချယ်ပါ။',
          '၄။ Emoji Picker မှတစ်ဆင့် ကိုက်ညီမည့် Icon (Emoji) ကို ရွေးချယ်ပါ။',
          '၅။ အစီအစဉ် (Sort Order) ကို သတ်မှတ်ပါ။',
          '၆။ "Add Category" ကို နှိပ်၍ သိမ်းဆည်းပါ။',
        ]},
        { type: 'note', content: 'စားပွဲများနှင့် အမျိုးအစားများတွင် ပြင်ဆင်လိုက်သော အချက်အလက်များသည် စာမျက်နှာအားလုံးတွင် ချက်ချင်း ပြောင်းလဲသွားမည် ဖြစ်ပါသည်။' },
      ],
    },
  ];

  const activeContent = manualSections.find(s => s.id === activeSection);
  const content = lang === 'mm' ? activeContent?.contentMM : activeContent?.contentEN;

  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'heading':
        return <h2 key={index} className="text-2xl font-bold text-white mt-6 mb-3">{block.content}</h2>;
      case 'text':
        return <p key={index} className="text-gray-300 mb-4">{block.content}</p>;
      case 'list':
        return (
          <ul key={index} className="space-y-2 mb-4">
            {(block.content as string[]).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-300">
                <span className="text-yellow-400 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
      case 'table': {
        const rows = (block.content as string[]);
        const [header, ...dataRows] = rows;
        const [headerLeft, headerRight] = header.split('|');
        return (
          <div key={index} className="bg-[#1e2128] rounded-xl border border-gray-700 overflow-hidden mb-4">
            <div className="grid grid-cols-2 border-b border-gray-700">
              <div className="p-3 text-white font-bold bg-gray-800">{headerLeft}</div>
              <div className="p-3 text-white font-bold bg-gray-800">{headerRight}</div>
            </div>
            {dataRows.map((row, i) => {
              const [left, right] = row.split('|');
              return (
                <div key={i} className="grid grid-cols-2 border-b border-gray-700 last:border-0">
                  <div className="p-3 text-gray-300">{left}</div>
                  <div className="p-3 text-gray-300">{right}</div>
                </div>
              );
            })}
          </div>
        );
      }
      case 'note':
        return (
          <div key={index} className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
            <p className="text-blue-400 text-sm"><strong>💡 Note:</strong> {block.content}</p>
          </div>
        );
      case 'warning':
        return (
          <div key={index} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-sm"><strong>⚠️ Warning:</strong> {block.content}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#1e2128] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#272a30] border-r border-gray-700 overflow-y-auto shrink-0">
        <div className="p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{t('manual.title')}</h2>
        </div>
        <nav className="p-3 space-y-1">
          {manualSections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === section.id
                  ? 'bg-yellow-500 text-black font-bold'
                  : 'text-gray-400 hover:bg-[#2f333a] hover:text-white'
              }`}
            >
              <span className="text-xl">{section.icon}</span>
              <span className="text-sm">{t(section.titleKey)}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl mx-auto">
          {content && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{activeContent?.icon}</span>
                <h1 className="text-4xl font-bold text-white">{t(activeContent!.titleKey)}</h1>
              </div>
              {content.map((block, index) => renderContentBlock(block, index))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManualPage;