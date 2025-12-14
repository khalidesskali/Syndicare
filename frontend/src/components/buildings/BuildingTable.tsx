import { Building as BuildingIcon, Edit2, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Building } from "../../types/building";

interface BuildingTableProps {
  buildings: Building[];
  onEdit: (building: Building) => void;
  onDelete: (building: Building) => void;
}

export function BuildingTable({
  buildings,
  onEdit,
  onDelete,
}: BuildingTableProps) {
  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
        return "default";
      case "maintenance":
        return "secondary";
      case "inactive":
        return "destructive";
      default:
        return "outline";
    }
  };

  const occupancyRate = (occupied: number, total: number) => {
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  };

  if (buildings.length === 0) {
    return (
      <Card className="py-12">
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <BuildingIcon className="h-12 w-12 text-muted-foreground" />
          <CardTitle className="text-lg">No buildings found</CardTitle>
          <CardDescription className="text-center">
            Try adjusting your search or filters to find what you're looking for
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-900 pl-5">
              Building
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Address
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Apartments
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Occupancy
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Status
            </TableHead>
            <TableHead className="font-semibold text-slate-900 pr-5">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buildings.map((building) => (
            <TableRow key={building.id}>
              <TableCell className="pl-5">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white">
                    <BuildingIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {building.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      Built {building.year_built}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                  {building.address}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-slate-900">
                  {building.occupied_apartments} / {building.total_apartments}
                </div>
                <div className="text-xs text-slate-500">
                  {building.floors} floors
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div className="flex-1 mr-2">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${occupancyRate(
                            building.occupied_apartments,
                            building.total_apartments
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {occupancyRate(
                      building.occupied_apartments,
                      building.total_apartments
                    )}
                    %
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(building.status)}>
                  {building.status}
                </Badge>
              </TableCell>
              <TableCell className="pr-5">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(building)}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Edit2 className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(building)}
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
