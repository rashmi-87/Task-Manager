import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  dueDate: { type: Date, required: true },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"], 
    default: "Medium"
  },
  status: {
    type: String,
    enum: ["pending", "done"],
    default: "pending"
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
