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
        <div className="w-full overflow-hidden bg-transparent py-6 mb-8 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex animate-marquee w-fit hover:[animation-play-state:paused]">
                {marqueeItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex-shrink-0 mx-4 w-72 group cursor-default">
                        <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3 transition-transform duration-300 hover:scale-105 hover:shadow-xl">

                            {/* Inputs Column */}
                            <div className="flex flex-col gap-2 items-center justify-center w-20">
                                {/* Target */}
                                <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                    <img src={item.target_image_url} alt="Template" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.5">Template</div>
                                </div>
                                {/* Plus Sign */}
                                <div className="text-slate-300 text-xs font-bold">+</div>
                                {/* User */}
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                                    <img src={item.user_image_url} alt="User" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.5">You</div>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="text-slate-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </div>

                            {/* Result Column */}
                            <div className="flex-1">
                                <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md border border-yellow-500/30 ring-2 ring-yellow-500/10">
                                    <img
                                        src={item.result_image_url}
                                        alt={item.label || "Result"}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                                        <span className="text-white text-xs font-bold">{item.label}</span>
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
