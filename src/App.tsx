/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Calendar,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Search,
  BookMarked,
  BrainCircuit,
  MessageSquare,
  MessageCircle,
  FileText,
  Bookmark,
  Share2,
  ChevronLeft,
  Flame,
  AlertTriangle,
  Lightbulb,
  Edit3,
  ListTodo,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MathText } from './components/MathText.tsx';
import { AiTutorChat } from './components/AiTutorChat.tsx';
import { CATEGORIES, MathCategory, Question, generateQuestion, generateAsmoTest } from './utils/mathGenerators.ts';

// Achievement Badges definition
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  condition: string;
  unlocked: boolean;
}

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'home' | 'practice' | 'mock' | 'solver' | 'tips' | 'settings'>('home');

  // Local state for user entered Gemini API Key
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('asmo_gemini_api_key') || '';
  });

  // Local state for statistics & progress (synchronized with localStorage)
  const [stats, setStats] = useState({
    completedCategories: [] as string[], // list of categoryIds completed with at least 1 correct answer
    accuracySum: 0,
    solvedCount: 0,
    correctCount: 0,
    cumulativePoints: 0,
    streak: 3, // initial mock streak or incremented
    lastActiveDate: ''
  });

  // Achievements/Badges state
  const [badges, setBadges] = useState<Badge[]>([
    { id: '1', name: 'Thần Đồng Số Học', description: 'Giải đúng ít nhất 3 câu thuộc phần Lý thuyết số.', icon: '🔢', color: 'from-amber-400 to-orange-500', condition: 'Số học: 3 câu đúng', unlocked: false },
    { id: '2', name: 'Kỹ Sư Đại Số', description: 'Giải đúng ít nhất 3 câu thuộc phần Đại số.', icon: '📈', color: 'from-blue-400 to-indigo-600', condition: 'Đại số: 3 câu đúng', unlocked: false },
    { id: '3', name: 'Nhà Hình Học', description: 'Giải đúng ít nhất 3 câu thuộc phần Hình học.', icon: '📐', color: 'from-emerald-400 to-teal-600', condition: 'Hình học: 3 câu đúng', unlocked: false },
    { id: '4', name: 'Chúa Tể Logic', description: 'Giải đúng ít nhất 3 câu thuộc phần Tư duy logic.', icon: '💡', color: 'from-purple-400 to-pink-600', condition: 'Logic: 3 câu đúng', unlocked: false },
    { id: '5', name: 'Vượt Vũ Môn', description: 'Hoàn thành ít nhất 1 bài thi thử đạt trên 60 điểm.', icon: '🏆', color: 'from-rose-500 to-red-600', condition: 'Điểm thi thử ≥ 60', unlocked: false }
  ]);

  // CATEGORY PRACTICE MODULE STATES
  const [selectedCategory, setSelectedCategory] = useState<MathCategory | null>(null);
  const [practiceDifficulty, setPracticeDifficulty] = useState<'Nhóm 1' | 'Nhóm 2' | 'Nhóm 3'>('Nhóm 1');
  const [currentPracticeQuestion, setCurrentPracticeQuestion] = useState<Question | null>(null);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);
  const [practiceIsCorrect, setPracticeIsCorrect] = useState(false);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [showAiTutorPractice, setShowAiTutorPractice] = useState(false);
  const [practiceHistory, setPracticeHistory] = useState<{ [catId: string]: { correct: number; total: number } }>({});

  // EXAM MODULE STATES
  const [examType, setExamType] = useState<'full' | 'mini'>('full');
  const [examState, setExamState] = useState<'landing' | 'running' | 'submitted'>('landing');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examAnswers, setExamAnswers] = useState<{ [qId: string]: string }>({});
  const [examFlags, setExamFlags] = useState<{ [qId: string]: boolean }>({});
  const [currentExamQuestionIndex, setCurrentExamQuestionIndex] = useState(0);
  const [examTimeLeft, setExamTimeLeft] = useState(120 * 60); // 120 minutes for full
  const [examTimerId, setExamTimerId] = useState<NodeJS.Timeout | null>(null);
  const [examScore, setExamScore] = useState(0);
  const [examTimeTaken, setExamTimeTaken] = useState(0);
  const [examDraftText, setExamDraftText] = useState('');
  const [reviewQuestionIdx, setReviewQuestionIdx] = useState<number | null>(null);
  const [showAiTutorExam, setShowAiTutorExam] = useState(false);

  // CUSTOM SOLVER STATES
  const [customSolverInput, setCustomSolverInput] = useState('');
  const [customSolverResult, setCustomSolverResult] = useState('');
  const [customSolverLoading, setCustomSolverLoading] = useState(false);
  const [customSolverChatContext, setCustomSolverChatContext] = useState('');
  const [showCustomChat, setShowCustomChat] = useState(false);

  // SEARCH & CATEGORIES STATE
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('Tất cả');

  // Interactive Daily Revision Roadmap
  const [selectedRoadmapDay, setSelectedRoadmapDay] = useState<number>(1);

  // Preloaded Custom Math Problems for custom solver
  const preloadedProblems = [
    { title: 'Tìm chữ số x, y của số 5 chữ số', text: 'Tìm chữ số x, y sao cho số 5 chữ số 4x53y chia hết cho cả 5 và 9.' },
    { title: 'Tính giá trị biểu thức rút gọn', text: 'Cho x - y = 5 và x*y = 6. Hãy tính giá trị biểu thức đại số Q = x^3 - y^3.' },
    { title: 'Tính diện tích hình thang ghép', text: 'Cho hình thang vuông ABCD (vuông tại A và D), có đường cao AD = 6cm, đáy nhỏ AB = 4cm và đáy lớn CD = 9cm. Tính diện tích tam giác OBC biết O là giao điểm hai đường chéo.' }
  ];

  // 1. Initial Load and Sync with LocalStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('asmo_stats');
    const savedPracticeHistory = localStorage.getItem('asmo_practice_history');
    const savedActiveTab = localStorage.getItem('asmo_active_tab');

    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        setStats(parsed);
      } catch (e) {
        console.error('Error parsing stats:', e);
      }
    }
    if (savedPracticeHistory) {
      try {
        setPracticeHistory(JSON.parse(savedPracticeHistory));
      } catch (e) {
        console.error('Error parsing practice history:', e);
      }
    }
    if (savedActiveTab && ['home', 'practice', 'mock', 'solver', 'tips'].includes(savedActiveTab)) {
      setActiveTab(savedActiveTab as any);
    }

    // Dynamic streak check based on dates
    const todayStr = new Date().toDateString();
    setStats(prev => {
      let currentStreak = prev.streak || 1;
      if (prev.lastActiveDate && prev.lastActiveDate !== todayStr) {
        const lastDate = new Date(prev.lastActiveDate);
        const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      }
      return { ...prev, streak: currentStreak, lastActiveDate: todayStr };
    });
  }, []);

  // Sync Stats to LocalStorage and Evaluate Badges
  useEffect(() => {
    localStorage.setItem('asmo_stats', JSON.stringify(stats));

    // Evaluate badges eligibility dynamically
    let numTheoryCorrect = 0;
    let algebraCorrect = 0;
    let geometryCorrect = 0;
    let logicCorrect = 0;

    Object.keys(practiceHistory).forEach(catId => {
      const cat = CATEGORIES.find(c => c.id === catId);
      const correct = practiceHistory[catId].correct || 0;
      if (cat) {
        if (cat.section === 'Lý thuyết số') numTheoryCorrect += correct;
        if (cat.section === 'Đại số') algebraCorrect += correct;
        if (cat.section === 'Hình học') geometryCorrect += correct;
        if (cat.section === 'Tư duy logic') logicCorrect += correct;
      }
    });

    setBadges(prev =>
      prev.map(b => {
        let isUnlocked = b.unlocked;
        if (b.id === '1' && numTheoryCorrect >= 3) isUnlocked = true;
        if (b.id === '2' && algebraCorrect >= 3) isUnlocked = true;
        if (b.id === '3' && geometryCorrect >= 3) isUnlocked = true;
        if (b.id === '4' && logicCorrect >= 3) isUnlocked = true;
        // 5 is evaluated on test submission
        return { ...b, unlocked: isUnlocked };
      })
    );
  }, [stats, practiceHistory]);

  const savePracticeHistoryToStore = (history: typeof practiceHistory) => {
    setPracticeHistory(history);
    localStorage.setItem('asmo_practice_history', JSON.stringify(history));
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    localStorage.setItem('asmo_active_tab', tab);
  };

  // 2. TIMED EXAM LOOP
  useEffect(() => {
    if (examState === 'running' && examTimeLeft > 0) {
      const interval = setInterval(() => {
        setExamTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleExamSubmit(true); // force submit on timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [examState, examTimeLeft]);

  // 3. GENERATE PRACTICE QUESTION
  const handleLoadPracticeQuestion = async (category: MathCategory) => {
    setSelectedCategory(category);
    setPracticeAnswer('');
    setPracticeSubmitted(false);
    setPracticeIsCorrect(false);
    setShowAiTutorPractice(false);
    setPracticeLoading(true);

    const seed = Math.floor(Math.random() * 100000);

    try {
      const response = await fetch('/api/gemini/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': localStorage.getItem('asmo_gemini_api_key') || ''
        },
        body: JSON.stringify({
          categoryId: category.id,
          difficulty: practiceDifficulty,
          seed
        })
      });

      const data = await response.json();
      if (response.ok && data.question) {
        setCurrentPracticeQuestion(data.question);
      } else {
        // Fallback offline
        const offlineQ = generateQuestion(category.id, seed);
        offlineQ.difficulty = practiceDifficulty;
        offlineQ.points = practiceDifficulty === 'Nhóm 1' ? 3 : practiceDifficulty === 'Nhóm 2' ? 4 : 6;
        if (practiceDifficulty === 'Nhóm 3') {
          offlineQ.type = 'short_answer';
          delete offlineQ.choices;
        }
        setCurrentPracticeQuestion(offlineQ);
      }
    } catch (e) {
      console.error('Error fetching dynamic question:', e);
      const offlineQ = generateQuestion(category.id, seed);
      offlineQ.difficulty = practiceDifficulty;
      offlineQ.points = practiceDifficulty === 'Nhóm 1' ? 3 : practiceDifficulty === 'Nhóm 2' ? 4 : 6;
      if (practiceDifficulty === 'Nhóm 3') {
        offlineQ.type = 'short_answer';
        delete offlineQ.choices;
      }
      setCurrentPracticeQuestion(offlineQ);
    } finally {
      setPracticeLoading(false);
    }
  };

  const handlePracticeSubmit = () => {
    if (!currentPracticeQuestion || practiceSubmitted || !practiceAnswer.trim()) return;

    let correct = false;
    const ansCleaned = practiceAnswer.trim().toLowerCase();
    const correctCleaned = currentPracticeQuestion.correctAnswer.trim().toLowerCase();

    if (currentPracticeQuestion.type === 'multiple_choice') {
      correct = ansCleaned === correctCleaned;
    } else {
      // Short numerical matches. Check if student answered fractions like "4/5" or decimal like "2.4"
      correct = ansCleaned === correctCleaned;
      // Allow float difference slightly for robust checking
      if (!correct && !isNaN(parseFloat(ansCleaned)) && !isNaN(parseFloat(correctCleaned))) {
        correct = Math.abs(parseFloat(ansCleaned) - parseFloat(correctCleaned)) < 0.01;
      }
    }

    setPracticeIsCorrect(correct);
    setPracticeSubmitted(true);

    // Update practice stats
    const catId = currentPracticeQuestion.categoryId;
    const currentHist = practiceHistory[catId] || { correct: 0, total: 0 };
    const updatedHist = {
      correct: currentHist.correct + (correct ? 1 : 0),
      total: currentHist.total + 1
    };
    savePracticeHistoryToStore({ ...practiceHistory, [catId]: updatedHist });

    // Update global user stats
    setStats(prev => {
      const uniqueCats = prev.completedCategories.includes(catId) && correct
        ? prev.completedCategories
        : correct
        ? [...prev.completedCategories, catId]
        : prev.completedCategories;

      const newSolvedCount = prev.solvedCount + 1;
      const newCorrectCount = prev.correctCount + (correct ? 1 : 0);
      const accuracy = (newCorrectCount / newSolvedCount) * 100;
      const ptsEarned = correct ? currentPracticeQuestion.points : 0;

      return {
        ...prev,
        completedCategories: uniqueCats,
        solvedCount: newSolvedCount,
        correctCount: newCorrectCount,
        cumulativePoints: prev.cumulativePoints + ptsEarned,
        accuracySum: accuracy
      };
    });
  };

  // 4. MOCK EXAM SYSTEM
  const handleStartExam = (type: 'full' | 'mini') => {
    setExamType(type);
    setExamState('running');
    setCurrentExamQuestionIndex(0);
    setExamAnswers({});
    setExamFlags({});
    setExamDraftText('');
    setReviewQuestionIdx(null);
    setShowAiTutorExam(false);

    const testSeed = Math.floor(Math.random() * 100000);
    const questions = generateAsmoTest(testSeed);

    if (type === 'mini') {
      // 5 questions: 2 Basic (Nhóm 1), 2 Apply (Nhóm 2), 1 Synth (Nhóm 3)
      const subset = [
        questions[0], // Nhóm 1
        questions[3], // Nhóm 1
        questions[11], // Nhóm 2
        questions[14], // Nhóm 2
        questions[22]  // Nhóm 3
      ];
      setExamQuestions(subset);
      setExamTimeLeft(25 * 60); // 25 minutes for mini
    } else {
      setExamQuestions(questions);
      setExamTimeLeft(120 * 60); // 120 minutes for full
    }
  };

  const handleExamSubmit = (isTimeOut = false) => {
    if (examState !== 'running') return;

    if (!isTimeOut) {
      const unansweredCount = examQuestions.length - Object.keys(examAnswers).length;
      if (unansweredCount > 0) {
        const confirmSubmit = window.confirm(`Bạn còn ${unansweredCount} câu chưa điền đáp án. Bạn vẫn muốn nộp bài chứ?`);
        if (!confirmSubmit) return;
      } else {
        const confirmSubmit = window.confirm('Bạn có chắc chắn muốn nộp bài thi ASMO?');
        if (!confirmSubmit) return;
      }
    }

    setExamState('submitted');

    // Score calculations
    let score = 0;
    examQuestions.forEach(q => {
      const studentAns = examAnswers[q.id];
      if (studentAns !== undefined) {
        const sClean = studentAns.trim().toLowerCase();
        const cClean = q.correctAnswer.trim().toLowerCase();
        let isCorrect = sClean === cClean;
        if (!isCorrect && !isNaN(parseFloat(sClean)) && !isNaN(parseFloat(cClean))) {
          isCorrect = Math.abs(parseFloat(sClean) - parseFloat(cClean)) < 0.01;
        }
        if (isCorrect) {
          score += q.points;
        }
      }
    });

    setExamScore(score);
    const totalTimeAllocated = examType === 'mini' ? 25 * 60 : 120 * 60;
    setExamTimeTaken(totalTimeAllocated - examTimeLeft);

    // Update global user statistics
    setStats(prev => {
      const addedPoints = score;
      let newBadgesUnlocked = [...badges];

      if (examType === 'full' && score >= 60) {
        // Unlock badge 5
        setBadges(badgesState =>
          badgesState.map(b => (b.id === '5' ? { ...b, unlocked: true } : b))
        );
      }

      return {
        ...prev,
        cumulativePoints: prev.cumulativePoints + addedPoints
      };
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 5. CUSTOM PROBLEMS SOLVER
  const handleSolveCustom = async () => {
    if (!customSolverInput.trim() || customSolverLoading) return;
    setCustomSolverLoading(true);
    setCustomSolverResult('');
    setShowCustomChat(false);

    try {
      const response = await fetch('/api/gemini/solve-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': localStorage.getItem('asmo_gemini_api_key') || ''
        },
        body: JSON.stringify({ customQuestion: customSolverInput })
      });

      const data = await response.json();
      if (response.ok && data.solution) {
        setCustomSolverResult(data.solution);
        setCustomSolverChatContext(customSolverInput);
      } else {
        const errorDetail = data && data.error ? data.error : 'Hệ thống hiện đang ở chế độ offline hoặc máy chủ đang quá tải.';
        setCustomSolverResult(`### Không thể kết nối với trí tuệ nhân tạo Gemini
        
**Chi tiết lỗi từ API / Hệ thống:**
\`${errorDetail}\`

Hãy kiểm tra lại xem API Key của bạn đã chính xác chưa (trong mục Cài đặt AI), hoặc thử lại sau ít phút nếu máy chủ đang bị giới hạn lượt dùng.

**Gợi ý phương pháp giải:**
- Phân tích đa thức bằng hằng đẳng thức hoặc tách nhân tử.
- Đặt ẩn phụ để đơn giản hóa biểu thức.
- Vẽ sơ đồ đoạn thẳng nếu là toán chuyển động hay tổng-tỉ.`);
      }
    } catch (e: any) {
      console.error(e);
      setCustomSolverResult(`Đã xảy ra lỗi khi truyền tín hiệu tới AI. Vui lòng kiểm tra lại kết nối internet. Chi tiết lỗi: ${e.message || String(e)}`);
    } finally {
      setCustomSolverLoading(false);
    }
  };

  // FILTER CATEGORIES
  const filteredCategories = CATEGORIES.filter(cat => {
    const matchSearch =
      cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(categorySearchQuery.toLowerCase());
    const matchSection = activeSectionFilter === 'Tất cả' || cat.section === activeSectionFilter;
    return matchSearch && matchSection;
  });

  // Calculate medals based on score
  const getMedalStatus = (score: number) => {
    if (examType === 'mini') {
      if (score === 20) return { name: 'Tuyệt Đối! 🌟', desc: 'Đạt điểm số tối đa!', color: 'text-amber-500 bg-amber-50 border-amber-200' };
      if (score >= 14) return { name: 'Xuất Sắc! 🔥', desc: 'Đạt kết quả rất cao', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
      return { name: 'Hoàn Thành! 👍', desc: 'Nỗ lực đáng ghi nhận!', color: 'text-slate-600 bg-slate-50 border-slate-200' };
    } else {
      if (score >= 90) return { name: 'Huy Chương Vàng 🏆', desc: 'Xếp hạng Thủ khoa xuất sắc!', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
      if (score >= 75) return { name: 'Huy Chương Bạc 🥈', desc: 'Kỹ năng toán học kiệt xuất!', color: 'text-slate-500 bg-slate-100 border-slate-300' };
      if (score >= 60) return { name: 'Huy Chương Đồng 🥉', desc: 'Giải pháp vô cùng sáng tạo!', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      if (score >= 45) return { name: 'Giải Khuyến Khích 🏅', desc: 'Chúc mừng thành tích xuất sắc!', color: 'text-blue-600 bg-blue-50 border-blue-200' };
      return { name: 'Giấy Chứng Nhận 📜', desc: 'Cố gắng rèn luyện thêm nhé!', color: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
  };

  // Revision roadmap details mapped by day
  const ROADMAP_DAYS = [
    {
      day: 1,
      title: 'Lý Thuyết Số (Số Học)',
      tasks: [
        'Ôn lại quy tắc chia hết cho 2, 3, 5, 9, 11 (Dạng 1.1)',
        'Công thức liên hệ UCLN, BCNN và số dư (Dạng 1.2)',
        'Dãy số quy luật & Chu kỳ tuần hoàn số dư (Dạng 1.5)'
      ],
      tip: 'Nhớ lập bảng dư của chữ số tận cùng lũy thừa (chu kỳ lặp thường là 4).'
    },
    {
      day: 2,
      title: 'Đại Số Học',
      tasks: [
        'Vận dụng các hằng đẳng thức đáng nhớ để rút gọn (Dạng 2.1)',
        'Phương pháp tách bình phương tìm Min/Max cực trị (Dạng 2.3)',
        'Lập phương trình chuyển động ngược chiều/vận tốc trung bình (Dạng 2.5)'
      ],
      tip: 'Vận tốc trung bình khứ hồi không phải là trung bình cộng v1 và v2!'
    },
    {
      day: 3,
      title: 'Hình Học & Tư Duy logic',
      tasks: [
        'Chứng minh tam giác đồng dạng góc-góc và lập tỉ lệ diện tích (Dạng 3.1)',
        'Tính chất đường phân giác trong tam giác (Dạng 3.2)',
        'Tìm số lượng cách đếm hình phẳng, hoán vị (Dạng 4.2)'
      ],
      tip: 'Tỉ số diện tích hai tam giác đồng dạng bằng BÌNH PHƯƠNG tỉ số đồng dạng.'
    },
    {
      day: 4,
      title: 'Đề Thi Thử & Tổng Ôn',
      tasks: [
        'Bấm giờ làm 1 đề thi thử ASMO 25 câu (Dạng 1-4 tổng hợp)',
        'Xem lại các câu làm sai và phân tích bẫy đề thi',
        'Chuẩn bị tâm lý tự tin và rèn luyện tốc độ làm toán'
      ],
      tip: 'Quy tắc vàng: 10 câu đầu chỉ làm trong 20 phút. Không dừng lại ở câu khó quá 4 phút!'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans" id="app_root">
      {/* Dynamic Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs" id="app_header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleTabChange('home')} id="logo_section">
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/10">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-slate-900 leading-tight">ASMO Toán Lớp 8</h1>
                <p className="text-xs text-slate-500 font-medium">Hệ thống Luyện thi Thông minh</p>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="hidden md:flex space-x-1" id="desktop_nav">
              <button
                onClick={() => handleTabChange('home')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'home' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'
                }`}
                id="nav_home"
              >
                Bảng điều khiển
              </button>
              <button
                onClick={() => handleTabChange('practice')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'practice' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'
                }`}
                id="nav_practice"
              >
                18 Dạng toán ôn luyện
              </button>
              <button
                onClick={() => handleTabChange('mock')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'mock' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'
                }`}
                id="nav_mock"
              >
                Thi thử ASMO
              </button>
              <button
                onClick={() => handleTabChange('solver')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'solver' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'
                }`}
                id="nav_solver"
              >
                Giải toán cùng AI
              </button>
              <button
                onClick={() => handleTabChange('tips')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'tips' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'
                }`}
                id="nav_tips"
              >
                Chiến thuật & Bí kíp
              </button>
              <button
                onClick={() => handleTabChange('settings')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'
                }`}
                id="nav_settings"
              >
                <Settings className="w-4 h-4" /> Cài đặt AI
              </button>
            </nav>

            {/* Streak Indicator */}
            <div className="flex items-center space-x-3" id="streak_profile_container">
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl font-bold text-sm shadow-xs" title="Chuỗi ngày hoạt động liên tục">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
                <span>{stats.streak} Ngày</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE NAV BAR (sticky bottom for nice thumb navigation) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex justify-around z-40 shadow-lg" id="mobile_nav_bottom">
        <button
          onClick={() => handleTabChange('home')}
          className={`flex flex-col items-center p-1 rounded-xl cursor-pointer ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-500'}`}
          id="m_nav_home"
        >
          <BrainCircuit className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Trang chủ</span>
        </button>
        <button
          onClick={() => handleTabChange('practice')}
          className={`flex flex-col items-center p-1 rounded-xl cursor-pointer ${activeTab === 'practice' ? 'text-blue-600' : 'text-slate-500'}`}
          id="m_nav_practice"
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Ôn tập</span>
        </button>
        <button
          onClick={() => handleTabChange('mock')}
          className={`flex flex-col items-center p-1 rounded-xl cursor-pointer ${activeTab === 'mock' ? 'text-blue-600' : 'text-slate-500'}`}
          id="m_nav_mock"
        >
          <Clock className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Thi thử</span>
        </button>
        <button
          onClick={() => handleTabChange('solver')}
          className={`flex flex-col items-center p-1 rounded-xl cursor-pointer ${activeTab === 'solver' ? 'text-blue-600' : 'text-slate-500'}`}
          id="m_nav_solver"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Giải toán</span>
        </button>
        <button
          onClick={() => handleTabChange('settings')}
          className={`flex flex-col items-center p-1 rounded-xl cursor-pointer ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-500'}`}
          id="m_nav_settings"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Cài đặt</span>
        </button>
      </div>

      {/* Main Content Space */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12" id="app_main_content">
        {/* TAB 1: HOME & DASHBOARD */}
        {activeTab === 'home' && (
          <div className="space-y-8" id="home_view_tab">
            {/* Banner Countdown */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden" id="countdown_banner">
              <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-blue-400/10 rounded-full blur-xl"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-100 backdrop-blur-md mb-3 border border-white/10">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" /> Lịch thi ASMO Toàn quốc
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Kỳ thi ASMO Quốc Tế 2026</h2>
                  <p className="mt-2 text-blue-100 text-sm max-w-xl font-medium">
                    Kỳ thi diễn ra vào ngày <strong className="text-white">27/09/2026</strong>. Hãy sẵn sàng chinh phục các nấc thang huy chương Toán học cùng trợ lý AI thông minh!
                  </p>
                </div>
                {/* Countdown counter */}
                <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 flex flex-col items-center justify-center min-w-[150px] shadow-sm">
                  <span className="text-xs uppercase tracking-widest text-blue-200 font-bold mb-1">Thời gian còn</span>
                  <span className="text-4xl font-black text-amber-300 animate-pulse">4 Ngày</span>
                  <span className="text-[11px] text-blue-100 mt-1 font-medium">Cố gắng tăng tốc ôn luyện</span>
                </div>
              </div>
            </div>

            {/* Lịch ôn tập roadmap widget */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs" id="roadmap_scheduler_widget">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Chiến dịch bứt phá 4 ngày</h3>
                    <p className="text-xs text-slate-500 font-medium">Lộ trình ôn luyện phân phối khoa học từ chuyên gia</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-6" id="roadmap_days_selector">
                {ROADMAP_DAYS.map((d) => (
                  <button
                    key={d.day}
                    onClick={() => setSelectedRoadmapDay(d.day)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      selectedRoadmapDay === d.day
                        ? 'bg-indigo-500/5 border-indigo-500 text-indigo-700 font-bold ring-2 ring-indigo-500/10'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                    id={`roadmap_day_btn_${d.day}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-500">NGÀY {d.day}</span>
                      {selectedRoadmapDay === d.day && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>}
                    </div>
                    <p className="text-xs mt-1 font-semibold truncate">{d.title}</p>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {ROADMAP_DAYS.map((d) => {
                  if (d.day !== selectedRoadmapDay) return null;
                  return (
                    <motion.div
                      key={d.day}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="bg-slate-50 rounded-xl p-5 border border-slate-200"
                      id={`roadmap_day_content_${d.day}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <h4 className="font-bold text-slate-900 text-sm flex items-center">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2"></span>
                          Nội dung trọng tâm Ngày {d.day}: {d.title}
                        </h4>
                        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1 font-semibold flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          <span>Mẹo: {d.tip}</span>
                        </div>
                      </div>

                      <ul className="space-y-3 mb-4" id={`roadmap_day_tasks_${d.day}`}>
                        {d.tasks.map((task, idx) => (
                          <li key={idx} className="flex items-start text-xs text-slate-700 font-medium">
                            <span className="text-indigo-600 mr-2 font-bold select-none">•</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            if (d.day === 4) {
                              handleTabChange('mock');
                            } else {
                              handleTabChange('practice');
                              // Set section filter accordingly
                              if (d.day === 1) setActiveSectionFilter('Lý thuyết số');
                              if (d.day === 2) setActiveSectionFilter('Đại số');
                              if (d.day === 3) setActiveSectionFilter('Hình học');
                            }
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer shadow-sm shadow-indigo-500/10"
                          id={`roadmap_goto_practice_btn_${d.day}`}
                        >
                          <span>{d.day === 4 ? 'Thi thử ngay' : 'Luyện tập các dạng này'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Quick stats and Progress Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats_dashboard_grid">
              {/* Stat 1 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Độ bao phủ</span>
                  <span className="text-2xl font-extrabold text-slate-900 leading-none block mt-1">
                    {stats.completedCategories.length}/18
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block mt-1">Dạng bài đã hoàn thành</span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Điểm tích lũy</span>
                  <span className="text-2xl font-extrabold text-emerald-600 leading-none block mt-1">
                    {stats.cumulativePoints}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block mt-1">Điểm rèn luyện ASMO</span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Độ chính xác</span>
                  <span className="text-2xl font-extrabold text-purple-600 leading-none block mt-1">
                    {stats.solvedCount > 0 ? Math.round((stats.correctCount / stats.solvedCount) * 100) : 0}%
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block mt-1">
                    {stats.correctCount}/{stats.solvedCount} bài làm đúng
                  </span>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
                <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                  <Flame className="w-6 h-6 fill-amber-500" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Kỷ lục chuỗi</span>
                  <span className="text-2xl font-extrabold text-amber-600 leading-none block mt-1">
                    {stats.streak} Ngày
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block mt-1">Học tập đều đặn hàng ngày</span>
                </div>
              </div>
            </div>

            {/* Achievements & Badges Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs" id="achievements_badges_panel">
              <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Huy hiệu danh dự đạt được
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4" id="badges_grid">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`border rounded-xl p-4 text-center transition-all flex flex-col items-center justify-between relative overflow-hidden ${
                      badge.unlocked
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-slate-50 border-slate-100 opacity-60'
                    }`}
                    id={`badge_card_${badge.id}`}
                  >
                    <div className="relative">
                      <div className={`text-3xl w-14 h-14 bg-gradient-to-r ${badge.unlocked ? badge.color : 'from-slate-200 to-slate-300'} text-white rounded-full flex items-center justify-center shadow-md mb-3`}>
                        {badge.unlocked ? badge.icon : '🔒'}
                      </div>
                      {badge.unlocked && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">{badge.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-snug">{badge.description}</p>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full mt-3 uppercase tracking-wider">
                      {badge.condition}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Recommendation Banner */}
            <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6" id="daily_recommendation_banner">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/15 rounded-xl text-amber-300">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Đề xuất rèn luyện tốt nhất hôm nay</h3>
                  <p className="text-blue-100 text-sm mt-1 max-w-xl">
                    Dựa trên lộ trình, bạn hãy ôn tập **Dạng 1.4: Tìm số nguyên từ biểu thức**. Dạng này chiếm tỉ lệ khoảng 12% tổng số điểm trong cấu trúc đề thi ASMO thực tế đấy!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const cat = CATEGORIES.find(c => c.id === '1.4');
                  if (cat) {
                    handleTabChange('practice');
                    handleLoadPracticeQuestion(cat);
                  }
                }}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-blue-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm self-start md:self-auto shrink-0"
                id="recommendation_start_btn"
              >
                Học ngay Dạng 1.4
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: KNOWLEDGE BASE & PRACTICE */}
        {activeTab === 'practice' && (
          <div className="space-y-8" id="practice_view_tab">
            {!selectedCategory ? (
              <div className="space-y-6" id="categories_selector_pane">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm nhanh tên dạng toán, từ khóa kiến thức..."
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-sm transition-all"
                      id="category_search_input"
                    />
                  </div>
                  {/* Section tabs filters */}
                  <div className="flex overflow-x-auto gap-1 pb-1 md:pb-0" id="section_filters_tabs">
                    {['Tất cả', 'Lý thuyết số', 'Đại số', 'Hình học', 'Tư duy logic'].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setActiveSectionFilter(sec)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          activeSectionFilter === sec
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        id={`filter_tab_${sec}`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="categories_grid">
                  {filteredCategories.map((cat) => {
                    const progress = practiceHistory[cat.id] || { correct: 0, total: 0 };
                    const sectionColor =
                      cat.section === 'Lý thuyết số'
                        ? 'text-amber-600 bg-amber-50 border-amber-100'
                        : cat.section === 'Đại số'
                        ? 'text-blue-600 bg-blue-50 border-blue-100'
                        : cat.section === 'Hình học'
                        ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                        : 'text-purple-600 bg-purple-50 border-purple-100';

                    return (
                      <div
                        key={cat.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-350 hover:shadow-md transition-all flex flex-col justify-between"
                        id={`category_card_${cat.id}`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3.5">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${sectionColor}`}>
                              {cat.section}
                            </span>
                            <span className="text-xs text-slate-400 font-bold">Dạng {cat.id}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 leading-snug text-sm">{cat.name}</h4>
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                            {cat.description}
                          </p>
                        </div>

                        {/* Progress Indicators */}
                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                            Tiến độ: <span className="text-slate-800 font-bold">{progress.correct} đúng</span> / {progress.total} làm
                          </div>
                          <button
                            onClick={() => handleLoadPracticeQuestion(cat)}
                            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            id={`practice_category_btn_${cat.id}`}
                          >
                            <span>Học & Luyện</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredCategories.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400" id="no_categories_found">
                      Chưa tìm thấy dạng bài nào thỏa mãn từ khóa tìm kiếm. Vui lòng thử từ khóa khác!
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // ACTIVE CATEGORY COMPREHENSIVE PRACTICE VIEW
              <div className="space-y-6" id="active_practice_subview">
                {/* Back button and Category Title Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200" id="practice_header">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center text-slate-600 hover:text-slate-900 font-semibold text-xs cursor-pointer"
                    id="back_to_categories_btn"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại 18 dạng toán
                  </button>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Đang luyện tập</span>
                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base leading-snug">{selectedCategory.name}</h3>
                  </div>
                </div>

                {/* Sub-Layout: Left contains theory & practice question. Right contains AI Tutor Chat */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="practice_layout_grid">
                  {/* Left Column (8 cols) */}
                  <div className="lg:col-span-7 space-y-6" id="practice_left_column">
                    {/* Theory Briefing Accordion */}
                    <details className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs [&_summary::-webkit-details-marker]:hidden" open={false} id="theory_briefing_accordion">
                      <summary className="flex items-center justify-between cursor-pointer focus:outline-none" id="theory_summary_hdr">
                        <div className="flex items-center space-x-2">
                          <BookMarked className="w-4 h-4 text-indigo-500" />
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Tóm tắt lý thuyết dạng toán {selectedCategory.id}</h4>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </summary>
                      <div className="mt-4 pt-4 border-t border-slate-150 space-y-3.5 text-xs text-slate-700 leading-relaxed" id="theory_expanded_content">
                        <div>
                          <h5 className="font-bold text-slate-900">📚 Kiến thức cốt lõi:</h5>
                          <p className="mt-1 font-medium text-slate-650">{selectedCategory.keyKnowledge}</p>
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900">⚠️ Bẫy thường gặp (Cần tránh):</h5>
                          <p className="mt-1 font-medium text-rose-700 bg-rose-50 border border-rose-100 rounded-lg p-2.5">
                            {selectedCategory.commonMistakes}
                          </p>
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900">⚡ Mẹo làm nhanh ASMO:</h5>
                          <p className="mt-1 font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
                            {selectedCategory.speedTip}
                          </p>
                        </div>
                      </div>
                    </details>

                    {/* Question Generator Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden" id="practice_question_generator_card">
                      {/* Control panel: Difficulty selectors */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6" id="difficulty_picker_panel">
                        <span className="text-xs text-slate-500 font-bold">Độ khó rèn luyện:</span>
                        <div className="flex space-x-1" id="difficulty_pills">
                          {(['Nhóm 1', 'Nhóm 2', 'Nhóm 3'] as const).map((diff) => (
                            <button
                              key={diff}
                              disabled={practiceLoading || practiceSubmitted}
                              onClick={() => {
                                setPracticeDifficulty(diff);
                                // Trigger load automatically
                                setTimeout(() => {
                                  const btn = document.getElementById('trigger_load_q_btn');
                                  btn?.click();
                                }, 50);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                practiceDifficulty === diff
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50'
                              }`}
                              id={`diff_pill_${diff.replace(' ', '_')}`}
                            >
                              {diff === 'Nhóm 1' ? 'Cơ bản (3đ)' : diff === 'Nhóm 2' ? 'Vận dụng (4đ)' : 'Nâng cao (6đ)'}
                            </button>
                          ))}
                        </div>
                        <button
                          id="trigger_load_q_btn"
                          onClick={() => handleLoadPracticeQuestion(selectedCategory)}
                          className="p-1.5 hover:bg-slate-100 text-blue-600 rounded-lg transition-all border border-blue-100 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                          title="Tạo câu hỏi mới"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Tải đề khác
                        </button>
                      </div>

                      {practiceLoading ? (
                        <div className="py-16 text-center space-y-3" id="practice_loading_spinner">
                          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="text-xs text-slate-500 font-semibold animate-pulse">Giáo sư AI đang biên soạn đề thi chuẩn ASMO...</p>
                        </div>
                      ) : currentPracticeQuestion ? (
                        <div className="space-y-6" id="practice_question_content">
                          {/* Question Text Box */}
                          <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-200/80">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-150 text-indigo-700 mb-3">
                              {currentPracticeQuestion.difficulty} · {currentPracticeQuestion.points} điểm
                            </span>
                            <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                              <MathText>{currentPracticeQuestion.questionText}</MathText>
                            </div>
                          </div>

                          {/* Inputs Panel */}
                          <div className="space-y-4" id="practice_inputs_panel">
                            {currentPracticeQuestion.type === 'multiple_choice' && currentPracticeQuestion.choices ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="choices_container">
                                {currentPracticeQuestion.choices.map((choice, cIdx) => (
                                  <button
                                    key={cIdx}
                                    disabled={practiceSubmitted}
                                    onClick={() => setPracticeAnswer(cIdx.toString())}
                                    className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                                      practiceAnswer === cIdx.toString()
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/10'
                                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                                    id={`choice_btn_${cIdx}`}
                                  >
                                    <div className="flex items-center space-x-2.5">
                                      <span className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center ${
                                        practiceAnswer === cIdx.toString() ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                                      }`}>
                                        {['A', 'B', 'C', 'D'][cIdx]}
                                      </span>
                                      <span>{choice}</span>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                      practiceAnswer === cIdx.toString() ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                                    }`}>
                                      {practiceAnswer === cIdx.toString() && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              // Numerical Short Answer Input
                              <div className="max-w-md" id="short_ans_input_container">
                                <label className="block text-xs text-slate-500 font-bold mb-2">Nhập kết quả số của bạn:</label>
                                <div className="flex space-x-2">
                                  <input
                                    type="text"
                                    disabled={practiceSubmitted}
                                    value={practiceAnswer}
                                    onChange={(e) => setPracticeAnswer(e.target.value)}
                                    placeholder="Ví dụ: 12 hoặc 3/4 hoặc 2.5"
                                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-sm transition-all font-serif"
                                    id="short_ans_text_field"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Submit and Controls buttons */}
                            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3" id="practice_actions">
                              {!practiceSubmitted ? (
                                <button
                                  onClick={handlePracticeSubmit}
                                  disabled={!practiceAnswer.trim()}
                                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm shadow-blue-500/10"
                                  id="submit_practice_btn"
                                >
                                  Nộp bài chấm điểm
                                </button>
                              ) : (
                                <div className="flex items-center space-x-3" id="practice_post_actions">
                                  <button
                                    onClick={() => handleLoadPracticeQuestion(selectedCategory)}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-500/10"
                                    id="practice_next_btn"
                                  >
                                    Luyện tiếp câu khác
                                  </button>
                                  <button
                                    onClick={() => setShowAiTutorPractice(true)}
                                    className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-indigo-150"
                                    id="toggle_practice_chat_btn"
                                  >
                                    <MessageSquare className="w-4 h-4" /> Hỏi Giáo sư AI
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Interactive Result Panel */}
                          {practiceSubmitted && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`rounded-2xl p-5 border ${
                                practiceIsCorrect
                                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                                  : 'bg-rose-50/50 border-rose-200 text-rose-800'
                              }`}
                              id="practice_results_panel"
                            >
                              <div className="flex items-start space-x-3">
                                {practiceIsCorrect ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                )}
                                <div className="space-y-4 w-full">
                                  <div>
                                    <h4 className="font-bold text-sm">
                                      {practiceIsCorrect
                                        ? 'Chúc mừng! Bạn đã trả lời hoàn toàn chính xác! 🎉 Tuyệt vời! Bạn nắm vững rồi 💪'
                                        : 'Rất tiếc! Câu trả lời chưa chính xác rồi.'}
                                    </h4>
                                    <p className="text-xs text-slate-500 font-semibold mt-1">
                                      Đáp án đúng là:{' '}
                                      <strong className="text-slate-800 underline font-serif">
                                        {currentPracticeQuestion.type === 'multiple_choice' && currentPracticeQuestion.choices
                                          ? `Phương án ${['A', 'B', 'C', 'D'][parseInt(currentPracticeQuestion.correctAnswer)]}: ${
                                              currentPracticeQuestion.choices[parseInt(currentPracticeQuestion.correctAnswer)]
                                            }`
                                          : currentPracticeQuestion.correctAnswer}
                                      </strong>
                                    </p>
                                  </div>

                                  {/* Explanation Block */}
                                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-700 text-xs shadow-xs">
                                    <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-1">
                                      <FileText className="w-4 h-4 text-indigo-500" /> Hướng dẫn giải chi tiết:
                                    </h5>
                                    <div className="leading-relaxed">
                                      <MathText>{currentPracticeQuestion.explanation}</MathText>
                                    </div>
                                    {currentPracticeQuestion.commonMistakes && (
                                      <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-rose-700 bg-rose-50/40 p-2.5 rounded-lg border border-rose-100/40">
                                        <span className="font-bold block mb-1">⚠️ Lỗi bẫy hay gặp:</span>
                                        {currentPracticeQuestion.commonMistakes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-slate-400" id="click_start_tip">
                          Hãy bấm "Tải đề khác" hoặc chọn độ khó để hiển thị câu hỏi luyện tập.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: AI Tutor Chat Integration (5 cols) */}
                  <div className="lg:col-span-5" id="practice_right_column">
                    {showAiTutorPractice && currentPracticeQuestion ? (
                      <div className="sticky top-20 h-[520px]" id="ai_chat_sticky_wrapper">
                        <AiTutorChat
                          questionText={currentPracticeQuestion.questionText}
                          choices={currentPracticeQuestion.choices}
                          correctAnswer={currentPracticeQuestion.correctAnswer}
                          explanation={currentPracticeQuestion.explanation}
                          categoryName={currentPracticeQuestion.categoryName}
                          onClose={() => setShowAiTutorPractice(false)}
                        />
                      </div>
                    ) : (
                      <div className="bg-slate-100/50 border border-slate-200/60 rounded-2xl p-6 text-center space-y-4 sticky top-20 shadow-xs" id="ai_chat_preview_prompt">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                          <MessageCircle className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">Cố vấn học tập AI thông thái</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                          Trong quá trình giải bài, bạn có thể click nút <strong className="text-indigo-600">"Hỏi Giáo sư AI"</strong> bất cứ lúc nào để thảo luận chi tiết, hỏi mẹo tính nhẩm nhanh hoặc xin thêm đề tương tự cùng thầy giáo AI!
                        </p>
                        <button
                          onClick={() => {
                            if (currentPracticeQuestion) {
                              setShowAiTutorPractice(true);
                            } else {
                              alert('Hãy tải câu hỏi luyện tập trước để AI có ngữ cảnh trò chuyện cùng bạn!');
                            }
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                          id="open_preview_chat_btn"
                        >
                          Mở Chat Coach
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ASMO MOCK TEST */}
        {activeTab === 'mock' && (
          <div className="space-y-8" id="mock_exam_view_tab">
            {/* 1. Exam Landing View */}
            {examState === 'landing' && (
              <div className="max-w-3xl mx-auto space-y-8" id="exam_landing_pane">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm text-center space-y-6">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Kỳ Thi Thử Chuẩn Cấu Trúc ASMO Toán 8</h3>
                    <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto mt-2 leading-relaxed">
                      Luyện tập áp lực thời gian với ngân hàng đề ngẫu nhiên thay đổi số liệu liên tục. Đề thi tổng hợp đầy đủ kiến thức số học, đại số, hình học và logic.
                    </p>
                  </div>

                  {/* ASMO Exam Specs Rules */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left max-w-xl mx-auto space-y-4" id="exam_rules_card">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-center">Thể lệ & Cấu trúc điểm thi thử</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs" id="rules_grid">
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-center">
                        <span className="font-bold text-slate-900 block text-sm">Nhóm 1 (Câu 1-10)</span>
                        <span className="text-emerald-600 font-bold block mt-1">3 điểm/câu</span>
                        <span className="text-[10px] text-slate-450 mt-1 block">Kiến thức cơ bản</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-center">
                        <span className="font-bold text-slate-900 block text-sm">Nhóm 2 (Câu 11-20)</span>
                        <span className="text-blue-600 font-bold block mt-1">4 điểm/câu</span>
                        <span className="text-[10px] text-slate-450 mt-1 block">Tư duy ứng dụng</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-center">
                        <span className="font-bold text-slate-900 block text-sm">Nhóm 3 (Câu 21-25)</span>
                        <span className="text-purple-600 font-bold block mt-1">6 điểm/câu</span>
                        <span className="text-[10px] text-slate-450 mt-1 block">Tổng hợp sáng tạo</span>
                      </div>
                    </div>
                    <ul className="text-[11px] text-slate-600 space-y-2 list-disc pl-5 leading-relaxed font-medium">
                      <li>Tổng số câu hỏi: <strong className="text-slate-800">25 câu</strong> · Tổng quỹ điểm: <strong className="text-slate-800">100 điểm</strong>.</li>
                      <li>Thời gian làm bài quy định: <strong className="text-slate-800">120 phút</strong>.</li>
                      <li>Hình thức thi ASMO: Điền số hoặc trọn lựa phương án. Hệ thống <strong className="text-emerald-600">không trừ điểm</strong> khi trả lời sai.</li>
                      <li>Nên ưu tiên giải quyết nhanh các câu thuộc nhóm dễ trước.</li>
                    </ul>
                  </div>

                  {/* Actions to Start */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4" id="exam_launch_actions">
                    <button
                      onClick={() => handleStartExam('full')}
                      className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
                      id="start_full_exam_btn"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" /> Bắt đầu Thi thử Full (120 phút)
                    </button>
                    <button
                      onClick={() => handleStartExam('mini')}
                      className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-300 flex items-center justify-center gap-1.5"
                      id="start_mini_exam_btn"
                    >
                      <ListTodo className="w-4 h-4 text-slate-500" /> Làm bài Mini Quiz (5 câu - 25 phút)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Active Exam Running Mode */}
            {examState === 'running' && examQuestions.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="active_exam_workspace">
                {/* Left side: Exam Question Renderer (8 cols) */}
                <div className="lg:col-span-8 space-y-6" id="exam_left_workspace">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 relative overflow-hidden">
                    {/* Active Question Title Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-150" id="active_q_title_hdr">
                      <div className="flex items-center space-x-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                          {currentExamQuestionIndex + 1}
                        </span>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Câu hỏi thi thử</span>
                          <span className="text-xs text-slate-500 font-bold block mt-0.5">
                            {examQuestions[currentExamQuestionIndex].section} · Dạng {examQuestions[currentExamQuestionIndex].categoryId}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-lg">
                          {examQuestions[currentExamQuestionIndex].difficulty} · {examQuestions[currentExamQuestionIndex].points} điểm
                        </span>
                        <button
                          onClick={() => {
                            const qId = examQuestions[currentExamQuestionIndex].id;
                            setExamFlags(prev => ({ ...prev, [qId]: !prev[qId] }));
                          }}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            examFlags[examQuestions[currentExamQuestionIndex].id]
                              ? 'bg-rose-50 border-rose-200 text-rose-500'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                          title="Đánh dấu câu hỏi cần xem lại"
                          id="flag_question_btn"
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>

                    {/* Question Text Box */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-sm font-semibold leading-relaxed" id="exam_q_text_card">
                      <MathText>{examQuestions[currentExamQuestionIndex].questionText}</MathText>
                    </div>

                    {/* Question Interactive Inputs */}
                    <div className="space-y-4" id="exam_q_inputs_card">
                      {examQuestions[currentExamQuestionIndex].type === 'multiple_choice' && examQuestions[currentExamQuestionIndex].choices ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="exam_choices_grid">
                          {examQuestions[currentExamQuestionIndex].choices.map((choice, cIdx) => {
                            const qId = examQuestions[currentExamQuestionIndex].id;
                            const isSelected = examAnswers[qId] === cIdx.toString();
                            return (
                              <button
                                key={cIdx}
                                onClick={() => setExamAnswers(prev => ({ ...prev, [qId]: cIdx.toString() }))}
                                className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/10'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                                id={`exam_choice_btn_${cIdx}`}
                              >
                                <div className="flex items-center space-x-2.5">
                                  <span className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center ${
                                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    {['A', 'B', 'C', 'D'][cIdx]}
                                  </span>
                                  <span>{choice}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        // Numerical Short Answer
                        <div className="max-w-md" id="exam_short_input_container">
                          <label className="block text-xs text-slate-500 font-bold mb-2">Nhập kết quả số của bạn:</label>
                          <input
                            type="text"
                            value={examAnswers[examQuestions[currentExamQuestionIndex].id] || ''}
                            onChange={(e) => {
                              const qId = examQuestions[currentExamQuestionIndex].id;
                              const val = e.target.value;
                              setExamAnswers(prev => ({ ...prev, [qId]: val }));
                            }}
                            placeholder="Nhập giá trị chính xác..."
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-sm transition-all font-serif"
                            id="exam_short_ans_field"
                          />
                        </div>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between" id="exam_nav_actions">
                      <button
                        disabled={currentExamQuestionIndex === 0}
                        onClick={() => setCurrentExamQuestionIndex(prev => prev - 1)}
                        className="px-4 py-2 hover:bg-slate-150 disabled:bg-slate-100 border border-slate-250 text-slate-700 disabled:text-slate-400 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
                        id="exam_prev_btn"
                      >
                        Câu trước đó
                      </button>
                      <button
                        onClick={() => {
                          if (currentExamQuestionIndex < examQuestions.length - 1) {
                            setCurrentExamQuestionIndex(prev => prev + 1);
                          } else {
                            handleExamSubmit();
                          }
                        }}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                          currentExamQuestionIndex === examQuestions.length - 1
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10'
                        }`}
                        id="exam_next_btn"
                      >
                        {currentExamQuestionIndex === examQuestions.length - 1 ? 'Nộp Bài Thi thử' : 'Tiếp theo'}
                      </button>
                    </div>
                  </div>

                  {/* Built-in textual scratchpad / draft note area */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs" id="exam_scratchpad_widget">
                    <div className="flex items-center space-x-2 mb-2">
                      <Edit3 className="w-4 h-4 text-indigo-500" />
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Bảng Nháp Nháp Kỹ Thuật (Scribble Pad)</h4>
                    </div>
                    <textarea
                      value={examDraftText}
                      onChange={(e) => setExamDraftText(e.target.value)}
                      placeholder="Viết các phương án, tính toán phân tích nháp tại đây..."
                      className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono leading-relaxed"
                      id="exam_scratch_textarea"
                    />
                  </div>
                </div>

                {/* Right side: Timer & Matrix Questions Navigator Grid (4 cols) */}
                <div className="lg:col-span-4 space-y-6" id="exam_right_workspace">
                  {/* Digital Clock Widget */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center space-y-2" id="exam_timer_widget">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Thời gian thi thử còn</span>
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className={`w-5 h-5 ${examTimeLeft < 300 ? 'text-rose-500 animate-ping' : 'text-slate-400'}`} />
                      <span className={`text-3xl font-black font-mono tracking-tight ${examTimeLeft < 300 ? 'text-rose-600' : 'text-slate-850'}`}>
                        {formatTime(examTimeLeft)}
                      </span>
                    </div>
                    {examTimeLeft < 300 && (
                      <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider block animate-pulse">Sắp hết giờ thi! Tập trung làm bài</span>
                    )}
                  </div>

                  {/* Question Navigator Grid */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4" id="exam_nav_matrix_widget">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Danh sách câu hỏi</h4>
                    <div className="grid grid-cols-5 gap-2" id="questions_matrix_grid">
                      {examQuestions.map((q, idx) => {
                        const isSelected = idx === currentExamQuestionIndex;
                        const isAnswered = examAnswers[q.id] !== undefined && examAnswers[q.id] !== '';
                        const isFlagged = examFlags[q.id] === true;

                        let styleClasses = 'bg-white border-slate-250 text-slate-600 hover:bg-slate-50';
                        if (isSelected) {
                          styleClasses = 'bg-blue-600 border-blue-600 text-white shadow-xs';
                        } else if (isFlagged) {
                          styleClasses = 'bg-rose-50 border-rose-300 text-rose-600 font-bold';
                        } else if (isAnswered) {
                          styleClasses = 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold';
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => setCurrentExamQuestionIndex(idx)}
                            className={`h-9 w-9 border text-xs font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer ${styleClasses}`}
                            id={`matrix_cell_btn_${idx}`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500 font-medium" id="matrix_legend">
                      <div className="flex items-center space-x-2">
                        <span className="w-3.5 h-3.5 bg-blue-600 rounded-md border border-blue-600"></span>
                        <span>Đang làm</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-3.5 h-3.5 bg-emerald-50 rounded-md border border-emerald-300"></span>
                        <span>Đã điền đáp án</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-3.5 h-3.5 bg-rose-50 rounded-md border border-rose-300"></span>
                        <span>Cần xem lại (Bookmark)</span>
                      </div>
                    </div>
                  </div>

                  {/* Forced Submit trigger */}
                  <button
                    onClick={() => handleExamSubmit()}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-rose-500/10 uppercase tracking-wider"
                    id="trigger_submit_exam_sidebar"
                  >
                    Nộp Bài Ngay Lập Tức
                  </button>
                </div>
              </div>
            )}

            {/* 3. Post-Exam Scorecard and Results Dashboard */}
            {examState === 'submitted' && (
              <div className="space-y-8" id="exam_results_dashboard">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm text-center space-y-6 max-w-3xl mx-auto">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Kết quả thi thử ASMO</span>
                  <div className="inline-flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-full w-40 h-40 mx-auto shadow-xs relative">
                    <span className="text-5xl font-black text-blue-600 font-mono leading-none">{examScore}</span>
                    <span className="text-xs text-slate-500 font-bold mt-1">/100 điểm</span>
                  </div>

                  {/* Medal Announcement */}
                  <div className={`border rounded-2xl p-4 max-w-md mx-auto text-center ${getMedalStatus(examScore).color}`} id="medal_status_box">
                    <h4 className="font-extrabold text-base">{getMedalStatus(examScore).name}</h4>
                    <p className="text-xs font-semibold mt-1 opacity-90">{getMedalStatus(examScore).desc}</p>
                  </div>

                  {/* Summary Specs stats */}
                  <div className="grid grid-cols-3 gap-3 text-center max-w-xl mx-auto text-xs font-semibold text-slate-700" id="results_specs_grid">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                      <span className="text-slate-450 block text-[10px] uppercase tracking-wider">Thời gian thi</span>
                      <span className="text-sm font-bold text-slate-850 block mt-1">
                        {Math.floor(examTimeTaken / 60)} phút {examTimeTaken % 60} giây
                      </span>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                      <span className="text-slate-450 block text-[10px] uppercase tracking-wider">Tỉ lệ đúng</span>
                      <span className="text-sm font-bold text-slate-850 block mt-1">
                        {examQuestions.filter(q => {
                          const ans = examAnswers[q.id];
                          if (!ans) return false;
                          const correct = q.correctAnswer.trim().toLowerCase();
                          if (ans.trim().toLowerCase() === correct) return true;
                          if (!isNaN(parseFloat(ans)) && !isNaN(parseFloat(correct))) {
                            return Math.abs(parseFloat(ans) - parseFloat(correct)) < 0.01;
                          }
                          return false;
                        }).length}/{examQuestions.length} câu
                      </span>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                      <span className="text-slate-450 block text-[10px] uppercase tracking-wider">Dạng bài thi</span>
                      <span className="text-sm font-bold text-slate-850 block mt-1">
                        {examType === 'full' ? 'Trọn Bộ (25 câu)' : 'Mini (5 câu)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4" id="post_results_actions">
                    <button
                      onClick={() => setExamState('landing')}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                      id="restart_exam_home_btn"
                    >
                      Bắt đầu đề thi thử mới
                    </button>
                  </div>
                </div>

                {/* Detailed Questions Review Accordions */}
                <div className="space-y-4" id="exam_questions_review_pane">
                  <h4 className="font-extrabold text-slate-900 text-sm">Xem lại & Phân tích đáp án chi tiết từng câu:</h4>
                  <div className="space-y-3" id="exam_review_accordions_list">
                    {examQuestions.map((q, idx) => {
                      const studentAns = examAnswers[q.id];
                      const correctClean = q.correctAnswer.trim().toLowerCase();
                      const studentClean = studentAns ? studentAns.trim().toLowerCase() : '';
                      let isCorrect = studentClean === correctClean;
                      if (!isCorrect && !isNaN(parseFloat(studentClean)) && !isNaN(parseFloat(correctClean))) {
                        isCorrect = Math.abs(parseFloat(studentClean) - parseFloat(correctClean)) < 0.01;
                      }

                      const isExpanded = reviewQuestionIdx === idx;

                      return (
                        <div
                          key={q.id}
                          className={`bg-white border rounded-2xl overflow-hidden shadow-xs transition-all ${
                            isCorrect ? 'border-slate-200' : 'border-rose-200'
                          }`}
                          id={`exam_review_card_${q.id}`}
                        >
                          {/* Accordion header trigger */}
                          <div
                            onClick={() => setReviewQuestionIdx(isExpanded ? null : idx)}
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 select-none"
                            id={`exam_review_hdr_trigger_${idx}`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`w-7 h-7 text-xs font-extrabold rounded-lg flex items-center justify-center ${
                                isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                              }`}>
                                {idx + 1}
                              </span>
                              <div>
                                <span className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-xl">
                                  {q.questionText.replace(/\$/g, '').substring(0, 80)}...
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                  {q.section} · {q.categoryName} ({q.points}đ)
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                                isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {isCorrect ? 'ĐÚNG' : studentAns ? 'SAI' : 'CHƯA LÀM'}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>

                          {/* Accordion content body */}
                          {isExpanded && (
                            <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs text-slate-700 leading-relaxed" id={`exam_review_body_${idx}`}>
                              {/* Original Question text */}
                              <div>
                                <span className="font-bold text-slate-500 block mb-1">ĐỀ BÀI:</span>
                                <div className="font-semibold text-slate-900 bg-white p-4 rounded-xl border border-slate-200">
                                  <MathText>{q.questionText}</MathText>
                                </div>
                              </div>

                              {/* Student vs correct ans grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id={`exam_answers_review_grid_${idx}`}>
                                <div className="bg-white p-3 rounded-xl border border-slate-200">
                                  <span className="text-[10px] text-slate-400 font-bold block">Đáp án của bạn:</span>
                                  <span className={`text-xs font-bold block mt-1 ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {q.type === 'multiple_choice' && q.choices && studentAns
                                      ? `Phương án ${['A', 'B', 'C', 'D'][parseInt(studentAns)]}: ${q.choices[parseInt(studentAns)]}`
                                      : studentAns || '(Bỏ trống không điền)'}
                                  </span>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-slate-200">
                                  <span className="text-[10px] text-slate-400 font-bold block">Đáp án chính xác:</span>
                                  <span className="text-xs font-bold text-slate-850 block mt-1">
                                    {q.type === 'multiple_choice' && q.choices
                                      ? `Phương án ${['A', 'B', 'C', 'D'][parseInt(q.correctAnswer)]}: ${q.choices[parseInt(q.correctAnswer)]}`
                                      : q.correctAnswer}
                                  </span>
                                </div>
                              </div>

                              {/* Step-by-step detailed solution offline */}
                              <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2">
                                <span className="font-bold text-slate-900 block flex items-center gap-1">
                                  <FileText className="w-4 h-4 text-indigo-500" /> Hướng dẫn giải chi tiết:
                                </span>
                                <div className="leading-relaxed">
                                  <MathText>{q.explanation}</MathText>
                                </div>
                              </div>

                              {/* AI consultation drawer toggle */}
                              <div className="flex justify-end" id={`exam_ai_coach_trigger_${idx}`}>
                                <button
                                  onClick={() => {
                                    // Load AI tutor chat specifically for this question index
                                    setShowAiTutorExam(true);
                                  }}
                                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-indigo-150 shadow-xs"
                                  id={`consult_ai_exam_q_btn_${idx}`}
                                >
                                  <MessageSquare className="w-4 h-4" /> Hỏi Giáo sư AI về bài này
                                </button>
                              </div>

                              {/* Live AI chat drawer inside expanded results review */}
                              {showAiTutorExam && (
                                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 mt-4" id={`exam_live_ai_chat_panel_${idx}`}>
                                  <AiTutorChat
                                    questionText={q.questionText}
                                    choices={q.choices}
                                    correctAnswer={q.correctAnswer}
                                    explanation={q.explanation}
                                    categoryName={q.categoryName}
                                    onClose={() => setShowAiTutorExam(false)}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AI PROBLEM SOLVER */}
        {activeTab === 'solver' && (
          <div className="max-w-4xl mx-auto space-y-6" id="ai_solver_view_tab">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shadow-xs">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 tracking-tight text-sm md:text-base">Hỏi Đáp & Giải Toán Cùng AI Coach</h3>
                  <p className="text-slate-500 text-xs font-semibold mt-0.5">Dán bài toán ASMO của bạn để nhận giải đáp cặn kẽ 100%</p>
                </div>
              </div>

              {/* Paste Problem Box */}
              <div className="space-y-3" id="problem_textbox_wrapper">
                <label className="block text-xs text-slate-500 font-bold">Điền đề bài toán lớp 8 tại đây:</label>
                <textarea
                  value={customSolverInput}
                  onChange={(e) => setCustomSolverInput(e.target.value)}
                  placeholder="Ví dụ: Tính vận tốc trung bình một xe đi từ A đến B với v1 = 40 km/h, quay lại với v2 = 60 km/h..."
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-2xl text-xs text-slate-800 font-medium leading-relaxed"
                  id="custom_problem_textarea"
                />

                {/* Preloaded Template choices */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Đề mẫu thử nghiệm nhanh:</span>
                  <div className="flex flex-wrap gap-2" id="preloaded_templates">
                    {preloadedProblems.map((prob, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCustomSolverInput(prob.text)}
                        className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-250 hover:border-slate-350 text-slate-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                        id={`preloaded_template_btn_${idx}`}
                      >
                        {prob.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSolveCustom}
                    disabled={customSolverLoading || !customSolverInput.trim()}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md disabled:cursor-not-allowed"
                    id="solve_custom_trigger_btn"
                  >
                    {customSolverLoading ? 'AI Giáo Sư đang giải toán...' : 'Gửi AI Phân Tích & Giải Toán'}
                  </button>
                </div>
              </div>

              {/* Solutions Renderer */}
              {customSolverLoading && (
                <div className="py-16 text-center space-y-3" id="solver_loading_spinner">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-500 font-semibold animate-pulse">Giáo sư AI đang lập luận, phân tích lý thuyết và biên soạn lời giải...</p>
                </div>
              )}

              {customSolverResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-6"
                  id="custom_solver_results_pane"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" /> Báo Cáo Phân Tích Lời Giải Giáo Sư AI
                    </span>
                    <button
                      onClick={() => setShowCustomChat(true)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      id="launch_custom_chat_btn"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Hỏi sâu thêm bài này
                    </button>
                  </div>

                  {/* Math text solution block */}
                  <div className="text-slate-800 text-xs leading-relaxed space-y-4">
                    <MathText>{customSolverResult}</MathText>
                  </div>

                  {/* Live Tutor Chat Integration on Custom Solve */}
                  {showCustomChat && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 mt-6" id="custom_live_chat_panel">
                      <AiTutorChat
                        questionText={customSolverChatContext}
                        correctAnswer="Đáp án nằm trong giải thích chi tiết phía trên"
                        explanation={customSolverResult}
                        categoryName="Giải Toán AI Tự Do"
                        onClose={() => setShowCustomChat(false)}
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: STRATEGIES & FORMULAS */}
        {activeTab === 'tips' && (
          <div className="max-w-4xl mx-auto space-y-8" id="tips_view_tab">
            {/* Strategy 1 */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <h3 className="font-extrabold text-slate-900 tracking-tight text-sm md:text-base flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Bí kíp phòng thi ASMO & Phân bổ thời gian
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                ASMO Toán học Lớp 8 đòi hỏi sự linh hoạt trong tư duy số, hiểu bản chất hình phẳng và khả năng logic hóa nhanh. Dưới đây là chiến thuật làm bài chuẩn xác:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="strategy_tips_grid">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">1. Quy Tắc Vàng 3-4-5 Phân Bổ Giờ</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    - **Nhóm 1 (10 câu cơ bản):** Mục tiêu hoàn thành trong tối đa <strong className="text-slate-850">25 phút</strong>. Tránh làm dông dài, tính nhẩm sai số học cơ bản.
                    <br />
                    - **Nhóm 2 (10 câu ứng dụng):** Đầu tư <strong className="text-slate-850">50 phút</strong>. Vẽ hình nhanh ra nháp, viết rõ phương trình.
                    <br />
                    - **Nhóm 3 (5 câu vận dụng cao):** Dành trọn vẹn <strong className="text-slate-850">40 phút</strong> còn lại. 5 phút cuối để rà soát toàn bộ đáp án.
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">2. Đừng Để Trống Bất Kỳ Câu Nào</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    Kỳ thi ASMO <strong className="text-emerald-600">không có quy tắc trừ điểm khi làm sai</strong>. Nếu gặp câu khó chưa tìm được cách giải:
                    <br />
                    - Thử thay các chữ số nhỏ (0, 1, 2) xem có thỏa quy luật không.
                    <br />
                    - Dùng phương pháp loại trừ phương án không hợp lý về mặt hình học hay số học.
                    <br />
                    - Điền con số ước lượng logic thay vì để trống hoàn toàn.
                  </p>
                </div>
              </div>
            </div>

            {/* Strategy 2: Math cheat sheet */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 tracking-tight text-sm md:text-base flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-indigo-500" /> Bản đồ Công thức quan trọng bậc nhất
              </h3>
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed" id="formulas_roadmap_container">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-indigo-600">1. Số Học & Đại Số</h4>
                  <div className="mt-1 font-medium text-slate-600 flex flex-col space-y-2">
                    <MathText>{"- Tổng dãy số cách đều: $S_n = \\frac{n \\cdot (u_1 + u_n)}{2}$ trong đó số lượng số hạng $n = \\frac{u_n - u_1}{d} + 1$."}</MathText>
                    <MathText>{"- Biến đổi Telescoping: $\\frac{1}{n(n+1)} = \\frac{1}{n} - \\frac{1}{n+1}$ và $\\frac{k}{n(n+k)} = \\frac{1}{n} - \\frac{1}{n+k}$."}</MathText>
                    <MathText>{"- Trị tuyệt đối: $|A| = B \\Rightarrow A = B$ hoặc $A = -B$ (điều kiện $B \\ge 0$)"}</MathText>
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-indigo-600">2. Hệ Thức Lượng & Hình Học</h4>
                  <div className="mt-1 font-medium text-slate-600 flex flex-col space-y-2">
                    <MathText>{"- Định lý Pytago tam giác vuông: $a^2 = b^2 + c^2$."}</MathText>
                    <MathText>{"- Đường cao hạ xuống cạnh huyền: $h^2 = b' \\cdot c'$ và $b \\cdot c = a \\cdot h$."}</MathText>
                    <MathText>{"- Tính chất phân giác trong: $\\frac{BD}{CD} = \\frac{AB}{AC}$."}</MathText>
                    <MathText>{"- Tỉ số diện tích hai tam giác đồng dạng: $\\frac{S_1}{S_2} = k^2$ (với $k$ là tỉ số đồng dạng)."}</MathText>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-indigo-600">3. Vận tốc & Năng suất trung bình</h4>
                  <div className="mt-1 font-medium text-slate-600 flex flex-col space-y-2">
                    <MathText>{"- Vận tốc trung bình khứ hồi (cùng quãng đường S): $v_{tb} = \\frac{2 \\cdot v_1 \\cdot v_2}{v_1 + v_2}$."}</MathText>
                    <MathText>{"- Thời gian gặp nhau ngược chiều: $t = \\frac{S}{v_1 + v_2}$. Thời gian đuổi kịp cùng chiều: $t = \\frac{S}{v_1 - v_2}$."}</MathText>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn" id="settings_view_tab">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shadow-xs">
                  <Settings className="w-6 h-6 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 tracking-tight text-sm md:text-base">Cài đặt Trí Tuệ Nhân Tạo (Gemini AI)</h3>
                  <p className="text-slate-500 text-xs font-semibold mt-0.5">Cấu hình khóa bảo mật để sử dụng dịch vụ AI nâng cao</p>
                </div>
              </div>

              {/* API Info Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-650 leading-relaxed space-y-3 font-medium">
                <p>
                  Theo mặc định, hệ thống chạy trên tài nguyên dự phòng chung của máy chủ hoặc tự động chuyển sang <strong className="text-blue-600">Chế độ Sư phạm Ngoại tuyến</strong> siêu tốc khi hết hạn hạn ngạch hoặc kết nối không ổn định.
                </p>
                <p>
                  Để trải nghiệm toàn vẹn các tính năng cao cấp không giới hạn như:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                  <li>Tự động ra câu hỏi ngẫu nhiên hóa liên tục từ Gemini 3.8 Flash.</li>
                  <li>Phân tích chuyên sâu lý luận sai lầm của từng học viên.</li>
                  <li>Trò chuyện trực tiếp đa góc nhìn cùng <strong className="text-indigo-600">Cố vấn học tập Giáo sư AI</strong>.</li>
                </ul>
                <p>
                  Bạn hãy cung cấp mã khóa <code className="px-1.5 py-0.5 bg-slate-100 rounded text-rose-600 font-mono">GEMINI_API_KEY</code> cá nhân của mình.
                </p>
                <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-amber-800 text-[11px] flex gap-2">
                  <span className="text-base">🔒</span>
                  <div>
                    <span className="font-bold">Bảo mật tuyệt đối:</span> Khóa API của bạn được lưu hoàn toàn ở bộ nhớ cục bộ trên trình duyệt của riêng bạn (<code className="font-mono bg-amber-100/50 px-1 py-0.5 rounded">localStorage</code>), không bao giờ bị lưu giữ hoặc chia sẻ lên bất kỳ hệ thống lưu trữ bên thứ ba nào.
                  </div>
                </div>
              </div>

              {/* Form Input */}
              <div className="space-y-4" id="settings_form">
                <div className="space-y-1.5">
                  <label className="block text-xs text-slate-600 font-bold uppercase tracking-wider">Khóa GEMINI_API_KEY của bạn:</label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="Nhập khóa AI của bạn (Ví dụ: AIzaSy...)"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-250 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-xl text-xs font-mono text-slate-800 tracking-wider"
                    id="gemini_key_input"
                  />
                  <span className="block text-[10px] text-slate-400 font-semibold">Bạn có thể lấy khóa miễn phí tại trang Google AI Studio.</span>
                </div>

                <div className="pt-2 flex flex-wrap gap-3" id="settings_actions">
                  <button
                    onClick={() => {
                      localStorage.setItem('asmo_gemini_api_key', geminiApiKey.trim());
                      alert('Đã lưu cấu hình khóa API của bạn thành công! 🎉');
                      window.location.reload();
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-500/10"
                    id="save_settings_btn"
                  >
                    Lưu cấu hình
                  </button>
                  <button
                    onClick={() => {
                      setGeminiApiKey('');
                      localStorage.removeItem('asmo_gemini_api_key');
                      alert('Đã gỡ bỏ khóa API. Hệ thống sẽ quay lại sử dụng Chế độ Hệ thống mặc định. 🔐');
                      window.location.reload();
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-250"
                    id="clear_settings_btn"
                  >
                    Xóa khóa cấu hình
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div className="pt-4 border-t border-slate-150 flex items-center justify-between" id="connection_status_panel">
                <span className="text-xs text-slate-500 font-bold">Trạng thái cấu hình hiện tại:</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                  localStorage.getItem('asmo_gemini_api_key')
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${localStorage.getItem('asmo_gemini_api_key') ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
                  {localStorage.getItem('asmo_gemini_api_key')
                    ? 'Đã kích hoạt Chế độ AI Cá nhân (Premium ✨)'
                    : 'Đang dùng Chế độ AI Hệ thống / Ngoại tuyến'}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800 text-center" id="app_footer_section">
        <div className="max-w-7xl mx-auto space-y-4">
          <p className="text-sm font-bold text-slate-200">© 2026 ASMO Toán Lớp 8 - Hệ thống Hỗ trợ Học tập & Luyện thi</p>
          <p className="text-xs max-w-md mx-auto leading-relaxed">
            Hệ thống tự động biên soạn và cải tiến cấu trúc đề thi động bằng trí tuệ nhân tạo. Chúc các sĩ tử ôn tập chăm chỉ để gặt hái huy chương cao nhất! 🥇
          </p>
          <div className="pt-2">
            <span className="text-[10px] text-slate-600 uppercase tracking-widest font-black">Thiết kế bởi Google AI Studio Build</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
