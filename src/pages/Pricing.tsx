import React, { useState, useEffect } from 'react';
import { Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

const Pricing = () => {
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('');

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setCurrentPlan(res.data.user.plan);
    }).catch(console.error);
  }, []);

  const navigate = useNavigate();

  const handleUpgrade = (plan: string) => {
    navigate('/upgrade-contact');
  };

  const handleCancelPlan = async () => {
    if (!window.confirm('Are you sure you want to cancel your plan? You will revert to a trial account.')) return;
    try {
      setLoading(true);
      const res = await api.post('/auth/cancel-plan');
      if (res.data.success) {
        alert('Your plan has been cancelled successfully.');
        setCurrentPlan('trial');
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to cancel plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-foreground/70 text-lg">Select the perfect plan for your needs and unlock premium features.</p>
        
        {(currentPlan === 'basic' || currentPlan === 'premium') && (
          <button 
            onClick={handleCancelPlan}
            disabled={loading}
            className="mt-6 px-6 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors rounded-xl font-medium"
          >
            Cancel Current Plan
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Basic Plan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-border bg-card rounded-3xl p-8 flex flex-col relative overflow-hidden"
        >
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2">Basic</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold">Rs 500</span>
              <span className="text-foreground/60">/month</span>
            </div>
            <p className="text-foreground/70">Essential tools to manage your tasks and finances.</p>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary" />
              <span>Full Dashboard Access</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary" />
              <span>Task Management</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary" />
              <span>Finance Tracking</span>
            </li>
            <li className="flex items-center gap-3 opacity-40">
              <Check className="w-5 h-5 text-primary" />
              <span>Lumora AI</span>
            </li>
            <li className="flex items-center gap-3 opacity-40">
              <Check className="w-5 h-5 text-primary" />
              <span>WhatsApp Integration</span>
            </li>
          </ul>

          <button
            onClick={() => handleUpgrade('basic')}
            disabled={currentPlan === 'basic' || currentPlan === 'premium'}
            className="w-full py-3 rounded-xl font-medium transition-all duration-200 border border-primary text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentPlan === 'basic' ? 'Current Plan' : currentPlan === 'premium' ? 'Included in Premium' : 'Upgrade to Basic'}
          </button>
        </motion.div>

        {/* Premium Plan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-primary bg-primary/5 rounded-3xl p-8 flex flex-col relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
            <Star className="w-3 h-3" /> MOST POPULAR
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-primary mb-2">Premium</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold text-primary">Rs 2000</span>
              <span className="text-foreground/60">/month</span>
            </div>
            <p className="text-foreground/70">Unlock the full potential of your assistant.</p>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary" />
              <span>Everything in Basic</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Advanced Lumora AI</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">WhatsApp Bot Integration</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary" />
              <span>Priority Support</span>
            </li>
          </ul>

          <button
            onClick={() => handleUpgrade('premium')}
            disabled={currentPlan === 'premium'}
            className="w-full py-3 rounded-xl font-medium transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentPlan === 'premium' ? 'Current Plan' : 'Upgrade to Premium'}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
