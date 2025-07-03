import { useState, useEffect, useRef } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const scrollRef = useRef(null);
  const [darkMode, setDarkMode] = useState(false);
  const [docId, setDocId] = useState(null);

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
        body: JSON.stringify({ question: input, doc_id: docId })
      });
      const data = await res.json();
      const botMsg = { sender: 'bot', text: data.response || "⚠️ Unexpected response." };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [...prev, { sender: 'bot', text: "❌ Backend not responding." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const fileMsg = { sender: 'user', text: `📄 Uploaded: ${file.name}` };
    setMessages((prev) => [...prev, fileMsg, { sender: 'bot', text: 'Processing your PDF...' }]);

    try {
      const res = await fetch("https://legal-bot-backend.onrender.com/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setDocId(data.doc_id);
      setMessages((prev) => [...prev, { sender: 'bot', text: data.message }]);
    } catch {
      setMessages((prev) => [...prev, { sender: 'bot', text: "❌ Failed to upload PDF." }]);
    }
  };

  const handleReset = () => {
    if (messages.length > 0) {
      setHistory([{ id: Date.now(), title: messages[0]?.text.slice(0, 30), chat: messages }, ...history]);
    }
    setMessages([]);
    setDocId(null);
    setSelectedChat(null);
  };

  const deleteChat = (id) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    if (selectedChat === id) {
      setMessages([]);
      setSelectedChat(null);
    }
  };

  const loadChat = (chat) => {
    setMessages(chat.chat);
    setSelectedChat(chat.id);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <aside className="w-64 bg-white dark:bg-gray-800 p-4 space-y-4 border-r dark:border-gray-700">
          <h2 className="text-lg font-bold">🗂️ Saved Chats</h2>
          <input type="file" accept="application/pdf" onChange={(e) => handleUpload(e.target.files[0])} className="text-sm" />
          {history.map((h) => (
            <div key={h.id} className="flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded">
              <button
                className={`flex-1 text-left p-2 rounded ${selectedChat === h.id ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                onClick={() => loadChat(h)}
              >
                {h.title || 'Untitled Chat'}
              </button>
              <button
                onClick={() => deleteChat(h.id)}
                title="Delete this chat"
                className="text-red-500 hover:text-red-700 px-2"
              >🗑️</button>
            </div>
          ))}
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="bg-white dark:bg-gray-800 p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/bot-avatar.png" className="h-8 w-8 rounded-full" alt="Bot" />
              <span className="text-xl font-bold">ATOZ Legal Chatbot</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-teal-600 text-white px-3 py-1 rounded"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </header>

          <main className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md p-3 rounded-xl shadow text-sm whitespace-pre-line ${msg.sender === 'user'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                  {msg.sender === 'bot' && <img src="/bot-avatar.png" className="h-5 w-5 rounded-full mb-1" />}
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

          <div className="p-3 bg-white dark:bg-gray-800 border-t flex items-center gap-2 sticky bottom-0 z-10">
            <input
              type="text"
              placeholder="Ask your legal question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-black dark:text-white border"
            />
            <button onClick={handleSend} className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-500">Send</button>
            <button onClick={handleReset} className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-500">Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
