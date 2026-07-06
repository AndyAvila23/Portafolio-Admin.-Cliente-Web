import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import StudentLayout from '../layouts/StudentLayout';

// Pages
import PublicLanding from '../pages/public/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminCourses from '../pages/admin/Courses';
import AdminCourseDetail from '../pages/admin/CourseDetail';
import AdminUsers from '../pages/admin/Users';
import StudentHome from '../pages/student/Home';
import MyCourses from '../pages/student/MyCourses';
import CourseViewer from '../pages/student/CourseViewer';
import Certificates from '../pages/student/Certificates';
import Profile from '../pages/shared/Profile';
import Reports from '../pages/shared/Reports';

const AppRoutes = () => {
  const { isLoading } = useAuth();

  if (isLoading) return <div>Cargando la aplicación...</div>;

  return (
    <Routes>
      <Route path="/" element={<PublicLanding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="courses/:id" element={<AdminCourseDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="profile" element={<Profile />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<StudentHome />} />
        <Route path="my-courses" element={<MyCourses />} />
        <Route path="course/:id" element={<CourseViewer />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<div>Página no encontrada (404)</div>} />
    </Routes>
  );
};

export default AppRoutes;
