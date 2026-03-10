import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { mockMembers } from '../../lib/mockData'
import {
    Users, Search, Check, X, UserMinus, ChevronDown,
    CheckCircle2, Clock, XCircle, Mail
} from 'lucide-react'

export default function MemberManagementPage() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const [members, setMembers] = useState(mockMembers)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedIds, setSelectedIds] = useState([])

    const filtered = useMemo(() => {
        return members.filter(m => {
            const name = isRTL ? m.full_name_ar : m.full_name
            const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
                m.email.toLowerCase().includes(search.toLowerCase()) ||
                m.student_id.toLowerCase().includes(search.toLowerCase())
            const matchStatus = statusFilter === 'all' || m.status === statusFilter
            return matchSearch && matchStatus
        })
    }, [members, search, statusFilter, isRTL])

    const pendingCount = members.filter(m => m.status === 'pending').length
    const approvedCount = members.filter(m => m.status === 'approved').length

    const handleApprove = (id) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'approved' } : m))
        setSelectedIds(prev => prev.filter(i => i !== id))
    }

    const handleReject = (id) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'rejected' } : m))
        setSelectedIds(prev => prev.filter(i => i !== id))
    }

    const handleRemove = (id) => {
        setMembers(prev => prev.filter(m => m.id !== id))
        setSelectedIds(prev => prev.filter(i => i !== id))
    }

    const handleBulkApprove = () => {
        setMembers(prev => prev.map(m => selectedIds.includes(m.id) ? { ...m, status: 'approved' } : m))
        setSelectedIds([])
    }

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const toggleSelectAll = () => {
        const pendingIds = filtered.filter(m => m.status === 'pending').map(m => m.id)
        const allSelected = pendingIds.every(id => selectedIds.includes(id))
        setSelectedIds(allSelected ? selectedIds.filter(id => !pendingIds.includes(id)) : [...new Set([...selectedIds, ...pendingIds])])
    }

    const statusIcons = {
        approved: <CheckCircle2 size={14} className="text-status-success" />,
        pending: <Clock size={14} className="text-status-warning" />,
        rejected: <XCircle size={14} className="text-status-error" />,
    }
    const statusColors = {
        approved: 'bg-status-success/15 text-status-success',
        pending: 'bg-status-warning/15 text-status-warning',
        rejected: 'bg-status-error/15 text-status-error',
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('clubAdmin.members.title')}</h1>
                <p className="text-text-secondary mt-1">{approvedCount} active · {pendingCount} pending</p>
            </motion.div>

            {/* Filters & Bulk Actions */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text" placeholder="Search by name, email, or ID..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full ps-10 pe-4 py-2.5 bg-surface-card border border-surface-border rounded-xl text-text-primary placeholder:text-text-muted text-sm"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="appearance-none px-4 py-2.5 pe-10 bg-surface-card border border-surface-border rounded-xl text-text-primary text-sm cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <ChevronDown size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    </div>
                </div>
                {selectedIds.length > 0 && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        onClick={handleBulkApprove}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        <Check size={16} />
                        Approve Selected ({selectedIds.length})
                    </motion.button>
                )}
            </div>

            {/* Members Table */}
            <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-[auto_1fr_1fr_120px_160px] gap-4 px-5 py-3 border-b border-surface-border text-sm text-text-muted font-medium">
                    <div className="w-6">
                        <input
                            type="checkbox"
                            checked={filtered.filter(m => m.status === 'pending').length > 0 && filtered.filter(m => m.status === 'pending').every(m => selectedIds.includes(m.id))}
                            onChange={toggleSelectAll}
                            className="accent-brand-400 rounded"
                        />
                    </div>
                    <div>Name</div>
                    <div>Contact</div>
                    <div>Status</div>
                    <div className="text-end">Actions</div>
                </div>

                <AnimatePresence>
                    {filtered.map(member => (
                        <motion.div
                            key={member.id} layout
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_120px_160px] gap-3 md:gap-4 px-5 py-3.5 border-b border-surface-border last:border-0 hover:bg-white/[0.02] transition-colors items-center"
                        >
                            <div className="hidden md:block w-6">
                                {member.status === 'pending' && (
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(member.id)}
                                        onChange={() => toggleSelect(member.id)}
                                        className="accent-brand-400 rounded"
                                    />
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center text-brand-400 font-semibold border border-brand-400/20 shrink-0">
                                    {(isRTL ? member.full_name_ar : member.full_name).charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">{isRTL ? member.full_name_ar : member.full_name}</p>
                                    <p className="text-xs text-text-muted md:hidden">{member.email}</p>
                                </div>
                            </div>
                            <div className="hidden md:block min-w-0">
                                <p className="text-sm text-text-secondary flex items-center gap-1 truncate"><Mail size={14} className="shrink-0" />{member.email}</p>
                                <p className="text-xs text-text-muted mt-0.5">ID: {member.student_id}</p>
                            </div>
                            <div>
                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${statusColors[member.status]}`}>
                                    {statusIcons[member.status]}
                                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 md:justify-end">
                                {member.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleApprove(member.id)} className="p-2 rounded-lg hover:bg-status-success/10 text-text-muted hover:text-status-success transition-colors" title={t('clubAdmin.members.approve')}>
                                            <Check size={16} />
                                        </button>
                                        <button onClick={() => handleReject(member.id)} className="p-2 rounded-lg hover:bg-status-error/10 text-text-muted hover:text-status-error transition-colors" title={t('clubAdmin.members.reject')}>
                                            <X size={16} />
                                        </button>
                                    </>
                                )}
                                {member.status === 'approved' && (
                                    <button onClick={() => handleRemove(member.id)} className="p-2 rounded-lg hover:bg-status-error/10 text-text-muted hover:text-status-error transition-colors" title={t('clubAdmin.members.remove')}>
                                        <UserMinus size={16} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filtered.length === 0 && (
                    <div className="p-12 text-center">
                        <Users size={40} className="mx-auto text-text-muted mb-3" />
                        <p className="text-text-secondary">No members found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
