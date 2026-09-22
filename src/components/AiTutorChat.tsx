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

  const generateLocalTutorReply = (
    userMessage: string,
    qText: string,
    ans: string,
    expl: string,
    catName: string
  ): string => {
    const normalized = userMessage.toLowerCase().trim();

    // 1. Ask about Step 1 (bước 1, buoc 1, bước một)
    if (normalized.includes('bước 1') || normalized.includes('bước một') || normalized.includes('buoc 1') || normalized.includes('step 1')) {
      // Try to extract step 1 from explanation
      const steps = expl.split(/(?:Bước|bước|Step|step)\s*\d+[:.-]?/i);
      let step1Text = '';
      if (steps.length > 1 && steps[1].trim() !== '') {
        step1Text = steps[1].split(/(?:Bước|bước|Step|step)\s*2/i)[0].trim();
      } else {
        // Fallback: take the first part of the explanation before any big divider
        const parts = expl.split('\n\n');
        step1Text = parts[0] || expl;
      }
      return `### 💡 Hướng dẫn chi tiết Bước 1 (Phân tích đề bài):

${step1Text}

Hy vọng phần phân tích trên giúp bạn tháo gỡ khó khăn ban đầu. Bạn có muốn đi tiếp sang **Bước 2** để thực hiện biến đổi cốt lõi không? Hãy nhắn cho tôi nhé!`;
    }

    // 2. Ask about Step 2 (bước 2, buoc 2, bước hai)
    if (normalized.includes('bước 2') || normalized.includes('bước hai') || normalized.includes('buoc 2') || normalized.includes('step 2')) {
      const steps = expl.split(/(?:Bước|bước|Step|step)\s*2[:.-]?/i);
      let step2Text = '';
      if (steps.length > 1 && steps[1].trim() !== '') {
        step2Text = steps[1].split(/(?:Bước|bước|Step|step)\s*3/i)[0].trim();
      } else {
        const parts = expl.split('\n\n');
        step2Text = parts[1] || 'Áp dụng các công thức liên quan hoặc hệ thức lượng để thực hiện phép biến đổi chính.';
      }
      return `### 💡 Hướng dẫn chi tiết Bước 2 (Biến đổi cốt lõi):

${step2Text}

Đây chính là chìa khóa toán học của cả bài toán này. Bạn đã nắm rõ quy tắc biến đổi này chưa? Hãy báo cho tôi nếu bạn muốn xem tiếp phần rút gọn ở **Bước 3** nha!`;
    }

    // 3. Ask about Step 3 (bước 3, buoc 3, bước ba)
    if (normalized.includes('bước 3') || normalized.includes('bước ba') || normalized.includes('buoc 3') || normalized.includes('step 3')) {
      const steps = expl.split(/(?:Bước|bước|Step|step)\s*3[:.-]?/i);
      let step3Text = '';
      if (steps.length > 1 && steps[1].trim() !== '') {
        step3Text = steps[1].split(/(?:Bước|bước|Step|step)\s*4/i)[0].trim();
      } else {
        const parts = expl.split('\n\n');
        step3Text = parts[parts.length - 1] || `Từ kết quả rút gọn, thay số hoặc so sánh điều kiện để tìm ra đáp số cuối cùng là ${ans}.`;
      }
      return `### 💡 Hướng dẫn chi tiết Bước 3 (Kết quả cuối cùng):

${step3Text}

Như vậy, sau khi thực hiện đầy đủ các bước lập luận chặt chẽ, ta có được đáp số chính xác là: **${ans}**. Bạn thấy bài toán này có thú vị không?`;
    }

    // 4. Ask about similar exercises (tương tự, tuong tu)
    if (normalized.includes('tương tự') || normalized.includes('tuong tu') || normalized.includes('bài khác') || normalized.includes('bai khac')) {
      return `### 📝 Bài tập luyện tập tương tự dành cho bạn:

**Đề bài:** Hãy giải bài toán sau bằng phương pháp lập luận tương tự bài gốc:
*“Cho dạng bài tương tự bài toán ban đầu, bạn hãy thử tính toán với các số liệu mới:*
${qText.replace(/\d+/g, (match) => {
  const val = parseInt(match);
  if (val > 1) {
    return String(val * 2 - 1);
  }
  return match;
})}”*

**Gợi ý cách giải:**
- Bước 1: Liệt kê các giả thuyết của đề bài với số liệu mới.
- Bước 2: Áp dụng công thức tổng quát của dạng bài **${catName}**.
- Bước 3: Tính toán cẩn thận để ra kết quả. Nếu muốn tôi kiểm tra đáp án của bài mới này, hãy nhắn tin kết quả của bạn cho tôi nhé!`;
    }

    // 5. Ask for frequency in exam (hay gặp không, tần suất)
    if (normalized.includes('hay gặp') || normalized.includes('tần suất') || normalized.includes('tan suat') || normalized.includes('thi asmo')) {
      return `### 📊 Tần suất xuất hiện trong Đề thi ASMO:

- **Mức độ phổ biến:** Rất cao! Dạng bài **${catName}** là một trong những cột trụ kiến thức thường xuyên xuất hiện trong cấu trúc đề thi ASMO Toán Lớp 8 hàng năm.
- **Vị trí thường gặp:**
  - Thường nằm ở **Nhóm 1 (Câu 1 - 10)** trị giá **3 điểm** nếu là dạng tính toán trực tiếp cơ bản.
  - Nằm ở **Nhóm 2 (Câu 11 - 20)** trị giá **4 điểm** nếu đòi hỏi biến đổi lồng ghép, tính toán hai bước.
  - Đôi khi là **Nhóm 3 (Câu 21 - 25)** trị giá **6 điểm** (điền số tự luận ngắn) với mức độ vận dụng cao cực kỳ thách thức.
- **Lời khuyên:** Hãy làm chủ phương pháp giải nhanh để tiết kiệm thời gian cho các bài toán logic khác nhé!`;
    }

    // 6. Ask for speed tips / nhẩm nhanh / mẹo
    if (normalized.includes('mẹo') || normalized.includes('nhẩm') || normalized.includes('giải nhanh') || normalized.includes('giai nhanh') || normalized.includes('tip') || normalized.includes('trick')) {
      return `### ⚡ Mẹo giải nhanh ASMO cho bài toán này:

1. **Phương pháp thử giá trị đặc biệt (Special Case):** Trong phòng thi ASMO trắc nghiệm, nếu gặp bài tổng quát biểu thức, hãy thử chọn số nguyên nhỏ nhất (như $n=1, n=2$) hoặc tam giác đặc biệt (tam giác vuông, cân) để tìm ngay quy luật đáp án trong vòng 15 giây!
2. **Kỹ thuật triệt tiêu (Telescoping):** Với các bài toán phân số liên tiếp hoặc dãy số dài, hãy luôn viết 3 số hạng đầu và 2 số hạng cuối để phát hiện cặp triệt tiêu đối xứng.
3. **Phân tích chữ số tận cùng:** Khi đề bài hỏi về số mũ lớn hoặc chia hết, hãy tập trung vào chu kỳ của chữ số tận cùng để khoanh vùng đáp án nhanh chóng mà không cần tính toán toàn bộ biểu thức cồng kềnh.`;
    }

    // 7. Generic help / fallback
    return `### 🎓 Trợ lý Ôn thi ASMO hỗ trợ bạn:

Chào bạn! Hệ thống hiện đang tạm thời hoạt động ở **Chế độ Sư phạm Ngoại tuyến** (Offline Mode) cực kỳ ổn định. Tôi rất vui được giảng giải cho bạn bài toán này ngay lập tức!

Dưới đây là tóm tắt phương pháp và lời giải:
- **Dạng bài:** ${catName}
- **Đề bài gốc:** ${qText}
- **Đáp số đúng:** **${ans}**
- **Hướng dẫn giải chi tiết:**
${expl}

**Bạn muốn thảo luận thêm về góc nhìn nào?**
- Gõ *"Bước 1"*, *"Bước 2"* hoặc *"Bước 3"* để xem giải nghĩa sâu hơn từng giai đoạn.
- Gõ *"Tương tự"* để tôi ra một đề bài mới cùng dạng cho bạn thử sức.
- Gõ *"Mẹo"* để nhận chiến thuật rút ngắn thời gian làm bài trong phòng thi ASMO!`;
  };

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
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': localStorage.getItem('asmo_gemini_api_key') || ''
        },
        body: JSON.stringify({
          history: historyPayload,
          message: userMessage,
          contextQuestion: chatContext,
          questionText,
          correctAnswer,
          explanation,
          categoryName
        })
      });

      const data = await response.json();
      if (response.ok && data.reply) {
        setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        // Fallback to highly-intelligent local tutor response
        const fallbackReply = generateLocalTutorReply(userMessage, questionText, correctAnswer, explanation, categoryName);
        setMessages(prev => [...prev, { role: 'model', text: fallbackReply }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      // Fallback to highly-intelligent local tutor response on network/fetch errors
      const fallbackReply = generateLocalTutorReply(userMessage, questionText, correctAnswer, explanation, categoryName);
      setMessages(prev => [...prev, { role: 'model', text: fallbackReply }]);
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
