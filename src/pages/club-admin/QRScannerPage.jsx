import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { mockEvents, mockAttendanceRecords, ADMIN_CLUB_ID } from '../../lib/mockData'
import {
    QrCode, Camera, CheckCircle2, XCircle, AlertTriangle,
    Users, Search, Clock, Hash
} from 'lucide-react'

export default function QRScannerPage() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const clubEvents = mockEvents.filter(e => e.club_id === ADMIN_CLUB_ID)
    const [selectedEvent, setSelectedEvent] = useState(clubEvents[0]?.id || '')
    const [attendance, setAttendance] = useState(mockAttendanceRecords)
    const [scanning, setScanning] = useState(false)
    const [manualId, setManualId] = useState('')
    const [scanResult, setScanResult] = useState(null) // { type: 'success' | 'error' | 'warning', message }
    const [search, setSearch] = useState('')

    const attendedCount = attendance.filter(a => a.status === 'attended').length
    const totalRegistered = attendance.length

    const simulateScan = () => {
        setScanning(true)
        setScanResult(null)
        setTimeout(() => {
            setScanning(false)
            const unscanned = attendance.find(a => !a.scanned_at)
            if (unscanned) {
                setAttendance(prev => prev.map(a =>
                    a.id === unscanned.id ? { ...a, scanned_at: new Date().toISOString(), status: 'attended' } : a
                ))
                setScanResult({ type: 'success', message: `${t('clubAdmin.scanner.success')} — ${unscanned.full_name}` })
            } else {
                setScanResult({ type: 'warning', message: 'All registered students have been scanned.' })
            }
        }, 1500)
    }

    const handleManualEntry = () => {
        if (!manualId.trim()) return
        const record = attendance.find(a => a.student_id === manualId.trim().toUpperCase())
        if (!record) {
            setScanResult({ type: 'error', message: t('clubAdmin.scanner.notRegistered') })
        } else if (record.scanned_at) {
            setScanResult({ type: 'warning', message: t('clubAdmin.scanner.alreadyScanned') })
        } else {
            setAttendance(prev => prev.map(a =>
                a.id === record.id ? { ...a, scanned_at: new Date().toISOString(), status: 'attended' } : a
            ))
            setScanResult({ type: 'success', message: `${t('clubAdmin.scanner.success')} — ${record.full_name}` })
        }
        setManualId('')
    }

    const filteredAttendance = attendance.filter(a =>
        a.full_name.toLowerCase().includes(search.toLowerCase()) ||
        a.student_id.toLowerCase().includes(search.toLowerCase())
    )

    const resultColors = {
        success: 'border-status-success bg-status-success/10 text-status-success',
        error: 'border-status-error bg-status-error/10 text-status-error',
        warning: 'border-status-warning bg-status-warning/10 text-status-warning',
    }

    const resultIcons = {
        success: CheckCircle2,
        error: XCircle,
        warning: AlertTriangle,
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('clubAdmin.scanner.title')}</h1>
                <p className="text-text-secondary mt-1">Scan student QR codes to mark attendance</p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Scanner Panel */}
                <div className="space-y-4">
                    {/* Event Selector */}
                    <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <label className="text-sm text-text-secondary mb-2 block">Select Event</label>
                        <select
                            value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}
                            className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm"
                        >
                            {clubEvents.map(e => (
                                <option key={e.id} value={e.id}>{isRTL ? e.title_ar : e.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Scanner Area */}
                    <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <div className="aspect-square max-h-64 mx-auto bg-surface-darker rounded-xl border-2 border-dashed border-surface-border flex items-center justify-center mb-4 relative overflow-hidden">
                            {scanning ? (
                                <motion.div
                                    animate={{ y: ['-100%', '100%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute inset-x-0 h-1 bg-brand-400 shadow-[0_0_20px_rgba(62,207,142,0.5)]"
                                />
                            ) : null}
                            <div className="text-center">
                                <QrCode size={48} className={`mx-auto mb-2 ${scanning ? 'text-brand-400' : 'text-text-muted'}`} />
                                <p className="text-sm text-text-muted">
                                    {scanning ? t('clubAdmin.scanner.scanning') : 'Point camera at QR code'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={simulateScan}
                            disabled={scanning}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            <Camera size={18} />
                            {scanning ? t('clubAdmin.scanner.scanning') : 'Simulate Scan'}
                        </button>
                    </div>

                    {/* Manual Entry */}
                    <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                            <Hash size={16} className="text-brand-400" />
                            Manual Entry
                        </h3>
                        <div className="flex gap-2">
                            <input
                                type="text" placeholder="Enter Student ID..." value={manualId}
                                onChange={e => setManualId(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleManualEntry()}
                                className="flex-1 px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm placeholder:text-text-muted"
                            />
                            <button onClick={handleManualEntry} className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-opacity">
                                {t('common.submit')}
                            </button>
                        </div>
                    </div>

                    {/* Scan Result */}
                    <AnimatePresence>
                        {scanResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className={`border rounded-2xl p-4 flex items-center gap-3 ${resultColors[scanResult.type]}`}
                            >
                                {(() => { const Icon = resultIcons[scanResult.type]; return <Icon size={20} /> })()}
                                <p className="text-sm font-medium">{scanResult.message}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Attendance List */}
                <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-text-primary">Attendance List</h3>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-status-success font-medium">{attendedCount}</span>
                            <span className="text-text-muted">/ {totalRegistered}</span>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="h-2 bg-surface-darker rounded-full mb-4 overflow-hidden">
                        <div
                            className="h-full gradient-bg rounded-full transition-all duration-500"
                            style={{ width: `${totalRegistered ? (attendedCount / totalRegistered) * 100 : 0}%` }}
                        />
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                        <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text" placeholder="Search students..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full ps-9 pe-3 py-2 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm placeholder:text-text-muted"
                        />
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredAttendance.map(record => (
                            <div key={record.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${record.scanned_at ? 'bg-status-success/15 text-status-success' : 'bg-surface-darker text-text-muted'}`}>
                                    {record.scanned_at ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">{record.full_name}</p>
                                    <p className="text-xs text-text-muted">{record.student_id}</p>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${record.scanned_at ? 'bg-status-success/15 text-status-success' : 'bg-surface-darker text-text-muted'}`}>
                                    {record.scanned_at ? 'Attended' : 'Registered'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
