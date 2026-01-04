export interface Blog {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  imageUrl?: string;
  status: 'draft' | 'published';
  user: {
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  viewCount?: number;
  likes?: string[];
  dislikes?: string[];
  comments?: Comment[];
  created_at: string;
  updated_at: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  followers?: User[];
  following?: User[];
}

export interface Comment {
  _id: string;
  content: string;
  blog: string;
  user: User;
  created_at: string;
  updated_at: string;
}

