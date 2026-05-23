import React, { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Trash2, Edit2, Search, UserCheck, UserX, Filter } from 'lucide-react';
import { getAllUsers, deleteUser, toggleUserActive } from '../../api/userService';
import { ui } from '../../utilities/ui';
import EditUserModal from './EditUserModal';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [editingUser, setEditingUser] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            setError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const user = users.find(u => u.id === id);
        const confirmed = await ui.confirm({
            title: 'Eliminar Usuario',
            message: `¿Estás seguro de que quieres eliminar a ${user?.full_name || 'este usuario'}? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            variant: 'danger',
        });
        if (!confirmed) return;
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
            ui.success('Usuario eliminado correctamente');
        } catch (err) {
            ui.error(err.detail || err.error || 'Error al eliminar usuario');
        }
    };

    const handleToggleActive = async (user) => {
        const isDeactivating = user.is_active;
        const confirmed = await ui.confirm({
            title: isDeactivating ? 'Desactivar Usuario' : 'Activar Usuario',
            message: isDeactivating
                ? `¿Desactivar a ${user.full_name}? No podrá acceder al sistema y su sesión será cerrada inmediatamente.`
                : `¿Reactivar a ${user.full_name}? Podrá volver a iniciar sesión en el sistema.`,
            confirmText: isDeactivating ? 'Desactivar' : 'Activar',
            variant: isDeactivating ? 'warning' : 'success',
        });
        if (!confirmed) return;
        try {
            setTogglingId(user.id);
            const result = await toggleUserActive(user.id);
            setUsers(prev => prev.map(u =>
                u.id === user.id ? { ...u, is_active: result.is_active } : u
            ));
            const msg = result.is_active ? 'Usuario activado exitosamente' : 'Usuario desactivado exitosamente';
            ui.success(msg);
        } catch (err) {
            ui.error(err.error || 'Error al cambiar estado del usuario');
        } finally {
            setTogglingId(null);
        }
    };

    const toggleRoleFilter = () => {
        const roles = ['ALL', 'ADMIN', 'STAFF', 'CLIENT'];
        const currentIndex = roles.indexOf(roleFilter);
        const nextIndex = (currentIndex + 1) % roles.length;
        setRoleFilter(roles[nextIndex]);
    };

    const toggleStatusFilter = () => {
        const states = ['ALL', 'ACTIVE', 'INACTIVE'];
        const currentIndex = states.indexOf(statusFilter);
        const nextIndex = (currentIndex + 1) % states.length;
        setStatusFilter(states[nextIndex]);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
    };

    const filteredUsers = users.filter(user => {
        // Text Search
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.full_name.toLowerCase().includes(searchTerm.toLowerCase());

        // Role match
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

        // Status match
        const matchesStatus = statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' ? user.is_active : !user.is_active);

        return matchesSearch && matchesRole && matchesStatus;
    });

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-700';
            case 'STAFF': return 'bg-blue-100 text-blue-700';
            default: return 'bg-emerald-100 text-emerald-700';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-8 font-inter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
                    <p className="text-slate-500 mt-1">Administra los accesos y roles del sistema</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Usuario</th>
                                <th
                                    className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left cursor-pointer hover:bg-slate-100 transition-colors select-none group"
                                    onClick={toggleRoleFilter}
                                >
                                    <div className="flex items-center gap-2">
                                        Rol
                                        {roleFilter !== 'ALL' && (
                                            <span className={`px-2 py-0.5 rounded text-[10px] ${roleFilter === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                roleFilter === 'STAFF' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {roleFilter === 'ADMIN' ? 'Administrador' : roleFilter === 'STAFF' ? 'Personal' : 'Cliente'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Cargo</th>
                                <th
                                    className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left cursor-pointer hover:bg-slate-100 transition-colors select-none group"
                                    onClick={toggleStatusFilter}
                                >
                                    <div className="flex items-center gap-2">
                                        Estado
                                        {statusFilter !== 'ALL' && (
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusFilter === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                                {statusFilter === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors group ${!user.is_active ? 'opacity-60' : ''}`}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getRoleColor(user.role).replace('100', '50')}`}>
                                                    <span className="font-bold text-sm uppercase">{user.username.substring(0, 2)}</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{user.full_name}</p>
                                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Mail size={10} /> {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleColor(user.role)}`}>
                                                {user.role === 'ADMIN' ? 'Administrador' : user.role === 'STAFF' ? 'Personal' : 'Cliente'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                                                <Briefcase size={14} className="text-slate-400" />
                                                {user.position}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.is_active
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {user.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleToggleActive(user)}
                                                    disabled={togglingId === user.id}
                                                    className={`p-2 rounded-lg transition-all ${user.is_active
                                                        ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        } ${togglingId === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title={user.is_active ? 'Desactivar Usuario' : 'Activar Usuario'}
                                                >
                                                    {user.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors"
                                                    title="Editar Usuario"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-400">
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <EditUserModal
                isOpen={!!editingUser}
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSave={loadUsers}
            />
        </div>
    );
};

export default UserList;
