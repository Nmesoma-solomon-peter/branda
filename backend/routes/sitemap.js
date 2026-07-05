const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://branda-five.vercel.app';
    const posts = await Post.find({ published: true }).select('slug updatedAt createdAt').sort({ createdAt: -1 });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/login', priority: '0.6', changefreq: 'monthly' },
      { loc: '/register', priority: '0.8', changefreq: 'monthly' },
      { loc: '/faq', priority: '0.7', changefreq: 'weekly' },
      { loc: '/blog', priority: '0.9', changefreq: 'daily' },
      { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
      { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
      { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
      { loc: '/tools/brand-name', priority: '0.5', changefreq: 'monthly' },
      { loc: '/tools/color-palette', priority: '0.5', changefreq: 'monthly' }
    ];

    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.loc}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const post of posts) {
      const lastmod = (post.updatedAt || post.createdAt).toISOString().split('T')[0];
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += '</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
