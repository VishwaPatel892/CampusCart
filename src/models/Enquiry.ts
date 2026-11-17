import { Schema, models, model } from "mongoose";

const EnquirySchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    buyerName: {
      type: String,
      required: true,
      trim: true,
    },
    buyerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    offerPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Enquiry = models.Enquiry || model("Enquiry", EnquirySchema);

export default Enquiry;
