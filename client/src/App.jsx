import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Code-split routes with React.lazy for instant initial page loads (<100KB)
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const InscriptionPage = lazy(() => import("./pages/InscriptionPage.jsx"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage.jsx"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const SousAdminDashboard = lazy(() => import("./pages/admin/SousAdminDashboard.jsx"));
const ModeratorDashboard = lazy(() => import("./pages/admin/ModeratorDashboard.jsx"));
const CertificatePreview = lazy(() => import("./pages/admin/CertificatePreview.jsx"));
const RFIDAttendance = lazy(() => import("./pages/RFIDAttendance.jsx"));
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard.jsx"));
const MobileTeacherApp = lazy(() => import("./pages/teacher/MobileTeacherApp.jsx"));
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-brand-600 border-t-transparent dark:border-brand-400" />
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 animate-pulse">TFC School...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/inscription" element={<InscriptionPage />} />
        <Route path="/login"            element={<LoginPage />} />
        <Route path="/admin/login"      element={<LoginPage role="admin"      />} />
        <Route path="/sous-admin/login" element={<LoginPage role="sous-admin" />} />
        <Route path="/moderator/login"  element={<LoginPage role="moderator"  />} />
        <Route path="/teacher/login"    element={<LoginPage role="teacher"    />} />
        <Route path="/student/login"    element={<LoginPage role="student"    />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin"      element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/sous-admin" element={<ProtectedRoute role="sous-admin"><SousAdminDashboard /></ProtectedRoute>} />
        <Route path="/moderator"  element={<ProtectedRoute role="moderator"><ModeratorDashboard /></ProtectedRoute>} />
        <Route path="/teacher"        element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/app"    element={<ProtectedRoute role="teacher"><MobileTeacherApp /></ProtectedRoute>} />
        <Route path="/student"    element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/rfid-attendance" element={<ProtectedRoute roles={["admin", "teacher"]}><RFIDAttendance /></ProtectedRoute>} />
        <Route path="/admin/certificate-preview" element={<ProtectedRoute role="admin"><CertificatePreview /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
