// ✅ Full Working Frontend App.jsx for ATOZ Legal Chatbot

import { useState, useEffect, useRef } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const scrollRef = useRef(null);
  const [docId, setDocId] = useState(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setInput('');

    try {
      const res = await fetch("https://your-backend.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input, history: messages, doc_id: docId })
      });
      const data = await res.json();
      streamMessage(data?.response || '⚠️ No response');
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', content: '❌ Server error. Try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  const streamMessage = (text) => {
    let i = 0;
    let current = '';
    const botMsg = { role: 'bot', content: '' };
    setMessages((prev) => [...prev, botMsg]);

    const stream = () => {
      current += text[i];
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], content: current };
        return updated;
      });
      i++;
      if (i < text.length) setTimeout(stream, 25);
    };
    setTimeout(stream, 50);
  };

  const handlePDF = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://your-backend.onrender.com/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (data?.doc_id) {
      setDocId(data.doc_id);
      setMessages((prev) => [...prev, { role: 'bot', content: data.message }]);
    } else {
      setMessages((prev) => [...prev, { role: 'bot', content: '❌ Upload failed.' }]);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <aside className="w-64 bg-white dark:bg-gray-800 p-4 border-r dark:border-gray-700">
          <h2 className="text-lg font-bold mb-4">📄 Upload PDF</h2>
          <input type="file" accept="application/pdf" onChange={handlePDF} className="text-sm" />
          <hr className="my-4 border-gray-400" />
          <button onClick={() => setDarkMode(!darkMode)} className="w-full px-4 py-2 rounded bg-teal-600 text-white">{darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="p-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700 font-semibold text-xl">ATOZ Legal Chatbot</header>

          <main className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md px-4 py-2 rounded-xl shadow text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-sm text-gray-400">Typing...</div>}
            <div ref={scrollRef} />
          </main>

          <footer className="p-3 flex items-center gap-2 border-t bg-white dark:bg-gray-800 dark:border-gray-700">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your legal query..."
              className="flex-1 px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600"
            />
            <button onClick={handleSend} className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-500">Send</button>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;

