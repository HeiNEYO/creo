import { Check } from "lucide-react";

const points = [
  "Tunnels de vente qui convertissent",
  "Formations qui transforment",
  "Analytics qui guident",
];

export function AuthMarketingPanel() {
  return (
    <div className="relative flex min-h-full flex-col justify-between overflow-hidden bg-creo-purple px-8 py-10 text-white lg:px-12 lg:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative">
        <p className="text-xl font-semibold tracking-tight">CRÉO</p>
        <h1 className="mt-10 max-w-md text-creo-3xl font-semibold leading-tight">
          Votre business en un seul endroit
        </h1>
        <ul className="mt-8 space-y-4">
          {points.map((text) => (
            <li key={text} className="flex items-start gap-3 text-creo-base">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
      <blockquote className="relative mt-12 border-t border-white/20 pt-8">
        <p className="text-creo-sm leading-relaxed text-white/90">
          « Enfin une stack qui suit la vitesse à laquelle je lance. »
        </p>
        <footer className="mt-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
            ML
          </div>
          <div>
            <p className="text-creo-sm font-medium">Marie L.</p>
            <p className="text-creo-xs text-white/70">Formatrice SEO</p>
          </div>
        </footer>
      </blockquote>
    </div>
  );
}
