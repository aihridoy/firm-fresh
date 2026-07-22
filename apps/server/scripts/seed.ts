import "dotenv/config";
import { connectDB } from "../utils/db";
import { User } from "../models/userModel";
import { Product, ProductCategory, ProductUnit, ProductFeature, ProductImage } from "../models/productModel";
import { Order, generateOrderNumber } from "../models/orderModel";
import { Review } from "../models/reviewModel";
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
    profilePicture: "https://images.unsplash.com/photo-1559884743-74a57598c6c7?w=600&auto=format&fit=crop",
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
    profilePicture: "https://images.unsplash.com/photo-1622182605529-ee049ded8c82?w=600&auto=format&fit=crop",
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
    profilePicture: "https://images.unsplash.com/photo-1545830790-68595959c491?w=600&auto=format&fit=crop",
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
    profilePicture: "https://images.unsplash.com/photo-1628477116196-48afe0d209e0?w=600&auto=format&fit=crop",
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
    profilePicture: "https://images.unsplash.com/photo-1528693404014-b13ebe6e723e?w=600&auto=format&fit=crop",
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
    profilePicture: "https://images.unsplash.com/photo-1707811179851-c1f93698ad46?w=600&auto=format&fit=crop",
    farmerDetails: { farmName: "Akter Herb Garden", specialization: "vegetables", farmSize: { value: 2, unit: "acres" } },
  },
];

const img = (id: string, alt: string) => ({ url: `https://images.unsplash.com/${id}?w=800&auto=format&fit=crop`, alt });

const admin = {
  userType: "admin" as const,
  firstName: "Admin",
  lastName: "User",
  email: "aihridoy976@gmail.com",
  phone: "01700000000",
  address: "Dhaka, Bangladesh",
  password: "Ash@358241",
};

const customers = [
  {
    userType: "customer" as const,
    firstName: "Tanvir",
    lastName: "Ahmed",
    email: "tanvir.ahmed@farmfresh.test",
    phone: "01712000001",
    address: "Dhanmondi, Dhaka",
    password: "Password123!",
  },
  {
    userType: "customer" as const,
    firstName: "Sadia",
    lastName: "Islam",
    email: "sadia.islam@farmfresh.test",
    phone: "01712000002",
    address: "Agrabad, Chattogram",
    password: "Password123!",
  },
  {
    userType: "customer" as const,
    firstName: "Rakib",
    lastName: "Hossain",
    email: "rakib.hossain@farmfresh.test",
    phone: "01712000003",
    address: "Zindabazar, Sylhet",
    password: "Password123!",
  },
  {
    userType: "customer" as const,
    firstName: "Fatema",
    lastName: "Sultana",
    email: "fatema.sultana@farmfresh.test",
    phone: "01712000004",
    address: "Sonadanga, Khulna",
    password: "Password123!",
  },
];

