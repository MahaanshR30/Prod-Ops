import { Progress } from "@/components/ui/progress";
import { CheckSquare, AlertTriangle, Users, CalendarDays, TrendingUp } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface Project {
  id: string;
  name: string;
  status: "green" | "amber" | "red" | "not-started";
  progress: number;
  dueDate: string;
  department: string;
  lead: string;
  deliverables: number;
  completedDeliverables: number;
  deliverablesByStatus?: {
    green: number;
    amber: number;
    red: number;
    'not-started': number;
    done: number;
    'de-committed': number;
  };
  blockers: number;
  teamSize: number;
  hoursAllocated: number;
  hoursUsed: number;
}

const STATUS_CFG = {
  green:        { label: 'On Track',     dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
  amber:        { label: 'At Risk',      dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
  red:          { label: 'Off Track',    dot: 'bg-red-500',   text: 'text-red-700',   bg: 'bg-red-50' },
  'not-started':{ label: 'Not Started',  dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-100' },
};

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100">
      <div className="p-2 bg-slate-50 rounded-lg text-slate-500">{icon}</div>
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export const ExecutiveSummary = ({ projects }: { projects: Project[] }) => {
  const p = projects[0];
  if (!p) return <p className="text-slate-400 text-sm">No project data.</p>;

  const cfg = STATUS_CFG[p.status] ?? STATUS_CFG['not-started'];
  const daysLeft = p.dueDate ? differenceInDays(new Date(p.dueDate), new Date()) : null;
  const formattedDue = p.dueDate ? format(new Date(p.dueDate), 'MMM d, yyyy') : '—';
  const deliverablePct = p.deliverables > 0 ? Math.round((p.completedDeliverables / p.deliverables) * 100) : 0;

  const STATUS_ROWS = [
    { key: 'done'         as const, label: 'Done',        barColor: 'bg-blue-500',   textColor: 'text-blue-700',   bg: 'bg-blue-50'   },
    { key: 'green'        as const, label: 'On Track',    barColor: 'bg-green-500',  textColor: 'text-green-700',  bg: 'bg-green-50'  },
    { key: 'amber'        as const, label: 'At Risk',     barColor: 'bg-amber-500',  textColor: 'text-amber-700',  bg: 'bg-amber-50'  },
    { key: 'red'          as const, label: 'Blocked',     barColor: 'bg-red-500',    textColor: 'text-red-700',    bg: 'bg-red-50'    },
    { key: 'not-started'  as const, label: 'Not Started', barColor: 'bg-slate-400',  textColor: 'text-slate-600',  bg: 'bg-slate-50'  },
    { key: 'de-committed' as const, label: 'De-committed',barColor: 'bg-purple-500', textColor: 'text-purple-700', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-5">
      {/* Status + progress hero row */}
      <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Overall Status</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${cfg.bg} ${cfg.text}`}>
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Progress</p>
            <p className="text-3xl font-bold text-slate-900">{p.progress ?? 0}%</p>
          </div>
        </div>
        <Progress value={p.progress ?? 0} className="h-2.5" />
        {p.lead && p.lead !== 'Unassigned' && (
          <p className="text-xs text-slate-400 mt-2">Lead: <span className="text-slate-600 font-medium">{p.lead}</span></p>
        )}
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat
          icon={<CheckSquare className="w-4 h-4" />}
          label="Deliverables"
          value={`${p.completedDeliverables}/${p.deliverables}`}
          sub={`${deliverablePct}% complete`}
        />
        <Stat
          icon={<AlertTriangle className="w-4 h-4" />}
          label="Blockers"
          value={p.blockers}
          sub={p.blockers === 0 ? 'All clear' : 'Unresolved issues'}
        />
        <Stat
          icon={<Users className="w-4 h-4" />}
          label="Team Size"
          value={p.teamSize}
          sub="allocated members"
        />
        <Stat
          icon={<CalendarDays className="w-4 h-4" />}
          label="Due Date"
          value={daysLeft !== null ? `${Math.max(0, daysLeft)}d` : '—'}
          sub={formattedDue}
        />
      </div>

      {/* Deliverable status breakdown */}
      <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-slate-700 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-slate-400" /> Deliverable Breakdown
          </span>
          <span className="text-slate-500">{p.deliverables} total · {deliverablePct}% done</span>
        </div>

        {p.deliverables === 0 ? (
          <p className="text-sm text-slate-400">No deliverables added yet.</p>
        ) : p.deliverablesByStatus ? (
          <div className="space-y-2">
            {STATUS_ROWS.map(({ key, label, barColor, textColor }) => {
              const count = p.deliverablesByStatus![key] ?? 0;
              if (count === 0) return null;
              const pct = Math.round((count / p.deliverables) * 100);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-medium ${textColor}`}>{label}</span>
                    <span className="text-slate-500">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <Progress value={deliverablePct} className="h-2" />
            <div className="flex justify-between text-xs text-slate-400">
              <span>{deliverablePct}% complete</span>
              <span>{p.deliverables - p.completedDeliverables} remaining</span>
            </div>
          </>
        )}
      </div>

      {/* Blockers alert */}
      {p.blockers > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">{p.blockers} unresolved {p.blockers === 1 ? 'issue' : 'issues'}</p>
            <p className="text-xs text-red-600 mt-0.5">Go to the Escalation tab to review and resolve blockers.</p>
          </div>
        </div>
      )}
    </div>
  );
};
