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

  // If AI client is not available or user didn't set key, or if there is an error, fallback to local generator
  if (!ai) {
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
      questionText: data.questionText,
      choices: data.choices && data.choices.length === 4 ? data.choices : (isMultipleChoice ? ['1', '2', '3', '4'] : undefined),
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      commonMistakes: data.commonMistakes || matchedCategory.commonMistakes,
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

  if (!ai) {
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Bạn là chuyên gia đào tạo học sinh xuất sắc ôn thi Olympic Toán Quốc tế ASMO.'
      }
    });

    return res.json({ explanation: response.text });
  } catch (err) {
    console.error('Error generating AI explanation:', err);
    return res.json({
      explanation: `### HƯỚNG DẪN CHI TIẾT (Lỗi kết nối AI)
      
${explanation}

*(Đã xảy ra lỗi khi kết nối với AI Tutor, hiển thị giải pháp mặc định từ cơ sở dữ liệu)*`
    });
  }
});

// 5. Interactive Chat with the AI Tutor about a specific question
app.post('/api/gemini/chat-tutor', async (req, res) => {
  const { history, message, contextQuestion } = req.body;

  if (!ai) {
    return res.json({
      reply: 'Chào bạn! Tôi rất muốn giải thích thêm cho bạn, nhưng hiện tại hệ thống chưa được kết nối với Gemini API (chưa có GEMINI_API_KEY). Bạn vẫn có thể ôn tập các dạng bài và làm đề thi thử vô cùng mượt mà bằng cơ sở toán học offline của tôi nhé! 💪'
    });
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

    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      history: formattedHistory,
      config: {
        systemInstruction
      }
    });

    const response = await chat.sendMessage({
      message: message
    });

    return res.json({ reply: response.text });
  } catch (err) {
    console.error('Error in chat-tutor:', err);
    return res.status(500).json({ error: 'Đã xảy ra lỗi khi trò chuyện với AI Tutor' });
  }
});

// 6. Custom AI Solver / OCR Proxy
app.post('/api/gemini/solve-custom', async (req, res) => {
  const { customQuestion } = req.body;

  if (!ai) {
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Bạn là chuyên gia giải toán Olympic và cố vấn học tập Toán lớp 8.'
      }
    });

    return res.json({ solution: response.text });
  } catch (err) {
    console.error('Error in solve-custom:', err);
    return res.status(500).json({ error: 'Đã xảy ra lỗi khi giải toán cùng AI.' });
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
