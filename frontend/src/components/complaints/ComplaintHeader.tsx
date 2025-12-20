import { Button } from "@/components/ui/button";
import { Plus, MessageSquare } from "lucide-react";

interface ComplaintHeaderProps {
  onCreateComplaint?: () => void;
}

export function ComplaintHeader({ onCreateComplaint }: ComplaintHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <MessageSquare className="mr-3 h-8 w-8 text-orange-600" />
            Complaints Management
          </h1>
          <p className="mt-2 text-slate-600">
            Manage and respond to resident complaints and requests
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {onCreateComplaint && (
            <Button
              onClick={onCreateComplaint}
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Complaint
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
