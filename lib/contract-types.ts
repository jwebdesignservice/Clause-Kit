import { ContractTypeOption } from "@/types";

export const CONTRACT_TYPES: ContractTypeOption[] = [
  {
    id: "freelance",
    title: "Freelance / Project Agreement",
    description: "Scope of work, deliverables, payment terms and IP ownership for project-based work.",
    icon: "💼",
  },
  {
    id: "nda-mutual",
    title: "NDA (Mutual)",
    description: "Both parties agree to keep each other's confidential information private.",
    icon: "🤝",
  },
  {
    id: "nda-one-way",
    title: "NDA (One-Way)",
    description: "One party discloses confidential information that the other agrees to protect.",
    icon: "🔒",
  },
  {
    id: "retainer",
    title: "Retainer Agreement",
    description: "Ongoing service arrangement with a fixed monthly fee and defined availability.",
    icon: "🔄",
  },
  {
    id: "subcontractor",
    title: "Subcontractor Agreement",
    description: "Terms for bringing in a third-party contractor to help deliver client work.",
    icon: "🔧",
  },
  {
    id: "client-service",
    title: "Client Service Agreement",
    description: "General terms and conditions for providing services to a client.",
    icon: "📋",
  },
  {
    id: "website-tcs",
    title: "Website T&Cs",
    description: "Terms and conditions, privacy policy, and acceptable use for a website.",
    icon: "🌐",
  },
  {
    id: "late-payment",
    title: "Late Payment / Debt Recovery Letter",
    description: "Formal letter requesting payment of outstanding invoices with legal standing.",
    icon: "📬",
  },
  {
    id: "employment-offer",
    title: "Employment Offer Letter",
    description: "Basic offer of employment with role, salary, start date and key conditions.",
    icon: "✉️",
  },
];
