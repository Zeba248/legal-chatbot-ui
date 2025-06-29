import { useState, useEffect, useRef } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Load chat history on first load
  useEffect(() => {
    const saved = localStorage.getItem('chat_history');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  // Scroll & save chat every update
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages, loading]);

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
    localStorage.removeItem('chat_history');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <header className="bg-white border-b border-gray-200 p-4 flex justify-center shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/bot-avatar.png" alt="Bot" className="h-8 w-8 rounded-full border border-gray-300" />
          <span className="text-xl font-semibold">ATOZ Legal Chatbot</span>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-3 rounded-xl shadow text-sm whitespace-pre-line ${msg.sender === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-900 flex items-start gap-2 hover:bg-gray-300 transition'}
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

      <footer className="p-3 border-t border-gray-200 bg-white text-gray-500 text-center text-xs">
        ⚖️ This chatbot provides legal guidance based on Indian laws. For serious matters, consult a registered lawyer.
      </footer>

      <div className="text-center text-xs text-blue-500 cursor-pointer hover:underline p-2" onClick={handleClear}>
        🗑️ Clear Chat History
      </div>

      <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 sticky bottom-0 z-10">
        <input
          type="text"
          placeholder="Ask your legal question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-900 border border-gray-300 placeholder:text-gray-500"
        />
        <button onClick={handleSend} className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-xl hover:bg-blue-500">
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
