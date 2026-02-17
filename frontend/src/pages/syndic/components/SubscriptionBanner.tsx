import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubscriptionBannerProps {
  status: string;
  daysRemaining: number;
  onRenewClick: () => void;
}

const SubscriptionBanner = ({
  status,
  daysRemaining,
  onRenewClick,
}: SubscriptionBannerProps) => {
  if (status === "active" && daysRemaining > 30) return null;

  if (status === "expired" || daysRemaining <= 0) {
    return (
      <Alert
        variant="destructive"
        className="mb-6 bg-red-50 text-red-900 border-red-200"
      >
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Subscription Expired</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>
            Your subscription has expired. Please renew to continue using all
            features.
          </span>
          <Button variant="destructive" size="sm" onClick={onRenewClick}>
            Renew Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-6 bg-yellow-50 text-yellow-900 border-yellow-200">
      <Info className="h-4 w-4 text-yellow-900" />
      <AlertTitle>Subscription Expiring Soon</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          Your subscription will expire in {daysRemaining} days. Renew now to
          avoid interruption.
        </span>
        <Button
          variant="outline"
          size="sm"
          className="border-yellow-600 text-yellow-900 hover:bg-yellow-100"
          onClick={onRenewClick}
        >
          Renew Subscription
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default SubscriptionBanner;
