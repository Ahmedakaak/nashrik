import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { getClubByAdminId } from '../../lib/api/clubs'
import { getEventsByClub } from '../../lib/api/events'
import { findRegistrationByScannedCode, getEventAttendees, markAttended } from '../../lib/api/registrations'
import { PageLoader } from '../../components/common/LoadingSpinner'
import { Html5QrcodeScanner } from 'html5-qrcode'
import toast from 'react-hot-toast'
import { QrCode, Camera, CheckCircle2, XCircle, AlertTriangle, Search, Clock, Hash } from 'lucide-react'

export default function QRScannerPage() {
    const { t, i18n } = useTranslation()
    const { user } = useAuth()
    const isRTL = i18n.language === 'ar'
    const [clubEvents, setClubEvents] = useState([])
    const [selectedEvent, setSelectedEvent] = useState('')
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(true)
    const [scanning, setScanning] = useState(false)
    const [manualId, setManualId] = useState('')
    const [scanResult, setScanResult] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (!user) return
        async function load() {
            try {
                const c = await getClubByAdminId(user.id)
                if (c?.status === 'approved') {
                    const events = await getEventsByClub(c.id)
                    setClubEvents(events)
                    if (events.length > 0) { 
                        setSelectedEvent(events[0].id)
                        setAttendance(await getEventAttendees(events[0].id)) 
                    }
                }
            } catch (err) { console.error(err) }
            finally { setLoading(false) }
        }
        load()
    }, [user])

    useEffect(() => {
        if (!selectedEvent) return
        getEventAttendees(selectedEvent).then(setAttendance).catch(console.error)
    }, [selectedEvent])

    // --- HTML5 QR Code Scanner Logic ---
    useEffect(() => {
        if (!scanning) return

        // Initialize scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        )

        scanner.render(
            (decodedText) => {
                // On Success
                scanner.clear()
                setScanning(false)
                handleScannedId(decodedText)
            },
            (error) => {
                // On Error/Scanning - usually ignore unless debugging
            }
        )

        return () => {
            scanner.clear().catch(console.error)
        }
    }, [scanning])

    const handleScannedId = async (id) => {
        const token = id.trim()
        let record = attendance.find(a => a.event_id === selectedEvent && (a.id === token || a.qr_token === token))
        if (!record) {
            try {
                record = await findRegistrationByScannedCode(token)
            } catch (err) {
                setScanResult({ type: 'error', message: err.message })
                return
            }
        }
        if (!record) { 
            setScanResult({ type: 'error', message: t('clubAdmin.scanner.notRegistered') || 'Invalid QR code. Registration not found.' }) 
        }
        else if (record.status !== 'confirmed') {
            setScanResult({ type: 'error', message: `Registration is ${record.status}. Attendance cannot be marked.` })
        }
        else if (record.attended) { 
            setScanResult({ type: 'warning', message: t('clubAdmin.scanner.alreadyScanned') || 'Already scanned.' }) 
        }
        else {
            try {
                const updated = await markAttended(record.id, 'qr')
                if (record.event_id !== selectedEvent) {
                    setSelectedEvent(record.event_id)
                    const nextAttendance = await getEventAttendees(record.event_id)
                    setAttendance(nextAttendance.map(a => a.id === record.id ? { ...a, ...updated } : a))
                } else {
                    setAttendance(prev => prev.map(a => a.id === record.id ? { ...a, ...updated } : a))
                }
                setScanResult({ type: 'success', message: `${t('clubAdmin.scanner.success') || 'Success'} — ${record.profile?.full_name}` })
            } catch (err) { setScanResult({ type: 'error', message: err.message }) }
        }
    }

    const handleManualEntry = async () => {
        if (!manualId.trim()) return
        const record = attendance.find(a => a.profile?.student_id?.toLowerCase() === manualId.trim().toLowerCase())
        if (!record) { setScanResult({ type: 'error', message: t('clubAdmin.scanner.notRegistered') || 'Student ID not found in registrations.' }) }
        else if (record.status !== 'confirmed') { setScanResult({ type: 'error', message: `Registration is ${record.status}. Attendance cannot be marked.` }) }
        else if (record.attended) { setScanResult({ type: 'warning', message: t('clubAdmin.scanner.alreadyScanned') || 'Already scanned.' }) }
        else {
            try {
                const updated = await markAttended(record.id, 'manual')
                setAttendance(prev => prev.map(a => a.id === record.id ? { ...a, ...updated } : a))
                setScanResult({ type: 'success', message: `${t('clubAdmin.scanner.success') || 'Success'} — ${record.profile?.full_name}` })
            } catch (err) { setScanResult({ type: 'error', message: err.message }) }
        }
        setManualId('')
    }

    const attendedCount = attendance.filter(a => a.attended).length
    const totalRegistered = attendance.length
    const filteredAttendance = attendance.filter(a => (a.profile?.full_name || '').toLowerCase().includes(search.toLowerCase()) || (a.profile?.student_id || '').toLowerCase().includes(search.toLowerCase()))
    
    const resultColors = { success: 'border-status-success bg-status-success/10 text-status-success', error: 'border-status-error bg-status-error/10 text-status-error', warning: 'border-status-warning bg-status-warning/10 text-status-warning' }
    const resultIcons = { success: CheckCircle2, error: XCircle, warning: AlertTriangle }

    if (loading) return <PageLoader />

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('clubAdmin.scanner.title') || 'QR Scanner'}</h1>
                <p className="text-text-secondary mt-1">Scan student QR codes to mark attendance</p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <label className="text-sm text-text-secondary mb-2 block">Select Event</label>
                        <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400">
                            {clubEvents.length === 0 && <option value="">No events available</option>}
                            {clubEvents.map(e => <option key={e.id} value={e.id}>{isRTL ? e.title_ar : e.title}</option>)}
                        </select>
                    </div>

                    <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <div className="mx-auto bg-surface-darker rounded-xl border-2 border-dashed border-surface-border flex flex-col items-center justify-center mb-4 relative overflow-hidden min-h-[250px]">
                            {scanning ? (
                                <div id="reader" className="w-full h-full"></div>
                            ) : (
                                <div className="text-center p-6">
                                    <QrCode size={48} className="mx-auto mb-2 text-text-muted" />
                                    <p className="text-sm text-text-muted">Camera is inactive</p>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={() => selectedEvent && setScanning(!scanning)}
                            disabled={!selectedEvent}
                            className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-opacity ${selectedEvent ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'} ${scanning ? 'bg-status-error/10 text-status-error hover:bg-status-error/20' : 'gradient-bg text-white hover:opacity-90'}`}
                        >
                            {scanning ? <XCircle size={18} /> : <Camera size={18} />}
                            {scanning ? 'Stop Scanning' : 'Start Camera Scanner'}
                        </button>
                    </div>

                    <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><Hash size={16} className="text-brand-400" />Manual Entry</h3>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Enter Student ID..." value={manualId} onChange={e => setManualId(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleManualEntry()} className="flex-1 px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm placeholder:text-text-muted outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400" />
                            <button onClick={handleManualEntry} disabled={!selectedEvent} className={`px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-opacity ${selectedEvent ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                                {t('common.submit') || 'Submit'}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {scanResult && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`border rounded-2xl p-4 flex items-center gap-3 ${resultColors[scanResult.type]}`}>
                                {(() => { const Icon = resultIcons[scanResult.type]; return <Icon size={20} /> })()}
                                <p className="text-sm font-medium">{scanResult.message}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-text-primary">Attendance List</h3>
                        <div className="flex items-center gap-2 text-sm"><span className="text-status-success font-medium">{attendedCount}</span><span className="text-text-muted">/ {totalRegistered}</span></div>
                    </div>
                    
                    <div className="h-2 bg-surface-darker rounded-full mb-4 overflow-hidden">
                        <div className="h-full gradient-bg rounded-full transition-all duration-500" style={{ width: `${totalRegistered ? (attendedCount / totalRegistered) * 100 : 0}%` }} />
                    </div>
                    
                    <div className="relative mb-3">
                        <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="w-full ps-9 pe-3 py-2 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm placeholder:text-text-muted outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400" />
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredAttendance.map(record => (
                            <div key={record.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${record.attended ? 'bg-status-success/15 text-status-success' : 'bg-surface-darker text-text-muted'}`}>
                                    {record.attended ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">{record.profile?.full_name}</p>
                                    <p className="text-xs text-text-muted">{record.profile?.student_id}</p>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${record.attended ? 'bg-status-success/15 text-status-success' : 'bg-surface-darker text-text-muted'}`}>
                                    {record.attended ? 'Attended' : record.status === 'confirmed' ? 'Registered' : record.status}
                                </span>
                            </div>
                        ))}
                        {filteredAttendance.length === 0 && (
                            <div className="text-center py-8 text-sm text-text-muted">No students found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
