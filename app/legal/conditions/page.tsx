import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d’utilisation — CRÉO",
  description: "Conditions générales d’utilisation du service CRÉO (SaaS).",
};

export default function ConditionsPage() {
  return (
    <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-creo-gray-700 dark:prose-p:text-creo-gray-300">
      <h1 className="text-creo-2xl font-semibold text-creo-black dark:text-white">
        Conditions générales d’utilisation
      </h1>
      <p className="text-creo-sm text-creo-gray-500">
        Dernière mise à jour : avril 2026. Document type pour phase bêta — adapte-le avec ton conseil avant
        une montée en charge commerciale forte.
      </p>

      <h2 className="mt-8 text-creo-lg">1. Objet</h2>
      <p>
        CRÉO est une plateforme logicielle en ligne (SaaS) permettant de créer et publier des pages, des
        formations, de gérer des contacts et des campagnes, ainsi que d’utiliser des intégrations de paiement
        (notamment Stripe). Les présentes conditions régissent l’accès et l’usage du service par les
        clients professionnels ou assimilés.
      </p>

      <h2 className="mt-8 text-creo-lg">2. Compte et accès</h2>
      <p>
        Tu es responsable de la confidentialité de tes identifiants. Toute activité réalisée depuis ton compte
        est réputée effectuée par toi ou sous ton contrôle. Tu t’engages à fournir des informations exactes et
        à jour.
      </p>

      <h2 className="mt-8 text-creo-lg">3. Abonnement et facturation</h2>
      <p>
        L’accès à certaines fonctionnalités peut être conditionné par un abonnement payant facturé via Stripe.
        Les prix, la périodicité et les moyens de paiement sont ceux présentés au moment de la souscription.
        Les factures et le moyen de paiement peuvent être gérés depuis le portail client Stripe mis à ta
        disposition dans l’application. En cas d’impayé ou de résiliation de l’abonnement, l’accès aux
        fonctionnalités payantes peut être restreint ou le plan du workspace ramené à une offre de base.
      </p>

      <h2 className="mt-8 text-creo-lg">4. Contenu et conformité</h2>
      <p>
        Tu restes propriétaire du contenu que tu publies. Tu garantis disposer des droits nécessaires et que
        ce contenu respecte la loi applicable (dont protection des consommateurs, propriété intellectuelle,
        données personnelles). CRÉO peut suspendre ou supprimer un contenu manifestement illicite ou contraire
        aux bonnes pratiques du service, après notification lorsque c’est raisonnablement possible.
      </p>

      <h2 className="mt-8 text-creo-lg">5. Disponibilité et évolution</h2>
      <p>
        Le service est fourni « en l’état ». Une disponibilité élevée est visée mais non garantie à 100 %.
        Des interruptions (maintenance, dépendances techniques, cas de force majeure) peuvent survenir. Le
        produit évolue : fonctionnalités, limites ou tarifs peuvent être ajustés avec information raisonnable
        lorsque c’est pertinent pour les clients payants.
      </p>

      <h2 className="mt-8 text-creo-lg">6. Responsabilité</h2>
      <p>
        Sauf disposition légale impérative, la responsabilité de l’éditeur de CRÉO ne saurait excéder, pour une
        période donnée, les sommes effectivement payées par le client pour le service sur cette période. Ne
        sont pas couverts les dommages indirects ou la perte de chiffre d’affaires, dans les limites permises
        par la loi.
      </p>

      <h2 className="mt-8 text-creo-lg">7. Résiliation</h2>
      <p>
        Tu peux cesser d’utiliser le service et résilier ton abonnement selon les modalités Stripe. L’éditeur
        peut suspendre ou clôturer un compte en cas de manquement grave aux présentes conditions, après
        mise en demeure lorsque la situation le permet.
      </p>

      <h2 className="mt-8 text-creo-lg">8. Contact</h2>
      <p>
        Pour toute question relative aux présentes conditions, utilise les coordonnées de contact indiquées sur
        le site ou dans l’application (support à définir par l’éditeur).
      </p>
    </article>
  );
}
