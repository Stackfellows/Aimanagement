import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import api from '@/lib/api';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';

const Dashboard = () => {
  const [apiStatus, setApiStatus] = useState<string>('Checking backend...');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [waConnected, setWaConnected] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // Fetch User Info
    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        setUserName(res.data.user.name);
      })
      .catch((err) => console.log('Auth error:', err));

    // Check Health
    api.get('/health')
      .then((res) => setApiStatus(res.data.message))
      .catch((err) => setApiStatus('Backend connection failed!'));

    // Fetch Tasks
    api.get('/tasks')
      .then((res) => setTasks(res.data))
      .catch((err) => console.log('Tasks error (likely need login):', err));

    // Connect Socket for WhatsApp with JWT Auth
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : '/';
    const socket = io(backendUrl, { auth: { token } });
    
    socket.on('whatsapp_qr', (qr: string) => {
      console.log('Received QR');
      setQrCode(qr);
      setWaConnected(false);
    });
    
    socket.on('whatsapp_connected', () => {
      setQrCode(null);
      setWaConnected(true);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const stats = [
    { name: 'Active Tasks', value: tasks.length.toString(), change: '+2', icon: CheckCircle },
    { name: 'Pending Tasks', value: tasks.filter(t => t.status === 'Pending').length.toString(), change: '-1', icon: Clock },
    { name: 'WhatsApp', value: waConnected ? 'Linked' : 'Pending', change: '0', icon: Users },
    { name: 'Productivity', value: '85%', change: '+12%', icon: TrendingUp },
  ];

  const renderTrialBanner = () => {
    if (!user || user.plan !== 'trial') return null;
    
    const trialDuration = 7 * 24 * 60 * 60 * 1000;
    const trialStart = new Date(user.trialStartDate).getTime();
    const now = Date.now();
    const timeRemaining = trialDuration - (now - trialStart);
    
    if (timeRemaining <= 0) {
      return (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg">Trial Expired</h3>
            <p className="text-sm opacity-80">Your 7-day free trial has expired. Upgrade to keep using all features.</p>
          </div>
          <button onClick={() => window.location.href='/pricing'} className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-bold whitespace-nowrap hover:bg-red-600 transition-colors">Upgrade Now</button>
        </div>
      );
    }
    
    const daysLeft = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
    return (
      <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-lg">Free Trial Active</h3>
          <p className="text-sm opacity-80">You have {daysLeft} days left in your 7-day free trial.</p>
        </div>
        <button onClick={() => window.location.href='/pricing'} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold whitespace-nowrap hover:bg-primary/90 transition-colors">View Plans</button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderTrialBanner()}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back{userName ? `, ${userName}` : ''}! 👋</h1>
          <p className="text-foreground/60 text-sm mt-1">Here is what's happening with your projects today.</p>
          <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
            Backend Status: {apiStatus}
          </span>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
          Create Task
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card p-6 rounded-2xl border border-border shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-primary/5 text-primary rounded-xl">
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
              <p className="text-foreground/60 text-sm mt-1">{stat.name}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm min-h-[300px]">
          <h2 className="text-lg font-bold text-foreground mb-4">Recent Tasks</h2>
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-foreground/50 text-sm flex-col">
              <p>No tasks found. Please login and create one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task._id} className="p-3 border border-border rounded-xl flex justify-between">
                  <span>{task.title}</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">{task.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-bold text-foreground mb-4 self-start">WhatsApp Integration</h2>
          
          {waConnected ? (
            <div className="text-green-500 flex flex-col items-center">
              <CheckCircle className="w-16 h-16 mb-2" />
              <p className="font-medium">WhatsApp Connected!</p>
              <p className="text-sm text-foreground/60 mt-2">AI is now listening to incoming messages.</p>
            </div>
          ) : qrCode ? (
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white rounded-xl shadow-sm mb-4">
                <QRCodeSVG value={qrCode} size={180} />
              </div>
              <p className="text-sm font-medium text-foreground">Scan with WhatsApp</p>
              <p className="text-xs text-foreground/60 mt-1">Open WhatsApp {'>'} Linked Devices</p>
              <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10 text-xs text-foreground/70 text-left w-full">
                <strong>🔒 End-to-End Encrypted</strong><br />
                Your connection is fully secure. We use the official WhatsApp Web protocol to ensure your messages remain private and safe from third-party interception.
              </div>
            </div>
          ) : (
            <p className="text-foreground/50 text-sm">Generating QR Code...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
