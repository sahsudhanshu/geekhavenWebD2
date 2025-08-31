import React, { useEffect, useState } from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthContextProvider } from './context/authContext.tsx'
import App from './App.tsx';
import HomePage from './pages/HomePage.tsx';
import ErrorPage from './pages/ErrorPage.tsx';

import ProductListPage, { productListLoader, } from './pages/ProductListPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import ProtectedRoute from './components/auth.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import ProductDetailPage, { productDetailLoader } from './components/ProductDetailPage.tsx';
import API from './services/useFetch.tsx';

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
        path: 'products',
        element: <ProductListPage />,
        loader: productListLoader,
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
    }
    validTokenChecker()
  }, [])

  return (
    <AuthContextProvider value={{ token, setToken, userDetails, setUserDetails }}>
      <RouterProvider router={router} />
    </AuthContextProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootProvider />
  </React.StrictMode>
);