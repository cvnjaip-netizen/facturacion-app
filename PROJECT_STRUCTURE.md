# Facturación y Cobranzas - Next.js 14 CRUD App

## Project Overview

A complete billing and collections management system for a Venezuelan accounting firm. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Drizzle ORM, and Neon PostgreSQL.

**Features:**
- Full CRUD operations for clients and payments
- Dashboard with KPIs and analytics charts
- Client filtering by sector, status, and search
- Payment tracking and management
- Sector-wise analysis
- Server actions for data mutations
- Clean light theme UI

## Technology Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Database:** Drizzle ORM + Neon (serverless PostgreSQL)
- **Styling:** Tailwind CSS with clean light theme
- **Charts:** Recharts for data visualization
- **Icons:** Lucide React
- **Server Actions:** For all data mutations

## Directory Structure

```
facturacion-app/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Main dashboard with KPIs and charts
│   │   ├── clients/
│   │   │   ├── page.tsx              # Clients list with filters
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Create new client
│   │   │   └── [id]/edit/
│   │   │       └── page.tsx          # Edit client by ID
│   │   ├── payments/
│   │   │   ├── page.tsx              # Payments list with search
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Create new payment
│   │   │   └── [id]/edit/
│   │   │       └── page.tsx          # Edit payment by ID
│   │   ├── sectors/
│   │   │   └── page.tsx              # Sector analysis page
│   │   ├── layout.tsx                # Root layout with sidebar
│   │   ├── page.tsx                  # Redirect to dashboard
│   │   └── globals.css               # Tailwind and global styles
│   ├── components/
│   │   ├── Sidebar.tsx               # Navigation sidebar
│   │   ├── StatsCard.tsx             # KPI card component
│   │   ├── DataTable.tsx             # Reusable table component
│   │   ├── DeleteButton.tsx          # Delete with confirmation dialog
│   │   ├── ClientForm.tsx            # Client create/edit form
│   │   ├── PaymentForm.tsx           # Payment create/edit form
│   │   └── Charts.tsx                # Recharts visualizations
│   └── lib/
│       ├── db.ts                     # Drizzle DB connection
│       ├── schema.ts                 # Database schema (clients, payments)
│       ├── actions.ts                # Server actions for CRUD & dashboard
│       ├── utils.ts                  # Currency formatting, helpers
│       └── seed.ts                   # Database seeding script
├── public/                            # Static assets (favicon, images)
├── package.json                       # Dependencies & scripts
├── tsconfig.json                      # TypeScript configuration
├── next.config.js                     # Next.js configuration
├── tailwind.config.ts                 # Tailwind CSS configuration
├── postcss.config.js                  # PostCSS configuration
├── drizzle.config.ts                  # Drizzle ORM configuration
├── .env.example                       # Environment variables template
└── .gitignore                         # Git ignore rules
```

## Database Schema

