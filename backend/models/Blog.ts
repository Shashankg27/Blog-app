import mongoose, { Document, Schema } from 'mongoose';

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

const BlogSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
  },
  imageUrl: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Update updated_at on save
BlogSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

const Blog = mongoose.model<IBlog>('blogs', BlogSchema);

export default Blog;

