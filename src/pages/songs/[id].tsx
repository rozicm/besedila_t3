import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { 
  Music, 
  Download, 
  ArrowLeft, 
  Star, 
  Heart,
  Play,
  Share2,
  Edit,
  Trash2,
  Calendar,
  Tag
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

export default function SongShow() {
  const { data: sessionData, status } = useSession();
  const router = useRouter();
  const id = Number(router.query.id);
  const list = api.songs.list.useQuery({});
  const song = list.data?.find((s) => s.id === id);

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
          <title>Song - Loading...</title>
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
  
  if (!Number.isFinite(id)) return null;
  if (!song) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading song...</p>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>{song.title} - Besedila</title>
        <meta name="description" content={`View and manage "${song.title}" in your music collection`} />
      </Head>
      
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild className="hover:scale-105 transition-transform duration-200">
              <Link href="/songs" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Songs
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="hover:scale-105 transition-transform duration-200">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="hover:scale-105 transition-transform duration-200">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive hover:scale-105 transition-all duration-200">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Song Header Card */}
        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/50 dark:to-slate-800/50 border-0 shadow-modern-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 shadow-modern-lg">
              <Music className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-4xl font-black text-gradient mb-4">{song.title}</CardTitle>
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Badge variant="accent" className="text-sm px-4 py-2">
                <Tag className="h-4 w-4 mr-2" />
                {song.genre}
              </Badge>
              {song.favorite && (
                <Badge variant="warning" className="text-sm px-4 py-2">
                  <Star className="h-4 w-4 mr-2 fill-current" />
                  Favorite
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-center space-x-4">
              <Button className="bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-modern-lg px-8 py-4 text-lg font-semibold">
                <Play className="mr-2 h-5 w-5" />
                Play Performance
              </Button>
              <Button variant="outline" asChild className="hover:scale-105 transition-all duration-300">
                <a href={`/api/pdf/song?id=${id}`} target="_blank" rel="noreferrer" className="flex items-center">
                  <Download className="mr-2 h-5 w-5" />
                  Download PDF
                </a>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Song Details */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Lyrics Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/50 dark:to-slate-800/50 border-0 shadow-modern">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gradient flex items-center">
                <Music className="h-6 w-6 mr-3" />
                Lyrics
              </CardTitle>
              <CardDescription>Complete song lyrics and content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl p-8 border border-white/20 dark:border-slate-700/50">
                <pre className="whitespace-pre-wrap leading-relaxed text-foreground font-medium text-lg">
                  {song.lyrics}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Song Info Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 border-0 shadow-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-blue-700 dark:text-blue-300">Song Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Genre</span>
                  <Badge variant="accent" className="text-xs">
                    {song.genre}
                  </Badge>
                </div>
                {song.key && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Key</span>
                    <span className="text-sm font-semibold">{song.key}</span>
                  </div>
                )}
                {song.harmonica && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Harmonica</span>
                    <span className="text-sm font-semibold">{song.harmonica}</span>
                  </div>
                )}
                {song.bas_bariton && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Voice</span>
                    <span className="text-sm font-semibold">{song.bas_bariton}</span>
                  </div>
                )}
                <Separator className="bg-blue-200 dark:bg-blue-800" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Status</span>
                  <div className="flex items-center">
                    {song.favorite ? (
                      <Badge variant="warning" className="text-xs">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Favorite
                      </Badge>
                    ) : (
                      <Badge variant="ghost" className="text-xs">
                        Standard
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/20 dark:to-pink-950/20 border-0 shadow-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-purple-700 dark:text-purple-300">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="secondary" className="w-full justify-start hover:scale-105 transition-transform duration-200">
                  <Heart className="h-4 w-4 mr-3" />
                  {song.favorite ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
                <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform duration-200">
                  <Play className="h-4 w-4 mr-3" />
                  Start Performance
                </Button>
                <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform duration-200">
                  <Share2 className="h-4 w-4 mr-3" />
                  Share Song
                </Button>
                <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform duration-200">
                  <Edit className="h-4 w-4 mr-3" />
                  Edit Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}


