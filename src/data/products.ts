export type Product = {
  id: string | number;
  name: string;
  price: number;
  category: string;
  condition: string;
  emoji: string;
  seller: string;
  description: string;
  phone: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "Engineering Mathematics",
    price: 250,
    category: "Books",
    condition: "Good",
    emoji: "📚",
    seller: "Rahul",
    description: "Engineering mathematics book in good condition.",
    phone: "9876543210",
  },
  {
    id: 2,
    name: "Casio Calculator",
    price: 500,
    category: "Electronics",
    condition: "Like New",
    emoji: "🧮",
    seller: "Amit",
    description: "Scientific calculator working perfectly.",
    phone: "9876543211",
  },
  {
    id: 3,
    name: "College Backpack",
    price: 350,
    category: "Accessories",
    condition: "Good",
    emoji: "🎒",
    seller: "Priya",
    description: "College backpack with enough storage space.",
    phone: "9876543212",
  },
  {
    id: 4,
    name: "Programming in C++",
    price: 180,
    category: "Books",
    condition: "Used",
    emoji: "📖",
    seller: "Krish",
    description: "Useful book for learning C++ programming.",
    phone: "9876543213",
  },
  {
    id: 5,
    name: "Wireless Headphones",
    price: 700,
    category: "Electronics",
    condition: "Like New",
    emoji: "🎧",
    seller: "Neha",
    description: "Wireless headphones with good sound quality.",
    phone: "9876543214",
  },
  {
    id: 6,
    name: "Study Lamp",
    price: 200,
    category: "Accessories",
    condition: "Good",
    emoji: "💡",
    seller: "Jay",
    description: "Study lamp suitable for hostel rooms.",
    phone: "9876543215",
  },
];

export default products;
