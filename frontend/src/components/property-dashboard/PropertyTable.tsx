import { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Building2, 
  MapPin,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const properties = [
  {
    id: 1,
    name: "Sunset Apartments",
    address: "123 Sunset Blvd, Los Angeles, CA",
    type: "Multi-family",
    units: 20,
    occupied: 18,
    revenue: "$28,500",
    status: "Active",
  },
  {
    id: 2,
    name: "Marina Heights",
    address: "456 Marina Dr, San Diego, CA",
    type: "Condominium",
    units: 12,
    occupied: 12,
    revenue: "$18,000",
    status: "Active",
  },
  {
    id: 3,
    name: "Downtown Lofts",
    address: "789 Main St, San Francisco, CA",
    type: "Loft",
    units: 10,
    occupied: 8,
    revenue: "$15,200",
    status: "Active",
  },
  {
    id: 4,
    name: "Parkview Residences",
    address: "321 Park Ave, Sacramento, CA",
    type: "Apartment",
    units: 16,
    occupied: 14,
    revenue: "$21,000",
    status: "Active",
  },
  {
    id: 5,
    name: "Garden Villas",
    address: "654 Garden Way, Fresno, CA",
    type: "Villa",
    units: 8,
    occupied: 6,
    revenue: "$12,000",
    status: "Maintenance",
  },
];

export function PropertyTable() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <CardTitle className="text-base font-semibold">Properties</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              className="pl-9 bg-secondary border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Add Property
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Property</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground text-center">Units</TableHead>
                <TableHead className="text-muted-foreground text-center">Occupancy</TableHead>
                <TableHead className="text-muted-foreground text-right">Revenue</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map((property) => (
                <TableRow key={property.id} className="border-border hover:bg-secondary/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{property.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {property.address}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{property.type}</TableCell>
                  <TableCell className="text-center text-foreground">{property.units}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={cn(
                        "font-medium",
                        property.occupied / property.units >= 0.9 ? "text-primary" :
                        property.occupied / property.units >= 0.7 ? "text-chart-3" : "text-chart-5"
                      )}>
                        {Math.round((property.occupied / property.units) * 100)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({property.occupied}/{property.units})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {property.revenue}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "font-medium",
                        property.status === "Active" 
                          ? "bg-primary/10 text-primary border-primary/20" 
                          : "bg-chart-3/10 text-chart-3 border-chart-3/20"
                      )}
                    >
                      {property.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Property</DropdownMenuItem>
                        <DropdownMenuItem>View Tenants</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 pt-4 border-t border-border mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProperties.length} of {properties.length} properties
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
