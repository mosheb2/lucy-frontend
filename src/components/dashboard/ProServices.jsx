import React from 'react';
import StudioPanel from '../StudioPanel';
import ActionButton from '../ActionButton';
import LordIcon from '../LordIcon';

const services = [
    {
        icon: "userCheck",
        title: "Mentor Session",
        description: "Book a one-on-one call with a music industry expert.",
        buttonText: "Learn More",
        gradient: "from-blue-500 to-cyan-500"
    },
    {
        icon: "star",
        title: "Web3 Fan Drops",
        description: "Launch exclusive NFT collections for your top supporters.",
        buttonText: "Explore Web3",
        gradient: "from-violet-500 to-fuchsia-500"
    }
];

export default function ProServices() {
    return (
        <StudioPanel className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0">
                    <LordIcon icon="trending" size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Level Up</h2>
                    <p className="text-slate-600 text-xs sm:text-sm">Access premium services to accelerate your career.</p>
                </div>
            </div>
            <div className="space-y-4">
                {services.map(service => (
                    <div key={service.title} className="p-3 sm:p-4 rounded-xl border border-slate-100 bg-white flex items-start gap-3 sm:gap-4">
                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${service.gradient}`}>
                           <LordIcon icon={service.icon} size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base text-slate-800">{service.title}</h3>
                            <p className="text-xs sm:text-sm text-slate-600 mb-3">{service.description}</p>
                            <ActionButton size="sm" variant="secondary">{service.buttonText}</ActionButton>
                        </div>
                    </div>
                ))}
            </div>
        </StudioPanel>
    )
}