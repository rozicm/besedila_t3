import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { api } from "~/utils/api";

export default function RoundPerformance() {
  const { data: sessionData, status } = useSession();
  const router = useRouter();
  const id = Number(router.query.id);
  const q = api.rounds.byIdWithSongs.useQuery({ id }, { enabled: Number.isFinite(id) });

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      void router.push("/auth/signin");
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <main className="p-6">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  // Don't render the main content if not authenticated
  if (!sessionData) {
    return null;
  }

  if (!Number.isFinite(id)) return null;
  if (!q.data) return <main className="p-6">Loading…</main>;
  return (
    <main className="p-6 max-w-4xl mx-auto bg-white text-black">
      <h1 className="text-3xl font-bold mb-6">{q.data.name}</h1>
      <div className="space-y-8">
        {q.data.roundItems.map((ri) => (
          <section key={ri.id}>
            <h2 className="text-2xl font-semibold mb-2">{ri.song.title}</h2>
            <pre className="whitespace-pre-wrap leading-8 text-lg">
              {ri.song.lyrics}
            </pre>
          </section>
        ))}
      </div>
    </main>
  );
}


