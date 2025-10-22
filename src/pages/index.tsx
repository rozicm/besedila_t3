import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { Music, Users, Star, Plus, Play, Eye, X, LogIn, User, BarChart3, Calendar, Heart } from "lucide-react";

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
              {!sessionData && (
                <Button 
                  variant="secondary" 
                  size="lg" 
                  onClick={() => void signIn("discord")}
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold transition-all duration-300"
                >
                  <LogIn className="mr-3 h-5 w-5" />
                  Prijavi se z Discord
                </Button>
              )}
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
          {sessionData 
            ? secretMessage 
              ? `Vaša skrivnost: ${secretMessage}` 
              : "Vse je pripravljeno za upravljanje vaše glasbene zbirke in ustvarjanje neverjetnih nastopov!"
            : "Prijavite se z Discord, da dostopate do vseh funkcij in začnete graditi svojo glasbeno potovanje z nami."
          }
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {sessionData ? (
          <Button
            onClick={() => void signOut()}
            variant="outline"
            size="lg"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold transition-all duration-300"
          >
            <X className="mr-2 h-5 w-5" />
            Odjavi se
          </Button>
        ) : (
          <Button
            onClick={() => void signIn("discord")}
            size="lg"
            className="bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#4752C4] hover:to-[#3C45A5] text-white shadow-lg px-8 py-4 text-lg font-semibold transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Prijavi se z Discord
          </Button>
        )}
      </div>
    </div>
  );
}
