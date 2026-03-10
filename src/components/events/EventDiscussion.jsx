import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { MessageSquare, Send, Pin, Trash2, MoreVertical } from 'lucide-react'

const mockComments = [
    { id: 'c1', user: 'Sara Al-Habsi', user_ar: 'سارة الحبسي', text: 'Super excited for this event! Can we bring our own laptops?', text_ar: 'متحمسة جداً لهذا الحدث! هل يمكننا إحضار أجهزتنا؟', pinned: true, created_at: '2026-03-05T10:00:00', isAdmin: false },
    { id: 'c2', user: 'Omar Al-Rawahi', user_ar: 'عمر الرواحي', text: 'Yes, please bring your laptop with Python installed.', text_ar: 'نعم، يرجى إحضار حاسوبك مع تثبيت بايثون.', pinned: false, created_at: '2026-03-05T11:30:00', isAdmin: true },
    { id: 'c3', user: 'Fatma Al-Balushi', user_ar: 'فاطمة البلوشي', text: 'Will there be refreshments?', text_ar: 'هل ستكون هناك مرطبات؟', pinned: false, created_at: '2026-03-05T14:00:00', isAdmin: false },
]

export default function EventDiscussion({ eventId }) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const { profile } = useAuth()
    const [comments, setComments] = useState(mockComments)
    const [newComment, setNewComment] = useState('')
    const textareaRef = useRef(null)

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [newComment])

    const handlePost = () => {
        if (!newComment.trim()) return
        const comment = {
            id: `c-${Date.now()}`, user: profile?.full_name || 'You', user_ar: profile?.full_name || 'أنت',
            text: newComment, text_ar: newComment, pinned: false, created_at: new Date().toISOString(), isAdmin: false,
        }
        setComments(prev => [...prev, comment])
        setNewComment('')
    }

    const togglePin = (id) => setComments(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c))
    const deleteComment = (id) => setComments(prev => prev.filter(c => c.id !== id))

    const sorted = [...comments].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return new Date(a.created_at) - new Date(b.created_at)
    })

    const formatTime = (d) => new Date(d).toLocaleString(isRTL ? 'ar-OM' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <MessageSquare size={20} className="text-brand-400" />
                {t('events.details.discussion')} ({comments.length})
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                    {sorted.map(comment => (
                        <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`p-3 rounded-xl ${comment.pinned ? 'bg-brand-400/[0.05] border border-brand-400/20' : 'bg-surface-darker border border-surface-border'}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center text-brand-400 text-xs font-bold shrink-0 border border-brand-400/20">
                                    {(isRTL ? comment.user_ar : comment.user).charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm font-medium text-text-primary">{isRTL ? comment.user_ar : comment.user}</span>
                                        {comment.isAdmin && <span className="text-[10px] bg-brand-400/15 text-brand-400 px-1.5 py-0.5 rounded font-medium">Admin</span>}
                                        {comment.pinned && <Pin size={12} className="text-brand-400" />}
                                        <span className="text-xs text-text-muted">{formatTime(comment.created_at)}</span>
                                    </div>
                                    <p className="text-sm text-text-secondary">{isRTL ? comment.text_ar : comment.text}</p>
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                    <button onClick={() => togglePin(comment.id)} className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors ${comment.pinned ? 'text-brand-400' : 'text-text-muted hover:text-brand-400'}`}><Pin size={13} /></button>
                                    <button onClick={() => deleteComment(comment.id)} className="p-1.5 rounded-lg hover:bg-status-error/10 text-text-muted hover:text-status-error transition-colors"><Trash2 size={13} /></button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add Comment */}
            <div className="flex gap-2 items-end">
                <textarea
                    ref={textareaRef} rows={1} value={newComment} onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost() } }}
                    placeholder={t('events.details.writeComment')}
                    className="flex-1 px-4 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm placeholder:text-text-muted resize-none min-h-[40px] max-h-32"
                />
                <button onClick={handlePost} disabled={!newComment.trim()} className="p-2.5 rounded-xl gradient-bg text-white hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0">
                    <Send size={18} />
                </button>
            </div>
        </div>
    )
}
