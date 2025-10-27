import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4 sm:p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="mb-6 sm:mb-8 text-center text-3xl sm:text-4xl md:text-5xl font-bold">
          Band Song Manager
        </h1>
        <p className="mb-8 sm:mb-12 text-center text-base sm:text-lg md:text-xl text-muted-foreground">
          Organize your songs, create setlists, and manage performances
        </p>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Songs</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Manage your band&apos;s song library with lyrics, keys, and
                metadata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/songs">
                <Button className="w-full">View Songs</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Rounds</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Create and organize setlists for your performances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/rounds">
                <Button className="w-full">View Rounds</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Performance</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Start a performance session and export to PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/performance">
                <Button className="w-full">Start Performance</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}


