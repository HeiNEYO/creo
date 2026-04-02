type Block = {
  id?: string;
  type?: string;
  text?: string;
};

function blocksFromContent(content: unknown): Block[] {
  if (!content || typeof content !== "object") return [];
  const blocks = (content as { blocks?: unknown }).blocks;
  if (!Array.isArray(blocks)) return [];
  return blocks.filter((b): b is Block => b && typeof b === "object");
}

export function PublicPageRenderer({
  title,
  content,
}: {
  title: string;
  content: unknown;
}) {
  const blocks = blocksFromContent(content);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        {title}
      </h1>
      <div className="mt-8 space-y-6 text-zinc-700 dark:text-zinc-300">
        {blocks.length === 0 ? (
          <p className="text-zinc-500">Cette page est publiée. Ajoute du contenu dans le builder.</p>
        ) : (
          blocks.map((b, i) => {
            const key = b.id ?? `b-${i}`;
            if (b.type === "paragraph" || b.type === "text") {
              return (
                <p key={key} className="leading-relaxed">
                  {typeof b.text === "string" ? b.text : ""}
                </p>
              );
            }
            if (b.type === "heading" || b.type === "h1") {
              return (
                <h2 key={key} className="text-2xl font-semibold text-zinc-900 dark:text-white">
                  {typeof b.text === "string" ? b.text : ""}
                </h2>
              );
            }
            if (b.type === "h2") {
              return (
                <h3 key={key} className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {typeof b.text === "string" ? b.text : ""}
                </h3>
              );
            }
            return (
              <div key={key} className="rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-700">
                Bloc « {b.type ?? "inconnu"} »
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}
