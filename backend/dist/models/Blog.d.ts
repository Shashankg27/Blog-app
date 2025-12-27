import mongoose, { Document } from 'mongoose';
export interface IBlog extends Document {
    title: string;
    content: string;
    tags?: string[];
    imageUrl?: string;
    status: 'draft' | 'published';
    user: mongoose.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
}
declare const Blog: mongoose.Model<IBlog, {}, {}, {}, mongoose.Document<unknown, {}, IBlog, {}> & IBlog & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Blog;
//# sourceMappingURL=Blog.d.ts.map