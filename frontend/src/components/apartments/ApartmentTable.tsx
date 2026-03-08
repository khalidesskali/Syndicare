import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Building,
  MapPin,
  Users,
} from "lucide-react";
import type { Apartment } from "../../types/apartment";

import { Skeleton } from "@/components/ui/skeleton";

interface ApartmentTableProps {
  apartments: Apartment[];
  loading: boolean;
  onEditApartment: (apartmentId: number) => void;
  onDeleteApartment: (apartmentId: number) => void;
  onViewDetails: (apartmentId: number) => void;
  onAssignResident: (apartmentId: number) => void;
  onRemoveResident: (apartmentId: number) => void;
}

export function ApartmentTable({
  apartments,
  loading,
  onEditApartment,
  onDeleteApartment,
  onViewDetails,
  onAssignResident,
  onRemoveResident,
}: ApartmentTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-32" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-28" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-32" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead className="text-right">
                <Skeleton className="h-4 w-12 ml-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 ml-auto rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (apartments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          No apartments found
        </h3>
        <p className="text-slate-600">
          Get started by creating your first apartment.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-900">
              Apartment
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Building
            </TableHead>

            <TableHead className="font-semibold text-slate-900">
              Monthly Charge
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Resident
            </TableHead>
            <TableHead className="font-semibold text-slate-900">
              Status
            </TableHead>
            <TableHead className="font-semibold text-slate-900 text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apartments.map((apartment) => (
            <TableRow
              key={apartment.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <TableCell className="font-medium text-slate-900">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-slate-400" />
                  <span>{apartment.number}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">
                      {apartment.building_name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {apartment.building_address}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-slate-900">
                    {apartment.monthly_charge} Dhs
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {apartment.is_occupied ? (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium text-slate-900">
                        {apartment.resident_name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {apartment.resident_email}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-slate-400">
                    <UserMinus className="h-4 w-4" />
                    <span>Vacant</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    apartment.is_occupied
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-amber-100 text-amber-700 border-amber-200"
                  }
                >
                  {apartment.is_occupied ? "Occupied" : "Vacant"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => onViewDetails(apartment.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEditApartment(apartment.id)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Apartment
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {apartment.is_occupied ? (
                      <DropdownMenuItem
                        onClick={() => onRemoveResident(apartment.id)}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remove Resident
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => onAssignResident(apartment.id)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign Resident
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteApartment(apartment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Apartment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
