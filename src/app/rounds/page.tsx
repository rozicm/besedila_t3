"use client";

import { useState } from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Modal } from "~/components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ song, onRemove }: { song: any; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded border bg-card p-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex-1">
        <p className="font-medium">{song.title}</p>
        {song.key && <p className="text-sm text-muted-foreground">Key: {song.key}</p>}
        {song.harmonica && (
          <p className="text-sm text-muted-foreground">
            Accordion: {song.harmonica.replace(/_/g, '-').split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('-')}
          </p>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={onRemove}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export default function RoundsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<any>(null);
  const [selectedSongs, setSelectedSongs] = useState<number[]>([]);

  const utils = api.useContext();

  const { data: rounds, isLoading: roundsLoading } = api.rounds.list.useQuery();
  const { data: allSongs, isLoading: songsLoading } = api.songs.list.useQuery();

  const createMutation = api.rounds.create.useMutation({
    onSuccess: () => {
      setIsModalOpen(false);
      setEditingRound(null);
      setSelectedSongs([]);
      void utils.rounds.list.invalidate();
    },
  });

  const deleteMutation = api.rounds.delete.useMutation({
    onSuccess: () => {
      void utils.rounds.list.invalidate();
    },
  });

  const reorderMutation = api.rounds.reorderSongs.useMutation({
    onSuccess: () => {
      void utils.rounds.list.invalidate();
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateRound = (name: string, description?: string) => {
    if (selectedSongs.length > 0) {
      createMutation.mutate({ name, description, songIds: selectedSongs });
    }
  };

  const handleDeleteRound = (roundId: number) => {
    if (confirm("Are you sure you want to delete this round?")) {
      deleteMutation.mutate({ id: roundId });
    }
  };

  const handleDragEnd = (event: DragEndEvent, roundId: number) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const round = rounds?.find((r) => r.id === roundId);
    if (!round) return;

    const oldIndex = round.roundItems.findIndex((item) => item.song.id === active.id);
    const newIndex = round.roundItems.findIndex((item) => item.song.id === over.id);

    const newOrder = arrayMove(round.roundItems, oldIndex, newIndex);
    const newSongIds = newOrder.map((item) => item.song.id);

    reorderMutation.mutate({ roundId, songIds: newSongIds });
  };

  const toggleSongSelection = (songId: number) => {
    setSelectedSongs((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  if (roundsLoading || songsLoading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rounds</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Round
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rounds?.map((round) => (
          <Card key={round.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{round.name}</CardTitle>
                  {round.description && (
                    <CardDescription>{round.description}</CardDescription>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    {round.roundItems.length} song{round.roundItems.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRound(round.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, round.id)}
              >
                <SortableContext
                  items={round.roundItems.map((item) => item.song.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {round.roundItems.map((item) => (
                      <SortableItem
                        key={item.id}
                        song={item.song}
                        onRemove={() =>
                          reorderMutation.mutate({
                            roundId: round.id,
                            songIds: round.roundItems
                              .filter((i) => i.song.id !== item.song.id)
                              .map((i) => i.song.id),
                          })
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        ))}
      </div>

      <RoundFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRound(null);
          setSelectedSongs([]);
        }}
        onSave={handleCreateRound}
        allSongs={allSongs || []}
        selectedSongs={selectedSongs}
        onToggleSong={toggleSongSelection}
      />
    </div>
  );
}

function RoundFormModal({
  isOpen,
  onClose,
  onSave,
  allSongs,
  selectedSongs,
  onToggleSong,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
  allSongs: any[];
  selectedSongs: number[];
  onToggleSong: (songId: number) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");

  const filteredSongs = allSongs.filter((song) =>
    song.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && selectedSongs.length > 0) {
      onSave(name, description || undefined);
      setName("");
      setDescription("");
      setSearch("");
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Create New Round"
      maxWidth="max-w-4xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name || selectedSongs.length === 0}>
            Create
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Round Name *</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label>Select Songs ({selectedSongs.length} selected)</Label>
          <Input
            placeholder="Search songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-[400px] overflow-y-auto rounded border p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {filteredSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex flex-col items-start space-y-1 rounded border p-2 hover:bg-accent cursor-pointer"
                  onClick={() => onToggleSong(song.id)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="checkbox"
                      checked={selectedSongs.includes(song.id)}
                      onChange={() => onToggleSong(song.id)}
                      className="cursor-pointer"
                    />
                    <p className="font-medium text-sm truncate w-full">{song.title}</p>
                  </div>
                  {song.key && <p className="text-xs text-muted-foreground ml-6">Key: {song.key}</p>}
                  {song.harmonica && (
                    <p className="text-xs text-muted-foreground ml-6">
                      Accordion: {song.harmonica.replace(/_/g, '-').split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('-')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}


