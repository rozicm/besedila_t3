"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Modal } from "~/components/ui/modal";
import { Textarea } from "~/components/ui/textarea";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Music,
  Plus,
  X,
  Edit,
  GripVertical,
  Copy,
} from "lucide-react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-center gap-2">
        <div {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        {children}
      </div>
    </div>
  );
}

export default function PerformanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const performanceId = params.id as string;

  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [isCopySetlistModalOpen, setIsCopySetlistModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null);
  const [songNotes, setSongNotes] = useState("");
  const [copySourceType, setCopySourceType] = useState<"performance" | "round">("performance");
  const [copySourceId, setCopySourceId] = useState("");
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    location: "",
    date: "",
    duration: "",
    notes: "",
  });

  const utils = api.useContext();
  const { data: performance, isLoading } = api.performances.get.useQuery({
    id: performanceId,
  });
  const { data: songs } = api.songs.list.useQuery();
  const { data: rounds } = api.rounds.list.useQuery();

  const addSongMutation = api.performances.addSongToSetlist.useMutation({
    onSuccess: () => {
      utils.performances.get.invalidate({ id: performanceId });
      setIsAddSongModalOpen(false);
      setSelectedSongId(null);
      setSongNotes("");
    },
  });

  const removeSongMutation = api.performances.removeSongFromSetlist.useMutation({
    onSuccess: () => {
      utils.performances.get.invalidate({ id: performanceId });
    },
  });

  const reorderSetlistMutation = api.performances.reorderSetlist.useMutation({
    onSuccess: () => {
      utils.performances.get.invalidate({ id: performanceId });
    },
  });

  const copySetlistMutation = api.performances.copySetlist.useMutation({
    onSuccess: () => {
      utils.performances.get.invalidate({ id: performanceId });
      setIsCopySetlistModalOpen(false);
      setCopySourceId("");
    },
  });

  const updatePerformanceMutation = api.performances.update.useMutation({
    onSuccess: () => {
      utils.performances.get.invalidate({ id: performanceId });
      setIsEditModalOpen(false);
    },
  });

  const handleAddSong = () => {
    if (!selectedSongId) return;
    addSongMutation.mutate({
      performanceId,
      songId: selectedSongId,
      notes: songNotes || undefined,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !performance) return;

    const oldIndex = performance.setlist.findIndex((item) => item.id === active.id);
    const newIndex = performance.setlist.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newSetlist = [...performance.setlist];
    const [movedItem] = newSetlist.splice(oldIndex, 1);
    newSetlist.splice(newIndex, 0, movedItem);

    // Update positions
    const updates = newSetlist.map((item, index) => ({
      id: item.id,
      position: index,
    }));

    reorderSetlistMutation.mutate({
      performanceId,
      items: updates,
    });
  };

  const handleCopySetlist = () => {
    if (!copySourceId) return;

    const sourceId = copySourceType === "round" ? parseInt(copySourceId) : copySourceId;

    copySetlistMutation.mutate({
      performanceId,
      sourceType: copySourceType,
      sourceId,
    });
  };

  const handleOpenEditModal = () => {
    if (!performance) return;
    
    // Format date for datetime-local input
    const date = new Date(performance.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const dateTimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;

    setEditForm({
      name: performance.name,
      description: performance.description || "",
      location: performance.location || "",
      date: dateTimeLocal,
      duration: performance.duration?.toString() || "",
      notes: performance.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePerformance = () => {
    if (!editForm.name.trim()) return;

    const date = editForm.date ? new Date(editForm.date) : undefined;
    const duration = editForm.duration ? parseInt(editForm.duration) : undefined;

    updatePerformanceMutation.mutate({
      id: performanceId,
      name: editForm.name,
      description: editForm.description || undefined,
      location: editForm.location || undefined,
      date: date,
      duration: duration,
      notes: editForm.notes || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Nalaganje...</div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Nastop ni bil najden.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.push("/calendar")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Nazaj na koledar
      </Button>

      {/* Performance Details */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{performance.name}</h1>
            <span className="text-sm px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {performance.group.name}
            </span>
          </div>
          <Button variant="outline" onClick={handleOpenEditModal}>
            <Edit className="mr-2 h-4 w-4" />
            Uredi
          </Button>
        </div>

        {performance.description && (
          <p className="text-muted-foreground mb-4">{performance.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span>
              {new Date(performance.date).toLocaleDateString("sl-SI", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span>
              {new Date(performance.date).toLocaleTimeString("sl-SI", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {performance.duration && ` (${performance.duration} min)`}
            </span>
          </div>
          {performance.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{performance.location}</span>
            </div>
          )}
        </div>

        {performance.notes && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-1">Opombe:</p>
            <p className="text-sm text-muted-foreground">{performance.notes}</p>
          </div>
        )}
      </Card>

      {/* Setlist */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            Setlist ({performance.setlist.length} pesmi)
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCopySetlistModalOpen(true)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Kopiraj setlist
            </Button>
            <Button onClick={() => setIsAddSongModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Dodaj pesem
            </Button>
          </div>
        </div>

        {performance.setlist.length > 0 ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={performance.setlist.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {performance.setlist.map((item, index) => (
                  <SortableItem key={item.id} id={item.id}>
                    <div className="flex-1 flex items-center justify-between p-3 rounded-lg border bg-background">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm font-mono text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium">{item.song.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.song.genre}
                            {item.song.key && ` • ${item.song.key}`}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeSongMutation.mutate({ setlistItemId: item.id })
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Music className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Setlist je prazen. Dodajte pesmi!</p>
          </div>
        )}
      </Card>

      {/* Add Song Modal */}
      <Modal
        open={isAddSongModalOpen}
        onClose={() => {
          setIsAddSongModalOpen(false);
          setSelectedSongId(null);
          setSongNotes("");
        }}
        title="Dodaj pesem v setlist"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="songSelect">Pesem</Label>
            <select
              id="songSelect"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={selectedSongId || ""}
              onChange={(e) => setSelectedSongId(parseInt(e.target.value))}
            >
              <option value="">Izberi pesem...</option>
              {songs?.map((song) => (
                <option key={song.id} value={song.id}>
                  {song.title} - {song.genre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="songNotes">Opombe (opcijsko)</Label>
            <Textarea
              id="songNotes"
              value={songNotes}
              onChange={(e) => setSongNotes(e.target.value)}
              placeholder="Npr. 'počasi', 'brez 2. kitice'..."
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddSongModalOpen(false);
                setSelectedSongId(null);
                setSongNotes("");
              }}
            >
              Prekliči
            </Button>
            <Button
              onClick={handleAddSong}
              disabled={!selectedSongId || addSongMutation.isLoading}
            >
              Dodaj
            </Button>
          </div>
        </div>
      </Modal>

      {/* Copy Setlist Modal */}
      <Modal
        open={isCopySetlistModalOpen}
        onClose={() => {
          setIsCopySetlistModalOpen(false);
          setCopySourceId("");
        }}
        title="Kopiraj setlist"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="sourceType">Kopiraj iz</Label>
            <select
              id="sourceType"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={copySourceType}
              onChange={(e) =>
                setCopySourceType(e.target.value as "performance" | "round")
              }
            >
              <option value="performance">Drug nastop</option>
              <option value="round">Krog</option>
            </select>
          </div>

          <div>
            <Label htmlFor="sourceId">
              {copySourceType === "performance" ? "Nastop" : "Krog"}
            </Label>
            <select
              id="sourceId"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={copySourceId}
              onChange={(e) => setCopySourceId(e.target.value)}
            >
              <option value="">Izberi...</option>
              {copySourceType === "round"
                ? rounds?.map((round) => (
                    <option key={round.id} value={round.id}>
                      {round.name}
                    </option>
                  ))
                : null}
            </select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsCopySetlistModalOpen(false);
                setCopySourceId("");
              }}
            >
              Prekliči
            </Button>
            <Button
              onClick={handleCopySetlist}
              disabled={!copySourceId || copySetlistMutation.isLoading}
            >
              Kopiraj
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Performance Modal */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Uredi nastop"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="editName">Ime nastopa</Label>
            <Input
              id="editName"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              placeholder="Npr. Poročna zabava, Festival..."
            />
          </div>

          <div>
            <Label htmlFor="editDate">Datum in ura</Label>
            <Input
              id="editDate"
              type="datetime-local"
              value={editForm.date}
              onChange={(e) =>
                setEditForm({ ...editForm, date: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="editLocation">Lokacija (opcijsko)</Label>
            <Input
              id="editLocation"
              value={editForm.location}
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
              placeholder="Npr. Kongresni center Ljubljana"
            />
          </div>

          <div>
            <Label htmlFor="editDuration">Trajanje (minute)</Label>
            <Input
              id="editDuration"
              type="number"
              value={editForm.duration}
              onChange={(e) =>
                setEditForm({ ...editForm, duration: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="editDescription">Opis (opcijsko)</Label>
            <Textarea
              id="editDescription"
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              rows={2}
              placeholder="Kratek opis nastopa..."
            />
          </div>

          <div>
            <Label htmlFor="editNotes">Opombe (opcijsko)</Label>
            <Textarea
              id="editNotes"
              value={editForm.notes}
              onChange={(e) =>
                setEditForm({ ...editForm, notes: e.target.value })
              }
              rows={2}
              placeholder="Dodatne opombe..."
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Prekliči
            </Button>
            <Button
              onClick={handleUpdatePerformance}
              disabled={
                !editForm.name.trim() || updatePerformanceMutation.isLoading
              }
            >
              Shrani spremembe
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

