import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { update, useDB } from './lib/store'
import type { Role } from './lib/types'
import { Toaster } from './components/ui'
import AdminHome from './pages/AdminHome'
import { StudentDetail, Students } from './pages/Students'
import { Classes, Teachers } from './pages/Staff'
import { CourseAdmin, Lessons } from './pages/Courses'
import Schedule from './pages/Schedule'
import { Cashier, Finance } from './pages/Finance'
import { Leads, Renewal } from './pages/Leads'
import DataCenter from './pages/DataCenter'
import { Messages, Settings } from './pages/Settings'
import LearnHub from './pages/learn/LearnHub'
import { Growth, Cloud, Checkin } from './pages/learn/Growth'
import { Scores, Wiki } from './pages/learn/Library'
import { EarTraining, TheoryQuiz } from './pages/learn/Training'
import { Instruments, Basics, AiPractice } from './pages/learn/Instruments'
import { Works, Points, PetPage } from './pages/learn/Fun'
import GrowHub from './pages/grow/GrowHub'
import { Enroll, Contests, Shop, Catalog } from './pages/grow/Marketing'
import StudentHome from './pages/StudentHome'

const ROLE_LABEL: Record<Role, string> = { admin: '校長', teacher: '老師', student: '學生／家長' }

function TopBar() {
  const db = useDB()
  const nav = useNavigate()
  const unread = db.leads.filter((l) => l.stage === 'new').length
  function switchRole() {
    const order: Role[] = ['admin', 'teacher', 'student']
    const next = order[(order.indexOf(db.role) + 1) % order.length]
    update((d) => ({ ...d, role: next }))
    nav('/')
  }
  return (
    <header className="topbar">
      <span className="school-logo" aria-hidden>🎵</span>
      <span className="chip school-name">{db.schoolName}｜音樂</span>
      <button className="chip" onClick={switchRole} title="切換身分">
        {ROLE_LABEL[db.role]} ⇆
      </button>
      <div className="spacer" />
      {db.role !== 'student' && (
        <NavLink to="/data" className="chip hide-sm">🖥️ 管理後台</NavLink>
      )}
      <NavLink to="/messages" className="chip">
        💬 訊息{unread > 0 && db.role !== 'student' && <span className="dot" />}
      </NavLink>
      <NavLink to="/settings" className="chip">⚙️ 設定</NavLink>
    </header>
  )
}

function TabBar() {
  const db = useDB()
  const tabs =
    db.role === 'student'
      ? [
          { to: '/', ico: '🏠', label: '首頁' },
          { to: '/learn', ico: '🎼', label: '學習' },
          { to: '/learn/works', ico: '🌟', label: '作品' },
          { to: '/learn/growth', ico: '👤', label: '我的' },
        ]
      : [
          { to: '/learn', ico: '📚', label: '教學' },
          { to: '/', ico: '🏫', label: '管理' },
          { to: '/grow', ico: '🚀', label: '拓展' },
        ]
  return (
    <nav className="tabbar" aria-label="主選單">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="ico">{t.ico}</span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function App() {
  const db = useDB()
  return (
    <div className="app">
      <TopBar />
      <main className="page">
        <Routes>
          <Route path="/" element={db.role === 'student' ? <StudentHome /> : <AdminHome />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/courses" element={<CourseAdmin />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/cashier" element={<Cashier />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/renewal" element={<Renewal />} />
          <Route path="/data" element={<DataCenter />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/learn" element={<LearnHub />} />
          <Route path="/learn/growth" element={<Growth />} />
          <Route path="/learn/cloud" element={<Cloud />} />
          <Route path="/learn/checkin" element={<Checkin />} />
          <Route path="/learn/scores" element={<Scores />} />
          <Route path="/learn/wiki" element={<Wiki />} />
          <Route path="/learn/ear" element={<EarTraining />} />
          <Route path="/learn/quiz" element={<TheoryQuiz />} />
          <Route path="/learn/instruments" element={<Instruments />} />
          <Route path="/learn/basics" element={<Basics />} />
          <Route path="/learn/ai" element={<AiPractice />} />
          <Route path="/learn/works" element={<Works />} />
          <Route path="/learn/points" element={<Points />} />
          <Route path="/learn/pet" element={<PetPage />} />
          <Route path="/grow" element={<GrowHub />} />
          <Route path="/grow/enroll" element={<Enroll />} />
          <Route path="/grow/contests" element={<Contests />} />
          <Route path="/grow/shop" element={<Shop />} />
          <Route path="/grow/catalog" element={<Catalog />} />
          <Route path="*" element={<AdminHome />} />
        </Routes>
      </main>
      <TabBar />
      <Toaster />
    </div>
  )
}
