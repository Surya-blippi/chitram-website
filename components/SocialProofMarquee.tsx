import React, { useEffect, useState } from 'react';
import { fetchSocialProof, SocialProofItem } from '../services/dataService';

export const SocialProofMarquee: React.FC = () => {
    const [items, setItems] = useState<SocialProofItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const data = await fetchSocialProof();
            setItems(data);
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading || items.length === 0) return null;

    // Duplicate items for seamless loop
    const marqueeItems = [...items, ...items, ...items, ...items];

    return (
        <div className="w-full overflow-hidden bg-transparent py-10 mb-8 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex animate-marquee w-fit hover:[animation-play-state:paused]">
                {marqueeItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex-shrink-0 mx-6 w-[500px] group cursor-default">
                        <div className="bg-white p-5 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-yellow-200">

                            {/* Left Side: Inputs */}
                            <div className="flex flex-col gap-3 items-center justify-center w-32">
                                {/* Target Template */}
                                <div className="relative w-24 h-36 rounded-xl overflow-hidden border-2 border-slate-100 shadow-md transform -rotate-3 transition-transform group-hover:rotate-0">
                                    <img src={item.target_image_url} alt="Template" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[10px] font-medium text-white text-center py-1">Template</div>
                                </div>

                                {/* Plus Sign */}
                                <div className="w-8 h-8 flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-full font-bold shadow-sm z-10 -my-2">
                                    +
                                </div>

                                {/* User Photo */}
                                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-md transform rotate-3 transition-transform group-hover:rotate-0">
                                    <img src={item.user_image_url} alt="User" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[10px] font-medium text-white text-center py-1">You</div>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="text-slate-300 flex flex-col items-center gap-1">
                                <div className="h-0.5 w-8 bg-slate-200"></div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                <div className="h-0.5 w-8 bg-slate-200"></div>
                            </div>

                            {/* Right Side: Result */}
                            <div className="flex-1 h-full">
                                <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg border border-yellow-500/30 ring-4 ring-yellow-500/5 group-hover:ring-yellow-500/20 transition-all">
                                    <img
                                        src={item.result_image_url}
                                        alt={item.label || "Result"}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                        <span className="text-white text-sm font-bold tracking-wide px-3 py-1 bg-yellow-500/90 rounded-full shadow-lg backdrop-blur-sm">
                                            {item.label || "Cinematic Result"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
