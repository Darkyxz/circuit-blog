import { NextResponse } from 'next/server'

export function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  const robots = `# Robots.txt para Circuit Blog
# https://circuit-blog.onrender.com

User-agent: *
Allow: /
Allow: /blog
Allow: /posts/
Allow: /search
Allow: /about
Allow: /contact

# Disallow admin and private areas
Disallow: /admin/
Disallow: /login
Disallow: /write
Disallow: /setup-admin
Disallow: /api/

# Disallow search parameters to avoid duplicate content
Disallow: /*?*

# Allow specific search parameters
Allow: /blog?cat=*
Allow: /search?*

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
