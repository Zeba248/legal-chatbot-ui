// ✅ Final App.jsx with Top-Right Toggle + Reset + Sidebar + Chat + Upload + Memory
import { useState, useEffect, useRef } from "react";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [docId, setDocId] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        body: JSON.stringify({ question: input, doc_id: docId }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Error fetching response" }]);
    } finally {
      setLoading(false);
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
    if (messages.length) {
      const chatToSave = { id: docId, title: messages[0]?.text.slice(0, 30), messages };
      setHistory((prev) => [...prev, chatToSave]);
    }
    setMessages([]);
    setDocId(null);
    setSelectedChat(null);
  };

  const handleSelectChat = (chat) => {
    setMessages(chat.messages);
    setDocId(chat.id);
    setSelectedChat(chat);
  };

  const handleDelete = (id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    if (selectedChat?.id === id) {
      setMessages([]);
      setDocId(null);
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
              <span onClick={() => handleSelectChat(h)}>{h.title}</span>
              <span onClick={() => handleDelete(h.id)} className="text-red-500">🗑️</span>
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
            <button onClick={() => setDarkMode(!darkMode)} className="bg-gray-600 text-white px-3 py-1 rounded">
              {darkMode ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        {/* Chat Box */}
        <div className="border rounded p-4 h-[400px] overflow-y-auto bg-white text-black">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}
            >
              <span className={`inline-block px-3 py-2 rounded ${msg.sender === "user" ? "bg-blue-100" : "bg-gray-100"}`}>
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
            className="flex-1 border p-2 rounded"
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
