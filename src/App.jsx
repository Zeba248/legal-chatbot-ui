import { useState, useEffect, useRef } from "react";

function App() {
  // ... same as before (keep all logic above) ...

  // [Your existing App code above, unchanged...]

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} flex`}>
      {/* Sidebar */}
      <div className="w-64 p-4 border-r overflow-y-auto bg-white dark:bg-gray-900">
        <h2 className="text-xl font-bold mb-2">Saved Chats</h2>
        <div className="flex flex-col gap-1">
          {history.map((h) => (
            <div
              key={h.id}
              className={`flex items-center justify-between cursor-pointer p-2 rounded ${
                selectedChat === h.id ? "bg-blue-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
              onClick={() => handleSwitchChat(h.id)}
            >
              <span>
                Chat #{h.id.slice(-4)}
                {pdfMap[h.id]?.name && (
                  <span className="ml-1 text-xs text-purple-700 dark:text-purple-300">[{pdfMap[h.id].name}]</span>
                )}
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
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-white dark:bg-gray-900">
          <h1 className="text-2xl font-bold">ATOZ Legal Chatbot</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button onClick={handleReset} className="bg-yellow-400 px-3 py-1 rounded">
              Reset
            </button>
            {/* PDF Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="application/pdf"
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
                className={`max-w-xl px-4 py-3 rounded-2xl shadow ${
                  m.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-none ml-auto"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none mr-auto"
                }`}
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
