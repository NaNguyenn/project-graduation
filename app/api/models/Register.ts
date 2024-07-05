import mongoose from "mongoose";

export interface RegisterType extends mongoose.Document {
  email: string;
  expiryDate: string;
}

const RegisterSchema = new mongoose.Schema<RegisterType>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  expiryDate: {
    type: String,
    required: true,
    trim: true,
  },
});

export default mongoose.models.Register ||
  mongoose.model<RegisterType>("Register", RegisterSchema);
