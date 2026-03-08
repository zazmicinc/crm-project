# Implementation Brief: Unified List View Redesign
**Target:** React TypeScript Frontend Agent  
**Workspace:** `crm-frontend/`  
**Priority:** High  
**Scope:** Leads, Contacts, Accounts, Deals — all list views

---

## Overview

Redesign all four CRM list views (Leads, Contacts, Accounts, Deals) to use a clean, unified table design following the Zazmic brand: **black, white, and red** palette with Apple-inspired refinement.

The current design uses heavy avatar circles and visually noisy layouts. The new design is cleaner, more typographically refined, and consistent across all modules.

---

## Design Specification

### Color Tokens (add to your CSS variables or Tailwind config)

```css
--zazmic-red: #e8192c;
--zazmic-red-light: #fff0f1;
--zazmic-black: #0a0a0a;
--zazmic-gray-100: #fafafa;
--zazmic-gray-200: #f0f0f0;
--zazmic-gray-300: #e8e8e8;
--zazmic-gray-500: #aaa;
--zazmic-gray-600: #888;
--zazmic-gray-700: #666;
--zazmic-gray-800: #444;
```

### Typography

- Font: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif`
- Page title: 28px, weight 700, color `#0a0a0a`, letter-spacing `-0.02em`
- Section breadcrumb: 12px, weight 600, uppercase, letter-spacing `0.12em`, color `#999`
- Table header labels: 11px, weight 700, uppercase, letter-spacing `0.1em`, color `#aaa`
- Row primary text (name): 14px, weight 600, color `#0a0a0a`, letter-spacing `-0.01em`
- Row secondary text (email, source, date): 13px, color `#666`–`#aaa`

---

## Shared Component: `<ListTable />`

Create a reusable component at `src/components/shared/ListTable.tsx`.

### Props Interface

```typescript
interface Column<T> {
  key: string;
  label: string;
  width?: string;           // CSS grid column width e.g. "1fr", "120px"
  render: (row: T) => React.ReactNode;
}

interface ListTableProps<T> {
  title: string;
  breadcrumb: string;       // e.g. "CRM / Leads"
  columns: Column<T>[];
  rows: T[];
  newButtonLabel: string;   // e.g. "+ New Lead"
  onNew: () => void;
  onRowClick: (row: T) => void;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  Breadcrumb (CRM / Leads)              [+ New Lead]  │
│  Page Title (All Leads)                              │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐ │
│  │  ☐  NAME    EMAIL    COMPANY   STATUS  ...  →  │ │  ← header row
│  ├──────────────────────────────────────────────── ┤ │
│  │  ☐  Row 1                                   →  │ │
│  │  ☐  Row 2                                   →  │ │
│  │  ☐  Row 3                                   →  │ │
│  └─────────────────────────────────────────────────┘ │
│  Showing 1–N of N     [‹] [1] [›]                   │
└─────────────────────────────────────────────────────┘
```

### Component Implementation

