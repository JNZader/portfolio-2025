import type { Post } from '@/types/sanity';
import { PostCard } from './PostCard';

interface PostGridProps {
  posts: Post[];
}

export function PostGrid({ posts }: PostGridProps) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => (
        <PostCard key={post._id} post={post} priority={index < 3} />
      ))}
    </div>
  );
}
