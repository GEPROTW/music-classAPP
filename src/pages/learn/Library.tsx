import { useState } from 'react'
import { playSequence } from '../../lib/audio'
import { Modal, PageHead, Seg } from '../../components/ui'

/** 簡譜 → MIDI（C 大調，1 = C4；' 表示高八度，- 延長，0 休止） */
function jianpuToMidi(src: string): (number | null)[] {
  const base = [0, 60, 62, 64, 65, 67, 69, 71]
  return src.split(/\s+/).filter(Boolean).map((tok) => {
    if (tok === '-' || tok === '0') return null
    const n = +tok[0]
    return base[n] + (tok.includes("'") ? 12 : 0) - (tok.includes(',') ? 12 : 0)
  })
}

interface Score {
  title: string
  cat: '台灣童謠' | '台灣民謠' | '世界名曲' | '檢定曲目'
  level: string
  note: string
  jianpu?: string
}

const SCORES: Score[] = [
  { title: '小蜜蜂', cat: '台灣童謠', level: '入門', note: '五指位置，右手 C 大調', jianpu: '5 3 3 - 4 2 2 - 1 2 3 4 5 5 5 -' },
  { title: '小星星', cat: '台灣童謠', level: '入門', note: '莫札特變奏曲主題', jianpu: '1 1 5 5 6 6 5 - 4 4 3 3 2 2 1 -' },
  { title: '兩隻老虎', cat: '台灣童謠', level: '入門', note: '可練習輪唱', jianpu: '1 2 3 1 1 2 3 1 3 4 5 - 3 4 5 -' },
  { title: '生日快樂', cat: '世界名曲', level: '入門', note: '三拍子，弱起拍', jianpu: "5 5 6 5 1' 7 - 5 5 6 5 2' 1' -" },
  { title: '歡樂頌', cat: '世界名曲', level: '初級', note: '貝多芬第九號交響曲主題', jianpu: '3 3 4 5 5 4 3 2 1 1 2 3 3 2 2 -' },
  { title: '望春風', cat: '台灣民謠', level: '初級', note: '鄧雨賢作曲、李臨秋作詞（1933）' },
  { title: '雨夜花', cat: '台灣民謠', level: '初級', note: '鄧雨賢作曲、周添旺作詞' },
  { title: '天黑黑', cat: '台灣民謠', level: '初級', note: '台灣傳統念謠' },
  { title: '丟丟銅仔', cat: '台灣民謠', level: '初中級', note: '宜蘭民謠' },
  { title: '高山青', cat: '台灣民謠', level: '初中級', note: '適合烏克麗麗、二胡' },
  { title: '小奏鳴曲 Op.36 No.1', cat: '檢定曲目', level: '中級', note: '克萊曼第，YAMAHA 檢定常見曲' },
  { title: '給愛麗絲', cat: '檢定曲目', level: '中級', note: '貝多芬' },
  { title: '小步舞曲 G 大調', cat: '檢定曲目', level: '初中級', note: '《安娜‧瑪德蓮娜筆記》' },
]

export function Scores() {
  const [cat, setCat] = useState<'全部' | Score['cat']>('全部')
  const [open, setOpen] = useState<Score | null>(null)
  const [playing, setPlaying] = useState(false)
  function play(s: Score) {
    if (!s.jianpu || playing) return
    setPlaying(true)
    const len = playSequence(jianpuToMidi(s.jianpu), 0.4)
    setTimeout(() => setPlaying(false), len * 1000)
  }
  return (
    <>
      <PageHead title="樂譜庫" sub="台灣童謠、民謠、檢定曲目（簡譜＋示範音）" />
      <div style={{ marginBottom: 12 }}><Seg value={cat} options={['全部', '台灣童謠', '台灣民謠', '世界名曲', '檢定曲目'] as const} onChange={setCat} /></div>
      <div className="grid auto">
        {SCORES.filter((s) => cat === '全部' || s.cat === cat).map((s) => (
          <button key={s.title} className="card" style={{ border: 0, textAlign: 'left' }} onClick={() => setOpen(s)}>
            <div className="emoji-box" style={{ background: 'linear-gradient(135deg,#f1e8ff,#ffe6ef)', width: '100%', height: 70 }}>🎼</div>
            <b style={{ display: 'block', marginTop: 8 }}>{s.title}</b>
            <div className="row wrap" style={{ gap: 4, marginTop: 4 }}><span className="tag">{s.cat}</span><span className="tag">{s.level}</span>{s.jianpu && <span className="tag good">▶ 可試聽</span>}</div>
          </button>
        ))}
      </div>
      {open && (
        <Modal title={open.title} onClose={() => setOpen(null)}>
          <p className="sub">{open.note}</p>
          {open.jianpu ? (
            <>
              <div className="card" style={{ background: 'var(--card-soft)', fontSize: 22, letterSpacing: 4, fontFamily: 'monospace', lineHeight: 1.8 }}>
                {open.jianpu.split(/\s+/).map((t, i) => (
                  <span key={i}>{t.replace("'", '̇')}{(i + 1) % 4 === 0 ? ' | ' : ' '}</span>
                ))}
              </div>
              <button className="btn" style={{ marginTop: 12 }} disabled={playing} onClick={() => play(open)}>{playing ? '♪ 播放中…' : '▶ 播放示範'}</button>
            </>
          ) : (
            <p className="muted">完整樂譜由老師於課堂發放（版權樂譜僅供學生帳號瀏覽）。</p>
          )}
        </Modal>
      )}
    </>
  )
}

