import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import RFIDAttendance from "./pages/RFIDAttendance.jsx";
import TeacherDashboard from "./pages/teacher/TeacherDashboard.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import InscriptionPage from "./pages/InscriptionPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/inscription" element={<InscriptionPage />} />
      <Route path="/admin/login"   element={<LoginPage role="admin"   />} />
      <Route path="/teacher/login" element={<LoginPage role="teacher" />} />
      <Route path="/student/login" element={<LoginPage role="student" />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/admin"   element={<ProtectedRoute role="admin">   <AdminDashboard />   </ProtectedRoute>} />
      <Route path="/teacher" element={<ProtectedRoute role="teacher"> <TeacherDashboard /> </ProtectedRoute>} />
      <Route path="/student" element={<ProtectedRoute role="student"> <StudentDashboard /> </ProtectedRoute>} />
      <Route path="/rfid-attendance" element={<ProtectedRoute roles={["admin", "teacher"]}><RFIDAttendance /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