// { customer: index into customers, rating, comment } grouped by product name
const reviewsByProduct: Record<string, { customer: number; rating: number; comment: string }[]> = {
  "Fresh Begun (Eggplant)": [
    { customer: 0, rating: 5, comment: "Made begun bhorta the same evening — glossy skin, no seeds gone bitter. Genuinely farm fresh." },
    { customer: 1, rating: 4, comment: "Firm and fresh, fried up beautifully for begun bhaja. One piece was a bit small, otherwise great." },
  ],
  "Shosha (Cucumber)": [
    { customer: 2, rating: 5, comment: "Crunchy and sweet, perfect for salad during iftar. No wax coating like the market ones." },
    { customer: 3, rating: 4, comment: "Very crisp cucumbers, stayed fresh in the fridge for a week." },
  ],
  "Lau (Bottle Gourd)": [
    { customer: 1, rating: 5, comment: "Tender lau, cooked into lau chingri — melted in the mouth. Will order again." },
    { customer: 2, rating: 4, comment: "Good size and fresh. Skin was thin, which is how you know it was picked young." },
  ],
  "Himsagar Mango": [
    { customer: 0, rating: 5, comment: "Real Himsagar from Rajshahi — fiberless, honey-sweet, exactly like childhood summers." },
    { customer: 2, rating: 5, comment: "Best mangoes I've bought online. Ripened perfectly in two days on the counter." },
    { customer: 3, rating: 4, comment: "Sweet and juicy. A couple were slightly bruised in delivery but the taste made up for it." },
  ],
  "Kathal (Jackfruit)": [
    { customer: 1, rating: 4, comment: "Huge jackfruit, sweet bulbs. Took effort to cut but worth every bit." },
    { customer: 3, rating: 5, comment: "Perfectly ripe, the smell filled the whole house. Family finished it in one sitting." },
  ],
  "Malta Orange": [
    { customer: 0, rating: 4, comment: "Juicy and tangy-sweet. Better than imported oranges and cheaper too." },
    { customer: 1, rating: 5, comment: "Fresh maltas with real flavour. Kids loved the juice." },
  ],
  "Chinigura Rice": [
    { customer: 2, rating: 5, comment: "The aroma while cooking polao was incredible. Clean, stone-free, premium quality." },
    { customer: 0, rating: 5, comment: "Authentic chinigura — small grain, big fragrance. Made perfect morog polao for Eid." },
  ],
  "Boro Rice": [
    { customer: 3, rating: 4, comment: "Good everyday rice at a fair price. Cooks soft and doesn't stick." },
    { customer: 1, rating: 4, comment: "Fresh milling makes a difference — you can smell it. Solid value for daily meals." },
  ],
  "Khejur Gurer Doi (Date Jaggery Yogurt)": [
    { customer: 0, rating: 5, comment: "Tastes exactly like Bogura doi from my nana's house. The date jaggery flavour is deep and real." },
    { customer: 3, rating: 5, comment: "Thick, creamy, not overly sweet. Ordered twice already." },
  ],
  "Pure Cow Ghee": [
    { customer: 1, rating: 5, comment: "The smell when it hits hot rice — nothing compares. Pure, grainy, golden ghee." },
    { customer: 2, rating: 4, comment: "Rich and aromatic. Slightly pricey but clearly the real thing, not vanaspati blend." },
  ],
  "Sundarban Wild Honey": [
    { customer: 0, rating: 5, comment: "Dark, smoky, floral — real mawali-collected honey. Crystallized naturally which proves it's raw." },
    { customer: 1, rating: 5, comment: "You can taste the mangrove wildness in it. Worth every taka." },
    { customer: 3, rating: 4, comment: "Genuine wild honey. Thinner than farmed honey as expected, wonderful flavour." },
  ],
  "Litchi Blossom Honey": [
    { customer: 2, rating: 5, comment: "Light, fruity, with a clear litchi note. My morning tea upgrade." },
    { customer: 3, rating: 4, comment: "Delicate flavour, great on paratha. Jar arrived well packed." },
  ],
  "Dhonepata (Coriander Leaves)": [
    { customer: 1, rating: 5, comment: "Fragrant bunches, not wilted at all. Chopped over dal — instant freshness." },
    { customer: 0, rating: 4, comment: "Fresh and aromatic. Bundle size is generous for the price." },
  ],
  "Pudina Pata (Mint Leaves)": [
    { customer: 3, rating: 5, comment: "Strong aroma, made excellent pudina chutney and borhani." },
    { customer: 2, rating: 4, comment: "Fresh mint, kept well in water for days. Great with fuchka!" },
  ],
  "Kacha Morich (Green Chili)": [
    { customer: 0, rating: 5, comment: "Properly hot! These are real deshi morich, not the mild hybrid ones." },
    { customer: 2, rating: 4, comment: "Fresh and fiery. A little goes a long way." },
  ],
};

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
      images: [
        img("photo-1613881553903-4543f5f2cac9", "Eggplants growing on the plant"),
        img("photo-1683543122945-513029986574", "Pile of fresh purple eggplants"),
        img("photo-1528826007177-f38517ce9a8a", "Single glossy purple eggplant"),
        img("photo-1533213520888-6aa83d71cc24", "Four purple eggplants laid flat"),
        img("photo-1528825950832-560a4a11473a", "Eggplant against a white background"),
      ],
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
      images: [
        img("photo-1449300079323-02e209d9d3a6", "Pile of fresh cucumbers"),
        img("photo-1568584711271-6c929fb49b60", "Fresh green cucumbers"),
        img("photo-1589621316382-008455b857cd", "Sliced cucumber on white surface"),
        img("photo-1462536738427-0725f3eb98f7", "Cucumbers on a wooden table"),
        img("photo-1566486189376-d5f21e25aae4", "Flat-lay of small green cucumbers"),
      ],
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
      images: [
        img("photo-1730127487636-b7fe550af030", "Bottle gourd hanging on the vine"),
        img("photo-1762176189281-05ac6090efdd", "Light green bottle gourd on the tree"),
        img("photo-1763304407641-42745b4f024a", "Single green gourd hanging from a vine"),
        img("photo-1615485499978-1279c3d6302f", "Pale green bottle gourd on white background"),
        img("photo-1776653097091-47334b767dfa", "Gourds hanging on a garden fence"),
      ],
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
      images: [
        img("photo-1553279768-865429fa0078", "Ripe yellow mango"),
        img("photo-1757281096599-b9165ba74008", "Pile of ripe mangoes"),
        img("photo-1519096845289-95806ee03a1a", "Bowl full of ripe mangoes"),
        img("photo-1744035355878-222dc04f79f5", "Mango close-up over a pile of mangoes"),
        img("photo-1622955658214-d05c1c6fcf84", "Mangoes ripening on the tree"),
      ],
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
      images: [
        img("photo-1569294860071-b2ac12ee73b7", "Jackfruits growing on the tree"),
        img("photo-1693838310776-eaca5013b8ec", "Jackfruit hanging from a tree in the forest"),
        img("photo-1620685581318-91ce6f1b76ca", "Close-up of green jackfruit skin"),
        img("photo-1596626233681-39f5eb87d501", "Jackfruits hanging from the trunk"),
        img("photo-1593441040270-7e4a9f75091e", "Cluster of young jackfruits"),
      ],
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
      images: [
        img("photo-1547514701-42782101795e", "Fresh oranges with leaves"),
        img("photo-1514936477380-5ea603b9a1ca", "Bunch of fresh oranges"),
        img("photo-1579169326371-ccb4e63f7889", "Oranges ripening on the tree"),
        img("photo-1611080626919-7cf5a9dbab5b", "Oranges on a ceramic plate"),
        img("photo-1560607162-26b0344e6943", "Close-up of oranges in a bowl"),
      ],
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
      images: [
        img("photo-1586201375761-83865001e31c", "Uncooked aromatic rice grains"),
        img("photo-1686820740687-426a7b9b2043", "Pile of white rice grains"),
        img("photo-1536153635972-1fc2e818f642", "Unhusked rice in a wicker basket"),
        img("photo-1711060266983-92bd378c850c", "Scooping rice from a basket"),
        img("photo-1723475158232-819e29803f4d", "Cooked fragrant rice"),
      ],
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
      images: [
        img("photo-1592997572594-34be01bc36c7", "Rice paddy ready for harvest"),
        img("photo-1561504935-4e7d4516a2d1", "Close-up of rice stalks in the field"),
        img("photo-1558388556-2261d4cc1938", "Aerial view of rice fields"),
        img("photo-1704972269889-f0fdd7f0e7c3", "Baskets filled with milled rice"),
        img("photo-1711060221380-acfa2c82cc99", "Hands holding fresh rice grains"),
      ],
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
      images: [
        img("photo-1488477181946-6428a0291777", "Jars of fresh yogurt"),
        img("photo-1571212515416-fef01fc43637", "Bowl of creamy yogurt with mint garnish"),
        img("photo-1633893215271-f7e1fca081ad", "Whipped yogurt in a glass bowl"),
        img("photo-1649118173382-dad295004282", "Yogurt jar with fruit topping"),
        img("photo-1670843839025-d50924a51f31", "Yogurt bowl topped with strawberries"),
      ],
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
      images: [
        img("photo-1589985270826-4b7bb135bc9d", "Block of pure ghee butter"),
        img("photo-1573812461383-e5f8b759d12e", "Jar of ghee with a wooden spoon"),
        img("photo-1601232265936-6da280cff563", "Golden ghee in a glass jar"),
        img("photo-1633940125832-033d739b3d45", "Melted ghee in a pan with spoon"),
        img("photo-1624251526069-e8677ce6831f", "Clarified butter in a sealed jar"),
      ],
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
        img("photo-1644221362202-2e3e6b01d717", "Honey jar with honeycomb inside"),
        img("photo-1671548185843-3f50c6c1060b", "Rows of honey jars on a shelf"),
        img("photo-1692624569328-5fbb7a0c0d5d", "Hand holding a jar of raw honey"),
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
      images: [
        img("photo-1642067958050-bfba120a57e2", "Honeycomb filled with honey"),
        img("photo-1642067958024-1a2d9f836920", "Close-up of golden honeycombs"),
        img("photo-1718146921295-700b969e7c78", "Honey dripping onto a honeycomb"),
        img("photo-1577095870693-360d002ad341", "Bee on a honey-filled comb"),
        img("photo-1647427062468-74ff21e8934f", "Bees working on the beehive"),
      ],
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
      images: [
        img("photo-1776089770931-e422e57f760c", "Fresh coriander leaves"),
        img("photo-1767156969831-0beee76fa958", "Cilantro leaves in sunlight"),
        img("photo-1601493700603-43461216807a", "Coriander leaves close-up"),
        img("photo-1723810330043-dd05647294cb", "Bunch of green coriander"),
        img("photo-1767158615608-302f06fd3371", "Bowl of freshly cut coriander"),
      ],
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
      images: [
        img("photo-1628556270448-4d4e4148e1b1", "Fresh mint sprigs in a jar"),
        img("photo-1618130070080-91f4d55a2383", "Mint leaves in the garden"),
        img("photo-1603109731710-dba41b1096a7", "Mint leaves with water droplets"),
        img("photo-1588908933351-eeb8cd4c4521", "Mint plant in a pot"),
        img("photo-1622576454275-729fbf6aa6eb", "Macro shot of mint leaves"),
      ],
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
      images: [
        img("photo-1576763595295-c0371a32af78", "Pile of fresh green chilies"),
        img("photo-1772358292459-f9b25c0c98a7", "Green chili growing on the plant"),
        img("photo-1693664132282-29467c147940", "Green chilies on a table"),
        img("photo-1613750406907-619c9c484fe3", "Small green chilies on leaves"),
        img("photo-1504394448285-7adeab975d7d", "Macro shot of slim green chilies"),
      ],
      features: ["fresh", "local", "pesticide-free"],
      farmLocation: "Comilla, Chattogram Division",
    },
  ],
};

