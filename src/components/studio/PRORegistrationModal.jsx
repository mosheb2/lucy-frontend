
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { publishingServices } from '@/api/functions';
import AnimatedIcon from '../AnimatedIcon';
import ActionButton from '../ActionButton';
import StudioPanel from '../StudioPanel';
import { ExternalLink } from 'lucide-react';

export default function PRORegistrationModal({ open, onOpenChange }) {
  const [proInfo, setProInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      const fetchProInfo = async () => {
        setIsLoading(true);
        try {
          const response = await publishingServices({ action: 'get_pro_info' });
          if (response.data.success) {
            setProInfo(response.data.pro_info);
          }
        } catch (error) {
          console.error('Error fetching PRO info:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProInfo();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">PRO Registration Guide</DialogTitle>
          <DialogDescription>
            Learn about Performance Rights Organizations and why they're crucial for earning royalties.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <AnimatedIcon icon="loading" size={32} trigger="spin" />
            </div>
          ) : proInfo ? (
            <>
              <StudioPanel className="p-4">
                <h3 className="font-semibold text-slate-900 mb-2">What is a PRO?</h3>
                <p className="text-sm text-slate-600">
                  A Performance Rights Organization (PRO) helps songwriters and publishers get paid for the public use of their musical compositions. They collect royalties when your music is played on the radio, on TV, in clubs and restaurants, on streaming services, and more.
                </p>
              </StudioPanel>
              
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Major US PROs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {proInfo.organizations.map(org => (
                    <StudioPanel key={org.name} className="p-4">
                      <h4 className="font-bold text-lg text-purple-700">{org.name}</h4>
                      <p className="text-xs text-slate-500 mb-2">{org.description}</p>
                      <ActionButton 
                        size="sm" 
                        variant="secondary"
                        onClick={() => window.open(org.website, '_blank')}
                        icon="globe"
                      >
                        Visit Website
                      </ActionButton>
                    </StudioPanel>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Key Benefits</h3>
                <ul className="space-y-2">
                  {proInfo.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AnimatedIcon icon="check" size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-center text-red-500">Could not load PRO information.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
