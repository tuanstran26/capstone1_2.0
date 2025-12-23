import mongoose, { Schema, Document } from "mongoose";

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId | null;
  username: string | null;
  address: string | null;
  items: {
    productId: mongoose.Types.ObjectId;
    name: string;
    url: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }[];
  payingMethod: "cod" | "credit" | null;
  totalCartPrice: number;
}

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    username: { type: String, default: null },
    address: { type: String, default: null },

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

    payingMethod: {
      type: String,
      enum: ["cod", "credit", null],
      default: null,
    },

    totalCartPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ICart>("Cart", CartSchema);
