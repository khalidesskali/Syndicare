import React, { useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Check, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refetch } =
    useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (
      notification.type === "RECLAMATION_CREATED" ||
      notification.type === "RECLAMATION_UPDATED"
    ) {
      if (user?.role === "SYNDIC") {
        navigate("/syndic/complaints");
      } else if (user?.role === "RESIDENT") {
        navigate("/resident/reclamations");
      }
    } else if (
      notification.type === "CHARGE_CREATED" ||
      notification.type === "PAYMENT_CONFIRMED"
    ) {
      if (user?.role === "RESIDENT") navigate("/resident/charges");
    } else if (notification.type === "REUNION_SCHEDULED") {
      if (user?.role === "RESIDENT") navigate("/resident/reunions");
      else if (user?.role === "SYNDIC") navigate("/syndic/reunions");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Notifications</p>
            <p className="text-xs leading-none text-muted-foreground">
              You have {unreadCount} unread messages
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No new notifications
            </div>
          ) : (
            notifications.map((notification: any) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex flex-col items-start p-3 cursor-pointer ${
                  notification.read
                    ? "opacity-70"
                    : "bg-slate-50 dark:bg-slate-800"
                }`}
              >
                <div className="flex w-full justify-between items-start gap-2">
                  <span className="font-medium text-sm">
                    {notification.title}
                  </span>
                  {!notification.read && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <span className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {notification.message}
                </span>
                <span className="flex items-center text-[10px] text-slate-400 mt-2">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full text-xs"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