### Clients Table
```sql
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT,
  sector TEXT NOT NULL, -- Contabilidad, Legal, General, ISLR
  total_facturado NUMERIC(15,2) DEFAULT 0,
  total_cobrado NUMERIC(15,2) DEFAULT 0,
  total_pendiente NUMERIC(15,2) DEFAULT 0,
  meses_activos INTEGER DEFAULT 0,
  ultimo_pago TEXT,
  promedio_mensual NUMERIC(15,2) DEFAULT 0,
  pct_cobrado NUMERIC(5,2) DEFAULT 0,
  estado TEXT DEFAULT 'Pendiente', -- Pendiente, Prepago
  rif TEXT,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  fecha TEXT NOT NULL,
  monto NUMERIC(15,2) NOT NULL,
  forma_pago TEXT NOT NULL, -- Transferencia, Efectivo, Punto de venta, Zelle, Otro
  banco TEXT,
  referencia TEXT,
  confirmado BOOLEAN DEFAULT false,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Key Components

### Sidebar (src/components/Sidebar.tsx)
- Left navigation with 4 main sections: Dashboard, Clientes, Pagos, Sectores
- Active route highlighting
- Blue accent color with clean light theme

### StatsCard (src/components/StatsCard.tsx)
- Displays KPIs: icon, label, value, optional subtitle
- Used for: Total Facturado, Total Cobrado, Saldo Pendiente, Clientes, % Cobrado

### DataTable (src/components/DataTable.tsx)
- Gneric reusable table with customizable columns
- Supports custom render functions
- Optional actions column (edit/delete buttons)

### ClientForm (src/components/ClientForm.tsx)
- Create and edit clients
- Fields: nombre, sector, tipo, rif, observaciones
- Form validation and error handling

### PaymentForm (src/components/PaymentForm.tsx)
- Create and edit payments
- Client dropdown, date, amount, payment method
- Bank, reference, confirmation status
- Form validation and error handling

### Charts (src/components/Charts.tsx)
- SectorPieChart: Total facturado by sector
- TopClientsBarChart: Top 10 clients by amount
- StatusPieChart: Pendiente vs Prepago distribution
- DebtBarChart: Top 10 debtors

## Server Actions (src/lib/actions.ts)

### Client Actions
- `getClients(search?, sector?, estado?)` - Get filtered client list
- `getClient(id)` - Get single client by ID
- `createClient(data)` - Create new client
- `updateClient(id, data)` - Update existing client
- `deleteClient(id)` - Delete client

### Payment Actions
- `getPayments(clientId?, search?)` - Get filtered payments
- `getPayment(id)` - Get single payment by ID
- `createPayment(data)` - Create new payment
- `updatePayment(id, data)` - Update existing payment
- `deletePayment(id)` - Delete payment

### Dashboard Actions
- `getDashboardStats()` - Comprehensive dashboard statistics
  - Total facturado, cobrado, pendiente
  - Client counts (total and pendiente)
  - Percentage collected
  - Top 10 clients by amount
  - Top 10 debtors
  - Sector-wise breakdown

## Pages

### Dashboard (/dashboard)
- 5 KPI cards at top
- 4-chart grid: sectors, top clients, status, debtors
- Top 10 clients table
- Top 10 debtors table

### Clients (/clients)
- Search bar + sector and estado filters
- Table with: nombre, sector, facturado, cobrado, pendiente, estado
- Edit/Delete actions per row
- "New Client" button
- Currency formatting as Bs. X,XXX.XX

### New Client (/clients/new)
- ClientForm component for creation
- Redirects to /clients on success

### Edit Client (/clients/[id]/edit)
- ClientForm with prefilled values
- Dynamic route with client ID
- Redirects to /clients on success

### Payments (/payments)
- Search by client name
- Table with: cliente, fecha, monto, forma_pago, banco, referencia, confirmado
- Edit/Delete actions per row
- "New Payment" button

### New Payment (/payments/new)
- PaymentForm with client dropdown
- Redirects to /payments on success

### Edit Payment (/payments/[id]/edit)
- PaymentForm with prefilled values
- Dynamic route with payment ID
- Redirects to /payments on success

### Sectors (/sectors)
- Table with sector analysis
- Columns: sector, total_facturado, cantidad_clientes, promedio_por_cliente

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure database:**
   - Create `.env.local` from `.env.example`
   - Set `DATABASE_URL` to your Neon PostgreSQL connection string

3. **Initialize database:**
   ```bash
   npm run db:push
   ```

4. **Seed data (optional):**
   - Ensure `seed_clients.json` exists in project root
   - Run: `npm run db:seed`

5. **Start development server:**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with client data
npm run db:generate  # Generate Drizzle migrations
npm run db:studio    # Open Drizzle Studio
```

## UI Theme

- **Light theme:** White cards (bg-white), gray backgrounds (bg-gray-50)
- **Primary color:** Blue (#2563eb) for buttons and highlights
- **Text:** Dark gray (#1f2937) for body text
- **Borders:** Light gray (#e5e7eb)
- **Shadow:** Subtle shadow-sm with border-gray-200
- **Spacing:** Generous padding (p-6, p-8) for clean look

## Currency Formatting

All money values displayed as:
- **Format:** "Bs. X,XXX,XXX.XX"
- **Function:** `formatCurrency()` from `src/lib/utils.ts`
- **Locale:** Spanish (Venezuela) with Bs. prefix

## Language

All UI labels, buttons, and messages in **Spanish**:
- Clientes, Pagos, Sectores, Dashboard
- Nuevo Cliente, Nuevo Pago
- Editar, Eliminar, Guardar, Cancelar
- Form labels and validation messages

## Features Included

✓ Full CRUD for clients (83 supported)
✓ Full CRUD for payments
✓ Dashboard with KPIs and analytics
✓ Client filtering (search, sector, estado)
✓ Payment search and tracking
✓ Sector analysis
✓ Data visualization with Recharts
✓ Server-side actions for security
✓ Responsive design
✓ Form validation and error handling
✓ Confirmation dialogs for deletions
✓ Loading states and transitions
✓ TypeScript type safety
✓ Clean, maintainable code structure

## Production Ready

- Configured for Neon serverless PostgreSQL
- Server Actions for secure data mutations
- TypeScript for type safety
- Tailwind CSS for responsive design
- Error boundaries and loading states
- Form validation and user feedback
- Database connection pooling
- Environment variable management