const WIKI = [
  { cat: '樂器', ico: '🎹', title: '鋼琴', body: '88 個琴鍵、7 個八度多，是鍵盤樂器之王。坐姿要讓手肘與鍵盤等高，手指像握著一顆雞蛋。' },
  { cat: '樂器', ico: '🥁', title: '爵士鼓', body: '由大鼓、小鼓、腳踏鈸、筒鼓與銅鈸組成，一人手腳並用演奏，是流行樂團的節奏核心。' },
  { cat: '樂器', ico: '🎻', title: '二胡', body: '兩條弦的拉弦樂器，弓毛夾在兩弦之間，音色溫潤，常用來演奏台灣民謠與國樂曲。' },
  { cat: '樂器', ico: '🪕', title: '古箏', body: '常見為 21 弦，以雁柱調音、五聲音階定弦，右手彈奏、左手按弦做出吟揉效果。' },
  { cat: '樂器', ico: '🌺', title: '烏克麗麗', body: '源自夏威夷的四弦小吉他，標準調弦 G-C-E-A，體積小、好上手，適合自彈自唱。' },
  { cat: '台灣音樂家', ico: '🌸', title: '鄧雨賢', body: '被譽為「台灣歌謠之父」，代表作〈望春風〉〈雨夜花〉〈月夜愁〉〈四季紅〉，合稱「四月望雨」。' },
  { cat: '台灣音樂家', ico: '🎼', title: '江文也', body: '台灣出生的作曲家，1936 年以管弦樂作品〈台灣舞曲〉在柏林奧運藝術競賽中獲得選外佳作。' },
  { cat: '台灣音樂家', ico: '🎶', title: '蕭泰然', body: '高雄出身的作曲家，作品融合台灣民謠與浪漫派風格，代表作〈出外人〉〈點心擔〉。' },
  { cat: '台灣音樂家', ico: '🎵', title: '李泰祥', body: '作曲家、小提琴家，作品橫跨古典與流行，〈橄欖樹〉〈歡顏〉傳唱至今。' },
  { cat: '古典音樂家', ico: '🎻', title: '巴哈', body: '巴洛克時期德國作曲家，被尊為「音樂之父」，作品重視對位法，如《十二平均律鋼琴曲集》。' },
  { cat: '古典音樂家', ico: '🎹', title: '莫札特', body: '古典時期奧地利作曲家，5 歲作曲，〈小星星變奏曲〉是很多學琴孩子的必彈曲。' },
  { cat: '古典音樂家', ico: '🎼', title: '貝多芬', body: '晚年失聰仍完成第九號交響曲，〈歡樂頌〉是其中最知名的主題。' },
]

export function Wiki() {
  const [cat, setCat] = useState<'全部' | '樂器' | '台灣音樂家' | '古典音樂家'>('全部')
  return (
    <>
      <PageHead title="音樂百科" sub="認識樂器與音樂家" />
      <div style={{ marginBottom: 12 }}><Seg value={cat} options={['全部', '樂器', '台灣音樂家', '古典音樂家'] as const} onChange={setCat} /></div>
      <div className="grid auto-l">
        {WIKI.filter((w) => cat === '全部' || w.cat === cat).map((w) => (
          <div key={w.title} className="card">
            <div className="row"><span style={{ fontSize: 34 }}>{w.ico}</span><div><b>{w.title}</b><div className="muted">{w.cat}</div></div></div>
            <p style={{ margin: '10px 0 0', lineHeight: 1.7 }}>{w.body}</p>
          </div>
        ))}
      </div>
    </>
  )
}
