import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts').then(res => setPosts(res.data.posts)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '100px 32px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>;

  return (
    <>
      <style>{`
        .blog-hero { text-align: center; padding: 120px 32px 48px; background: var(--green-light); }
        .blog-hero h1 { font-family: var(--font-heading); font-size: 36px; font-weight: 700; margin: 0 0 12px; }
        .blog-hero p { color: var(--gray-500); font-size: 16px; margin: 0; }
        .blog-content { max-width: 900px; margin: 0 auto; padding: 40px 32px 80px; }
        .blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        .blog-card { border: 1px solid var(--gray-200); border-radius: var(--radius); overflow: hidden; background: var(--white); transition: box-shadow 0.15s; }
        .blog-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .blog-card-img { width: 100%; height: 180px; object-fit: cover; background: var(--gray-100); }
        .blog-card-body { padding: 20px; }
        .blog-card-date { font-size: 12px; color: var(--gray-400); }
        .blog-card-title { font-size: 17px; font-weight: 700; color: var(--gray-800); margin: 8px 0; line-height: 1.4; }
        .blog-card-excerpt { font-size: 14px; color: var(--gray-500); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .blog-card-link { display: inline-block; margin-top: 12px; color: var(--green); font-weight: 600; font-size: 14px; text-decoration: none; }
        .blog-card-link:hover { text-decoration: underline; }
        .blog-empty { text-align: center; padding: 60px; color: var(--gray-400); }
      `}</style>

      <div className="blog-hero">
        <h1>Blog</h1>
        <p>Insights, tips, and updates from the Branda team</p>
      </div>

      <div className="blog-content">
        {posts.length === 0 ? (
          <div className="blog-empty">No blog posts yet. Check back soon!</div>
        ) : (
          <div className="blog-grid">
            {posts.map(post => (
              <div key={post._id} className="blog-card">
                {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="blog-card-img" />}
                <div className="blog-card-body">
                  <div className="blog-card-date">{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div className="blog-card-title">{post.title}</div>
                  <div className="blog-card-excerpt">{post.excerpt || post.content?.substring(0, 150) + '...'}</div>
                  <Link to={`/blog/${post.slug}`} className="blog-card-link">Read more</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Blog;
