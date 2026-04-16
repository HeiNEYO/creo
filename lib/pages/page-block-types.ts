/**
 * Bloc de page (JSON dans `pages.content.blocks`).
 */

export type PageBlock = {
  id: string;
  type: string;
  /** Texte simple ou corps principal (compat + blocs légers) */
  text?: string;
  /** Données structurées (hero, FAQ, formulaires, etc.) */
  data?: Record<string, unknown>;
};
