import { useState, useEffect, useRef } from "react";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [docId, setDocId] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("chatHistoryV2");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedChat, setSelectedChat] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Restore messages and docId on switching chat
  useEffect(() => {
    if (selectedChat) {
      const chat = history.find((h) => h.id === selectedChat);
      if (chat) {
        setMessages(chat.messages);
        setDocId(chat.docId);
      }
    } else {
      setMessages([]);
      setDocId(Date.now().toString());
    }
  }, [selectedChat]);

  // Auto-save on every chat/message update
  useEffect(() => {
    if (selectedChat !== null) {
      saveCurrentChat();
    }
    // eslint-disable-next-line
  }, [messages, docId]);

  // Save chat to localStorage (with docId)
  const saveCurrentChat = (customHistory) => {
    if (!docId) return;
    const newHistory = customHistory || history;
    const idx = newHistory.findIndex((h) => h.id === docId);
    const newEntry = { id: docId, messages, docId };
    let updated;
    if (idx >= 0) {
      updated = [...newHistory];
      updated[idx] = newEntry;
    } else {
      updated = [...newHistory, newEntry];
    }
    localStorage.setItem("chatHistoryV2", JSON.stringify(updated));
    setHistory(updated);
  };

  // Send message handler
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setInput("");

    try {
      const res = await fetch("https://legal-bot-backend.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg.text, doc_id: docId }),
      });
      const data = await res.json();
      const botMsg = { sender: "bot", text: data.response };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Backend not responding. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // File upload per chat
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("https://legal-bot-backend.onrender.com/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setDocId(data.doc_id);
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: data.message }
    ]);
  };

  // Start new chat, auto-save current if needed
  const handleReset = () => {
    if (messages.length) saveCurrentChat();
    const newId = Date.now().toString();
    setDocId(newId);
    setMessages([]);
    setSelectedChat(null);
  };

  // Delete a saved chat
  const handleDelete = (id) => {
    const updated = history.filter((h) => h.id !== id);
    localStorage.setItem("chatHistoryV2", JSON.stringify(updated));
    setHistory(updated);
    if (id === selectedChat) {
      setMessages([]);
      setSelectedChat(null);
      setDocId(Date.now().toString());
    }
  };

  // Sidebar: show all saved chats (unlimited)
  const renderSidebar = () => (
    <div className="w-64 p-4 border-r bg-gray-50 dark:bg-gray-900 overflow-y-auto h-screen">
      <h2 className="text-xl font-bold mb-3">Saved Chats</h2>
      {history.length === 0 && <div className="text-gray-500">No chats yet</div>}
      {history.map((h) => (
        <div
          key={h.id}
          className={`flex items-center justify-between cursor-pointer p-2 rounded mb-1 ${selectedChat === h.id ? "bg-blue-600 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          onClick={() => {
            saveCurrentChat();
            setSelectedChat(h.id);
          }}
        >
          <span>Chat #{h.id.slice(-4)}</span>
          <button className="ml-2 text-red-500 hover:text-red-700"
            onClick={e => { e.stopPropagation(); handleDelete(h.id); }}>🗑️</button>
        </div>
      ))}
    </div>
  );

  // Chat area: user right, bot left (bubble style)
  const renderMessages = () => (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-white dark:bg-gray-800">
      {messages.map((m, i) => (
        <div
          key={i}
          className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-xl px-4 py-3 rounded-2xl shadow ${
              m.sender === "user"
                ? "bg-blue-500 text-white self-end rounded-br-none"
                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white self-start rounded-bl-none"
            }`}
          >
            {m.text}
          </div>
        </div>
      ))}
      <div ref={scrollRef} />
    </div>
  );

  // Header with upload, reset, dark mode
  const renderHeader = () => (
    <div className="flex justify-between items-center p-4 border-b bg-white dark:bg-gray-900 relative">
      <h1 className="text-2xl font-bold text-center w-full">ATOZ Legal Chatbot</h1>
      <div className="flex items-center gap-2 absolute right-6">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="mr-1 px-2 py-1 rounded text-lg"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        <button
          onClick={handleReset}
          className="bg-yellow-400 text-black px-3 py-1 rounded font-medium"
        >
          Reset
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          className="bg-purple-600 text-white px-3 py-1 rounded font-medium"
          onClick={() => fileInputRef.current.click()}
        >
          Upload PDF
        </button>
      </div>
    </div>
  );

  // Input box + send
  const renderInput = () => (
    <div className="p-4 border-t flex gap-2 bg-white dark:bg-gray-900">
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && !loading && handleSend()}
        className="flex-1 p-2 rounded border dark:bg-gray-800 dark:text-white"
        placeholder="Ask your legal question..."
        disabled={loading}
      />
      <button
        onClick={handleSend}
        className="bg-green-500 text-white px-4 py-1 rounded font-semibold"
        disabled={loading}
      >
        {loading ? "..." : "Send"}
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen flex ${darkMode ? "dark" : ""}`}>
      {renderSidebar()}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {renderHeader()}
        {renderMessages()}
        {renderInput()}
      </div>
    </div>
  );
}

export default App;
