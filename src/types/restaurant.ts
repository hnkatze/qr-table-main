export interface Table {
  id: string;
  number: number;
  qrToken: string;
}

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  currency: string;
}
