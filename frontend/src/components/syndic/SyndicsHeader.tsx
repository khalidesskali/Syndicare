import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SyndicsHeaderProps {
  onAddSyndic: () => void;
}

const SyndicsHeader: React.FC<SyndicsHeaderProps> = ({ onAddSyndic }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Syndics Management 👥
          </h2>
          <p className="text-slate-600">
            Manage all syndic accounts and their subscriptions
          </p>
        </div>
        <Button onClick={onAddSyndic} className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Syndic</span>
        </Button>
      </div>
    </div>
  );
};

export default SyndicsHeader;