async function seed() {
  await connectDB();

  console.log("Clearing existing seed data...");
  const seedEmails = [...farmers.map((f) => f.email), ...customers.map((c) => c.email), admin.email];
  const oldSeedUsers = await User.find({ email: { $in: seedEmails } }, "_id");
  await Order.deleteMany({ user: { $in: oldSeedUsers.map((u) => u._id) } });
  await Review.deleteMany({}); // reviews reference reseeded products, so clear all
  await Product.deleteMany({});
  await User.deleteMany({ email: { $in: seedEmails } });

  console.log("Creating admin...");
  await User.create(admin);

  console.log("Creating farmers...");
  const createdFarmers = [];
  for (const farmer of farmers) {
    const user = await User.create(farmer);
    createdFarmers.push(user);
  }

  console.log("Creating products...");
  let count = 0;
  const productsByName: Record<string, InstanceType<typeof Product>> = {};
  for (let i = 0; i < createdFarmers.length; i++) {
    const batch = productsByFarmerIndex[i] || [];
    for (const product of batch) {
      const created = await Product.create({ ...product, farmer: createdFarmers[i]._id });
      productsByName[product.name] = created;
      count++;
    }
  }

  console.log("Creating customers...");
  const createdCustomers = [];
  for (const customer of customers) {
    createdCustomers.push(await User.create(customer));
  }

  console.log("Creating orders and reviews...");
  // One delivered order per customer covering the products they review,
  // since a review must reference a delivered order (unique per user+product).
  let reviewCount = 0;
  for (let c = 0; c < createdCustomers.length; c++) {
    const customer = createdCustomers[c];
    const reviewed = Object.entries(reviewsByProduct)
      .filter(([, reviews]) => reviews.some((r) => r.customer === c))
      .map(([name]) => productsByName[name])
      .filter(Boolean);
    if (reviewed.length === 0) continue;

    const items = reviewed.map((p) => ({
      product: p._id,
      productName: p.name,
      productImage: p.images[0]?.url ?? "",
      farmer: p.farmer,
      price: p.price,
      quantity: 1,
      unit: p.unit,
    }));
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const order = await Order.create({
      user: customer._id,
      orderNumber: generateOrderNumber(),
      items,
      deliveryAddress: customers[c].address,
      status: "delivered",
      paymentMethod: "bkash",
      subtotal,
      deliveryFee: 50,
      serviceFee: 25,
      totalAmount: subtotal + 75,
    });

    for (const [name, reviews] of Object.entries(reviewsByProduct)) {
      const product = productsByName[name];
      if (!product) continue;
      for (const review of reviews) {
        if (review.customer !== c) continue;
        await Review.create({
          user: customer._id,
          product: product._id,
          order: order._id,
          rating: review.rating,
          comment: review.comment,
        });
        reviewCount++;
      }
    }
  }

  console.log(
    `Seeded ${createdFarmers.length} farmers, ${createdCustomers.length} customers, ${count} products, ${reviewCount} reviews.`
  );
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
