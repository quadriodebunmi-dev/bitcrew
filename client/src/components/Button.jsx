import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { isExternal } from '../lib/text.js';

export function LinkButton({ to = '#', variant = 'primary', arrow = false, children, className = '', ...rest }) {
  const cls = `btn btn--${variant} ${className}`.trim();
  const inner = (
    <>
      {children}
      {arrow && <Icon name="arrow" size={16} strokeWidth={2.2} />}
    </>
  );
  if (isExternal(to)) {
    const newTab = /^https?:/i.test(to);
    return (
      <a className={cls} href={to} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {inner}
      </a>
    );
  }
  if (to.startsWith('#')) return <a className={cls} href={to} {...rest}>{inner}</a>;
  return <Link className={cls} to={to} {...rest}>{inner}</Link>;
}

export function Button({ variant = 'primary', arrow = false, children, className = '', ...rest }) {
  return (
    <button className={`btn btn--${variant} ${className}`.trim()} {...rest}>
      {children}
      {arrow && <Icon name="arrow" size={16} strokeWidth={2.2} />}
    </button>
  );
}
