import { Plus } from "lucide-react";

interface DashboardQuickActionsProps {
  onAddBuilding: () => void;
  onAddResident: () => void;
  onCreateCharge: () => void;
  onScheduleMeeting: () => void;
}

export function DashboardQuickActions({
  onAddBuilding,
  onAddResident,
  onCreateCharge,
  onScheduleMeeting,
}: DashboardQuickActionsProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={onAddBuilding}
          className="flex items-center justify-center space-x-2 p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Add Building</span>
        </button>
        <button
          onClick={onAddResident}
          className="flex items-center justify-center space-x-2 p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Add Resident</span>
        </button>
        <button
          onClick={onCreateCharge}
          className="flex items-center justify-center space-x-2 p-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Create Charge</span>
        </button>
        <button
          onClick={onScheduleMeeting}
          className="flex items-center justify-center space-x-2 p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Schedule Meeting</span>
        </button>
      </div>
    </div>
  );
}
