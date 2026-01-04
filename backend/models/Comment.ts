import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  content: string;
  blog: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const CommentSchema: Schema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'blogs',
    required: true,
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

CommentSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

const Comment = mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;

