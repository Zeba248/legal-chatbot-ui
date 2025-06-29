// App.jsx
import { useState, useEffect, useRef } from 'react';
import { FaWhatsapp, FaRedo, FaUpload } from 'react-icons/fa';
import { BsFillMoonFill, BsFillSunFill } from 'react-icons/bs';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [pdfText, setPdfText] = useState('');
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
        body: JSON.stringify({ question: input, context: pdfText })
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("https://legal-bot-backend.onrender.com/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      const preview = data.text.slice(0, 1000);
      setPdfText(data.text);
      setMessages((prev) => [...prev, { sender: 'bot', text: `📄 PDF uploaded. Contents:\n\n${preview}...` }]);
    } catch {
      setMessages((prev) => [...prev, { sender: 'bot', text: "❌ Failed to upload PDF." }]);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleReset = () => {
    setMessages([]);
    setInput('');
    setPdfText('');
  };

  return (
    <div className={`${dark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen flex flex-col`}>
      <header className={`${dark ? 'bg-gray-800' : 'bg-white'} border-b p-4 flex justify-between items-center shadow-sm`}>
        <div className="flex items-center gap-2">
          <img src="/bot-avatar.png" alt="Bot" className="h-8 w-8 rounded-full border" />
          <span className="text-xl font-bold">ATOZ Legal Chatbot</span>
        </div>
        <button
          onClick={() => setDark(!dark)}
          className="text-xs flex items-center gap-1 bg-teal-600 text-white px-3 py-1 rounded-full shadow"
        >
          {dark ? <BsFillSunFill /> : <BsFillMoonFill />} {dark ? 'Light' : 'Dark'}
        </button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-3 rounded-xl shadow text-sm whitespace-pre-line ${msg.sender === 'user'
              ? 'bg-teal-600 text-white'
              : `${dark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'} flex items-start gap-2 hover:bg-opacity-80 transition`}
            `}>
              {msg.sender === 'bot' && <img src="/bot-avatar.png" className="h-6 w-6 rounded-full mt-1" alt="Bot" />}
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm shadow animate-pulse">
              Typing...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </main>

     

      <div className={`${dark ? 'bg-gray-800' : 'bg-white'} p-3 border-t flex items-center gap-2 sticky bottom-0 z-10`}>
        <label className="bg-teal-600 text-white px-3 py-2 rounded-xl text-sm cursor-pointer flex items-center gap-2">
          <FaUpload /> Upload PDF
          <input type="file" accept="application/pdf" hidden onChange={handleFileUpload} />
        </label>
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
        <button onClick={handleReset} className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-1">
          <FaRedo /> Reset
        </button>
        <button className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-1">
          <FaWhatsapp /> WhatsApp
        </button>
      </div>
    </div>
  );
}

export default App;
