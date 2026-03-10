import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { mockUsers } from '../../lib/mockData'
import { ROLES } from '../../lib/constants'
import {
    Users, Search, ChevronDown, Shield, ShieldCheck, GraduationCap,
    MoreVertical, X, UserCog, Ban, CheckCircle2
} from 'lucide-react'

export default function UserManagementPage() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const [users, setUsers] = useState(mockUsers)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [roleModal, setRoleModal] = useState(null) // user object or null
    const [newRole, setNewRole] = useState('')

    const filtered = useMemo(() => {
        return users.filter(u => {
            const name = isRTL ? u.full_name_ar : u.full_name
            const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
            const matchRole = roleFilter === 'all' || u.role === roleFilter
            const matchStatus = statusFilter === 'all' || u.status === statusFilter
            return matchSearch && matchRole && matchStatus
        })
    }, [users, search, roleFilter, statusFilter, isRTL])

    const handleToggleStatus = (id) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' } : u))
    }

    const handleChangeRole = () => {
        if (roleModal && newRole) {
            setUsers(prev => prev.map(u => u.id === roleModal.id ? { ...u, role: newRole } : u))
            setRoleModal(null)
        }
    }

    const roleIcons = {
        student: <GraduationCap size={14} />,
        club_admin: <Shield size={14} />,
        system_admin: <ShieldCheck size={14} />,
    }
    const roleColors = {
        student: 'bg-blue-500/15 text-blue-400',
        club_admin: 'bg-purple-500/15 text-purple-400',
        system_admin: 'bg-brand-400/15 text-brand-400',
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('admin.users.title')}</h1>
                <p className="text-text-secondary mt-1">{filtered.length} users</p>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="text" placeholder={t('admin.users.search')} value={search} onChange={e => setSearch(e.target.value)} className="w-full ps-10 pe-4 py-2.5 bg-surface-card border border-surface-border rounded-xl text-text-primary placeholder:text-text-muted text-sm" />
                </div>
                <div className="relative">
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="appearance-none px-4 py-2.5 pe-10 bg-surface-card border border-surface-border rounded-xl text-text-primary text-sm cursor-pointer">
                        <option value="all">All Roles</option>
                        <option value="student">Student</option>
                        <option value="club_admin">Club Admin</option>
                        <option value="system_admin">System Admin</option>
                    </select>
                    <ChevronDown size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
                <div className="relative">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="appearance-none px-4 py-2.5 pe-10 bg-surface-card border border-surface-border rounded-xl text-text-primary text-sm cursor-pointer">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                    </select>
                    <ChevronDown size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
                <div className="hidden md:grid grid-cols-[1fr_1fr_120px_100px_100px] gap-4 px-5 py-3 border-b border-surface-border text-sm text-text-muted font-medium">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div>Status</div>
                    <div className="text-end">Actions</div>
                </div>
                <AnimatePresence>
                    {filtered.map(user => (
                        <motion.div
                            key={user.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_100px_100px] gap-3 md:gap-4 px-5 py-3.5 border-b border-surface-border last:border-0 hover:bg-white/[0.02] transition-colors items-center"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center text-brand-400 font-semibold border border-brand-400/20 shrink-0">
                                    {(isRTL ? user.full_name_ar : user.full_name).charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">{isRTL ? user.full_name_ar : user.full_name}</p>
                                    {user.student_id && <p className="text-xs text-text-muted">ID: {user.student_id}</p>}
                                </div>
                            </div>
                            <div className="text-sm text-text-secondary truncate hidden md:block">{user.email}</div>
                            <div>
                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${roleColors[user.role]}`}>
                                    {roleIcons[user.role]}
                                    {user.role.replace('_', ' ')}
                                </span>
                            </div>
                            <div>
                                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${user.status === 'active' ? 'bg-status-success/15 text-status-success' : 'bg-status-error/15 text-status-error'}`}>
                                    {user.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 md:justify-end">
                                <button onClick={() => { setRoleModal(user); setNewRole(user.role) }} className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-brand-400 transition-colors" title={t('admin.users.editRole')}>
                                    <UserCog size={16} />
                                </button>
                                <button onClick={() => handleToggleStatus(user.id)} className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-status-warning transition-colors" title={user.status === 'active' ? t('admin.users.disable') : 'Enable'}>
                                    {user.status === 'active' ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                    <div className="p-12 text-center">
                        <Users size={40} className="mx-auto text-text-muted mb-3" />
                        <p className="text-text-secondary">No users found.</p>
                    </div>
                )}
            </div>

            {/* Role Change Modal */}
            <AnimatePresence>
                {roleModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setRoleModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-sm"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-5 border-b border-surface-border">
                                <h2 className="text-lg font-bold text-text-primary">{t('admin.users.editRole')}</h2>
                                <button onClick={() => setRoleModal(null)} className="p-2 rounded-lg hover:bg-white/5 text-text-muted"><X size={20} /></button>
                            </div>
                            <div className="p-5 space-y-4">
                                <p className="text-sm text-text-secondary">
                                    Changing role for <span className="text-text-primary font-medium">{isRTL ? roleModal.full_name_ar : roleModal.full_name}</span>
                                </p>
                                <div className="space-y-2">
                                    {Object.values(ROLES).map(role => (
                                        <button
                                            key={role} onClick={() => setNewRole(role)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-colors ${newRole === role ? 'border-brand-400 bg-brand-400/10 text-brand-400' : 'border-surface-border text-text-secondary hover:bg-white/5'}`}
                                        >
                                            {roleIcons[role]}
                                            {role.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 p-5 border-t border-surface-border">
                                <button onClick={() => setRoleModal(null)} className="px-5 py-2.5 rounded-xl border border-surface-border text-text-secondary hover:text-text-primary hover:bg-white/5 text-sm font-medium transition-colors">{t('common.cancel')}</button>
                                <button onClick={handleChangeRole} className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-opacity">{t('common.save')}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
