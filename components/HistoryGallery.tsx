import React from 'react';
import { HistoryItem } from '../services/dataService';

interface HistoryGalleryProps {
    history: HistoryItem[];
    onClose: () => void;
}

export const HistoryGallery: React.FC<HistoryGalleryProps> = ({ history, onClose }) => {

    const handleDownload = async (item: HistoryItem) => {
        try {
            // Convert Base64/URL to Blob
            const response = await fetch(item.image_url);
            const blob = await response.blob();

            // Create Object URL
            const url = window.URL.createObjectURL(blob);

            // Create temporary link
            const link = document.createElement('a');
            link.href = url;
            link.download = `chitram-${item.id}.png`;
            document.body.appendChild(link);

            // Trigger click
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
            // Fallback: Open in new tab
            window.open(item.image_url, '_blank');
        }
    };

    const handleShare = async (item: HistoryItem) => {
        try {
            const response = await fetch(item.image_url);
            const blob = await response.blob();
            const file = new File([blob], `chitram-${item.id}.png`, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Chitram Studio',
                    text: `Check out my image created with Chitram! https://chitram-website.vercel.app/`,
                });
            } else {
                const text = encodeURIComponent(`Check out my image created with Chitram! https://chitram-website.vercel.app/`);
                window.open(`https://wa.me/?text=${text}`, '_blank');
            }
        } catch (err) {
            console.error("Share failed:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Your Studio History</h2>
                        <p className="text-slate-500 text-sm">Past generations saved to your account</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    {history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-lg font-medium text-slate-400">No history yet</p>
                            <p className="text-sm text-slate-400">Create your first poster to see it here!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {history.map((item) => (
                                <div key={item.id} className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-200 shadow-md hover:shadow-xl transition-all duration-300">
                                    <img
                                        src={item.image_url}
                                        alt="Generated Poster"
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={() => handleDownload(item)}
                                            className="bg-white hover:bg-slate-100 text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download
                                        </button>
                                        <button
                                            onClick={() => handleShare(item)}
                                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/50 px-4 py-2 rounded-full text-sm font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zM12.05 20.21c-1.5 0-2.97-.4-4.26-1.16l-.3-.18-3.16.83.84-3.08-.2-.32a8.26 8.26 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 012.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c.25-.12 1.47-.72 1.68-.81.21-.09.36-.13.52.12.15.25.6 1.02.73 1.23.13.22.23.37-.02.5-.25.13-1.05.39-2 .81-.75.33-1.26.74-1.41.92-.15.18-.32.39-.32.74 0 .35.18.59.38.8.2.21.9.35 1.23.35.33 0 .66-.01.92-.01.26 0 .54.01.83 1.35.29 1.35.17 2.37.13 2.49-.04.12-.15.18-.32.27z" />
                                            </svg>
                                            Share
                                        </button>
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <p className="text-white text-xs font-medium truncate">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
