import { useState, useEffect, useRef } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('chat') || '[]'));
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const scrollRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    localStorage.setItem('chat', JSON.stringify(updatedMessages));
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
      const updated = [...updatedMessages, botMsg];
      setMessages(updated);
      localStorage.setItem('chat', JSON.stringify(updated));
    } catch {
      const errorMsg = { sender: 'bot', text: "❌ Backend not responding. Please try again later." };
      const updated = [...updatedMessages, errorMsg];
      setMessages(updated);
      localStorage.setItem('chat', JSON.stringify(updated));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem('chat');
  };

  const handleExport = () => {
    const chatText = messages.map(m => `${m.sender === 'user' ? 'You' : 'Bot'}: ${m.text}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chat.txt';
    link.click();
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async () => {
        const text = reader.result;
        const botMsg = { sender: 'bot', text: `📄 PDF uploaded. Contents:\n\n${text.slice(0, 500)}...` };
        const updated = [...messages, botMsg];
        setMessages(updated);
        localStorage.setItem('chat', JSON.stringify(updated));
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col`}>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/bot-avatar.png" alt="Bot" className="h-8 w-8 rounded-full border border-gray-300" />
          <span className="text-xl font-semibold">ATOZ Legal Chatbot</span>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className="text-sm px-3 py-1 rounded-md bg-teal-600 text-white hover:bg-teal-500">
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-3 rounded-xl shadow text-sm whitespace-pre-line ${msg.sender === 'user'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-start gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition'}
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

      <footer className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 text-center text-xs">
        ⚖️ This chatbot provides legal guidance based on Indian laws. For serious matters, consult a registered lawyer.
      </footer>

      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 sticky bottom-0 z-10">
        <input
          type="file"
          accept="application/pdf"
          onChange={handlePDFUpload}
          className="hidden"
          id="upload-pdf"
        />
        <label htmlFor="upload-pdf" className="text-sm px-3 py-2 bg-teal-600 text-white rounded-xl cursor-pointer hover:bg-teal-500">
          📎 Upload PDF
        </label>

        <input
          type="text"
          placeholder="Ask your legal question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-900 border border-gray-300 placeholder:text-gray-500"
        />
        <button onClick={handleSend} className="bg-teal-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-teal-500">
          Send
        </button>
        <button onClick={handleClear} className="bg-teal-600 text-white px-3 py-2 rounded-xl hover:bg-teal-500">
          🔄 Reset
        </button>
        <button onClick={handleExport} className="bg-teal-600 text-white px-3 py-2 rounded-xl hover:bg-teal-500">
          📤 WhatsApp
        </button>
      </div>
    </div>
  );
}

export default App;
