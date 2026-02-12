export default function DashboardStats({ bugs }) {
  const total = bugs.length;
  const open = bugs.filter(b => b.status === "open").length;
  const assigned = bugs.filter(b => b.status === "assigned").length;
  const inProgress = bugs.filter(b => b.status === "in-progress").length;
  const fixed = bugs.filter(b => b.status === "fixed").length;

  return (
    <div className="grid grid-cols-5 gap-4 mb-8">
      <Stat label="Total Bugs" value={total} />
      <Stat label="Open" value={open} />
      <Stat label="Assigned" value={assigned} />
      <Stat label="In Progress" value={inProgress} />
      <Stat label="Fixed" value={fixed} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 text-center">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-indigo-600">{value}</p>
    </div>
  );
}
