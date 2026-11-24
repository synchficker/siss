
export const slugFromPath = (base, path) => {
  let s = path.startsWith(base) ? path.slice(base.length) : path.replace(/^\/+/, '');
  s = s.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/^\/+|\/+$/g, '');
  return s;
};
export const pageUrl = (base, slug) => base + (slug ? slug + '/' : '');
export const parentSlug = (slug) => slug.includes('/') ? slug.slice(0, slug.lastIndexOf('/')) : '';
