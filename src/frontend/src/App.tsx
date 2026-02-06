import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import SubmitStoryPage from './pages/SubmitStoryPage';
import StoryDetailPage from './pages/StoryDetailPage';
import AdminModerationPage from './pages/AdminModerationPage';
import AboutPage from './pages/AboutPage';
import TroubleshootingPage from './pages/TroubleshootingPage';
import DiscussionsPage from './pages/DiscussionsPage';
import ContactPage from './pages/ContactPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/AppLayout';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const storiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stories',
  component: FeedPage,
});

const submitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/submit',
  component: SubmitStoryPage,
});

const storyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/story/$title',
  component: StoryDetailPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminModerationPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});

const troubleshootingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/troubleshooting',
  component: TroubleshootingPage,
});

const discussionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/discussions',
  component: DiscussionsPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage,
});

const articlesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/articles',
  component: ArticlesPage,
});

const articleDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/article/$title',
  component: ArticleDetailPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const mySubmissionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-submissions',
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute, 
  storiesRoute, 
  submitRoute, 
  storyRoute, 
  adminRoute, 
  aboutRoute,
  troubleshootingRoute,
  discussionsRoute,
  contactRoute,
  articlesRoute,
  articleDetailRoute,
  loginRoute,
  mySubmissionsRoute
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
