/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { CATEGORIES, generateQuestion } from './src/utils/mathGenerators.ts';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini API client if key exists
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== 'MY_GEMINI_API_KEY' && API_KEY.trim() !== '') {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini API client initialized successfully on server-side.');
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
} else {
  console.log('No GEMINI_API_KEY found or it is placeholder. Fallback mode active.');
}

// Get appropriate Gemini API client (User defined or system fallback)
function getAiClient(req: express.Request): GoogleGenAI | null {
  const headerKey = req.headers['x-gemini-api-key'] || req.headers['X-Gemini-API-Key'];
  const userKey = Array.isArray(headerKey) ? headerKey[0] : headerKey;
  
  if (userKey && userKey.trim() !== '') {
    try {
      return new GoogleGenAI({
        apiKey: userKey.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (err) {
      console.error('Failed to initialize user-provided GoogleGenAI client:', err);
    }
  }
  return ai;
}

// Clean response text to exclude double asterisks as requested
function cleanResponseText(text: string | undefined | null): string {
  if (!text) return '';
  return text.replace(/\*\*/g, '');
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiInitialized: ai !== null,
    timestamp: new Date().toISOString()
  });
});

// 2. Fetch all Categories metadata
app.get('/api/categories', (req, res) => {
  res.json({ categories: CATEGORIES });
});

