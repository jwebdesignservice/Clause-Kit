export const CONTRACT_TYPES = [
  { slug: "freelance", label: "Freelance / Project Agreement" },
  { slug: "nda", label: "NDA" },
  { slug: "retainer", label: "Retainer Agreement" },
  { slug: "subcontractor", label: "Subcontractor Agreement" },
  { slug: "service", label: "Client Service Agreement" },
  { slug: "terms", label: "Website Terms & Conditions" },
  { slug: "debt", label: "Late Payment / Debt Recovery Letter" },
  { slug: "employment", label: "Employment Offer Letter" },
] as const;

export type ContractSlug = (typeof CONTRACT_TYPES)[number]["slug"];
