import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/posts/${slug}`).then(res => setPost(res.data.post)).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ padding: '100px 32px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>;
  if (!post) return <div style={{ padding: '100px 32px', textAlign: 'center', color: 'var(--gray-400)' }}>Post not found</div>;

  return (
    <>
      <style>{`
        .bp-header { padding: 120px 32px 48px; background: var(--green-light); text-align: center; }
        .bp-date { font-size: 13px; color: var(--gray-400); margin-bottom: 12px; }
        .bp-title { font-family: var(--font-heading); font-size: 32px; font-weight: 700; max-width: 700px; margin: 0 auto; line-height: 1.3; }
        .bp-body { max-width: 720px; margin: 0 auto; padding: 40px 32px 80px; }
        .bp-content { font-size: 16px; line-height: 1.8; color: var(--gray-600); white-space: pre-wrap; }
        .bp-content p { margin-bottom: 16px; }
        .bp-back { display: inline-flex; align-items: center; gap: 6px; color: var(--green); font-weight: 600; font-size: 14px; text-decoration: none; margin-bottom: 24px; }
        .bp-back:hover { text-decoration: underline; }
        .bp-author { margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--gray-200); font-size: 14px; color: var(--gray-500); }
        .bp-author strong { color: var(--gray-700); }
      `}</style>

      <div className="bp-header">
        <div className="bp-date">{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <h1 className="bp-title">{post.title}</h1>
      </div>

      <div className="bp-body">
        <Link to="/blog" className="bp-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Blog
        </Link>
        {post.imageUrl && <img src={post.imageUrl} alt={post.title} style={{ width: '100%', borderRadius: 8, marginBottom: 32, maxHeight: 400, objectFit: 'cover' }} />}
        <div className="bp-content">{post.content}</div>
        {post.author && <div className="bp-author">Written by <strong>{post.author.name}</strong></div>}
      </div>
    </>
  );
};

export default BlogPost;
