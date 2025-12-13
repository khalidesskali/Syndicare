import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChargeHeaderProps {
  onBulkCreate: () => void;
  onCreateCharge: () => void;
}

export function ChargeHeader({
  onBulkCreate,
  onCreateCharge,
}: ChargeHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Charges Management
          </h2>
          <p className="text-slate-600 mt-1">
            Manage and track all property charges and payments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={onBulkCreate}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          >
            <FileText className="mr-2 h-4 w-4" /> Bulk Create
          </Button>
          <Button
            onClick={onCreateCharge}
            className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> New Charge
          </Button>
        </div>
      </div>
    </div>
  );
}