```tsx
// src/components/shared/ListTable.tsx
import React, { useState } from 'react';

export function ListTable<T extends { id: number | string }>({
  title, breadcrumb, columns, rows,
  newButtonLabel, onNew, onRowClick,
  totalCount, currentPage, totalPages, onPageChange
}: ListTableProps<T>) {
  const [selected, setSelected] = useState<Set<T['id']>>(new Set());
  const [hoveredId, setHoveredId] = useState<T['id'] | null>(null);

  const allSelected = selected.size === rows.length && rows.length > 0;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(rows.map(r => r.id)));
  };

  const toggleOne = (id: T['id']) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  // Grid template: checkbox + columns + arrow
  const gridTemplate = `40px ${columns.map(c => c.width || '1fr').join(' ')} 40px`;

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
      background: '#fff',
      padding: '40px 48px',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: '#999', textTransform: 'uppercase', marginBottom: 6 }}>
            {breadcrumb}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0a0a0a', margin: 0, letterSpacing: '-0.02em' }}>
            {title}
          </h1>
        </div>
        <button
          onClick={onNew}
          style={{
            background: '#e8192c', color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 20px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer', letterSpacing: '0.01em'
          }}
        >
          {newButtonLabel}
        </button>
      </div>

      {/* Table Container */}
      <div style={{ border: '1px solid #e8e8e8', borderRadius: 12, overflow: 'hidden' }}>

        {/* Header Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: gridTemplate,
          background: '#fafafa', borderBottom: '1px solid #e8e8e8',
          padding: '0 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0' }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              style={{ cursor: 'pointer', accentColor: '#e8192c' }}
            />
          </div>
          {columns.map(col => (
            <div key={col.key} style={{
              padding: '14px 12px', fontSize: 11, fontWeight: 700,
              color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase'
            }}>
              {col.label}
            </div>
          ))}
          <div /> {/* Arrow column header — empty */}
        </div>

        {/* Data Rows */}
        {rows.map((row, idx) => {
          const isHovered = hoveredId === row.id;
          const isSelected = selected.has(row.id);
          return (
            <div
              key={row.id}
              onMouseEnter={() => setHoveredId(row.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onRowClick(row)}
              style={{
                display: 'grid', gridTemplateColumns: gridTemplate,
                alignItems: 'center', padding: '0 20px',
                borderBottom: idx < rows.length - 1 ? '1px solid #f0f0f0' : 'none',
                background: isSelected ? '#fff8f8' : isHovered ? '#fafafa' : '#fff',
                transition: 'background 0.15s ease',
                cursor: 'pointer'
              }}
            >
              {/* Checkbox */}
              <div style={{ padding: '18px 0', display: 'flex', alignItems: 'center' }}
                   onClick={e => { e.stopPropagation(); toggleOne(row.id); }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleOne(row.id)}
                  style={{ cursor: 'pointer', accentColor: '#e8192c' }}
                />
              </div>

              {/* Data Cells */}
              {columns.map(col => (
                <div key={col.key} style={{ padding: '18px 12px' }}>
                  {col.render(row)}
                </div>
              ))}

              {/* Arrow */}
              <div style={{ padding: '18px 12px', display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  border: '1px solid #e8e8e8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isHovered ? '#e8192c' : '#ccc',
                  background: isHovered ? '#fff0f1' : 'transparent',
                  transition: 'all 0.15s', fontSize: 14
                }}>
                  →
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <span style={{ fontSize: 12, color: '#aaa' }}>
          Showing {(currentPage - 1) * rows.length + 1}–{(currentPage - 1) * rows.length + rows.length} of {totalCount}
          {selected.size > 0 ? ` · ${selected.size} selected` : ''}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              width: 30, height: 30, borderRadius: 6, border: '1px solid #e8e8e8',
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: currentPage === 1 ? 'default' : 'pointer', color: '#999',
              opacity: currentPage === 1 ? 0.4 : 1
            }}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              style={{
                width: 30, height: 30, borderRadius: 6,
                border: page === currentPage ? 'none' : '1px solid #e8e8e8',
                background: page === currentPage ? '#e8192c' : '#fff',
                color: page === currentPage ? '#fff' : '#666',
                fontWeight: page === currentPage ? 700 : 400,
                fontSize: 13, cursor: 'pointer'
              }}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              width: 30, height: 30, borderRadius: 6, border: '1px solid #e8e8e8',
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: currentPage === totalPages ? 'default' : 'pointer', color: '#999',
              opacity: currentPage === totalPages ? 0.4 : 1
            }}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Shared Sub-component: `<StatusBadge />`

Create at `src/components/shared/StatusBadge.tsx`. Used by all list views.

```tsx
// src/components/shared/StatusBadge.tsx

type StatusVariant = 'new' | 'contacted' | 'qualified' | 'active' | 'inactive' |
                     'open' | 'won' | 'lost' | 'prospect' | 'customer';

const STATUS_CONFIG: Record<StatusVariant, { bg: string; color: string; dot: string }> = {
  new:       { bg: '#f5f5f5', color: '#555',    dot: '#999'    },
  contacted: { bg: '#fff0f0', color: '#c0392b', dot: '#e74c3c' },
  qualified: { bg: '#f0fff4', color: '#1a7f4b', dot: '#27ae60' },
  active:    { bg: '#f0fff4', color: '#1a7f4b', dot: '#27ae60' },
  inactive:  { bg: '#f5f5f5', color: '#888',    dot: '#bbb'    },
  open:      { bg: '#fff8f0', color: '#b25600', dot: '#e67e22' },
  won:       { bg: '#f0fff4', color: '#1a7f4b', dot: '#27ae60' },
  lost:      { bg: '#f5f5f5', color: '#888',    dot: '#bbb'    },
  prospect:  { bg: '#f0f4ff', color: '#1a3f9f', dot: '#3b5de7' },
  customer:  { bg: '#f0fff4', color: '#1a7f4b', dot: '#27ae60' },
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase() as StatusVariant;
  const cfg = STATUS_CONFIG[key] ?? STATUS_CONFIG.new;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: cfg.bg, color: cfg.color,
      padding: '4px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, letterSpacing: '0.01em',
      whiteSpace: 'nowrap'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}
