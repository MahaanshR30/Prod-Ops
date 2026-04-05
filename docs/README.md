# Prod-Ops — Documentation Index

## What is Prod-Ops?

Prod-Ops is an internal operations dashboard for managing projects, people, and resources. It integrates with Keka (HRIS/PSA) for employee and project data sync.

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Supabase (Postgres + Edge Functions)

---

## Docs

| Document | What it covers |
|---|---|
| [Projects & Products](./projects-and-products.md) | Project list, project detail tabs, deliverables, tasks, issues, weekly status, data model |
| [Resource Allocation](./resource-allocation.md) | Employee directory, drag-and-drop allocation, utilization analysis, Keka import, seats |
| [Supabase](./supabase.md) | Schema, migrations, edge functions, RPC functions, real-time, deployment checklist |

---

## App Routes

| Route | Page | Description |
|---|---|---|
| `/` | Overview | Executive KPI dashboard |
| `/projects` | Projects | Project list with filters, create/edit/import |
| `/project/:id` | ProjectDetail | 4-tab detail: Overview, Project, Resource, Escalation |
| `/resources` | Resources | 4-tab: Overview, Employees, Allocation, Utilization |
| `/seats` | Seats | Workspace seat assignment |
| `/escalation` | Escalation | Cross-project issue tracker |

---

## Key Concepts

**Allocation** — An employee assigned to a project at a given % of their time (0–100). One employee can be allocated across multiple projects but their total should not exceed 100%. Stored in the `allocations` table with a unique constraint on `(project_id, employee_id)`.

**Deliverable** — A task/work item within a project. Has a status (green/amber/red/not-started/done/de-committed), type (new-feature/bug/etc.), assignee, due date, and a flag for high-priority items.

**PM Status / Ops Status** — Two separate status fields on each project allowing the PM and Ops leads to independently signal health (green/amber/red/not-started).

**Weekly Status** — A per-project rolling history of health dots, stored in `weekly_status` table with `(project_id, week)` unique constraint.

**Keka Sync** — Two Supabase Edge Functions (`keka-employees`, `keka-projects`) pull data from the Keka API and upsert into Supabase. Employees are deduplicated by email.

---

## Local Development

```bash
npm install
npm run dev          # starts at http://localhost:8080

npm run build        # production build (check for chunk warnings)
npx tsc --noEmit     # type check only
```

Supabase commands:
```bash
supabase link --project-ref fvmccqmrlezybbhapwau
supabase db push                  # apply pending migrations
supabase functions deploy         # deploy all edge functions
supabase gen types typescript ... # regenerate types after schema change
```

See [supabase.md](./supabase.md) for full details.
