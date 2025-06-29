import { useState, useEffect, useRef } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('chat')) || []);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const scrollRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setInput('');

    try {
      const res = await fetch("https://legal-bot-backend.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input })
      });
      const data = await res.json();
      const botMsg = { sender: 'bot', text: data.response || "⚠️ Unexpected response." };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [...prev, { sender: 'bot', text: "❌ Backend not responding. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem('chat');
  };

  const handleExport = () => {
    const text = messages.map(m => `${m.sender === 'user' ? 'You' : 'Bot'}: ${m.text}`).join('\n');
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('https://legal-bot-backend.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'bot', text: data.response || 'No response.' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: "❌ File upload failed." }]);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem('chat', JSON.stringify(messages));
  }, [messages, loading]);

  return (
    <div className={darkMode ? "dark bg-gray-900 text-white min-h-screen flex flex-col" : "min-h-screen bg-gray-50 text-gray-900 flex flex-col"}>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/bot-avatar.png" alt="Bot" className="h-8 w-8 rounded-full border border-gray-300" />
          <span className="text-xl font-semibold">ATOZ Legal Chatbot</span>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            📎 <input type="file" onChange={handlePDFUpload} className="hidden" />
          </label>
          <button onClick={handleExport} className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-500 text-sm">📤 Export</button>
          <button onClick={handleClear} className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-500 text-sm">🗑️ Clear</button>
          <button onClick={() => setDarkMode(!darkMode)} className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-500 text-sm">
            {darkMode ? '🌞 Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-3 rounded-xl shadow text-sm whitespace-pre-line ${msg.sender === 'user'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white flex items-start gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition'}
            `}>
              {msg.sender === 'bot' && <img src="/bot-avatar.png" className="h-6 w-6 rounded-full mt-1" />}
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm shadow animate-pulse">Typing...</div>
          </div>
        )}
        <div ref={scrollRef} />
      </main>

   

      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 sticky bottom-0 z-10">
        <input
          type="text"
          placeholder="Ask your legal question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-900 border border-gray-300 placeholder:text-gray-500"
        />
        <button onClick={handleSend} className="bg-teal-600 text-white font-semibold px-5 py-2 rounded-xl hover:bg-teal-500">
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
