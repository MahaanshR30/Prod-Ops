# Resource Allocation & Management — Developer Documentation

## Overview

The Resource section (`/resources`) manages the full lifecycle of people management: who is on the team, what they're working on, and how stretched they are. It has four tabs: Overview, Employees, Allocation, and Utilization. Allocation data also feeds back into the Projects section (resource tab, add-task assignee picker).

---

## Routing

| Route | Component | Notes |
|---|---|---|
| `/resources` | `src/pages/Resources.tsx` | All 4 tabs live here |

---

## Page: Resources (`/resources`)

### File
`src/pages/Resources.tsx`

### Tab Structure

```
Resources
├── Overview       ← Portfolio-level stats (no actions)
├── Employees      ← Employee directory + CRUD + Keka import
├── Allocation     ← Drag-and-drop project assignment
└── Utilization    ← Per-employee overwork/underwork analysis
```

---

## Tab: Overview

Computed client-side from `useProjects()`, `useEmployees()`, `useAllocations()`. No additional DB calls.

### Sections

**1. Summary stat cards**

| Card | Source |
|---|---|
| Total Employees | `employees.length` |
| Allocated | Unique `employee_id`s in allocations |
| Active Projects | Unique `project_id`s in allocations |
| Avg Utilization | Sum of all employee total allocations / employee count |

**2. Department Breakdown**

Groups employees by `department` field. For each department shows:
- `X / Y allocated` (employees with any allocation vs total in dept)
- Average allocation % across all employees in dept
- Progress bar

**3. Allocation Health**

| Card | Criteria | Colour |
|---|---|---|
| Over-allocated | Employee total allocation > 100% | Red |
| At capacity | Employee total allocation 80–100% | Amber |

Each card lists up to 4/6 employee avatars + names + allocation %. "Low allocated" (<50%) is computed but not shown in a card — used for internal analysis.

**4. Project Teams grid**

One card per project that has at least one allocation. Each card shows:
- Project name + member count badge
- Department tags (unique departments of allocated members)
- Average allocation bar
- Member avatar stack (up to 6, then "+N more")

---

## Tab: Employees

### Component
`src/components/EmployeesList.tsx`

### Features

| Feature | Description |
|---|---|
| Search | Filters by `full_name` (case-insensitive) |
| Role filter | Dropdown of unique positions |
| Employee cards | Avatar + name + role + department + status badge + utilization bar |
| Add Employee | Dialog form with 6 fields |
| Edit Employee | Pre-filled dialog, same fields |
| Delete Employee | Confirm-delete action |
| Import from Keka | Calls `keka-employees` edge function, shows inserted/updated/deduped count |

### Employee Card

```
┌─────────────────────────────────────┐
│ [AV]  Full Name          Active ●   │
│       Position                       │
│       Department                     │
│  Utilization ████░░░░ 40%            │
│  Skills: [React] [TypeScript]        │
└─────────────────────────────────────┘
```

Utilization % is calculated from `useAllocations()` — sum of all allocations for that employee.

### `safeStr()` Helper

Keka sometimes stores `position` or `department` as a serialized JSON object string (e.g., `'{"identifier":"...","title":"Admin"}'`). `safeStr()` in `EmployeesList.tsx` parses these and extracts `.title` or `.name` so they render as plain text.

```typescript
function safeStr(val: string | null | undefined): string {
  if (!val) return '';
  try {
    const parsed = JSON.parse(val);
    if (parsed && typeof parsed === 'object') return parsed.title ?? parsed.name ?? '';
  } catch {}
  return val;
}
```

### Keka Import Flow

1. User clicks "Import from Keka"
2. `handleImportFromKeka()` calls `supabase.functions.invoke('keka-employees')`
3. Edge function fetches all employees from Keka with pagination
4. Each employee is upserted — match priority: **email → employee_id → full_name**
5. Duplicate rows sharing the same email are set to `status = 'inactive'`
6. Returns `{ inserted, updated, skipped, deduped, total }`
7. Toast shows result summary

### Deduplication Logic

If an employee appears twice in Keka (e.g., old intern record + current associate record), both having the same email:
- The first import creates/updates one row
- The second Keka record matches the same DB row by email → updates it
- Any other DB rows with the same email are marked `inactive`

This prevents the scenario where the same person exists twice with different roles/positions.

---

## Tab: Allocation

### Component
`src/components/ResourceAllocation.tsx`

### Layout

