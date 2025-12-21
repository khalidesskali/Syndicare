interface DashboardHeaderProps {
  onRefreshData?: () => void;
}

export function DashboardHeader({ onRefreshData }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Syndic Dashboard
          </h2>
          <p className="text-slate-600 mt-1">
            Manage your properties, residents, and community services.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              Refresh Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
