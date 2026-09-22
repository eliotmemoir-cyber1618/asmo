/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MathCategory {
  id: string;
  section: 'Lý thuyết số' | 'Đại số' | 'Hình học' | 'Tư duy logic';
  name: string;
  description: string;
  keyKnowledge: string;
  commonMistakes: string;
  speedTip: string;
}

export interface Question {
  id: string;
  categoryId: string;
  categoryName: string;
  section: string;
  type: 'multiple_choice' | 'short_answer';
  points: number;
  questionText: string;
  choices?: string[]; // for multiple_choice
  correctAnswer: string; // index "0"-"3" for multiple_choice, or exact value for short_answer
  explanation: string;
  commonMistakes: string;
  difficulty: 'Nhóm 1' | 'Nhóm 2' | 'Nhóm 3';
}

export const SECTIONS = {
  NUMBER_THEORY: 'Lý thuyết số',
  ALGEBRA: 'Đại số',
  GEOMETRY: 'Hình học',
  LOGIC: 'Tư duy logic'
} as const;

export const CATEGORIES: MathCategory[] = [
  // PHẦN 1: LÝ THUYẾT SỐ
  {
    id: '1.1',
    section: 'Lý thuyết số',
    name: 'Chia hết & Tính chất chia hết',
    description: 'Tìm chữ số để số chia hết; chứng minh biểu thức chia hết; xét chữ số tận cùng.',
    keyKnowledge: 'Quy tắc chia hết cho 2, 3, 5, 9, 11. Các tính chất: Nếu a ⋮ d và b ⋮ d thì (a ± b) ⋮ d.',
    commonMistakes: 'Quên kiểm tra điều kiện chữ số hàng đầu phải khác 0 (1 ≤ a ≤ 9) hoặc quên điều kiện 0 ≤ x ≤ 9.',
    speedTip: 'Khi tìm số dư khi chia cho 9, chỉ cần tính tổng các chữ số và lấy số dư của tổng đó.'
  },
  {
    id: '1.2',
    section: 'Lý thuyết số',
    name: 'Ước, Bội, UCLN & BCNN',
    description: 'Tìm UCLN, BCNN; tìm số chia dư cùng số; giải bài toán thực tế sử dụng ước và bội.',
    keyKnowledge: 'a.b = UCLN(a,b) * BCNN(a,b). Nếu x chia dư r cho cả a và b thì (x - r) ⋮ BCNN(a,b).',
    commonMistakes: 'Nhầm lẫn giữa ước chung và bội chung; quên cộng/trừ số dư khi tìm số nhỏ nhất thỏa điều kiện.',
    speedTip: 'Nếu đề bài cho chia d1 dư r1, chia d2 dư r2, hãy cộng thêm hằng số để tạo ra tính chia hết đồng thời.'
  },
  {
    id: '1.3',
    section: 'Lý thuyết số',
    name: 'Số nguyên tố & Hợp số',
    description: 'Xác định số nguyên tố; tìm số nguyên tố thỏa điều kiện cho trước; phân tích thừa số nguyên tố.',
    keyKnowledge: 'Số nguyên tố chỉ có ước là 1 và chính nó. Để kiểm tra n là số nguyên tố, chỉ cần thử chia n cho các số nguyên tố p ≤ √n.',
    commonMistakes: 'Xem số 1 là số nguyên tố; không thử các số nguyên tố lớn hơn như 11, 13, 17.',
    speedTip: 'Mọi số nguyên tố lớn hơn 3 đều có dạng 6k ± 1. Dùng tính chất này để loại trừ nhanh.'
  },
  {
    id: '1.4',
    section: 'Lý thuyết số',
    name: 'Tìm số nguyên từ biểu thức',
    description: 'Tìm giá trị x nguyên để biểu thức phân thức A(x) nhận giá trị nguyên.',
    keyKnowledge: 'Phân tích A(x) = P(x) + R/(cx+d) với P(x) là đa thức, R là số dư hằng số. Để A(x) nguyên thì (cx+d) phải là ước của R.',
    commonMistakes: 'Liệt kê thiếu ước âm của R; quên thử lại điều kiện mẫu khác 0 hoặc x phải nguyên.',
    speedTip: 'Hãy dùng phương pháp tách hạng tử ở tử số sao cho chứa nhân tử của mẫu để chia rút gọn nhanh nhất.'
  },
  {
    id: '1.5',
    section: 'Lý thuyết số',
    name: 'Dãy số, Quy luật & Chu kỳ',
    description: 'Tìm số hạng thứ n, tổng dãy số viết theo quy luật, phát hiện chu kỳ lặp.',
    keyKnowledge: 'Dãy số cách đều: u_n = u_1 + (n-1)*d. Tổng S_n = n*(u_1 + u_n)/2. Dãy sai phân bậc hai hoặc tổng phân số rút gọn (telescoping sum).',
    commonMistakes: 'Tính sai số lượng số hạng (quên cộng 1: (cuối - đầu)/khoảng cách + 1).',
    speedTip: 'Với dãy phân số 1/[n(n+k)] = (1/k) * [1/n - 1/(n+k)]. Triệt tiêu các hạng tử ở giữa để tính tổng nhanh.'
  },

  // PHẦN 2: ĐẠI SỐ
  {
    id: '2.1',
    section: 'Đại số',
    name: 'Rút gọn biểu thức đa thức & phân thức',
    description: 'Sử dụng hằng đẳng thức, phân tích nhân tử để rút gọn các biểu thức chứa ẩn.',
    keyKnowledge: '7 Hằng đẳng thức đáng nhớ. Phân tích thành nhân tử: đặt nhân tử chung, nhóm hạng tử, tách hạng tử trung tử.',
    commonMistakes: 'Quên tìm điều kiện xác định (ĐKXĐ) của phân thức (mẫu thức phải khác 0) dẫn đến lấy nghiệm không hợp lệ.',
    speedTip: 'Nếu gặp bài tính giá trị biểu thức phức tạp, hãy thử thay thế các mối quan hệ biến trước (ví dụ thay x + y = a).'
  },
  {
    id: '2.2',
    section: 'Đại số',
    name: 'Phương trình bậc nhất & bậc hai một ẩn',
    description: 'Giải các phương trình bậc nhất, phương trình tích, phương trình chứa dấu giá trị tuyệt đối.',
    keyKnowledge: 'Đưa phương trình về dạng tích A(x).B(x) = 0. Phương trình chứa tuyệt đối |A| = B xét 2 trường hợp A = ±B với B ≥ 0.',
    commonMistakes: 'Giải phương trình chứa giá trị tuyệt đối nhưng quên so sánh điều kiện nghiệm hoặc biến đổi sai dấu.',
    speedTip: 'Nhẩm nghiệm của phương trình bậc hai ax² + bx + c = 0 bằng cách: nếu a+b+c=0 thì nghiệm là 1 và c/a.'
  },
  {
    id: '2.3',
    section: 'Đại số',
    name: 'Giá trị lớn nhất & nhỏ nhất',
    description: 'Tìm cực trị của biểu thức bậc hai đại số.',
    keyKnowledge: 'Biến đổi biểu thức về dạng A = a*(x - h)² + k. Nếu a > 0, GTNN của A là k khi x = h. Nếu a < 0, GTLN của A là k khi x = h.',
    commonMistakes: 'Quên xét điều kiện của biến x nếu đề bài giới hạn khoảng, hoặc kết luận giá trị đạt được mà không chỉ ra dấu "=" xảy ra khi nào.',
    speedTip: 'Tọa độ đỉnh parabol của y = ax² + bx + c đạt cực trị tại x = -b/(2a). Điểm cực trị bằng y(-b/2a).'
  },
  {
    id: '2.4',
    section: 'Đại số',
    name: 'Tỉ lệ thức & Dãy tỉ số bằng nhau',
    description: 'Ứng dụng dãy tỉ số bằng nhau để tính toán giá trị biểu thức và tìm các ẩn.',
    keyKnowledge: 'Nếu a/b = c/d thì a/b = c/d = (a ± c)/(b ± d). Đặt a/b = c/d = k để biểu diễn a = bk, c = dk.',
    commonMistakes: 'Khi cộng/trừ tử số mẫu số, quên đóng ngoặc dẫn đến sai dấu; áp dụng sai tỉ số khi mẫu thức chứa ẩn chưa biết bằng 0.',
    speedTip: 'Phương pháp đặt tỉ số bằng k là chiếc chìa khóa vạn năng cho hầu hết các bài tỉ lệ thức phức tạp.'
  },
  {
    id: '2.5',
    section: 'Đại số',
    name: 'Bài toán lập phương trình',
    description: 'Giải toán bằng cách lập phương trình: toán chuyển động, công việc chung - riêng, phần trăm, số học.',
    keyKnowledge: 'Các bước: Chọn ẩn và đặt điều kiện → Biểu diễn các đại lượng chưa biết → Lập phương trình → Giải và đối chiếu điều kiện.',
    commonMistakes: 'Không đồng nhất đơn vị đo (ví dụ km/h và phút); đặt điều kiện ẩn không chính xác (số người phải nguyên dương).',
    speedTip: 'Lập bảng tóm tắt 3 đại lượng (S-v-t hoặc Năng suất-Thời gian-Khối lượng) giúp trực quan hóa phương trình cực nhanh.'
  },

  // PHẦN 3: HÌNH HỌC
  {
    id: '3.1',
    section: 'Hình học',
    name: 'Tam giác đồng dạng',
    description: 'Chứng minh tam giác đồng dạng; ứng dụng tỉ số đồng dạng để tính cạnh, diện tích.',
    keyKnowledge: 'Ba trường hợp đồng dạng: c.c.c, c.g.c, g.g. Tỉ số diện tích bằng bình phương tỉ số đồng dạng (S1/S2 = k²).',
    commonMistakes: 'Viết sai thứ tự đỉnh tương ứng của hai tam giác đồng dạng dẫn đến thiết lập tỉ số cạnh bị sai.',
    speedTip: 'Tìm các góc bằng nhau (đặc biệt là góc chung và góc vuông) để chứng minh đồng dạng theo trường hợp Góc-Góc (g.g).'
  },
  {
    id: '3.2',
    section: 'Hình học',
    name: 'Định lý Thales & Đường phân giác',
    description: 'Áp dụng định lý Thales trong tam giác, hình thang và tính chất đường phân giác trong.',
    keyKnowledge: 'Thales: Nếu MN // BC thì AM/AB = AN/AC = MN/BC. Phân giác AD của góc A chia cạnh BC thành hai đoạn DB/DC = AB/AC.',
    commonMistakes: 'Áp dụng hệ quả Thales nhưng lấy sai đoạn thẳng tương ứng (nhầm giữa AM/MB và AM/AB).',
    speedTip: 'Đường phân giác chia cạnh đối diện tỉ lệ thuận với hai cạnh kề. Luôn ghi nhớ hệ thức DB/DC = AB/AC.'
  },
  {
    id: '3.3',
    section: 'Hình học',
    name: 'Tam giác vuông & Hệ thức lượng',
    description: 'Tính độ dài đoạn thẳng trong tam giác vuông bằng định lý Pytago và các hệ thức hình chiếu.',
    keyKnowledge: 'Pytago: a² = b² + c². Hệ thức lượng: h² = b\'.c\'; b² = a.b\'; b.c = a.h; 1/h² = 1/b² + 1/c².',
    commonMistakes: 'Áp dụng hệ thức lượng cho tam giác không vuông hoặc đường kẻ AH không vuông góc với BC.',
    speedTip: 'Các bộ ba số Pytago phổ biến: (3, 4, 5), (5, 12, 13), (8, 15, 17), (7, 24, 25). Học thuộc giúp làm bài cực nhanh.'
  },
  {
    id: '3.4',
    section: 'Hình học',
    name: 'Diện tích hình phẳng & Chia ghép hình',
    description: 'Tính diện tích tam giác, tứ giác, hình phức tạp bằng cách chia nhỏ hoặc ghép hình phụ.',
    keyKnowledge: 'Diện tích tam giác S = 1/2 * b * h. Diện tích hình thang S = 1/2 * (a+b) * h. Tỉ số diện tích hai tam giác chung chiều cao bằng tỉ số hai đáy.',
    commonMistakes: 'Quên chia 2 khi tính diện tích tam giác hoặc hình thang; tính chồng chéo diện tích các phần ghép.',
    speedTip: 'Nếu hai tam giác có chung đáy (hoặc chung chiều cao), tỉ số diện tích của chúng bằng tỉ số chiều cao (hoặc tỉ số đáy) tương ứng.'
  },

  // PHẦN 4: TƯ DUY LOGIC - TỔ HỢP
  {
    id: '4.1',
    section: 'Tư duy logic',
    name: 'Bài toán chu kỳ & Chữ số tận cùng',
    description: 'Tìm ngày thứ n, chữ số thứ n sau dấu phẩy, chữ số tận cùng của lũy thừa lớn.',
    keyKnowledge: 'Xác định chu kỳ tuần hoàn k. Chia n cho k: Số dư r chính là vị trí trong chu kỳ (r=0 ứng với vị trí thứ k). Chữ số tận cùng lũy thừa lặp theo chu kỳ tối đa là 4.',
    commonMistakes: 'Xác định sai độ dài chu kỳ lặp; khi n chia hết cho k thì kết luận là phần tử đầu tiên thay vì phần tử cuối cùng.',
    speedTip: 'Chữ số tận cùng của a^n tuần hoàn với chu kỳ 4. Ví dụ: 3^1=3, 3^2=9, 3^3=7, 3^4=1, chu kỳ là {3, 9, 7, 1}.'
  },
  {
    id: '4.2',
    section: 'Tư duy logic',
    name: 'Quy tắc đếm & Tổ hợp',
    description: 'Tính số cách chọn, số cách sắp xếp, đếm hình vẽ, đếm số thỏa điều kiện.',
    keyKnowledge: 'Quy tắc cộng (các phương án độc lập). Quy tắc nhân (các công đoạn liên tiếp). Công thức tổ hợp đơn giản chọn k từ n phần tử.',
    commonMistakes: 'Đếm trùng lặp (quên chia cho số hoán vị nếu thứ tự chọn không quan trọng); đếm sót các trường hợp biên.',
    speedTip: 'Khi đếm số hình chữ nhật trong lưới cỡ m x n, công thức là [m*(m+1)/2] * [n*(n+1)/2].'
  },
  {
    id: '4.3',
    section: 'Tư duy logic',
    name: 'Toán Tổng - Hiệu - Tỉ',
    description: 'Giải các bài toán tư duy logic về phân chia, tuổi tác, tỉ trọng dựa trên sơ đồ đoạn thẳng.',
    keyKnowledge: 'Số lớn = (Tổng + Hiệu)/2; Số bé = (Tổng - Hiệu)/2. Giá trị 1 phần = Tổng / (Tổng số phần).',
    commonMistakes: 'Xác định sai hiệu số khi thời gian thay đổi (ví dụ: hiệu số tuổi luôn không đổi theo thời gian nhưng học sinh thường trừ nhầm).',
    speedTip: 'Vẽ sơ đồ đoạn thẳng ra nháp luôn là cách nhanh nhất để trực quan hóa mối liên hệ toán học giữa các đại lượng.'
  },
  {
    id: '4.4',
    section: 'Tư duy logic',
    name: 'Chuyển động & Năng suất',
    description: 'Bài toán chuyển động ngược chiều, cùng chiều, vận tốc trung bình và năng suất lao động.',
    keyKnowledge: 'Thời gian gặp nhau (ngược chiều) t = S / (v1 + v2). Thời gian đuổi kịp (cùng chiều) t = S / (v1 - v2). Vận tốc trung bình khứ hồi: v_tb = 2*v1*v2 / (v1+v2).',
    commonMistakes: 'Tính vận tốc trung bình bằng trung bình cộng hai vận tốc (v_tb = (v1+v2)/2 là SAI hoàn toàn).',
    speedTip: 'Vận tốc trung bình bằng Tổng Quãng Đường chia cho Tổng Thời Gian. Luôn tính thời gian từng chặng trước.'
  }
];

