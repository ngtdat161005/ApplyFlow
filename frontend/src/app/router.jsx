import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout } from '../components/layout/AppLayout.jsx';
import { ProtectedRoute, PublicOnlyRoute } from '../features/auth/components/AuthRoutes.jsx';
import ApplicationDetailPage from '../pages/ApplicationDetailPage/ApplicationDetailPage.jsx';
import ApplicationsPage from '../pages/ApplicationsPage/ApplicationsPage.jsx';
import DashboardPage from '../pages/DashboardPage/DashboardPage.jsx';
import ForgotPasswordPage from '../pages/ForgotPasswordPage/ForgotPasswordPage.jsx';
import LoginPage from '../pages/LoginPage/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage/RegisterPage.jsx';
import ResetPasswordPage from '../pages/ResetPasswordPage/ResetPasswordPage.jsx';
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
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
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