// 3. Generate individual dynamic question (AI-boosted or Local fallback)
app.post('/api/gemini/generate-question', async (req, res) => {
  const { categoryId, difficulty, seed } = req.body;
  const targetSeed = seed || Math.floor(Math.random() * 100000);
  const matchedCategory = CATEGORIES.find(c => c.id === categoryId);

  if (!matchedCategory) {
    return res.status(400).json({ error: 'Mã dạng bài không hợp lệ' });
  }

  const reqAi = getAiClient(req);

  // If AI client is not available or user didn't set key, or if there is an error, fallback to local generator
  if (!reqAi) {
    console.log(`[Local Fallback] Generating question for category ${categoryId} using local formula.`);
    const fallbackQ = generateQuestion(categoryId, targetSeed);
    if (difficulty && qDifficultyMap(difficulty) !== fallbackQ.difficulty) {
      fallbackQ.difficulty = difficulty;
      fallbackQ.points = difficulty === 'Nhóm 1' ? 3 : difficulty === 'Nhóm 2' ? 4 : 6;
      if (difficulty === 'Nhóm 3') {
        fallbackQ.type = 'short_answer';
        delete fallbackQ.choices;
      }
    }
    return res.json({ question: fallbackQ, isAiGenerated: false });
  }

  try {
    const diffText = difficulty || 'Nhóm 1';
    const pts = diffText === 'Nhóm 1' ? 3 : diffText === 'Nhóm 2' ? 4 : 6;
    const isMultipleChoice = diffText !== 'Nhóm 3' && (targetSeed % 2 === 0);

    const prompt = `Bạn là chuyên gia ra đề thi Olympic Toán học quốc tế ASMO (Asian Science and Mathematics Olympiad) Lớp 8.
Hãy tạo MỘT câu hỏi trắc nghiệm hoặc điền số hoàn toàn mới, sáng tạo, chính xác 100% về mặt toán học cho dạng bài sau:
- Dạng bài: ${matchedCategory.name}
- Mô tả: ${matchedCategory.description}
- Phân loại: ${diffText} (${pts} điểm)
- Yêu cầu cấu trúc đầu ra: Trả về một đối tượng JSON đúng cấu trúc bên dưới.
- Ngôn ngữ: Tiếng Việt rõ ràng, dễ hiểu đối với học sinh lớp 8. Có thể dùng ký hiệu Toán học LaTeX (ví dụ $x^2$, $\\frac{a}{b}$, $\\triangle ABC$, $\\vdots$ cho chia hết) kẹp trong cặp ký tự $...$ hoặc $$...$$ để hiển thị đẹp mắt.

Yêu cầu định dạng đầu ra là JSON có các trường:
{
  "questionText": "Nội dung câu hỏi chi tiết sử dụng LaTeX cho các biểu thức toán.",
  "type": "${isMultipleChoice ? 'multiple_choice' : 'short_answer'}",
  "choices": [${isMultipleChoice ? '"Phương án A", "Phương án B", "Phương án C", "Phương án D"' : ''}], // (mảng 4 lựa chọn nếu là multiple_choice, nếu short_answer thì bỏ qua hoặc để trống)
  "correctAnswer": "Giá trị đáp án đúng (Nếu trắc nghiệm: điền chỉ số từ \\"0\\" đến \\"3\\" tương ứng với phương án đúng trong mảng. Nếu điền số: điền chuỗi kết quả số chính xác duy nhất, ví dụ \\"12\\")",
  "explanation": "Hướng dẫn giải thích chi tiết từng bước bằng Tiếng Việt, sử dụng LaTeX đầy đủ, giải thích từ lý thuyết tới các bước giải 1, 2, 3 và kết quả cuối cùng.",
  "commonMistakes": "Lỗi học sinh lớp 8 hay mắc phải khi giải dạng toán này và cách phòng tránh."
}`;

    const response = await reqAi.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'Bạn là trợ lý giảng dạy toán học hàng đầu Việt Nam, chuyên biên soạn đề thi Toán Olympic ASMO Lớp 8.'
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    const cleanedText = text.trim();
    const data = JSON.parse(cleanedText);

    const formattedQuestion = {
      id: `ai_q_${categoryId}_${targetSeed}`,
      categoryId,
      categoryName: matchedCategory.name,
      section: matchedCategory.section,
      type: data.type || (isMultipleChoice ? 'multiple_choice' : 'short_answer'),
      points: pts,
      questionText: cleanResponseText(data.questionText),
      choices: data.choices && data.choices.length === 4 ? data.choices.map((c: string) => cleanResponseText(c)) : (isMultipleChoice ? ['1', '2', '3', '4'] : undefined),
      correctAnswer: cleanResponseText(data.correctAnswer),
      explanation: cleanResponseText(data.explanation),
      commonMistakes: cleanResponseText(data.commonMistakes || matchedCategory.commonMistakes),
      difficulty: diffText
    };

    return res.json({ question: formattedQuestion, isAiGenerated: true });
  } catch (err) {
    console.error('Error generating AI question, falling back:', err);
    const fallbackQ = generateQuestion(categoryId, targetSeed);
    if (difficulty && qDifficultyMap(difficulty) !== fallbackQ.difficulty) {
      fallbackQ.difficulty = difficulty;
      fallbackQ.points = difficulty === 'Nhóm 1' ? 3 : difficulty === 'Nhóm 2' ? 4 : 6;
      if (difficulty === 'Nhóm 3') {
        fallbackQ.type = 'short_answer';
        delete fallbackQ.choices;
      }
    }
    return res.json({ question: fallbackQ, isAiGenerated: false, aiError: true });
  }
});

// Helper map difficulty
function qDifficultyMap(diff: string) {
  return diff === 'Nhóm 1' ? 'Nhóm 1' : diff === 'Nhóm 2' ? 'Nhóm 2' : 'Nhóm 3';
}

