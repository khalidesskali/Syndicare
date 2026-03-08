import { Edit2, Trash2 } from "lucide-react";
import type { Resident } from "../../types/resident";
import { Skeleton } from "@/components/ui/skeleton";

interface ResidentsTableProps {
  residents: Resident[];
  loading?: boolean;
  onEdit: (resident: Resident) => void;
  onDelete: (id: number) => void;
}

export function ResidentsTable({
  residents,
  loading = false,
  onEdit,
  onDelete,
}: ResidentsTableProps) {
  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <Skeleton className="h-4 w-24" />
                </th>
                <th className="px-6 py-3 text-left">
                  <Skeleton className="h-4 w-24" />
                </th>
                <th className="px-6 py-3 text-left">
                  <Skeleton className="h-4 w-24" />
                </th>
                <th className="px-6 py-3 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-40" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (residents.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="text-center py-12">
          <p className="text-gray-500">No residents found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resident
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Apartment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {residents.map((resident) => (
              <tr key={resident.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {resident.first_name} {resident.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Joined{" "}
                      {new Date(resident.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{resident.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {resident.apartments?.[0]?.number || "Not assigned"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {resident.apartments?.[0]?.building || "No building"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(resident)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(resident.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
