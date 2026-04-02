"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Globe,
  Monitor,
  Save,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const blockGroups = [
  {
    title: "Structure",
    items: ["Section", "Colonnes 2", "Colonnes 3", "Conteneur"],
  },
  { title: "Texte", items: ["Titre H1", "Titre H2", "Paragraphe", "Citation"] },
  { title: "Médias", items: ["Image", "Vidéo", "Icône"] },
  {
    title: "Conversion",
    items: ["Compte à rebours", "Témoignage", "FAQ", "Prix"],
  },
];

type Device = "desktop" | "tablet" | "mobile";

export function BuilderShell({ pageId }: { pageId: string }) {
  const [device, setDevice] = useState<Device>("desktop");
  const [title, setTitle] = useState(`Page ${pageId}`);

  const canvasWidth =
    device === "desktop" ? "max-w-5xl" : device === "tablet" ? "max-w-2xl" : "max-w-sm";

  return (
    <>
      <header className="flex h-[52px] shrink-0 items-center gap-3 border-b border-creo-gray-200 bg-creo-white px-3 md:px-4">
        <Link
          href="/dashboard/pages"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-2" })}
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <span className="hidden h-6 w-px bg-creo-gray-200 sm:block" />
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 max-w-[200px] border-transparent px-2 text-creo-md font-semibold shadow-none focus-visible:ring-1 md:max-w-xs"
        />
        <Badge variant="gray">Brouillon</Badge>
        <div className="ml-auto flex items-center gap-1">
          {(
            [
              ["desktop", Monitor],
              ["tablet", Tablet],
              ["mobile", Smartphone],
            ] as const
          ).map(([d, Icon]) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              className={cn(
                "rounded-creo-md p-2 transition-colors",
                device === d
                  ? "bg-creo-purple-pale text-creo-purple"
                  : "text-creo-gray-500 hover:bg-creo-gray-100"
              )}
              aria-label={d}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" type="button" className="hidden sm:flex">
          <Eye className="size-4" />
          Aperçu
        </Button>
        <Button variant="ghost" size="sm" type="button" className="hidden sm:flex">
          <Save className="size-4" />
          Sauvegardé
        </Button>
        <Button size="sm" type="button" className="gap-1">
          <Globe className="size-4" />
          Publier
        </Button>
      </header>

      <div className="flex min-h-[calc(100vh-52px)] flex-1">
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-creo-gray-200 bg-creo-white lg:flex">
          <div className="border-b border-creo-gray-100 p-3">
            <div className="flex gap-1 rounded-creo-md bg-creo-gray-100 p-0.5 text-creo-xs font-medium">
              {["Blocs", "Calques", "Pages"].map((t, i) => (
                <button
                  key={t}
                  type="button"
                  className={cn(
                    "flex-1 rounded-md py-1.5",
                    i === 0 ? "bg-white shadow-sm" : "text-creo-gray-500"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {blockGroups.map((g) => (
              <div key={g.title} className="mb-4">
                <p className="mb-2 text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500">
                  {g.title}
                </p>
                <ul className="space-y-1">
                  {g.items.map((name) => (
                    <li
                      key={name}
                      className="cursor-grab rounded-creo-md border border-dashed border-creo-gray-200 px-3 py-2 text-creo-sm text-creo-gray-700 hover:border-creo-purple/30 hover:bg-creo-purple-pale/30"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex flex-1 items-start justify-center overflow-auto p-4 md:p-8">
          <div
            className={cn(
              "min-h-[480px] w-full rounded-creo-lg border border-creo-gray-200 bg-creo-white shadow-sm transition-all",
              canvasWidth
            )}
          >
            <div className="flex min-h-[400px] flex-col items-center justify-center border-2 border-dashed border-creo-gray-200 m-4 rounded-creo-md text-creo-sm text-creo-gray-500">
              Canvas — glisse des blocs ici
            </div>
          </div>
        </div>

        <aside className="hidden w-[320px] shrink-0 flex-col border-l border-creo-gray-200 bg-creo-white xl:flex">
          <div className="border-b border-creo-gray-100 p-4">
            <p className="text-creo-sm font-semibold">Propriétés</p>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-creo-sm text-creo-gray-500">
            Sélectionne un bloc pour l’éditer
          </div>
        </aside>
      </div>
    </>
  );
}
