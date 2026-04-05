# Projects & Products — Developer Documentation

## Overview

The Projects & Products section is the core operations layer of Prod-Ops. It provides a two-level view: a list view of all projects, and a deep-dive detail view per project. Together they cover project status tracking, deliverable management, resource assignments, issue escalation, and executive summaries.

---

## Routing

| Route | Component | Purpose |
|---|---|---|
| `/projects` | `src/pages/Projects.tsx` | Project list with filters and quick-actions |
| `/project/:id` | `src/pages/ProjectDetail.tsx` | Full project detail with 4 tabs |

The router is configured in `src/App.tsx`. Both routes are wrapped with the `AppSidebar` layout.

---

## Page: Projects (`/projects`)

### File
`src/pages/Projects.tsx`

### Features

| Feature | Description |
|---|---|
| Project cards | Displays each project as a card via `ProjectCard` component |
| Search | Free-text search on project name |
| PM / Ops status filter | Dropdown filters by `pm_status` and `ops_status` |
| Create project | Dialog form — name, description, status, priority, manager, start/end dates, budget |
| Edit project | Opens same form pre-filled from existing record |
| Import from Keka | Calls the `keka-projects` edge function, shows inserted/updated count in a toast |
| Progress indicator | Each card shows a progress bar from the `progress` field |
| Blockers badge | Number of unresolved issues shown on each card |

### Data Flow

```
useProjects() ──► projects[], deliverables[], issues[], tasks[]
                       │
                  Projects.tsx
                       │
                  ┌────▼──────┐
                  │ProjectCard│  ← per project
                  └───────────┘
```

`useProjects` fetches from Supabase on mount. It also joins manager info by looking up `employees.full_name` using `projects.manager_id`.

### Create / Edit project

Both create and edit use an in-page dialog. On submit:
- **Create:** calls `useProjects().addProject(data)` → inserts into `projects` table
- **Edit:** calls `useProjects().editProject(id, data)` → updates `projects` table
- Both update local state immediately (optimistic) before DB confirmation

### Import from Keka

`importProjectsFromKeka()` in `src/services/kekaApi.ts` calls `supabase.functions.invoke('keka-projects')`. The edge function upserts by project name match. See the [Supabase docs](./supabase.md) for environment setup.

---

## Page: Project Detail (`/project/:id`)

### File
`src/pages/ProjectDetail.tsx`

### Route Parameter
`id` — UUID of the project (`projects.id`)

### Layout

```
┌─────────────────────────────────┐
│  ← Back to Projects             │
├─────────────────────────────────┤
│  ProjectHeader                  │  ← always visible
├─────────────────────────────────┤
│  [Overview] [Project] [Resource] [Escalation]   │
│                                 │
│  <Tab content>                  │
└─────────────────────────────────┘
```

### ProjectHeader Component

**File:** `src/components/ProjectHeader.tsx`

Displays:
- Project name
- PM Status and Ops Status (colour-coded dropdowns — green / amber / red / not-started)
- Weekly status history (4 dots, each clickable to cycle through statuses)
- Last call date (calendar picker)
- Lead name and department

Handlers wired in `ProjectDetail.tsx`:
| Handler | DB Operation |
|---|---|
| `onStatusUpdate` | `UPDATE projects SET pm_status/ops_status` |
| `onWeeklyStatusAdd` | `INSERT INTO weekly_status` |
| `onWeeklyStatusUpdate` | `UPDATE weekly_status WHERE project_id AND week` |
| `onLastCallDateUpdate` | `UPDATE projects SET last_call_date` |

### Tab: Overview

**Component:** `src/components/ExecutiveSummary.tsx`

Displays a single-project summary:
- Status pill + progress bar
- 4 stat cards: Deliverables (done/total), Blockers (unresolved issues), Team size, Due date countdown
- Blocker alert banner if blockers > 0

Data passed in as a transformed project object — no additional fetches inside this component.

### Tab: Project (Deliverables)

**Component:** `src/components/MonthlyDeliverables.tsx`

**Props passed from ProjectDetail:**

| Prop | Type | Purpose |
|---|---|---|
| `projectId` | `string` | Used by AddTaskForm to scope employee picker |
| `tasks` | `Task[]` | Deliverables for this project |
| `onAddTask` | `fn` | Saves new deliverable to DB |
| `onTaskStatusUpdate` | `fn` | Updates `deliverables.status` |
| `onTaskFlag` | `fn` | Calls `set_deliverable_flagged` RPC |

**Table columns:** Deliverable name | Assignee (avatar + name + dept) | Due Date | Status | Type | Flag

**Filters available:** Status, Type, Assignee, Department, Month (prev/next navigation)

**Task Detail Side Sheet:**
Clicking any row opens a sheet showing full task info with editable status dropdown and flag toggle.

**Add Task:**
Clicking "Add Task" renders `AddTaskForm`:
- Assignee dropdown is scoped to employees allocated to this project (via `useAllocations`)
- Assignee is searchable (Command/combobox)
- Department auto-fills when assignee is selected
- Saves both `assignee_name` (string) and `responsible_employee` (UUID FK)

**Status Values and Meaning:**

| Status | Display | DB value |
|---|---|---|
| Green | On track | `green` |
| Amber | At risk | `amber` |
| Red | Blocked | `red` |
| Not Started | Not begun | `not-started` |
| Done | Completed | `done` |
| De-committed | Dropped from scope | `de-committed` |

