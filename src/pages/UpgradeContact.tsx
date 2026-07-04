import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UpgradeContact = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Pricing
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Upgrade Your Plan</h1>
        <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
          To complete your upgrade, please contact our support team. We will help you set up your new plan immediately.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Email Contact */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-border bg-card rounded-3xl p-8 flex flex-col items-center text-center hover:border-primary/50 transition-all cursor-pointer group"
          onClick={() => window.location.href = 'mailto:stackfellows684@gmail.com'}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Email Us</h3>
          <p className="text-foreground/70 mb-4">Send us an email and we'll reply shortly.</p>
          <p className="text-lg font-medium text-primary select-all">stackfellows684@gmail.com</p>
        </motion.div>

        {/* WhatsApp Contact */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-[#25D366]/30 bg-[#25D366]/5 rounded-3xl p-8 flex flex-col items-center text-center hover:border-[#25D366] transition-all cursor-pointer group"
          onClick={() => window.open('https://wa.me/923030278190', '_blank')}
        >
          <div className="w-16 h-16 rounded-full bg-[#25D366]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-8 h-8 text-[#25D366]" />
          </div>
          <h3 className="text-2xl font-bold mb-2">WhatsApp</h3>
          <p className="text-foreground/70 mb-4">Message us on WhatsApp for a quick response.</p>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-medium text-[#25D366] select-all">+92 303 0278190</p>
            <p className="text-sm text-foreground/50">or 03030278190</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UpgradeContact;
