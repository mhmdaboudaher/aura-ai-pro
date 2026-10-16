'use client';

import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (res.ok && data.result) {
        setMessages([...newMessages, { role: 'assistant', content: data.result }]);
      } else {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: `عذراً، حدث خطأ: ${data.error || 'تعذر جلب الإجابة'}` },
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'عذراً، حدث خطأ أثناء الاتصال بالسيرفر.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white p-4">
      <header className="p-4 border-b border-slate-700 font-bold text-xl flex items-center justify-between">
        <div>
          <span>AURA AI </span>
          <span className="text-xs bg-blue-600 px-2 py-1 rounded ml-2">PRO</span>
        </div>
        <div className="text-xs text-gray-400">متصل بـ openai/gpt-oss-120b</div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-2xl whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-blue-600 ml-auto text-right'
                : 'bg-slate-800 mr-auto text-left border border-slate-700'
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && <div className="text-gray-400 animate-pulse">جاري جلب الإجابة...</div>}
      </div>

      <div className="flex gap-2 p-2 bg-slate-800 rounded-lg border border-slate-700">
        <input
          className="flex-1 bg-transparent outline-none px-3 text-white placeholder-gray-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="اكتب سؤالك هنا..."
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-medium transition disabled:opacity-50"
        >
          إرسال
        </button>
      </div>
    </div>
  );
}