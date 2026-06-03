import { demoProducts } from "./demo-data";

export function getDemoReply(message: string) {
  const text = message.toLowerCase();

  const category = text.includes("headphone") || text.includes("earbud")
    ? "headphones"
    : text.includes("laptop") || text.includes("macbook") || text.includes("xps")
      ? "laptops"
      : "";

  const budgetMatch = text.match(/(\d{3,5})/);
  const budget = budgetMatch ? Number(budgetMatch[1]) : null;

  let matches = demoProducts
    .filter((p) => !category || p.category === category)
    .filter((p) => (budget ? p.price <= budget : true))
    .sort((a, b) => a.price - b.price);

  if (!matches.length) {
    if (category === "headphones") {
      return "I couldn’t find a strong match under that budget right now, but for headphones I’d prioritize noise cancellation, comfort, and battery life.";
    }
    if (category === "laptops") {
      return "I couldn’t find a strong match under that budget right now, but for laptops I’d prioritize CPU, RAM, storage, and battery life.";
    }
    return "Tell me the product type and budget, and I’ll recommend a few specific options.";
  }

  const picks = matches
    .slice(0, 3)
    .map((p) => `${p.name} ($${p.price}): ${p.description}`)
    .join("\n");

  if (category === "headphones") {
    return `Here are a few headphone options I’d suggest:\n${picks}\n\nIf comfort is your top priority, I’d start with the Bose QuietComfort Headphones. If value matters most, the Anker Soundcore Space One is a strong pick.`;
  }

  if (category === "laptops") {
    return `Here are a few laptop options I’d suggest:\n${picks}\n\nIf portability matters most, I’d start with the MacBook Air M3. If you want a premium Windows option, the Dell XPS 13 is a strong pick.`;
  }

  return `Here are a few options I’d suggest:\n${picks}\n\nTell me which category matters most and I can narrow it down further.`;
}