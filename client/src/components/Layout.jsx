import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent, useSite } from '../context/SiteContext.jsx';
import { LinkButton } from './Button.jsx';
import Logo from './Logo.jsx';
import Icon from './Icon.jsx';
import { ErrorScreen, Splash } from './Splash.jsx';
import { isExternal } from '../lib/text.js';

gsap.registerPlugin(ScrollTrigger);

const NAV = [
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/team', label: 'Team' },
  { to: '/videos', label: 'Videos' },
  { to: '/community', label: 'Community' },
  { to: '/academy', label: 'Academy' },
  { to: '/projects', label: 'Impact' },
  { to: '/partnerships', label: 'Partners' },
  { to: '/contact', label: 'Contact' },
];

function Header({ site }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    document.body.classList.toggle('no-scroll', open);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => { document.body.classList.remove('no-scroll'); window.removeEventListener('keydown', esc); };
  }, [open]);

  const cta = site.navCta || {};
  return (
    <header className={`header ${solid || open ? 'header--solid' : ''}`}>
      <div className="header__bar wrap--wide">
        <Logo site={site} />
        <nav className="header__nav" aria-label="Main">
          {NAV.map((n) => <NavLink key={n.to} to={n.to}>{n.label}</NavLink>)}
        </nav>
        <div className="header__actions">
          {cta.label && <LinkButton to={cta.link || '/community'} className="header__cta">{cta.label}</LinkButton>}
          <button className="header__toggle" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((o) => !o)}>
            <Icon name={open ? 'close' : 'menu'} size={22} />
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>
      <nav id="mobile-nav" className={`mobilenav ${open ? 'is-open' : ''}`} aria-label="Mobile" hidden={!open}>
        {NAV.map((n) => <NavLink key={n.to} to={n.to}>{n.label}</NavLink>)}
        {cta.label && <LinkButton to={cta.link || '/community'}>{cta.label}</LinkButton>}
      </nav>
    </header>
  );
}

function Footer({ site }) {
  const socials = (site.socials || []).filter((s) => s.handle || s.url);
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div className="footer__brand">
          <Logo site={site} />
          {site.slogan && <p className="footer__slogan">{site.slogan}</p>}
          {site.footerNote && <p className="footer__note">{site.footerNote}</p>}
        </div>
        <div>
          <h2 className="footer__title">Explore</h2>
          <ul>{NAV.map((n) => <li key={n.to}><Link to={n.to}>{n.label}</Link></li>)}</ul>
        </div>
        <div>
          <h2 className="footer__title">Get in touch</h2>
          <ul>
            {site.email && <li><a href={`mailto:${site.email}`}>{site.email}</a></li>}
            {site.phone && <li><a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a></li>}
            {site.location && <li>{site.location}</li>}
          </ul>
        </div>
        <div>
          <h2 className="footer__title">Follow</h2>
          <ul>
            {socials.map((s) => (
              <li key={s.label}>
                {s.url ? (
                  <a href={s.url} {...(isExternal(s.url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {s.label} <span className="footer__handle">{s.handle}</span>
                  </a>
                ) : (
                  <span>{s.label} <span className="footer__handle">{s.handle}</span></span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="wrap footer__bottom">
        <span>© {new Date().getFullYear()} {site.brandName}. All rights reserved.</span>
        <Link to="/privacy">Privacy notice</Link>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { status, error, reload } = useSite();
  const site = useContent('site');
  const { pathname } = useLocation();

  // New page = start at the top, and let ScrollTrigger re-measure.
  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => ScrollTrigger.refresh(), 150);
    return () => clearTimeout(t);
  }, [pathname]);

  if (status === 'loading') return <Splash label="Loading BitCrew Network" />;
  if (status === 'error') return <ErrorScreen error={error} onRetry={reload} />;

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header site={site} />
      <main id="main"><Outlet /></main>
      <Footer site={site} />
    </>
  );
}
