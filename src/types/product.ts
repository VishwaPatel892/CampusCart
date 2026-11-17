export type ListingType = "For Sale" | "Free" | "Exchange";
export type ProductStatus = "Available" | "Reserved" | "Sold";
export type ProductCondition = "New" | "Like New" | "Good" | "Fair" | "Used";
export type ProductCategory =
  | "Books"
  | "Books & Study Materials"
  | "Electronics"
  | "Furniture"
  | "Stationery"
  | "Accessories"
  | "Sports Equipment"
  | "Others";

export interface IProduct {
  _id: string;
  name: string;
  price: number;
  category: string;
  condition: string;
  emoji?: string;
  image?: string;
  seller: string;
  description: string;
  phone: string;
  listingType: ListingType;
  status: ProductStatus;
  isActive: boolean;
  location?: string;
  isDemo?: boolean;
  demoKey?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type EnquiryStatus = "Pending" | "Accepted" | "Rejected";

export interface IEnquiry {
  _id: string;
  product: string | IProduct;
  buyerName: string;
  buyerPhone: string;
  message: string;
  offerPrice?: number | null;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationType =
  | "enquiry_received"
  | "offer_accepted"
  | "offer_rejected"
  | "product_reserved"
  | "product_sold"
  | "info";

export interface INotification {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedProduct?: string | IProduct;
  relatedEnquiry?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ISellerProfile {
  name: string;
  phone?: string;
  totalListings: number;
  activeListingsCount: number;
  reservedListingsCount: number;
  soldListingsCount: number;
  joinedDate?: string;
  activeListings: IProduct[];
  soldListings: IProduct[];
}

