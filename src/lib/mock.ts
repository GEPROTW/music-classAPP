import type { ClassGroup, Course, DB, Lesson, Order, PayMethod, Student, Teacher } from './types'
import { addDays, today, weekday } from './date'

const teachers: Teacher[] = [
  { id: 't1', name: '林雅婷', title: '鋼琴主任', instruments: ['鋼琴', '樂理'], phone: '0912-345-678', emoji: '👩‍🏫' },
  { id: 't2', name: '陳柏翰', title: '爵士鼓老師', instruments: ['爵士鼓', '木箱鼓'], phone: '0922-111-222', emoji: '🥁' },
  { id: 't3', name: '黃詩涵', title: '聲樂老師', instruments: ['聲樂', '流行歌唱'], phone: '0933-222-333', emoji: '🎤' },
  { id: 't4', name: '張家豪', title: '吉他老師', instruments: ['吉他', '烏克麗麗'], phone: '0955-333-444', emoji: '🎸' },
  { id: 't5', name: '吳佩珊', title: '幼兒音樂老師', instruments: ['奧福', '鋼琴'], phone: '0966-444-555', emoji: '🧸' },
  { id: 't6', name: '劉冠廷', title: '國樂老師', instruments: ['二胡', '古箏'], phone: '0978-555-666', emoji: '🎻' },
]

const courses: Course[] = [
  { id: 'c1', name: '約翰‧湯普森鋼琴', category: '鋼琴', age: '6 歲以上', minutes: 50, pricePerLesson: 900, packLessons: 12, cover: '🎹', color: '#ffe08a', desc: '經典入門鋼琴教材，循序建立讀譜與手型。' },
  { id: 'c2', name: '拜爾鋼琴教程', category: '鋼琴', age: '6 歲以上', minutes: 50, pricePerLesson: 900, packLessons: 12, cover: '🎼', color: '#ffc9a8', desc: '台灣最普及的鋼琴基礎教材之一。' },
  { id: 'c3', name: '車爾尼練習曲', category: '鋼琴', age: '9 歲以上', minutes: 50, pricePerLesson: 1100, packLessons: 12, cover: '🎶', color: '#e58f7b', desc: '強化手指獨立與技巧，銜接檢定與比賽曲目。' },
  { id: 'c4', name: '芬貝爾基礎鋼琴', category: '鋼琴', age: '5 歲以上', minutes: 45, pricePerLesson: 850, packLessons: 12, cover: '🪽', color: '#bfe4ff', desc: 'Faber Piano Adventures，結合樂理與演奏。' },
  { id: 'c5', name: 'YAMAHA 音樂檢定', category: '檢定', age: '不限', minutes: 50, pricePerLesson: 1200, packLessons: 10, cover: '🏅', color: '#a8c8ff', desc: '山葉音樂能力檢定（演奏／和聲／視唱）考前輔導。' },
  { id: 'c6', name: 'ABRSM 英國皇家檢定', category: '檢定', age: '不限', minutes: 60, pricePerLesson: 1400, packLessons: 10, cover: '👑', color: '#c9b8ff', desc: '英國皇家音樂檢定 Grade 1–8 術科與樂理。' },
  { id: 'c7', name: '全國學生音樂比賽培訓', category: '檢定', age: '國小以上', minutes: 60, pricePerLesson: 1600, packLessons: 8, cover: '🏆', color: '#ffd36e', desc: '教育部全國學生音樂比賽指定曲精修。' },
  { id: 'c8', name: '樂芽音樂律動（奧福）', category: '幼兒啟蒙', age: '3–6 歲', minutes: 45, pricePerLesson: 600, packLessons: 12, cover: '🌱', color: '#b8f0c2', desc: '奧福教學法，律動、節奏樂器與歌唱遊戲。' },
  { id: 'c9', name: 'Baby Bops 親子音樂', category: '幼兒啟蒙', age: '1.5–3 歲', minutes: 40, pricePerLesson: 550, packLessons: 10, cover: '🦊', color: '#ffe0f0', desc: '家長陪同參與的親子音樂遊戲課。' },
  { id: 'c10', name: '熊貓學琴（團體鋼琴）', category: '鋼琴', age: '5–8 歲', minutes: 60, pricePerLesson: 650, packLessons: 12, cover: '🐼', color: '#d8d0ff', desc: '4–6 人小班電鋼琴課，培養合奏與節奏感。' },
  { id: 'c11', name: '鼓動星球爵士鼓', category: '爵士鼓', age: '7 歲以上', minutes: 50, pricePerLesson: 1000, packLessons: 12, cover: '🥁', color: '#ffcf9e', desc: '從基本打點到流行歌曲伴奏。' },
  { id: 'c12', name: '星光唱響流行歌唱', category: '聲樂', age: '10 歲以上', minutes: 50, pricePerLesson: 1000, packLessons: 12, cover: '🌟', color: '#e8c3ff', desc: '發聲、共鳴、咬字，挑戰華語／台語流行歌。' },
  { id: 'c13', name: '唱響風華古典聲樂', category: '聲樂', age: '12 歲以上', minutes: 60, pricePerLesson: 1300, packLessons: 10, cover: '🎙️', color: '#ff9c9c', desc: '義大利藝術歌曲與台灣藝術歌曲。' },
  { id: 'c14', name: '烏克麗麗自彈自唱', category: '吉他／烏克麗麗', age: '8 歲以上', minutes: 50, pricePerLesson: 750, packLessons: 10, cover: '🌺', color: '#a8ecd9', desc: '三個月學會自彈自唱十首歌。' },
  { id: 'c15', name: '木吉他入門', category: '吉他／烏克麗麗', age: '10 歲以上', minutes: 50, pricePerLesson: 900, packLessons: 10, cover: '🎸', color: '#9fd4ff', desc: '和弦、刷扣與指彈基礎。' },
  { id: 'c16', name: '二胡／古箏國樂', category: '國樂', age: '8 歲以上', minutes: 50, pricePerLesson: 1000, packLessons: 10, cover: '🏮', color: '#ffb7a1', desc: '傳統國樂器，演奏台灣民謠與經典國樂曲。' },
  { id: 'c17', name: '小提琴啟蒙', category: '弦樂', age: '5 歲以上', minutes: 45, pricePerLesson: 1000, packLessons: 12, cover: '🎻', color: '#f5d6a8', desc: '鈴木教學法入門，建立音準與運弓。' },
]

