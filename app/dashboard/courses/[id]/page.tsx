"use client";

import { ChevronDown, FileText, GripVertical, Play, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function CourseEditorPage() {
  const [tab, setTab] = useState<"content" | "settings" | "students">(
    "content"
  );

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 space-y-3 lg:w-[260px]">
        <div className="flex items-center justify-between">
          <h2 className="text-creo-sm font-semibold text-creo-black">
            Structure du cours
          </h2>
          <Button type="button" size="sm" variant="outline" className="gap-1">
            <Plus className="size-3.5" />
            Module
          </Button>
        </div>
        <Card className="p-3">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-creo-md bg-creo-purple-pale px-2 py-2 text-left text-creo-sm font-medium text-creo-purple"
          >
            <GripVertical className="size-3.5 text-creo-gray-400" />
            <span className="flex-1">1. Fondations</span>
            <ChevronDown className="size-4" />
          </button>
          <ul className="mt-2 space-y-1 border-l-2 border-creo-gray-100 pl-4">
            <li className="flex items-center gap-2 rounded-md px-2 py-1.5 text-creo-sm hover:bg-creo-gray-50">
              <Play className="size-3.5 text-creo-purple" />
              Bienvenue
              <span className="ml-auto text-creo-xs text-creo-gray-400">
                4 min
              </span>
            </li>
            <li className="flex items-center gap-2 rounded-md px-2 py-1.5 text-creo-sm hover:bg-creo-gray-50">
              <FileText className="size-3.5 text-creo-gray-500" />
              Ressources
            </li>
          </ul>
        </Card>
      </aside>

      <main className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-creo-gray-200 pb-4">
          {(
            [
              ["content", "Leçon"],
              ["settings", "Paramètres formation"],
              ["students", "Élèves"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "rounded-full px-3 py-1 text-creo-sm font-medium transition-colors",
                tab === key
                  ? "bg-creo-purple-pale text-creo-purple"
                  : "text-creo-gray-500 hover:bg-creo-gray-100"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "content" && (
          <>
            <p className="text-creo-xs text-creo-gray-500">
              Module 1 › Leçon 1
            </p>
            <Input
              defaultValue="Bienvenue dans la formation"
              className="border-transparent text-creo-xl font-semibold shadow-none focus-visible:ring-1"
            />
            <div className="flex gap-2">
              {["Vidéo", "Texte", "PDF", "Audio"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className="rounded-creo-md border border-creo-gray-200 px-3 py-1.5 text-creo-sm hover:border-creo-purple/40"
                >
                  {t}
                </button>
              ))}
            </div>
            <Card className="flex min-h-[200px] items-center justify-center border-dashed p-8">
              <p className="text-creo-sm text-creo-gray-500">
                Zone vidéo / upload — intégration Loom-like à venir
              </p>
            </Card>
          </>
        )}

        {tab === "settings" && (
          <Card className="space-y-4 p-6">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input defaultValue="SEO pour débutants" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={4} placeholder="Résumé visible sur la boutique…" />
            </div>
          </Card>
        )}

        {tab === "students" && (
          <Card className="overflow-hidden p-0">
            <table className="w-full text-creo-sm">
              <thead className="bg-creo-gray-50 text-creo-xs uppercase tracking-wide text-creo-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Élève</th>
                  <th className="px-4 py-3 text-left">Progression</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-creo-gray-100">
                  <td className="px-4 py-3">Marie L.</td>
                  <td className="px-4 py-3">42%</td>
                </tr>
              </tbody>
            </table>
          </Card>
        )}
      </main>

      <aside className="w-full shrink-0 space-y-4 lg:w-[280px]">
        <Card className="p-4">
          <h3 className="text-creo-sm font-semibold">Paramètres leçon</h3>
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-2 text-creo-sm">
              <input type="checkbox" className="rounded border-creo-gray-300" />
              Leçon gratuite (aperçu)
            </label>
            <div className="space-y-1">
              <Label>Durée (min)</Label>
              <Input type="number" defaultValue={4} />
            </div>
          </div>
        </Card>
        <Link
          href="/dashboard/courses"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          ← Retour aux formations
        </Link>
      </aside>
    </div>
  );
}
