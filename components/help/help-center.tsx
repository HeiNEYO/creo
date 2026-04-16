"use client";

import { FileText, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { HelpArticleBody } from "@/components/help/help-article-body";
import { helpCategories } from "@/lib/help/articles";
import { cn } from "@/lib/utils";

const EMPTY_BODY_MESSAGE =
  "Cette fiche n’est pas encore rédigée. Tu peux explorer les autres articles ou contacter le support si tu es bloqué.";

type Props = {
  initialCategoryId: string;
};

export function HelpCenter({ initialCategoryId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  const categorieParam = searchParams.get("categorie") ?? initialCategoryId;
  const activeCategory =
    helpCategories.find((c) => c.id === categorieParam) ?? helpCategories[0] ?? null;

  const [openArticleId, setOpenArticleId] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    if (!activeCategory) return [];
    const q = query.trim().toLowerCase();
    if (!q) return activeCategory.articles;
    return activeCategory.articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q),
    );
  }, [activeCategory, query]);

  function setCategory(id: string) {
    const u = new URLSearchParams(searchParams.toString());
    u.set("categorie", id);
    router.push(`/aides?${u.toString()}`, { scroll: false });
    setOpenArticleId(null);
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-white/10 bg-[#0f172a] px-4 py-4 text-center dark:bg-[#0a0f1a]">
        <h1 className="text-base font-semibold tracking-tight text-white">Aide CRÉO</h1>
        <p className="mt-1 text-xs text-white/70">Documentation et guides</p>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row lg:gap-10 lg:px-6">
        <aside className="w-full shrink-0 lg:w-72">
          <div className="relative mb-6">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher dans la catégorie…"
              className={cn(
                "w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-3 text-sm",
                "placeholder:text-zinc-400 focus:border-creo-blue focus:outline-none focus:ring-2 focus:ring-creo-blue/20",
                "dark:border-white/10 dark:bg-zinc-900 dark:text-white",
              )}
              aria-label="Rechercher dans les articles"
            />
          </div>

          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Catégories
          </p>
          <nav className="flex flex-col gap-0.5" aria-label="Catégories d’aide">
            {helpCategories.map((cat) => {
              const active = activeCategory?.id === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    active
                      ? "bg-white font-semibold text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-600 hover:bg-white/60 dark:text-zinc-400 dark:hover:bg-white/5",
                  )}
                >
                  <span>{cat.label}</span>
                  {active ? <span aria-hidden>›</span> : null}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            <Link href="/" className="text-creo-blue hover:underline dark:text-creo-blue-readable">
              ← Retour à l’accueil
            </Link>
            {" · "}
            <Link href="/login" className="text-creo-blue hover:underline dark:text-creo-blue-readable">
              Connexion
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-none md:p-8">
            {activeCategory ? (
              <>
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-white/10">
                  <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                    {activeCategory.label}
                  </h2>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {filteredArticles.length} article{filteredArticles.length > 1 ? "s" : ""}
                  </span>
                </div>

                <ul className="space-y-1">
                  {filteredArticles.map((article) => (
                    <li key={article.id} className="rounded-lg border border-transparent">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenArticleId((id) => (id === article.id ? null : article.id))
                        }
                        className={cn(
                          "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                          openArticleId === article.id
                            ? "bg-creo-info-pale/80 dark:bg-[rgba(0,51,255,0.12)]"
                            : "hover:bg-zinc-50 dark:hover:bg-white/5",
                        )}
                        aria-expanded={openArticleId === article.id}
                      >
                        <FileText
                          className="mt-0.5 size-4 shrink-0 text-creo-blue dark:text-creo-blue-readable"
                          aria-hidden
                        />
                        <span>
                          <span className="font-medium text-creo-blue dark:text-creo-blue-readable">
                            {article.title}
                          </span>
                          <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
                            {article.summary}
                          </span>
                        </span>
                      </button>
                      {openArticleId === article.id ? (
                        <div
                          className="border-t border-zinc-100 px-3 py-4 dark:border-white/10"
                          id={`article-${article.id}`}
                        >
                          {article.body ? (
                            <div className="max-w-none">
                              <HelpArticleBody article={article} />
                            </div>
                          ) : (
                            <p className="text-sm italic text-zinc-500 dark:text-zinc-400">
                              {EMPTY_BODY_MESSAGE}
                            </p>
                          )}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>

                {filteredArticles.length === 0 ? (
                  <p className="py-8 text-center text-sm text-zinc-500">
                    Aucun article ne correspond à ta recherche dans cette catégorie.
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
