import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  type: "membership" | "order";
  referenceId: mongoose.Types.ObjectId; // membershipId or orderId
  amount: number;
  currency: string;
  paymentMethod: "stripe" | "cod" | "bank_transfer" | "zalopay";
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  zaloPayTransId?: string;
  zaloPayOrderUrl?: string;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  metadata?: {
    planName?: string;
    planDuration?: number;
    customerEmail?: string;
    customerName?: string;
    items?: any[];
    cartId?: string;
  };
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["membership", "order"],
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'refModel',
    },
    refModel: {
      type: String,
      enum: ['Membership', 'Order'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "cod", "bank_transfer", "zalopay"],
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    stripeSessionId: {
      type: String,
      default: null,
    },
    zaloPayTransId: {
      type: String,
      default: null,
    },
    zaloPayOrderUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ stripeSessionId: 1 });
PaymentSchema.index({ stripePaymentIntentId: 1 });
PaymentSchema.index({ zaloPayTransId: 1 });

export default mongoose.model<IPayment>("Payment", PaymentSchema);
