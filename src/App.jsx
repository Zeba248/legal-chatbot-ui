import { useState, useEffect, useRef } from "react";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [docId, setDocId] = useState(Date.now().toString());
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedChat, setSelectedChat] = useState(null);
  const [pdfMap, setPdfMap] = useState(() => {
    const pdfs = localStorage.getItem("pdfMap");
    return pdfs ? JSON.parse(pdfs) : {};
  });
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat & pdf when switching
  useEffect(() => {
    if (selectedChat) {
      const chat = history.find((h) => h.id === selectedChat);
      if (chat) {
        setMessages(chat.messages);
        setDocId(chat.docId);
      }
    }
  }, [selectedChat, history]);

  // Save pdf mapping
  const savePdfMap = (nextMap) => {
    localStorage.setItem("pdfMap", JSON.stringify(nextMap));
    setPdfMap(nextMap);
  };

  // Save chat history (auto-save!)
  const saveCurrentChat = (customHistory = history, customMessages = messages, customDocId = docId) => {
    if (!customMessages.length) return;
    const existing = customHistory.find((h) => h.id === customDocId);
    const updated = existing
      ? customHistory.map((h) => (h.id === customDocId ? { id: customDocId, messages: customMessages, docId: customDocId } : h))
      : [...customHistory, { id: customDocId, messages: customMessages, docId: customDocId }];
    localStorage.setItem("chatHistory", JSON.stringify(updated));
    setHistory(updated);
  };

  // When switching chats, auto-save current first!
  const handleSwitchChat = (id) => {
    saveCurrentChat();
    setSelectedChat(id);
  };

  // Handle file upload
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
    const newPdfMap = { ...pdfMap, [docId]: { name: file.name, id: data.doc_id } };
    savePdfMap(newPdfMap);
    setDocId(data.doc_id);
    setMessages((prev) => [...prev, { sender: "bot", text: data.message }]);
    saveCurrentChat(history, [...messages, { sender: "bot", text: data.message }], data.doc_id);
  };

  // Handle send message
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
      saveCurrentChat(history, [...messages, userMsg, botMsg]);
    } catch (err) {
      const errorMsg = { sender: "bot", text: "❌ Backend not responding. Please try again later." };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Handle reset (auto-save + start new chat)
  const handleReset = () => {
    saveCurrentChat();
    const newId = Date.now().toString();
    setDocId(newId);
    setMessages([]);
    setSelectedChat(null);
  };

  // Delete chat everywhere
  const handleDelete = (id) => {
    const updated = history.filter((h) => h.id !== id);
    localStorage.setItem("chatHistory", JSON.stringify(updated));
    setHistory(updated);
    // Remove PDF
    const newPdfMap = { ...pdfMap };
    delete newPdfMap[id];
    savePdfMap(newPdfMap);
    if (id === selectedChat) {
      setMessages([]);
      setSelectedChat(null);
      setDocId(Date.now().toString());
    }
  };

  // PDF name for current chat (if any)
  const currentPdf = pdfMap[docId];

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} flex`}>
      {/* Sidebar */}
      <div className="w-64 p-4 border-r overflow-y-auto bg-white dark:bg-gray-900">
        <h2 className="text-xl font-bold mb-2">Saved Chats</h2>
        {history.map((h) => (
          <div
            key={h.id}
            className={`flex items-center justify-between cursor-pointer p-2 rounded mb-1 ${
              selectedChat === h.id ? "bg-blue-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
            onClick={() => handleSwitchChat(h.id)}
          >
            <span>
              Chat #{h.id.slice(-4)}
              {pdfMap[h.id]?.name ? (
                <span className="ml-1 text-xs text-purple-700 dark:text-purple-300">[{pdfMap[h.id].name}]</span>
              ) : null}
            </span>
            <button
              className="ml-2 text-red-500 dark:text-red-300"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(h.id);
              }}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">ATOZ Legal Chatbot</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button onClick={handleReset} className="bg-yellow-400 px-3 py-1 rounded">
              Reset
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              className="bg-purple-500 text-white px-3 py-1 rounded"
              onClick={() => fileInputRef.current.click()}
            >
              Upload PDF
            </button>
            {currentPdf?.name && (
              <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                {currentPdf.name}
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-white dark:bg-gray-800">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-xl px-4 py-3 rounded-2xl shadow
                  ${m.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-none ml-auto"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none mr-auto"
                  }
                `}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t flex gap-2 bg-white dark:bg-gray-900">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 p-2 rounded border text-black dark:text-white bg-white dark:bg-gray-800"
            placeholder="Ask your legal question..."
            disabled={loading}
          />
          <button
            onClick={handleSend}
            className={`bg-green-500 text-white px-4 py-1 rounded ${loading ? "opacity-60" : ""}`}
            disabled={loading}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
