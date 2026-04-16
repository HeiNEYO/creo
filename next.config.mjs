/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/aide",
        destination: "/aides",
        permanent: false,
      },
      {
        source: "/dashboard/emails",
        destination: "/dashboard/email-crm",
        permanent: false,
      },
      {
        source: "/dashboard/emails/audience",
        destination: "/dashboard/email-crm/tags",
        permanent: false,
      },
      {
        source: "/dashboard/emails/templates",
        destination: "/dashboard/email-crm/conception",
        permanent: false,
      },
      {
        source: "/dashboard/emails/campaigns/:id",
        destination: "/dashboard/email-crm/campaigns/:id/html",
        permanent: false,
      },
      {
        source: "/dashboard/emails/:path*",
        destination: "/dashboard/email-crm/:path*",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.icons8.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@shopify/polaris-icons"],
  },
};

export default nextConfig;
