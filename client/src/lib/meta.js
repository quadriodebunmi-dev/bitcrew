import { useEffect } from 'react';
import { useContent } from '../context/SiteContext.jsx';

// Sets the tab title and meta description for the current page.
export function usePageMeta(title, description) {
  const site = useContent('site');
  useEffect(() => {
    const brand = site.brandName || 'BitCrew Network';
    document.title = title ? `${title} | ${brand}` : `${brand} | ${site.tagline || ''}`.replace(/ \| $/, '');
    const text = description || site.seoDescription || '';
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = 'description';
      document.head.appendChild(tag);
    }
    tag.content = text.slice(0, 300);
  }, [title, description, site.brandName, site.tagline, site.seoDescription]);
}
