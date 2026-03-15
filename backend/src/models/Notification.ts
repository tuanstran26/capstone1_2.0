import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: 
    | "membership_expiring"      // Membership sắp hết hạn
    | "membership_expired"       // Membership đã hết hạn
    | "membership_created"       // Đăng ký membership mới
    | "order_placed"             // Đặt hàng thành công
    | "order_shipped"            // Đơn hàng đang giao
    | "order_delivered"          // Đơn hàng đã giao
    | "order_cancelled"          // Đơn hàng bị hủy
    | "schedule_reminder"        // Nhắc lịch tập
    | "schedule_created"         // Lịch tập mới
    | "schedule_cancelled"       // Hủy lịch tập
    | "pt_assigned"              // Được assign PT
    | "new_client"               // PT có client mới
    | "payment_success"          // Thanh toán thành công
    | "payment_failed"           // Thanh toán thất bại
    | "system";                  // Thông báo hệ thống
  title: string;
  message: string;
  data?: Record<string, any>;   // Dữ liệu bổ sung (orderId, membershipId, etc.)
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "membership_expiring",
        "membership_expired",
        "membership_created",
        "order_placed",
        "order_shipped",
        "order_delivered",
        "order_cancelled",
        "schedule_reminder",
        "schedule_created",
        "schedule_cancelled",
        "pt_assigned",
        "new_client",
        "payment_success",
        "payment_failed",
        "system",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      maxlength: 500,
    },

    data: {
      type: Schema.Types.Mixed,
      default: {},
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // tự động tạo createdAt, updatedAt
  }
);

// Compound index để query nhanh hơn
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });

// TTL: Tự động xóa notification sau 30 ngày
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model<INotification>("Notification", NotificationSchema);
