import { Link } from 'react-router-dom'
import { useDB } from '../../lib/store'
import { PageHead } from '../../components/ui'

export default function GrowHub() {
  const db = useDB()
  const items = [
    { to: '/grow/enroll', ico: '🎁', label: '招生工具', desc: '揪團、早鳥、體驗課、推薦有禮，分享到 LINE 群組裂變引流', bg: 'linear-gradient(135deg,#ff9a8b,#ffc3a0)', stat: `${db.campaigns.reduce((s, c) => s + c.joined, 0)} 人次報名` },
    { to: '/grow/contests', ico: '🏆', label: '賽事活動', desc: '舉辦校內初選、歌唱比賽，線上報名收費', bg: 'linear-gradient(135deg,#6a82fb,#a4b8ff)', stat: `${db.contests.length} 場比賽` },
    { to: '/grow/shop', ico: '🛍️', label: '推薦商城', desc: '樂器、教材、周邊，家長購買老師得分潤', bg: 'linear-gradient(135deg,#43cea2,#8ee4c7)', stat: `${db.products.reduce((s, p) => s + p.sold, 0)} 件售出` },
    { to: '/grow/catalog', ico: '📖', label: '課程型錄', desc: '對外公開的課程介紹頁，可放在 Google 商家與官網', bg: 'linear-gradient(135deg,#f7b733,#fce38a)', stat: `${db.courses.length} 門課程` },
    { to: '/leads', ico: '🧲', label: '潛在學生', desc: '集中管理 LINE、FB、IG、Google 地圖來的詢問', bg: 'linear-gradient(135deg,#b06ab3,#d8a4dc)', stat: `${db.leads.filter((l) => l.stage !== 'won' && l.stage !== 'lost').length} 位跟進中` },
    { to: '/cashier', ico: '💳', label: '收銀台', desc: 'LINE Pay、街口、台灣Pay、信用卡一碼收款', bg: 'linear-gradient(135deg,#ff5f6d,#ffc371)', stat: '自動開立電子發票' },
  ]
  return (
    <>
      <PageHead back={false} title="招生獲客・增加營收" sub="招生行銷工具裂變引流，加值工具增加營收" />
      <div className="grid auto-l">
        {items.map((x) => (
          <Link key={x.to} to={x.to} className="card" style={{ background: x.bg, color: '#2a2233' }}>
            <div style={{ fontSize: 44 }}>{x.ico}</div>
            <b style={{ fontSize: 18 }}>{x.label}</b>
            <p style={{ margin: '6px 0', lineHeight: 1.6 }}>{x.desc}</p>
            <span className="tag" style={{ background: '#fff', color: '#2a2233' }}>{x.stat}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
