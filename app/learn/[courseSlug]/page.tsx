import { Check, Circle, Lock, Play } from "lucide-react";

import { Button } from "@/components/ui/button";

const lessons = [
  { id: "1", title: "Bienvenue", duration: "4 min", done: true, current: false },
  { id: "2", title: "Mindset", duration: "12 min", done: false, current: true },
  { id: "3", title: "Technique avancée", duration: "22 min", done: false, current: false, locked: true },
];

export default function LearnCoursePage() {
  return (
    <>
      <aside className="hidden w-[280px] shrink-0 border-r border-creo-gray-200 bg-creo-white p-4 lg:block">
        <h2 className="text-creo-sm font-semibold">Formation démo</h2>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-creo-gray-100">
          <div className="h-full w-[35%] bg-creo-purple" />
        </div>
        <div className="mt-6">
          <p className="text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500">
            Module 1
          </p>
          <p className="text-creo-sm font-medium">Fondations (2/3)</p>
          <ul className="mt-3 space-y-1">
            {lessons.map((l) => (
              <li
                key={l.id}
                className={`flex items-center gap-2 rounded-creo-md px-2 py-2 text-creo-sm ${
                  l.current ? "bg-creo-purple-pale text-creo-purple" : ""
                }`}
              >
                {l.done ? (
                  <Check className="size-4 text-[#059669]" />
                ) : l.locked ? (
                  <Lock className="size-4 text-creo-gray-400" />
                ) : l.current ? (
                  <Circle className="size-4 text-creo-purple" />
                ) : (
                  <Circle className="size-4 text-creo-gray-300" />
                )}
                <span className="flex-1">{l.title}</span>
                <span className="text-creo-xs text-creo-gray-400">
                  {l.duration}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="flex flex-1 flex-col">
        <div className="flex-1 bg-black">
          <div className="flex aspect-video max-h-[60vh] items-center justify-center">
            <Button
              type="button"
              variant="secondary"
              className="gap-2 bg-white/10 text-white hover:bg-white/20"
            >
              <Play className="size-5 fill-current" />
              Lecture démo
            </Button>
          </div>
        </div>
        <div className="border-t border-creo-gray-200 p-6">
          <h1 className="text-creo-xl font-semibold">Mindset</h1>
          <p className="mt-2 max-w-2xl text-creo-base text-creo-gray-600">
            Contenu texte centré façon Notion — zone éditable côté créateur.
          </p>
          <div className="mt-8 flex flex-wrap justify-between gap-4">
            <Button type="button" variant="outline" disabled>
              ← Leçon précédente
            </Button>
            <Button type="button">Marquer complété & suivante →</Button>
          </div>
        </div>
      </main>
    </>
  );
}
