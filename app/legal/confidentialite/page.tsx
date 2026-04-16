import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — CRÉO",
  description: "Traitement des données personnelles dans le cadre du service CRÉO.",
};

export default function ConfidentialitePage() {
  return (
    <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-creo-gray-700 dark:prose-p:text-creo-gray-300">
      <h1 className="text-creo-2xl font-semibold text-creo-black dark:text-white">
        Politique de confidentialité
      </h1>
      <p className="text-creo-sm text-creo-gray-500">
        Dernière mise à jour : avril 2026. Base pour une bêta — complète avec ton DPO ou conseil pour le RGPD
        et les sous-traitants réels (hébergeur, emails, analytics).
      </p>

      <h2 className="mt-8 text-creo-lg">1. Responsable du traitement</h2>
      <p>
        L’éditeur de la plateforme CRÉO (à identifier juridiquement : société, adresse, contact) est responsable
        des traitements liés au compte utilisateur, au workspace et à la facturation de l’abonnement SaaS.
      </p>

      <h2 className="mt-8 text-creo-lg">2. Données collectées</h2>
      <p>
        Sont notamment traitées : identité, adresse e-mail, données de connexion, contenus que tu crées sur la
        plateforme, données de tes propres contacts et apprenants que tu importes ou qui interagissent avec
        tes pages, journaux techniques et d’usage (dont événements analytics agrégés), ainsi que les données
        nécessaires aux paiements (gérées en grande partie par Stripe).
      </p>

      <h2 className="mt-8 text-creo-lg">3. Finalités</h2>
      <p>
        Fourniture et sécurisation du service, gestion des abonnements et facturation, support, amélioration
        du produit, obligations légales et comptables, lutte contre la fraude.
      </p>

      <h2 className="mt-8 text-creo-lg">4. Sous-traitants</h2>
      <p>
        Le service s’appuie sur des prestataires techniques typiques : hébergement applicatif (ex. Vercel),
        base de données et authentification (ex. Supabase), traitement des paiements (Stripe), envoi d’e-mails
        transactionnels ou marketing (ex. Resend) lorsque ces modules sont activés. Les transferts hors UE, le
        cas échéant, doivent être encadrés (clauses types, pays adéquats, etc.).
      </p>

      <h2 className="mt-8 text-creo-lg">5. Durée de conservation</h2>
      <p>
        Les données sont conservées pendant la durée du compte et les délais légaux applicables après clôture
        (facturation, preuve contractuelle). Les données de tes propres contacts relèvent de ta responsabilité
        en tant que responsable de traitement distinct lorsque tu les traites pour ton activité.
      </p>

      <h2 className="mt-8 text-creo-lg">6. Tes droits (RGPD)</h2>
      <p>
        Selon les cas, tu disposes de droits d’accès, de rectification, d’effacement, de limitation,
        d’opposition et de portabilité. Pour les exercer, contacte l’éditeur à l’adresse indiquée sur le site.
        Tu peux introduire une réclamation auprès de la CNIL (France).
      </p>

      <h2 id="cookies" className="mt-8 scroll-mt-24 text-creo-lg">
        7. Cookies et traceurs
      </h2>
      <p>
        Des cookies ou stockages locaux peuvent être utilisés pour la session, les préférences et, le cas
        échéant, l’analytics. Un bandeau ou une information plus détaillée peut être ajouté sur le site
        marketing selon ta politique cookies.
      </p>
    </article>
  );
}
