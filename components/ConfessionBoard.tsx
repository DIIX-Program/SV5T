import React, { useState } from 'react';
import { Confession } from '../types';
import { Heart, MessageCircle, Send, Plus, X, Trash2 } from 'lucide-react';

interface Props {
    confessions: Confession[];
    onAddConfession: (confession: Omit<Confession, 'id' | 'createdAt' | 'likes' | 'commentsList'>) => void;
    onUpdateConfession?: (confession: Confession) => void;
    onDeleteConfession?: (id: string) => void;
}

const TAGS = [
    { label: 'Áp lực học tập', value: 'study', color: 'bg-rose-100 text-rose-600' },
    { label: 'Peer Pressure', value: 'peer', color: 'bg-violet-100 text-violet-600' },
    { label: 'Chuyện tình cảm', value: 'love', color: 'bg-pink-100 text-pink-600' },
    { label: 'Khác', value: 'other', color: 'bg-slate-100 text-slate-600' },
];

const CARD_COLORS = [
    'bg-white',
    'bg-orange-50',
    'bg-blue-50',
    'bg-purple-50',
    'bg-pink-50',
    'bg-green-50',
];

const ConfessionBoard: React.FC<Props> = ({ confessions, onAddConfession, onUpdateConfession, onDeleteConfession }) => {
    const [showForm, setShowForm] = useState(false);
    const [newContent, setNewContent] = useState('');
    const [selectedTag, setSelectedTag] = useState(TAGS[0]);
    const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0]);
    const [commentingId, setCommentingId] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState('');

    const handleSubmit = () => {
        if (!newContent.trim()) return;
        onAddConfession({
            content: newContent,
            tag: selectedTag.label,
            color: selectedColor,
            commentsList: []
        });
        setNewContent('');
        setShowForm(false);
    };

    const handleLike = (confession: Confession) => {
        if (onUpdateConfession) {
            onUpdateConfession({
                ...confession,
                likes: confession.likes + 1
            });
        }
    };

    const handleSubmitComment = (confession: Confession) => {
        if (!commentContent.trim() || !onUpdateConfession) return;

        const newComment = {
            id: Math.random().toString(36).substr(2, 9),
            author: 'Ẩn danh',
            content: commentContent,
            createdAt: new Date().toISOString()
        };

        onUpdateConfession({
            ...confession,
            commentsList: [...(confession.commentsList || []), newComment]
        });
        setCommentContent('');
        setCommentingId(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Góc Tâm Sự 💭</h2>
                    <p className="text-slate-500">Nơi chia sẻ ẩn danh về những áp lực và câu chuyện của bạn.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
                >
                    {showForm ? <><X size={20} /> Hủy bỏ</> : <><Plus size={20} /> Viết tâm sự</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl animate-in slide-in-from-top-4 duration-300">
                    <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Bạn đang nghĩ gì? (Sẽ được đăng ẩn danh)"
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-200 min-h-[120px] mb-4 text-slate-700 placeholder:text-slate-400"
                    />

                    <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
                            {TAGS.map(tag => (
                                <button
                                    key={tag.value}
                                    onClick={() => setSelectedTag(tag)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-2 ${selectedTag.value === tag.value
                                        ? 'border-slate-800 bg-slate-800 text-white'
                                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    {tag.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            {CARD_COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${color} ${selectedColor === color ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!newContent.trim()}
                            className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                        >
                            <Send size={18} /> Đăng
                        </button>
                    </div>
                </div>
            )}

            {confessions.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium italic">Chưa có tâm sự nào. Hãy là người đầu tiên chia sẻ!</p>
                </div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {confessions.map((confession) => (
                        <div
                            key={confession.id}
                            className={`break-inside-avoid ${confession.color} p-6 rounded-3xl transition-all hover:-translate-y-1 hover:shadow-xl duration-300 border border-black/5`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 bg-white/60 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                    {confession.tag}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400">
                                        {new Date(confession.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                    {onDeleteConfession && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteConfession(confession.id);
                                            }}
                                            className="text-slate-300 hover:text-rose-500 transition-all p-1"
                                            title="Xóa bài viết"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <p className="text-slate-800 font-medium leading-relaxed mb-6 whitespace-pre-wrap">
                                {confession.content}
                            </p>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4 pt-4 border-t border-black/5">
                                    <button
                                        onClick={() => handleLike(confession)}
                                        className="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 transition-colors group"
                                    >
                                        <Heart size={18} className="group-hover:fill-current transition-colors" />
                                        <span className="text-xs font-bold">{confession.likes}</span>
                                    </button>
                                    <button
                                        onClick={() => setCommentingId(commentingId === confession.id ? null : confession.id)}
                                        className={`flex items-center gap-1.5 transition-colors ${commentingId === confession.id ? 'text-blue-500' : 'text-slate-400 hover:text-blue-500'}`}
                                    >
                                        <MessageCircle size={18} />
                                        <span className="text-xs font-bold">{(confession.commentsList || []).length}</span>
                                    </button>
                                </div>

                                {commentingId === confession.id && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="max-h-40 overflow-y-auto space-y-3 mb-3 pr-1 custom-scrollbar">
                                            {(confession.commentsList || []).map(comment => (
                                                <div key={comment.id} className="bg-white/50 p-3 rounded-xl text-sm">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-slate-700 text-xs">{comment.author}</span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600">{comment.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                value={commentContent}
                                                onChange={(e) => setCommentContent(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(confession)}
                                                placeholder="Viết bình luận..."
                                                className="flex-1 bg-white/50 border border-transparent focus:bg-white focus:border-blue-200 rounded-xl px-3 py-2 text-sm outline-none transition-all"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleSubmitComment(confession)}
                                                disabled={!commentContent.trim()}
                                                className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConfessionBoard;
