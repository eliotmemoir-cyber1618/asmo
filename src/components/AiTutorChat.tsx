/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageCircle, AlertCircle, RefreshCw, X } from 'lucide-react';
import { MathText } from './MathText.tsx';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AiTutorChatProps {
  questionText: string;
  choices?: string[];
  correctAnswer: string;
  explanation: string;
  categoryName: string;
  onClose?: () => void;
}

export const AiTutorChat: React.FC<AiTutorChatProps> = ({
  questionText,
  choices,
  correctAnswer,
  explanation,
  categoryName,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Chào bạn! Tôi là Giáo sư AI 🎓, rất vui được hỗ trợ bạn ôn tập dạng toán **${categoryName}**. 

Tôi đã đọc kỹ đề bài trên. Bạn có băn khoăn ở bước giải nào, hay muốn tôi hướng dẫn mẹo tính nhẩm nhanh không? Hãy nhắn cho tôi hoặc chọn các câu hỏi gợi ý bên dưới nhé!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Giải thích kỹ hơn bước 1 giúp em',
    'Có mẹo giải nhanh nào dưới 30 giây không?',
    'Dạng bài này có hay gặp trong đề thi ASMO không?',
    'Cho em xin 1 bài toán tương tự để luyện thêm'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage = textToSend;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const chatContext = `Câu hỏi gốc: "${questionText}"
Đáp án đúng: "${correctAnswer}"
Hướng dẫn giải thích chi tiết có sẵn: "${explanation}"`;

      // Translate history
      const historyPayload = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        text: msg.text
      }));

      const response = await fetch('/api/gemini/chat-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: historyPayload,
          message: userMessage,
          contextQuestion: chatContext
        })
      });

      const data = await response.json();
      if (response.ok && data.reply) {
        setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            text: 'Rất tiếc, hệ thống gặp chút gián đoạn khi kết nối với máy chủ AI. Bạn hãy thử lại sau ít phút hoặc xem giải thích chi tiết offline nhé!'
          }
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: 'Không thể kết nối internet hoặc máy chủ đang bận. Đừng lo lắng, hãy tiếp tục ôn tập với các bài giảng chi tiết của tôi!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-lg" id="ai_tutor_chat_container">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-white/10 rounded-lg">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight">Gia Sư AI Thông Thái</h3>
            <span className="text-[11px] text-blue-100 flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1 animate-ping"></span>
              Đang trực tuyến · Sẵn sàng trợ giúp
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Đóng chat"
            id="close_chat_tutor"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[250px]" style={{ maxHeight: '420px' }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1 text-[11px] opacity-75 font-semibold uppercase tracking-wider">
                {msg.role === 'user' ? (
                  <span>Bạn</span>
                ) : (
                  <span className="text-indigo-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Giáo sư AI
                  </span>
                )}
              </div>
              <div className="leading-relaxed">
                <MathText>{msg.text}</MathText>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-500 border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center space-x-2">
              <span className="text-xs">Giáo sư AI đang suy nghĩ...</span>
              <div className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200/60 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin">
        {quickPrompts.map((prompt, pIdx) => (
          <button
            key={pIdx}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="inline-block px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 text-[12px] text-slate-700 hover:text-blue-600 rounded-full font-medium transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            id={`quick_prompt_${pIdx}`}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
        id="chat_tutor_input_form"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi toán học của bạn tại đây..."
          disabled={loading}
          className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all disabled:opacity-75"
          id="chat_tutor_text_input"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
          id="chat_tutor_submit_button"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
