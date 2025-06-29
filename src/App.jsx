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

    const userMsg = {
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleString()
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);
    setInput('');

    try {
      const res = await fetch("https://legal-bot-backend.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input })
      });
      const data = await res.json();
      const botMsg = {
        sender: 'bot',
        text: data.response || "⚠️ Unexpected response.",
        timestamp: new Date().toLocaleString()
      };
      setMessages(prev => {
        const newMsgs = [...prev, botMsg];
        localStorage.setItem('chat_history', JSON.stringify(newMsgs));
        return newMsgs;
      });
    } catch {
      const errMsg = {
        sender: 'bot',
        text: "❌ Backend not responding. Please try again later.",
        timestamp: new Date().toLocaleString()
      };
      setMessages(prev => {
        const newMsgs = [...prev, errMsg];
        localStorage.setItem('chat_history', JSON.stringify(newMsgs));
        return newMsgs;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleDark = () => setDarkMode(!darkMode);

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`border-b p-4 flex justify-between items-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <img src="/bot-avatar.png" alt="Bot" className="h-8 w-8 rounded-full border" />
          <span className="text-xl font-semibold">ATOZ Legal Chatbot</span>
        </div>
        <button
          onClick={toggleDark}
          className="text-sm border px-3 py-1 rounded-md hover:opacity-80"
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-3 rounded-xl shadow text-sm whitespace-pre-line ${msg.sender === 'user'
              ? 'bg-blue-600 text-white'
              : `${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'} flex items-start gap-2 hover:opacity-90 transition'`}
            `}>
              {msg.sender === 'bot' && <img src="/bot-avatar.png" className="h-6 w-6 rounded-full mt-1" />}
              <div>
                <span>{msg.text}</span>
                <div className="text-xs text-gray-400 mt-1">{msg.timestamp}</div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white px-4 py-2 rounded-xl text-sm shadow">
              Typing...
            </div>
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
          className={`flex-1 px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400 border border-gray-600' : 'bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300'}`}
        />
        <button onClick={handleSend} className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-xl hover:bg-blue-500">
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
