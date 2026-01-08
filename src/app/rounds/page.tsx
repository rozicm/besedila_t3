"use client";

import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Modal } from "~/components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Plus, Edit, Trash2, GripVertical, List } from "lucide-react";
import { useGroup, GroupSelector } from "~/components/group-context";
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

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-2 rounded border bg-card p-3 cursor-grab active:cursor-grabbing"
    >
      <div className="flex-shrink-0">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{song.title}</p>
        {song.key && <p className="text-sm text-muted-foreground">Key: {song.key}</p>}
        {song.harmonica && (
          <p className="text-sm text-muted-foreground">
            Accordion: {song.harmonica.replace(/_/g, '-').split('-').map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('-')}
          </p>
        )}
        {song.bas_bariton && (
          <p className="text-sm text-muted-foreground">Instrument: {song.bas_bariton}</p>
        )}
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleRemoveClick}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="flex-shrink-0"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export default function RoundsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<any>(null);
  const [selectedSongs, setSelectedSongs] = useState<number[]>([]);

  const { selectedGroupId, isLoading: isGroupLoading } = useGroup();
  const utils = api.useContext();

  const { data: rounds, isLoading: roundsLoading } = api.rounds.list.useQuery(
    { groupId: selectedGroupId! },
    { enabled: !!selectedGroupId }
  );
  const { data: allSongs, isLoading: songsLoading } = api.songs.list.useQuery(
    { groupId: selectedGroupId! },
    { enabled: !!selectedGroupId }
  );

  const createMutation = api.rounds.create.useMutation({
    onSuccess: () => {
      setIsModalOpen(false);
      setEditingRound(null);
      setSelectedSongs([]);
      void utils.rounds.list.invalidate();
    },
  });

  const updateMutation = api.rounds.update.useMutation({
    onSuccess: () => {
      void utils.rounds.list.invalidate();
    },
  });

  const updateSongsMutation = api.rounds.reorderSongs.useMutation({
    onSuccess: () => {
      void utils.rounds.list.invalidate();
    },
  });

  const deleteMutation = api.rounds.delete.useMutation({
    onSuccess: () => {
      void utils.rounds.list.invalidate();
    },
  });

  const reorderMutation = api.rounds.reorderSongs.useMutation({
    // Optimistically reorder songs locally for instant UI feedback
    onMutate: async (variables) => {
      await utils.rounds.list.cancel();
      const previous = utils.rounds.list.getData({ groupId: selectedGroupId! });

      utils.rounds.list.setData({ groupId: selectedGroupId! }, (old: any) => {
        if (!old) return old;
        return old.map((round: any) => {
          if (round.id !== variables.roundId) return round;
          // Build a lookup of existing items by songId
          const bySongId: Record<number, any> = {};
          for (const item of round.roundItems) {
            bySongId[item.song.id] = item;
          }
          // Rebuild roundItems in the new order
          const reordered = variables.songIds
            .map((songId, index) => {
              const item = bySongId[songId];
              if (!item) return null;
              return { ...item, position: index };
            })
            .filter(Boolean);

          return {
            ...round,
            roundItems: reordered,
          };
        });
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        utils.rounds.list.setData({ groupId: selectedGroupId! }, context.previous as any);
      }
    },
    // No refetch on success; optimistic update already applied
  });

  const removeSongMutation = api.rounds.removeSong.useMutation({
    onMutate: async (variables) => {
      await utils.rounds.list.cancel();
      const previous = utils.rounds.list.getData({ groupId: selectedGroupId! });

      utils.rounds.list.setData({ groupId: selectedGroupId! }, (old: any) => {
        if (!old) return old;
        return old.map((round: any) => {
          if (round.id !== variables.roundId) return round;
          return {
            ...round,
            roundItems: round.roundItems.filter((ri: any) => ri.song.id !== variables.songId),
          };
        });
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        utils.rounds.list.setData({ groupId: selectedGroupId! }, context.previous as any);
      }
    },
    onSettled: () => {
      void utils.rounds.list.invalidate();
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateRound = (name: string, description?: string) => {
    if (!selectedGroupId) return;
    if (selectedSongs.length > 0) {
      createMutation.mutate({ name, description, songIds: selectedSongs, groupId: selectedGroupId });
    }
  };

  const handleEditRound = (round: any) => {
    setEditingRound(round);
    setSelectedSongs(round.roundItems.map((item: any) => item.song.id));
    setIsModalOpen(true);
  };

  const handleUpdateRound = async (name: string, description?: string) => {
    if (!editingRound || !selectedGroupId) return;

    // Update name and description
    const nameOrDescChanged = 
      name !== editingRound.name || 
      (description || "") !== (editingRound.description || "");

    // Update songs if they've changed
    const currentSongIds = editingRound.roundItems.map((item: any) => item.song.id);
    const songsChanged = 
      selectedSongs.length !== currentSongIds.length ||
      !selectedSongs.every((id, index) => id === currentSongIds[index]);

    // Only make API calls if something actually changed
    if (nameOrDescChanged || songsChanged) {
      const promises: Promise<any>[] = [];

      if (nameOrDescChanged) {
        promises.push(
          updateMutation.mutateAsync({
            id: editingRound.id,
            name,
            description: description || undefined,
            groupId: selectedGroupId,
          })
        );
      }

      if (songsChanged) {
        promises.push(
          updateSongsMutation.mutateAsync({
            roundId: editingRound.id,
            songIds: selectedSongs,
            groupId: selectedGroupId,
          })
        );
      }

      // Wait for all updates to complete
      await Promise.all(promises);
    }

    // Close modal after updates complete
    setIsModalOpen(false);
    setEditingRound(null);
    setSelectedSongs([]);
  };

  const handleDeleteRound = (roundId: number) => {
    if (!selectedGroupId) return;
    if (confirm("Are you sure you want to delete this round?")) {
      deleteMutation.mutate({ id: roundId, groupId: selectedGroupId });
    }
  };

  const handleDragEnd = (event: DragEndEvent, roundId: number) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !selectedGroupId) return;

    const round = rounds?.find((r) => r.id === roundId);
    if (!round) return;

    const oldIndex = round.roundItems.findIndex((item) => item.song.id === active.id);
    const newIndex = round.roundItems.findIndex((item) => item.song.id === over.id);

    // Safety check: ensure both indices are valid
    if (oldIndex === -1 || newIndex === -1) {
      console.error("Invalid drag indices", { oldIndex, newIndex, active: active.id, over: over.id });
      return;
    }

    // If indices haven't changed, no need to update
    if (oldIndex === newIndex) return;

    const newOrder = arrayMove(round.roundItems, oldIndex, newIndex);
    const newSongIds = newOrder.map((item) => item.song.id);

    reorderMutation.mutate({ roundId, songIds: newSongIds, groupId: selectedGroupId });
  };

  const toggleSongSelection = (songId: number) => {
    setSelectedSongs((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  if (isGroupLoading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!selectedGroupId) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center">
        <div className="text-center">
          <List className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No group selected</h3>
          <p className="text-muted-foreground">
            Please create or join a group to manage rounds.
          </p>
        </div>
      </div>
    );
  }

  if (roundsLoading || songsLoading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Rounds</h1>
          <GroupSelector />
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Round
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRound(round)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRound(round.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
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
                        key={item.song.id}
                        song={item.song}
                        onRemove={() => selectedGroupId && removeSongMutation.mutate({ roundId: round.id, songId: item.song.id, groupId: selectedGroupId })}
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
        onSave={editingRound ? handleUpdateRound : handleCreateRound}
        allSongs={allSongs || []}
        selectedSongs={selectedSongs}
        onToggleSong={toggleSongSelection}
        editingRound={editingRound}
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
  editingRound,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
  allSongs: any[];
  selectedSongs: number[];
  onToggleSong: (songId: number) => void;
  editingRound?: any;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");

  // Update form when editingRound changes
  useEffect(() => {
    if (editingRound) {
      setName(editingRound.name || "");
      setDescription(editingRound.description || "");
    } else {
      setName("");
      setDescription("");
      setSearch("");
    }
  }, [editingRound, isOpen]);

  const filteredSongs = allSongs.filter((song) =>
    song.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && (editingRound || selectedSongs.length > 0)) {
      onSave(name, description || undefined);
      if (!editingRound) {
        setName("");
        setDescription("");
        setSearch("");
      }
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editingRound ? "Edit Round" : "Create New Round"}
      maxWidth="max-w-4xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name || (!editingRound && selectedSongs.length === 0)}>
            {editingRound ? "Update" : "Create"}
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
            {filteredSongs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No songs found</p>
            ) : (
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
                        Accordion: {song.harmonica.replace(/_/g, '-').split('-').map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('-')}
                      </p>
                    )}
                    {song.bas_bariton && (
                      <p className="text-xs text-muted-foreground ml-6">Instrument: {song.bas_bariton}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}


