"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PageBlock } from "@/lib/pages/page-blocks";
import { cn } from "@/lib/utils";

const selectClass = cn(
  "flex h-9 w-full rounded-creo-md border border-creo-gray-300 bg-creo-white px-3 text-creo-sm text-creo-black",
  "focus-visible:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/30",
  "dark:border-input dark:bg-background"
);

function dataObj(block: PageBlock): Record<string, unknown> {
  const d = block.data;
  if (d && typeof d === "object" && !Array.isArray(d)) return d as Record<string, unknown>;
  return {};
}

export type BuilderBlockInspectorProps = {
  block: PageBlock;
  onChangeText: (text: string) => void;
  onPatchData: (patch: Record<string, unknown>) => void;
};

export function BuilderBlockInspector({
  block,
  onChangeText,
  onPatchData,
}: BuilderBlockInspectorProps) {
  const d = dataObj(block);
  const text = typeof block.text === "string" ? block.text : "";

  if (block.type === "divider") {
    return <p className="text-creo-xs text-creo-gray-500">Séparateur sans contenu éditable.</p>;
  }

  if (block.type === "hero") {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="hero-headline">Titre principal</Label>
          <Input
            id="hero-headline"
            value={typeof d.headline === "string" ? d.headline : ""}
            onChange={(e) => onPatchData({ headline: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hero-sub">Sous-titre</Label>
          <Input
            id="hero-sub"
            value={typeof d.subheadline === "string" ? d.subheadline : ""}
            onChange={(e) => onPatchData({ subheadline: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hero-bg">Couleur de fond (hex)</Label>
          <Input
            id="hero-bg"
            value={typeof d.backgroundColor === "string" ? d.backgroundColor : "#f4f4f5"}
            onChange={(e) => onPatchData({ backgroundColor: e.target.value })}
          />
        </div>
      </div>
    );
  }

  if (block.type === "optin_form") {
    const gdpr = typeof d.gdpr === "string" ? d.gdpr : "optional";
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="optin-copy">Texte au-dessus du formulaire</Label>
          <Textarea
            id="optin-copy"
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            rows={4}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="optin-btn">Libellé du bouton</Label>
          <Input
            id="optin-btn"
            value={typeof d.buttonLabel === "string" ? d.buttonLabel : ""}
            onChange={(e) => onPatchData({ buttonLabel: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="optin-gdpr">Case RGPD</Label>
          <select
            id="optin-gdpr"
            className={selectClass}
            value={gdpr}
            onChange={(e) => onPatchData({ gdpr: e.target.value })}
          >
            <option value="required">Obligatoire</option>
            <option value="optional">Optionnelle</option>
            <option value="hidden">Masquée</option>
          </select>
        </div>
      </div>
    );
  }

  if (block.type === "countdown") {
    const mode = typeof d.mode === "string" ? d.mode : "fixed";
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="cd-mode">Mode</Label>
          <select
            id="cd-mode"
            className={selectClass}
            value={mode}
            onChange={(e) => onPatchData({ mode: e.target.value })}
          >
            <option value="fixed">Date fixe</option>
            <option value="evergreen">Evergreen (bientôt)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cd-end">Fin (ISO)</Label>
          <Input
            id="cd-end"
            value={typeof d.endAt === "string" ? d.endAt : ""}
            onChange={(e) => onPatchData({ endAt: e.target.value })}
            placeholder="2026-12-31T23:00:00.000Z"
          />
        </div>
      </div>
    );
  }

  if (block.type === "legal_checkout") {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="legal-terms">URL conditions</Label>
          <Input
            id="legal-terms"
            value={typeof d.termsUrl === "string" ? d.termsUrl : ""}
            onChange={(e) => onPatchData({ termsUrl: e.target.value })}
            placeholder="https://…"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="legal-refund">URL remboursement</Label>
          <Input
            id="legal-refund"
            value={typeof d.refundUrl === "string" ? d.refundUrl : ""}
            onChange={(e) => onPatchData({ refundUrl: e.target.value })}
            placeholder="https://…"
          />
        </div>
      </div>
    );
  }

  if (block.type === "confirmation") {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="conf-h">Titre</Label>
          <Input
            id="conf-h"
            value={typeof d.headline === "string" ? d.headline : ""}
            onChange={(e) => onPatchData({ headline: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="conf-t">Message</Label>
          <Textarea
            id="conf-t"
            value={typeof d.text === "string" ? d.text : ""}
            onChange={(e) => onPatchData({ text: e.target.value })}
            rows={4}
          />
        </div>
      </div>
    );
  }

  if (block.type === "access_button") {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="acc-l">Libellé</Label>
          <Input
            id="acc-l"
            value={typeof d.label === "string" ? d.label : ""}
            onChange={(e) => onPatchData({ label: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="acc-h">Lien</Label>
          <Input
            id="acc-h"
            value={typeof d.href === "string" ? d.href : ""}
            onChange={(e) => onPatchData({ href: e.target.value })}
            placeholder="https://…"
          />
        </div>
      </div>
    );
  }

  if (block.type === "video_embed" || block.type === "lesson_video") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor="vid-url">URL vidéo</Label>
        <Input
          id="vid-url"
          value={typeof d.url === "string" ? d.url : ""}
          onChange={(e) => onPatchData({ url: e.target.value })}
          placeholder="https://youtube.com/…"
        />
      </div>
    );
  }

  if (block.type === "price_cta") {
    return (
      <div className="space-y-3">
        <p className="text-creo-xs text-creo-gray-500">
          Le prix affiché sur la page publique viendra du produit lié (réglages à venir).
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="pc-slug">Slug page checkout cible</Label>
          <Input
            id="pc-slug"
            value={typeof d.checkoutPageSlug === "string" ? d.checkoutPageSlug : ""}
            onChange={(e) => onPatchData({ checkoutPageSlug: e.target.value })}
            placeholder="ma-page-checkout"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pc-lbl">Libellé bouton</Label>
          <Input
            id="pc-lbl"
            value={typeof d.label === "string" ? d.label : ""}
            onChange={(e) => onPatchData({ label: e.target.value })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="blk-text">Texte</Label>
        <Textarea
          id="blk-text"
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          rows={8}
          className="min-h-[120px] resize-y"
        />
      </div>
      {Object.keys(d).length > 0 ? (
        <p className="text-creo-xs text-creo-gray-400">
          Données structurées : champs dédiés arrivent pour ce type de bloc.
        </p>
      ) : null}
    </div>
  );
}
