import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import UnderwaterBackground from './components/UnderwaterBackground';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy page bundles for faster initial load
const HomePage = lazy(() => import('./pages/HomePage'));
const PrizesPage = lazy(() => import('./pages/PrizesPage'));
const RulesPage = lazy(() => import('./pages/RulesPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const WinnersPage = lazy(() => import('./pages/WinnersPage'));
const VerifyTokenPage = lazy(() => import('./pages/VerifyTokenPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminEntriesPage = lazy(() => import('./pages/AdminEntriesPage'));
const AdminPrizesPage = lazy(() => import('./pages/AdminPrizesPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const AdminDrawPage = lazy(() => import('./pages/AdminDrawPage'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <UnderwaterBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Suspense fallback={<LoadingSpinner message="Loading..." />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <HomePage />
                  </main>
                  <Footer />
                </>
              } />

              <Route path="/prizes" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <PrizesPage />
                  </main>
                  <Footer />
                </>
              } />

              <Route path="/rules" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <RulesPage />
                  </main>
                  <Footer />
                </>
              } />

              <Route path="/register" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <RegisterPage />
                  </main>
                  <Footer />
                </>
              } />

              <Route path="/winners" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <WinnersPage />
                  </main>
                  <Footer />
                </>
              } />

              <Route path="/verify" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <VerifyTokenPage />
                  </main>
                  <Footer />
                </>
              } />

              <Route path="/verify/:entryCode" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <VerifyTokenPage />
                  </main>
                  <Footer />
                </>
              } />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout><AdminDashboard /></AdminLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/entries" element={
                <ProtectedRoute>
                  <AdminLayout><AdminEntriesPage /></AdminLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/prizes" element={
                <ProtectedRoute>
                  <AdminLayout><AdminPrizesPage /></AdminLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/settings" element={
                <ProtectedRoute>
                  <AdminLayout><AdminSettingsPage /></AdminLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/draw" element={
                <ProtectedRoute>
                  <AdminLayout><AdminDrawPage /></AdminLayout>
                </ProtectedRoute>
              } />

              {/* 404 Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;