const classes: ClassGroup[] = [
  { id: 'g1', name: '熊貓學琴 A 班', courseId: 'c10', teacherId: 't5', weekday: 3, time: '16:30', room: '團體教室', capacity: 6 },
  { id: 'g2', name: '樂芽律動 週六班', courseId: 'c8', teacherId: 't5', weekday: 6, time: '10:00', room: '律動教室', capacity: 8 },
  { id: 'g3', name: '鼓動星球 初級班', courseId: 'c11', teacherId: 't2', weekday: 5, time: '18:30', room: '鼓室', capacity: 3 },
  { id: 'g4', name: '烏克麗麗 成人班', courseId: 'c14', teacherId: 't4', weekday: 2, time: '19:30', room: 'B 教室', capacity: 8 },
  { id: 'g5', name: 'Baby Bops 親子班', courseId: 'c9', teacherId: 't5', weekday: 6, time: '14:00', room: '律動教室', capacity: 6 },
]

const names = [
  ['王小安', '王媽媽'], ['李品妍', '李爸爸'], ['陳宥辰', '陳媽媽'], ['林芊妤', '林媽媽'], ['張睿恩', '張爸爸'],
  ['黃子晴', '黃媽媽'], ['吳承翰', '吳媽媽'], ['劉語彤', '劉爸爸'], ['蔡宇軒', '蔡媽媽'], ['楊沛恩', '楊媽媽'],
  ['許晨希', '許爸爸'], ['鄭安琪', '鄭媽媽'], ['謝柏宇', '謝媽媽'], ['郭采潔', '郭爸爸'], ['洪以恩', '洪媽媽'],
  ['曾品睿', '曾媽媽'], ['周芷若', '周媽媽'], ['蘇奕辰', '蘇爸爸'], ['游心妍', '游媽媽'], ['賴彥廷', '賴媽媽'],
]
const plan: [string, string, string | undefined][] = [
  ['c1', 't1', undefined], ['c10', 't5', 'g1'], ['c11', 't2', 'g3'], ['c12', 't3', undefined], ['c8', 't5', 'g2'],
  ['c5', 't1', undefined], ['c14', 't4', 'g4'], ['c10', 't5', 'g1'], ['c11', 't2', 'g3'], ['c4', 't1', undefined],
  ['c8', 't5', 'g2'], ['c13', 't3', undefined], ['c15', 't4', undefined], ['c9', 't5', 'g5'], ['c7', 't1', undefined],
  ['c16', 't6', undefined], ['c10', 't5', 'g1'], ['c17', 't1', undefined], ['c2', 't1', undefined], ['c14', 't4', 'g4'],
]

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function createMockDB(): DB {
  const rnd = seeded(20260928)
  const t = today()
  const students: Student[] = names.map(([name, parent], i) => {
    const [courseId, teacherId, classId] = plan[i]
    const total = [12, 12, 24, 10, 12][i % 5]
    return {
      id: 's' + (i + 1),
      name,
      age: courseId === 'c9' ? 2 : courseId === 'c8' ? 5 : 7 + Math.floor(rnd() * 9),
      parent,
      phone: `09${Math.floor(10 + rnd() * 89)}-${Math.floor(100 + rnd() * 899)}-${Math.floor(100 + rnd() * 899)}`,
      lineBound: rnd() > 0.2,
      courseId,
      teacherId,
      classId,
      lessonsTotal: total,
      lessonsUsed: i % 6 === 0 ? total - 1 : Math.floor(rnd() * (total - 2)),
      points: Math.floor(rnd() * 800) + 40,
      joinedAt: addDays(t, -Math.floor(rnd() * 400) - 10),
      status: i === 19 ? 'trial' : i === 17 ? 'paused' : 'active',
    }
  })

  const lessons: Lesson[] = []
  const rooms = ['A 教室', 'B 教室', '琴房 1', '琴房 2', '鼓室']
  for (let d = -30; d <= 14; d++) {
    const date = addDays(t, d)
    const wd = weekday(date)
    if (wd === 1) continue // 週一公休
    for (const g of classes) {
      if (g.weekday !== wd) continue
      lessons.push({
        id: `L${lessons.length}`,
        date, time: g.time, courseId: g.courseId, teacherId: g.teacherId, room: g.room,
        studentIds: students.filter((s) => s.classId === g.id).map((s) => s.id),
        status: d < 0 ? (rnd() > 0.92 ? 'leave' : 'done') : 'scheduled',
        kind: 'class',
      })
    }
    students.filter((s) => !s.classId).forEach((s, idx) => {
      if ((idx + wd) % 6 !== 0) return
      const hour = 14 + ((idx * 3 + wd) % 7)
      lessons.push({
        id: `L${lessons.length}`,
        date, time: `${hour}:00`, courseId: s.courseId, teacherId: s.teacherId, room: rooms[idx % rooms.length],
        studentIds: [s.id],
        status: d < 0 ? (rnd() > 0.9 ? 'leave' : 'done') : 'scheduled',
        kind: s.status === 'trial' ? 'trial' : 'private',
      })
    })
  }

  const methods: PayMethod[] = ['LINE Pay', '街口支付', '信用卡', 'ATM 轉帳', '現金', '台灣Pay']
  const orders: Order[] = []
  for (let d = -29; d <= 0; d++) {
    const n = rnd() > 0.55 ? Math.floor(rnd() * 3) + 1 : 0
    for (let k = 0; k < n; k++) {
      const s = students[Math.floor(rnd() * students.length)]
      const c = courses.find((c) => c.id === s.courseId)!
      orders.push({
        id: 'o' + (orders.length + 1),
        date: addDays(t, d),
        studentId: s.id,
        item: `${c.name}｜${c.packLessons} 堂`,
        amount: c.pricePerLesson * c.packLessons,
        method: methods[Math.floor(rnd() * methods.length)],
        invoice: `AB-${String(10000000 + Math.floor(rnd() * 89999999))}`,
        carrier: rnd() > 0.5 ? '/ABC1234' : undefined,
        status: rnd() > 0.93 ? 'pending' : 'paid',
      })
    }
  }

  return {
    schoolName: '樂動音樂教室',
    licenseNo: '北市教終字第 5678 號',
    role: 'admin',
    currentStudentId: 's1',
    students,
    teachers,
    courses,
    classes,
    lessons,
    orders,
    leads: [
      { id: 'l1', name: '蕭宇恩', parent: '蕭媽媽', phone: '0911-222-333', source: 'LINE 官方帳號', interest: '鋼琴', stage: 'new', nextFollow: t, note: '小一，想週六上課', owner: '林雅婷' },
      { id: 'l2', name: '簡若曦', parent: '簡爸爸', phone: '0928-765-432', source: 'Google 地圖', interest: '爵士鼓', stage: 'contacted', nextFollow: t, note: '已傳課表，待回覆', owner: '陳柏翰' },
      { id: 'l3', name: '江承恩', parent: '江媽媽', phone: '0937-111-000', source: 'Instagram', interest: '流行歌唱', stage: 'trial', nextFollow: addDays(t, 2), note: '已約週三 17:00 體驗課', owner: '黃詩涵' },
      { id: 'l4', name: '方語晴', parent: '方媽媽', phone: '0955-876-123', source: '招生活動', interest: '奧福律動', stage: 'new', nextFollow: addDays(t, -1), note: '寒假揪團報名，3 人團差 1 人', owner: '吳佩珊' },
      { id: 'l5', name: '邱子謙', parent: '邱爸爸', phone: '0986-333-777', source: '朋友介紹', interest: '木吉他', stage: 'won', nextFollow: addDays(t, 7), note: '已報名 10 堂', owner: '張家豪' },
      { id: 'l6', name: '施沛妤', parent: '施媽媽', phone: '0919-000-555', source: 'Facebook', interest: '古箏', stage: 'lost', nextFollow: addDays(t, 30), note: '時間無法配合，下學期再問', owner: '劉冠廷' },
      { id: 'l7', name: '葉晨瑋', parent: '葉媽媽', phone: '0975-246-135', source: '路過詢問', interest: 'ABRSM 檢定', stage: 'contacted', nextFollow: addDays(t, 1), note: '目前 Grade 3，想考 Grade 5', owner: '林雅婷' },
    ],
    works: [
      { id: 'w1', studentId: 's1', title: '小奏鳴曲 Op.36 No.1', instrument: '鋼琴', date: addDays(t, -3), likes: 32, teacherScore: 92, emoji: '🎹' },
      { id: 'w2', studentId: 's3', title: '〈晴天〉鼓譜伴奏', instrument: '爵士鼓', date: addDays(t, -5), likes: 58, teacherScore: 88, emoji: '🥁' },
      { id: 'w3', studentId: 's4', title: '〈望春風〉', instrument: '聲樂', date: addDays(t, -8), likes: 41, teacherScore: 95, emoji: '🎤' },
      { id: 'w4', studentId: 's7', title: '〈小幸運〉自彈自唱', instrument: '烏克麗麗', date: addDays(t, -2), likes: 27, emoji: '🌺' },
      { id: 'w5', studentId: 's16', title: '〈雨夜花〉二胡獨奏', instrument: '二胡', date: addDays(t, -12), likes: 66, teacherScore: 90, emoji: '🏮' },
      { id: 'w6', studentId: 's15', title: '全國學生音樂比賽指定曲', instrument: '鋼琴', date: addDays(t, -1), likes: 73, teacherScore: 96, emoji: '🏆' },
    ],
    checkins: Array.from({ length: 12 }, (_, i) => ({
      date: addDays(t, -i - 1),
      minutes: [20, 30, 15, 45, 30, 25, 30, 20, 40, 30, 15, 30][i],
      item: ['音階練習', '哈農 No.1', '樂曲練習', '視唱練耳', '樂理練習'][i % 5],
    })).filter((_, i) => i !== 4),
    pet: { name: '音音', kind: '🐣', level: 3, exp: 40, hunger: 55, mood: 70, lastFed: addDays(t, -1) },
    campaigns: [
      { id: 'p1', title: '寒假學霸養成計畫｜21 天', type: '揪團優惠', price: 2990, original: 4500, groupSize: 3, joined: 22, deadline: addDays(t, 20), cover: '❄️', color: '#7fb2ff' },
      { id: 'p2', title: '暑假檢定衝刺營', type: '營隊', price: 6800, original: 8800, joined: 14, deadline: addDays(t, 45), cover: '🏕️', color: '#ffb35c' },
      { id: 'p3', title: '成人聲樂蛻變課程', type: '早鳥限定', price: 3600, original: 4800, joined: 9, deadline: addDays(t, 10), cover: '🎻', color: '#8e9aaf' },
      { id: 'p4', title: '爵士鼓 1 對 1 體驗課', type: '體驗課', price: 299, original: 1000, joined: 37, deadline: addDays(t, 60), cover: '🥁', color: '#ff7f7f' },
      { id: 'p5', title: '推薦好友各得 2 堂課', type: '推薦有禮', price: 0, original: 0, joined: 18, deadline: addDays(t, 90), cover: '🎁', color: '#c78bff' },
    ],
    contests: [
      { id: 'k1', title: '全國學生音樂比賽（校內初選）', organizer: '樂動音樂教室', signupStart: addDays(t, -5), signupEnd: addDays(t, 15), fee: 0, applicants: 12, cover: '🏆', color: '#2d3a8c' },
      { id: 'k2', title: '第八屆「春之聲」兒童歌唱大賽', organizer: '樂動音樂教室 × 社區發展協會', signupStart: addDays(t, -2), signupEnd: addDays(t, 30), fee: 500, applicants: 46, cover: '🎤', color: '#b8860b' },
      { id: 'k3', title: '線上鋼琴大賽：台灣民謠組', organizer: '樂動音樂教室', signupStart: addDays(t, 3), signupEnd: addDays(t, 40), fee: 300, applicants: 0, cover: '🎹', color: '#2e7d5b' },
    ],
    products: [
      { id: 'm1', name: 'YAMAHA 電鋼琴 P-145', price: 18900, commission: 900, category: '樂器', emoji: '🎹', sold: 4 },
      { id: 'm2', name: '入門烏克麗麗 23 吋', price: 2280, commission: 200, category: '樂器', emoji: '🌺', sold: 17 },
      { id: 'm3', name: '約翰‧湯普森鋼琴教本（一）', price: 380, commission: 40, category: '教材', emoji: '📘', sold: 36 },
      { id: 'm4', name: '護眼琴燈', price: 1680, commission: 150, category: '周邊', emoji: '💡', sold: 9 },
      { id: 'm5', name: '電子節拍器／調音器', price: 690, commission: 60, category: '周邊', emoji: '⏱️', sold: 22 },
      { id: 'm6', name: '鼓棒 5A（一對）', price: 450, commission: 40, category: '周邊', emoji: '🥢', sold: 31 },
      { id: 'm7', name: '線上樂理課 30 講', price: 1990, commission: 300, category: '課程', emoji: '🎓', sold: 12 },
    ],
    rewards: [
      { id: 'r1', name: '音符造型橡皮擦', cost: 80, emoji: '🧽', stock: 30 },
      { id: 'r2', name: '樂動貼紙組', cost: 120, emoji: '✨', stock: 50 },
      { id: 'r3', name: '五線譜筆記本', cost: 200, emoji: '📓', stock: 20 },
      { id: 'r4', name: '珍珠奶茶兌換券', cost: 300, emoji: '🧋', stock: 15 },
      { id: 'r5', name: '寵物新造型：台灣黑熊', cost: 500, emoji: '🐻', stock: 99 },
      { id: 'r6', name: '免費加課 1 堂', cost: 1500, emoji: '🎟️', stock: 5 },
    ],
    redeemed: [],
    messages: [],
  }
}
