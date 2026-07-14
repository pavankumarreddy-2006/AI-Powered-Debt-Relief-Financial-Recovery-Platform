import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, User, AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';
import api from '../services/api';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);

  const fetchChatHistory = async () => {
    try {
      const response = await api.get('/chat');
      setMessages(response.data);
    } catch (err) {
      setError('Failed to fetch chat logs.');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Auto-scroll to bottom of chat feed
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    setInput('');
    setSending(true);
    setError('');

    // Optimistically add user message to list
    const tempUserMsg = { id: Date.now(), sender: 'User', message: textToSend, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await api.post('/chat', { message: textToSend });
      // Replace or sync messages
      setMessages((prev) => [...prev.slice(0, prev.length - 1), tempUserMsg, response.data]);
    } catch (err) {
      setError('Advisor connection failed. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear your advisory chat logs?')) {
      try {
        await api.delete('/chat/clear');
        setMessages([]);
      } catch (err) {
        alert('Failed to clear logs.');
      }
    }
  };

  const suggestionPills = [
    "Should I prioritize high-interest credit card debt?",
    "Explain the difference between Snowball and Avalanche.",
    "How does a hardship settlement impact credit ratings?",
    "What key points should I mention to debt collectors?"
  ];

  return (
    <div className="flex-1 p-6 flex flex-col h-full bg-slate-50 dark:bg-darkBg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Financial Advisor</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Receive personalized, ethical restructurings and pay-down advice from Gemini.</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="text-xs text-red-500 hover:text-red-600 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 px-3 py-1.5 rounded-xl transition-all"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Main chat window container */}
      <div className="flex-1 bg-white dark:bg-darkCard rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {loadingHistory ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 max-w-sm mx-auto text-center space-y-4">
              <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500">
                <Sparkles size={28} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Start Advisory Chat</h3>
                <p className="text-xs leading-relaxed mt-1">Ask questions regarding debt payoffs, consolidating loans, DTI analysis, or negotiation tips.</p>
              </div>
              {/* Floating suggestions */}
              <div className="grid grid-cols-1 gap-2 w-full pt-4">
                {suggestionPills.map(p => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    className="text-[11px] font-medium text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-500/40 transition-all flex items-start space-x-1.5"
                  >
                    <HelpCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 pr-1">
              {messages.map((msg) => {
                const isUser = msg.sender === 'User';
                return (
                  <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-2.5 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${isUser ? 'bg-primary-600 text-white' : 'bg-emerald-600 text-white'}`}>
                        {isUser ? <User size={15} /> : <Sparkles size={15} />}
                      </div>

                      {/* Bubble */}
                      <div className={`p-4 rounded-2xl shadow-sm text-xs leading-relaxed ${
                        isUser
                          ? 'bg-primary-600 text-white rounded-tr-none'
                          : 'bg-slate-100 dark:bg-slate-800/80 rounded-tl-none text-slate-700 dark:text-slate-200 border border-slate-200/20 dark:border-slate-800/20'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2.5 max-w-[80%]">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Sparkles size={15} className="animate-pulse" />
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl rounded-tl-none p-4 border border-slate-200/20 dark:border-slate-800/20 flex space-x-1.5 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce delay-150"></span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-2 text-xs text-red-400">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              disabled={sending}
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors disabled:opacity-50 text-slate-800 dark:text-slate-200"
              placeholder="Ask your recovery advisor a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="p-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-md shadow-primary-600/10 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
