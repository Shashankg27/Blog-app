import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    username: string;
    password: string;
    matchPassword(enteredPassword: string): Promise<boolean>;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=User.d.ts.map