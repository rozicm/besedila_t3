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
import { Plus, Edit, Trash2, Star, Search, Download, Music } from "lucide-react";
import { useGroup, GroupSelector } from "~/components/group-context";

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

  const { selectedGroupId, isLoading: isGroupLoading } = useGroup();
  const utils = api.useContext();

  const { data: songs, isLoading } = api.songs.list.useQuery(
    {
      groupId: selectedGroupId!,
      search: search || undefined,
      genre: genre || undefined,
      harmonica: harmonica || undefined,
      favorite,
    },
    { enabled: !!selectedGroupId }
  );

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
    if (!selectedGroupId) return;
    if (editingSong) {
      updateMutation.mutate({ ...formData, id: editingSong.id, groupId: selectedGroupId });
    } else {
      createMutation.mutate({ ...formData, groupId: selectedGroupId });
    }
  };

  const handleEdit = (song: any) => {
    setEditingSong(song);
    setIsModalOpen(true);
  };

  const handleDelete = (songId: number) => {
    if (!selectedGroupId) return;
    if (confirm("Are you sure you want to delete this song?")) {
      deleteMutation.mutate({ id: songId, groupId: selectedGroupId });
    }
  };

  const handleToggleFavorite = (songId: number) => {
    if (!selectedGroupId) return;
    toggleFavoriteMutation.mutate({ id: songId, groupId: selectedGroupId });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSong(null);
  };

  if (isGroupLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!selectedGroupId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Music className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No group selected</h3>
          <p className="text-muted-foreground">
            Please create or join a group to manage songs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Songs</h1>
              <GroupSelector />
            </div>
            <p className="mt-2 text-muted-foreground">
              Manage your band&apos;s song library
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Song
          </Button>
        </div>

      <Card className="mb-6 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
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
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-muted-foreground">Loading songs...</p>
          </div>
        </div>
      ) : songs && songs.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {songs.map((song) => (
            <Card
              key={song.id}
              className="group transition-all hover:shadow-md hover:shadow-primary/5"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {song.favorite && (
                      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    )}
                    <span className="line-clamp-2">{song.title}</span>
                  </CardTitle>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleFavorite(song.id)}
                      title={song.favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          song.favorite ? "fill-yellow-500 text-yellow-500" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(song)}
                      title="Edit song"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(song.id)}
                      title="Delete song"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Genre:</span>
                  <span className="text-sm">{song.genre}</span>
                </div>
                {song.key && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Key:</span>
                    <span className="text-sm">{song.key}</span>
                  </div>
                )}
                {song.harmonica && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Accordion:</span>
                    <span className="text-sm">{normalizeHarmonica(song.harmonica)}</span>
                  </div>
                )}
                {song.bas_bariton && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Instrument:</span>
                    <span className="text-sm">{song.bas_bariton}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="text-center">
            <Music className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No songs found</h3>
            <p className="mb-4 text-muted-foreground">
              {search || genre || harmonica || favorite
                ? "Try adjusting your filters"
                : "Get started by adding your first song"}
            </p>
            {!(search || genre || harmonica || favorite) && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Song
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <SongFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingSong={editingSong}
      />
      </div>
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
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [lyricsUrl, setLyricsUrl] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{title: string, artist: string, url: string}>>([]);

  const searchSongsQuery = api.songs.searchSongs.useQuery(
    { query: formData.title },
    {
      enabled: false,
      retry: false,
    }
  );

  // Store the target URL for scraping
  const [targetScrapeUrl, setTargetScrapeUrl] = useState<string>("");

  const scrapeLyricsQuery = api.songs.scrapeLyrics.useQuery(
    { title: formData.title, url: targetScrapeUrl || undefined },
    { 
      enabled: false,
      retry: false,
    }
  );

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
      setLyricsUrl("");
      setShowSearchResults(false);
      setSearchResults([]);
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
      setLyricsUrl("");
      setShowSearchResults(false);
      setSearchResults([]);
    }
  }, [isOpen, editingSong]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      harmonica: formData.harmonica ? formData.harmonica : undefined,
      bas_bariton: formData.bas_bariton ? formData.bas_bariton : undefined,
      key: formData.key ? formData.key : undefined,
      notes: formData.notes ? formData.notes : undefined,
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

  const handleSearch = async () => {
    if (!formData.title.trim() && !lyricsUrl.trim()) {
      setScrapeError("Please enter a title or URL first");
      return;
    }

    // If URL is provided, scrape directly
    if (lyricsUrl.trim()) {
      await handleDirectScrape();
      return;
    }

    setIsScraping(true);
    setScrapeError(null);

    try {
      const result = await searchSongsQuery.refetch();
      if (result.data && result.data.length > 0) {
        setSearchResults(result.data);
        setShowSearchResults(true);
      } else {
        setScrapeError("No results found");
      }
    } catch (error) {
      setScrapeError(error instanceof Error ? error.message : "Failed to search");
    } finally {
      setIsScraping(false);
    }
  };

  const handleSelectResult = async (url: string) => {
    setShowSearchResults(false);
    setLyricsUrl(url);
    await handleDirectScrape(url);
  };

  const handleDirectScrape = async (url?: string) => {
    const targetUrl = url || lyricsUrl;
    if (!targetUrl) return;

    setIsScraping(true);
    setScrapeError(null);

    try {
      // Update the target URL and refetch
      setTargetScrapeUrl(targetUrl);
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for state update
      const result = await scrapeLyricsQuery.refetch();
      if (result.data?.lyrics) {
        setFormData({ ...formData, lyrics: result.data.lyrics });
        setScrapeError(null);
      }
    } catch (error) {
      setScrapeError(error instanceof Error ? error.message : "Failed to scrape lyrics");
    } finally {
      setIsScraping(false);
    }
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
            placeholder="Song title or artist name"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <p className="text-xs text-muted-foreground mt-1">
            Search by song title or artist name. For best results, use exact titles.
          </p>
        </div>

        <div>
          <Label htmlFor="lyrics">Lyrics *</Label>
          <div className="mb-2">
            <Label htmlFor="lyricsUrl" className="text-sm text-muted-foreground">
              Optional: Paste besedilo.si URL to scrape
            </Label>
            <Input
              id="lyricsUrl"
              type="url"
              placeholder="https://www.besedilo.si/..."
              value={lyricsUrl}
              onChange={(e) => setLyricsUrl(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex items-center justify-between mb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSearch}
              disabled={isScraping || (!formData.title.trim() && !lyricsUrl.trim())}
            >
              <Download className="mr-2 h-4 w-4" />
              {isScraping ? "Searching..." : "Search on besedilo.si"}
            </Button>
          </div>
          {scrapeError && (
            <p className="text-sm text-red-500 mb-2">{scrapeError}</p>
          )}
          {showSearchResults && searchResults.length > 0 && (
            <div className="mb-4 border rounded-lg p-3 max-h-60 overflow-y-auto">
              <p className="text-sm font-medium mb-2">Select a song:</p>
              <div className="space-y-1">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectResult(result.url)}
                    className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                  >
                    <div className="font-medium">{result.title}</div>
                    <div className="text-xs text-gray-500">{result.artist}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
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

