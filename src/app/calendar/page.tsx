"use client";

import { useState, useMemo } from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Modal } from "~/components/ui/modal";
import { Textarea } from "~/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Clock,
  Music,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
} from "lucide-react";

interface Performance {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  date: Date;
  duration?: number | null;
  notes?: string | null;
  group: {
    id: string;
    name: string;
  };
  _count: {
    setlist: number;
  };
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const [newPerformance, setNewPerformance] = useState({
    name: "",
    description: "",
    location: "",
    date: new Date().toISOString().slice(0, 16),
    duration: 120,
    notes: "",
  });

  const utils = api.useContext();
  const { data: groups } = api.groups.list.useQuery();
  const { data: upcomingPerformances } = api.performances.upcoming.useQuery({ limit: 50 });

  const createPerformanceMutation = api.performances.create.useMutation({
    onSuccess: () => {
      utils.performances.upcoming.invalidate();
      setIsCreateModalOpen(false);
      resetForm();
    },
  });

  const deletePerformanceMutation = api.performances.delete.useMutation({
    onSuccess: () => {
      utils.performances.upcoming.invalidate();
    },
  });

  const resetForm = () => {
    setNewPerformance({
      name: "",
      description: "",
      location: "",
      date: new Date().toISOString().slice(0, 16),
      duration: 120,
      notes: "",
    });
    setSelectedGroupId("");
  };

  const handleCreatePerformance = () => {
    if (!newPerformance.name.trim() || !selectedGroupId) return;

    createPerformanceMutation.mutate({
      groupId: selectedGroupId,
      name: newPerformance.name,
      description: newPerformance.description || undefined,
      location: newPerformance.location || undefined,
      date: new Date(newPerformance.date),
      duration: newPerformance.duration || undefined,
      notes: newPerformance.notes || undefined,
    });
  };

  // Calendar logic
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday = 0

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }

    return days;
  }, [currentYear, currentMonth, daysInMonth, adjustedFirstDay]);

  const performancesByDate = useMemo(() => {
    const map = new Map<string, Performance[]>();
    if (!upcomingPerformances) return map;

    upcomingPerformances.forEach((perf) => {
      const date = new Date(perf.date);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(perf as Performance);
    });

    return map;
  }, [upcomingPerformances]);

  const getPerformancesForDate = (date: Date | null): Performance[] => {
    if (!date) return [];
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return performancesByDate.get(key) || [];
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const previousMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const monthNames = [
    "Januar",
    "Februar",
    "Marec",
    "April",
    "Maj",
    "Junij",
    "Julij",
    "Avgust",
    "September",
    "Oktober",
    "November",
    "December",
  ];

  const dayNames = ["Pon", "Tor", "Sre", "Čet", "Pet", "Sob", "Ned"];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Koledar nastopov</h1>
          <p className="text-muted-foreground mt-1">
            Pregled in upravljanje prihodnjih nastopov
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nov nastop
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((date, index) => {
            const performances = getPerformancesForDate(date);
            const hasPerformances = performances.length > 0;

            return (
              <div
                key={index}
                className={`
                  min-h-[100px] p-2 rounded-lg border
                  ${date ? "bg-background hover:bg-muted/50 cursor-pointer" : "bg-muted/20"}
                  ${isToday(date) ? "border-blue-500 border-2" : ""}
                  ${hasPerformances ? "border-green-500" : ""}
                `}
              >
                {date && (
                  <>
                    <div className="text-sm font-medium mb-1">
                      {date.getDate()}
                    </div>
                    {performances.length > 0 && (
                      <div className="space-y-1">
                        {performances.slice(0, 2).map((perf) => (
                          <div
                            key={perf.id}
                            className="text-xs p-1 rounded bg-green-500/10 text-green-700 dark:text-green-400 truncate"
                            title={perf.name}
                          >
                            {perf.name}
                          </div>
                        ))}
                        {performances.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{performances.length - 2} več
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Upcoming Performances List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Prihajajoči nastopi</h2>
        {upcomingPerformances && upcomingPerformances.length > 0 ? (
          <div className="space-y-3">
            {upcomingPerformances.map((performance) => (
              <div
                key={performance.id}
                className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{performance.name}</h3>
                      <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {performance.group.name}
                      </span>
                    </div>

                    {performance.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {performance.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        {new Date(performance.date).toLocaleDateString("sl-SI", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(performance.date).toLocaleTimeString("sl-SI", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {performance.duration && ` (${performance.duration} min)`}
                      </div>
                      {performance.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {performance.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Music className="h-4 w-4" />
                        {performance._count.setlist} pesmi
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        (window.location.href = `/calendar/${performance.id}`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (
                          confirm("Ali ste prepričani, da želite izbrisati ta nastop?")
                        ) {
                          deletePerformanceMutation.mutate({ id: performance.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Ni prihodnjih nastopov</p>
          </div>
        )}
      </Card>

      {/* Create Performance Modal */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Ustvari nov nastop"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="groupSelect">Skupina</Label>
            <select
              id="groupSelect"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              <option value="">Izberi skupino...</option>
              {groups?.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="performanceName">Ime nastopa</Label>
            <Input
              id="performanceName"
              value={newPerformance.name}
              onChange={(e) =>
                setNewPerformance({ ...newPerformance, name: e.target.value })
              }
              placeholder="Npr. Poročna zabava, Festival..."
            />
          </div>

          <div>
            <Label htmlFor="performanceDate">Datum in ura</Label>
            <Input
              id="performanceDate"
              type="datetime-local"
              value={newPerformance.date}
              onChange={(e) =>
                setNewPerformance({ ...newPerformance, date: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="performanceLocation">Lokacija (opcijsko)</Label>
            <Input
              id="performanceLocation"
              value={newPerformance.location}
              onChange={(e) =>
                setNewPerformance({ ...newPerformance, location: e.target.value })
              }
              placeholder="Npr. Kongresni center Ljubljana"
            />
          </div>

          <div>
            <Label htmlFor="performanceDuration">Trajanje (minute)</Label>
            <Input
              id="performanceDuration"
              type="number"
              value={newPerformance.duration}
              onChange={(e) =>
                setNewPerformance({
                  ...newPerformance,
                  duration: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>

          <div>
            <Label htmlFor="performanceDescription">Opis (opcijsko)</Label>
            <Textarea
              id="performanceDescription"
              value={newPerformance.description}
              onChange={(e) =>
                setNewPerformance({
                  ...newPerformance,
                  description: e.target.value,
                })
              }
              rows={2}
              placeholder="Kratek opis nastopa..."
            />
          </div>

          <div>
            <Label htmlFor="performanceNotes">Opombe (opcijsko)</Label>
            <Textarea
              id="performanceNotes"
              value={newPerformance.notes}
              onChange={(e) =>
                setNewPerformance({ ...newPerformance, notes: e.target.value })
              }
              rows={2}
              placeholder="Dodatne opombe..."
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
            >
              Prekliči
            </Button>
            <Button
              onClick={handleCreatePerformance}
              disabled={
                !newPerformance.name.trim() ||
                !selectedGroupId ||
                createPerformanceMutation.isLoading
              }
            >
              Ustvari
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

