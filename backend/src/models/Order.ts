import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  address: string;
  items: {
    productId: mongoose.Types.ObjectId;
    name: string;
    url: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }[];
  payingMethod: "cod" | "credit";
  totalCartPrice: number;
  shippingFee: number;
  finalPrice: number;
  status: "pending" | "shipping" | "completed";
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    address: { type: String, required: true },

    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        url: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      }
    ],

    payingMethod: { type: String, enum: ["cod", "credit"], required: true },

    totalCartPrice: { type: Number, required: true },
    shippingFee: { type: Number, default: 30000 },
    finalPrice: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "shipping", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
