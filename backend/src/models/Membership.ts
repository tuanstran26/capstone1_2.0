import mongoose, { Schema, Document } from "mongoose";

export interface IMembership extends Document {
  name: "Standard" | "Premium" | "Elite";
  duration: number;              // số ngày
  createdDate: Date;
  expiredDate: Date;
  status: "pending" | "completed";
  user: mongoose.Types.ObjectId; // ref User
  price: number;
}

const MembershipSchema: Schema = new Schema({
  name: {
    type: String,
    enum: ["Standard", "Premium", "Elite"],
    required: true,
  },

  duration: { type: Number, default: 30 }, // 30 ngày

  createdDate: { type: Date, default: Date.now },
  expiredDate: { type: Date },

  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: { type: String, required: true },
  price: { type: Number, default: 0 },
});

// TTL tự xóa membership khi hết hạn
MembershipSchema.index({ expiredDate: 1 }, { expireAfterSeconds: 0 });

// Auto-set expiredDate dựa trên createdDate + duration
MembershipSchema.pre<IMembership>("save", function (next) {
  if (!this.createdDate) {
    this.createdDate = new Date();
  }

  this.expiredDate = new Date(this.createdDate);
  this.expiredDate.setDate(this.createdDate.getDate() + this.duration);

  next();
});

export default mongoose.model<IMembership>("Membership", MembershipSchema);
