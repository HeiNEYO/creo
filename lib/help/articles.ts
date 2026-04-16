/**
 * Centre d’aide CRÉO — contenu éditorial.
 * `body: null` = fiche à compléter (affichage explicite côté UI).
 */

export type HelpBlock =
  | { kind: "paragraphs"; text: string }
  | { kind: "callout"; title: string; items: string[] }
  | { kind: "sectionBrand"; brand: "stripe" | "paypal"; label: string }
  | {
      kind: "numberedSteps";
      badge: "creo" | "stripe";
      steps: { num: number; title: string; text?: string; bullets?: string[] }[];
    }
  | { kind: "simpleCard"; text: string };

/** Texte simple (gras `**`) ou blocs type guide (cartes, étapes numérotées). */
export type HelpBody = string | HelpBlock[];

export type HelpArticle = {
  id: string;
  title: string;
  /** Ligne d’intro sous le titre (liste) */
  summary: string;
  /** Sous-titre sous le titre quand l’article est ouvert (guides détaillés) */
  subtitle?: string;
  /** Bouton retour optionnel (ex. passerelles) */
  backLink?: { href: string; label: string };
  /** Contenu ; null = fiche à compléter */
  body: HelpBody | null;
};

export type HelpCategory = {
  id: string;
  label: string;
  articles: HelpArticle[];
};

