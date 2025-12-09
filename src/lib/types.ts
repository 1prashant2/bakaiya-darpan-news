export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author: string;
  image_url: string | null;
  category_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  categories?: Category;
}

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export type AppRole = 'admin' | 'editor' | 'reader' | 'super_admin' | 'author';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}
