import { useState, useEffect } from 'react';
import { Send, Heart, HeartOff, User, Clock, Tag, Trash2, AlertCircle } from 'lucide-react';
import { postApi } from '../../services/postApi';
import { formatDate } from '../../utils/formatDate';

export default function StudentFeed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ body: '', tags: '' });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchPosts();
    // Get current user ID from localStorage or auth context
    const token = localStorage.getItem('skillsetu_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id || payload.userId);
      } catch (e) {
        // Ignore token parse errors
      }
    }
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const response = await postApi.list({ page: 1, limit: 20 });
      setPosts(response.data?.items || []);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!newPost.body.trim()) return;
    setCreating(true);
    try {
      const tags = newPost.tags.split(',').map(t => t.trim()).filter(Boolean);
      const response = await postApi.create({ body: newPost.body, tags });
      setPosts(prev => [response.data.item, ...prev]);
      setNewPost({ body: '', tags: '' });
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setCreating(false);
    }
  }

  async function toggleLike(post) {
    const hasLiked = post.likes?.some(like => like._id === currentUserId);
    try {
      if (hasLiked) {
        await postApi.unlike(post._id);
        setPosts(prev => prev.map(p => p._id === post._id 
          ? { ...p, likes: p.likes.filter(l => l._id !== currentUserId) }
          : p
        ));
      } else {
        const response = await postApi.like(post._id);
        setPosts(prev => prev.map(p => p._id === post._id ? response.data.item : p));
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  }

  async function handleDelete(postId) {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postApi.remove(postId);
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) {
      alert('Failed to delete post');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22488f]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post Form */}
      <div className="card p-4">
        <form onSubmit={handleCreatePost} className="space-y-3">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
              <User size={20} />
            </div>
            <div className="flex-1 space-y-2">
              <textarea
                className="input resize-none min-h-[80px] max-h-[200px]"
                placeholder="What's on your mind?"
                value={newPost.body}
                onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                rows={3}
              />
              <input
                className="input"
                type="text"
                placeholder="Tags (comma separated)"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={creating || !newPost.body.trim()}
                >
                  {creating ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="card p-12 text-center">
            <HeartOff className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No posts yet</h3>
            <p className="mt-2 text-slate-500">Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={currentUserId}
              onLike={toggleLike}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PostCard({ post, currentUserId, onLike, onDelete }) {
  const hasLiked = post.likes?.some(like => like._id === currentUserId);
  const likeCount = post.likes?.length || 0;
  const isAuthor = post.author?._id === currentUserId;

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-[#22488f] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {post.author?.firstName?.[0] || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">
            {post.author?.firstName} {post.author?.lastName}
          </p>
          <p className="text-xs text-slate-500">
            {formatDate(post.createdAt)}
          </p>
        </div>
        {isAuthor && (
          <button
            onClick={() => onDelete(post._id)}
            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
            title="Delete post"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      <p className="text-slate-700 whitespace-pre-wrap">{post.body}</p>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
        <button
          onClick={() => onLike(post)}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            hasLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
          }`}
        >
          {hasLiked ? <Heart className="h-4 w-4 fill-current" /> : <Heart className="h-4 w-4" />}
          <span>{likeCount}</span>
        </button>
        {isAuthor && (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Your post
          </span>
        )}
      </div>
    </div>
  );
}