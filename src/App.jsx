// ✅ Complete updated App.js with PDF upload on left, icon, and smart prompt
import { useState, useEffect, useRef } from 'react';
import { FaFilePdf, FaWhatsapp, FaSun, FaMoon, FaTrash, FaPaperPlane } from 'react-icons/fa';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const scrollRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

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
      streamMessage(data.response || "⚠️ Unexpected response.");
    } catch {
      setMessages((prev) => [...prev, { sender: 'bot', text: "❌ Backend not responding." }]);
    } finally {
      setLoading(false);
    }
  };

  const streamMessage = (text) => {
    let i = 0;
    setMessages((prev) => [...prev, { sender: 'bot', text: '' }]);

    const stream = () => {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text += text[i];
        return updated;
      });
      i++;
      if (i < text.length) setTimeout(stream, 20);
    };
    stream();
  };

  const handlePDFUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMessages((prev) => [...prev, { sender: 'pdf', text: file.name }]);
    setMessages((prev) => [...prev, {
      sender: 'bot',
      text: `🧾 I got your PDF: "${file.name}"\nWould you like me to:\n1️⃣ Extract legal insights\n2️⃣ Summarize sections\n3️⃣ Ask a legal question?`
    }]);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const resetChat = () => {
    setHistory([{ id: Date.now(), title: messages[0]?.text?.slice(0, 30), chat: messages }, ...history]);
    setMessages([]);
  };

  const loadChat = (chat) => {
    setMessages(chat.chat);
    setSelectedChat(chat.id);
  };

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 p-4 space-y-4 border-r dark:border-gray-700">
          <h2 className="text-lg font-bold">🗂️ Saved Chats</h2>
          <input type="file" accept="application/pdf" onChange={handlePDFUpload} className="hidden" id="pdfUpload" />
          <label htmlFor="pdfUpload" className="flex items-center gap-2 p-2 rounded bg-gray-100 dark:bg-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
            <FaFilePdf className="text-red-600" /> Upload PDF
          </label>
          {history.map((h) => (
            <button key={h.id} className={`block w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedChat === h.id ? 'bg-gray-200 dark:bg-gray-700' : ''}`} onClick={() => loadChat(h)}>
              {h.title || 'Untitled Chat'}
            </button>
          ))}
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/bot-avatar.png" alt="Bot" className="h-8 w-8 rounded-full border border-gray-300" />
              <span className="text-xl font-semibold">ATOZ Legal Chatbot</span>
            </div>
            <button onClick={toggleTheme} className="px-3 py-1 text-sm bg-teal-600 text-white rounded">
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </header>

          <main className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md p-3 rounded-xl shadow text-sm whitespace-pre-line ${msg.sender === 'user'
                  ? 'bg-teal-600 text-white'
                  : msg.sender === 'pdf'
                    ? 'bg-yellow-100 text-gray-800 border border-yellow-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition'}
                `}>
                  {msg.sender === 'pdf' && <><FaFilePdf className="inline mr-1 text-red-600" /> <strong>{msg.text}</strong></>}
                  {msg.sender !== 'pdf' && msg.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-sm text-gray-500 animate-pulse">Typing...</div>}
            <div ref={scrollRef} />
          </main>

          {/* Bottom Bar */}
          <div className="p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask your legal question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
            />
            <button onClick={handleSend} className="bg-teal-600 text-white p-2 rounded-xl"><FaPaperPlane /></button>
            <button onClick={resetChat} className="bg-teal-600 text-white p-2 rounded-xl"><FaTrash /></button>
            <a href="https://wa.me/?text=Hello%20ATOZ%20Legal%20Chatbot" target="_blank" rel="noopener noreferrer">
              <button className="bg-teal-600 text-white p-2 rounded-xl"><FaWhatsapp /></button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
