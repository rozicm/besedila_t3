"use client";

import { api } from "~/utils/api";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Bell, Calendar, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const { data: reminders, isLoading } = api.notifications.getMyReminders.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Nalaganje...</div>
      </div>
    );
  }


  const upcomingReminders = reminders?.filter(
    (r) => new Date(r.reminderTime) > new Date() && !r.sent
  );
  const pastReminders = reminders?.filter(
    (r) => new Date(r.reminderTime) <= new Date() || r.sent
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Obvestila</h1>
        <p className="text-muted-foreground">
          Pregled opomnikov za prihajajoče nastope
        </p>
      </div>

      {/* Upcoming Reminders */}
      {upcomingReminders && upcomingReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Prihajajoče opomnike</h2>
          <div className="space-y-3">
            {upcomingReminders.map((reminder) => {
              const reminderDate = new Date(reminder.reminderTime);
              const performanceDate = new Date(reminder.performance.date);
              const timeUntil = reminderDate.getTime() - Date.now();
              const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
              const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

              return (
                <Card key={reminder.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">
                          {reminder.performance.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {reminder.performance.group.name}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {reminderDate.toLocaleDateString("sl-SI", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {reminderDate.toLocaleTimeString("sl-SI", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {hoursUntil > 0 ? (
                            <span className="text-blue-600 dark:text-blue-400">
                              Čez {hoursUntil}h {minutesUntil > 0 ? `${minutesUntil}min` : ""}
                            </span>
                          ) : (
                            <span className="text-orange-600 dark:text-orange-400">
                              Čez {minutesUntil}min
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Nastop:{" "}
                          {performanceDate.toLocaleDateString("sl-SI", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <Link href={`/calendar/${reminder.performance.id}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Reminders */}
      {pastReminders && pastReminders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Zgodovina</h2>
          <div className="space-y-3">
            {pastReminders.map((reminder) => {
              const reminderDate = new Date(reminder.reminderTime);
              const performanceDate = new Date(reminder.performance.date);
              const isPast = performanceDate < new Date();

              return (
                <Card key={reminder.id} className="p-4 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {reminder.sent ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">
                          {reminder.performance.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {reminder.performance.group.name}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {reminderDate.toLocaleDateString("sl-SI", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {reminderDate.toLocaleTimeString("sl-SI", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {reminder.sent && (
                            <span className="text-green-600 dark:text-green-400">
                              Poslano
                            </span>
                          )}
                          {isPast && (
                            <span className="text-muted-foreground">
                              Nastop je že potekel
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!isPast && (
                      <Link href={`/calendar/${reminder.performance.id}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!reminders || reminders.length === 0) && (
        <Card className="p-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground mb-2">
            Nimate še nobenih opomnikov
          </p>
          <p className="text-sm text-muted-foreground">
            Ko boste ustvarili nastop, boste samodejno prejeli opomnike
          </p>
        </Card>
      )}
    </div>
  );
}

