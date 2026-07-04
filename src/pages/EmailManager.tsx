import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Send, Bot, Mail, Sparkles, Wand2, Loader2, Volume2, Globe, CheckCircle2, Settings as SettingsIcon, LayoutDashboard, Inbox, RefreshCw, Reply } from 'lucide-react';

const EmailManager = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Settings
  const [emailAccount, setEmailAccount] = useState('');
  const [emailAppPassword, setEmailAppPassword] = useState('');
  const [autoResponder, setAutoResponder] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  
  // Draft
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [prompt, setPrompt] = useState('');
  const [draft, setDraft] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Agent Settings
  const [tone, setTone] = useState('Professional');
  const [language, setLanguage] = useState('English');
  const [successAnim, setSuccessAnim] = useState(false);

  // Inbox
  const [inboxEmails, setInboxEmails] = useState<any[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/email/settings');
        if (res.data) {
          setEmailAccount(res.data.emailAccount || '');
          setEmailAppPassword(res.data.emailAppPassword || '');
          setAutoResponder(res.data.emailAutoResponderEnabled || false);
        }
      } catch (err) {
        console.error('Failed to fetch email settings', err);
      }
    };
    fetchSettings();
  }, []);

  const fetchInbox = async () => {
    setLoadingInbox(true);
    setSelectedEmail(null);
    try {
      const res = await api.get('/email/inbox');
      setInboxEmails(res.data);
    } catch (err: any) {
      console.error('Failed to fetch inbox', err);
      alert(err.response?.data?.message || 'Failed to fetch inbox. Please check settings and ensure IMAP is enabled.');
    } finally {
      setLoadingInbox(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Inbox') {
      fetchInbox();
    }
  }, [activeTab]);

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      await api.put('/email/settings', { 
        emailAccount, 
        emailAppPassword,
        emailAutoResponderEnabled: autoResponder 
      });
      alert('Email credentials and settings saved successfully!');
    } catch (err) {
      console.error('Failed to save email settings', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!prompt.trim()) return;
    setLoadingAi(true);
    setDraft('');
    try {
      const languageInstruction = language === 'English' 
        ? "Use professional, clear, and direct English suitable for an email." 
        : "Use natural Pakistani Roman Urdu mixed with simple English words, suitable for an email.";
        
      const systemInstruction = `Write this as a professional email. ${languageInstruction} Tone to use: ${tone}. Write exactly what is asked. Provide ONLY the final email body content. Do not include 'Subject:' or placeholders.`;
      
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

  const handleSendEmail = async () => {
    if (!recipient.trim() || !subject.trim() || !draft.trim()) {
      alert('Please provide recipient, subject, and email body.');
      return;
    }
    setSending(true);
    try {
      await api.post('/email/send', {
        to: recipient,
        subject,
        message: draft
      });
      
      setSuccessAnim(true);
      setTimeout(() => {
        setSuccessAnim(false);
        setDraft('');
        setPrompt('');
        setSubject('');
      }, 3000);
      
    } catch (err: any) {
      console.error('Failed to send Email', err);
      alert(err.response?.data?.message || 'Failed to send email. Please check your credentials in Settings.');
    } finally {
      setSending(false);
    }
  };

  const handleReplyWithAi = (email: any) => {
    // Extract actual email address from "Name <email@example.com>" if present
    const emailMatch = email.from.match(/<([^>]+)>/);
    const replyTo = emailMatch ? emailMatch[1] : email.from;
    
    setRecipient(replyTo);
    setSubject(email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`);
    setPrompt(`Write a reply to this email:\n"${email.text.substring(0, 500)}..."\n\nI want to say: `);
    setActiveTab('Overview');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl border border-blue-500/20">
              <Mail className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Email Comm Center
            </h1>
          </div>
          <p className="text-foreground/60 text-base max-w-lg">
            Deploy an AI agent to draft and dispatch personalized emails directly from your own Gmail account.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 bg-card/60 backdrop-blur-md border border-border/60 rounded-xl p-1 shadow-sm">
          <button 
            onClick={() => setActiveTab('Overview')}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'Overview' ? 'bg-background shadow text-foreground' : 'text-foreground/60 hover:text-foreground hover:bg-background/50'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Agent Briefing
          </button>
          <button 
            onClick={() => setActiveTab('Inbox')}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'Inbox' ? 'bg-background shadow text-foreground' : 'text-foreground/60 hover:text-foreground hover:bg-background/50'}`}
          >
            <Inbox className="w-4 h-4" /> Inbox
          </button>
          <button 
            onClick={() => setActiveTab('Settings')}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'Settings' ? 'bg-background shadow text-foreground' : 'text-foreground/60 hover:text-foreground hover:bg-background/50'}`}
          >
            <SettingsIcon className="w-4 h-4" /> SMTP Settings
          </button>
        </div>
      </div>

      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN - AGENT BRIEFING */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card/60 backdrop-blur-md border border-border/60 rounded-3xl p-6 shadow-lg shadow-blue-500/5">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground">
                <Mail className="w-5 h-5 text-blue-500" /> Target Parameters
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-foreground/80 mb-2">To:</label>
                  <input 
                    type="email" 
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-foreground/80 mb-2">Subject:</label>
                  <input 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className="w-full bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                </div>

                {/* Agent Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground/80 mb-2 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-blue-500/70" /> Tone
                    </label>
                    <select 
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none"
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
                      <Globe className="w-4 h-4 text-blue-500/70" /> Language
                    </label>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none"
                    >
                      <option>English</option>
                      <option>Roman Urdu</option>
                    </select>
                  </div>
                </div>

                {/* Directive */}
                <div>
                  <label className="block text-sm font-bold text-foreground/80 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500/70" /> Agent Directive
                  </label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Write an email asking for a meeting on Tuesday..."
                    className="w-full bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 min-h-[140px] resize-none transition-all placeholder:text-foreground/30"
                  ></textarea>
                  
                  <button 
                    onClick={handleGenerateDraft}
                    disabled={loadingAi || !prompt.trim()}
                    className="mt-4 w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                    {loadingAi ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                    {loadingAi ? 'Agent Processing...' : 'Generate Draft'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - OUTPUT CONSOLE */}
          <div className="lg:col-span-7 space-y-6 flex flex-col">
            <div className="flex-1 bg-card/40 backdrop-blur-xl border border-border/40 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col min-h-[500px]">
              {/* Terminal styling overlay */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0"></div>
              
              <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/50 flex items-center gap-2">
                  <Bot className="w-4 h-4" /> Email Output Console
                </h2>
                {successAnim && (
                  <span className="text-emerald-500 text-xs font-bold flex items-center gap-1 animate-pulse">
                    <CheckCircle2 className="w-4 h-4" /> DISPATCHED
                  </span>
                )}
              </div>

              <div className="flex-1 relative group">
                {loadingAi && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl border border-blue-500/20">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                    <p className="text-sm font-medium text-blue-500 animate-pulse">AI Agent is crafting your email...</p>
                  </div>
                )}
                
                <textarea 
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Awaiting agent output..."
                  className="w-full h-full min-h-[300px] bg-background/30 backdrop-blur-md border border-border/30 rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition-all font-medium leading-relaxed"
                  spellCheck="false"
                ></textarea>
              </div>
              
              <div className="mt-6 pt-5 border-t border-border/30 flex items-center justify-between">
                <p className="text-xs text-foreground/40 font-medium">
                  {draft.length} characters generated
                </p>
                <button 
                  onClick={handleSendEmail}
                  disabled={sending || !draft.trim() || !recipient.trim() || !subject.trim()}
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
                    <><Send className="w-5 h-5" /> Dispatch Email</>
                  )}
                </button>
              </div>
            </div>
          </div>
          
        </div>
      )}

      {activeTab === 'Inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
          {/* INBOX LIST */}
          <div className="lg:col-span-4 bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl flex flex-col shadow-sm overflow-hidden h-full">
            <div className="p-4 border-b border-border/30 flex items-center justify-between bg-background/50">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Inbox className="w-5 h-5 text-blue-500" /> Inbox
              </h2>
              <button 
                onClick={fetchInbox}
                disabled={loadingInbox}
                className="p-2 hover:bg-blue-500/10 text-foreground/60 hover:text-blue-500 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loadingInbox ? 'animate-spin text-blue-500' : ''}`} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loadingInbox ? (
                <div className="flex flex-col items-center justify-center h-full text-foreground/50 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-sm font-medium">Fetching secure inbox...</p>
                </div>
              ) : inboxEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-foreground/50 p-6 text-center">
                  <Inbox className="w-12 h-12 text-foreground/20 mb-3" />
                  <p className="text-sm font-medium">No emails found.</p>
                  <p className="text-xs mt-1">Make sure IMAP is enabled in your Gmail settings.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {inboxEmails.map(email => (
                    <div 
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`p-4 cursor-pointer transition-colors ${selectedEmail?.id === email.id ? 'bg-blue-500/10 border-l-4 border-l-blue-500' : 'hover:bg-background/50 border-l-4 border-l-transparent'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm truncate pr-2 text-foreground">{email.from.split('<')[0]}</span>
                        <span className="text-xs text-foreground/50 whitespace-nowrap">
                          {new Date(email.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground/90 truncate mb-1">{email.subject}</p>
                      <p className="text-xs text-foreground/60 line-clamp-2 leading-relaxed">{email.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* INBOX DETAIL */}
          <div className="lg:col-span-8 bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl flex flex-col shadow-sm overflow-hidden h-full relative">
            {selectedEmail ? (
              <>
                <div className="p-6 border-b border-border/30 bg-background/30">
                  <h2 className="text-xl font-bold mb-4">{selectedEmail.subject}</h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
                        {selectedEmail.from.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{selectedEmail.from}</p>
                        <p className="text-xs text-foreground/60">{new Date(selectedEmail.date).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleReplyWithAi(selectedEmail)}
                      className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                    >
                      <Reply className="w-4 h-4" /> Reply with AI
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-medium text-foreground/80 leading-relaxed">
                    {selectedEmail.text}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-foreground/40">
                <Mail className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Select an email to read</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Settings' && (
        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-8 shadow-sm max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">Connect Email Account</h2>
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <span className={`text-sm font-bold ${autoResponder ? 'text-blue-500' : 'text-foreground/50'} transition-colors`}>
                Auto-Responder {autoResponder ? 'Active' : 'Off'}
              </span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={autoResponder}
                  onChange={(e) => setAutoResponder(e.target.checked)}
                />
                <div className={`block w-12 h-6 rounded-full transition-colors ${autoResponder ? 'bg-blue-500' : 'bg-foreground/20'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoResponder ? 'transform translate-x-6' : ''}`}></div>
              </div>
            </label>
          </div>
          <p className="text-sm text-foreground/60 mb-8">Enter your Gmail credentials so the AI agent can send and read emails on your behalf.</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-3">Gmail Address</label>
              <input 
                type="email"
                value={emailAccount}
                onChange={(e) => setEmailAccount(e.target.value)}
                className="w-full bg-background/50 border border-border/50 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="you@gmail.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-3 flex items-center justify-between">
                <span>App Password</span>
                <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Get an App Password</a>
              </label>
              <input 
                type="password"
                value={emailAppPassword}
                onChange={(e) => setEmailAppPassword(e.target.value)}
                className="w-full bg-background/50 border border-border/50 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="16-character app password"
              />
              <p className="text-xs text-foreground/50 font-medium mt-2">Use an App Password instead of your regular Google password. <span className="font-bold text-blue-500">Note: You must also enable IMAP in Gmail Settings to use the Inbox.</span></p>
            </div>
            
            <div className="pt-6 border-t border-border/30">
              <button 
                onClick={handleSaveSettings}
                disabled={settingsSaving || !emailAccount}
                className="bg-blue-500 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
              >
                {settingsSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailManager;
