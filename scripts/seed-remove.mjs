import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/picksy";

const ProductSchema = new mongoose.Schema(
  {
    isDemo: { type: Boolean, default: false },
    demoKey: { type: String, default: null },
  },
  { strict: false }
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function removeDemoData() {
  console.log("Connecting to MongoDB for safe demo data removal...");
  await mongoose.connect(MONGODB_URI);

  const result = await Product.deleteMany({ isDemo: true });

  console.log("==========================================");
  console.log(`DEMO DATA REMOVAL COMPLETED:`);
  console.log(`• Removed ${result.deletedCount} demo listings.`);
  console.log(`• Real user-created listings remain 100% untouched.`);
  console.log("==========================================");

  await mongoose.disconnect();
  process.exit(0);
}

removeDemoData().catch((err) => {
  console.error("Demo removal error:", err);
  process.exit(1);
});