// 4. Smart AI Explanation (When user requests deep clarification about a specific problem)
app.post('/api/gemini/explain-question', async (req, res) => {
  const { questionText, choices, correctAnswer, explanation, userAnswer, categoryName } = req.body;
  const reqAi = getAiClient(req);

  if (!reqAi) {
    return res.json({
      explanation: `### HƯỚNG DẪN CHI TIẾT (Chế độ Ngoại tuyến)
      
${explanation}

**⚠️ Lưu ý:** Bạn hiện đang sử dụng chế độ Ngoại tuyến (hoặc chưa cấu hình API Key). Hãy cấu hình API Key trong mục Cài đặt để nhận phản hồi từ Giáo sư AI thông thái với nhiều góc nhìn tư duy đỉnh cao!`
    });
  }

  try {
    const isCorrect = userAnswer !== undefined && userAnswer.toString() === correctAnswer.toString();
    const isMc = choices && choices.length > 0;
    
    let userAnsDisplay = '';
    if (userAnswer !== undefined) {
      userAnsDisplay = isMc ? `Lựa chọn số ${userAnswer} (Nội dung: "${choices[parseInt(userAnswer)]}")` : `Đáp án điền số: "${userAnswer}"`;
    }
    
    let correctAnsDisplay = isMc ? `Lựa chọn số ${correctAnswer} (Nội dung: "${choices[parseInt(correctAnswer)]}")` : `Đáp án đúng: "${correctAnswer}"`;

    const prompt = `Hãy đóng vai là một Giáo sư Toán học ôn thi Olympic ASMO cực kỳ thân thiện, tâm huyết và giảng giải dí dỏm.
Học sinh lớp 8 vừa giải một bài toán thuộc dạng: **${categoryName || 'Toán Tổng hợp'}**.
Trạng thái làm bài của học sinh: ${userAnswer !== undefined ? (isCorrect ? 'ĐÚNG' : 'SAI') : 'Đang cần hỗ trợ giải chi tiết'}.
${userAnswer !== undefined ? `- Câu trả lời của học sinh: ${userAnsDisplay}\n- Đáp án đúng của hệ thống: ${correctAnsDisplay}` : `- Đáp án đúng: ${correctAnsDisplay}`}

**Đề bài gốc:**
"${questionText}"
${isMc ? `- Các phương án lựa chọn:\n${choices.map((c: string, idx: number) => `  [${idx}] ${c}`).join('\n')}` : ''}

**Giải thích mặc định:**
"${explanation}"

Hãy viết một phản hồi giảng giải nâng cao bằng Tiếng Việt gồm:
1. **Lời động viên/Nhận xét**: Nếu học sinh làm Đúng, hãy khen ngợi tinh thần sáng tạo và chỉ ra tại sao tư duy đó tốt. Nếu học sinh làm Sai, hãy nhẹ nhàng chỉ ra bước sai lầm phổ biến nhất trong cách tư duy (tại sao các phương án nhiễu dễ lừa học sinh) và khích lệ.
2. **Bản chất toán học**: Giải thích ngắn gọn cốt lõi lý thuyết áp dụng ở đây là gì.
3. **Chiến thuật giải nhanh (Speed Tip / Trick)**: Một mẹo nhẩm nhanh hoặc phương pháp loại trừ đặc biệt hiệu quả trong phòng thi ASMO để tiết kiệm thời gian (vì đề ASMO 25 câu làm trong 120 phút).
4. **Trình bày trực quan**: Chia nhỏ lời giải thành các bước cực kỳ dễ thương, dễ hiểu, dùng LaTeX ($...$) chuyên nghiệp.`;

    const response = await reqAi.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: 'Bạn là chuyên gia đào tạo học sinh xuất sắc ôn thi Olympic Toán Quốc tế ASMO.'
      }
    });

    return res.json({ explanation: cleanResponseText(response.text) });
  } catch (err) {
    console.error('Error generating AI explanation:', err);
    return res.json({
      explanation: `### HƯỚNG DẪN CHI TIẾT (Lỗi kết nối AI)
      
${explanation}

*(Đã xảy ra lỗi khi kết nối với AI Tutor, hiển thị giải pháp mặc định từ cơ sở dữ liệu)*`
    });
  }
});

