// ✅ Final App.jsx with ChatGPT-style Memory + PDF per Chat + No Duplication
import { useState, useEffect, useRef } from "react";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [docId, setDocId] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveCurrentChat = () => {
    if (!messages.length) return;
    setHistory((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === selectedChat?.id);
      const updatedChat = {
        id: selectedChat?.id || Date.now(),
        title: messages[0]?.text.slice(0, 30),
        messages,
        docId,
      };
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = updatedChat;
        return updated;
      }
      return [...prev, updatedChat];
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("https://legal-bot-backend.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input, doc_id: docId }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Error fetching response" }]);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://legal-bot-backend.onrender.com/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setDocId(data.doc_id);
      setMessages((prev) => [...prev, { sender: "bot", text: data.message }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Upload failed" }]);
    }
  };

  const handleReset = () => {
    saveCurrentChat();
    setMessages([]);
    setDocId(null);
    setSelectedChat(null);
  };

  const handleSelectChat = (chat) => {
    saveCurrentChat();
    setMessages(chat.messages);
    setDocId(chat.docId);
    setSelectedChat(chat);
  };

  const handleDelete = (id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    if (selectedChat?.id === id) {
      setMessages([]);
      setDocId(null);
      setSelectedChat(null);
    }
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen flex`}>
      {/* Sidebar */}
      <div className="w-60 p-4 border-r border-gray-300 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">Saved Chats</h2>
          <button onClick={handleReset} className="text-green-600 font-semibold text-sm">+ New</button>
        </div>
        <div className="space-y-2">
          {history.map((h) => (
            <div key={h.id} className="flex items-center justify-between cursor-pointer">
              <span className="flex-1" onClick={() => handleSelectChat(h)}>{h.title}</span>
              <span onClick={() => handleDelete(h.id)} className="text-red-500 ml-2 cursor-pointer">🗑️</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 p-4">
        {/* Header with toggles */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">ATOZ Legal Chatbot</h1>
          <div className="flex gap-3">
            <button onClick={handleReset} className="bg-yellow-400 text-white px-3 py-1 rounded">Reset</button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              <span className="ml-2 text-sm">{darkMode ? "Dark" : "Light"}</span>
            </label>
          </div>
        </div>

        {/* Chat Box */}
        <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} border rounded p-4 h-[400px] overflow-y-auto`}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}
            >
              <span className={`inline-block px-3 py-2 rounded ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
                {msg.text}
              </span>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className={`flex-1 border p-2 rounded ${darkMode ? "bg-gray-900 text-white placeholder-gray-400" : "bg-white text-black"}`}
            placeholder="Ask your legal question..."
          />
          <button onClick={handleSend} className="bg-blue-500 text-white px-4 rounded">Send</button>
          <label className="bg-green-500 text-white px-4 rounded cursor-pointer">
            Upload
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>
    </div>
  );
}

export default App;
