import { api } from "~/utils/api";
import { useMemo, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { 
  Music, 
  Search, 
  Filter, 
  Star, 
  Plus, 
  Trash2, 
  Eye,
  Heart,
  HeartOff,
  Play,
  Edit
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";

const GENRES = ["polka", "valcek", "zabavna", "instrumental", "other"] as const;

export default function SongsPage() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<string | undefined>(undefined);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const input = useMemo(
    () => ({ search, genre, favoritesOnly }),
    [search, genre, favoritesOnly]
  );

  const songsQuery = api.songs.list.useQuery(input);
  const toggleFavorite = api.songs.toggleFavorite.useMutation({
    onSuccess: () => songsQuery.refetch(),
  });
  const createSong = api.songs.create.useMutation({
    onSuccess: () => {
      songsQuery.refetch();
      setShowQuickAdd(false);
    },
  });
  const deleteSong = api.songs.delete.useMutation({
    onSuccess: () => songsQuery.refetch(),
  });

  const filteredSongs = songsQuery.data || [];
  const favoriteCount = filteredSongs.filter(s => s.favorite).length;

  return (
    <>
      <Head>
        <title>Songs - Besedila</title>
        <meta name="description" content="Manage your music collection" />
      </Head>
      
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Music className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gradient mb-4">Music Collection</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your music collection and organize your performances with style
          </p>
          <Button 
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="mt-6 bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-modern-lg px-8 py-4 text-lg font-semibold"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Song
          </Button>
        </div>

        {/* Quick Add Form */}
        {showQuickAdd && (
          <Card className="animate-scale-in bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 border-0 shadow-modern-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gradient">Quick Add Song</CardTitle>
              <CardDescription className="text-lg">Add a new song to your collection</CardDescription>
            </CardHeader>
            <CardContent>
              <QuickAdd onCreate={(data) => createSong.mutate(data)} />
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="glass border-0 shadow-modern">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-accent rounded-lg">
                <Filter className="h-5 w-5 text-white" />
              </div>
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-3">
                <Label htmlFor="search" className="text-sm font-semibold">Search</Label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="search"
                    placeholder="Search title or lyrics..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="genre" className="text-sm font-semibold">Genre</Label>
                <Select value={genre ?? "all"} onValueChange={(value) => setGenre(value === "all" ? undefined : value)}>
                  <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50 focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="All genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All genres</SelectItem>
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Options</Label>
                <div className="flex items-center space-x-3 p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg border border-white/20 dark:border-slate-700/50">
                  <Checkbox
                    id="favorites"
                    checked={favoritesOnly}
                    onCheckedChange={(checked) => setFavoritesOnly(checked as boolean)}
                    className="data-[state=checked]:bg-gradient-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor="favorites" className="text-sm font-medium cursor-pointer">
                    Favorites only
                  </Label>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Results</Label>
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {filteredSongs.length} songs
                  </div>
                  {favoriteCount > 0 && (
                    <div className="text-sm text-blue-600/70 dark:text-blue-400/70">
                      {favoriteCount} favorites
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {songsQuery.isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/50 dark:to-slate-800/50 border-0 shadow-modern">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-muted rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-px bg-muted my-4"></div>
                    <div className="flex justify-between">
                      <div className="h-8 bg-muted rounded w-16"></div>
                      <div className="h-8 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {songsQuery.error && (
          <Card className="border-destructive bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <X className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Error Loading Songs</h3>
                <p className="text-red-600/70 dark:text-red-400/70">{songsQuery.error.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Songs Grid */}
        {!songsQuery.isLoading && !songsQuery.error && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSongs.map((song, index) => (
              <Card 
                key={song.id} 
                className="group card-hover bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/50 dark:to-slate-800/50 border-0 shadow-modern animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Music className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors duration-200">
                            <Link 
                              href={`/songs/${song.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {song.title}
                            </Link>
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700">
                              {song.genre}
                            </Badge>
                            {song.favorite && (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 animate-pulse" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite.mutate({ id: song.id })}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 p-2"
                    >
                      {song.favorite ? (
                        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                      ) : (
                        <HeartOff className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {song.lyrics}
                    </p>
                    
                    <Separator className="bg-gradient-to-r from-transparent via-muted to-transparent" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild className="group/btn hover:scale-105 transition-transform duration-200">
                          <Link href={`/songs/${song.id}`} className="flex items-center">
                            <Eye className="h-3 w-3 mr-1 group-hover/btn:rotate-12 transition-transform duration-200" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="group/btn hover:scale-105 transition-transform duration-200">
                          <Link href={`/songs/${song.id}/performance`} className="flex items-center">
                            <Play className="h-3 w-3 mr-1 group-hover/btn:scale-110 transition-transform duration-200" />
                            Play
                          </Link>
                        </Button>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSong.mutate({ id: song.id })}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:scale-105 transition-all duration-200 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!songsQuery.isLoading && !songsQuery.error && filteredSongs.length === 0 && (
          <Card className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/50 dark:to-slate-800/50 border-0 shadow-modern-lg">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Music className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {search || genre || favoritesOnly ? "No songs found" : "No songs yet"}
                </h3>
                <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
                  {search || genre || favoritesOnly 
                    ? "Try adjusting your filters to see more results."
                    : "Get started by adding your first song to the collection."
                  }
                </p>
                {!search && !genre && !favoritesOnly && (
                  <Button 
                    className="bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-modern-lg px-8 py-4 text-lg font-semibold" 
                    onClick={() => setShowQuickAdd(true)}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add your first song
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function QuickAdd({ onCreate }: { onCreate: (data: {
  title: string; lyrics: string; genre: string; key?: string; notes?: string; harmonica?: string; bas_bariton?: string;
}) => void }) {
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [genre, setGenre] = useState<string>("polka");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !lyrics) return;
    
    setIsSubmitting(true);
    try {
      await onCreate({ title, lyrics, genre });
      setTitle("");
      setLyrics("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Song title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="genre">Genre</Label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="lyrics">Lyrics</Label>
        <Textarea
          id="lyrics"
          placeholder="Enter the song lyrics..."
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          rows={4}
          required
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting || !title || !lyrics}>
          {isSubmitting ? "Adding..." : "Add Song"}
        </Button>
      </div>
    </form>
  );
}


