import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  lastActive: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true },
  lastActive: { type: Date, default: new Date() },
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
