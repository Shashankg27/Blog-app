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
  };
  created_at: string;
  updated_at: string;
}

export interface User {
  _id: string;
  username: string;
}

