import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import FeedPage from './pages/FeedPage';
import SubmitStoryPage from './pages/SubmitStoryPage';
import StoryDetailPage from './pages/StoryDetailPage';
import AdminModerationPage from './pages/AdminModerationPage';
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

const routeTree = rootRoute.addChildren([indexRoute, submitRoute, storyRoute, adminRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
