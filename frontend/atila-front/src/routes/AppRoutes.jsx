import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Pages
import Home from '../pages/Home';
import Servicios from '../pages/Servicios';
import Convenios from '../pages/Convenios';
import Contacto from '../pages/Contacto';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyEmail from '../pages/VerifyEmail';
import ConfirmarCita from '../pages/ConfirmarCita';
import AdminDashboard from '../pages/AdminDashboard';
import StaffDashboard from '../pages/StaffDashboard';
import AgendaPublica from '../pages/AgendaPublica';

import AgendaAdmin from '../components/admin/AgendaAdmin';
import SolicitudesAdmin from '../components/admin/SolicitudesAdmin';
import AgendaStaff from '../components/staff/AgendaStaff';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/servicios" element={<MainLayout><Servicios /></MainLayout>} />
            <Route path="/convenios" element={<MainLayout><Convenios /></MainLayout>} />
            <Route path="/contacto" element={<MainLayout><Contacto /></MainLayout>} />
            <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
            <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
            <Route path="/verify-email/:uid/:token" element={<MainLayout><VerifyEmail /></MainLayout>} />
            <Route path="/confirmar-cita/:token" element={<MainLayout><ConfirmarCita /></MainLayout>} />
            <Route path="/agenda-publica" element={<MainLayout><AgendaPublica /></MainLayout>} />

            {/* Protected Routes - ADMIN */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<MainLayout><AdminDashboard /></MainLayout>} />
                <Route path="/admin/agenda" element={<MainLayout><AgendaAdmin /></MainLayout>} />
                <Route path="/admin/solicitudes" element={<MainLayout><SolicitudesAdmin /></MainLayout>} />
            </Route>

            {/* Protected Routes - STAFF/PERSONAL */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PERSONAL', 'STAFF']} />}>
                <Route path="/staff" element={<MainLayout><StaffDashboard /></MainLayout>} />
                <Route path="/staff/agenda" element={<MainLayout><AgendaStaff /></MainLayout>} />
            </Route>

            {/* 404 - Redirect to Home */}
            <Route path="*" element={<Home />} />
        </Routes>
    );
};

export default AppRoutes;
