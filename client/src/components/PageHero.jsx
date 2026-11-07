import CardImage from './CardImage.jsx';

export default function PageHero({ title, subtitle, image, children }) {
  return (
    <header className="pagehero">
      <div className="pagehero__grid" aria-hidden="true" />
      <div className="wrap pagehero__inner">
        <div className="pagehero__text">
          <h1>{title}</h1>
          {subtitle && <p className="lead">{subtitle}</p>}
          {children}
        </div>
        {image?.url && (
          <div className="pagehero__media">
            <CardImage image={image} w={900} h={700} eager />
          </div>
        )}
      </div>
    </header>
  );
}
