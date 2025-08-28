import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthContextProvider } from './context/authContext.tsx'
import App from './App.tsx';
import HomePage from './pages/HomePage.tsx';
import ErrorPage from './pages/ErrorPage.tsx';

import ProductListPage, {
  productListLoader,
} from './pages/ProductListPage.tsx';
import LoginPage from './pages/LoginPage.tsx';

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
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
]);

const RootProvider: React.FC = () => {
  const [token, setTokenState] = useState<string | null>(null);

  const setToken = (token: string | null) => {
    setTokenState(token)
  }
  useEffect(() => {
    const t = localStorage.getItem('token')?.toString()
    if (t) setToken(t)

  }, [])

  return (
    <AuthContextProvider value={{ token, setToken }}>
      <RouterProvider router={router} />
    </AuthContextProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootProvider />
  </React.StrictMode>
);