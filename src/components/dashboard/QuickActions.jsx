import React from 'react';
import StudioPanel from '../StudioPanel';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import AnimatedIcon from '../AnimatedIcon';

const actions = [
    {
        title: 'Create Release',
        description: 'Create a new album, EP, or single with tracks.',
        icon: 'disc',
        link: createPageUrl('Studio'),
        color: 'text-purple-600',
        gradient: 'from-purple-100 to-indigo-100'
    },
    {
        title: 'Launch Campaign',
        description: 'Create smart links and promotional campaigns.',
        icon: 'promote',
        link: createPageUrl('Promotion'),
        color: 'text-pink-600',
        gradient: 'from-pink-100 to-rose-100'
    },
    {
        title: 'View Analytics',
        description: 'Track your growth and performance data.',
        icon: 'chart',
        link: createPageUrl('Analytics'),
        color: 'text-green-600',
        gradient: 'from-green-100 to-emerald-100'
    },
    {
        title: 'Start Collaboration',
        description: 'Work with other artists on new projects.',
        icon: 'users',
        link: createPageUrl('Collaborate'),
        color: 'text-blue-600',
        gradient: 'from-blue-100 to-cyan-100'
    }
];

export default function QuickActions() {
    return (
        <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 px-1">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {actions.map(action => (
                    <Link to={action.link} key={action.title} className="group">
                        <StudioPanel className="p-4 h-full flex flex-col justify-between">
                            <div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${action.gradient} mb-3 transition-all duration-300 transform group-hover:scale-110`}>
                                    <AnimatedIcon icon={action.icon} size={24} className={action.color} />
                                </div>
                                <h3 className="font-semibold text-slate-800 text-base">{action.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">{action.description}</p>
                            </div>
                        </StudioPanel>
                    </Link>
                ))}
            </div>
        </div>
    )
}