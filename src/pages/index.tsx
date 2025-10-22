import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { Music, Users, Star, Search, Plus, Play, Eye, X } from "lucide-react";

import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export default function Home() {
  const { data: sessionData } = useSession();
  const songsQuery = api.songs.list.useQuery({ search: "", genre: undefined, favoritesOnly: false });
  const roundsQuery = api.rounds.list.useQuery();

  const recentSongs = songsQuery.data?.slice(0, 3) || [];
  const recentRounds = roundsQuery.data?.slice(0, 3) || [];

  return (
    <>
      <Head>
        <title>Besedila - Music Management</title>
        <meta name="description" content="Manage your music collection and performances" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[80vh] flex items-center">
        {/* Animated background */}
        <div className="absolute inset-0 bg-animated-gradient" />
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-pink-500/20 rounded-full blur-lg float" style={{ animationDelay: '4s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Main heading with stunning gradient */}
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
              <span className="block text-white mb-4">Welcome to</span>
              <span className="block text-gradient text-6xl sm:text-8xl lg:text-9xl font-black">
                Besedila
              </span>
            </h1>
            
            {/* Subtitle with glassmorphism */}
            <div className="mt-8 mx-auto max-w-3xl">
              <div className="glass rounded-2xl p-8 backdrop-blur-xl">
                <p className="text-xl leading-relaxed text-white/90 font-medium">
                  Manage your music collection, organize performances, and create beautiful songbooks. 
                  Everything you need for your musical journey in one place.
                </p>
              </div>
            </div>
            
            {/* CTA Buttons with modern design */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button 
                asChild 
                size="lg" 
                className="group bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-modern-lg px-8 py-4 text-lg font-semibold"
              >
                <Link href="/songs" className="flex items-center">
                  <Music className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  Browse Songs
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                asChild
                className="group glass border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold"
              >
                <Link href="/rounds" className="flex items-center">
                  <Users className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  View Rounds
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Your Music Dashboard</h2>
          <p className="text-muted-foreground text-lg">Track your musical journey at a glance</p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group card-hover bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 border-0 shadow-modern animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Total Songs</CardTitle>
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Music className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {songsQuery.data?.length || 0}
              </div>
              <p className="text-sm text-blue-600/70 dark:text-blue-400/70">
                {songsQuery.data?.filter(s => s.favorite).length || 0} favorites
              </p>
            </CardContent>
          </Card>
          
          <Card className="group card-hover bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/20 dark:to-pink-950/20 border-0 shadow-modern animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">Active Rounds</CardTitle>
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

          <Card className="group card-hover bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/20 dark:to-teal-950/20 border-0 shadow-modern animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Genres</CardTitle>
              <div className="p-2 bg-gradient-accent rounded-lg">
                <Star className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                {new Set(songsQuery.data?.map(s => s.genre)).size || 0}
              </div>
              <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
                Different styles
              </p>
            </CardContent>
          </Card>

          <Card className="group card-hover bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950/20 dark:to-red-950/20 border-0 shadow-modern animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">Quick Actions</CardTitle>
              <div className="p-2 bg-gradient-warm rounded-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">+</div>
              <p className="text-sm text-orange-600/70 dark:text-orange-400/70">
                Add new content
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Recent Activity</h2>
          <p className="text-muted-foreground text-lg">Your latest musical creations and performances</p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Songs */}
          <Card className="group card-hover bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/50 dark:to-gray-900/50 border-0 shadow-modern">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <Music className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Recent Songs</CardTitle>
                    <CardDescription className="text-muted-foreground">Your latest additions to the collection</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="group-hover:scale-105 transition-transform duration-200">
                  <Link href="/songs" className="flex items-center">
                    View All
                    <Play className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {songsQuery.isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3">
                      <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 animate-pulse rounded bg-muted w-3/4" />
                        <div className="h-3 animate-pulse rounded bg-muted w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentSongs.length > 0 ? (
                <div className="space-y-3">
                  {recentSongs.map((song, index) => (
                    <div 
                      key={song.id} 
                      className="group/song flex items-center justify-between rounded-xl p-4 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 border border-white/20 dark:border-slate-700/50 animate-slide-in-left"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary shadow-lg group-hover/song:scale-110 transition-transform duration-300">
                          <Music className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover/song:text-primary transition-colors duration-200">
                            {song.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700">
                              {song.genre}
                            </Badge>
                            {song.favorite && (
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 animate-pulse" />
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover/song:opacity-100 transition-all duration-300 hover:scale-110">
                        <Link href={`/songs/${song.id}`} className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                    <Music className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No songs yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Start building your music collection</p>
                  <Button className="bg-gradient-primary hover:scale-105 transition-transform duration-200" asChild>
                    <Link href="/songs" className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Add your first song
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Rounds */}
          <Card className="group card-hover bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/50 dark:to-gray-900/50 border-0 shadow-modern">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-secondary rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Recent Rounds</CardTitle>
                    <CardDescription className="text-muted-foreground">Your latest performance rounds</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="group-hover:scale-105 transition-transform duration-200">
                  <Link href="/rounds" className="flex items-center">
                    View All
                    <Play className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {roundsQuery.isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3">
                      <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 animate-pulse rounded bg-muted w-3/4" />
                        <div className="h-3 animate-pulse rounded bg-muted w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentRounds.length > 0 ? (
                <div className="space-y-3">
                  {recentRounds.map((round, index) => (
                    <div 
                      key={round.id} 
                      className="group/round flex items-center justify-between rounded-xl p-4 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 border border-white/20 dark:border-slate-700/50 animate-slide-in-right"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-secondary shadow-lg group-hover/round:scale-110 transition-transform duration-300">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover/round:text-primary transition-colors duration-200">
                            {round.name}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Performance round
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover/round:opacity-100 transition-all duration-300 hover:scale-110">
                        <Link href={`/rounds/${round.id}`} className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No rounds yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create your first performance round</p>
                  <Button className="bg-gradient-secondary hover:scale-105 transition-transform duration-200" asChild>
                    <Link href="/rounds" className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Create your first round
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Auth Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="group card-hover bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-0 shadow-modern-lg">
          <CardContent className="pt-8 pb-8">
            <AuthShowcase />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.post.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-6 shadow-lg">
          {sessionData ? (
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gradient">👤</span>
            </div>
          ) : (
            <Music className="h-10 w-10 text-white" />
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-foreground mb-3">
          {sessionData ? `Welcome back, ${sessionData.user?.name}!` : "Ready to Get Started?"}
        </h3>
        
        <p className="text-lg text-muted-foreground max-w-md">
          {sessionData 
            ? secretMessage 
              ? `Your secret: ${secretMessage}` 
              : "You're all set to manage your music collection and create amazing performances!"
            : "Sign in to access all features and start building your musical journey with us."
          }
        </p>
      </div>
      
      <Button
        onClick={sessionData ? () => void signOut() : () => void signIn()}
        variant={sessionData ? "outline" : "default"}
        size="lg"
        className={`group px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 ${
          sessionData 
            ? "glass border-white/30 text-foreground hover:bg-white/10" 
            : "bg-gradient-primary shadow-modern-lg"
        }`}
      >
        <span className="flex items-center">
          {sessionData ? (
            <>
              <X className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              Sign out
            </>
          ) : (
            <>
              <Music className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              Sign in to continue
            </>
          )}
        </span>
      </Button>
    </div>
  );
}
