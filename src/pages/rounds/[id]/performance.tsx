import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function RoundPerformance() {
  const router = useRouter();
  const id = Number(router.query.id);
  const q = api.rounds.byIdWithSongs.useQuery({ id }, { enabled: Number.isFinite(id) });
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


