'use client';

import { useState } from 'react';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { isSignedIn, user } = useUser();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          userId: user?.id 
        }),
      });

      const data = await res.json();

      if (res.ok && data.result) {
        setMessages([...newMessages, { role: 'assistant', content: data.result }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'حدث خطأ أثناء معالجة الطلب.' }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">AURA AI</h1>
          <span className="bg-blue-600 text-xs px-2 py-0.5 rounded text-white font-semibold">PRO</span>
        </div>

        {/* أزرار التسجيل والحساب */}
        <div className="flex items-center gap-4">
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                تسجيل الدخول
              </button>
            </SignInButton>
          ) : (
            <UserButton />
          )}
        </div>
      </header>

      {/* منطقة المحادثة */}
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl max-w-2xl ${
              msg.role === 'user' ? 'bg-blue-600 ml-auto' : 'bg-slate-800'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-slate-400 text-sm">جاري التفكير...</div>}
      </main>

      {/* مربع إدخال النص */}
      <footer className="p-4 border-t border-slate-800">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="اكتب سؤالك..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            إرسال
          </button>
        </div>
      </footer>
    </div>
  );
}