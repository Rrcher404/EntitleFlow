export default function AppDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back. Here&apos;s your approval operations overview.</p>
      </div>
      <p className="text-sm text-muted-foreground border border-border rounded-lg p-4 bg-card">
        Connect your Supabase project to see real data here. Currently showing placeholder content.
      </p>
    </div>
  );
}
