import mongoose, { Schema, Document } from "mongoose";
import { IMembership } from "./Membership";

export interface IUser extends Document {
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  dob: Date;
  gender: "male" | "female" | "other";

  // COMMON
  role: "user" | "admin" | "pt";
  password: string;
  timetable: any[];

  // USER fields
  membership: IMembership["_id"] | null;
  assignedPT: mongoose.Types.ObjectId | null;
  address: string | null;

  // SHOP fields
  cartId: mongoose.Types.ObjectId | null;
  orders: mongoose.Types.ObjectId[];

  // PT fields
  ptSpecialization: string | null;
  ptExperience: string| null;
  ptClients: mongoose.Types.ObjectId[];
  ptAvatar: string | null;
}

const UserSchema: Schema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    phonenumber: { type: String },
    dob: { type: Date },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },

    role: {
      type: String,
      enum: ["user", "admin", "pt"],
      default: "user",
    },

    password: { type: String, required: true },

    timetable: { type: Array, default: [] },

    // ----- USER FIELDS -----
    membership: { type: Schema.Types.ObjectId, ref: "Membership", default: null },
    assignedPT: { type: Schema.Types.ObjectId, ref: "User", default: null },
    address: { type: String, default: null },

    // ----- SHOP FIELDS -----
    cartId: { type: Schema.Types.ObjectId, ref: "Cart", default: null },
    orders: [{ type: Schema.Types.ObjectId, ref: "Order", default: [] }],

    // ----- PT FIELDS -----
    ptSpecialization: { type: String, default: null },
    ptExperience: { type: String, default: null },
    ptClients: {
      type: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
          name: { type: String, required: true }
        }
      ],
      default: []
    },
    ptAvatar: { type: String, default: null }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
