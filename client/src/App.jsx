import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SiteProvider } from './context/SiteContext.jsx';
import Layout from './components/Layout.jsx';
import { Splash } from './components/Splash.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import Team from './pages/Team.jsx';
import Videos from './pages/Videos.jsx';
import Community from './pages/Community.jsx';
import Academy from './pages/Academy.jsx';
import Projects from './pages/Projects.jsx';
import Partnerships from './pages/Partnerships.jsx';
import Contact from './pages/Contact.jsx';
import Privacy from './pages/Privacy.jsx';
import NotFound from './pages/NotFound.jsx';

// The dashboard is its own chunk, so visitors never download it.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

function PublicSite() {
  return (
    <SiteProvider>
      <Layout />
    </SiteProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<Splash label="Loading dashboard" />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route element={<PublicSite />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="services" element={<Services />} />
        <Route path="team" element={<Team />} />
        <Route path="videos" element={<Videos />} />
        <Route path="community" element={<Community />} />
        <Route path="academy" element={<Academy />} />
        <Route path="projects" element={<Projects />} />
        <Route path="partnerships" element={<Partnerships />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