> **Important:** `done` and `de-committed` bypass `STATUS_MAP` via the `DELIVERABLE_STATUS_PASS_THROUGH` set in `ProjectDetail.tsx` so they are not incorrectly mapped to `not-started` on load.

**Flag behaviour:**
Flagging calls `supabase.rpc('set_deliverable_flagged', { p_id, p_flagged })` instead of a direct column update. This is because PostgREST's schema cache can lag behind new column additions, and the RPC function bypasses it. See [migration `20260405160000`](./supabase.md#migrations).

### Tab: Resource

**Component:** `src/components/ResourceOverview.tsx`

Displays the project's allocated team:
- Employees grouped by department
- Each row: avatar, name, role, allocation % progress bar
- Summary stats: team size, department count, avg allocation
- Empty state: instructions to navigate to Resource Allocation tab

Data is fetched fresh inside `ResourceOverview` using `useAllocations()` and `useEmployees()` — no props drilling of allocation data.

### Tab: Escalation

**Component:** `src/components/IssuesTracker.tsx`

Scoped to the current project (`defaultProjectId` prop).

Features:
- Summary cards: Unresolved, Resolved, Total, Incidents
- Issue list with severity badge (Sev1, Sev2, Sev3, Incident), status, assignee, ETA
- Add Issue dialog: title, description, severity, assignee, ETA date picker
- Issue detail side sheet: editable timeline, status/severity dropdowns
- Real-time subscription to the `issues` table via Supabase channel

---

## Data Model: Projects

### `projects` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Required |
| `description` | text | Optional |
| `status` | text | `active`, `on-hold`, `cancelled`, `completed`, `not-started` |
| `pm_status` | text | PM's assessment: `green`, `amber`, `red`, `not-started` |
| `ops_status` | text | Ops assessment: same values |
| `priority` | text | `low`, `medium`, `high` |
| `start_date` | date | |
| `end_date` | date | |
| `budget` | numeric | Optional |
| `progress` | integer | 0–100 |
| `manager_id` | uuid | FK → `employees.id` (ON DELETE SET NULL) |
| `last_call_date` | date | Last sync call date |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto via trigger |

### `deliverables` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `project_id` | uuid | FK → `projects.id` |
| `name` | text | Task/deliverable name |
| `description` | text | |
| `type` | text | `new-feature`, `feature-request`, `bug`, `adhoc` |
| `status` | text | See status values above |
| `due_date` | date | |
| `completed_date` | date | |
| `assignee_name` | text | Display string |
| `responsible_employee` | uuid | FK → `employees.id` |
| `flagged` | boolean | Default `false` |
| `created_at` / `updated_at` | timestamptz | |

### `weekly_status` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `project_id` | uuid | FK → `projects.id` |
| `week` | text | ISO week string e.g. `2026-W14` |
| `status` | text | `green`, `amber`, `red`, `not-started` |
| UNIQUE | | `(project_id, week)` |

### `issues` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `project_id` | uuid | FK → `projects.id` |
| `title` | text | |
| `description` | text | |
| `severity` | text | `Sev1`, `Sev2`, `Sev3`, `Incident` |
| `status` | text | `unresolved`, `resolved` |
| `assigned_to` | text | Name string |
| `reported_by` | text | |
| `eta` | date | Expected resolution date |
| `resolved_at` | timestamptz | |
| `created_at` / `updated_at` | timestamptz | |

---

## Key Hooks

### `useProjects()`
**File:** `src/hooks/useProjects.ts`

Fetches projects, tasks, issues, deliverables in parallel. Joins manager info by looking up `employees` table for each unique `manager_id`. Exposes:
- `projects[]`, `tasks[]`, `issues[]`, `deliverables[]`
- `loading`, `error`
- `refetch()` — re-runs all queries
- `addProject(data)` — inserts and returns new project
- `editProject(id, updates)` — updates and returns updated project
- `updateProjectStatus(id, status, statusType?)` — targeted status update

---

## Key Constants

**File:** `src/lib/constants.ts`

```typescript
// Maps DB/Keka status strings → display status
STATUS_MAP: Record<string, 'green' | 'amber' | 'red' | 'not-started'>

// Maps Keka status → DB status column values
KEKA_TO_DB_STATUS: Record<string, string>
```

Status values that bypass `STATUS_MAP` (pass-through directly to UI):
```typescript
// In ProjectDetail.tsx
const DELIVERABLE_STATUS_PASS_THROUGH = new Set([
  'green', 'amber', 'red', 'not-started', 'de-committed', 'done'
]);
```

---

## Adding a New Project Field

1. Add column to `projects` table via a new migration in `supabase/migrations/`
2. Update `src/integrations/supabase/types.ts` (run `supabase gen types typescript`)
3. Add field to the create/edit form in `Projects.tsx`
4. Add field display in `ProjectHeader.tsx` or `ExecutiveSummary.tsx`
5. Pass field through the project transform in `ProjectDetail.tsx`'s `useMemo`

---

## Adding a New Deliverable Status

1. Add the value to the `DELIVERABLE_STATUS_PASS_THROUGH` set in `ProjectDetail.tsx`
2. Add it to the status dropdown options in `MonthlyDeliverables.tsx`
3. Optionally add a colour/label mapping in `MonthlyDeliverables.tsx`'s status config
