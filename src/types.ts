export interface Homeowner {
  id: string;
  name: string;
  apartment: string;
  building: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  contractor: string;
  price: string;
  notes: string;
}

export interface CategoryData {
  needed: 'yes' | 'no' | 'maybe' | '';
  description: string;
  budget: string;
  quotes: Quote[];
  joinGroup: boolean;
}

export interface Requirements {
  homeownerId: string;
  categories: Record<string, CategoryData>;
  updatedAt: string;
}

export interface DashboardEntry extends Homeowner {
  requirements: Requirements | null;
}

export type Page = 'login' | 'questionnaire' | 'dashboard';
