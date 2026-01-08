"use client";

import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Bell, BellOff, CheckCircle, XCircle } from "lucide-react";
import {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isPushSubscribed,
  sendTestNotification,
} from "~/utils/push-notifications";

export default function NotificationSettingsPage() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isLoading, setIsLoading] = useState(false);

  const utils = api.useContext();
  const subscribeMutation = api.notifications.subscribe.useMutation({
    onSuccess: () => {
      utils.notifications.getSubscriptions.invalidate();
    },
  });

  const unsubscribeMutation = api.notifications.unsubscribe.useMutation({
    onSuccess: () => {
      utils.notifications.getSubscriptions.invalidate();
    },
  });

  useEffect(() => {
    // Check current status
    const checkStatus = async () => {
      if ("Notification" in window) {
        setPermission(Notification.permission);
      }

      const reg = await registerServiceWorker();
      setRegistration(reg);

      if (reg) {
        const subscribed = await isPushSubscribed(reg);
        setIsSubscribed(subscribed);
      }
    };

    checkStatus();
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      // Request permission
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);

      if (newPermission !== "granted") {
        alert("Morate dovoliti notifikacije v brskalniku!");
        return;
      }

      // Register service worker if not already registered
      let reg = registration;
      if (!reg) {
        reg = await registerServiceWorker();
        setRegistration(reg);
      }

      if (!reg) {
        alert("Napaka pri registraciji service workerja!");
        return;
      }

      // Subscribe to push notifications
      const subscriptionData = await subscribeToPushNotifications(reg);

      if (!subscriptionData) {
        alert("Napaka pri naročanju na notifikacije!");
        return;
      }

      // Save subscription to database
      await subscribeMutation.mutateAsync(subscriptionData);

      setIsSubscribed(true);
      alert("Notifikacije so bile uspešno omogočene!");
    } catch (error) {
      console.error("Error enabling notifications:", error);
      alert("Napaka pri omogočanju notifikacij!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    try {
      if (!registration) {
        return;
      }

      // Get current subscription
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Unsubscribe from push notifications
        await unsubscribeFromPushNotifications(registration);
        
        // Remove from database
        await unsubscribeMutation.mutateAsync({
          endpoint: subscription.endpoint,
        });
      }

      setIsSubscribed(false);
      alert("Notifikacije so bile onemogočene!");
    } catch (error) {
      console.error("Error disabling notifications:", error);
      alert("Napaka pri onemogočanju notifikacij!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = () => {
    sendTestNotification(
      "Test notifikacija",
      "To je testna notifikacija iz Band Manager aplikacije!"
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Nastavitve notifikacij</h1>

        {/* Status Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isSubscribed ? (
                <Bell className="h-8 w-8 text-green-500" />
              ) : (
                <BellOff className="h-8 w-8 text-muted-foreground" />
              )}
              <div>
                <h2 className="text-xl font-semibold">Push notifikacije</h2>
                <p className="text-sm text-muted-foreground">
                  {isSubscribed
                    ? "Notifikacije so omogočene"
                    : "Notifikacije so onemogočene"}
                </p>
              </div>
            </div>
            <Switch
              checked={isSubscribed}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleEnableNotifications();
                } else {
                  handleDisableNotifications();
                }
              }}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              {permission === "granted" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>
                Status dovoljenja:{" "}
                <span className="font-medium">
                  {permission === "granted"
                    ? "Dovoljeno"
                    : permission === "denied"
                    ? "Zavrnjeno"
                    : "Ni zahtevano"}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {registration ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>
                Service Worker:{" "}
                <span className="font-medium">
                  {registration ? "Registriran" : "Ni registriran"}
                </span>
              </span>
            </div>
          </div>
        </Card>

        {/* Information Card */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-3">Kdaj boste prejeli notifikacije?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>1 dan pred nastopom</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>1 uro pred nastopom</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Ko vas nekdo povabi v skupino</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Ko se spremeni setlist nastopa</span>
            </li>
          </ul>
        </Card>

        {/* Test Notification */}
        {isSubscribed && (
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Testiranje</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Preizkusite, ali notifikacije delujejo pravilno.
            </p>
            <Button onClick={handleTestNotification} variant="outline">
              Pošlji testno notifikacijo
            </Button>
          </Card>
        )}

        {/* Instructions */}
        {!isSubscribed && (
          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-3">Kako omogočiti notifikacije?</h3>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Kliknite na stikalo zgoraj</li>
              <li>V brskalniku dovolite notifikacije</li>
              <li>Aplikacija bo samodejno registrirala vaš naprava</li>
              <li>Prejemali boste obvestila o prihodnjih nastopih</li>
            </ol>
          </Card>
        )}
      </div>
    </div>
  );
}