// Helper for server-side chat fallback when Gemini API encounters network/quota limits
function generateLocalTutorReplyServer(
  userMessage: string,
  qText: string,
  ans: string,
  expl: string,
  catName: string
): string {
  const normalized = (userMessage || '').toLowerCase().trim();

  const q = qText || 'Đề bài';
  const a = ans || 'Đáp án';
  const e = expl || 'Giải thích';
  const cName = catName || 'Dạng Toán';

  if (normalized.includes('bước 1') || normalized.includes('bước một') || normalized.includes('buoc 1') || normalized.includes('step 1')) {
    const steps = e.split(/(?:Bước|bước|Step|step)\s*\d+[:.-]?/i);
    let step1Text = '';
    if (steps.length > 1 && steps[1].trim() !== '') {
      step1Text = steps[1].split(/(?:Bước|bước|Step|step)\s*2/i)[0].trim();
    } else {
      const parts = e.split('\n\n');
      step1Text = parts[0] || e;
    }
    return `### 💡 Hướng dẫn chi tiết Bước 1 (Phân tích đề bài):

${step1Text}

Hy vọng phần phân tích này đã giúp bạn tháo gỡ khó khăn ban đầu. Bạn có muốn đi tiếp sang **Bước 2** để thực hiện biến đổi toán học cốt lõi không? Hãy nhắn cho tôi nhé!`;
  }

  if (normalized.includes('bước 2') || normalized.includes('bước hai') || normalized.includes('buoc 2') || normalized.includes('step 2')) {
    const steps = e.split(/(?:Bước|bước|Step|step)\s*2[:.-]?/i);
    let step2Text = '';
    if (steps.length > 1 && steps[1].trim() !== '') {
      step2Text = steps[1].split(/(?:Bước|bước|Step|step)\s*3/i)[0].trim();
    } else {
      const parts = e.split('\n\n');
      step2Text = parts[1] || 'Áp dụng các công thức liên quan hoặc hệ thức lượng để thực hiện phép biến đổi chính.';
    }
    return `### 💡 Hướng dẫn chi tiết Bước 2 (Biến đổi cốt lõi):

${step2Text}

Đây chính là chìa khóa toán học của cả bài toán này. Bạn đã nắm rõ quy tắc biến đổi này chưa? Hãy báo cho tôi nếu bạn muốn xem tiếp phần rút gọn ở **Bước 3** nha!`;
  }

  if (normalized.includes('bước 3') || normalized.includes('bước ba') || normalized.includes('buoc 3') || normalized.includes('step 3')) {
    const steps = e.split(/(?:Bước|bước|Step|step)\s*3[:.-]?/i);
    let step3Text = '';
    if (steps.length > 1 && steps[1].trim() !== '') {
      step3Text = steps[1].split(/(?:Bước|bước|Step|step)\s*4/i)[0].trim();
    } else {
      const parts = e.split('\n\n');
      step3Text = parts[parts.length - 1] || `Từ kết quả rút gọn, thay số hoặc so sánh điều kiện để tìm ra đáp số cuối cùng là ${a}.`;
    }
    return `### 💡 Hướng dẫn chi tiết Bước 3 (Kết quả cuối cùng):

${step3Text}

Như vậy, sau khi thực hiện đầy đủ các bước lập luận chặt chẽ, ta có được đáp số chính xác là: **${a}**. Bạn thấy bài toán này có thú vị không?`;
  }

  if (normalized.includes('tương tự') || normalized.includes('tuong tu') || normalized.includes('bài khác') || normalized.includes('bai khac')) {
    return `### 📝 Bài tập luyện tập tương tự dành cho bạn:

**Đề bài:** Hãy giải bài toán sau bằng phương pháp lập luận tương tự bài gốc:
*“Cho dạng bài tương tự bài toán ban đầu, bạn hãy thử tính toán với các số liệu mới:*
${q.replace(/\d+/g, (match) => {
  const val = parseInt(match);
  if (val > 1) {
    return String(val * 2 - 1);
  }
  return match;
})}”*

**Gợi ý cách giải:**
- Bước 1: Liệt kê các giả thuyết của đề bài với số liệu mới.
- Bước 2: Áp dụng công thức tổng quát của dạng bài **${cName}**.
- Bước 3: Tính toán cẩn thận để ra kết quả. Nếu muốn tôi kiểm tra đáp án của bài mới này, hãy nhắn tin kết quả của bạn cho tôi nhé!`;
  }

  if (normalized.includes('hay gặp') || normalized.includes('tần suất') || normalized.includes('tan suat') || normalized.includes('thi asmo')) {
    return `### 📊 Tần suất xuất hiện trong Đề thi ASMO:

- **Mức độ phổ biến:** Rất cao! Dạng bài **${cName}** là một trong những cột trụ kiến thức thường xuyên xuất hiện trong cấu trúc đề thi ASMO Toán Lớp 8 hàng năm.
- **Vị trí thường gặp:**
  - Thường nằm ở **Nhóm 1 (Câu 1 - 10)** trị giá **3 điểm** nếu là dạng tính toán trực tiếp cơ bản.
  - Nằm ở **Nhóm 2 (Câu 11 - 20)** trị giá **4 điểm** nếu đòi hỏi biến đổi lồng ghép, tính toán hai bước.
  - Đôi khi là **Nhóm 3 (Câu 21 - 25)** trị giá **6 điểm** (điền số tự luận ngắn) với mức độ vận dụng cao cực kỳ thách thức.
- **Lời khuyên:** Hãy làm chủ phương pháp giải nhanh để tiết kiệm thời gian cho các bài toán logic khác nhé!`;
  }

  if (normalized.includes('mẹo') || normalized.includes('nhẩm') || normalized.includes('giải nhanh') || normalized.includes('giai nhanh') || normalized.includes('tip') || normalized.includes('trick')) {
    return `### ⚡ Mẹo giải nhanh ASMO cho bài toán này:

1. **Phương pháp thử giá trị đặc biệt (Special Case):** Trong phòng thi ASMO trắc nghiệm, nếu gặp bài tổng quát biểu thức, hãy thử chọn số nguyên nhỏ nhất (như $n=1, n=2$) hoặc tam giác đặc biệt (tam giác vuông, cân) để tìm ngay quy luật đáp án trong vòng 15 giây!
2. **Kỹ thuật triệt tiêu (Telescoping):** Với các bài toán phân số liên tiếp hoặc dãy số dài, hãy luôn viết 3 số hạng đầu và 2 số hạng cuối để phát hiện cặp triệt tiêu đối xứng.
3. **Phân tích chữ số tận cùng:** Khi đề bài hỏi về số mũ lớn hoặc chia hết, hãy tập trung vào chu kỳ của chữ số tận cùng để khoanh vùng đáp án nhanh chóng mà không cần tính toán toàn bộ biểu thức cồng kềnh.`;
  }

  return `### 🎓 Trợ lý Ôn thi ASMO hỗ trợ bạn:

Chào bạn! Hệ thống hiện đang tạm thời hoạt động ở **Chế độ Sư phạm Ngoại tuyến** (Offline Mode) cực kỳ ổn định. Tôi rất vui được giảng giải cho bạn bài toán này ngay lập tức!

Dưới đây là tóm tắt phương pháp và lời giải:
- **Dạng bài:** ${cName}
- **Đề bài gốc:** ${q}
- **Đáp số đúng:** **${a}**
- **Hướng dẫn giải chi tiết:**
${e}

**Bạn muốn thảo luận thêm về góc nhìn nào?**
- Gõ *"Bước 1"*, *"Bước 2"* hoặc *"Bước 3"* để xem giải nghĩa sâu hơn từng giai đoạn.
- Gõ *"Tương tự"* để tôi ra một đề bài mới cùng dạng cho bạn thử sức.
- Gõ *"Mẹo"* để nhận chiến thuật rút ngắn thời gian làm bài trong phòng thi ASMO!`;
}

