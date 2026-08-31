export type PostStatus = "draft" | "published";
export type CommentStatus = "pending" | "approved" | "rejected";
export type Role = "user" | "admin";

export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: Role;
  created_at: string;
};

export type Post = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  content: string;
  category: string;
  featured: boolean;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

// 归档页展示用（含分类 + 正文，浮层阅读时用）
export type ArchivePost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  category: string;
  content: string;
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  status: CommentStatus;
  created_at: string;
  profiles?: { username: string | null } | null;
};

// 服务端 action 统一返回的状态
export type ActionState = {
  error?: string;
  success?: string;
};

// 评论展示用（带作者昵称）
export type CommentDisplay = {
  id: string;
  content: string;
  created_at: string;
  profiles: { username: string | null } | null;
};

// 留言板消息展示用（带作者昵称）
export type GuestbookMessageDisplay = {
  id: string;
  content: string;
  created_at: string;
  profiles: { username: string | null } | null;
};

// 后台审核评论用（带作者昵称 + 所属文章标题）
export type ModerationComment = {
  id: string;
  content: string;
  created_at: string;
  profiles: { username: string | null } | null;
  posts: { title: string | null } | null;
};

// 灵感源泉记录展示用（带作者昵称）
export type Inspiration = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: { username: string | null } | null;
};

// 首页公告
export type Announcement = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};
