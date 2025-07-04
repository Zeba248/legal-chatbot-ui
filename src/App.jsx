// ✅ Final App.jsx (Smart + Memory + Hinglish + Reset/Delete Fixed)
import { useState, useEffect, useRef } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [docId, setDocId] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const scrollRef = useRef(null);

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
      const botReply = data?.response ?? "⚠️ Unexpected response.";
      streamMessage(botReply);
    } catch {
      setMessages((prev) => [...prev, { sender: 'bot', text: "❌ Backend not responding. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const streamMessage = (text) => {
    let i = 0;
    let currentText = '';
    const botMessage = { sender: 'bot', text: '' };
    setMessages((prev) => [...prev, botMessage]);

    const stream = () => {
      currentText += text[i];
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.sender === 'bot') last.text = currentText;
        return updated;
      });
      i++;
      if (i < text.length) setTimeout(stream, 20);
    };
    setTimeout(stream, 100);
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    setMessages((prev) => [...prev, { sender: 'user', text: `📄 Uploaded: ${file.name}` }]);
    setMessages((prev) => [...prev, { sender: 'bot', text: "Thanks! Processing your PDF…" }]);

    try {
      const res = await fetch("https://legal-bot-backend.onrender.com/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setDocId(data.doc_id);
      streamMessage(data.message);
    } catch {
      setMessages((prev) => [...prev, { sender: 'bot', text: "❌ Failed to upload PDF. Please try again." }]);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") handleUpload(file);
  };

  const resetChat = () => {
    if (messages.length > 0) {
      const title = messages[0]?.text?.slice(0, 30);
      setHistory([{ id: Date.now(), title, chat: messages, doc_id: docId }, ...history]);
    }
    setMessages([]);
    setDocId(null);
    setSelectedChat(null);
  };

  const loadChat = (chat) => {
    setMessages(chat.chat);
    setDocId(chat.doc_id || null);
    setSelectedChat(chat.id);
  };

  const deleteChat = (id) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    if (selectedChat === id) {
      setMessages([]);
      setSelectedChat(null);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-4 border-r space-y-4">
        <h2 className="text-lg font-bold">🗂️ Saved Chats</h2>
        <input type="file" accept="application/pdf" onChange={handleFileInput} className="text-sm" />
        {history.map((h) => (
          <div key={h.id} className="flex items-center justify-between hover:bg-gray-100 p-1 rounded">
            <button
              className={`flex-1 text-left p-2 rounded ${selectedChat === h.id ? 'bg-gray-200' : ''}`}
              onClick={() => loadChat(h)}
            >
              {h.title || 'Untitled Chat'}
            </button>
            <button
              onClick={() => deleteChat(h.id)}
              title="Delete"
              className="ml-2 text-red-500 hover:text-red-700 text-lg"
            >
              🗑️
            </button>
          </div>
        ))}
      </aside>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
          <div className="text-xl font-semibold">ATOZ Legal Chatbot</div>
        </header>

        <main className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md p-3 rounded-xl text-sm whitespace-pre-line ${
                msg.sender === 'user' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-900'
              }`}>
                {msg.text}
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

        <footer className="p-3 bg-white border-t flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask your legal question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-2 rounded-xl border placeholder:text-gray-500"
          />
          <button onClick={handleSend} className="bg-teal-600 text-white px-4 py-2 rounded-xl">Send</button>
          <button onClick={resetChat} className="bg-teal-600 text-white px-4 py-2 rounded-xl">Reset</button>
        </footer>
      </div>
    </div>
  );
}

export default App;