// Helper to seed random numbers for deterministic generation based on seed
class SeedRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = Math.abs(seed) || 1;
  }
  // Returns 0 to 1
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
  // Returns integer between min and max inclusive
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  // Pick random element from array
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

/**
 * Generates a dynamic math question based on the category and a seed.
 */
export function generateQuestion(categoryId: string, seed: number = Math.floor(Math.random() * 100000)): Question {
  const rand = new SeedRandom(seed);
  const category = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  
  let type: 'multiple_choice' | 'short_answer' = rand.next() > 0.5 ? 'multiple_choice' : 'short_answer';
  let points = 3;
  let difficulty: 'Nhóm 1' | 'Nhóm 2' | 'Nhóm 3' = 'Nhóm 1';

  // Distribute points and difficulty based on category ID and seed
  const catInt = parseInt(categoryId.replace('.', ''));
  const difficultyFactor = (catInt * seed) % 10;
  if (difficultyFactor < 4) {
    difficulty = 'Nhóm 1';
    points = 3;
  } else if (difficultyFactor < 8) {
    difficulty = 'Nhóm 2';
    points = 4;
  } else {
    difficulty = 'Nhóm 3';
    points = 6;
    type = 'short_answer'; // Heavy synthesis is usually short answer in ASMO
  }

  let questionText = '';
  let choices: string[] = [];
  let correctAnswer = '';
  let explanation = '';
  let commonMistakesStr = category.commonMistakes;

  switch (categoryId) {
    case '1.1': { // Chia hết
      const n1 = rand.nextInt(3, 7);
      const digitOptions = [3, 9, 8, 11];
      const divisor = rand.pick(digitOptions);
      if (divisor === 9) {
        const a = rand.nextInt(2, 6);
        const b = rand.nextInt(1, 8);
        const c = rand.nextInt(0, 9);
        const sum_digits = a + b + c + 4;
        // Find x so that a + b + c + 4 + x is divisible by 9
        let x = (9 - (sum_digits % 9)) % 9;
        questionText = `Tìm chữ số $x$ thích hợp từ $0$ đến $9$ sao cho số năm chữ số $\\overline{${a}${b}x${c}4}$ chia hết cho $9$.`;
        correctAnswer = x.toString();
        explanation = `Để số $\\overline{${a}${b}x${c}4}$ chia hết cho $9$, tổng các chữ số của nó phải chia hết cho $9$.
- Bước 1: Tính tổng các chữ số đã biết: $S = ${a} + ${b} + x + ${c} + 4 = ${a+b+c+4} + x$.
- Bước 2: Ta cần $(${a+b+c+4} + x) \\vdots 9$. Vì $0 \\le x \\le 9$, ta tìm được chữ số duy nhất thỏa mãn là $x = ${x}$.
- Kết quả: $x = ${x}$.`;
        if (type === 'multiple_choice') {
          const wrong1 = (x + 3) % 10;
          const wrong2 = (x + 5) % 10;
          const wrong3 = (x + 7) % 10;
          const uniqueChoices = Array.from(new Set([x, wrong1, wrong2, wrong3])).map(v => v.toString());
          while (uniqueChoices.length < 4) {
            uniqueChoices.push(((parseInt(uniqueChoices[uniqueChoices.length-1]) + 1) % 10).toString());
          }
          choices = uniqueChoices.sort((a,b) => parseInt(a) - parseInt(b));
          correctAnswer = choices.indexOf(x.toString()).toString();
        }
      } else if (divisor === 3) {
        const a = rand.nextInt(1, 9);
        const b = rand.nextInt(0, 9);
        const sum_digits = a + b + 5;
        // Find all x to make a + b + 5 + x divisible by 3
        let x_list: number[] = [];
        for (let i = 0; i <= 9; i++) {
          if ((sum_digits + i) % 3 === 0) x_list.push(i);
        }
        questionText = `Có bao nhiêu chữ số $x$ thỏa mãn để số $\\overline{${a}${b}5x}$ chia hết cho $3$?`;
        correctAnswer = x_list.length.toString();
        explanation = `Để số $\\overline{${a}${b}5x}$ chia hết cho $3$, tổng các chữ số phải chia hết cho $3$.
- Tổng chữ số là: $${a} + ${b} + 5 + x = ${a+b+5} + x$.
- Để tổng này chia hết cho $3$, ta tìm được các chữ số $x$ là: ${x_list.join(', ')}.
- Số lượng các chữ số $x$ thỏa mãn là: $${x_list.length}$.`;
        if (type === 'multiple_choice') {
          choices = ['2', '3', '4', '5'];
          correctAnswer = choices.indexOf(x_list.length.toString()).toString();
        }
      } else {
        const a = rand.nextInt(1, 8);
        const b = rand.nextInt(0, 8);
        const rem = rand.nextInt(1, 8);
        questionText = `Biết số $\\overline{${a}x${b}}$ chia cho $9$ dư $${rem}$. Tìm chữ số $x$.`;
        let x = 0;
        for (let i = 0; i <= 9; i++) {
          if ((a + i + b) % 9 === rem) {
            x = i;
            break;
          }
        }
        correctAnswer = x.toString();
        explanation = `Một số chia cho 9 dư bao nhiêu thì tổng các chữ số của nó chia cho 9 cũng dư bấy nhiêu.
- Ta có tổng các chữ số: $S = ${a} + x + ${b} = ${a+b} + x$.
- Để số đó chia $9$ dư $${rem}$, tổng chữ số $S = ${a+b} + x$ phải chia $9$ dư $${rem}$.
- Với $0 \\le x \\le 9$, ta tìm được chữ số $x = ${x}$ (vì $S = ${a+b+x} = ${a+b+x}$ chia $9$ dư $${rem}$).`;
        if (type === 'multiple_choice') {
          choices = [x.toString(), ((x + 2)%10).toString(), ((x + 4)%10).toString(), ((x + 7)%10).toString()].sort();
          correctAnswer = choices.indexOf(x.toString()).toString();
        }
      }
      break;
    }
    case '1.2': { // UCLN BCNN
      const factor1 = rand.pick([2, 3, 5]);
      const factor2 = rand.pick([7, 11, 13]);
      const a_mult = rand.nextInt(2, 5);
      const b_mult = rand.nextInt(2, 5);
      const common = factor1 * factor2;
      const num1 = common * a_mult;
      const num2 = common * b_mult;
      
      // Calculate gcd & lcm
      const gcd = (x: number, y: number): number => y === 0 ? x : gcd(y, x % y);
      const g = gcd(num1, num2);
      const l = (num1 * num2) / g;

      const subType = rand.pick(['gcd_lcm', 'remainder']);
      if (subType === 'gcd_lcm') {
        questionText = `Tìm tổng của Ước chung lớn nhất (UCLN) và Bội chung nhỏ nhất (BCNN) của hai số $${num1}$ và $${num2}$.`;
        const ans = g + l;
        correctAnswer = ans.toString();
        explanation = `Để tìm tổng UCLN và BCNN của $${num1}$ và $${num2}$:
- Bước 1: Phân tích thừa số nguyên tố hoặc dùng thuật toán Euclid:
  + $${num1} = ${num1}$
  + $${num2} = ${num2}$
- Bước 2: Tìm UCLN: $\\text{UCLN}(${num1}, ${num2}) = ${g}$.
- Bước 3: Tìm BCNN: $\\text{BCNN}(${num1}, ${num2}) = ${l}$.
- Bước 4: Tính tổng: $${g} + ${l} = ${ans}$.`;
        if (type === 'multiple_choice') {
          choices = [ans.toString(), (ans - 10).toString(), (ans + 12).toString(), (ans * 2).toString()].sort((x, y) => parseInt(x) - parseInt(y));
          correctAnswer = choices.indexOf(ans.toString()).toString();
        }
      } else {
        // Find smallest number that leaves remainder r when divided by p1 and p2
        const p1 = rand.pick([5, 6, 8]);
        const p2 = rand.pick([9, 10, 12]);
        const r = rand.nextInt(2, 4);
        const l_p = (p1 * p2) / gcd(p1, p2);
        const ans = l_p + r;

        questionText = `Tìm số tự nhiên nhỏ nhất khác $0$, biết số đó chia cho $${p1}$ dư $${r}$ và chia cho $${p2}$ cũng dư $${r}$.`;
        correctAnswer = ans.toString();
        explanation = `Gọi số tự nhiên cần tìm là $N$.
- Vì $N$ chia cho $${p1}$ dư $${r}$ và chia cho $${p2}$ dư $${r}$ nên $(N - ${r})$ chia hết cho cả $${p1}$ và $${p2}$.
- Để $N$ là số tự nhiên nhỏ nhất thì $(N - ${r})$ phải là Bội chung nhỏ nhất (BCNN) của $${p1}$ và $${p2}$.
- Ta có $\\text{BCNN}(${p1}, ${p2}) = ${l_p}$.
- Vậy $N - ${r} = ${l_p} \\Rightarrow N = ${l_p} + ${r} = ${ans}$.`;
        if (type === 'multiple_choice') {
          choices = [ans.toString(), (ans - r).toString(), (l_p * 2 + r).toString(), (ans + 5).toString()].sort((x, y) => parseInt(x) - parseInt(y));
          correctAnswer = choices.indexOf(ans.toString()).toString();
        }
      }
      break;
    }
    case '1.3': { // Số nguyên tố - Hợp số
      const primeList = [17, 19, 23, 29, 31, 37, 41, 43, 47];
      const p = rand.pick(primeList);
      
      const subType = rand.pick(['find_p', 'count_primes']);
      if (subType === 'find_p') {
        questionText = `Tìm số nguyên tố $p$ nhỏ nhất sao cho biểu thức $p + ${rand.pick([10, 12, 14])}$ cũng là một số nguyên tố.`;
        const add = rand.pick([10, 12, 14]);
        const isPrime = (n: number) => {
          if (n < 2) return false;
          for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
          return true;
        };
        let ans = 2;
        for (let i = 2; i < 100; i++) {
          if (isPrime(i) && isPrime(i + add)) {
            ans = i;
            break;
          }
        }
        questionText = `Tìm số nguyên tố $p$ nhỏ nhất sao cho $p + ${add}$ cũng là một số nguyên tố.`;
        correctAnswer = ans.toString();
        explanation = `Để tìm số nguyên tố $p$ nhỏ nhất sao cho $p + ${add}$ là số nguyên tố, ta kiểm tra các số nguyên tố từ nhỏ đến lớn:
- Với $p = 2$: $2 + ${add} = ${2 + add}$. Kiểm tra xem số này có phải là số nguyên tố không.
  + ${isPrime(2 + add) ? `Vì $${2 + add}$ là số nguyên tố nên số nguyên tố nhỏ nhất thỏa mãn là $p = 2$.` : `Vì $${2 + add}$ không phải là số nguyên tố (hợp số) nên ta xét số tiếp theo.`}
- ${!isPrime(2 + add) ? `Với $p = 3$: $3 + ${add} = ${3 + add}$. ${isPrime(3 + add) ? `Vì $${3 + add}$ là số nguyên tố nên số nguyên tố nhỏ nhất thỏa mãn là $p = 3$.` : `Vì $${3 + add}$ không phải là số nguyên tố, ta xét tiếp.`}` : ''}
- Kết quả tìm được là $p = ${ans}$.`;
        if (type === 'multiple_choice') {
          choices = ['2', '3', '5', '7'];
          correctAnswer = choices.indexOf(ans.toString()).toString();
        }
      } else {
        const start = rand.nextInt(10, 20);
        const end = start + rand.nextInt(15, 25);
        const isPrime = (n: number) => {
          if (n < 2) return false;
          for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
          return true;
        };
        let count = 0;
        let listPrimes: number[] = [];
        for (let i = start; i <= end; i++) {
          if (isPrime(i)) {
            count++;
            listPrimes.push(i);
          }
        }
        questionText = `Có bao nhiêu số nguyên tố nằm trong khoảng từ $${start}$ đến $${end}$?`;
        correctAnswer = count.toString();
        explanation = `Để đếm số nguyên tố trong khoảng $[${start}, ${end}]$, ta liệt kê và kiểm tra tính nguyên tố của từng số:
- Các số nguyên tố tìm được trong khoảng này là: ${listPrimes.join(', ')}.
- Tổng số lượng các số nguyên tố là: $${count}$ số.`;
        if (type === 'multiple_choice') {
          choices = [(count - 1).toString(), count.toString(), (count + 1).toString(), (count + 2).toString()].sort((x,y)=>parseInt(x)-parseInt(y));
          correctAnswer = choices.indexOf(count.toString()).toString();
        }
      }
      break;
    }
    case '1.4': { // Tìm số nguyên từ biểu thức
      const a = rand.nextInt(2, 4);
      const b = rand.nextInt(1, 15);
      const d = rand.nextInt(1, 4); // x - d or x + d
      const sign = rand.pick(['-', '+']);
      
      const valD = sign === '-' ? -d : d;
      // Expression: (a*x + b)/(x + valD) = a + (b - a*valD)/(x + valD)
      const numerator_rem = b - a * valD;
      
      // We want numerator_rem to be a non-zero integer with nice divisors
      let rem = numerator_rem;
      if (rem === 0) rem = rand.nextInt(4, 12);
      
      questionText = `Có bao nhiêu số nguyên $x$ để biểu thức $A = \\frac{${a}x + ${b}}{x ${sign} ${d}}$ nhận giá trị nguyên?`;
      
      // Calculate divisors of rem
      const getDivisors = (n: number) => {
        const div: number[] = [];
        const absN = Math.abs(n);
        for (let i = 1; i <= absN; i++) {
          if (absN % i === 0) {
            div.push(i);
            div.push(-i);
          }
        }
        return div;
      };
      
      const divisors = getDivisors(rem);
      const ans = divisors.length; // Number of valid integers x (since x + valD = div -> x = div - valD, and all div lead to unique x)
      
      correctAnswer = ans.toString();
      explanation = `Ta thực hiện biến đổi biểu thức $A$ như sau:
$A = \\frac{${a}x + ${b}}{x ${sign} ${d}} = \\frac{${a}(x ${sign} ${d}) + (${b - a*valD})}{x ${sign} ${d}} = ${a} + \\frac{${rem}}{x ${sign} ${d}}$.
- Để $A$ nhận giá trị nguyên với $x$ nguyên thì phân số $\\frac{${rem}}{x ${sign} ${d}}$ phải là số nguyên.
- Suy ra $x ${sign} ${d}$ phải là ước của $${rem}$.
- Các ước của $${rem}$ bao gồm các số: ${divisors.join(', ')} (gồm cả ước dương và ước âm).
- Với mỗi giá trị ước, ta tìm được duy nhất một giá trị nguyên $x$. Do đó, số lượng số nguyên $x$ thỏa mãn là $${ans}$ giá trị.`;
      if (type === 'multiple_choice') {
        choices = [(ans - 2).toString(), ans.toString(), (ans + 2).toString(), (ans + 4).toString()].sort((x,y) => parseInt(x) - parseInt(y));
        correctAnswer = choices.indexOf(ans.toString()).toString();
      }
      break;
    }
    case '1.5': { // Dãy số - Quy luật - Chu kỳ
      const subType = rand.pick(['arithmetic', 'telescoping']);
      if (subType === 'arithmetic') {
        const u1 = rand.nextInt(2, 10);
        const d = rand.nextInt(3, 7);
        const n = rand.nextInt(30, 60);
        const un = u1 + (n - 1) * d;
        const sum = (n * (u1 + un)) / 2;

        questionText = `Cho dãy số cách đều: $${u1}, ${u1+d}, ${u1+2*d}, ${u1+3*d}, \\dots$. Tìm số hạng thứ $${n}$ của dãy số này.`;
        correctAnswer = un.toString();
        explanation = `Đây là một dãy số cách đều với:
- Số hạng đầu tiên: $u_1 = ${u1}$.
- Khoảng cách giữa hai số hạng liên tiếp: $d = ${d}$.
- Để tìm số hạng thứ $n = ${n}$, ta áp dụng công thức: $u_n = u_1 + (n - 1) \\cdot d$.
- Thay số vào: $u_{${n}} = ${u1} + (${n} - 1) \\cdot ${d} = ${u1} + ${n-1} \\cdot ${d} = ${un}$.`;
        if (type === 'multiple_choice') {
          choices = [un.toString(), (un - d).toString(), (un + d).toString(), (un + 10).toString()].sort((x,y)=>parseInt(x)-parseInt(y));
          correctAnswer = choices.indexOf(un.toString()).toString();
        }
      } else {
        const n = rand.pick([10, 20, 50, 99]);
        const sumText = `\\frac{1}{1\\cdot 2} + \\frac{1}{2\\cdot 3} + \\frac{1}{3\\cdot 4} + \\dots + \\frac{1}{${n}\\cdot ${n+1}}`;
        questionText = `Tính giá trị của tổng sau: $S = ${sumText}$. (Hãy điền kết quả dưới dạng phân số tối giản tử/mẫu, ví dụ: 4/5)`;
        const correctFraction = `${n}/${n+1}`;
        correctAnswer = correctFraction;
        explanation = `Ta áp dụng công thức biến đổi hạng tử tổng quát:
$\\frac{1}{k(k+1)} = \\frac{1}{k} - \\frac{1}{k+1}$.
- Áp dụng vào tổng $S$:
$S = \\left(1 - \\frac{1}{2}\\right) + \\left(\\frac{1}{2} - \\frac{1}{3}\\right) + \\dots + \\left(\\frac{1}{${n}} - \\frac{1}{${n+1}}\\right)$.
- Sau khi triệt tiêu các số hạng đối nhau ở giữa, ta được:
$S = 1 - \\frac{1}{${n+1}} = \\frac{${n}}{${n+1}}$.`;
        if (type === 'multiple_choice') {
          choices = [`${n}/${n+1}`, `${n-1}/${n}`, `${n+1}/${n+2}`, `1/${n}`].sort();
          correctAnswer = choices.indexOf(correctFraction).toString();
        }
      }
      break;
    }
    case '2.1': { // Rút gọn biểu thức
      const a = rand.nextInt(2, 5);
      const b = rand.nextInt(2, 6);
      // Expression like (x + a)^2 - (x - a)^2 = 4ax
      questionText = `Rút gọn biểu thức sau: $A = (x + ${a})^2 - (x - ${a})^2$.`;
      const ansTerm = `${4*a}x`;
      correctAnswer = ansTerm;
      explanation = `Sử dụng hằng đẳng thức đáng nhớ để rút gọn biểu thức:
- Cách 1: Khai triển bình phương:
  $A = (x^2 + ${2*a}x + ${a*a}) - (x^2 - ${2*a}x + ${a*a})$
  $A = x^2 + ${2*a}x + ${a*a} - x^2 + ${2*a}x - ${a*a} = ${4*a}x$.
- Cách 2: Sử dụng hằng đẳng thức hiệu hai bình phương $a^2 - b^2 = (a-b)(a+b)$:
  $A = [(x + ${a}) - (x - ${a})][(x + ${a}) + (x - ${a})]$
  $A = [${2*a}] \\cdot [2x] = ${4*a}x$.`;
      if (type === 'multiple_choice') {
        choices = [`${4*a}x`, `${2*a}x`, `2x^2 + ${2*a*a}`, `${4*a}x^2`].sort();
        correctAnswer = choices.indexOf(ansTerm).toString();
      }
      break;
    }
    case '2.2': { // Phương trình bậc nhất & bậc hai một ẩn
      const x1 = rand.nextInt(1, 5);
      const x2 = rand.nextInt(6, 10);
      const b = -(x1 + x2);
      const c = x1 * x2;
      // x^2 + b x + c = 0
      const bSign = b < 0 ? `- ${Math.abs(b)}` : `+ ${b}`;
      questionText = `Tìm nghiệm nguyên nhỏ nhất của phương trình: $x^2 ${bSign}x + ${c} = 0$.`;
      correctAnswer = x1.toString();
      explanation = `Để giải phương trình $x^2 ${bSign}x + ${c} = 0$, ta phân tích vế trái thành nhân tử:
- Ta tìm hai số có tổng là $${x1+x2}$ và tích là $${c}$. Hai số đó là $${x1}$ và $${x2}$.
- Phương trình viết lại thành: $(x - ${x1})(x - ${x2}) = 0$.
- Nghiệm của phương trình là: $x = ${x1}$ hoặc $x = ${x2}$.
- Nghiệm nguyên nhỏ nhất là $x = ${x1}$.`;
      if (type === 'multiple_choice') {
        choices = [x1.toString(), x2.toString(), (-x1).toString(), (-x2).toString()].sort((x,y)=>parseInt(x)-parseInt(y));
        correctAnswer = choices.indexOf(x1.toString()).toString();
      }
      break;
    }
    case '2.3': { // GTLN GTNN
      const a = rand.nextInt(2, 6);
      const b = rand.nextInt(5, 15);
      // f(x) = x^2 - 2ax + b = (x-a)^2 + b - a^2
      const minVal = b - a*a;
      questionText = `Tìm giá trị nhỏ nhất (GTNN) của biểu thức $P(x) = x^2 - ${2*a}x + ${b}$.`;
      correctAnswer = minVal.toString();
      explanation = `Để tìm giá trị nhỏ nhất của biểu thức bậc hai, ta đưa về dạng bình phương cộng một hằng số:
- Biến đổi: $P(x) = x^2 - 2 \\cdot x \\cdot ${a} + ${a}^2 + ${b} - ${a}^2$.
- Nhóm hằng đẳng thức: $P(x) = (x - ${a})^2 + (${b - a*a})$.
- Vì $(x - ${a})^2 \\ge 0$ với mọi $x$, nên $P(x) \\ge ${minVal}$.
- Dấu đẳng thức xảy ra khi $x = ${a}$.
- Vậy Giá trị nhỏ nhất của biểu thức là $${minVal}$.`;
      if (type === 'multiple_choice') {
        choices = [minVal.toString(), (minVal - 4).toString(), (minVal + 5).toString(), b.toString()].sort((x,y)=>parseInt(x)-parseInt(y));
        correctAnswer = choices.indexOf(minVal.toString()).toString();
      }
      break;
    }
    case '2.4': { // Tỉ lệ thức
      const xRatio = rand.nextInt(2, 4);
      const yRatio = rand.nextInt(4, 6);
      const zRatio = rand.nextInt(6, 8);
      const k = rand.nextInt(2, 5);
      const sum = xRatio * k + yRatio * k + zRatio * k;
      
      questionText = `Cho tỉ lệ thức $\\frac{x}{${xRatio}} = \\frac{y}{${yRatio}} = \\frac{z}{${zRatio}}$ và biết rằng $x + y + z = ${sum}$. Tìm giá trị của ẩn $y$.`;
      const ans = yRatio * k;
      correctAnswer = ans.toString();
      explanation = `Áp dụng tính chất của dãy tỉ số bằng nhau:
- Ta có: $\\frac{x}{${xRatio}} = \\frac{y}{${yRatio}} = \\frac{z}{${zRatio}} = \\frac{x + y + z}{${xRatio} + ${yRatio} + ${zRatio}}$.
- Thay số liệu vào ta được: $\\frac{x + y + z}{${xRatio + yRatio + zRatio}} = \\frac{${sum}}{${xRatio + yRatio + zRatio}} = ${k}$.
- Từ đó ta tìm được các ẩn:
  + $x = ${xRatio} \\cdot ${k} = ${xRatio*k}$
  + $y = ${yRatio} \\cdot ${k} = ${ans}$
  + $z = ${zRatio} \\cdot ${k} = ${zRatio*k}$
- Vậy giá trị của $y$ là $${ans}$.`;
      if (type === 'multiple_choice') {
        choices = [(xRatio*k).toString(), ans.toString(), (zRatio*k).toString(), (ans + 4).toString()].sort((x,y)=>parseInt(x)-parseInt(y));
        correctAnswer = choices.indexOf(ans.toString()).toString();
      }
      break;
    }
    case '2.5': { // Bài toán lập phương trình
      const speedGo = rand.nextInt(10, 15) * 4; // e.g. 40, 48, 60
      const speedBack = speedGo - rand.pick([8, 10, 12]);
      const dist = speedGo * 2; // say 2 hours
      const timeBack = dist / speedBack;
      const totalHours = 2 + timeBack;
      
      questionText = `Một người đi xe máy từ địa điểm A đến B với vận tốc $${speedGo}$ km/h. Khi quay về từ B về A, người đó đi với vận tốc $${speedBack}$ km/h nên thời gian về nhiều hơn thời gian đi là $30$ phút. Tính quãng đường AB (km).`;
      let s = 0;
      // S/speedBack - S/speedGo = 0.5 -> S * (speedGo - speedBack)/(speedGo * speedBack) = 0.5 -> S = 0.5 * speedGo * speedBack / (speedGo - speedBack)
      s = Math.round(0.5 * speedGo * speedBack / (speedGo - speedBack));
      
      correctAnswer = s.toString();
      explanation = `Gọi quãng đường AB là $S$ (km, $S > 0$).
- Thời gian đi từ A đến B là: $t_{đi} = \\frac{S}{${speedGo}}$ (giờ).
- Thời gian về từ B về A là: $t_{về} = \\frac{S}{${speedBack}}$ (giờ).
- Đổi $30$ phút = $0,5$ giờ. Theo đề bài, thời gian về nhiều hơn thời gian đi là $30$ phút nên ta có phương trình:
  $\\frac{S}{${speedBack}} - \\frac{S}{${speedGo}} = 0,5$.
- Quy đồng mẫu thức và giải phương trình:
  $S \\cdot \\left(\\frac{1}{${speedBack}} - \\frac{1}{${speedGo}}\\right) = 0,5$
  $S \\cdot \\left(\\frac{${speedGo} - ${speedBack}}{${speedGo * speedBack}}\\right) = 0,5$
  $S = 0,5 \\cdot \\frac{${speedGo * speedBack}}{${speedGo - speedBack}} = ${s}$ (km).
- Kết quả: Quãng đường AB dài $${s}$ km.`;
      if (type === 'multiple_choice') {
        choices = [s.toString(), (s - 10).toString(), (s + 15).toString(), (s * 1.5).toString()].sort((x,y)=>parseInt(x)-parseInt(y));
        correctAnswer = choices.indexOf(s.toString()).toString();
      }
      break;
    }
    case '3.1': { // Tam giác đồng dạng
      const k = rand.nextInt(2, 3);
      const s1 = rand.nextInt(10, 20);
      const s2 = s1 * k * k;
      questionText = `Cho $\\triangle ABC$ đồng dạng với $\\triangle DEF$ theo tỉ số đồng dạng $k = ${k}$. Biết diện tích $\\triangle ABC$ là $${s1}$ $\\text{cm}^2$. Tính diện tích $\\triangle DEF$ ($\\text{cm}^2$).`;
      correctAnswer = s2.toString();
      explanation = `Ta áp dụng tính chất của hai tam giác đồng dạng:
- Khi hai tam giác đồng dạng với nhau theo tỉ số đồng dạng $k$, tỉ số diện tích của chúng sẽ bằng bình phương tỉ số đồng dạng.
- Ta có: $\\frac{S_{DEF}}{S_{ABC}} = k^2 = ${k}^2 = ${k*k}$.
- Do đó: $S_{DEF} = S_{ABC} \\cdot k^2 = ${s1} \\cdot ${k*k} = ${s2}$ $\\text{cm}^2$.`;
      if (type === 'multiple_choice') {
        choices = [(s1*k).toString(), s2.toString(), (s1*k*k + 10).toString(), (s1+k*k).toString()].sort((x,y)=>parseInt(x)-parseInt(y));
        correctAnswer = choices.indexOf(s2.toString()).toString();
      }
      break;
    }
    case '3.2': { // Định lý Thales - Phân giác
      const ab = rand.nextInt(6, 10);
      const ac = rand.nextInt(12, 16);
      const bc = rand.nextInt(10, 14);
      // DB / DC = AB / AC = ab / ac -> DB = bc * ab / (ab + ac)
      // Let's make numbers nice
      // e.g. AB=6, AC=12, BC=9 -> DB/DC = 1/2 -> DB = 3, DC = 6
      // Let's use nice integers
      const ab_nice = 8;
      const ac_nice = 12;
      const bc_nice = 10;
      // DB/DC = 8/12 = 2/3 -> DB = 10 * 2/5 = 4, DC = 6
      questionText = `Cho $\\triangle ABC$ có đường phân giác trong $AD$ của góc $A$ ($D$ thuộc $BC$). Biết $AB = ${ab_nice}$ cm, $AC = ${ac_nice}$ cm và $BC = ${bc_nice}$ cm. Tính độ dài đoạn thẳng $BD$ (cm).`;
      const bd = 4;
      correctAnswer = '4';
      explanation = `Áp dụng tính chất đường phân giác trong tam giác:
- Đường phân giác $AD$ chia cạnh đối diện $BC$ thành hai đoạn thẳng tỉ lệ với hai cạnh kề:
  $\\frac{BD}{CD} = \\frac{AB}{AC}$.
- Thay số vào ta được: $\\frac{BD}{CD} = \\frac{${ab_nice}}{${ac_nice}} = \\frac{2}{3}$.
- Từ đó ta suy ra: $BD = \\frac{2}{2+3} \\cdot BC = \\frac{2}{5} \\cdot ${bc_nice} = 4$ cm.`;
      if (type === 'multiple_choice') {
        choices = ['3', '4', '5', '6'];
        correctAnswer = choices.indexOf('4').toString();
      }
      break;
    }
    case '3.3': { // Tam giác vuông hệ thức lượng
      const multiplier = rand.pick([1, 2, 3]);
      const leg1 = 3 * multiplier;
      const leg2 = 4 * multiplier;
      const hyp = 5 * multiplier;
      const h = (leg1 * leg2) / hyp; // altitude

      questionText = `Cho tam giác $ABC$ vuông tại $A$ có hai cạnh góc vuông $AB = ${leg1}$ cm và $AC = ${leg2}$ cm. Tính độ dài đường cao $AH$ hạ từ đỉnh vuông góc xuống cạnh huyền $BC$ (cm). (Điền kết quả dưới dạng số thập phân, ví dụ: 2.4)`;
      const ans = h.toFixed(1);
      correctAnswer = parseFloat(ans).toString(); // remove trailing zero
      explanation = `Áp dụng các định lý trong tam giác vuông:
- Bước 1: Tính cạnh huyền $BC$ bằng định lý Pytago:
  $BC = \\sqrt{AB^2 + AC^2} = \\sqrt{${leg1}^2 + ${leg2}^2} = \\sqrt{${leg1*leg1} + ${leg2*leg2}} = ${hyp}$ cm.
- Bước 2: Sử dụng hệ thức lượng liên quan đến đường cao $AH$:
  $AB \\cdot AC = BC \\cdot AH \\Rightarrow AH = \\frac{AB \\cdot AC}{BC}$.
- Thay số vào: $AH = \\frac{${leg1} \\cdot ${leg2}}{${hyp}} = \\frac{${leg1*leg2}}{${hyp}} = ${ans}$ cm.`;
      if (type === 'multiple_choice') {
        choices = [ans, (h - 0.5).toFixed(1), (h + 0.6).toFixed(1), (hyp/2).toFixed(1)].sort();
        correctAnswer = choices.indexOf(ans).toString();
      }
      break;
    }
    case '3.4': { // Diện tích chia ghép hình
      const a = rand.nextInt(6, 12);
      const s_square = a * a;
      const s_circle = Math.round(3.14 * (a/2) * (a/2));
      const s_shaded = s_square - s_circle;

      questionText = `Một hình vuông có cạnh bằng $${a}$ cm. Một hình tròn nội tiếp khít bên trong hình vuông này. Tính diện tích phần còn lại của hình vuông nằm ngoài hình tròn (phần tô đậm) theo cm$^2$. (Lấy $\\pi \\approx 3,14$, làm tròn kết quả đến hàng đơn vị).`;
      correctAnswer = s_shaded.toString();
      explanation = `Ta tính diện tích từng phần rồi thực hiện phép trừ để tìm diện tích phần tô đậm:
- Bước 1: Tính diện tích hình vuông $S_{vuông} = a^2 = ${a}^2 = ${s_square}$ $\\text{cm}^2$.
- Bước 2: Hình tròn nội tiếp hình vuông có đường kính bằng cạnh hình vuông, tức là $d = ${a}$ cm. Do đó, bán kính hình tròn là $r = \\frac{${a}}{2} = ${a/2}$ cm.
- Bước 3: Diện tích hình tròn $S_{tròn} = \\pi \\cdot r^2 \\approx 3,14 \\cdot (${a/2})^2 \\approx ${s_circle}$ $\\text{cm}^2$.
- Bước 4: Diện tích phần tô đậm là: $S_{tô} = S_{vuông} - S_{tròn} = ${s_square} - ${s_circle} \\approx ${s_shaded}$ $\\text{cm}^2$.`;
      if (type === 'multiple_choice') {
        choices = [s_shaded.toString(), (s_shaded + 5).toString(), (s_shaded - 3).toString(), s_circle.toString()].sort((x,y)=>parseInt(x)-parseInt(y));
        correctAnswer = choices.indexOf(s_shaded.toString()).toString();
      }
      break;
    }
    case '4.1': { // Bài toán chu kỳ
      const lastDigitOptions = [3, 7, 8, 2];
      const base = rand.pick(lastDigitOptions);
      const exp = rand.nextInt(2023, 2027);
      
      let cycle: number[] = [];
      let temp = 1;
      for (let i = 1; i <= 10; i++) {
        temp = (temp * base) % 10;
        if (cycle.includes(temp)) break;
        cycle.push(temp);
      }
      const k = cycle.length;
      const rem = exp % k;
      const ans = rem === 0 ? cycle[k - 1] : cycle[rem - 1];

      questionText = `Tìm chữ số tận cùng của biểu thức $P = ${base}^{${exp}}$.`;
      correctAnswer = ans.toString();
      explanation = `Để tìm chữ số tận cùng của $${base}^{${exp}}$, ta xét chu kỳ lặp các chữ số tận cùng của lũy thừa cơ số $${base}$:
- Ta tính chữ số tận cùng của các lũy thừa của $${base}$:
${cycle.map((v, i) => `  + $${base}^{${i+1}}$ có tận cùng là $${v}$`).join('\n')}
- Chu kỳ tuần hoàn của chữ số tận cùng là $k = ${k}$ với các chữ số: $\\{${cycle.join(', ')}\\}$.
- Ta lấy số mũ chia cho độ dài chu kỳ: $${exp} : ${k} = ${Math.floor(exp/k)}$ dư $${rem}$.
- Vì số dư là $${rem}$, chữ số tận cùng tương ứng với vị trí thứ $${rem === 0 ? k : rem}$ trong chu kỳ, đó là chữ số $${ans}$.`;
      if (type === 'multiple_choice') {
        choices = ['1', '3', '7', '9'].sort();
        if (!choices.includes(ans.toString())) {
          choices[0] = ans.toString();
          choices.sort();
        }
        correctAnswer = choices.indexOf(ans.toString()).toString();
      }
      break;
    }
    case '4.2': { // Quy tắc đếm - Tổ hợp
      const students = rand.nextInt(7, 10);
      const select = 3;
      // Combination nCr = n! / (r! * (n-r)!)
      const fact = (num: number): number => num <= 1 ? 1 : num * fact(num - 1);
      const ans = fact(students) / (fact(select) * fact(students - select));

      questionText = `Trong một đội tuyển toán học của trường có $${students}$ học sinh xuất sắc. Giáo viên cần chọn ra $3$ học sinh để thành lập ban đại diện tham gia kỳ thi giao lưu ASMO. Có bao nhiêu cách chọn khác nhau?`;
      correctAnswer = ans.toString();
      explanation = `Đây là bài toán chọn tổ hợp không tính thứ tự (chọn $3$ học sinh từ $${students}$ học sinh):
- Ta sử dụng công thức tổ hợp chập $3$ của $${students}$:
  $C_{${students}}^3 = \\frac{${students}!}{3! \\cdot (${students} - 3)!} = \\frac{${students} \\cdot ${students-1} \\cdot ${students-2}}{3 \\cdot 2 \\cdot 1}$.
- Tính toán: $C_{${students}}^3 = \\frac{${students * (students-1) * (students-2)}}{6} = ${ans}$ cách chọn.`;
      if (type === 'multiple_choice') {
        choices = [ans.toString(), (ans - 10).toString(), (ans + 15).toString(), (ans * 2).toString()].sort((x,y)=>parseInt(x)-parseInt(y));
        correctAnswer = choices.indexOf(ans.toString()).toString();
      }
      break;
    }
    case '4.3': { // Tổng hiệu tỉ
      const sum = rand.nextInt(100, 200);
      const ratio_num = 2;
      const ratio_den = 3;
      // Let's make sure sum is divisible by 5 (ratio_num + ratio_den)
      const sum_nice = Math.round(sum / 5) * 5;
      const small = (sum_nice * ratio_num) / (ratio_num + ratio_den);
      const large = sum_nice - small;

      questionText = `Hai ngăn sách của thư viện có tổng cộng $${sum_nice}$ cuốn sách. Biết rằng số sách ngăn dưới bằng $\\frac{2}{3}$ số sách ngăn trên. Tìm số lượng sách ở ngăn dưới.`;
      correctAnswer = small.toString();
      explanation = `Đây là bài toán Tìm hai số khi biết Tổng và Tỉ số của chúng:
- Tỉ số sách ngăn dưới và ngăn trên là $2 : 3$.
- Tổng số phần bằng nhau là: $2 + 3 = 5$ phần.
- Giá trị của một phần là: $${sum_nice} : 5 = ${sum_nice/5}$ cuốn sách.
- Số sách ở ngăn dưới (tương ứng với 2 phần) là: $${sum_nice/5} \\cdot 2 = ${small}$ cuốn sách.
- Số sách ở ngăn trên là: $${sum_nice/5} \\cdot 3 = ${large}$ cuốn sách.`;
      if (type === 'multiple_choice') {
        choices = [small.toString(), large.toString(), (small - 10).toString(), (large + 10).toString()].sort((x,y)=>parseInt(x)-parseInt(y));
        correctAnswer = choices.indexOf(small.toString()).toString();
      }
      break;
    }
    case '4.4': { // Chuyển động - Năng suất
      const v1 = rand.nextInt(30, 45); // e.g. 40
      const v2 = rand.nextInt(50, 60); // e.g. 60
      // Round trip average speed = 2 * v1 * v2 / (v1 + v2)
      const v_avg = (2 * v1 * v2) / (v1 + v2);
      
      const v1_nice = 40;
      const v2_nice = 60;
      const v_avg_nice = 48; // 2 * 40 * 60 / 100 = 48

      questionText = `Một ô tô đi từ thành phố A đến thành phố B với vận tốc $${v1_nice}$ km/h, sau đó quay lập tức trở về A từ B với vận tốc $${v2_nice}$ km/h. Tính vận tốc trung bình (km/h) của ô tô trên cả quãng đường đi và về.`;
      correctAnswer = '48';
      explanation = `Vận tốc trung bình được tính bằng tổng quãng đường chia cho tổng thời gian di chuyển, KHÔNG PHẢI trung bình cộng của hai vận tốc.
- Gọi quãng đường AB là $S$ (km).
- Thời gian đi là: $t_1 = \\frac{S}{${v1_nice}}$ (giờ).
- Thời gian về là: $t_2 = \\frac{S}{${v2_nice}}$ (giờ).
- Tổng quãng đường cả đi lẫn về là: $2S$ (km).
- Tổng thời gian di chuyển: $t = t_1 + t_2 = S \\cdot \\left(\\frac{1}{${v1_nice}} + \\frac{1}{${v2_nice}}\\right) = S \\cdot \\frac{${v1_nice + v2_nice}}{${v1_nice * v2_nice}} = S \\cdot \\frac{100}{2400} = \\frac{S}{24}$.
- Vận tốc trung bình: $v_{tb} = \\frac{2S}{t} = \\frac{2S}{\\frac{S}{24}} = 2 \\cdot 24 = 48$ km/h.`;
      if (type === 'multiple_choice') {
        choices = ['48', '50', '52', '45'];
        correctAnswer = choices.indexOf('48').toString();
      }
      break;
    }
    default: {
      questionText = `Một số $A$ chia cho $5$ dư $2$ và chia cho $9$ dư $2$. Tìm số tự nhiên nhỏ nhất khác $0$ thỏa mãn điều kiện trên.`;
      correctAnswer = '47';
      explanation = `Số đó trừ đi 2 chia hết cho cả 5 và 9, nên số đó trừ đi 2 là bội chung nhỏ nhất của 5 và 9 (bằng 45). Vậy số đó là 45 + 2 = 47.`;
      choices = ['47', '45', '92', '52'];
      correctAnswer = '0';
    }
  }

  return {
    id: `q_${categoryId}_${seed}`,
    categoryId,
    categoryName: category.name,
    section: category.section,
    type,
    points,
    questionText,
    choices: type === 'multiple_choice' ? choices : undefined,
    correctAnswer,
    explanation,
    commonMistakes: commonMistakesStr,
    difficulty
  };
}

