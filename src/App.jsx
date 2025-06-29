import { useState, useEffect, useRef } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="bg-yellow-600 text-black font-bold p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <img src="/bot-avatar.png" alt="Bot" className="h-8 w-8 rounded-full border border-black" />
          <center><span className="text-xl">ATOZ Legal Chatbot</span></center>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-3 rounded-xl shadow-md text-sm whitespace-pre-line ${msg.sender === 'user'
              ? 'bg-yellow-500 text-black'
              : 'bg-gray-800 text-white flex items-start gap-2'}`}>
              {msg.sender === 'bot' && <img src="/bot-avatar.png" className="h-6 w-6 rounded-full mt-1" />}
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-white px-4 py-2 rounded-xl text-sm shadow animate-pulse">Typing...</div>
          </div>
        )}
        <div ref={scrollRef} />
      </main>

    

      <div className="p-3 bg-black border-t border-gray-700 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask your legal question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-900 text-white border border-yellow-500 placeholder:text-yellow-400"
        />
        <button onClick={handleSend} className="bg-yellow-500 text-black font-bold px-5 py-2 rounded-xl hover:bg-yellow-400">
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
