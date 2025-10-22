import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function SongShow() {
  const router = useRouter();
  const id = Number(router.query.id);
  const list = api.songs.list.useQuery({});
  const song = list.data?.find((s) => s.id === id);
  if (!Number.isFinite(id)) return null;
  if (!song) return <main className="p-6">Loading…</main>;
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">{song.title}</h1>
      <div className="text-sm text-gray-500 mb-4">{song.genre}</div>
      <div className="mb-4"><a className="underline" href={`/api/pdf/song?id=${id}`} target="_blank" rel="noreferrer">Download PDF</a></div>
      <pre className="whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded border">
        {song.lyrics}
      </pre>
    </main>
  );
}


