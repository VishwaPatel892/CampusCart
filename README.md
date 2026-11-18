# Picksy 🎓

A student-focused second-hand marketplace web app built with Next.js, React, Tailwind CSS, and MongoDB. Students can easily discover affordable textbooks, electronics, dorm furniture, and study equipment, or sell and give away items to peers on campus.

## ✨ Features

- **Product Listing Management**: Post items For Sale, Free (giveaways), or Exchange (barter). Upload photos, set condition, pickup spots, and manage listing statuses (`Available`, `Reserved`, `Sold`).
- **Marketplace Discovery & Search**: Search by name or description. Filter by category, condition, price range, and listing type with multi-option sorting (Newest, Low to High, High to Low, Relevance).
- **Enquiries & Offer Negotiation**: Buyers can submit enquiries with counter-offer prices. Sellers can accept or reject offers, automatically reserving items and notifying buyers.
- **In-App Notifications**: Real-time tracking of received buyer messages, accepted offers, and status updates.
- **Seller Dashboard & Public Profiles**: Track active, reserved, and sold listings, manage visibility, review stats, and view seller listing histories.
- **Favorites & Wishlist**: Bookmark items with instant browser sync.
- **Campus-Friendly Features**: QR code sharing for individual listings, campus meeting point selectors, and realistic sample data.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher installed
- MongoDB running locally (`mongodb://127.0.0.1:27017/Picksy`) or a MongoDB Atlas connection string

### Installation

1. Clone this repository:
```bash
git clone https://github.com/VishwaPatel892/Picksy.git
cd Picksy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/Picksy
```

4. Populate sample campus listings (Optional):
```bash
npm run seed
```
To safely remove only the demo listings later:
```bash
npm run seed:remove
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── public/                 # Static assets and icons
├── scripts/
│   ├── seed.mjs            # Sample Indian college listings seed script
│   └── seed-remove.mjs     # Safe demo items cleaner
├── src/
│   ├── app/                # Next.js App Router pages and API routes
│   │   ├── api/            # Backend endpoints (products, enquiries, sellers, notifications, upload)
│   │   ├── dashboard/      # Student seller hub
│   │   ├── enquiries/      # Buyer & seller offer negotiation center
│   │   ├── favorites/      # Wishlist page
│   │   ├── notifications/  # In-app activity feed
│   │   ├── products/       # Marketplace discovery & item details
│   │   ├── sell/           # Add new listing form
│   │   └── seller/         # Public seller profile pages
│   ├── components/         # Reusable UI components (Navbar, Footer, ProductCard, SearchBar)
│   ├── lib/                # MongoDB database connection helper
│   ├── models/             # Mongoose schemas (Product, Enquiry, Notification)
│   └── types/              # TypeScript interface definitions
├── package.json
├── tsconfig.json
└── README.md
```

## 📄 License

This project is open-source and free to use for student campus communities.
