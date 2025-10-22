import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Music, Users, Star, Plus, Play, Eye, X, LogIn, User, BarChart3, Calendar, Heart } from "lucide-react";

import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export default function Home() {
  const { data: sessionData, status } = useSession();
  const router = useRouter();
  const songsQuery = api.songs.list.useQuery({ search: "", genre: undefined, favoritesOnly: false });
  const roundsQuery = api.rounds.list.useQuery();

  const recentSongs = songsQuery.data?.slice(0, 3) || [];
  const recentRounds = roundsQuery.data?.slice(0, 3) || [];

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
          <title>Besedila - Loading...</title>
          <meta name="description" content="Loading..." />
          <link rel="icon" href="/favicon.ico" />
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

  return (
    <>
      <Head>
        <title>Besedila - Upravljanje glasbe</title>
        <meta name="description" content="Upravljajte svojo glasbeno zbirko in nastope" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen flex items-center">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Main heading */}
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl mb-8">
              Dobrodošli v
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mt-2">
                Besedila
              </span>
            </h1>
            
            {/* Subtitle */}
            <div className="mt-8 mx-auto max-w-3xl">
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                Upravljajte svojo glasbeno zbirko, organizirajte nastope in ustvarjajte lepe pesmarice. 
                Vse, kar potrebujete za svojo glasbeno potovanje na enem mestu.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/songs" className="flex items-center">
                  <Music className="mr-3 h-5 w-5" />
                  Preglej pesmi
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                asChild
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                <Link href="/rounds" className="flex items-center">
                  <Users className="mr-3 h-5 w-5" />
                  Preglej runde
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Vaša glasbena nadzorna plošča</h2>
            <p className="text-gray-600 text-lg">Spremljajte svojo glasbeno potovanje na prvi pogled</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Music className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {songsQuery.data?.length || 0}
              </h3>
              <p className="text-gray-600 mb-1">Skupaj pesmi</p>
              <p className="text-sm text-blue-600">
                {songsQuery.data?.filter(s => s.favorite).length || 0} priljubljenih
              </p>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {roundsQuery.data?.length || 0}
              </h3>
              <p className="text-gray-600 mb-1">Aktivne runde</p>
              <p className="text-sm text-purple-600">
                Runde za nastop
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {new Set(songsQuery.data?.map(s => s.genre)).size || 0}
              </h3>
              <p className="text-gray-600 mb-1">Žanri</p>
              <p className="text-sm text-green-600">
                Različni slogi
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">+</h3>
              <p className="text-gray-600 mb-1">Hitre akcije</p>
              <p className="text-sm text-orange-600">
                Dodaj novo vsebino
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent Content */}
      <div className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nedavna dejavnost</h2>
            <p className="text-gray-600 text-lg">Vaše najnovejše glasbene ustvarjanje in nastopi</p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Recent Songs */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Music className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Nedavne pesmi</CardTitle>
                      <CardDescription className="text-gray-600">Vaše najnovejše dodatke v zbirko</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/songs" className="flex items-center">
                      Poglej vse
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
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 animate-pulse rounded bg-gray-200 w-3/4" />
                          <div className="h-3 animate-pulse rounded bg-gray-200 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentSongs.length > 0 ? (
                  <div className="space-y-3">
                    {recentSongs.map((song) => (
                      <div 
                        key={song.id} 
                        className="flex items-center justify-between rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <Music className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {song.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {song.genre}
                              </Badge>
                              {song.favorite && (
                                <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                              )}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/songs/${song.id}`} className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            Poglej
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Music className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Še ni pesmi</h3>
                    <p className="text-sm text-gray-600 mb-4">Začnite graditi svojo glasbeno zbirko</p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                      <Link href="/songs" className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" />
                        Dodaj prvo pesem
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Rounds */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Nedavne runde</CardTitle>
                      <CardDescription className="text-gray-600">Vaši najnovejše runde za nastop</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/rounds" className="flex items-center">
                      Poglej vse
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
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 animate-pulse rounded bg-gray-200 w-3/4" />
                          <div className="h-3 animate-pulse rounded bg-gray-200 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentRounds.length > 0 ? (
                  <div className="space-y-3">
                    {recentRounds.map((round) => (
                      <div 
                        key={round.id} 
                        className="flex items-center justify-between rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                            <Users className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {round.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Nastopni krog
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/rounds/${round.id}`} className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            Poglej
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Še ni krogov</h3>
                    <p className="text-sm text-gray-600 mb-4">Ustvarite svoj prvi nastopni krog</p>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
                      <Link href="/rounds" className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" />
                        Ustvari prvi krog
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-0 shadow-xl">
            <CardContent className="pt-12 pb-12">
              <AuthShowcase />
            </CardContent>
          </Card>
        </div>
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
        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
          {sessionData ? (
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
              {sessionData.user?.image ? (
                <img 
                  src={sessionData.user.image} 
                  alt={sessionData.user.name || "Uporabnik"} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="h-6 w-6 text-purple-600" />
              )}
            </div>
          ) : (
            <Music className="h-10 w-10 text-white" />
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {sessionData ? `Dobrodošli nazaj, ${sessionData.user?.name}!` : "Pripravljeni za začetek?"}
        </h3>
        
        <p className="text-lg text-gray-600 max-w-md">
          {secretMessage 
            ? `Vaša skrivnost: ${secretMessage}` 
            : "Vse je pripravljeno za upravljanje vaše glasbene zbirke in ustvarjanje neverjetnih nastopov!"
          }
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Button
          onClick={() => void signOut()}
          variant="outline"
          size="lg"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold transition-all duration-300"
        >
          <X className="mr-2 h-5 w-5" />
          Odjavi se
        </Button>
      </div>
    </div>
  );
}
