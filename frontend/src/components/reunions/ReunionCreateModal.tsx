import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { CreateReunionRequest } from "../../api/reunions";
import { useBuilding } from "@/hooks/useBuilding";

interface ReunionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateReunion: (data: CreateReunionRequest) => Promise<boolean>;
  loading?: boolean;
}

export function ReunionCreateModal({
  isOpen,
  onClose,
  onCreateReunion,
  loading = false,
}: ReunionCreateModalProps) {
  const {
    buildings,
    loading: buildingsLoading,
    refetch: refetchBuildings,
  } = useBuilding();

  const [formData, setFormData] = useState<CreateReunionRequest>({
    title: "",
    topic: "",
    date_time: "",
    location: "",
    immeuble: 0,
  });

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch buildings when modal opens
  useEffect(() => {
    if (isOpen) {
      refetchBuildings();
    }
  }, [isOpen, refetchBuildings]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.topic.trim()) {
      newErrors.topic = "Topic is required";
    }
    if (!formData.date_time) {
      newErrors.date_time = "Date and time are required";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    if (!formData.immeuble) {
      newErrors.immeuble = "Building is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const success = await onCreateReunion(formData);
    if (success) {
      onClose();
      // Reset form
      setFormData({
        title: "",
        topic: "",
        date_time: "",
        location: "",
        immeuble: 0,
      });
      setSelectedDate(undefined);
      setErrors({});
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Keep existing time or set default time
      const currentTime = formData.date_time
        ? new Date(formData.date_time)
        : new Date();
      const dateTime = new Date(date);
      dateTime.setHours(currentTime.getHours(), currentTime.getMinutes());

      setSelectedDate(date);
      setFormData((prev) => ({
        ...prev,
        date_time: dateTime.toISOString(),
      }));
      setShowCalendar(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white border-slate-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Create New Reunion
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-slate-700"
              >
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="mt-1 border-slate-200 focus:border-green-500 focus:ring-green-500"
                placeholder="Enter reunion title"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label
                htmlFor="topic"
                className="text-sm font-medium text-slate-700"
              >
                Topic *
              </Label>
              <Textarea
                id="topic"
                value={formData.topic}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    topic: e.target.value,
                  }))
                }
                className="mt-1 border-slate-200 focus:border-green-500 focus:ring-green-500"
                placeholder="Describe the reunion purpose and agenda"
                rows={3}
              />
              {errors.topic && (
                <p className="text-sm text-red-600 mt-1">{errors.topic}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="date"
                className="text-sm font-medium text-slate-700"
              >
                Date *
              </Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-1 border-slate-200 focus:border-green-500 focus:ring-green-500 justify-start text-left"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  {selectedDate
                    ? format(selectedDate, "MMM dd, yyyy")
                    : "Select date"}
                </Button>
                {showCalendar && (
                  <div className="absolute top-full mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-2">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      className="rounded-md"
                    />
                  </div>
                )}
              </div>
              {errors.date_time && (
                <p className="text-sm text-red-600 mt-1">{errors.date_time}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="time"
                className="text-sm font-medium text-slate-700"
              >
                Time *
              </Label>
              <Input
                id="time"
                type="time"
                value={
                  formData.date_time
                    ? new Date(formData.date_time).toTimeString().slice(0, 5)
                    : ""
                }
                onChange={(e) => {
                  const currentDate = formData.date_time
                    ? new Date(formData.date_time)
                    : new Date();
                  const [hours, minutes] = e.target.value.split(":");
                  currentDate.setHours(parseInt(hours), parseInt(minutes));
                  setFormData((prev) => ({
                    ...prev,
                    date_time: currentDate.toISOString(),
                  }));
                }}
                className="mt-1 border-slate-200 focus:border-green-500 focus:ring-green-500"
              />
              {errors.date_time && (
                <p className="text-sm text-red-600 mt-1">{errors.date_time}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="location"
                className="text-sm font-medium text-slate-700"
              >
                Location *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                className="mt-1 border-slate-200 focus:border-green-500 focus:ring-green-500"
                placeholder="e.g., Community Hall, Meeting Room A"
              />
              {errors.location && (
                <p className="text-sm text-red-600 mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="building"
                className="text-sm font-medium text-slate-700"
              >
                Building *
              </Label>
              <Select
                value={formData.immeuble.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    immeuble: parseInt(value),
                  }))
                }
                disabled={buildingsLoading}
              >
                <SelectTrigger className="mt-1 border-slate-200 focus:border-green-500 focus:ring-green-500">
                  <SelectValue
                    placeholder={
                      buildingsLoading
                        ? "Loading buildings..."
                        : "Select building"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem
                      key={building.id}
                      value={building.id.toString()}
                    >
                      {building.name}
                    </SelectItem>
                  ))}
                  {buildings.length === 0 && !buildingsLoading && (
                    <SelectItem value="0" disabled>
                      No buildings available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.immeuble && (
                <p className="text-sm text-red-600 mt-1">{errors.immeuble}</p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter className="flex space-x-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Reunion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
