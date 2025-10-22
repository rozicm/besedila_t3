import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";

export default function RoundDetail() {
  const router = useRouter();
  const id = Number(router.query.id);
  const q = api.rounds.byIdWithSongs.useQuery({ id }, { enabled: Number.isFinite(id) });
  const updateOrder = api.rounds.updateOrder.useMutation({
    onSuccess: () => q.refetch(),
  });

  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  useEffect(() => {
    if (q.data) setOrderedIds(q.data.roundItems.map((ri) => ri.song.id));
  }, [q.data]);

  if (!Number.isFinite(id)) return null;
  if (q.isLoading) return <main className="p-6">Loading…</main>;
  if (!q.data) return <main className="p-6">Not found</main>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{q.data.name}</h1>
      {q.data.description && (
        <p className="text-gray-600 mb-4">{q.data.description}</p>
      )}
      <div className="flex items-center gap-3 mb-3">
        <a className="underline" href={`/api/pdf/round?id=${id}`} target="_blank" rel="noreferrer">Download PDF</a>
      </div>
      <ReorderList
        items={q.data.roundItems.map((ri) => ({ id: ri.song.id, title: ri.song.title, genre: ri.song.genre }))}
        onChange={(ids) => setOrderedIds(ids)}
      />
      <Button className="mt-4" onClick={() => updateOrder.mutate({ id, songIds: orderedIds })}>Save order</Button>
    </main>
  );
}

function ReorderList({
  items,
  onChange,
}: {
  items: { id: number; title: string; genre: string }[];
  onChange: (ids: number[]) => void;
}) {
  const [local, setLocal] = useState(items);
  useEffect(() => setLocal(items), [items]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const next = [...local];
    const [removed] = next.splice(result.source.index, 1);
    if (removed) {
      next.splice(result.destination.index, 0, removed);
      setLocal(next);
      onChange(next.map((i) => i.id));
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="roundItems">
        {(provided) => (
          <ol
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2 list-decimal pl-6"
          >
            {local.map((ri, idx) => (
              <Draggable key={ri.id} draggableId={String(ri.id)} index={idx}>
                {(dragProvided, snapshot) => (
                  <li
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    className={`flex items-center gap-2 rounded border p-3 bg-white ${snapshot.isDragging ? "shadow-lg" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{ri.title}</div>
                      <div className="text-xs text-gray-500">{ri.genre}</div>
                    </div>
                    <div className="text-sm text-gray-400">Drag</div>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
}


