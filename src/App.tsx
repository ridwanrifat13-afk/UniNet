import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

// Optimized Lazy Loading - Re-applying for speed
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const Archives = lazy(() => import('./pages/Archives'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Chat = lazy(() => import('./pages/Chat'));
const Events = lazy(() => import('./pages/Events'));
const Projects = lazy(() => import('./pages/Projects'));
const Clubs = lazy(() => import('./pages/Clubs'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Notices = lazy(() => import('./pages/notices'));
const Contacts = lazy(() => import('./pages/Contacts'));
const About = lazy(() => import('./pages/About'));

const PageLoader = () => (
  <div className="h-[60vh] w-full flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-brand-magenta animate-spin opacity-20" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:id" element={<Profile />} />
            <Route path="archives" element={<Archives />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="chat" element={<Chat />} />
            <Route path="events" element={<Events />} />
            <Route path="projects" element={<Projects />} />
            <Route path="clubs" element={<Clubs />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="notices" element={<Notices />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