```

---

## Apply to Each Module

### 1. Leads List (`src/pages/Leads/LeadsList.tsx` or similar)

```tsx
import { ListTable } from '../../components/shared/ListTable';
import { StatusBadge } from '../../components/shared/StatusBadge';

const columns = [
  {
    key: 'name', label: 'Name', width: '1fr',
    render: (lead) => (
      <span style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a', letterSpacing: '-0.01em' }}>
        {lead.first_name} {lead.last_name}
      </span>
    )
  },
  {
    key: 'email', label: 'Email', width: '1fr',
    render: (lead) => <span style={{ fontSize: 13, color: '#666' }}>{lead.email}</span>
  },
  {
    key: 'company', label: 'Company', width: '1fr',
    render: (lead) => <span style={{ fontSize: 13, color: '#444', fontWeight: 500 }}>{lead.company}</span>
  },
  {
    key: 'status', label: 'Status', width: '120px',
    render: (lead) => <StatusBadge status={lead.status} />
  },
  {
    key: 'source', label: 'Source', width: '100px',
    render: (lead) => <span style={{ fontSize: 13, color: '#888' }}>{lead.source}</span>
  },
  {
    key: 'created', label: 'Created', width: '110px',
    render: (lead) => <span style={{ fontSize: 13, color: '#aaa' }}>{formatDate(lead.created_at)}</span>
  },
];

// Render:
<ListTable
  title="All Leads"
  breadcrumb="CRM / Leads"
  columns={columns}
  rows={leads}
  newButtonLabel="+ New Lead"
  onNew={handleNewLead}
  onRowClick={(lead) => navigate(`/leads/${lead.id}`)}
  totalCount={totalCount}
  currentPage={page}
  totalPages={Math.ceil(totalCount / pageSize)}
  onPageChange={setPage}
/>
```

---

### 2. Contacts List (`src/pages/Contacts/ContactsList.tsx` or similar)

```tsx
const columns = [
  {
    key: 'name', label: 'Name', width: '1fr',
    render: (c) => (
      <span style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a', letterSpacing: '-0.01em' }}>
        {c.first_name} {c.last_name}
      </span>
    )
  },
  {
    key: 'email', label: 'Email', width: '1fr',
    render: (c) => <span style={{ fontSize: 13, color: '#666' }}>{c.email}</span>
  },
  {
    key: 'phone', label: 'Phone', width: '130px',
    render: (c) => <span style={{ fontSize: 13, color: '#888' }}>{c.phone}</span>
  },
  {
    key: 'account', label: 'Account', width: '1fr',
    render: (c) => <span style={{ fontSize: 13, color: '#444', fontWeight: 500 }}>{c.account_name}</span>
  },
  {
    key: 'status', label: 'Status', width: '120px',
    render: (c) => <StatusBadge status={c.status} />
  },
  {
    key: 'created', label: 'Created', width: '110px',
    render: (c) => <span style={{ fontSize: 13, color: '#aaa' }}>{formatDate(c.created_at)}</span>
  },
];

<ListTable
  title="All Contacts"
  breadcrumb="CRM / Contacts"
  columns={columns}
  rows={contacts}
  newButtonLabel="+ New Contact"
  onNew={handleNewContact}
  onRowClick={(c) => navigate(`/contacts/${c.id}`)}
  totalCount={totalCount}
  currentPage={page}
  totalPages={Math.ceil(totalCount / pageSize)}
  onPageChange={setPage}
/>
```

---

### 3. Accounts List (`src/pages/Accounts/AccountsList.tsx` or similar)

```tsx
const columns = [
  {
    key: 'name', label: 'Account Name', width: '1fr',
    render: (a) => (
      <span style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a', letterSpacing: '-0.01em' }}>
        {a.name}
      </span>
    )
  },
  {
    key: 'industry', label: 'Industry', width: '1fr',
    render: (a) => <span style={{ fontSize: 13, color: '#666' }}>{a.industry}</span>
  },
  {
    key: 'website', label: 'Website', width: '1fr',
    render: (a) => <span style={{ fontSize: 13, color: '#666' }}>{a.website}</span>
  },
  {
    key: 'status', label: 'Status', width: '120px',
    render: (a) => <StatusBadge status={a.status} />
  },
  {
    key: 'employees', label: 'Employees', width: '100px',
    render: (a) => <span style={{ fontSize: 13, color: '#888' }}>{a.employees?.toLocaleString()}</span>
  },
  {
    key: 'created', label: 'Created', width: '110px',
    render: (a) => <span style={{ fontSize: 13, color: '#aaa' }}>{formatDate(a.created_at)}</span>
  },
];

