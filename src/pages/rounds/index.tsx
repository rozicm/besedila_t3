import Link from "next/link";
import Head from "next/head";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { 
  Users, 
  Plus, 
  Calendar, 
  Music, 
  Eye, 
  Play, 
  Search, 
  Filter, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  X,
  Info,
  Star,
  Clock
} from "lucide-react";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";

const GENRES = ["polka", "valcek", "zabavna", "instrumental", "other"] as const;
const HARMONICA_TYPES = ["b_es_as", "c_f_b", "a_d_g"] as const;

export default function RoundsIndex() {
  const { data: sessionData, status } = useSession();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [roundName, setRoundName] = useState("");
  const [roundDescription, setRoundDescription] = useState("");
  const [selectedSongs, setSelectedSongs] = useState<Array<{id: number, title: string, genre: string, key?: string, harmonica?: string, bas_bariton?: string}>>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState({ search: "", genre: "", harmonica: "" });

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      void router.push("/auth/signin");
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <>
        <Head>
          <title>Rounds - Loading...</title>
          <meta name="description" content="Loading..." />
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  // Don't render the main content if not authenticated
  if (!sessionData) {
    return null;
  }
  
  const roundsQuery = api.rounds.list.useQuery();
  const songsQuery = api.songs.list.useQuery({ search: "", genre: undefined, favoritesOnly: false });
  const createRound = api.rounds.create.useMutation({
    onSuccess: () => {
      roundsQuery.refetch();
      setShowCreateForm(false);
      setRoundName("");
      setRoundDescription("");
      setSelectedSongs([]);
    },
  });

  const availableSongs = useMemo(() => {
    if (!songsQuery.data) return [];
    const selectedIds = selectedSongs.map(s => s.id);
    return songsQuery.data.filter(song => !selectedIds.includes(song.id));
  }, [songsQuery.data, selectedSongs]);

  const filteredSongs = useMemo(() => {
    return availableSongs.filter(song => {
      const matchesSearch = !filter.search || 
        song.title.toLowerCase().includes(filter.search.toLowerCase()) ||
        song.lyrics.toLowerCase().includes(filter.search.toLowerCase());
      
      const matchesGenre = !filter.genre || song.genre === filter.genre;
      const matchesHarmonica = !filter.harmonica || song.harmonica === filter.harmonica;
      
      return matchesSearch && matchesGenre && matchesHarmonica;
    });
  }, [availableSongs, filter]);

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundName.trim()) return;
    
    setIsCreating(true);
    try {
      await createRound.mutate({ 
        name: roundName.trim(),
        description: roundDescription.trim(),
        songIds: selectedSongs.map(s => s.id)
      });
    } finally {
      setIsCreating(false);
    }
  };

  const addSong = (song: any) => {
    setSelectedSongs(prev => [...prev, song]);
  };

  const removeSong = (songId: number) => {
    setSelectedSongs(prev => prev.filter(s => s.id !== songId));
  };

  const moveSong = (songId: number, direction: 'up' | 'down') => {
    setSelectedSongs(prev => {
      const index = prev.findIndex(s => s.id === songId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newSongs = [...prev];
      const temp = newSongs[index];
      if (temp && newSongs[newIndex]) {
        newSongs[index] = newSongs[newIndex];
        newSongs[newIndex] = temp;
      }
      return newSongs;
    });
  };

  return (
    <>
      <Head>
        <title>Rounds - Besedila</title>
        <meta name="description" content="Manage your performance rounds" />
      </Head>
      
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="mx-auto w-20 h-20 bg-gradient-secondary rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gradient mb-4">Performance Rounds</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Organize and manage your musical performances with beautiful visual design
          </p>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="mt-6 bg-gradient-secondary hover:scale-105 transition-all duration-300 shadow-modern-lg px-8 py-4 text-lg font-semibold"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create New Round
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="group card-hover bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/20 dark:to-pink-950/20 border-0 shadow-modern animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">Total Rounds</CardTitle>
              <div className="p-2 bg-gradient-secondary rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {roundsQuery.data?.length || 0}
              </div>
              <p className="text-sm text-purple-600/70 dark:text-purple-400/70">
                Performance rounds
              </p>
            </CardContent>
          </Card>
          
          <Card className="group card-hover bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/20 dark:to-teal-950/20 border-0 shadow-modern animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Active</CardTitle>
              <div className="p-2 bg-gradient-accent rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                {roundsQuery.data?.length || 0}
              </div>
              <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
                Currently available
              </p>
            </CardContent>
          </Card>

          <Card className="group card-hover bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950/20 dark:to-red-950/20 border-0 shadow-modern animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">Quick Actions</CardTitle>
              <div className="p-2 bg-gradient-warm rounded-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">+</div>
              <p className="text-sm text-orange-600/70 dark:text-orange-400/70">
                Create new round
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Create Round Form */}
        {showCreateForm && (
          <Card className="animate-scale-in bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/20 dark:to-pink-950/20 border-0 shadow-modern-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gradient">Create New Round</CardTitle>
              <CardDescription className="text-lg">Create a new performance round with song selection and ordering</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRound} className="space-y-6">
                {/* Basic Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="roundName">Round Name *</Label>
                    <Input
                      id="roundName"
                      placeholder="Enter round name..."
                      value={roundName}
                      onChange={(e) => setRoundName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roundDescription">Description</Label>
                    <Input
                      id="roundDescription"
                      placeholder="Optional description..."
                      value={roundDescription}
                      onChange={(e) => setRoundDescription(e.target.value)}
                    />
                  </div>
                </div>

                {/* Selected Songs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Selected Songs ({selectedSongs.length})</h3>
                    {selectedSongs.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Drag to reorder
                      </Badge>
                    )}
                  </div>

                  {selectedSongs.length === 0 ? (
                    <div className="bg-muted/50 p-6 rounded-lg text-center">
                      <Music className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No songs selected. Add songs from the available list below.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedSongs.map((song, index) => (
                        <div
                          key={song.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-medium text-muted-foreground w-6">
                                {index + 1}.
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveSong(song.id, 'up')}
                                disabled={index === 0}
                                className="h-6 w-6 p-0"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveSong(song.id, 'down')}
                                disabled={index === selectedSongs.length - 1}
                                className="h-6 w-6 p-0"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>
                            <div>
                              <p className="font-medium">{song.title}</p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  {song.genre}
                                </Badge>
                                {song.key && <span>Key: {song.key}</span>}
                                {song.harmonica && <span>Harmonica: {song.harmonica}</span>}
                                {song.bas_bariton && <span>Voice: {song.bas_bariton}</span>}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSong(song.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Available Songs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Available Songs</h3>
                    <div className="text-sm text-muted-foreground">
                      {filteredSongs.length} songs available
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filter Songs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="search">Search</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="search"
                              placeholder="Search songs..."
                              value={filter.search}
                              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="genre">Genre</Label>
                          <Select value={filter.genre || "all"} onValueChange={(value) => setFilter(prev => ({ ...prev, genre: value === "all" ? "" : value }))}>
                            <SelectTrigger>
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

                        <div className="space-y-2">
                          <Label htmlFor="harmonica">Harmonica</Label>
                          <Select value={filter.harmonica || "all"} onValueChange={(value) => setFilter(prev => ({ ...prev, harmonica: value === "all" ? "" : value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="All harmonicas" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All harmonicas</SelectItem>
                              {HARMONICA_TYPES.map((h) => (
                                <SelectItem key={h} value={h}>
                                  {h.replace(/_/g, ' - ').toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Songs Grid */}
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSongs.map((song) => (
                      <Button
                        key={song.id}
                        type="button"
                        variant="outline"
                        onClick={() => addSong(song)}
                        className="h-auto p-3 justify-start text-left hover:bg-primary/5 hover:border-primary/20"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="font-medium text-sm">{song.title}</div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {song.genre}
                              </Badge>
                              {song.favorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              {song.key && <span>Key: {song.key}</span>}
                              {song.harmonica && <span>• Harmonica: {song.harmonica}</span>}
                              {song.bas_bariton && <span>• Voice: {song.bas_bariton}</span>}
                            </div>
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-primary flex-shrink-0" />
                      </Button>
                    ))}
                  </div>

                  {filteredSongs.length === 0 && (
                    <div className="text-center py-8">
                      <Music className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {availableSongs.length === 0 
                          ? "All songs have been added to this round"
                          : "No songs match your current filters"
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateForm(false);
                      setRoundName("");
                      setRoundDescription("");
                      setSelectedSongs([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isCreating || !roundName.trim()}
                    className="min-w-[120px]"
                  >
                    {isCreating ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Round
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {roundsQuery.isLoading && (
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
                    <div className="h-px bg-muted my-4"></div>
                    <div className="flex justify-between">
                      <div className="h-8 bg-muted rounded w-20"></div>
                      <div className="h-8 bg-muted rounded w-24"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {roundsQuery.error && (
          <Card className="border-destructive bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <X className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Error Loading Rounds</h3>
                <p className="text-red-600/70 dark:text-red-400/70">{roundsQuery.error.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rounds Grid */}
        {!roundsQuery.isLoading && !roundsQuery.error && roundsQuery.data && roundsQuery.data.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roundsQuery.data.map((round, index) => (
              <Card 
                key={round.id} 
                className="group card-hover bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/50 dark:to-slate-800/50 border-0 shadow-modern animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-200">
                            <Link 
                              href={`/rounds/${round.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {round.name}
                            </Link>
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-700">
                              Performance Round
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 p-2">
                      <Link href={`/rounds/${round.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Music className="h-4 w-4" />
                      <span>Performance round</span>
                    </div>
                    
                    <Separator className="bg-gradient-to-r from-transparent via-muted to-transparent" />
                    
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm" asChild className="group/btn hover:scale-105 transition-transform duration-200">
                        <Link href={`/rounds/${round.id}`} className="flex items-center">
                          <Eye className="h-3 w-3 mr-1 group-hover/btn:rotate-12 transition-transform duration-200" />
                          View Details
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="group/btn hover:scale-105 transition-transform duration-200">
                        <Link href={`/rounds/${round.id}/performance`} className="flex items-center">
                          <Play className="h-3 w-3 mr-1 group-hover/btn:scale-110 transition-transform duration-200" />
                          Performance
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!roundsQuery.isLoading && !roundsQuery.error && (!roundsQuery.data || roundsQuery.data.length === 0) && (
          <Card className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/50 dark:to-slate-800/50 border-0 shadow-modern-lg">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-secondary rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">No rounds yet</h3>
                <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
                  Get started by creating your first performance round.
                </p>
                <Button 
                  className="bg-gradient-secondary hover:scale-105 transition-all duration-300 shadow-modern-lg px-8 py-4 text-lg font-semibold" 
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create your first round
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}


