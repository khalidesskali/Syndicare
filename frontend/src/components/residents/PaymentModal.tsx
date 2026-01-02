import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { Charge } from "../../types/residentPortal";
import type { ResidentChargePaymentRequest } from "../../api/residentCharges";

interface PaymentModalProps {
  charge: Charge | null;
  isOpen: boolean;
  onClose: () => void;
  onPayment: (paymentData: ResidentChargePaymentRequest) => Promise<boolean>;
  isProcessing?: boolean;
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CHECK", label: "Check" },
  { value: "CREDIT_CARD", label: "Credit Card" },
] as const;

export const PaymentModal: React.FC<PaymentModalProps> = ({
  charge,
  isOpen,
  onClose,
  onPayment,
  isProcessing = false,
}) => {
  const [formData, setFormData] = useState<
    Omit<ResidentChargePaymentRequest, "amount">
  >(() => ({
    payment_method: "BANK_TRANSFER",
    reference: "",
    paid_at: new Date().toISOString().split("T")[0],
  }));
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!charge) return;

    try {
      const paymentData = {
        amount: charge.amount,
        ...formData,
      };
      const success = await onPayment(paymentData);
      if (success) {
        onClose();
        // Reset form
        setFormData({
          payment_method: "BANK_TRANSFER",
          reference: "",
          paid_at: new Date().toISOString().split("T")[0],
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    }
  };

  if (!charge) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pay Charge</DialogTitle>
          <DialogDescription>
            Complete the payment for: {charge.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Charge Summary */}
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Charge Reference:</span>
              <span className="text-sm">{charge.reference}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Due Amount:</span>
              <span className="text-sm font-semibold">{charge.amount} MAD</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Apartment:</span>
              <span className="text-sm">{charge.appartement.number}</span>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value: any) =>
                  setFormData((prev) => ({ ...prev, payment_method: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                type="text"
                value={formData.reference}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reference: e.target.value,
                  }))
                }
                placeholder="Transaction reference, check number, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setFormData((prev) => ({
                          ...prev,
                          paid_at: date.toISOString().split("T")[0],
                        }));
                      }
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? "Processing..." : `Pay ${charge.amount} MAD`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
