import mongoose from "mongoose";

export interface RegisterType extends mongoose.Document {
  email: string;
  expiryDate: string;
  username: string;
  account: string;
  databaseName: string;
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
  username: {
    type: String,
    required: false,
    unique: true,
    trim: true,
  },
  account: {
    type: String,
    required: false,
    unique: true,
    trim: true,
  },
  databaseName: {
    type: String,
    required: false,
    unique: true,
    trim: true,
  },
});

export default mongoose.models.Register ||
  mongoose.model<RegisterType>("Register", RegisterSchema);
