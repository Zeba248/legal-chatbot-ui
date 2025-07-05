// ✅ Updated App.jsx with Sidebar + Resume Chat + Upload + Chat Memory
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
    <div className="flex h-screen">
      {/* ✅ Sidebar */}
      <div className="w-64 p-4 border-r bg-white overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Saved Chats</h2>
          <button className="text-green-600 font-bold" onClick={handleReset}>➕ New</button>
        </div>
        <div className="flex flex-col gap-2">
          {history.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                selectedChat?.id === chat.id ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
              onClick={() => handleSelectChat(chat)}
            >
              <span className="text-sm font-medium truncate w-[80%]">
                {chat.title || "Untitled Chat"}
              </span>
              <span
                className="text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(chat.id);
                }}
              >
                🗑️
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Chat Area */}
      <div className="flex-1 p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-2 text-center">ATOZ Legal Chatbot</h1>

        <div className="border rounded p-4 flex-1 overflow-y-auto bg-white">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}
            >
              <span
                className={`inline-block px-3 py-2 rounded max-w-[80%] whitespace-pre-wrap break-words ${
                  msg.sender === "user" ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
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
          <label className="bg-green-500 text-white px-3 rounded cursor-pointer">
            Upload
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>
    </div>
  );
}

export default App;
