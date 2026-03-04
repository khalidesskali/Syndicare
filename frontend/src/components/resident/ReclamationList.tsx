import React from "react";
import { Clock, AlertCircle, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Reclamation } from "@/api/residentReclamationApi";

interface ReclamationListProps {
  reclamations: Reclamation[];
  onReclamationClick?: (reclamation: Reclamation) => void;
  onDelete?: (reclamation: Reclamation) => void;
  deletingId?: number | null;
}

const ReclamationList: React.FC<ReclamationListProps> = ({
  reclamations,
  onReclamationClick,
  onDelete,
  deletingId,
}) => {
  const getStatusIcon = (status: Reclamation["status"]) => {
    const icons = {
      PENDING: Clock,
      IN_PROGRESS: AlertCircle,
      RESOLVED: CheckCircle,
      REJECTED: XCircle,
    };
    return icons[status];
  };

  const getStatusBadge = (status: Reclamation["status"]) => {
    const variants = {
      PENDING: "secondary" as const,
      IN_PROGRESS: "default" as const,
      RESOLVED: "default" as const,
      REJECTED: "destructive" as const,
    };

    const Icon = getStatusIcon(status);

    return (
      <Badge variant={variants[status]} className="flex items-center">
        <Icon className="h-3 w-3 mr-1" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Reclamation["priority"]) => {
    const variants = {
      LOW: "outline" as const,
      MEDIUM: "secondary" as const,
      HIGH: "destructive" as const,
      URGENT: "destructive" as const,
    };

    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (reclamations.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No reclamations found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Reclamations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reclamations.map((reclamation) => (
            <div
              key={reclamation.id}
              className={`border rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${
                onReclamationClick ? "cursor-pointer hover:border-blue-300" : ""
              }`}
              onClick={() => onReclamationClick?.(reclamation)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-lg text-slate-900">
                      {reclamation.title}
                    </h3>
                    {getPriorityBadge(reclamation.priority)}
                    {reclamation.ai_processed === false && (
                      <Badge variant="outline">AI processing</Badge>
                    )}
                    {reclamation.ai_processed === true &&
                      reclamation.category && (
                        <Badge variant="secondary">
                          {reclamation.category}
                        </Badge>
                      )}
                  </div>

                  <p className="text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                    {reclamation.content}
                  </p>

                  {reclamation.ai_processed === true &&
                    (reclamation.ai_summary ||
                      reclamation.suggested_department) && (
                      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        {reclamation.ai_summary && (
                          <div className="text-sm text-slate-700 leading-relaxed">
                            <span className="font-medium text-slate-900">
                              Summary:
                            </span>{" "}
                            {reclamation.ai_summary}
                          </div>
                        )}
                        {reclamation.suggested_department && (
                          <div className="mt-2 text-sm text-slate-700">
                            <span className="font-medium text-slate-900">
                              Department:
                            </span>{" "}
                            {reclamation.suggested_department}
                          </div>
                        )}
                      </div>
                    )}

                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Created: {formatDate(reclamation.created_at)}</span>
                    </div>
                    {reclamation.appartement &&
                      reclamation.appartement.immeuble && (
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                          <span>
                            Apt {reclamation.appartement.number} -{" "}
                            {reclamation.appartement.immeuble.name}
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(reclamation.status)}
                  <div className="flex items-center gap-2">
                    {reclamation.status === "PENDING" && onDelete && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        disabled={deletingId === reclamation.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(reclamation);
                        }}
                        title="Delete complaint"
                      >
                        {deletingId === reclamation.id ? (
                          <svg
                            className="w-4 h-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    {onReclamationClick && (
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {reclamation.response && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Response from Management:
                      </p>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        {reclamation.response}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReclamationList;
