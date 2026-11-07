import { useEffect, useRef, useState } from 'react';
import { useContent, useSite } from '../context/SiteContext.jsx';
import { usePageMeta } from '../lib/meta.js';
import PageHero from '../components/PageHero.jsx';
import CardImage from '../components/CardImage.jsx';
import Icon from '../components/Icon.jsx';
import VideoPlayer from '../components/VideoPlayer.jsx';
import { imgUrl } from '../lib/image.js';

function ProjectDialog({ project, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (project && d && !d.open) d.showModal();
    if (!project && d?.open) d.close();
  }, [project]);

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()} aria-labelledby="project-title">
      {project && (
        <div className="dialog__body">
          <button className="dialog__close" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
          {project.image?.url && <img className="dialog__cover" src={imgUrl(project.image, { w: 1100, h: 600 })} alt="" />}
          <div className="dialog__text">
            <p className="project__meta">{[project.category, project.date, project.location].filter(Boolean).join(', ')}</p>
            <h2 id="project-title">{project.title}</h2>
            <p>{project.summary}</p>
            {project.impactFigure && (
              <p className="project__impact"><strong>{project.impactFigure}</strong> {project.impactLabel} <span className={`tag ${project.verified ? 'tag--ok' : ''}`}>{project.verified ? 'Verified' : 'Founder-reported'}</span></p>
            )}
          </div>
          {project.video && <div className="dialog__video"><VideoPlayer url={project.video} title={project.title} /></div>}
          {project.gallery?.length > 0 && (
            <div className="dialog__gallery">
              {project.gallery.map((g) => <img key={g.url} src={imgUrl(g, { w: 480, h: 360 })} alt={g.alt || ''} loading="lazy" />)}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

export default function Projects() {
  const { data } = useSite();
  const hero = useContent('projects.hero');
  const impact = useContent('projects.impact');
  const [open, setOpen] = useState(null);
  usePageMeta('Projects and impact', hero.subtitle);

  return (
    <>
      <PageHero title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      <section className="band band--light">
        <div className="wrap">
          <div className="sechead">
            <h2>{impact.title}</h2>
            {impact.note && <p>{impact.note}</p>}
          </div>
          {data.projects.length === 0 ? (
            <p className="empty">{impact.empty}</p>
          ) : (
            <ul className="projects">
              {data.projects.map((p) => (
                <li key={p.id}>
                  <button className="project" onClick={() => setOpen(p)}>
                    <div className="project__media"><CardImage image={p.image} seed={p.title} w={720} h={540} /></div>
                    <div className="project__body">
                      <p className="project__meta">{[p.category, p.date, p.location].filter(Boolean).join(', ')}</p>
                      <h3>{p.title}</h3>
                      <p>{p.summary}</p>
                      {p.impactFigure && (
                        <p className="project__impact"><strong>{p.impactFigure}</strong> {p.impactLabel} <span className={`tag ${p.verified ? 'tag--ok' : ''}`}>{p.verified ? 'Verified' : 'Founder-reported'}</span></p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <ProjectDialog project={open} onClose={() => setOpen(null)} />
    </>
  );
}
