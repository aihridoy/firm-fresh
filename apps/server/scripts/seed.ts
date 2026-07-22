import "dotenv/config";
import { connectDB } from "../utils/db";
import { User } from "../models/userModel";
import { Product, ProductCategory, ProductUnit, ProductFeature, ProductImage } from "../models/productModel";
import mongoose from "mongoose";

interface SeedProduct {
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  unit: ProductUnit;
  stock: number;
  images: ProductImage[];
  features: ProductFeature[];
  farmLocation: string;
  harvestDate?: Date;
}

const farmers = [
  {
    userType: "farmer" as const,
    firstName: "Abdul",
    lastName: "Karim",
    email: "abdul.karim@farmfresh.test",
    phone: "01711000001",
    address: "Bogura, Rajshahi Division",
    password: "Password123!",
    farmerDetails: { farmName: "Karim Agro Farm", specialization: "vegetables", farmSize: { value: 12, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Rahima",
    lastName: "Begum",
    email: "rahima.begum@farmfresh.test",
    phone: "01711000002",
    address: "Rangpur, Rangpur Division",
    password: "Password123!",
    farmerDetails: { farmName: "Rahima Orchard", specialization: "fruits", farmSize: { value: 8, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Motiur",
    lastName: "Rahman",
    email: "motiur.rahman@farmfresh.test",
    phone: "01711000003",
    address: "Jessore, Khulna Division",
    password: "Password123!",
    farmerDetails: { farmName: "Rahman Rice Mills", specialization: "grains", farmSize: { value: 25, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Salma",
    lastName: "Khatun",
    email: "salma.khatun@farmfresh.test",
    phone: "01711000004",
    address: "Pabna, Rajshahi Division",
    password: "Password123!",
    farmerDetails: { farmName: "Khatun Dairy", specialization: "dairy", farmSize: { value: 5, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Jashim",
    lastName: "Uddin",
    email: "jashim.uddin@farmfresh.test",
    phone: "01711000005",
    address: "Khulna, Khulna Division",
    password: "Password123!",
    farmerDetails: { farmName: "Sundarban Apiary", specialization: "mixed", farmSize: { value: 3, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Nasrin",
    lastName: "Akter",
    email: "nasrin.akter@farmfresh.test",
    phone: "01711000006",
    address: "Comilla, Chattogram Division",
    password: "Password123!",
    farmerDetails: { farmName: "Akter Herb Garden", specialization: "vegetables", farmSize: { value: 2, unit: "acres" } },
  },
];

const img = (id: string, alt: string) => ({ url: `https://images.unsplash.com/${id}?w=800&auto=format&fit=crop`, alt });

// farmer array index -> product batch (assigned after farmers are inserted, by index)
const productsByFarmerIndex: Record<number, SeedProduct[]> = {
  0: [
    {
      name: "Fresh Begun (Eggplant)",
      description: "Locally grown eggplant, harvested weekly from Bogura fields. Firm, glossy skin, great for bhorta.",
      category: "vegetables",
      price: 60,
      unit: "kg",
      stock: 150,
      images: [img("photo-1518977676601-b53f82aba655", "Fresh eggplants in a basket")],
      features: ["fresh", "local", "pesticide-free"],
      farmLocation: "Bogura, Rajshahi Division",
    },
    {
      name: "Shosha (Cucumber)",
      description: "Crisp, farm-fresh cucumbers grown without chemical pesticides.",
      category: "vegetables",
      price: 45,
      unit: "kg",
      stock: 200,
      images: [img("photo-1567306301408-9b74779a11af", "Fresh cucumbers")],
      features: ["fresh", "organic", "local"],
      farmLocation: "Bogura, Rajshahi Division",
    },
    {
      name: "Lau (Bottle Gourd)",
      description: "Large, tender bottle gourds picked at peak freshness.",
      category: "vegetables",
      price: 40,
      unit: "piece",
      stock: 80,
      images: [img("photo-1622206151226-18ca2c9ab4a1", "Bottle gourd on a farm table")],
      features: ["fresh", "local"],
      farmLocation: "Bogura, Rajshahi Division",
    },
  ],
  1: [
    {
      name: "Himsagar Mango",
      description: "Sweet, fiberless Himsagar mangoes from Rajshahi region orchards — a Bangladeshi favorite.",
      category: "fruits",
      price: 180,
      unit: "kg",
      stock: 300,
      images: [img("photo-1610832958506-aa56368176cf", "Ripe mangoes"), img("photo-1595475207225-428b62bda831", "Mango close-up")],
      features: ["fresh", "local", "sustainable"],
      farmLocation: "Rangpur, Rangpur Division",
      harvestDate: new Date("2026-06-01"),
    },
    {
      name: "Kathal (Jackfruit)",
      description: "Bangladesh's national fruit — whole ripe jackfruit, naturally sweet.",
      category: "fruits",
      price: 250,
      unit: "piece",
      stock: 40,
      images: [img("photo-1587735243615-c03f25aaff15", "Whole jackfruit")],
      features: ["local"],
      farmLocation: "Rangpur, Rangpur Division",
    },
    {
      name: "Malta Orange",
      description: "Juicy, tangy-sweet Malta oranges grown in northern Bangladesh.",
      category: "fruits",
      price: 200,
      unit: "kg",
      stock: 120,
      images: [img("photo-1518977956812-cd3dbadaaf31", "Fresh oranges")],
      features: ["fresh", "local"],
      farmLocation: "Rangpur, Rangpur Division",
    },
  ],
  2: [
    {
      name: "Chinigura Rice",
      description: "Premium aromatic Chinigura rice, stone-free and hand-sorted.",
      category: "grains",
      price: 140,
      unit: "kg",
      stock: 500,
      images: [img("photo-1586201375761-83865001e31c", "Bowl of rice")],
      features: ["local", "non-gmo"],
      farmLocation: "Jessore, Khulna Division",
    },
    {
      name: "Boro Rice",
      description: "High-yield Boro season rice, milled fresh to order.",
      category: "grains",
      price: 60,
      unit: "kg",
      stock: 800,
      images: [img("photo-1610348725531-843dff563e2c", "Rice grains close-up")],
      features: ["local"],
      farmLocation: "Jessore, Khulna Division",
    },
  ],
  3: [
    {
      name: "Khejur Gurer Doi (Date Jaggery Yogurt)",
      description: "Traditional yogurt sweetened with date palm jaggery, made fresh daily.",
      category: "dairy",
      price: 90,
      unit: "kg",
      stock: 60,
      images: [img("photo-1571115177098-24ec42ed204d", "Bowl of yogurt")],
      features: ["fresh", "local"],
      farmLocation: "Pabna, Rajshahi Division",
    },
    {
      name: "Pure Cow Ghee",
      description: "Slow-clarified cow ghee from grass-fed cattle.",
      category: "dairy",
      price: 900,
      unit: "kg",
      stock: 40,
      images: [img("photo-1596040033229-a9821ebd058d", "Ghee in a jar")],
      features: ["organic", "local", "fresh"],
      farmLocation: "Pabna, Rajshahi Division",
    },
  ],
  4: [
    {
      name: "Sundarban Wild Honey",
      description: "Raw, unprocessed honey collected by traditional mawalis from the Sundarbans mangrove forest.",
      category: "honey",
      price: 1200,
      unit: "kg",
      stock: 70,
      images: [
        img("photo-1587049352846-4a222e784d38", "Jar of raw honey"),
        img("photo-1587049633312-d628ae50a8ae", "Honey dripping from a spoon"),
      ],
      features: ["organic", "sustainable", "fair-trade"],
      farmLocation: "Khulna, Khulna Division",
    },
    {
      name: "Litchi Blossom Honey",
      description: "Seasonal honey harvested from litchi orchards during blossom season.",
      category: "honey",
      price: 1000,
      unit: "kg",
      stock: 50,
      images: [img("photo-1610397648930-477b8c7f0943", "Honeycomb and honey jar")],
      features: ["organic", "local"],
      farmLocation: "Khulna, Khulna Division",
    },
  ],
  5: [
    {
      name: "Dhonepata (Coriander Leaves)",
      description: "Bunches of fragrant, freshly cut coriander leaves.",
      category: "herbs",
      price: 20,
      unit: "bundle",
      stock: 250,
      images: [img("photo-1615485500704-8e990f9900f7", "Fresh coriander leaves")],
      features: ["fresh", "organic", "local"],
      farmLocation: "Comilla, Chattogram Division",
    },
    {
      name: "Pudina Pata (Mint Leaves)",
      description: "Aromatic mint leaves, hand-picked each morning.",
      category: "herbs",
      price: 25,
      unit: "bundle",
      stock: 180,
      images: [img("photo-1601493700631-2b16ec4b4716", "Fresh mint leaves")],
      features: ["fresh", "organic", "local"],
      farmLocation: "Comilla, Chattogram Division",
    },
    {
      name: "Kacha Morich (Green Chili)",
      description: "Spicy green chilies picked fresh, sold by the bundle.",
      category: "herbs",
      price: 80,
      unit: "kg",
      stock: 300,
      images: [img("photo-1580910051074-3eb694886505", "Green chilies")],
      features: ["fresh", "local", "pesticide-free"],
      farmLocation: "Comilla, Chattogram Division",
    },
  ],
};

async function seed() {
  await connectDB();

  console.log("Clearing existing seed data...");
  await Product.deleteMany({});
  await User.deleteMany({ email: { $in: farmers.map((f) => f.email) } });

  console.log("Creating farmers...");
  const createdFarmers = [];
  for (const farmer of farmers) {
    const user = await User.create(farmer);
    createdFarmers.push(user);
  }

  console.log("Creating products...");
  let count = 0;
  for (let i = 0; i < createdFarmers.length; i++) {
    const batch = productsByFarmerIndex[i] || [];
    for (const product of batch) {
      await Product.create({ ...product, farmer: createdFarmers[i]._id });
      count++;
    }
  }

  console.log(`Seeded ${createdFarmers.length} farmers and ${count} products.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
