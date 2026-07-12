import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import AppShell from '../components/layout/AppShell.jsx';

import LoginPage from '../pages/LoginPage.jsx';
import SignUpPage from '../pages/SignUpPage.jsx';
import ForgotPasswordPage from '../pages/ForgotPasswordPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ProductsPage from '../pages/ProductsPage.jsx';
import CategoriesPage from '../pages/CategoriesPage.jsx';
import SuppliersPage from '../pages/SuppliersPage.jsx';
import StockInPage from '../pages/StockInPage.jsx';
import StockOutPage from '../pages/StockOutPage.jsx';
import TransactionsPage from '../pages/TransactionsPage.jsx';
import ProfitPage from '../pages/ProfitPage.jsx';
import ReportsPage from '../pages/ReportsPage.jsx';
import UsersPage from '../pages/UsersPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';

// Shared by /login, /signup, and /forgot-password — none of the three
// make sense to show someone who's already got a valid session, so all
// three redirect to the dashboard instead in that case.
function GuestRoute({ children }) {
  const { isAuthenticated, restoring } = useAuth();
  if (restoring) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><SignUpPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="stock-in" element={<StockInPage />} />
        <Route path="stock-out" element={<StockOutPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="profit" element={<ProfitPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route
          path="users"
          element={
            <ProtectedRoute adminOnly>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
