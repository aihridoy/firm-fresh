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
      images: [img("photo-1613881553903-4543f5f2cac9", "Eggplants growing on the plant")],
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
      images: [img("photo-1449300079323-02e209d9d3a6", "Pile of fresh cucumbers")],
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
      images: [img("photo-1730127487636-b7fe550af030", "Bottle gourd hanging on the vine")],
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
      images: [img("photo-1553279768-865429fa0078", "Ripe yellow mango"), img("photo-1757281096599-b9165ba74008", "Pile of ripe mangoes")],
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
      images: [img("photo-1569294860071-b2ac12ee73b7", "Jackfruits growing on the tree")],
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
      images: [img("photo-1547514701-42782101795e", "Fresh oranges with leaves")],
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
      images: [img("photo-1586201375761-83865001e31c", "Uncooked aromatic rice grains")],
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
      images: [img("photo-1592997572594-34be01bc36c7", "Rice paddy ready for harvest")],
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
      images: [img("photo-1488477181946-6428a0291777", "Jars of fresh yogurt")],
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
      images: [img("photo-1589985270826-4b7bb135bc9d", "Block of pure ghee butter")],
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
        img("photo-1558642452-9d2a7deb7f62", "Honey dripping from a dipper into a jar"),
        img("photo-1471943311424-646960669fbc", "Jar of raw wild honey"),
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
      images: [img("photo-1642067958050-bfba120a57e2", "Honeycomb filled with honey")],
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
      images: [img("photo-1776089770931-e422e57f760c", "Fresh coriander leaves")],
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
      images: [img("photo-1628556270448-4d4e4148e1b1", "Fresh mint sprigs in a jar")],
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
      images: [img("photo-1576763595295-c0371a32af78", "Pile of fresh green chilies")],
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
