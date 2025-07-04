// ✅ Final App.jsx with: 
// - Auto-save on chat switch/reset
// - Unlimited saved chats
// - Persistent left sidebar like ChatGPT
// - Old behavior unchanged

import { useState, useEffect, useRef } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [docId, setDocId] = useState(null);
  const [history, setHistory] = useState([]); // All saved chats
  const [selectedChat, setSelectedChat] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('legal_chat_history') || '[]');
    setHistory(saved);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveCurrentChat = (id = docId, msgs = messages) => {
    if (!id || msgs.length === 0) return;
    const updated = history.filter((c) => c.id !== id);
    updated.unshift({ id, messages: msgs });
    setHistory(updated);
    localStorage.setItem('legal_chat_history', JSON.stringify(updated));
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setInput('');

    try {
      const res = await fetch("https://legal-bot-backend.onrender.com/ask", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input, doc_id: docId })
      });
      const data = await res.json();
      const botMsg = { sender: 'bot', text: data.response };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: '⚠️ Backend not responding.' }]);
    }
    setLoading(false);
  };

  const handleReset = () => {
    saveCurrentChat();
    const newId = crypto.randomUUID();
    setDocId(newId);
    setMessages([]);
    setSelectedChat(null);
  };

  const handleDelete = (id) => {
    const updated = history.filter((c) => c.id !== id);
    setHistory(updated);
    localStorage.setItem('legal_chat_history', JSON.stringify(updated));
    if (id === docId) {
      setDocId(null);
      setMessages([]);
      setSelectedChat(null);
    }
  };

  const handleChatSelect = (c) => {
    if (messages.length > 0 && (!selectedChat || selectedChat.id !== c.id)) {
      saveCurrentChat();
    }
    setDocId(c.id);
    setMessages(c.messages);
    setSelectedChat(c);
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {/* ✅ Sidebar Chat List */}
      <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto">
        <h2 className="font-bold mb-3">Saved Chats</h2>
        {history.map((c, i) => (
          <div
            key={c.id}
            className={`p-2 cursor-pointer rounded mb-2 ${selectedChat?.id === c.id ? 'bg-blue-200 dark:bg-blue-600' : 'bg-white dark:bg-gray-700'}`}
            onClick={() => handleChatSelect(c)}>
            Chat {i + 1}
            <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="float-right text-red-500">🗑️</button>
          </div>
        ))}
      </div>

      {/* ✅ Chat Panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-600">
          <h1 className="text-xl font-bold">⚖️ ATOZ Legal Chatbot</h1>
          <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? '☀️' : '🌙 Dark'}</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div key={i} className={`my-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}>{msg.text}</div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <div className="p-4 border-t dark:border-gray-600 flex gap-2">
          <input
            className="flex-1 p-2 rounded border dark:bg-gray-800 dark:text-white"
            value={input}
            placeholder="Ask your legal question..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">Send</button>
          <button onClick={handleReset} className="bg-yellow-500 text-white px-4 py-2 rounded">Reset</button>
        </div>
      </div>
    </div>
  );
}

export default App;
