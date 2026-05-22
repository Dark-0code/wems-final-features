const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const prices = [
  // METALS
  { category: "metal", material: "Copper Wire (clean)", minPrice: 10000, maxPrice: 13000, unit: "kg", grade: "Grade A", notes: "Most valuable scrap metal. Clean, stripped wire commands top price." },
  { category: "metal", material: "Copper (mixed/dirty)", minPrice: 7000, maxPrice: 9000, unit: "kg", grade: "Mixed", notes: "Lower value due to insulation or impurities." },
  { category: "metal", material: "Brass", minPrice: 3500, maxPrice: 5000, unit: "kg", grade: "Mixed", notes: "Taps, fittings, shells, and fixtures." },
  { category: "metal", material: "Aluminium (thick/vehicle)", minPrice: 1800, maxPrice: 3000, unit: "kg", grade: "Grade A", notes: "Engine blocks, vehicle parts, thick sheets." },
  { category: "metal", material: "Aluminium (roofing/thin)", minPrice: 800, maxPrice: 1200, unit: "kg", grade: "Grade B", notes: "Roofing sheets, window profiles, light extrusions." },
  { category: "metal", material: "Aluminium Cans", minPrice: 500, maxPrice: 900, unit: "kg", grade: "Mixed", notes: "Used beverage cans. Clean and crushed preferred." },
  { category: "metal", material: "Stainless Steel", minPrice: 800, maxPrice: 1500, unit: "kg", grade: "Mixed", notes: "Kitchen equipment, industrial fittings." },
  { category: "metal", material: "Iron / Mild Steel", minPrice: 400, maxPrice: 600, unit: "kg", grade: "Mixed", notes: "Most common scrap. Rebar, pipes, machinery parts." },
  { category: "metal", material: "Lead (battery plates)", minPrice: 500, maxPrice: 800, unit: "kg", grade: "Mixed", notes: "Car battery terminals and plates." },
  { category: "metal", material: "Zinc (roofing sheets)", minPrice: 600, maxPrice: 1000, unit: "kg", grade: "Mixed", notes: "Old corrugated zinc roofing sheets." },

  // PLASTICS
  { category: "plastic", material: "PET Bottles (clear/white)", minPrice: 400, maxPrice: 600, unit: "kg", grade: "Grade A", notes: "Water and soda bottles. White/clear fetch the highest price." },
  { category: "plastic", material: "PET Bottles (coloured)", minPrice: 200, maxPrice: 350, unit: "kg", grade: "Grade B", notes: "Green, brown or dark bottles. Lower value than clear." },
  { category: "plastic", material: "HDPE (jerry cans/drums)", minPrice: 300, maxPrice: 500, unit: "kg", grade: "Mixed", notes: "Detergent containers, shampoo bottles, cooking oil cans." },
  { category: "plastic", material: "PP (Polypropylene)", minPrice: 250, maxPrice: 400, unit: "kg", grade: "Mixed", notes: "Plastic chairs, buckets, bottle caps, takeaway bowls." },
  { category: "plastic", material: "LDPE (nylon bags/film)", minPrice: 150, maxPrice: 250, unit: "kg", grade: "Mixed", notes: "Thin plastic bags, agricultural films, wrapping." },
  { category: "plastic", material: "PVC Pipes/Fittings", minPrice: 100, maxPrice: 200, unit: "kg", grade: "Mixed", notes: "Old plumbing pipes and fittings." },
  { category: "plastic", material: "Mixed/Unsorted Plastic", minPrice: 80, maxPrice: 150, unit: "kg", grade: "Low", notes: "Unsorted mix. Sorting and cleaning increases value significantly." },

  // PAPER
  { category: "paper", material: "OCC Corrugated Cardboard", minPrice: 80, maxPrice: 150, unit: "kg", grade: "Mixed", notes: "Cartons and packaging boxes. Keep dry for best price." },
  { category: "paper", material: "White Office Paper", minPrice: 100, maxPrice: 180, unit: "kg", grade: "Grade A", notes: "Clean, sorted office paper. No food contamination." },
  { category: "paper", material: "Newspapers / Magazines", minPrice: 50, maxPrice: 100, unit: "kg", grade: "Mixed", notes: "Lower grade newsprint. Bulk quantities preferred." },
  { category: "paper", material: "Mixed Paper (unsorted)", minPrice: 40, maxPrice: 80, unit: "kg", grade: "Low", notes: "All paper types mixed. Sorting raises value." },
  { category: "paper", material: "Books / Jotters", minPrice: 60, maxPrice: 120, unit: "kg", grade: "Mixed", notes: "Depends on paper weight and quality." },

  // GLASS
  { category: "glass", material: "Clear Glass Bottles", minPrice: 30, maxPrice: 60, unit: "kg", grade: "Grade A", notes: "Beer and water bottles. Clean and unbroken preferred." },
  { category: "glass", material: "Coloured Glass Bottles", minPrice: 20, maxPrice: 50, unit: "kg", grade: "Grade B", notes: "Brown or green glass bottles." },
  { category: "glass", material: "Broken Glass (cullet)", minPrice: 15, maxPrice: 40, unit: "kg", grade: "Low", notes: "Shattered glass for glass manufacturer remelt." },

  // ELECTRONICS
  { category: "electronics", material: "Copper Cables / Wires", minPrice: 3000, maxPrice: 8000, unit: "kg", grade: "Grade A", notes: "Most valuable e-waste component. Clean stripped cables best." },
  { category: "electronics", material: "Circuit Boards (PCB)", minPrice: 2000, maxPrice: 5000, unit: "kg", grade: "Mixed", notes: "Contains gold, silver, copper traces. High value." },
  { category: "electronics", material: "Old Computers / Laptops", minPrice: 3000, maxPrice: 8000, unit: "unit", grade: "Mixed", notes: "Priced per unit. Working units may fetch more." },
  { category: "electronics", material: "Dead Smartphones", minPrice: 500, maxPrice: 2000, unit: "unit", grade: "Mixed", notes: "Circuit boards contain valuable metals." },
  { category: "electronics", material: "Old TVs (CRT)", minPrice: 500, maxPrice: 1500, unit: "unit", grade: "Mixed", notes: "Heavy and complex. Lead-containing glass requires care." },
  { category: "electronics", material: "Batteries (Li-ion)", minPrice: 300, maxPrice: 800, unit: "unit", grade: "Mixed", notes: "EV market driving demand up. Handle with care." },
  { category: "electronics", material: "Refrigerators / Freezers", minPrice: 5000, maxPrice: 15000, unit: "unit", grade: "Mixed", notes: "Compressor and copper coils are the main value." },

  // TEXTILE
  { category: "textile", material: "Used Clothing (clean)", minPrice: 300, maxPrice: 600, unit: "kg", grade: "Grade A", notes: "For Okrika resale markets. Clean, sorted clothing." },
  { category: "textile", material: "Cotton Rags / Offcuts", minPrice: 150, maxPrice: 300, unit: "kg", grade: "Mixed", notes: "Industrial wiping rags and factory offcuts." },
  { category: "textile", material: "Mixed Fabric Scraps", minPrice: 80, maxPrice: 180, unit: "kg", grade: "Low", notes: "Tailor waste and unsorted fabric pieces." },

  // RUBBER
  { category: "rubber", material: "Used Tyres (whole)", minPrice: 500, maxPrice: 1500, unit: "unit", grade: "Mixed", notes: "Priced per tyre. Suitable for retreading or rubber crumbing." },
  { category: "rubber", material: "Rubber Crumbs / Powder", minPrice: 200, maxPrice: 400, unit: "kg", grade: "Processed", notes: "Shredded tyre rubber for construction and sports surfaces." },
  { category: "rubber", material: "Natural Rubber Scraps", minPrice: 300, maxPrice: 700, unit: "kg", grade: "Mixed", notes: "Factory offcuts and natural latex waste." },
];

async function main() {
  console.log("Seeding price guide...");

  // Clear existing prices
  await prisma.priceGuide.deleteMany();

  // Insert all
  for (const price of prices) {
    await prisma.priceGuide.create({ data: price });
  }

  console.log(`✅ Seeded ${prices.length} price entries`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
