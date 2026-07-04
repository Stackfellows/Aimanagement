import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Settings as SettingsIcon, LayoutDashboard, Sparkles, Wand2, Loader2, DollarSign, Download, BrainCircuit } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Finance = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [newTx, setNewTx] = useState({ type: 'Expense', amount: '', category: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [currency, setCurrency] = useState('PKR');
  const [monthlyBudget, setMonthlyBudget] = useState('5000');
  const [settingsSaving, setSettingsSaving] = useState(false);
  
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [aiInsight, setAiInsight] = useState('');
  const [aiInsightLoading, setAiInsightLoading] = useState(false);

  const fetchTransactionsAndSettings = async () => {
    try {
      const [txRes, setRes] = await Promise.all([
        api.get('/finance'),
        api.get('/finance/settings')
      ]);
      setTransactions(txRes.data);
      if (setRes.data) {
        setCurrency(setRes.data.financeCurrency || 'PKR');
        setMonthlyBudget(setRes.data.financeBudget || '5000');
      }
    } catch (err) {
      console.error('Failed to fetch finance data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionsAndSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      await api.put('/finance/settings', {
        financeCurrency: currency,
        financeBudget: Number(monthlyBudget)
      });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.category) return;
    try {
      await api.post('/finance', { ...newTx, amount: Number(newTx.amount) });
      setNewTx({ type: 'Expense', amount: '', category: '', description: '' });
      setIsFormOpen(false);
      fetchTransactionsAndSettings();
    } catch (err) {
      console.error('Failed to add transaction', err);
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    setAiLoading(true);
    try {
      const parseRes = await api.post('/ai/parse-finance', { prompt: aiInput });
      const parsedData = parseRes.data;
      
      await api.post('/finance', {
        type: parsedData.type || 'Expense',
        amount: Number(parsedData.amount) || 0,
        category: parsedData.category || 'General',
        description: parsedData.description || aiInput
      });
      
      setAiInput('');
      fetchTransactionsAndSettings();
    } catch (err) {
      console.error('AI Finance Creation failed', err);
      alert('Failed to parse transaction via AI. Please try again or use the manual form.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/finance/${id}`);
      fetchTransactionsAndSettings();
    } catch (err) {
      console.error('Failed to delete transaction', err);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => 
        [new Date(t.date).toLocaleDateString(), t.type, t.category, t.amount, `"${t.description || ''}"`].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Finance_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAiInsights = async () => {
    setAiInsightLoading(true);
    setAiInsight('');
    try {
      const prompt = `Here are my recent transactions (Monthly Budget: ${monthlyBudget} ${currency}): ${JSON.stringify(transactions.map(t => ({type: t.type, category: t.category, amount: t.amount})))}\n\nPlease give me a 2-sentence financial advice based on my spending habits. Be highly concise and helpful.`;
      const res = await api.post('/ai/chat', { message: prompt });
      setAiInsight(res.data.reply);
    } catch (err) {
      console.error('Failed to get insights', err);
      setAiInsight('Failed to analyze data at this moment.');
    } finally {
      setAiInsightLoading(false);
    }
  };


  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = [
    { name: 'Income', value: totalIncome },
    { name: 'Expense', value: totalExpense },
  ];
  const COLORS = ['#10b981', '#ef4444']; // emerald-500 and red-500
  
  const expensesByCategory = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);
    
  const barChartData = Object.keys(expensesByCategory)
    .map(key => ({ name: key, amount: expensesByCategory[key] }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  
  const getCurrencySymbol = (c: string) => {
    if (c === 'USD') return '$';
    if (c === 'EUR') return '€';
    if (c === 'GBP') return '£';
    return 'Rs';
  };
  const sym = getCurrencySymbol(currency);

  if (loading) return <div className="p-6 flex items-center justify-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-xl border border-emerald-500/20">
              <DollarSign className="w-6 h-6 text-emerald-500" />
            </div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Finance Center
            </h1>
          </div>
          <p className="text-foreground/60 text-base max-w-lg">
            Track your finances instantly by telling the AI what you spent or earned.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 text-sm font-bold rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all flex items-center gap-2 border border-emerald-500/20"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          
          <div className="flex bg-card/60 backdrop-blur-md border border-border/60 rounded-xl p-1 shadow-sm">
            <button 
              onClick={() => setActiveTab('Overview')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'Overview' ? 'bg-background shadow text-foreground' : 'text-foreground/60 hover:text-foreground hover:bg-background/50'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Overview
            </button>
            <button 
              onClick={() => setActiveTab('Settings')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'Settings' ? 'bg-background shadow text-foreground' : 'text-foreground/60 hover:text-foreground hover:bg-background/50'}`}
            >
              <SettingsIcon className="w-4 h-4" /> Settings
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'Overview' ? (
        <div className="space-y-8">
          
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl border border-primary/20 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
              <p className="text-foreground/60 text-sm font-bold uppercase tracking-wider mb-2">Net Balance</p>
              <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
                <span className="text-primary/70 text-2xl mr-1">{sym}</span>
                {balance.toLocaleString()}
              </h2>
            </div>
            
            <div className="bg-card/60 backdrop-blur-xl border border-border/60 p-6 rounded-3xl shadow-sm flex justify-between items-center group hover:border-emerald-500/30 transition-all duration-300">
              <div>
                <p className="text-foreground/60 text-sm font-bold uppercase tracking-wider mb-2">Total Income</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-emerald-500">
                  <span className="text-emerald-500/60 text-xl mr-1">{sym}</span>
                  {totalIncome.toLocaleString()}
                </h2>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                <ArrowUpCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            
            <div className="bg-card/60 backdrop-blur-xl border border-border/60 p-6 rounded-3xl shadow-sm flex justify-between items-center group hover:border-red-500/30 transition-all duration-300">
              <div>
                <p className="text-foreground/60 text-sm font-bold uppercase tracking-wider mb-2">Total Expenses</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-red-500">
                  <span className="text-red-500/60 text-xl mr-1">{sym}</span>
                  {totalExpense.toLocaleString()}
                </h2>
              </div>
              <div className="p-3 bg-red-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                <ArrowDownCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
          
          {/* BUDGET WARNING (if exceeded) */}
          {totalExpense > Number(monthlyBudget) && Number(monthlyBudget) > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3">
              <ArrowDownCircle className="w-6 h-6" />
              <p className="font-bold text-sm">Warning: You have exceeded your monthly budget of {sym}{Number(monthlyBudget).toLocaleString()}!</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              
              {/* AI MAGIC INPUT */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-primary to-emerald-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
                <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-500" /> AI Financial Agent
                    </h2>
                    <button 
                      onClick={() => setIsFormOpen(!isFormOpen)}
                      className="text-xs font-bold text-foreground/50 hover:text-primary transition-colors underline underline-offset-4 decoration-primary/30"
                    >
                      {isFormOpen ? 'Close Manual Entry' : 'Manual Entry'}
                    </button>
                  </div>
                  
                  <form onSubmit={handleAiSubmit} className="relative flex flex-col md:flex-row items-center gap-3">
                    <div className="absolute left-4 z-10 text-emerald-500">
                      {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5 animate-pulse" />}
                    </div>
                    <input 
                      type="text"
                      className="w-full bg-background/50 border border-border/50 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 placeholder:text-foreground/40 transition-all"
                      placeholder="e.g. 'Spent 1500 on lunch' or 'Freelance se 20000 aye'..."
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      disabled={aiLoading}
                    />
                    <button 
                      type="submit"
                      disabled={aiLoading || !aiInput.trim()}
                      className="w-full md:w-auto shrink-0 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                    >
                      Process Log
                    </button>
                  </form>
                  
                  {/* AI Insights Section */}
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                        <BrainCircuit className="w-4 h-4 text-emerald-500" /> Financial Insights
                      </h3>
                      <button 
                        onClick={getAiInsights}
                        disabled={aiInsightLoading}
                        className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                      >
                        {aiInsightLoading ? 'Analyzing...' : 'Generate Advice'}
                      </button>
                    </div>
                    {aiInsight && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 leading-relaxed">
                          {aiInsight}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MANUAL FORM FALLBACK */}
              {isFormOpen && (
                <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-3xl p-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <h2 className="text-base font-bold mb-4">Manual Transaction</h2>
                  <form onSubmit={handleCreate} className="flex gap-4 items-end flex-wrap">
                    <div className="w-full sm:w-32">
                      <label className="block text-xs font-bold text-foreground/60 mb-1.5 uppercase tracking-wider">Type</label>
                      <select 
                        className="w-full bg-background/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none" 
                        value={newTx.type} 
                        onChange={e => setNewTx({...newTx, type: e.target.value})}
                      >
                        <option>Income</option>
                        <option>Expense</option>
                      </select>
                    </div>
                    <div className="w-full sm:w-40">
                      <label className="block text-xs font-bold text-foreground/60 mb-1.5 uppercase tracking-wider">Amount ({sym})</label>
                      <input 
                        type="number" 
                        required 
                        className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40" 
                        value={newTx.amount} 
                        onChange={e => setNewTx({...newTx, amount: e.target.value})} 
                        placeholder="0.00" 
                      />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-bold text-foreground/60 mb-1.5 uppercase tracking-wider">Category</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40" 
                        value={newTx.category} 
                        onChange={e => setNewTx({...newTx, category: e.target.value})} 
                        placeholder="e.g. Salary, Rent, Groceries" 
                      />
                    </div>
                    <button type="submit" className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:opacity-90 flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Save
                    </button>
                  </form>
                </div>
              )}

              {/* TRANSACTIONS LIST */}
              <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-6">Recent Ledger</h2>
                <div className="space-y-3">
                  {transactions.map(tx => (
                    <div key={tx._id} className="p-4 bg-background/40 border border-border/40 rounded-2xl flex items-center justify-between hover:border-border hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${tx.type === 'Income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {tx.type === 'Income' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground">{tx.category}</span>
                          <span className="text-xs text-foreground/50 font-medium">
                            {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            {tx.description ? ` • ${tx.description}` : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <span className={`font-extrabold tracking-tight ${tx.type === 'Income' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {tx.type === 'Income' ? '+' : '-'}{sym} {tx.amount.toLocaleString()}
                        </span>
                        <button onClick={() => handleDelete(tx._id)} className="text-red-500/30 hover:text-red-500 p-2 rounded-xl hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center py-12 px-4 border border-dashed border-border rounded-2xl bg-background/20">
                      <DollarSign className="w-10 h-10 text-foreground/20 mx-auto mb-3" />
                      <p className="text-foreground/60 font-medium">No transactions recorded yet.</p>
                      <p className="text-foreground/40 text-sm mt-1">Tell the AI agent to log your first expense!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - CHART */}
            <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col h-[400px] lg:h-auto sticky top-24">
              <h2 className="text-lg font-bold mb-2">Distribution</h2>
              <p className="text-xs text-foreground/50 font-medium mb-6">Income vs Expense ratio</p>
              
              {transactions.length > 0 ? (
                <div className="flex-1 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={chartData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={80} 
                        outerRadius={100} 
                        paddingAngle={8} 
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', fontWeight: 'bold' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value) => `${sym} ${Number(value).toLocaleString()}`}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-8">
                    <span className="text-xs text-foreground/50 font-bold uppercase tracking-widest">Balance</span>
                    <span className="text-xl font-extrabold text-foreground">{sym} {balance > 1000 ? `${(balance/1000).toFixed(1)}k` : balance}</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center border border-dashed border-border rounded-2xl bg-background/20 mt-4">
                  <p className="text-foreground/40 text-sm font-medium">Not enough data to map.</p>
                </div>
              )}

              {/* Bar Chart Section */}
              {barChartData.length > 0 && (
                <div className="mt-8 pt-8 border-t border-border/60">
                  <h2 className="text-sm font-bold mb-4">Top Expense Categories</h2>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${sym}${val}`} />
                        <Tooltip 
                          cursor={{ fill: 'hsl(var(--primary)/0.1)' }}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                          itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      ) : (
        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-8 shadow-sm max-w-2xl">
          <h2 className="text-xl font-bold mb-8">Finance Settings</h2>
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-3 uppercase tracking-wider">Default Currency</label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full max-w-sm bg-background/50 border border-border/50 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="PKR">PKR (Rs)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-3 uppercase tracking-wider">Monthly Budget Limit</label>
              <input 
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full max-w-sm bg-background/50 border border-border/50 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="e.g. 5000"
              />
              <p className="text-xs text-foreground/50 font-medium mt-2">Get notified when your expenses exceed this limit.</p>
            </div>
            
            <div className="pt-6 border-t border-border/30">
              <button 
                onClick={handleSaveSettings}
                disabled={settingsSaving}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
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

export default Finance;
