import { useState, useEffect, useRef } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const scrollRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleString();
    const userMsg = { sender: 'user', text: input, time: timestamp };
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
      const botMsg = { sender: 'bot', text: data.response || "⚠️ Unexpected response.", time: new Date().toLocaleString() };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [...prev, { sender: 'bot', text: "❌ Backend not responding. Please try again later.", time: new Date().toLocaleString() }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages, loading]);

  const toggleTheme = () => setDarkMode(!darkMode);
  const clearChat = () => setMessages([]);
  const exportToWhatsApp = () => {
    const text = messages.map(msg => `${msg.sender.toUpperCase()}: ${msg.text}`).join('\n');
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen flex flex-col`}>
      <header className={`p-4 flex justify-between items-center shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center gap-3">
          <img src="/bot-avatar.png" alt="Bot" className="h-8 w-8 rounded-full border border-gray-300" />
          <span className="text-xl font-semibold">ATOZ Legal Chatbot</span>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="px-3 py-1 rounded bg-teal-400 text-black font-semibold">{darkMode ? 'Light' : 'Dark'}</button>
          <button onClick={clearChat} className="px-3 py-1 rounded bg-teal-500 text-white font-semibold">Clear</button>
          <button onClick={exportToWhatsApp} className="px-3 py-1 rounded bg-teal-500 text-white font-semibold">Export</button>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-3 rounded-xl shadow text-sm whitespace-pre-line ${msg.sender === 'user'
              ? 'bg-blue-600 text-white'
              : `${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'} flex items-start gap-2 hover:bg-opacity-80 transition`}
            `}>
              {msg.sender === 'bot' && <img src="/bot-avatar.png" className="h-6 w-6 rounded-full mt-1" />}
              <div>
                <span>{msg.text}</span>
                <div className="text-[10px] text-gray-500 mt-1">{msg.time}</div>
              </div>
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


      <div className={`p-3 border-t flex items-center gap-2 sticky bottom-0 z-10 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <input
          type="text"
          placeholder="Ask your legal question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className={`flex-1 px-4 py-2 rounded-xl border placeholder:text-gray-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-300'}`}
        />
        <button onClick={handleSend} className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-xl hover:bg-blue-500">
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