```
┌──────────────────────────────────────────────────────┐
│  Project Cards (left, main area)  │ Employee Sidebar │
│                                   │  (always visible)│
│  [Project A]                      │                  │
│   ┌─ Employee ─ 50% ─────── ✕ ─┐ │ [EMP] Name  40%  │
│   └─────────────────────────────┘ │ [EMP] Name 100%  │
│                                   │ ...              │
│  [Project B]                      │                  │
│   (drag here)                     │                  │
└──────────────────────────────────────────────────────┘
```

### Drag and Drop

- Employees are draggable items from the right sidebar
- Project cards are droppable targets
- On drop: `useAllocations().upsert(projectId, employeeId, 50)` — defaults to 50%
- Uses `react-beautiful-dnd`

### Allocation Percentage

After adding an employee to a project, a dropdown (5% to 100% in 5% steps) lets you set the exact allocation. On change: immediate `upsert()` — no save button.

### Validation

- Cannot set total allocation > 100% per employee (shown as warning colour)
- The sidebar shows each employee's current total allocation % with colour coding:
  - Green: < 80%
  - Amber: 80–100%
  - Red: > 100%

### Remove Allocation

Each allocation row has an ✕ button. On click: `useAllocations().remove(projectId, employeeId)` — deletes the DB row immediately.

### CSV Export

"Export CSV" button downloads a flat CSV of all current allocations:
```
Employee, Project, Allocation%
John Doe, Project Alpha, 75
...
```

---

## Tab: Utilization

### Component
`src/components/ResourceUtilization.tsx`

### Classification

| Status | Threshold | Colour |
|---|---|---|
| Overworked | Total allocation > 100% | Red |
| Optimal | Total allocation 60–100% | Green |
| Underworked | Total allocation < 60% | Amber |

Total allocation = sum of `allocation` across all `allocations` rows for that employee.

### Features

- Summary cards: Overworked count, Underworked count, Optimal count, Avg Utilization
- Filter dropdown: All / Overworked / Underworked / Optimal
- Employee cards: name, role (plain text), status badge, utilization progress bar, assignment breakdown (project → %)

---

## Core Hook: `useAllocations()`

### File
`src/hooks/useAllocations.ts`

### Interface

```typescript
type Allocation = {
  id: string;
  project_id: string;
  employee_id: string;
  allocation: number;  // 0-100
};

const {
  allocations,    // Allocation[] — full flat list
  loading,        // boolean
  upsert,         // (projectId, employeeId, allocation) => Promise<{error?}>
  remove,         // (projectId, employeeId) => Promise<{error?}>
  getProjectAllocations,       // (projectId) => Allocation[]
  getEmployeeTotalAllocation,  // (employeeId) => number
} = useAllocations();
```

### How `upsert` works

```typescript
await supabase.from('allocations').upsert(
  { project_id, employee_id, allocation },
  { onConflict: 'project_id,employee_id' }
);
```

The unique constraint `allocations_project_employee_unique` on `(project_id, employee_id)` makes this idempotent — calling it twice just updates the existing row.

### Local State

`useAllocations` keeps a local `allocations` state array. After any `upsert` or `remove`, local state is updated immediately (no refetch needed). This makes allocation changes feel instant in the UI.

### Where else it's used

| Component | Usage |
|---|---|
| `Resources.tsx` | Overview stats, dept breakdown, allocationHealth |
| `ResourceAllocation.tsx` | Full CRUD |
| `ResourceUtilization.tsx` | Compute per-employee totals |
| `ResourceOverview.tsx` | Project team view in ProjectDetail |
| `AddTaskForm.tsx` | Filter employees to project-allocated only |

---

## Data Model: Resources

### `employees` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `employee_id` | text | Keka employee number (unique) |
| `full_name` | text | |
| `email` | text | |
| `avatar_url` | text | |
| `department` | text | From Keka groups (groupType=1) |
| `position` | text | Job title |
| `salary` | numeric | |
| `hire_date` | date | From Keka `joiningDate` |
| `status` | text | `active`, `inactive` |
| `skills` | text[] | Array of skill strings |
| `utilization_rate` | numeric | Stored but computed dynamically from allocations |
| `role` | text | App-level role (not Keka) |
| `created_at` / `updated_at` | timestamptz | |

### `allocations` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `project_id` | uuid | FK → `projects.id` |
| `employee_id` | uuid | FK → `employees.id` |
| `allocation` | integer | 0–100, DB check constraint |
| `created_at` / `updated_at` | timestamptz | |
| UNIQUE | | `(project_id, employee_id)` |

