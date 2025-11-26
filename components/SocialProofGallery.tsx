
import React, { useEffect, useState } from 'react';
import { fetchSocialProof, SocialProofItem } from '../services/dataService';

export const SocialProofGallery: React.FC = () => {
    const [examples, setExamples] = useState<SocialProofItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const data = await fetchSocialProof();
            setExamples(data);
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) {
        return <div className="py-12 text-center text-slate-400">Loading transformations...</div>;
    }

    if (examples.length === 0) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 animate-fade-in">
            <div className="text-center mb-12">
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Real Results, Real People</h3>
                <p className="text-slate-500 mt-3 text-lg max-w-2xl mx-auto">
                    See how we blend your photo with our cinematic templates to create magic.
                </p>
            </div>

            <div className="space-y-16">
                {examples.map((ex, index) => (
                    <div key={ex.id} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">

                            {/* 1. Target Template */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative w-32 h-48 md:w-40 md:h-60 rounded-xl overflow-hidden shadow-md rotate-[-2deg] border-4 border-white">
                                    <img src={ex.target_image_url} alt="Target Template" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                        Template
                                    </div>
                                </div>
                            </div>

                            {/* Plus Icon */}
                            <div className="flex-shrink-0 text-slate-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>

                            {/* 2. User Photo */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-md border-4 border-white ring-2 ring-slate-100">
                                    <img src={ex.user_image_url} alt="User Upload" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                        You
                                    </div>
                                </div>
                            </div>

                            {/* Equals/Arrow Icon */}
                            <div className="flex-shrink-0 text-slate-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>

                            {/* 3. Final Result */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative w-48 h-72 md:w-56 md:h-80 rounded-xl overflow-hidden shadow-2xl shadow-yellow-500/20 border-4 border-white ring-1 ring-slate-200 rotate-[2deg] hover:rotate-0 transition-transform duration-500 hover:scale-105">
                                    <img src={ex.result_image_url} alt="Final Result" className="w-full h-full object-cover" />
                                    <div className="absolute top-3 right-3 bg-yellow-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                        Result
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                        <span className="text-white font-bold text-sm tracking-wide">"{ex.label}"</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 flex justify-center gap-8 text-sm font-medium text-slate-400 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-xl">★</span>
                    <span>4.9/5 Average Rating</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>10,000+ Posters Generated</span>
                </div>
            </div>
        </div>
    );
};

