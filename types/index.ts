export type ContractType =
  | "freelance"
  | "nda-mutual"
  | "nda-one-way"
  | "retainer"
  | "subcontractor"
  | "client-service"
  | "website-tcs"
  | "late-payment"
  | "employment-offer"
  | "custom";

export interface ContractTypeOption {
  id: ContractType;
  title: string;
  description: string;
  icon: string;
}

export interface IntakeFormData {
  contractType: ContractType;
  customDescription?: string;
  fields: Record<string, string>;
}

export interface GeneratedContract {
  content: string;
  title: string;
  contractType: ContractType;
  createdAt: string;
}

export type PlanType = "pay-per-doc" | "subscription";

export interface SubscriptionStatus {
  isActive: boolean;
  customerId?: string;
  subscriptionId?: string;
  currentPeriodEnd?: number;
}
