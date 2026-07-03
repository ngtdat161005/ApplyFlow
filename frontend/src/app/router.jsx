import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout } from '../components/layout/AppLayout.jsx';
import ApplicationDetailPage from '../pages/ApplicationDetailPage/ApplicationDetailPage.jsx';
import ApplicationsPage from '../pages/ApplicationsPage/ApplicationsPage.jsx';
import DashboardPage from '../pages/DashboardPage/DashboardPage.jsx';
import LoginPage from '../pages/LoginPage/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage/RegisterPage.jsx';
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/applications',
        element: <ApplicationsPage />,
      },
      {
        path: '/applications/:applicationId',
        element: <ApplicationDetailPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
