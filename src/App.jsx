// ✅ STEP 1: Updated App.jsx with cleaner styling, auto-scroll, typing animation, chat bubbles, and centered header

import { useState, useRef, useEffect } from 'react';
import botAvatar from './bot.png'; // Upload the law logo image as bot.png in src folder

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { type: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('https://legal-bot-backend.onrender.com/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { type: 'bot', text: data.response || '⚠️ Unexpected response.' }]);
    } catch {
      setMessages((prev) => [...prev, { type: 'bot', text: '❌ Backend not responding. Try later.' }]);
    }
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white text-center py-4 shadow-md">
        <h1 className="text-xl font-bold">⚖️ ATOZ Legal Chatbot</h1>
      </header>

      {/* Chat Section */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.type === 'bot' && (
              <img src={botAvatar} alt="Bot" className="w-8 h-8 rounded-full mr-2 shadow-md" />
            )}
            <div
              className={`max-w-xs px-4 py-2 rounded-xl text-white shadow-md ${
                msg.type === 'user' ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2">
            <img src={botAvatar} alt="Bot" className="w-8 h-8 rounded-full mr-2" />
            <div className="flex space-x-1 animate-pulse">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </main>

      {/* Input Section */}
      <footer className="p-4 border-t bg-white flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none"
          placeholder="Ask your legal question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white rounded-full px-4 py-2 hover:bg-blue-700"
        >
          Send
        </button>
      </footer>

      {/* Footer Branding */}
      <div className="text-center text-xs text-gray-500 py-2">
        © 2025 ATOZ Legal Chatbot. For professional lawyer use only.
      </div>
    </div>
  );
}

export default App;
