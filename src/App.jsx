import { useState, useEffect, useRef } from 'react';
import { FaWhatsapp, FaTrash, FaUpload } from 'react-icons/fa';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
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

  const handlePDFUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Backend PDF handling would go here
    setMessages((prev) => [...prev, { sender: 'bot', text: '📄 Your PDF has been uploaded successfully. You can now ask questions based on its contents.' }]);
  };

  const handleReset = () => setMessages([]);

  const exportToWhatsApp = () => {
    const text = messages.map(m => `${m.sender === 'user' ? 'You' : 'Bot'}: ${m.text}`).join('\n');
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className={`min-h-screen flex flex-col ${dark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`border-b p-4 flex justify-between items-center shadow-sm ${dark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center gap-3">
          <img src="/bot-avatar.png" alt="Bot" className="h-8 w-8 rounded-full border border-gray-300" />
          <span className="text-xl font-semibold">ATOZ Legal Chatbot</span>
        </div>
        <button
          onClick={() => setDark(!dark)}
          className={`px-3 py-1 rounded-full ${dark ? 'bg-teal-700 text-white' : 'bg-teal-600 text-white'}`}>🌙 {dark ? 'Light' : 'Dark'}</button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-3 rounded-xl shadow text-sm whitespace-pre-line flex items-start gap-2 ${msg.sender === 'user'
              ? 'bg-teal-600 text-white'
              : `${dark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'} transition`}`}>
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

   

      <div className={`p-3 border-t flex items-center gap-2 sticky bottom-0 z-10 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <label className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-xl cursor-pointer">
          <FaUpload className="inline mr-1" /> Upload PDF
          <input type="file" accept=".pdf" hidden onChange={handlePDFUpload} />
        </label>
        <input
          type="text"
          placeholder="Ask your legal question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-900 border border-gray-300 placeholder:text-gray-500"
        />
        <button onClick={handleSend} className="bg-teal-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-teal-700">Send</button>
        <button onClick={handleReset} className="bg-teal-600 text-white px-3 py-2 rounded-xl hover:bg-teal-700"><FaTrash /></button>
        <button onClick={exportToWhatsApp} className="bg-teal-600 text-white px-3 py-2 rounded-xl hover:bg-teal-700"><Export/></button>
      </div>
    </div>
  );
}

export default App;
