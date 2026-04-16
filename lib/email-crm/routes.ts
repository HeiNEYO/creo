/** Routes centralisées — module Email & CRM */
export const emailCrmRoutes = {
  home: "/dashboard/email-crm",
  contacts: "/dashboard/email-crm/contacts",
  tags: "/dashboard/email-crm/tags",
  segments: "/dashboard/email-crm/segments",
  campaigns: "/dashboard/email-crm/campaigns",
  sequences: "/dashboard/email-crm/sequences",
  sequenceDetail: (id: string) => `/dashboard/email-crm/sequences/${id}`,
  conception: "/dashboard/email-crm/conception",
  statistics: "/dashboard/email-crm/statistics",
  settings: "/dashboard/email-crm/settings",
  campaignHtml: (id: string) => `/dashboard/email-crm/campaigns/${id}/html`,
  campaignDesign: (id: string) => `/dashboard/email-crm/campaigns/${id}/design`,
} as const;
