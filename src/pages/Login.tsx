import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import ParticleBackground from '@/components/layout/ParticleBackground';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { name, email, password };
      const res = await api.post(endpoint, payload);
      localStorage.setItem('token', res.data.token);
      window.location.reload();
    } catch (err) {
      console.error('Auth failed', err);
      alert('ACCESS DENIED. INCORRECT CREDENTIALS.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background p-4">
      <ParticleBackground />
      <div className="bg-black/90 backdrop-blur-xl border border-[#10b981]/40 rounded-sm p-8 shadow-[0_0_30px_rgba(16,185,129,0.15)] w-full max-w-md relative z-10 flex flex-col items-center font-mono">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-50"></div>
        
        <div className="flex flex-col items-center mb-8">
          <img src="/stack-svg.png" alt="Lamora AI Logo" className="w-16 h-16 object-contain mb-3 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse" />
          <h2 className="text-3xl font-extrabold tracking-tight text-white">LAMORA <span className="text-[#10b981]">AI</span></h2>
          <p className="text-[10px] text-[#10b981]/70 tracking-[0.3em] mt-2 font-bold uppercase">System Auth Protocol</p>
        </div>
        
        <div className="w-full text-left border-b border-[#10b981]/30 pb-3 mb-6">
          <p className="text-xs text-[#10b981]/80 animate-pulse">STATUS: AWAITING INPUT...</p>
          <h1 className="text-lg font-bold text-white tracking-wider uppercase mt-1">
            {isLogin ? '>_ AUTHENTICATE_USER' : '>_ REGISTER_NEW_NODE'}
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5 w-full">
          {!isLogin && (
            <div className="group">
              <label className="block text-[10px] uppercase tracking-wider text-[#10b981]/70 mb-1 font-bold group-focus-within:text-[#10b981]">
                [INPUT: ALIAS]
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder="Enter identifier..."
                className="w-full bg-black border border-[#10b981]/30 text-[#10b981] placeholder-[#10b981]/30 px-4 py-3 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] outline-none transition-all rounded-sm text-sm" 
              />
            </div>
          )}
          <div className="group">
            <label className="block text-[10px] uppercase tracking-wider text-[#10b981]/70 mb-1 font-bold group-focus-within:text-[#10b981]">
              [INPUT: NETWORK_ID]
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="Enter email address..."
              className="w-full bg-black border border-[#10b981]/30 text-[#10b981] placeholder-[#10b981]/30 px-4 py-3 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] outline-none transition-all rounded-sm text-sm" 
            />
          </div>
          <div className="group">
            <label className="block text-[10px] uppercase tracking-wider text-[#10b981]/70 mb-1 font-bold group-focus-within:text-[#10b981]">
              [INPUT: SECURITY_KEY]
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="Enter password..."
              className="w-full bg-black border border-[#10b981]/30 text-[#10b981] placeholder-[#10b981]/30 px-4 py-3 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] outline-none transition-all rounded-sm text-sm" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#10b981]/10 border border-[#10b981]/50 text-[#10b981] py-3 rounded-sm font-bold tracking-widest uppercase hover:bg-[#10b981] hover:text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'PROCESSING...' : isLogin ? 'EXECUTE: LOGIN' : 'EXECUTE: REGISTER'}
          </button>
        </form>
        
        <div className="mt-6 text-center w-full border-t border-[#10b981]/20 pt-4">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)} 
            className="text-[11px] text-[#10b981]/60 hover:text-[#10b981] uppercase tracking-widest transition-colors"
          >
            {isLogin ? ">> INITIALIZE NEW AGENT NODE" : "<< RETURN TO AUTHENTICATION"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
