import { useState, useEffect, useRef } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  // initialize a unique docId immediately so UI always renders
  const [docId, setDocId] = useState(() => Date.now().toString());
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedChat, setSelectedChat] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom on every new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Persist and load chat when switching
  useEffect(() => {
    if (selectedChat) {
      // auto-save current before switching
      saveCurrentChat();
      const chat = history.find((h) => h.id === selectedChat);
      if (chat) {
        setMessages(chat.messages);
        setDocId(chat.docId);
      }
    }
  }, [selectedChat]);

  const saveCurrentChat = (newHistory = history) => {
    if (!messages.length) return;
    const existing = newHistory.find((h) => h.id === docId);
    const updated = existing
      ? newHistory.map((h) => (h.id === docId ? { id: docId, messages, docId } : h))
      : [...newHistory, { id: docId, messages, docId }];
    localStorage.setItem('chatHistory', JSON.stringify(updated));
    setHistory(updated);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setInput('');

    try {
      const res = await fetch('https://legal-bot-backend.onrender.com/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.text, doc_id: docId }),
      });
      const data = await res.json();
      const botMsg = { sender: 'bot', text: data.response };
      setMessages((prev) => [...prev, botMsg]);
      saveCurrentChat();
    } catch (err) {
      const errorMsg = { sender: 'bot', text: '❌ Backend not responding. Please try again later.' };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    saveCurrentChat();
    const newId = Date.now().toString();
    setDocId(newId);
    setMessages([]);
    setSelectedChat(null);
  };

  const handleDelete = (id) => {
    const updated = history.filter((h) => h.id !== id);
    localStorage.setItem('chatHistory', JSON.stringify(updated));
    setHistory(updated);
    if (id === selectedChat) {
      setMessages([]);
      setSelectedChat(null);
      setDocId(Date.now().toString());
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('https://legal-bot-backend.onrender.com/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setDocId(data.doc_id);
    setMessages((prev) => [...prev, { sender: 'bot', text: data.message }]);
    saveCurrentChat();
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} flex`}>
      {/* Sidebar */}
      <div className="w-64 p-4 border-r overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Saved Chats</h2>
        {history.map((h) => (
          <div
            key={h.id}
            className={`cursor-pointer p-2 rounded mb-1 ${selectedChat === h.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
            onClick={() => setSelectedChat(h.id)}
          >
            Chat #{h.id.slice(-4)}
            <button
              className="ml-2 text-red-500"
              onClick={(e) => { e.stopPropagation(); handleDelete(h.id); }}
            >🗑️</button>
          </div>
        ))}
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between p-4 border-b">
          <h1 className="text-2xl font-bold">ATOZ Legal Chatbot</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button onClick={handleReset} className="bg-yellow-400 px-3 py-1 rounded">Reset</button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              className="bg-purple-500 text-white px-3 py-1 rounded"
              onClick={() => fileInputRef.current.click()}
            >Upload</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg max-w-xl ${m.sender === 'user' ? 'bg-blue-100 self-end text-right' : 'bg-gray-100 self-start text-left'}`}
            >
              {m.text}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <div className="p-4 border-t flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 p-2 rounded border"
            placeholder="Ask your legal question..."
          />
          <button onClick={handleSend} className="bg-green-500 text-white px-4 py-1 rounded">Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
