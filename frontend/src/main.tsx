import React, { useEffect, useState, Suspense } from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthContextProvider } from './context/authContext.tsx'
import App from './App.tsx';
import HomePage from './pages/HomePage.tsx';
import ErrorPage from './pages/ErrorPage.tsx';

import LoginPage from './pages/LoginPage.tsx';
import ProtectedRoute from './components/auth.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import ProductDetailPage, { productDetailLoader } from './components/ProductDetailPage.tsx';
import API from './services/useFetch.tsx';
import CartPage from './pages/CartPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import { SeedThemeProvider } from './context/seedTheme.tsx';
import LogsRecentPage from './pages/LogsRecentPage.tsx';
import SellerDashboardPage from './pages/SellerDashboardPage.tsx';
import SellerUpgradePage from './pages/SellerUpgradePage.tsx';
import LikedProductsPage from './pages/LikedProductsPage.tsx';
import BookmarkedProductsPage from './pages/BookmarkedProductsPage.tsx';
import SellerProfilePage from './pages/SellerProfilePage.tsx';
import HealthzPage from './pages/HealthzPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'profile',
        element: (<ProtectedRoute><ProfilePage /></ProtectedRoute>)
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />,
        loader: productDetailLoader,
      },
      {
        path: 'cart',
        element: <CartPage />
      },
      {
        path: 'logs',
        element: <LogsRecentPage />
      },
      {
        path: 'about',
        element: <AboutPage />
      },
      {
        path: 'seller/dashboard',
        element: (<ProtectedRoute><SellerDashboardPage /></ProtectedRoute>)
      }
      ,{
        path: 'seller/upgrade',
        element: (<ProtectedRoute><SellerUpgradePage /></ProtectedRoute>)
      },
      {
        path: 'favorites/liked',
        element: (<ProtectedRoute><LikedProductsPage /></ProtectedRoute>)
      },
      {
        path: 'favorites/bookmarked',
        element: (<ProtectedRoute><BookmarkedProductsPage /></ProtectedRoute>)
      }
      ,{
        path: 'seller/:id',
        element: <SellerProfilePage />
      }
      ,{
        path: 'IIT2024081/healthz',
        element: <HealthzPage />
      }
    ],
  },
  {
    path: 'login',
    element: <LoginPage initialView='login' />,
  },
  {
    path: 'register',
    element: <LoginPage initialView='register' />,
  },
]);

const RootProvider: React.FC = () => {
  const [token, setTokenState] = useState<string | null>(null);
  const [userDetails, setUserDetailsState] = useState<{} | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const setToken = (token: string | null) => {
    setTokenState(token)
    if (token !== null) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }
  const setUserDetails = (detail: {} | null) => {
    setUserDetailsState(detail)
  }
  useEffect(() => {
    const validTokenChecker = async () => {
      const t = localStorage.getItem('token')
      const tokenValue: string | null = t !== undefined ? t : null
      if (tokenValue) {
        try {
          const req = await API.post('/auth/validate', {}, tokenValue)
          if (req.status === 200) {
            setToken(tokenValue)
            setUserDetails(req.data)
          } else {
            localStorage.removeItem('token')
          }
        } catch {
          localStorage.removeItem('token')
        }
      }
      else {
        localStorage.removeItem('token')
      }
      setAuthReady(true);
    }
    validTokenChecker()
  }, [])

  return (
    <SeedThemeProvider>
      <AuthContextProvider value={{ token, setToken, userDetails, setUserDetails, authReady }}>
  {!authReady ? (
          <div className="min-h-screen flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Initializing...
          </div>
        ) : (
          <Suspense fallback={<div className="p-4 text-sm text-gray-500 dark:text-gray-400">Loading...</div>}>
            <RouterProvider router={router} />
          </Suspense>
        )}
      </AuthContextProvider>
    </SeedThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootProvider />
  </React.StrictMode>
);