The unique constraint is what makes `upsert` work correctly. Without it, Supabase's upsert would insert duplicates.

---

## Edge Function: `keka-employees`

### File
`supabase/functions/keka-employees/index.ts`

### Endpoint Called
`https://foxsense.keka.com/api/v1/hris/employees?pageNumber=N&pageSize=100`

### Environment Variables Required

| Variable | Purpose |
|---|---|
| `KEKA_CLIENT_ID` | OAuth client ID |
| `KEKA_CLIENT_SECRET` | OAuth client secret |
| `KEKA_API_KEY` | API key for `kekaapi` grant type |
| `KEKA_BASE_URL` | Base URL (defaults to `https://foxsense.keka.com`) |
| `SUPABASE_URL` | Set automatically by Supabase runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | Set automatically by Supabase runtime |

### Field Mapping

| Keka Field | DB Column | Notes |
|---|---|---|
| `employeeNumber` | `employee_id` | Primary Keka identifier |
| `displayName` / `fullName` | `full_name` | Falls back to firstName + lastName |
| `email` / `workEmail` | `email` | |
| `image` / `profileImageUrl` | `avatar_url` | |
| `groups[groupType=1].title` | `department` | Department is in the groups array |
| `jobTitle.title` | `position` | jobTitle is an object with `.title` |
| `joiningDate` | `hire_date` | Truncated to date (strips time) |
| `employmentStatus` | `status` | Mapped: inactive/terminated/resigned/exit → `inactive`, else → `active` |

### `extractString()` Helper

Keka fields are sometimes strings, sometimes objects (`{ identifier: "...", title: "Admin" }`). `extractString()` handles both:

```typescript
function extractString(val: any, ...keys: string[]): string | null {
  if (!val) return null;
  if (typeof val === 'string') return val || null;
  if (typeof val === 'object') {
    for (const k of keys) {
      if (typeof val[k] === 'string' && val[k]) return val[k];
    }
  }
  return null;
}
```

### Debug Mode

Append `?debug=1` when invoking to return raw Keka sample instead of importing:
```typescript
supabase.functions.invoke('keka-employees', { body: {}, headers: { '...': '...' } })
// or via URL: POST /functions/v1/keka-employees?debug=1
```

Returns first 2 raw Keka employee objects + all field keys — useful when Keka API changes fields.

### Response Format

```typescript
// Success
{ success: true, inserted: 3, updated: 47, skipped: 0, deduped: 2, total: 50 }

// Error (always HTTP 200 so body is readable)
{ success: false, error: "Missing Keka credentials..." }
```

---

## AddTaskForm: Allocation-Scoped Assignee

When adding a deliverable inside a project, the assignee picker only shows employees allocated to that specific project:

```typescript
// AddTaskForm.tsx
const { getProjectAllocations } = useAllocations();
const { employees } = useEmployees();

const allocatedEmployees = useMemo(() => {
  const ids = new Set(getProjectAllocations(projectId).map(a => a.employee_id));
  return employees.filter(e => ids.has(e.id));
}, [projectId, getProjectAllocations, employees]);
```

If a project has no allocations yet, the assignee field shows an empty state and the "Add Task" button is disabled.

When an assignee is selected, `department` auto-fills via a `useEffect` watching `assigneeId`.

---

## Seats (separate page)

### File
`src/pages/Seats.tsx` + `src/components/SeatAllocation.tsx`

Uses `useSeats()` hook which provides:
- `seats[]` — all seats with assignment info
- `updateSeatAssignment(seatId, employeeId | null)` — assign or unassign
- `createSeat(data)` — add new seat
- `deleteSeat(id)` — remove seat

---

## Adding a New Allocation Field

1. Add column to `allocations` via a migration
2. Run `supabase gen types typescript` to update `src/integrations/supabase/types.ts`
3. Update the `Allocation` type in `src/hooks/useAllocations.ts`
4. Update `upsert()` to include the new field
5. Display the field in `ResourceAllocation.tsx`

## Changing Utilization Thresholds

Edit the classification logic in `ResourceUtilization.tsx`:
```typescript
const status: UtilizationStatus =
  total > 100 ? 'overworked' :
  total < 60  ? 'underworked' :
  'optimal';
```

And the parallel threshold in `Resources.tsx` overview:
```typescript
const overAllocated = allocationHealth.filter(e => e.total > 100);
const highAllocated = allocationHealth.filter(e => e.total >= 80 && e.total <= 100);
const lowAllocated  = allocationHealth.filter(e => e.total > 0 && e.total < 50);
```
