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
  {
    userType: "farmer" as const,
    firstName: "Kamrul",
    lastName: "Islam",
    email: "kamrul.islam@farmfresh.test",
    phone: "01711000007",
    address: "Sylhet, Sylhet Division",
    password: "Password123!",
    profilePicture: "https://images.unsplash.com/photo-1559884743-74a57598c6c7?w=600&auto=format&fit=crop",
    farmerDetails: { farmName: "Sylhet Herb Valley", specialization: "herbs", farmSize: { value: 4, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Shirin",
    lastName: "Sultana",
    email: "shirin.sultana@farmfresh.test",
    phone: "01711000008",
    address: "Dinajpur, Rangpur Division",
    password: "Password123!",
    profilePicture: "https://images.unsplash.com/photo-1622182605529-ee049ded8c82?w=600&auto=format&fit=crop",
    farmerDetails: { farmName: "Sultana Rice Agro", specialization: "grains", farmSize: { value: 30, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Abul",
    lastName: "Hossain",
    email: "abul.hossain@farmfresh.test",
    phone: "01711000009",
    address: "Rajshahi, Rajshahi Division",
    password: "Password123!",
    profilePicture: "https://images.unsplash.com/photo-1545830790-68595959c491?w=600&auto=format&fit=crop",
    farmerDetails: { farmName: "Hossain Mango Orchard", specialization: "fruits", farmSize: { value: 18, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Momena",
    lastName: "Khatun",
    email: "momena.khatun@farmfresh.test",
    phone: "01711000010",
    address: "Barisal, Barishal Division",
    password: "Password123!",
    profilePicture: "https://images.unsplash.com/photo-1628477116196-48afe0d209e0?w=600&auto=format&fit=crop",
    farmerDetails: { farmName: "Khatun Green Fields", specialization: "vegetables", farmSize: { value: 9, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Faruk",
    lastName: "Ahmed",
    email: "faruk.ahmed@farmfresh.test",
    phone: "01711000011",
    address: "Mymensingh, Mymensingh Division",
    password: "Password123!",
    profilePicture: "https://images.unsplash.com/photo-1528693404014-b13ebe6e723e?w=600&auto=format&fit=crop",
    farmerDetails: { farmName: "Ahmed Dairy House", specialization: "dairy", farmSize: { value: 6, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Rokeya",
    lastName: "Begum",
    email: "rokeya.begum@farmfresh.test",
    phone: "01711000012",
    address: "Gazipur, Dhaka Division",
    password: "Password123!",
    profilePicture: "https://images.unsplash.com/photo-1707811179851-c1f93698ad46?w=600&auto=format&fit=crop",
    farmerDetails: { farmName: "Begum Agro Garden", specialization: "vegetables", farmSize: { value: 7, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Shafiqul",
    lastName: "Alam",
    email: "shafiqul.alam@farmfresh.test",
    phone: "01711000013",
    address: "Tangail, Dhaka Division",
    password: "Password123!",
    profilePicture: "https://images.unsplash.com/photo-1559884743-74a57598c6c7?w=600&auto=format&fit=crop",
    farmerDetails: { farmName: "Alam Bee Farm", specialization: "honey", farmSize: { value: 2, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Nurjahan",
    lastName: "Akhtar",
    email: "nurjahan.akhtar@farmfresh.test",
    phone: "01711000014",
    address: "Faridpur, Dhaka Division",
    password: "Password123!",
    profilePicture: "https://images.unsplash.com/photo-1622182605529-ee049ded8c82?w=600&auto=format&fit=crop",
    farmerDetails: { farmName: "Akhtar Family Farm", specialization: "mixed", farmSize: { value: 14, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Delwar",
    lastName: "Hossain",
    email: "delwar.hossain@farmfresh.test",
    phone: "01711000015",
    address: "Chuadanga, Khulna Division",
    password: "Password123!",
    profilePicture: "https://images.unsplash.com/photo-1545830790-68595959c491?w=600&auto=format&fit=crop",
    farmerDetails: { farmName: "Hossain Grain House", specialization: "grains", farmSize: { value: 22, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Taslima",
    lastName: "Nasrin",
    email: "taslima.nasrin@farmfresh.test",
    phone: "01711000016",
    address: "Natore, Rajshahi Division",
    password: "Password123!",
    profilePicture: "https://images.unsplash.com/photo-1628477116196-48afe0d209e0?w=600&auto=format&fit=crop",
    farmerDetails: { farmName: "Natore Herb Garden", specialization: "herbs", farmSize: { value: 3, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Mizanur",
    lastName: "Rahman",
    email: "mizanur.rahman@farmfresh.test",
    phone: "01711000017",
    address: "Thakurgaon, Rangpur Division",
    password: "Password123!",
    profilePicture: "https://images.unsplash.com/photo-1528693404014-b13ebe6e723e?w=600&auto=format&fit=crop",
    farmerDetails: { farmName: "Rahman Fruit Valley", specialization: "fruits", farmSize: { value: 16, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Hasina",
    lastName: "Parvin",
    email: "hasina.parvin@farmfresh.test",
    phone: "01711000018",
    address: "Lalmonirhat, Rangpur Division",
    password: "Password123!",
    profilePicture: "https://images.unsplash.com/photo-1707811179851-c1f93698ad46?w=600&auto=format&fit=crop",
    farmerDetails: { farmName: "Parvin Dairy Farm", specialization: "dairy", farmSize: { value: 5, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Golam",
    lastName: "Mostafa",
    email: "golam.mostafa@farmfresh.test",
    phone: "01711000019",
    address: "Nilphamari, Rangpur Division",
    password: "Password123!",
    profilePicture: "https://images.unsplash.com/photo-1559884743-74a57598c6c7?w=600&auto=format&fit=crop",
    farmerDetails: { farmName: "Mostafa Sobji Khet", specialization: "vegetables", farmSize: { value: 11, unit: "acres" } },
  },
  {
    userType: "farmer" as const,
    firstName: "Ayesha",
    lastName: "Siddika",
    email: "ayesha.siddika@farmfresh.test",
    phone: "01711000020",
    address: "Joypurhat, Rajshahi Division",
    password: "Password123!",
    profilePicture: "https://images.unsplash.com/photo-1622182605529-ee049ded8c82?w=600&auto=format&fit=crop",
    farmerDetails: { farmName: "Siddika Honey House", specialization: "honey", farmSize: { value: 2, unit: "acres" } },
  },
];

const img = (id: string, alt: string) => ({ url: `https://images.unsplash.com/${id}?w=800&auto=format&fit=crop`, alt });

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
  // Additional customers (names + city areas around Bangladesh)
  ...[
    ["Mahmudul", "Hasan", "Uttara, Dhaka"],
    ["Nusrat", "Jahan", "Banani, Dhaka"],
    ["Shakil", "Khan", "Mirpur, Dhaka"],
    ["Farhana", "Akter", "Mohammadpur, Dhaka"],
    ["Imran", "Chowdhury", "Nasirabad, Chattogram"],
    ["Sumaiya", "Rahman", "Khulshi, Chattogram"],
    ["Arif", "Mia", "Shibganj, Sylhet"],
    ["Taslima", "Begum", "Ambarkhana, Sylhet"],
    ["Rasel", "Ahmed", "Boalia, Rajshahi"],
    ["Sharmin", "Sultana", "Motihar, Rajshahi"],
    ["Jubayer", "Islam", "Khalishpur, Khulna"],
    ["Mim", "Akhter", "Daulatpur, Khulna"],
    ["Naim", "Sarkar", "Band Road, Barisal"],
    ["Rifat", "Karim", "Rupatali, Barisal"],
    ["Sabina", "Yasmin", "Shalbagan, Rangpur"],
    ["Tanjil", "Hossain", "Jahaj Company Mor, Rangpur"],
    ["Lamia", "Islam", "Ganginar Par, Mymensingh"],
    ["Fahim", "Rahman", "Choto Bazar, Mymensingh"],
    ["Sadman", "Sakib", "Kandirpar, Cumilla"],
    ["Anika", "Tabassum", "Jhautala, Cumilla"],
    ["Rubel", "Hossain", "College Road, Bogura"],
    ["Mitu", "Khatun", "Sherpur Road, Bogura"],
    ["Asif", "Iqbal", "Pathantula, Sylhet"],
    ["Priya", "Saha", "New Market, Rajshahi"],
    ["Hridoy", "Talukder", "Kotwali, Jessore"],
    ["Jannatul", "Ferdous", "Savar, Dhaka"],
  ].map(([firstName, lastName, address], i) => ({
    userType: "customer" as const,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 5}@farmfresh.test`,
    phone: `017120000${String(i + 5).padStart(2, "0")}`,
    address,
    password: "Password123!",
  })),
];

// Matches the demo-login button in LoginForm
const adminUser = {
  userType: "admin" as const,
  firstName: "Demo",
  lastName: "Admin",
  email: "admin@demo.com",
  phone: "01700000001",
  address: "Dhaka, Bangladesh",
  password: "password123",
  approvalStatus: "approved" as const,
};

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

// ============================================================
// Generated catalog — expands every farmer's batch to 8-15
// products (200+ total) while keeping the hand-written batches
// above (their names are referenced by reviewsByProduct).
// ============================================================

type CatalogItem = { name: string; price: number; unit: ProductUnit };

// Verified-working Unsplash IDs, grouped per category (reused from the
// hand-written products above). Products without a specific image set
// draw from their category pool, rotated so sets differ between items.
const imagePools: Record<ProductCategory, { id: string; alt: string }[]> = {
  vegetables: [
    { id: "photo-1613881553903-4543f5f2cac9", alt: "Fresh vegetables at the farm" },
    { id: "photo-1683543122945-513029986574", alt: "Pile of fresh vegetables" },
    { id: "photo-1528826007177-f38517ce9a8a", alt: "Fresh produce close-up" },
    { id: "photo-1533213520888-6aa83d71cc24", alt: "Vegetables laid flat" },
    { id: "photo-1528825950832-560a4a11473a", alt: "Vegetable on a white background" },
    { id: "photo-1449300079323-02e209d9d3a6", alt: "Pile of green vegetables" },
    { id: "photo-1568584711271-6c929fb49b60", alt: "Fresh green produce" },
    { id: "photo-1589621316382-008455b857cd", alt: "Sliced fresh vegetable" },
    { id: "photo-1462536738427-0725f3eb98f7", alt: "Vegetables on a wooden table" },
    { id: "photo-1566486189376-d5f21e25aae4", alt: "Flat-lay of green vegetables" },
    { id: "photo-1730127487636-b7fe550af030", alt: "Gourd growing on the vine" },
    { id: "photo-1762176189281-05ac6090efdd", alt: "Vegetable on the plant" },
    { id: "photo-1763304407641-42745b4f024a", alt: "Vegetable hanging from a vine" },
    { id: "photo-1615485499978-1279c3d6302f", alt: "Vegetable on white background" },
    { id: "photo-1776653097091-47334b767dfa", alt: "Vegetables in the garden" },
    { id: "photo-1576763595295-c0371a32af78", alt: "Freshly picked produce pile" },
    { id: "photo-1772358292459-f9b25c0c98a7", alt: "Produce growing on the plant" },
    { id: "photo-1693664132282-29467c147940", alt: "Fresh produce on a table" },
    { id: "photo-1613750406907-619c9c484fe3", alt: "Fresh harvest on leaves" },
    { id: "photo-1504394448285-7adeab975d7d", alt: "Close-up of fresh produce" },
  ],
  fruits: [
    { id: "photo-1553279768-865429fa0078", alt: "Ripe seasonal fruit" },
    { id: "photo-1757281096599-b9165ba74008", alt: "Pile of ripe fruit" },
    { id: "photo-1519096845289-95806ee03a1a", alt: "Bowl full of fresh fruit" },
    { id: "photo-1744035355878-222dc04f79f5", alt: "Fruit close-up over a pile" },
    { id: "photo-1622955658214-d05c1c6fcf84", alt: "Fruit ripening on the tree" },
    { id: "photo-1569294860071-b2ac12ee73b7", alt: "Fruit growing on the tree" },
    { id: "photo-1693838310776-eaca5013b8ec", alt: "Fruit hanging from a tree" },
    { id: "photo-1620685581318-91ce6f1b76ca", alt: "Close-up of fruit skin" },
    { id: "photo-1596626233681-39f5eb87d501", alt: "Fruits hanging from the trunk" },
    { id: "photo-1593441040270-7e4a9f75091e", alt: "Cluster of young fruit" },
    { id: "photo-1547514701-42782101795e", alt: "Fresh fruit with leaves" },
    { id: "photo-1514936477380-5ea603b9a1ca", alt: "Bunch of fresh fruit" },
    { id: "photo-1579169326371-ccb4e63f7889", alt: "Fruit ripening in the orchard" },
    { id: "photo-1611080626919-7cf5a9dbab5b", alt: "Fruit on a ceramic plate" },
    { id: "photo-1560607162-26b0344e6943", alt: "Close-up of fruit in a bowl" },
  ],
  grains: [
    { id: "photo-1586201375761-83865001e31c", alt: "Uncooked grains" },
    { id: "photo-1686820740687-426a7b9b2043", alt: "Pile of grains" },
    { id: "photo-1536153635972-1fc2e818f642", alt: "Grains in a wicker basket" },
    { id: "photo-1711060266983-92bd378c850c", alt: "Scooping grain from a basket" },
    { id: "photo-1723475158232-819e29803f4d", alt: "Cooked grains" },
    { id: "photo-1592997572594-34be01bc36c7", alt: "Field ready for harvest" },
    { id: "photo-1561504935-4e7d4516a2d1", alt: "Close-up of crop stalks in the field" },
    { id: "photo-1558388556-2261d4cc1938", alt: "Aerial view of crop fields" },
    { id: "photo-1704972269889-f0fdd7f0e7c3", alt: "Baskets filled with grain" },
    { id: "photo-1711060221380-acfa2c82cc99", alt: "Hands holding fresh grain" },
  ],
  dairy: [
    { id: "photo-1488477181946-6428a0291777", alt: "Jars of fresh dairy" },
    { id: "photo-1571212515416-fef01fc43637", alt: "Bowl of creamy dairy product" },
    { id: "photo-1633893215271-f7e1fca081ad", alt: "Whipped dairy in a glass bowl" },
    { id: "photo-1649118173382-dad295004282", alt: "Dairy jar with topping" },
    { id: "photo-1670843839025-d50924a51f31", alt: "Dairy bowl with fruit" },
    { id: "photo-1589985270826-4b7bb135bc9d", alt: "Block of dairy product" },
    { id: "photo-1573812461383-e5f8b759d12e", alt: "Jar with a wooden spoon" },
    { id: "photo-1601232265936-6da280cff563", alt: "Golden dairy in a glass jar" },
    { id: "photo-1633940125832-033d739b3d45", alt: "Melted dairy in a pan" },
    { id: "photo-1624251526069-e8677ce6831f", alt: "Dairy in a sealed jar" },
  ],
  herbs: [
    { id: "photo-1776089770931-e422e57f760c", alt: "Fresh herb leaves" },
    { id: "photo-1767156969831-0beee76fa958", alt: "Herb leaves in sunlight" },
    { id: "photo-1601493700603-43461216807a", alt: "Herb leaves close-up" },
    { id: "photo-1723810330043-dd05647294cb", alt: "Bunch of fresh herbs" },
    { id: "photo-1767158615608-302f06fd3371", alt: "Bowl of freshly cut herbs" },
    { id: "photo-1628556270448-4d4e4148e1b1", alt: "Fresh herb sprigs in a jar" },
    { id: "photo-1618130070080-91f4d55a2383", alt: "Herbs in the garden" },
    { id: "photo-1603109731710-dba41b1096a7", alt: "Herb leaves with water droplets" },
    { id: "photo-1588908933351-eeb8cd4c4521", alt: "Herb plant in a pot" },
    { id: "photo-1622576454275-729fbf6aa6eb", alt: "Macro shot of herb leaves" },
  ],
  honey: [
    { id: "photo-1558642452-9d2a7deb7f62", alt: "Honey dripping from a dipper" },
    { id: "photo-1471943311424-646960669fbc", alt: "Jar of raw honey" },
    { id: "photo-1644221362202-2e3e6b01d717", alt: "Honey jar with honeycomb inside" },
    { id: "photo-1671548185843-3f50c6c1060b", alt: "Rows of honey jars" },
    { id: "photo-1692624569328-5fbb7a0c0d5d", alt: "Hand holding a jar of honey" },
    { id: "photo-1642067958050-bfba120a57e2", alt: "Honeycomb filled with honey" },
    { id: "photo-1642067958024-1a2d9f836920", alt: "Close-up of golden honeycombs" },
    { id: "photo-1718146921295-700b969e7c78", alt: "Honey dripping onto a honeycomb" },
    { id: "photo-1577095870693-360d002ad341", alt: "Bee on a honey-filled comb" },
    { id: "photo-1647427062468-74ff21e8934f", alt: "Bees working on the beehive" },
  ],
};

// Product-specific images for items with well-known, stable Unsplash IDs.
const specificImages: Record<string, { id: string; alt: string }[]> = {
  "Tomato": [
    { id: "photo-1592924357228-91a4daadcfea", alt: "Ripe red tomatoes" },
    { id: "photo-1561136594-7f68413baa99", alt: "Tomatoes on the vine" },
  ],
  "Aloo (Potato)": [{ id: "photo-1518977676601-b53f82aba655", alt: "Freshly dug potatoes" }],
  "Gajor (Carrot)": [
    { id: "photo-1445282768818-728615cc910a", alt: "Bunch of fresh carrots" },
    { id: "photo-1582515073490-39981397c445", alt: "Carrots with green tops" },
  ],
  "Broccoli": [{ id: "photo-1459411621453-7b03977f4bfc", alt: "Fresh green broccoli" }],
  "Bhutta (Sweet Corn)": [{ id: "photo-1551754655-cd27e38d2076", alt: "Fresh sweet corn cobs" }],
  "Roshun (Garlic)": [{ id: "photo-1540148426945-6cf22a6b2383", alt: "Garlic bulbs" }],
  "Palong Shak (Spinach)": [{ id: "photo-1576045057995-568f588f82fb", alt: "Fresh spinach leaves" }],
  "Sagor Kola (Ripe Banana)": [
    { id: "photo-1571771894821-ce9b6c11b08e", alt: "Bunch of ripe bananas" },
    { id: "photo-1528825871115-3581a5387919", alt: "Ripe yellow bananas" },
  ],
  "Anarosh (Pineapple)": [{ id: "photo-1550258987-190a2d41a8ba", alt: "Fresh pineapple" }],
  "Lebu (Lemon)": [
    { id: "photo-1590502593747-42a996133562", alt: "Fresh lemons" },
    { id: "photo-1587496679742-bad502958fbf", alt: "Lemons on a table" },
  ],
  "Kancha Dudh (Raw Milk)": [
    { id: "photo-1550583724-b2692b85b150", alt: "Glass of fresh milk" },
    { id: "photo-1563636619-e9143da7973b", alt: "Milk bottles" },
  ],
  "Full Cream Milk": [
    { id: "photo-1563636619-e9143da7973b", alt: "Bottles of fresh milk" },
    { id: "photo-1550583724-b2692b85b150", alt: "Glass of milk" },
  ],
  "Mozzarella Cheese": [{ id: "photo-1486297678162-eb2a19b0a32d", alt: "Fresh cheese board" }],
  "Cheddar Cheese": [{ id: "photo-1486297678162-eb2a19b0a32d", alt: "Cheese on a board" }],
};

// Exactly 5 images per product: specific IDs first, then category pool
// rotated by `offset` so different products get different image sets.
const imagesFor = (name: string, category: ProductCategory, offset: number): ProductImage[] => {
  const chosen: { id: string; alt: string }[] = [...(specificImages[name] ?? [])];
  const pool = imagePools[category];
  let cursor = offset % pool.length;
  while (chosen.length < 5) {
    const candidate = pool[cursor % pool.length];
    if (!chosen.some((c) => c.id === candidate.id)) chosen.push(candidate);
    cursor++;
  }
  return chosen.slice(0, 5).map((c) => img(c.id, `${name} — ${c.alt}`));
};

const catalog: Record<ProductCategory, CatalogItem[]> = {
  vegetables: [
    { name: "Aloo (Potato)", price: 30, unit: "kg" },
    { name: "Tomato", price: 60, unit: "kg" },
    { name: "Peyaj (Onion)", price: 55, unit: "kg" },
    { name: "Roshun (Garlic)", price: 120, unit: "kg" },
    { name: "Ada (Ginger)", price: 110, unit: "kg" },
    { name: "Fulkopi (Cauliflower)", price: 45, unit: "piece" },
    { name: "Bandhakopi (Cabbage)", price: 35, unit: "piece" },
    { name: "Broccoli", price: 90, unit: "kg" },
    { name: "Misti Kumra (Sweet Pumpkin)", price: 40, unit: "kg" },
    { name: "Chal Kumra (Ash Gourd)", price: 45, unit: "piece" },
    { name: "Shim (Flat Bean)", price: 70, unit: "kg" },
    { name: "Borboti (Yardlong Bean)", price: 65, unit: "kg" },
    { name: "Dherosh (Okra)", price: 55, unit: "kg" },
    { name: "Korola (Bitter Gourd)", price: 60, unit: "kg" },
    { name: "Jhinge (Ridge Gourd)", price: 50, unit: "kg" },
    { name: "Potol (Pointed Gourd)", price: 55, unit: "kg" },
    { name: "Chichinga (Snake Gourd)", price: 45, unit: "kg" },
    { name: "Data Shak (Amaranth Stem)", price: 25, unit: "bundle" },
    { name: "Palong Shak (Spinach)", price: 30, unit: "bundle" },
    { name: "Pui Shak (Malabar Spinach)", price: 25, unit: "bundle" },
    { name: "Lal Shak (Red Amaranth)", price: 25, unit: "bundle" },
    { name: "Kalmi Shak (Water Spinach)", price: 20, unit: "bundle" },
    { name: "Mula (Radish)", price: 30, unit: "kg" },
    { name: "Gajor (Carrot)", price: 70, unit: "kg" },
    { name: "Beet (Beetroot)", price: 80, unit: "kg" },
    { name: "Shalgom (Turnip)", price: 40, unit: "kg" },
    { name: "Kochu (Taro Root)", price: 50, unit: "kg" },
    { name: "Misti Aloo (Sweet Potato)", price: 60, unit: "kg" },
    { name: "Bhutta (Sweet Corn)", price: 80, unit: "kg" },
    { name: "Kacha Kathal (Green Jackfruit)", price: 70, unit: "piece" },
    { name: "Kolar Mocha (Banana Flower)", price: 45, unit: "piece" },
    { name: "Thor (Banana Stem)", price: 35, unit: "piece" },
    { name: "Sajna Data (Drumstick)", price: 90, unit: "kg" },
    { name: "Capsicum", price: 120, unit: "kg" },
    { name: "Dhundol (Sponge Gourd)", price: 45, unit: "kg" },
    { name: "Kakrol (Teasel Gourd)", price: 75, unit: "kg" },
    { name: "Ol Kochu (Elephant Foot Yam)", price: 65, unit: "kg" },
    { name: "Methi Shak (Fenugreek Greens)", price: 30, unit: "bundle" },
    { name: "Shorsha Shak (Mustard Greens)", price: 25, unit: "bundle" },
    { name: "Note Shak (Green Amaranth)", price: 20, unit: "bundle" },
  ],
  fruits: [
    { name: "Langra Mango", price: 160, unit: "kg" },
    { name: "Fazli Mango", price: 140, unit: "kg" },
    { name: "Gopalbhog Mango", price: 170, unit: "kg" },
    { name: "Amrapali Mango", price: 150, unit: "kg" },
    { name: "Kancha Kola (Green Banana)", price: 60, unit: "dozen" },
    { name: "Sagor Kola (Ripe Banana)", price: 90, unit: "dozen" },
    { name: "Chompa Kola (Chompa Banana)", price: 70, unit: "dozen" },
    { name: "Litchi (Bombai)", price: 250, unit: "kg" },
    { name: "Anarosh (Pineapple)", price: 80, unit: "piece" },
    { name: "Payara (Guava)", price: 90, unit: "kg" },
    { name: "Pepe (Papaya)", price: 70, unit: "kg" },
    { name: "Tormuj (Watermelon)", price: 120, unit: "piece" },
    { name: "Bangi (Muskmelon)", price: 90, unit: "piece" },
    { name: "Amra (Hog Plum)", price: 80, unit: "kg" },
    { name: "Bel (Wood Apple)", price: 60, unit: "piece" },
    { name: "Kamranga (Starfruit)", price: 70, unit: "kg" },
    { name: "Dalim (Pomegranate)", price: 280, unit: "kg" },
    { name: "Lebu (Lemon)", price: 60, unit: "dozen" },
    { name: "Batabi Lebu (Pomelo)", price: 80, unit: "piece" },
    { name: "Komola (Tangerine)", price: 220, unit: "kg" },
    { name: "Boroi (Jujube)", price: 120, unit: "kg" },
    { name: "Jam (Java Plum)", price: 180, unit: "kg" },
    { name: "Ata (Custard Apple)", price: 200, unit: "kg" },
    { name: "Amloki (Indian Gooseberry)", price: 140, unit: "kg" },
    { name: "Safeda (Sapodilla)", price: 150, unit: "kg" },
    { name: "Tal (Palmyra Fruit)", price: 50, unit: "piece" },
    { name: "Khejur (Fresh Dates)", price: 300, unit: "kg" },
    { name: "Strawberry", price: 300, unit: "kg" },
  ],
  grains: [
    { name: "Aman Rice", price: 55, unit: "kg" },
    { name: "Aus Rice", price: 50, unit: "kg" },
    { name: "Basmati Rice", price: 200, unit: "kg" },
    { name: "Kalijira Rice", price: 150, unit: "kg" },
    { name: "Polao Rice", price: 130, unit: "kg" },
    { name: "Moong Dal (Mung Bean)", price: 140, unit: "kg" },
    { name: "Masoor Dal (Red Lentil)", price: 130, unit: "kg" },
    { name: "Chola Dal (Chickpea)", price: 90, unit: "kg" },
    { name: "Kala Chana (Black Chickpea)", price: 95, unit: "kg" },
    { name: "Kheshari Dal (Grass Pea)", price: 80, unit: "kg" },
    { name: "Motor Dal (Split Pea)", price: 100, unit: "kg" },
    { name: "Mash Kalai Dal (Black Gram)", price: 160, unit: "kg" },
    { name: "Gom (Wheat)", price: 45, unit: "kg" },
    { name: "Atta (Whole Wheat Flour)", price: 55, unit: "kg" },
    { name: "Bhutta (Maize)", price: 40, unit: "kg" },
    { name: "Jab (Barley)", price: 70, unit: "kg" },
    { name: "Til (Sesame)", price: 180, unit: "kg" },
    { name: "Shorshe (Mustard Seed)", price: 120, unit: "kg" },
    { name: "Tishi (Flax Seed)", price: 150, unit: "kg" },
    { name: "Chinabadam (Peanut)", price: 140, unit: "kg" },
    { name: "Surjomukhi Beej (Sunflower Seed)", price: 190, unit: "kg" },
    { name: "Misti Kumra Beej (Pumpkin Seed)", price: 200, unit: "kg" },
    { name: "Kaun (Foxtail Millet)", price: 110, unit: "kg" },
    { name: "Cheena (Proso Millet)", price: 100, unit: "kg" },
    { name: "Jowar (Sorghum)", price: 90, unit: "kg" },
    { name: "Ragi (Finger Millet)", price: 120, unit: "kg" },
  ],
  dairy: [
    { name: "Plain Doi (Yogurt)", price: 120, unit: "kg" },
    { name: "Mishti Doi (Sweet Yogurt)", price: 150, unit: "kg" },
    { name: "Bogurar Doi (Bogura Yogurt)", price: 180, unit: "kg" },
    { name: "Kancha Dudh (Raw Milk)", price: 80, unit: "liter" },
    { name: "Full Cream Milk", price: 90, unit: "liter" },
    { name: "Makhon (Butter)", price: 700, unit: "kg" },
    { name: "Chhana (Paneer)", price: 400, unit: "kg" },
    { name: "Deshi Paneer", price: 450, unit: "kg" },
    { name: "Matha (Buttermilk)", price: 60, unit: "liter" },
    { name: "Lassi", price: 80, unit: "liter" },
    { name: "Malai (Cream)", price: 350, unit: "kg" },
    { name: "Gorur Dudher Ghee (Cow Ghee)", price: 850, unit: "kg" },
    { name: "Mohisher Dudh (Buffalo Milk)", price: 100, unit: "liter" },
    { name: "Chhagoler Dudh (Goat Milk)", price: 150, unit: "liter" },
    { name: "Mozzarella Cheese", price: 900, unit: "kg" },
    { name: "Cheddar Cheese", price: 850, unit: "kg" },
    { name: "Cream Cheese", price: 750, unit: "kg" },
    { name: "Feta Cheese", price: 800, unit: "kg" },
    { name: "Kefir", price: 250, unit: "liter" },
    { name: "Borhani", price: 90, unit: "liter" },
  ],
  herbs: [
    { name: "Tulsi Pata (Holy Basil)", price: 30, unit: "bundle" },
    { name: "Thankuni Pata (Pennywort)", price: 25, unit: "bundle" },
    { name: "Curry Pata (Curry Leaves)", price: 30, unit: "bundle" },
    { name: "Lemongrass", price: 35, unit: "bundle" },
    { name: "Kacha Halud (Fresh Turmeric)", price: 60, unit: "bundle" },
    { name: "Dhone Beej (Coriander Seeds)", price: 70, unit: "bundle" },
    { name: "Jeera (Cumin)", price: 80, unit: "bundle" },
    { name: "Kalo Jeera (Nigella Seeds)", price: 75, unit: "bundle" },
    { name: "Tejpata (Bay Leaf)", price: 40, unit: "bundle" },
    { name: "Golmorich (Black Pepper)", price: 80, unit: "bundle" },
    { name: "Basil", price: 30, unit: "bundle" },
    { name: "Oregano", price: 60, unit: "bundle" },
    { name: "Thyme", price: 65, unit: "bundle" },
    { name: "Rosemary", price: 70, unit: "bundle" },
    { name: "Parsley", price: 45, unit: "bundle" },
    { name: "Shulfa (Dill)", price: 30, unit: "bundle" },
    { name: "Chives", price: 50, unit: "bundle" },
    { name: "Sage", price: 65, unit: "bundle" },
    { name: "Ajwain (Carom Leaves)", price: 55, unit: "bundle" },
    { name: "Mouri (Fennel)", price: 60, unit: "bundle" },
    { name: "Radhuni", price: 50, unit: "bundle" },
    { name: "Stevia Pata (Stevia Leaves)", price: 80, unit: "bundle" },
  ],
  honey: [
    { name: "Mustard Honey", price: 850, unit: "kg" },
    { name: "Akashmoni Honey", price: 900, unit: "kg" },
    { name: "Eucalyptus Honey", price: 950, unit: "kg" },
    { name: "Sidr Honey", price: 1800, unit: "kg" },
    { name: "Jungle Honey", price: 1000, unit: "kg" },
    { name: "Forest Honey", price: 1100, unit: "kg" },
    { name: "Lychee Honey", price: 1050, unit: "kg" },
    { name: "Mango Blossom Honey", price: 980, unit: "kg" },
    { name: "Sunflower Honey", price: 920, unit: "kg" },
    { name: "Wildflower Honey", price: 890, unit: "kg" },
    { name: "Raw Organic Honey", price: 1200, unit: "kg" },
    { name: "Creamed Honey", price: 1300, unit: "kg" },
    { name: "Ginger Infused Honey", price: 1400, unit: "kg" },
    { name: "Lemon Infused Honey", price: 1350, unit: "kg" },
    { name: "Cinnamon Infused Honey", price: 1450, unit: "kg" },
    { name: "Chili Infused Honey", price: 1500, unit: "kg" },
    { name: "Black Cumin Honey", price: 1600, unit: "kg" },
    { name: "Coriander Honey", price: 870, unit: "kg" },
    { name: "Berry Blossom Honey", price: 990, unit: "kg" },
    { name: "Multiflora Honey", price: 860, unit: "kg" },
    { name: "Comb Honey", price: 1700, unit: "kg" },
    { name: "Kholisha Flower Honey", price: 1250, unit: "kg" },
  ],
};

const descTemplates: Record<ProductCategory, (name: string, place: string) => string> = {
  vegetables: (n, p) => `Farm-fresh ${n} grown in ${p}, harvested at peak freshness and brought straight from the field.`,
  fruits: (n, p) => `Naturally ripened ${n} from the orchards of ${p} — juicy, seasonal, and picked by hand.`,
  grains: (n, p) => `Clean, hand-sorted ${n} from ${p}, milled and packed fresh to order.`,
  dairy: (n, p) => `${n} made fresh daily in ${p} from grass-fed cattle, free of preservatives.`,
  herbs: (n, p) => `Aromatic ${n} cut each morning in ${p} and bundled the same day.`,
  honey: (n, p) => `Pure, raw ${n} harvested by local beekeepers in ${p} — unheated and unfiltered.`,
};

const featureSets: ProductFeature[][] = [
  ["fresh", "local"],
  ["organic", "local"],
  ["fresh", "pesticide-free"],
  ["local", "sustainable"],
  ["organic", "non-gmo"],
  ["fresh", "local", "organic"],
  ["local", "fair-trade"],
  ["fresh", "sustainable"],
];

const specToCategories: Record<string, ProductCategory[]> = {
  vegetables: ["vegetables", "herbs"],
  fruits: ["fruits"],
  grains: ["grains"],
  dairy: ["dairy"],
  herbs: ["herbs", "vegetables"],
  honey: ["honey"],
  mixed: ["vegetables", "fruits", "grains", "dairy", "herbs", "honey"],
};

// Fill every farmer's batch to 8-15 products.
for (let i = 0; i < farmers.length; i++) {
  const batch = (productsByFarmerIndex[i] = productsByFarmerIndex[i] || []);
  const usedNames = new Set(batch.map((p) => p.name));
  const categories = specToCategories[farmers[i].farmerDetails.specialization] ?? specToCategories.mixed;
  const cursors: Partial<Record<ProductCategory, number>> = {};
  const target = 8 + (i % 8); // 8..15 products per farmer

  for (let j = 0; batch.length < target && j < 200; j++) {
    const category = categories[j % categories.length];
    const items = catalog[category];
    let cursor = cursors[category] ?? (i * 3) % items.length;
    // find the next unused item in this category
    let picked: CatalogItem | undefined;
    for (let tries = 0; tries < items.length; tries++) {
      const candidate = items[cursor % items.length];
      cursor++;
      if (!usedNames.has(candidate.name)) {
        picked = candidate;
        break;
      }
    }
    cursors[category] = cursor;
    if (!picked) continue; // category exhausted for this farmer

    usedNames.add(picked.name);
    batch.push({
      name: picked.name,
      description: descTemplates[category](picked.name, farmers[i].address),
      category,
      price: picked.price,
      unit: picked.unit,
      stock: 10 + ((i * 97 + batch.length * 61) % 991),
      images: imagesFor(picked.name, category, i * 7 + batch.length * 3),
      features: featureSets[(i + batch.length) % featureSets.length],
      farmLocation: farmers[i].address,
    });
  }
}

async function seed() {
  await connectDB();

  console.log("Clearing existing seed data...");
  const seedEmails = [...farmers.map((f) => f.email), ...customers.map((c) => c.email), adminUser.email];
  const oldSeedUsers = await User.find({ email: { $in: seedEmails } }, "_id");
  await Order.deleteMany({ user: { $in: oldSeedUsers.map((u) => u._id) } });
  await Review.deleteMany({}); // reviews reference reseeded products, so clear all
  await Product.deleteMany({});
  await User.deleteMany({ email: { $in: seedEmails } });

  console.log("Creating farmers...");
  const createdFarmers = [];
  for (const farmer of farmers) {
    const user = await User.create({ ...farmer, approvalStatus: "approved" });
    createdFarmers.push(user);
  }

  console.log("Creating products...");
  let count = 0;
  const productsByName: Record<string, InstanceType<typeof Product>> = {};
  for (let i = 0; i < createdFarmers.length; i++) {
    const batch = productsByFarmerIndex[i] || [];
    for (const product of batch) {
      const created = await Product.create({ ...product, farmer: createdFarmers[i]._id, approvalStatus: "approved", isPublished: true });
      productsByName[product.name] = created;
      count++;
    }
  }

  console.log("Creating customers...");
  const createdCustomers = [];
  for (const customer of customers) {
    createdCustomers.push(await User.create(customer));
  }

  console.log("Creating admin user...");
  await User.create(adminUser);

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
