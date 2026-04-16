import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — CRÉO",
  description: "Informations réglementaires sur l’éditeur et l’hébergement du service CRÉO.",
};

export default function MentionsLegalesPage() {
  return (
    <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-creo-gray-700 dark:prose-p:text-creo-gray-300">
      <h1 className="text-creo-2xl font-semibold text-creo-black dark:text-white">
        Mentions légales
      </h1>
      <p className="text-creo-sm text-creo-gray-500">
        Modèle pour phase bêta — remplace les champs entre crochets par tes informations réelles avant toute
        communication commerciale sérieuse.
      </p>

      <h2 className="mt-8 text-creo-lg">1. Éditeur du site et du service</h2>
      <p>
        Le service CRÉO est édité par : <strong>[Dénomination sociale ou nom]</strong>,{" "}
        <strong>[forme juridique]</strong>, au capital de <strong>[montant]</strong> €, immatriculée au RCS de{" "}
        <strong>[ville]</strong> sous le numéro <strong>[SIREN / SIRET]</strong>, dont le siège social est situé{" "}
        <strong>[adresse complète]</strong>.
      </p>
      <p>
        Représentant légal : <strong>[nom du dirigeant]</strong>.
      </p>
      <p>
        Contact : <strong>[email de contact]</strong>
        {", "}
        <strong>[téléphone optionnel]</strong>.
      </p>

      <h2 className="mt-8 text-creo-lg">2. Directeur de la publication</h2>
      <p>
        <strong>[Nom, qualité]</strong>, en qualité de <strong>[directeur de la publication / gérant]</strong>.
      </p>

      <h2 className="mt-8 text-creo-lg">3. Hébergement</h2>
      <p>
        L’application et les données sont hébergées par des prestataires techniques, notamment :{" "}
        <strong>Vercel Inc.</strong> (hébergement applicatif —{" "}
        <a href="https://vercel.com/legal" className="text-creo-purple">
          vercel.com/legal
        </a>
        ) et <strong>Supabase Inc.</strong> (base de données et authentification —{" "}
        <a href="https://supabase.com/privacy" className="text-creo-purple">
          supabase.com/privacy
        </a>
        ), selon la configuration effective de ton déploiement.
      </p>

      <h2 className="mt-8 text-creo-lg">4. Propriété intellectuelle</h2>
      <p>
        Les éléments du site (marque, interface, textes, illustrations) sont protégés. Toute reproduction non
        autorisée est interdite sauf exceptions légales.
      </p>

      <h2 className="mt-8 text-creo-lg">5. Médiation et litiges</h2>
      <p>
        Conformément aux articles L. 612-1 et suivants du code de la consommation, le consommateur a le droit de
        recourir gratuitement à un médiateur de la consommation en cas de litige. Coordonnées du médiateur :{" "}
        <strong>[à compléter si tu adresses des offres aux consommateurs]</strong>.
      </p>

      <h2 className="mt-8 text-creo-lg">6. Données personnelles</h2>
      <p>
        Le traitement des données est décrit dans la{" "}
        <a href="/legal/confidentialite" className="text-creo-purple">
          politique de confidentialité
        </a>
        .
      </p>
    </article>
  );
}
