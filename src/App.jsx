// ✅ Updated App.jsx (Resume chats with PDF+Memory binding)
import { useState, useEffect, useRef } from "react";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [docId, setDocId] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
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
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4 text-center">ATOZ Legal Chatbot</h1>

      <div className="mb-2 flex gap-2 overflow-x-auto">
        {history.map((h) => (
          <button
            key={h.id}
            onClick={() => handleSelectChat(h)}
            className="bg-gray-200 px-2 py-1 rounded text-sm"
          >
            {h.title}
            <span
              onClick={(e) => { e.stopPropagation(); handleDelete(h.id); }}
              className="ml-1 text-red-500 cursor-pointer"
            >
              ✕
            </span>
          </button>
        ))}
      </div>

      <div className="border rounded p-4 h-[400px] overflow-y-auto bg-white">
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
        <button onClick={handleReset} className="bg-yellow-400 text-white px-3 rounded">Reset</button>
        <label className="bg-green-500 text-white px-3 rounded cursor-pointer">
          Upload
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>
    </div>
  );
}

export default App;
