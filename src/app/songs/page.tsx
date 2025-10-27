"use client";

import { useState } from "react";
import * as React from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Modal } from "~/components/ui/modal";
import { Checkbox } from "~/components/ui/checkbox";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Plus, Edit, Trash2, Star, Search } from "lucide-react";

const ACCORDION_TUNINGS = [
  { value: "C-F-B", label: "C-F-B" },
  { value: "B-Es-As", label: "B-Es-As" },
  { value: "A-D-G", label: "A-D-G" },
] as const;

// Helper function to normalize harmonica values from database (c_f_b) to display format (C-F-B)
function normalizeHarmonica(value: string | undefined | null): string {
  if (!value) return "";
  // Convert old format (c_f_b) to new format (C-F-B)
  return value
    .replace(/_/g, "-")  // Replace underscores with hyphens
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("-");
}

// Helper to get old format from new format (for backward compatibility when saving)
function denormalizeHarmonica(value: string): string {
  if (!value) return "";
  return value.toUpperCase().replace(/-/g, "-");
}

// Helper function to capitalize bas_bariton values from database
function normalizeBasBariton(value: string | undefined | null): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export default function SongsPage() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [harmonica, setHarmonica] = useState<string | undefined>();
  const [favorite, setFavorite] = useState<boolean | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<any>(null);

  const utils = api.useContext();

  const { data: songs, isLoading } = api.songs.list.useQuery({
    search: search || undefined,
    genre: genre || undefined,
    harmonica: harmonica || undefined,
    favorite,
  });

  const createMutation = api.songs.create.useMutation({
    onSuccess: () => {
      setIsModalOpen(false);
      setEditingSong(null);
      void utils.songs.list.invalidate();
    },
  });

  const updateMutation = api.songs.update.useMutation({
    onSuccess: () => {
      setIsModalOpen(false);
      setEditingSong(null);
      void utils.songs.list.invalidate();
    },
  });

  const deleteMutation = api.songs.delete.useMutation({
    onSuccess: () => {
      void utils.songs.list.invalidate();
    },
  });

  const toggleFavoriteMutation = api.songs.toggleFavorite.useMutation({
    onSuccess: () => {
      void utils.songs.list.invalidate();
    },
  });

  const handleSave = (formData: any) => {
    if (editingSong) {
      updateMutation.mutate({ ...formData, id: editingSong.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (song: any) => {
    setEditingSong(song);
    setIsModalOpen(true);
  };

  const handleDelete = (songId: number) => {
    if (confirm("Are you sure you want to delete this song?")) {
      deleteMutation.mutate({ id: songId });
    }
  };

  const handleToggleFavorite = (songId: number) => {
    toggleFavoriteMutation.mutate({ id: songId });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSong(null);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Songs</h1>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Song
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                placeholder="Filter by genre..."
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="accordion">Accordion</Label>
              <Select
                id="accordion"
                value={harmonica ?? ""}
                onChange={(e) =>
                  setHarmonica(e.target.value || undefined)
                }
              >
                <option value="">All</option>
                {ACCORDION_TUNINGS.map((tuning) => (
                  <option key={tuning.value} value={tuning.label}>
                    {tuning.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="favorite"
                  checked={favorite === true}
                  onChange={(e) => setFavorite(e.target.checked || undefined)}
                />
                <Label htmlFor="favorite" className="cursor-pointer">
                  Favorites Only
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {songs?.map((song) => (
            <Card key={song.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {song.favorite && <Star className="h-5 w-5 fill-yellow-500" />}
                    {song.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(song.id)}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          song.favorite ? "fill-yellow-500" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(song)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(song.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Genre: {song.genre}</p>
                {song.key && (
                  <p className="text-sm text-muted-foreground">Key: {song.key}</p>
                )}
                {song.harmonica && (
                  <p className="text-sm text-muted-foreground">
                    Accordion: {normalizeHarmonica(song.harmonica)}
                  </p>
                )}
                {song.bas_bariton && (
                  <p className="text-sm text-muted-foreground">
                    Instrument: {song.bas_bariton}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SongFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingSong={editingSong}
      />
    </div>
  );
}

function SongFormModal({
  isOpen,
  onClose,
  onSave,
  editingSong,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingSong: any;
}) {
  const [formData, setFormData] = useState({
    title: "",
    lyrics: "",
    genre: "",
    key: "",
    notes: "",
    favorite: false,
    harmonica: "",
    bas_bariton: "",
  });

  React.useEffect(() => {
    if (isOpen && editingSong) {
      const normalizedHarmonica = normalizeHarmonica(editingSong.harmonica);
      const normalizedBasBariton = normalizeBasBariton(editingSong.bas_bariton);
      setFormData({
        title: editingSong.title,
        lyrics: editingSong.lyrics,
        genre: editingSong.genre,
        key: editingSong.key ?? "",
        notes: editingSong.notes ?? "",
        favorite: editingSong.favorite,
        harmonica: normalizedHarmonica,
        bas_bariton: normalizedBasBariton,
      });
    } else if (isOpen && !editingSong) {
      setFormData({
        title: "",
        lyrics: "",
        genre: "",
        key: "",
        notes: "",
        favorite: false,
        harmonica: "",
        bas_bariton: "",
      });
    }
  }, [isOpen, editingSong]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      harmonica: formData.harmonica ? formData.harmonica : undefined,
    });
    // Reset form
    setFormData({
      title: "",
      lyrics: "",
      genre: "",
      key: "",
      notes: "",
      favorite: false,
      harmonica: "",
      bas_bariton: "",
    });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editingSong ? "Edit Song" : "Add New Song"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingSong ? "Update" : "Create"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="lyrics">Lyrics *</Label>
          <Textarea
            id="lyrics"
            required
            rows={8}
            value={formData.lyrics}
            onChange={(e) =>
              setFormData({ ...formData, lyrics: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="genre">Genre *</Label>
          <Input
            id="genre"
            required
            value={formData.genre}
            onChange={(e) =>
              setFormData({ ...formData, genre: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="key">Key</Label>
          <Input
            id="key"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="harmonica">Accordion</Label>
          <Select
            id="harmonica"
            value={formData.harmonica}
            onChange={(e) => setFormData({ ...formData, harmonica: e.target.value })}
          >
            <option value="">None</option>
            {ACCORDION_TUNINGS.map((tuning) => (
              <option key={tuning.value} value={tuning.label}>
                {tuning.label}
              </option>
            ))}
          </Select>
        </div>


        <div>
          <Label htmlFor="bas_bariton">Instrument</Label>
          <Select
            id="bas_bariton"
            value={formData.bas_bariton}
            onChange={(e) =>
              setFormData({ ...formData, bas_bariton: e.target.value })
            }
          >
            <option value="">None</option>
            <option value="Bas">Bas</option>
            <option value="Bariton">Bariton</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            rows={4}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="favorite"
            checked={formData.favorite}
            onChange={(e) =>
              setFormData({ ...formData, favorite: e.target.checked })
            }
          />
          <Label htmlFor="favorite">Favorite</Label>
        </div>
      </form>
    </Modal>
  );
}

