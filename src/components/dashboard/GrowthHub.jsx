
import React, { useState, useEffect } from 'react';
import StudioPanel from '../StudioPanel';
import AnimatedIcon from '../AnimatedIcon';
import { getAIInsights } from '@/api/functions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';

export default function GrowthHub({ user }) {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const response = await getAIInsights();
            if (response.success) {
                setInsights(response);
            } else {
                // Use fallback data from the function if the main call fails
                setInsights({
                    growthInsight: "### Keep Growing! 📈\nYour music is gaining traction. Focus on consistent posting and engaging with your audience to maintain momentum.",
                    youtubeIdeas: [
                        { title: "Behind The Beat", description: "Show your creative process making a beat." },
                        { title: "30 Second Cover", description: "Quick acoustic version of your latest track." },
                    ]
                });
            }
        } catch (error) {
            console.error("Failed to fetch AI insights:", error);
            setInsights({
                 growthInsight: "### Manual Tip ✨\nEngage with 5 comments on your latest YouTube video to boost its visibility!",
                 youtubeIdeas: [
                    { title: "Day in the Life", description: "A vlog showing your daily routine as an artist." },
                 ]
            })
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchInsights();
        }
    }, [user]);

    const renderLoadingState = () => (
        <div className="p-8 text-center">
            <AnimatedIcon icon="loading" size={32} trigger="spin" className="text-purple-500 mx-auto" />
            <p className="mt-2 text-sm text-slate-600">Our AI is analyzing your data...</p>
        </div>
    );

    return (
        <StudioPanel className="p-0 overflow-hidden">
             <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 flex-shrink-0">
                        <AnimatedIcon icon="zap" size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">AI Growth Hub</h2>
                        <p className="text-slate-600 text-xs sm:text-sm">Your personal marketing assistant.</p>
                    </div>
                </div>
            </div>

            {loading ? renderLoadingState() : (
                 <Tabs defaultValue="insights" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-100 h-auto rounded-none">
                        <TabsTrigger value="insights" className="py-2 text-xs sm:py-3 sm:text-sm">Growth Tip</TabsTrigger>
                        <TabsTrigger value="ideas" className="py-2 text-xs sm:py-3 sm:text-sm">Content Ideas</TabsTrigger>
                    </TabsList>
                    <TabsContent value="insights" className="p-4 sm:p-6">
                        <div className="prose prose-sm prose-slate max-w-none">
                            <ReactMarkdown>{insights.growthInsight}</ReactMarkdown>
                        </div>
                        <Button variant="ghost" size="sm" className="mt-4 text-purple-600 px-0 hover:bg-transparent">Get New Tip</Button>
                    </TabsContent>
                    <TabsContent value="ideas" className="p-4 sm:p-6">
                         <div className="space-y-3">
                            {insights.youtubeIdeas && insights.youtubeIdeas.slice(0, 2).map((idea, index) => (
                                <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                                    <p className="font-semibold text-sm text-slate-800">{idea.title}</p>
                                    <p className="text-xs text-slate-600">{idea.description}</p>
                                </div>
                            ))}
                         </div>
                         <Button variant="ghost" size="sm" className="mt-4 text-purple-600 px-0 hover:bg-transparent">Get New Ideas</Button>
                    </TabsContent>
                </Tabs>
            )}

        </StudioPanel>
    );
}