/**
 * Generates a full 25-question ASMO test using static seeds for consistency.
 */
export function generateAsmoTest(seed: number = Math.floor(Math.random() * 100000)): Question[] {
  const rand = new SeedRandom(seed);
  const testQuestions: Question[] = [];

  // ASMO structure:
  // - Group 1: Questions 1-10 (3 pts/question, fundamental) -> Nhóm 1
  // - Group 2: Questions 11-20 (4 pts/question, application) -> Nhóm 2
  // - Group 3: Questions 21-25 (6 pts/question, synthesis) -> Nhóm 3

  // Shuffle categories to get a random spread of 25 questions across the 18 categories
  const categoryPool = [...CATEGORIES];
  const selectedCategories: MathCategory[] = [];

  // Make sure we have at least 1 from each category, then fill up to 25
  for (let i = 0; i < 25; i++) {
    const cat = categoryPool[i % categoryPool.length];
    selectedCategories.push(cat);
  }

  // Generate for each group
  for (let i = 0; i < 25; i++) {
    const cat = selectedCategories[i];
    const qSeed = seed + i * 1337;
    const q = generateQuestion(cat.id, qSeed);

    // Overwrite points, difficulty, and type according to their position in ASMO structure
    if (i < 10) {
      q.difficulty = 'Nhóm 1';
      q.points = 3;
    } else if (i < 20) {
      q.difficulty = 'Nhóm 2';
      q.points = 4;
    } else {
      q.difficulty = 'Nhóm 3';
      q.points = 6;
      q.type = 'short_answer'; // Section C synthesis is often numerical fill-in
    }

    testQuestions.push(q);
  }

  return testQuestions;
}
