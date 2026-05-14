import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { getEventComments, addComment, deleteComment, togglePinComment, subscribeToEventComments } from '../../lib/api/comments'
import toast from 'react-hot-toast'
import { MessageSquare, Send, Pin, Trash2, MoreVertical } from 'lucide-react'

export default function EventDiscussion({ eventId, isClubAdmin }) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const { user, profile } = useAuth()
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [posting, setPosting] = useState(false)
    const textareaRef = useRef(null)

    useEffect(() => {
        if (!eventId) return
        
        const loadComments = () => {
            getEventComments(eventId)
                .then(setComments)
                .catch(err => console.error('Failed to load comments:', err))
                .finally(() => setLoading(false))
        }
        
        loadComments()
        
        const channel = subscribeToEventComments(eventId, () => {
            // Refetch all comments on change to get joined profile data safely
            loadComments()
        })
        
        return () => {
            if (channel) channel.unsubscribe()
        }
    }, [eventId])

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [newComment])

    const handlePost = async () => {
        if (!newComment.trim() || !user) return
        setPosting(true)
        try {
            const comment = await addComment(eventId, user.id, newComment.trim())
            setComments(prev => [...prev, comment])
            setNewComment('')
        } catch (err) {
            toast.error(err.message || 'Failed to post comment')
        } finally {
            setPosting(false)
        }
    }

    const handleTogglePin = async (id, currentPinStatus) => {
        try {
            await togglePinComment(id, !currentPinStatus)
            setComments(prev => prev.map(c => c.id === id ? { ...c, is_pinned: !currentPinStatus } : c))
        } catch (err) {
            toast.error(err.message || 'Failed to pin comment')
        }
    }

    const handleDelete = async (id) => {
        try {
            await deleteComment(id)
            setComments(prev => prev.filter(c => c.id !== id))
        } catch (err) {
            toast.error(err.message || 'Failed to delete comment')
        }
    }

    const sorted = [...comments].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1
        if (!a.is_pinned && b.is_pinned) return 1
        return new Date(a.created_at) - new Date(b.created_at)
    })

    const formatTime = (d) => new Date(d).toLocaleString(isRTL ? 'ar-OM' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

    if (loading) {
        return <div className="text-center text-text-muted text-sm py-4">Loading comments...</div>
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <MessageSquare size={20} className="text-brand-400" />
                {t('events.details.discussion')} ({comments.length})
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                    {sorted.map(comment => {
                        const canModify = isClubAdmin || user?.id === comment.user_id
                        const authorName = isRTL ? (comment.user?.full_name_ar || comment.user?.full_name) : comment.user?.full_name

                        return (
                            <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className={`p-3 rounded-xl ${comment.is_pinned ? 'bg-brand-400/[0.05] border border-brand-400/20' : 'bg-surface-darker border border-surface-border'}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center text-brand-400 text-xs font-bold shrink-0 border border-brand-400/20">
                                        {(authorName || '?').charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                            <span className="text-sm font-medium text-text-primary">{authorName}</span>
                                            {comment.user?.role === 'club_admin' && <span className="text-[10px] bg-brand-400/15 text-brand-400 px-1.5 py-0.5 rounded font-medium">Admin</span>}
                                            {comment.is_pinned && <Pin size={12} className="text-brand-400" />}
                                            <span className="text-xs text-text-muted">{formatTime(comment.created_at)}</span>
                                        </div>
                                        <p className="text-sm text-text-secondary break-words">{comment.content}</p>
                                    </div>
                                    {canModify && (
                                        <div className="flex items-center gap-0.5 shrink-0">
                                            {isClubAdmin && (
                                                <button onClick={() => handleTogglePin(comment.id, comment.is_pinned)} className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${comment.is_pinned ? 'text-brand-400' : 'text-text-muted hover:text-brand-400'}`}>
                                                    <Pin size={13} />
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(comment.id)} className="p-1.5 rounded-lg hover:bg-status-error/10 text-text-muted hover:text-status-error transition-colors cursor-pointer">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
                {comments.length === 0 && (
                    <div className="text-center py-6 text-sm text-text-muted border border-surface-border border-dashed rounded-xl">
                        Be the first to comment on this event.
                    </div>
                )}
            </div>

            {/* Add Comment */}
            {user ? (
                <div className="flex gap-2 items-end">
                    <textarea
                        ref={textareaRef} rows={1} value={newComment} onChange={e => setNewComment(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost() } }}
                        placeholder={t('events.details.writeComment')}
                        className="flex-1 px-4 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm placeholder:text-text-muted resize-none min-h-[40px] max-h-32"
                    />
                    <button onClick={handlePost} disabled={!newComment.trim() || posting} className="p-2.5 rounded-xl gradient-bg text-white hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0 cursor-pointer">
                        <Send size={18} />
                    </button>
                </div>
            ) : (
                <div className="text-sm text-text-muted text-center py-2 bg-surface-darker rounded-xl border border-surface-border">
                    Please log in to participate in the discussion.
                </div>
            )}
        </div>
    )
}