<ListTable
  title="All Accounts"
  breadcrumb="CRM / Accounts"
  columns={columns}
  rows={accounts}
  newButtonLabel="+ New Account"
  onNew={handleNewAccount}
  onRowClick={(a) => navigate(`/accounts/${a.id}`)}
  totalCount={totalCount}
  currentPage={page}
  totalPages={Math.ceil(totalCount / pageSize)}
  onPageChange={setPage}
/>
```

---

### 4. Deals List (`src/pages/Deals/DealsList.tsx` or similar)

```tsx
const columns = [
  {
    key: 'name', label: 'Deal Name', width: '1fr',
    render: (d) => (
      <span style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a', letterSpacing: '-0.01em' }}>
        {d.name}
      </span>
    )
  },
  {
    key: 'account', label: 'Account', width: '1fr',
    render: (d) => <span style={{ fontSize: 13, color: '#444', fontWeight: 500 }}>{d.account_name}</span>
  },
  {
    key: 'value', label: 'Value', width: '100px',
    render: (d) => (
      <span style={{ fontSize: 13, color: '#0a0a0a', fontWeight: 600 }}>
        ${d.value?.toLocaleString()}
      </span>
    )
  },
  {
    key: 'stage', label: 'Stage', width: '130px',
    render: (d) => <StatusBadge status={d.stage} />
  },
  {
    key: 'close_date', label: 'Close Date', width: '110px',
    render: (d) => <span style={{ fontSize: 13, color: '#888' }}>{formatDate(d.close_date)}</span>
  },
  {
    key: 'owner', label: 'Owner', width: '120px',
    render: (d) => <span style={{ fontSize: 13, color: '#666' }}>{d.owner_name}</span>
  },
  {
    key: 'created', label: 'Created', width: '110px',
    render: (d) => <span style={{ fontSize: 13, color: '#aaa' }}>{formatDate(d.created_at)}</span>
  },
];

<ListTable
  title="All Deals"
  breadcrumb="CRM / Deals"
  columns={columns}
  rows={deals}
  newButtonLabel="+ New Deal"
  onNew={handleNewDeal}
  onRowClick={(d) => navigate(`/deals/${d.id}`)}
  totalCount={totalCount}
  currentPage={page}
  totalPages={Math.ceil(totalCount / pageSize)}
  onPageChange={setPage}
/>
```

---

## Helper: Date Formatting

Add this shared utility at `src/utils/formatDate.ts`:

```ts
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}
```

---

## Files to Create / Modify

| Action | File |
|--------|------|
| **Create** | `src/components/shared/ListTable.tsx` |
| **Create** | `src/components/shared/StatusBadge.tsx` |
| **Create** | `src/utils/formatDate.ts` |
| **Modify** | `src/pages/Leads/LeadsList.tsx` (or equivalent) |
| **Modify** | `src/pages/Contacts/ContactsList.tsx` (or equivalent) |
| **Modify** | `src/pages/Accounts/AccountsList.tsx` (or equivalent) |
| **Modify** | `src/pages/Deals/DealsList.tsx` (or equivalent) |

> ⚠️ **Note to Agent:** Adjust import paths and field names to match the actual data models returned by the FastAPI backend. The column `key` names and `render` accessors should match the API response field names.

---

## What to Remove

From all four list views, **remove**:
- Colored avatar circles with initials (RO, TA, PS, etc.)
- Any inline background colors on table rows (replace with hover states from ListTable)
- Redundant border/divider lines between columns

---

## Git Workflow

```bash
git checkout -b feature/unified-list-view-redesign
# make all changes
git add src/components/shared/ src/utils/formatDate.ts src/pages/
git commit -m "feat: unified list view redesign across Leads, Contacts, Accounts, Deals"
git push origin feature/unified-list-view-redesign
```

Then open a PR for Yann to review before merging to main.
