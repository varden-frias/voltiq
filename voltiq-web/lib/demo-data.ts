export type DemoLead = {
  name: string;
  email: string;
  interest: string;
  note: string;
};

export type DemoProduct = {
  name: string;
  category: string;
  price: number;
  description: string;
};

export const demoProducts: DemoProduct[] = [
  {
    name: "Sony WH-1000XM5",
    category: "headphones",
    price: 299,
    description: "Excellent noise cancellation and comfort.",
  },
  {
    name: "Bose QuietComfort Headphones",
    category: "headphones",
    price: 279,
    description: "Strong ANC and a very comfortable fit.",
  },
  {
    name: "Anker Soundcore Space One",
    category: "headphones",
    price: 99,
    description: "Great value, good ANC, strong battery life.",
  },
  {
    name: "MacBook Air M3",
    category: "laptops",
    price: 1099,
    description: "Lightweight, fast, and great battery life.",
  },
  {
    name: "Dell XPS 13",
    category: "laptops",
    price: 1299,
    description: "Premium Windows laptop with a sharp display.",
  },
  {
    name: "ASUS Zenbook 14",
    category: "laptops",
    price: 899,
    description: "Strong balance of performance and portability.",
  },
];

export const demoLeads: DemoLead[] = [
  {
    name: "Jordan Lee",
    email: "jordan@example.com",
    interest: "Headphones for remote work",
    note: "Needs comfort and battery life.",
  },
  {
    name: "Avery Chen",
    email: "avery@example.com",
    interest: "Ultrabook for travel",
    note: "Wants light weight and strong battery.",
  },
];