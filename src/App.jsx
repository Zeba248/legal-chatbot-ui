import { useState, useEffect, useRef } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const scrollRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

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
        body: JSON.stringify({ question: input })
      });

      const data = await res.json();
      const botReply = data?.response ?? "⚠️ Unexpected response.";
      streamMessage(botReply);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "❌ Backend not responding. Please try again later." }
      ]);
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
      if (updated.length > 0 && updated[updated.length - 1].sender === 'bot') {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          text: currentText,
        };
      }
      return updated;
    });

    i++;
    if (i < text.length) {
      setTimeout(stream, 25);
    }
  };

  // Slight delay before starting stream so that setMessages settles
  setTimeout(stream, 50);
};

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const resetChat = () => {
    if (messages.length > 0) {
      setHistory([{ id: Date.now(), title: messages[0]?.text?.slice(0, 30), chat: messages }, ...history]);
    }
    setMessages([]);
  };

  const loadChat = (chat) => {
    setMessages(chat.chat);
    setSelectedChat(chat.id);
  };

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <aside className="w-64 bg-white dark:bg-gray-800 p-4 space-y-2 border-r dark:border-gray-700">
          <h2 className="text-lg font-bold mb-2">🗂️ Saved Chats</h2>
          {history.map((h) => (
            <button
              key={h.id}
              className={`block w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                selectedChat === h.id ? 'bg-gray-200 dark:bg-gray-700' : ''
              }`}
              onClick={() => loadChat(h)}
            >
              {h.title || 'Untitled Chat'}
            </button>
          ))}
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <img src="/bot-avatar.png" alt="Bot" className="h-8 w-8 rounded-full border border-gray-300" />
              <span className="text-xl font-semibold">ATOZ Legal Chatbot</span>
            </div>
            <button onClick={toggleTheme} className="px-3 py-1 text-sm bg-teal-600 text-white rounded">
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </header>

          <main className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-md p-3 rounded-xl shadow text-sm whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-start gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition'
                  }`}
                >
                  {msg.sender === 'bot' && <img src="/bot-avatar.png" className="h-6 w-6 rounded-full mt-1" />}
                  <span>{msg.text}</span>
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

          

          <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 sticky bottom-0 z-10">
            <input
              type="text"
              placeholder="Ask your legal question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 placeholder:text-gray-500"
            />
            <button onClick={handleSend} className="bg-teal-600 text-white font-semibold px-5 py-2 rounded-xl hover:bg-teal-500">
              Send
            </button>
            <button onClick={resetChat} className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-500">
              Reset
            </button>
            <a href="https://wa.me/?text=Hello%20ATOZ%20Legal%20Chatbot" target="_blank" rel="noopener noreferrer">
              <button className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-500">WhatsApp</button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
