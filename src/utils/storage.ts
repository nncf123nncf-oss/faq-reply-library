import { CATEGORIES, SAMPLE_ITEMS, type FAQItem } from '../types/faq'

/** 保存キー。読み込み側と1文字でも違うとデータが消えたように見えるので定数にする */
const STORAGE_KEY = 'faq-reply-library:v1'

const VALID_CATEGORIES = new Set(CATEGORIES.map((c) => c.value))

/**
 * localStorage から読んだ値は「他人が書いた壊れたJSON」だと思って扱う。
 * 手で編集された・古い形式が残っている・別バージョンが書いた、のどれもあり得る。
 * 1件でも形が違えばその1件だけ捨て、画面ごと落とさない。
 */
function isFAQItem(value: unknown): value is FAQItem {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    v.id !== '' &&
    typeof v.question === 'string' &&
    typeof v.answer === 'string' &&
    typeof v.category === 'string' &&
    VALID_CATEGORIES.has(v.category as FAQItem['category']) &&
    typeof v.favorite === 'boolean'
  )
}

export function loadItems(): FAQItem[] {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    // プライベートモード等で localStorage 自体が使えないことがある
    return SAMPLE_ITEMS.map((item) => ({ ...item }))
  }

  // 一度も使ったことがない場合だけサンプルを出す。
  // 利用者が全部消した状態（"[]"）は尊重し、サンプルを復活させない。
  // 定数そのものを返すと、あとで並べ替え等を足したときに定数が汚れるのでコピーを返す。
  if (raw === null) return SAMPLE_ITEMS.map((item) => ({ ...item }))

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const items = parsed.filter(isFAQItem)

    // idが重複していると、削除やコピーが別の項目に当たる。読み込み時に落とす。
    const seen = new Set<string>()
    return items.filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
  } catch {
    return []
  }
}

/**
 * 保存できたかどうかを返す。
 * 黙って失敗すると、利用者は保存されたと信じたまま書き溜め、再読み込みで全部失う。
 * 呼び出し側が画面で伝えられるように、成否を必ず返す。
 */
export function saveItems(items: FAQItem[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    return true
  } catch {
    // 容量超過・書き込み禁止・プライベートモード
    return false
  }
}

/** idの重複は削除とコピーの誤爆に直結するので、衝突しない作り方をする */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `faq-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
