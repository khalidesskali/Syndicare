import React from "react";
const SyndicsHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Syndics Management 👥
          </h2>
          <p className="text-slate-600">
            Manage all syndic accounts and their details
          </p>
        </div>
      </div>
    </div>
  );
};

export default SyndicsHeader;
