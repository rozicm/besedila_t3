import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function SongPerformance() {
  const router = useRouter();
  const id = Number(router.query.id);
  const list = api.songs.list.useQuery({});
  const song = list.data?.find((s) => s.id === id);
  if (!Number.isFinite(id)) return null;
  if (!song) return <main className="p-6">Loading…</main>;
  return (
    <main className="p-6 max-w-3xl mx-auto bg-white text-black">
      <h1 className="text-3xl font-bold mb-4">{song.title}</h1>
      <pre className="whitespace-pre-wrap leading-8 text-lg">
        {song.lyrics}
      </pre>
    </main>
  );
}


