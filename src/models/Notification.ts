import { Schema, models, model } from "mongoose";

const NotificationSchema = new Schema(
  {
    recipient: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "enquiry_received",
        "offer_accepted",
        "offer_rejected",
        "product_reserved",
        "product_sold",
        "info",
      ],
      default: "info",
    },
    relatedProduct: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    relatedEnquiry: {
      type: Schema.Types.ObjectId,
      ref: "Enquiry",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification =
  models.Notification || model("Notification", NotificationSchema);

export default Notification;

