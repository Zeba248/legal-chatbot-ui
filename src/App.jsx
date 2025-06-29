import { useState, useEffect, useRef } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { type: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setTyping(true);

    try {
      const res = await fetch("https://legal-bot-backend.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input })
      });
      const data = await res.json();
      setTyping(false);
      setMessages(prev => [...prev, { type: 'bot', text: data.response || "⚠️ Unexpected format." }]);
    } catch (err) {
      setTyping(false);
      setMessages(prev => [...prev, { type: 'bot', text: "❌ Backend not responding. Please try again later." }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-700 text-white text-xl font-semibold px-6 py-4 shadow-md flex items-center gap-2">
        ⚖️ ATOZ Legal Chatbot
      </header>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-md px-4 py-2 rounded-xl shadow ${
              msg.type === 'user'
                ? 'bg-blue-500 text-white self-end rounded-br-none'
                : 'bg-white text-gray-900 self-start rounded-bl-none'
            }`}
          >
            {msg.text}
          </div>
        ))}

        {typing && (
          <div className="bg-gray-200 px-4 py-2 rounded-xl text-gray-600 w-fit shadow self-start">
            Typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-white border-t flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your legal question..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700"
        >
          Send
        </button>
      </footer>
    </div>
  );
}

export default App;
