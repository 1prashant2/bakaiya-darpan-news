export interface Category {
  id: string;
  name: string;
  name_en?: string | null;
  slug: string;
  created_at: string;
}

export interface Province {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  created_at: string;
}

export interface District {
  id: string;
  province_id: string;
  name: string;
  name_en: string;
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
  province_id: string | null;
  district_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  categories?: Category;
  provinces?: Province;
  districts?: District;
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