// 5. Interactive Chat with the AI Tutor about a specific question
app.post('/api/gemini/chat-tutor', async (req, res) => {
  const { history, message, contextQuestion, questionText, correctAnswer, explanation, categoryName } = req.body;
  const reqAi = getAiClient(req);

  if (!reqAi) {
    // If AI is not initialized (e.g. key missing/placeholder), return our robust fallback immediately
    const reply = generateLocalTutorReplyServer(message, questionText, correctAnswer, explanation, categoryName);
    return res.json({ reply });
  }

  try {
    const formattedHistory = (history || []).map((h: any) => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    const systemInstruction = `Bạn là Trợ lý AI - Huấn luyện viên ôn thi Olympic Toán ASMO Lớp 8 cực kỳ thông thái, kiên nhẫn, vui vẻ và am hiểu tâm lý học sinh.
Bạn đang hướng dẫn học sinh thảo luận về bài toán sau:
"${contextQuestion}"

Hãy trả lời câu hỏi mới của học sinh một cách dễ hiểu, chia nhỏ các bước, giải thích tận gốc rễ toán học. Luôn dùng ký hiệu toán học LaTeX kẹp trong $...$.
Hãy khích lệ học sinh tự suy nghĩ thêm thay vì chỉ đưa ra đáp án ăn sẵn ngay lập tức, đưa ra các câu hỏi gợi mở lý thú.`;

    const chat = reqAi.chats.create({
      model: 'gemini-3.1-flash-lite',
      history: formattedHistory,
      config: {
        systemInstruction
      }
    });

    const response = await chat.sendMessage({
      message: message
    });

    return res.json({ reply: cleanResponseText(response.text) });
  } catch (err) {
    console.error('Error in chat-tutor, returning smart local tutor reply:', err);
    // Graceful fallback to local response instead of 500 error
    const reply = generateLocalTutorReplyServer(message, questionText, correctAnswer, explanation, categoryName);
    return res.json({ reply: cleanResponseText(reply) });
  }
});

// 6. Custom AI Solver / OCR Proxy
app.post('/api/gemini/solve-custom', async (req, res) => {
  const { customQuestion } = req.body;
  const reqAi = getAiClient(req);

  if (!reqAi) {
    return res.status(400).json({
      error: 'Cần có cấu hình GEMINI_API_KEY để sử dụng chức năng Giải toán AI nâng cao.'
    });
  }

  try {
    const prompt = `Chào bạn, dưới đây là đề bài toán lớp 8 học sinh gửi cho bạn:
"${customQuestion}"

Hãy đóng vai là thầy giáo dạy Toán ôn thi ASMO:
1. Xác định xem bài toán này thuộc dạng nào trong số 18 dạng toán ASMO Lớp 8 phổ biến (ví dụ: Chia hết, Số nguyên tố, Rút gọn phân thức, Tam giác đồng dạng, Chu kỳ, Quy tắc đếm, Chuyển động...).
2. Đánh giá mức độ khó: Nhóm 1 (Nhận biết - 3 điểm), Nhóm 2 (Thông hiểu/Vận dụng - 4 điểm), hoặc Nhóm 3 (Vận dụng cao - 6 điểm).
3. Hướng dẫn giải chi tiết từng bước:
   - Lý thuyết áp dụng
   - Các bước biến đổi chi tiết dùng LaTeX chuyên nghiệp
   - Kết quả cuối cùng nổi bật trong khung hoặc chữ đậm.
4. Nêu các bẫy/sai lầm học sinh dễ mắc phải ở bài này.
5. Gợi ý thêm 1 bài toán tương tự cùng dạng số liệu khác để học sinh tự luyện tập.`;

    const response = await reqAi.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: 'Bạn là chuyên gia giải toán Olympic và cố vấn học tập Toán lớp 8.'
      }
    });

    return res.json({ solution: cleanResponseText(response.text) });
  } catch (err: any) {
    console.error('Error in solve-custom:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});


// ==========================================
// VITE OR STATIC FILE SERVING MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Dynamically import Vite server in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted for development.');
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static assets from dist/.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ASMO Grade 8 Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
