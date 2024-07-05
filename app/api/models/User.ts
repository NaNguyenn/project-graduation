import mongoose from "mongoose";

export interface UserType extends mongoose.Document {
  email: string;
  username: string;
  account: string;
  databaseName: string;
}

const UserSchema = new mongoose.Schema<UserType>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  account: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  databaseName: {
    type: String,
    required: true,
    trim: true,
  },
});

export default mongoose.models.User ||
  mongoose.model<UserType>("User", UserSchema);
