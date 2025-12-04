import mongoose, { Schema, Document } from "mongoose";

export interface IRelationship extends Document {
  ptId: string;
  userId: string;
  ptName: string;
  userName: string;
  status: "pending" | "active" | "rejected";
}

const RelationshipSchema = new Schema<IRelationship>(
  {
    ptId: { type: String, required: true },
    userId: { type: String, required: true },
    ptName: { type: String, required: true },
    userName: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRelationship>("Relationship", RelationshipSchema);
