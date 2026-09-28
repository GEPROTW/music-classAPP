export type Role = 'admin' | 'teacher' | 'student'

export interface Student {
  id: string
  name: string
  age: number
  parent: string
  phone: string
  lineBound: boolean
  courseId: string
  classId?: string
  teacherId: string
  lessonsTotal: number
  lessonsUsed: number
  points: number
  joinedAt: string
  status: 'active' | 'trial' | 'paused'
}

export interface Teacher {
  id: string
  name: string
  title: string
  instruments: string[]
  phone: string
  emoji: string
}

export interface Course {
  id: string
  name: string
  category: '鋼琴' | '爵士鼓' | '聲樂' | '弦樂' | '吉他／烏克麗麗' | '幼兒啟蒙' | '國樂' | '檢定'
  age: string
  minutes: number
  pricePerLesson: number
  packLessons: number
  cover: string
  color: string
  desc: string
}

export interface ClassGroup {
  id: string
  name: string
  courseId: string
  teacherId: string
  weekday: number
  time: string
  room: string
  capacity: number
}

export interface Lesson {
  id: string
  date: string // YYYY-MM-DD
  time: string
  courseId: string
  teacherId: string
  studentIds: string[]
  room: string
  status: 'scheduled' | 'done' | 'leave' | 'absent'
  kind: 'class' | 'private' | 'trial'
}

export interface Order {
  id: string
  date: string
  studentId: string
  item: string
  amount: number
  method: PayMethod
  invoice: string // 電子發票號碼
  carrier?: string
  status: 'paid' | 'pending' | 'refund'
}

export type PayMethod = 'LINE Pay' | '街口支付' | '台灣Pay' | '信用卡' | 'ATM 轉帳' | '現金' | '超商代碼'

export interface Lead {
  id: string
  name: string
  parent: string
  phone: string
  source: 'LINE 官方帳號' | 'Facebook' | 'Instagram' | 'Google 地圖' | '朋友介紹' | '路過詢問' | '招生活動'
  interest: string
  stage: 'new' | 'contacted' | 'trial' | 'won' | 'lost'
  nextFollow: string
  note: string
  owner: string
}

export interface Work {
  id: string
  studentId: string
  title: string
  instrument: string
  date: string
  likes: number
  teacherScore?: number
  emoji: string
}

export interface Checkin {
  date: string
  minutes: number
  item: string
}

export interface Pet {
  name: string
  kind: string
  level: number
  exp: number
  hunger: number // 0-100 飽足度
  mood: number // 0-100
  lastFed: string
}

export interface Campaign {
  id: string
  title: string
  type: '揪團優惠' | '早鳥限定' | '體驗課' | '推薦有禮' | '營隊'
  price: number
  original: number
  groupSize?: number
  joined: number
  deadline: string
  cover: string
  color: string
}

export interface Contest {
  id: string
  title: string
  organizer: string
  signupStart: string
  signupEnd: string
  fee: number
  applicants: number
  cover: string
  color: string
}

export interface Product {
  id: string
  name: string
  price: number
  commission: number
  category: '樂器' | '教材' | '周邊' | '課程'
  emoji: string
  sold: number
}

export interface Reward {
  id: string
  name: string
  cost: number
  emoji: string
  stock: number
}

export interface Message {
  id: string
  date: string
  to: string
  channel: 'LINE' | 'App 推播' | '簡訊'
  text: string
}

export interface DB {
  schoolName: string
  licenseNo: string
  role: Role
  currentStudentId: string
  students: Student[]
  teachers: Teacher[]
  courses: Course[]
  classes: ClassGroup[]
  lessons: Lesson[]
  orders: Order[]
  leads: Lead[]
  works: Work[]
  checkins: Checkin[]
  pet: Pet
  campaigns: Campaign[]
  contests: Contest[]
  products: Product[]
  rewards: Reward[]
  redeemed: { id: string; rewardId: string; date: string }[]
  messages: Message[]
}