export const helpCategories: HelpCategory[] = [
  {
    id: "premiers-pas",
    label: "Premiers pas",
    articles: [
      {
        id: "creer-compte-workspace",
        title: "Créer un compte et accéder au workspace",
        summary: "Inscription, première connexion et navigation dans le cockpit CRÉO.",
        body:
          "Après inscription, tu accèdes au **tableau de bord** (cockpit) : c’est le point central pour voir l’activité du workspace. Le menu à gauche permet d’accéder au **site** (pages publiques), aux **formations**, à l’**e-mail & CRM**, aux **analytics**, etc. Les **paramètres** (icône en bas du menu ou entrée dédiée) regroupent le nom du workspace, le domaine, les passerelles de paiement et l’abonnement plateforme.",
      },
      {
        id: "roles-equipe",
        title: "Rôles et invitations d’équipe",
        summary: "Propriétaire, admin, membre — qui peut faire quoi dans le workspace.",
        body: null,
      },
    ],
  },
  {
    id: "editeur",
    label: "Éditeur de pages",
    articles: [
      {
        id: "creer-page-publier",
        title: "Créer une page et la publier",
        summary: "Depuis « Site » : nouvelle page, édition dans le builder, mise en ligne.",
        body:
          "Va dans **Site** (menu gauche), puis crée une page ou ouvre une page existante. L’**éditeur visuel** (builder) te permet d’ajouter des blocs (texte, images, boutons, etc.), de structurer le contenu et d’enregistrer. La page est servie sur l’URL publique du workspace (chemin `/p/…` ou domaine personnalisé une fois configuré). Pense à définir une **page d’accueil** si ton offre le prévoit.",
      },
      {
        id: "seo-editeur",
        title: "Référencement (SEO) : titres et descriptions",
        summary: "Champs utiles pour les moteurs de recherche sur tes pages publiques.",
        body:
          "Dans les paramètres de page ou du site (selon l’emplacement prévu dans CRÉO), renseigne un **titre** clair et une **meta description** : elles apparaissent souvent dans les résultats Google. Reste factuel et aligné avec le contenu réel de la page.",
      },
      {
        id: "ajouter-texte-image",
        title: "Ajouter et modifier un texte ou une image",
        summary: "Blocs de contenu dans le builder.",
        body:
          "Dans le builder, ajoute un bloc **texte** ou **média** selon ce que propose l’interface. Tu peux coller du contenu, ajuster la typo via la barre d’outils si disponible, et remplacer les images par glisser-déposer ou sélection de fichier selon les options affichées.",
      },
      {
        id: "bouton-lien-stripe",
        title: "Boutons d’achat et liens vers une offre",
        summary: "Relier une page à une offre payante (Stripe Connect côté workspace).",
        body:
          "Pour vendre depuis une page, tu dois d’abord configurer **Stripe Connect** dans les paramètres workspace (passerelles de paiement), puis utiliser les composants ou boutons prévus sur la page publique pour **rediriger vers le paiement**. Les montants et produits sont gérés côté Stripe selon ta configuration.",
      },
      {
        id: "ancre-page",
        title: "Mettre une ancre sur la page",
        summary: "Liens vers une section de la même page.",
        body: null,
      },
      {
        id: "code-html-custom",
        title: "Insérer du HTML ou du code personnalisé",
        summary: "Bloc « code » ou HTML si disponible dans l’éditeur.",
        body: null,
      },
    ],
  },
  {
    id: "formations",
    label: "Formations & parcours",
    articles: [
      {
        id: "creer-formation",
        title: "Créer une formation et des leçons",
        summary: "Module Formations : structure, contenu, publication.",
        body:
          "Le menu **Formations** permet de créer des **parcours** avec des leçons (vidéo, texte, etc.). Enregistre chaque leçon, ordonne-les, puis publie lorsque le contenu est prêt. Les membres accèdent selon les règles d’accès définies par ton produit (abonnement, achat, etc.).",
      },
      {
        id: "progression-membre",
        title: "Suivre la progression des membres",
        summary: "Où voir l’avancement des apprenants.",
        body: null,
      },
    ],
  },
  {
    id: "paiements",
    label: "Paiements",
    articles: [
      {
        id: "lier-stripe-paypal",
        title: "Lier Stripe et PayPal",
        summary: "Guide pas à pas : Stripe Connect, PayPal, et lien vers les passerelles.",
        subtitle:
          "Étapes pour connecter tes passerelles — même logique que sur les outils type Systeme.io ou Kajabi.",
        backLink: {
          href: "/dashboard/settings?section=payment-gateways",
          label: "← Passerelles de paiement",
        },
        body: [
          {
            kind: "callout",
            title: "À savoir avant de commencer",
            items: [
              "**Encaissement clients** : l’argent de tes acheteurs va sur **ton** Stripe / PayPal (comptes que tu lies ici).",
              "**Abonnement CRÉO** : ce que tu paies pour utiliser la plateforme se gère à part ([Abonnement CRÉO](/dashboard/settings?section=subscription-creo)).",
            ],
          },
          { kind: "sectionBrand", brand: "stripe", label: "Stripe (recommandé)" },
          {
            kind: "numberedSteps",
            badge: "stripe",
            steps: [
              {
                num: 1,
                title: "Ouvre les passerelles",
                text: "Va dans [Paramètres → Passerelles de paiement](/dashboard/settings?section=payment-gateways).",
              },
              {
                num: 2,
                title: "Choisis comment lier ton compte",
                bullets: [
                  "**Connecter avec Stripe Express** : idéal si tu n’as pas encore de compte ou tu préfères l’assistant Stripe.",
                  "**J’ai déjà un compte Stripe** : tu te connectes avec ton compte Standard existant (OAuth). Nécessite la config OAuth côté plateforme (`NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID`).",
                ],
              },
              {
                num: 3,
                title: "Suis Stripe à l’écran",
                text: "Adresse, type d’entreprise, identité : Stripe collecte ces infos pour activer les paiements et limiter la fraude. À la fin, autorise l’accès au compte si Stripe le demande.",
              },
              {
                num: 4,
                title: "Reviens sur CRÉO",
                text: "Tu es renvoyé vers les passerelles. Le badge passe à « encaissement OK » quand Stripe a validé le compte (quelques secondes via webhook).",
              },
            ],
          },
          { kind: "sectionBrand", brand: "paypal", label: "PayPal (préparation)" },
          {
            kind: "simpleCard",
            text: "Indique l’e-mail ou l’identifiant PayPal qui recevra les paiements. L’intégration complète des paiements PayPal sur les pages sera activée dans une prochaine version ; en attendant, tu peux déjà enregistrer ton compte pour préparer la suite.",
          },
        ],
      },
      {
        id: "stripe-connect",
        title: "Configurer Stripe Connect pour encaisser",
        summary: "Relier ton compte Stripe et activer les paiements sur tes pages.",
        body:
          "Voir le guide détaillé **Lier Stripe et PayPal** ci-dessus. En résumé : dans **Paramètres → Passerelles de paiement**, suis l’étape **Stripe Connect** (OAuth ou onboarding). Tant que les paiements ne sont pas activés côté Stripe, les boutons d’achat peuvent rester inactifs. Vérifie aussi les variables d’environnement côté **hébergeur** (Vercel) si la doc technique l’indique.",
      },
      {
        id: "paypal",
        title: "PayPal comme option de paiement",
        summary: "Saisie de l’e-mail PayPal du workspace.",
        body:
          "Tu peux compléter une **adresse e-mail PayPal** dans les paramètres de passerelles pour les flux qui l’utilisent. Le détail du flux (bouton, redirection) dépend de l’intégration affichée dans l’app.",
      },
      {
        id: "abonnement-creo",
        title: "Abonnement à la plateforme CRÉO (Creator, Pro, Agency)",
        summary: "Distinct des paiements de tes clients finaux.",
        body:
          "L’**abonnement CRÉO** (toi → plateforme) se gère dans **Paramètres → Abonnement CRÉO** : c’est ce qui permet d’utiliser l’éditeur, le CRM, l’e-mail, etc. Les **paiements de tes clients** passent par Stripe Connect / PayPal sur **tes** pages — ce sont deux sujets différents.",
      },
    ],
  },
  {
    id: "email-crm",
    label: "E-mail & CRM",
    articles: [
      {
        id: "contacts-export",
        title: "Contacts et export CSV",
        summary: "Gestion des contacts et export pour traitement externe.",
        body:
          "Le module **E-mail & CRM** permet de collecter et segmenter des contacts. Tu peux en général **exporter** une liste au format CSV pour analyse ou import ailleurs (voir les écrans Contacts / export dans l’app).",
      },
      {
        id: "campagnes-sequences",
        title: "Campagnes, séquences et envois",
        summary: "Automatisations e-mail au sein du workspace.",
        body:
          "Tu peux préparer des **séquences** (scénarios) et des **campagnes** selon les écrans disponibles. Respecte le **RGPD** (consentement, désinscription) et les bonnes pratiques de délivrabilité (expéditeur, contenu).",
      },
      {
        id: "delivrabilite",
        title: "Délivrabilité des e-mails",
        summary: "DNS, SPF, DKIM — à compléter selon ton fournisseur d’envoi.",
        body: null,
      },
    ],
  },
  {
    id: "domaine",
    label: "Domaine & site public",
    articles: [
      {
        id: "url-publique",
        title: "URL publique du workspace (chemin /p/…)",
        summary: "Comment les visiteurs accèdent à ton site sur CRÉO.",
        body:
          "Par défaut, les pages sont accessibles via l’URL de la plateforme au format **`/p/{slug-workspace}/{slug-page}`**. Tu peux retrouver le **slug** du workspace dans **Paramètres → Général**.",
      },
      {
        id: "domaine-personnalise",
        title: "Domaine personnalisé et DNS",
        summary: "Pointer ton propre nom de domaine vers CRÉO.",
        body:
          "Les **paramètres Domaine & DNS** expliquent l’objectif (CNAME, etc.). La validation automatique peut être en cours de déploiement : suis les instructions affichées et celles de ton **hébergeur DNS** (ex. Vercel).",
      },
    ],
  },
  {
    id: "compte",
    label: "Compte & workspace",
    articles: [
      {
        id: "profil-mot-de-passe",
        title: "Profil, e-mail et mot de passe",
        summary: "Mon compte vs paramètres workspace.",
        body:
          "**Paramètres → Mon compte** regroupe ton identité (nom, photo, e-mail, mot de passe). Le reste des **paramètres** concerne le **workspace** : nom du site, **slug**, **domaine**, **équipe**, etc.",
      },
      {
        id: "supprimer-workspace",
        title: "Zone de danger : suppression du workspace",
        summary: "Action irréversible — réservée au propriétaire.",
        body:
          "La suppression est proposée dans **Paramètres → Zone de danger**. Tu dois souvent **confirmer le nom** du workspace. Assure-toi d’avoir sauvegardé les données importantes avant.",
      },
    ],
  },
  {
    id: "divers",
    label: "Divers",
    articles: [
      {
        id: "integrations",
        title: "Intégrations tierces",
        summary: "Connexion avec d’autres services.",
        body: null,
      },
      {
        id: "support",
        title: "Contacter le support",
        summary: "Comment obtenir de l’aide humaine.",
        body:
          "Pour un problème bloquant ou une question non couverte par cette aide, utilise le **canal support** prévu par ton offre (e-mail ou ticket si indiqué sur le site CRÉO). Décris le workspace, le navigateur et les étapes pour reproduire le souci.",
      },
    ],
  },
];

export function getCategoryById(id: string): HelpCategory | undefined {
  return helpCategories.find((c) => c.id === id);
}

export function getArticleById(articleId: string): { category: HelpCategory; article: HelpArticle } | undefined {
  for (const category of helpCategories) {
    const article = category.articles.find((a) => a.id === articleId);
    if (article) return { category, article };
  }
  return undefined;
}
