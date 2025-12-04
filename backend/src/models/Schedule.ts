import mongoose, { Schema, Document } from "mongoose";

export interface ISchedule extends Document {
    scheduleName: string;
    scheduleDate: string; // lưu dạng dd/mm/yyyy hoặc ISO date tùy bạn
    shift: string;
    ptId: mongoose.Types.ObjectId;
    ptName: string;
    userId: mongoose.Types.ObjectId;
    userName: string;
    createdAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
    {
        scheduleName: { type: String, required: true, unique: true },
        scheduleDate: { type: String, required: true },  // dd/mm/yyyy
        shift: {
            type: String,
            required: true,
            enum: [
                "07:00 to 09:00",
                "09:00 to 11:00",
                "13:00 to 15:00",
                "15:00 to 17:00",
                "17:00 to 19:00",
            ],
        },
        ptId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        ptName: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        userName: { type: String, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// 🔥 Unique compound index: scheduleDate + shift
ScheduleSchema.index({ scheduleDate: 1, shift: 1 }, { unique: true });

const Schedule = mongoose.model<ISchedule>("Schedule", ScheduleSchema);
export default Schedule;