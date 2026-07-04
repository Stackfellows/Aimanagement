import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Send, Bot, Phone, MessageSquare, Sparkles, Wand2, Loader2, Volume2, Globe, CheckCircle2, ShieldAlert, Lock, Trash2, Wifi } from 'lucide-react';
import { io } from 'socket.io-client';

const WhatsappManager = () => {
  const tabs = ['Overview', 'QR Connect', 'AI Training', 'Privacy & Security'];
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [prompt, setPrompt] = useState('');
  const [draft, setDraft] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [status, setStatus] = useState('Disconnected');
  const [number, setNumber] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  
  // New Agent Settings
  const [tone, setTone] = useState('Professional');
  const [language, setLanguage] = useState('English');
  const [successAnim, setSuccessAnim] = useState(false);
  
  // AI Training Settings
  const [aiUsageType, setAiUsageType] = useState('personal');
  const [aiTrainingData, setAiTrainingData] = useState('');
  const [savingAiSettings, setSavingAiSettings] = useState(false);

  const checkStatus = async () => {
    try {
      const res = await api.get('/whatsapp/status');
      if (res.data.connected) {
        setStatus('Connected');
        setNumber(res.data.number);
      } else {
        setStatus('Disconnected');
        if (res.data.qr) {
          setQrCodeUrl(res.data.qr);
        }
      }
    } catch (err) {
      console.error('Failed to check WhatsApp status', err);
    }
  };

  useEffect(() => {
    const fetchWaStatusAndContacts = async () => {
      try {
        await checkStatus();
        const contactsRes = await api.get('/whatsapp/contacts');
        setContacts(contactsRes.data);
      } catch (err) {
        console.error('Failed to fetch WhatsApp data', err);
      }
    };
    
    const fetchAiSettings = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data?.user) {
          setAiUsageType(res.data.user.aiUsageType || 'personal');
          setAiTrainingData(res.data.user.aiTrainingData || '');
        }
      } catch (err) {
        console.error('Failed to fetch AI settings', err);
      }
    };
    
    fetchWaStatusAndContacts();
    fetchAiSettings();
  }, []);

  const handleGenerateDraft = async () => {
    if (!prompt.trim()) return;
    setLoadingAi(true);
    setDraft('');
    try {
      const languageInstruction = language === 'English' 
        ? "Use extremely simple, clear, and direct English." 
        : "Use extremely natural, simple, and casual Pakistani texting style Roman Urdu (like 'kya ho rha h', 'kaha h'). Do NOT use formal Hindi words.";
        
      const systemInstruction = `Write this as a direct message or email. ${languageInstruction} Tone to use: ${tone}. Write exactly what is asked. Do not add any conversational filler, explanations, or your own language. Do not say 'Here is the draft' or similar. Provide ONLY the final message content.`;
      
      const res = await api.post('/ai/chat', { 
        message: `${systemInstruction}\n\nTask: ${prompt}` 
      });
      setDraft(res.data.reply);
    } catch (err) {
      console.error('Failed to generate draft', err);
      alert('Failed to generate draft. Please try again.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!phoneNumber.trim() || !draft.trim()) {
      alert('Please provide a phone number and message to send.');
      return;
    }
    setSending(true);
    try {
      let finalTo = phoneNumber;
      if (!phoneNumber.includes('@')) {
        finalTo = phoneNumber.replace(/[^0-9]/g, '');
      }
      
      await api.post('/whatsapp/send', {
        to: finalTo,
        message: draft
      });
      
      setSuccessAnim(true);
      setTimeout(() => {
        setSuccessAnim(false);
        setDraft('');
        setPrompt('');
      }, 3000);
      
    } catch (err) {
      console.error('Failed to send WhatsApp message', err);
      alert('Failed to send message. Make sure WhatsApp is connected on your Dashboard.');
    } finally {
      setSending(false);
    }
  };

  const handleClearSession = async () => {
    if (!window.confirm('Are you sure you want to clear your WhatsApp session? You will need to scan the QR code again to reconnect.')) {
      return;
    }
    
    setClearing(true);
    try {
      await api.post('/whatsapp/clear-session');
      alert('Security Action: WhatsApp session has been securely wiped.');
      setStatus('Disconnected');
      setNumber(null);
      setQrCodeUrl(null);
      setActiveTab('Overview');
    } catch (err) {
      console.error('Error clearing session', err);
      alert('Failed to clear session.');
    } finally {
      setClearing(false);
    }
  };

  const handleSaveAiSettings = async () => {
    setSavingAiSettings(true);
    try {
      await api.put('/auth/ai-settings', { aiUsageType, aiTrainingData });
      alert('AI Training Settings saved successfully!');
    } catch (err) {
      console.error('Error saving AI settings', err);
      alert('Failed to save settings.');
    } finally {
      setSavingAiSettings(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Agent Comm Center
            </h1>
          </div>
          <p className="text-foreground/60 text-base max-w-lg">
            Deploy an AI agent to draft and dispatch context-aware WhatsApp messages instantly.
          </p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-border/40 pb-px mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-t-2xl font-bold text-sm transition-all ${
              activeTab === tab
                ? 'bg-card/60 backdrop-blur-md text-foreground border-t border-l border-r border-border/60 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]'
                : 'text-foreground/50 hover:text-foreground/80 hover:bg-foreground/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Privacy & Security' && (
        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-8 shadow-sm max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">Privacy & Security</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-start gap-4">
              <Lock className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-emerald-500 font-bold mb-1">End-to-End Encrypted</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  Your connection uses the Signal Protocol via Baileys. All messages sent and received are 100% end-to-end encrypted. We do not store your messages on our cloud servers.
                </p>
              </div>
            </div>

            <div className="bg-background/50 border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Wifi className="w-5 h-5 text-foreground/60" /> Current Connection
              </h3>
              <p className="text-sm text-foreground/70 mb-4">
                Status: <strong className={status === 'Connected' ? 'text-emerald-500' : 'text-rose-500'}>{status}</strong>
                {number && <span className="ml-2 font-mono bg-foreground/5 px-2 py-0.5 rounded">+{number}</span>}
              </p>
              
              <div className="pt-4 border-t border-border/30">
                <h4 className="text-sm font-bold text-rose-500 mb-2">Emergency Session Clear</h4>
                <p className="text-xs text-foreground/60 mb-4 leading-relaxed">
                  If you suspect unauthorized access, click below to instantly wipe the local Baileys session and disconnect your WhatsApp device. You will need to scan a new QR code to reconnect.
                </p>
                <button 
                  onClick={handleClearSession}
                  disabled={clearing}
                  className="bg-rose-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-rose-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center gap-2"
                >
                  {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {clearing ? 'Wiping Session...' : 'Clear Session Securely'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'AI Training' && (
        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-8 shadow-sm max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <Wand2 className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">AI Agent Training Hub</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Usage Type</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setAiUsageType('personal')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                    aiUsageType === 'personal'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/50 text-foreground/60 hover:border-border'
                  }`}
                >
                  Personal Assistant
                </button>
                <button
                  onClick={() => setAiUsageType('business')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                    aiUsageType === 'business'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/50 text-foreground/60 hover:border-border'
                  }`}
                >
                  Business / E-commerce
                </button>
              </div>
              <p className="text-xs text-foreground/50 mt-2">
                {aiUsageType === 'personal' 
                  ? 'Personal mode uses a casual, conversational tone (Roman Urdu) and respects day/night context.' 
                  : 'Business mode enforces a highly professional, polite tone suitable for customers.'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Custom Rules & Knowledge Base</label>
              <textarea
                value={aiTrainingData}
                onChange={(e) => setAiTrainingData(e.target.value)}
                placeholder={aiUsageType === 'personal' 
                  ? "E.g. I am Asad. I sleep at 2 AM. My friend Ali is called 'jigar'. Don't use formal language." 
                  : "E.g. We sell T-Shirts for 1000 PKR. Delivery is 200 PKR. Delivery time is 3 days. Always ask for city."}
                className="w-full h-48 bg-background border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              ></textarea>
              <p className="text-xs text-foreground/50 mt-2">The AI agent will prioritize these rules when auto-replying to WhatsApp messages or Emails.</p>
            </div>
            
            <button 
              onClick={handleSaveAiSettings}
              disabled={savingAiSettings}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center gap-2"
            >
              {savingAiSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {savingAiSettings ? 'Saving...' : 'Save AI Settings'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'QR Connect' && (
        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          {status === 'Connected' ? (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold">WhatsApp Connected</h2>
              <p className="text-foreground/60">Your device is securely linked and ready to transmit.</p>
              {number && <p className="font-mono bg-foreground/5 px-4 py-2 rounded-lg inline-block mt-4">+{number}</p>}
            </div>
          ) : qrCodeUrl ? (
            <div className="text-center space-y-6">
              <h2 className="text-xl font-bold mb-2">Scan QR to Connect</h2>
              <p className="text-sm text-foreground/60 max-w-sm mx-auto mb-8">
                Open WhatsApp on your phone &gt; Linked Devices &gt; Link a Device, and scan this code.
              </p>
              <div className="bg-white p-4 rounded-3xl inline-block shadow-lg mx-auto">
                <img src={qrCodeUrl} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
              <p className="text-foreground/60">Initializing secure WhatsApp connection...</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN - AGENT BRIEFING */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card/60 backdrop-blur-md border border-border/60 rounded-3xl p-6 shadow-lg shadow-primary/5">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground">
                <MessageSquare className="w-5 h-5 text-primary" /> Agent Briefing
              </h2>
              
              <div className="space-y-6">
                {/* Target Selection */}
                <div>
                  <label className="block text-sm font-bold text-foreground/80 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary/70" /> 1. Target Contact
                  </label>
                  <div className="flex flex-col gap-3">
                    <select 
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none transition-all"
                      value={phoneNumber}
                    >
                      <option value="">Select an active transmission...</option>
                      {contacts.length === 0 && <option disabled>No recent contacts logged...</option>}
                      {contacts.map(c => (
                        <option key={c.number} value={c.number}>
                          {c.name && c.name !== c.number ? c.name : `+${c.number}`}
                        </option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Or enter number manually (e.g. 923001234567)"
                      className="w-full bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                  </div>
                </div>

                {/* Agent Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground/80 mb-2 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-primary/70" /> Tone
                    </label>
                    <select 
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                    >
                      <option>Professional</option>
                      <option>Casual</option>
                      <option>Friendly</option>
                      <option>Persuasive</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground/80 mb-2 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-primary/70" /> Language
                    </label>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                    >
                      <option>English</option>
                      <option>Roman Urdu</option>
                    </select>
                  </div>
                </div>

                {/* Directive */}
                <div>
                  <label className="block text-sm font-bold text-foreground/80 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary/70" /> 2. Agent Directive
                  </label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Write a follow-up asking for the project files..."
                    className="w-full bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[140px] resize-none transition-all placeholder:text-foreground/30"
                  ></textarea>
                  
                  <button 
                    onClick={handleGenerateDraft}
                    disabled={loadingAi || !prompt.trim()}
                    className="mt-4 w-full bg-gradient-to-r from-primary to-purple-500 text-primary-foreground px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                    {loadingAi ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                    {loadingAi ? 'Agent Processing...' : 'Generate Transmission'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - OUTPUT CONSOLE */}
          <div className="lg:col-span-7 space-y-6 flex flex-col">
            <div className="flex-1 bg-card/40 backdrop-blur-xl border border-border/40 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col min-h-[400px]">
              {/* Terminal styling overlay */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0"></div>
              
              <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/50 flex items-center gap-2">
                  <Bot className="w-4 h-4" /> Final Transmission Core
                </h2>
                {successAnim && (
                  <span className="text-emerald-500 text-xs font-bold flex items-center gap-1 animate-pulse">
                    <CheckCircle2 className="w-4 h-4" /> DISPATCHED
                  </span>
                )}
              </div>

              <div className="flex-1 relative group">
                {loadingAi && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl border border-primary/20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <p className="text-sm font-medium text-primary animate-pulse">AI Agent is crafting your message...</p>
                  </div>
                )}
                
                <textarea 
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Awaiting agent output..."
                  className="w-full h-full min-h-[250px] bg-background/30 backdrop-blur-md border border-border/30 rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all font-medium leading-relaxed"
                  spellCheck="false"
                ></textarea>
              </div>
              
              <div className="mt-6 pt-5 border-t border-border/30 flex items-center justify-between">
                <p className="text-xs text-foreground/40 font-medium">
                  {draft.length} characters generated
                </p>
                <button 
                  onClick={handleSendWhatsApp}
                  disabled={sending || !draft.trim() || !phoneNumber.trim()}
                  className={`px-8 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center gap-3 shadow-md ${
                    successAnim 
                      ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                      : 'bg-foreground text-background hover:scale-[1.02] shadow-foreground/20 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed'
                  }`}
                >
                  {sending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Dispatching...</>
                  ) : successAnim ? (
                    <><CheckCircle2 className="w-5 h-5" /> Sent Successfully</>
                  ) : (
                    <><Send className="w-5 h-5" /> Dispatch via WhatsApp</>
                  )}
                </button>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default WhatsappManager;
