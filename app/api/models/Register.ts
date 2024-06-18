import mongoose from "mongoose";

export interface Registers extends mongoose.Document {
  email: string;
  expiryDate: string;
  token: string;
}

const RegisterSchema = new mongoose.Schema<Registers>({
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
  token: {
    type: String,
    required: true,
    trim: true,
  },
});

export default mongoose.models.Register ||
  mongoose.model<Registers>("Register", RegisterSchema);
