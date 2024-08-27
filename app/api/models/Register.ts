import mongoose from "mongoose";

export interface RegisterType extends mongoose.Document {
  email: string;
  token: string;
  expiryDate: string;
  username: string;
  passwordSsh: string;
  account: string;
  passwordMysql: string;
  databaseName: string;
}

const RegisterSchema = new mongoose.Schema<RegisterType>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  token: {
    type: String,
    required: true,
    unique: false,
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
  passwordSsh: {
    type: String,
    required: false,
    unique: false,
    trim: true,
  },
  account: {
    type: String,
    required: false,
    unique: true,
    trim: true,
  },
  passwordMysql: {
    type: String,
    required: false,
    unique: false,
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
