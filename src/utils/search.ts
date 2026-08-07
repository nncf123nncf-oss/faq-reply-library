import type { CategoryFilter, FAQItem } from '../types/faq'

/**
 * 全角・半角の違いで探せなくなるのを防ぐ。
 * 日本語入力では「１０:００」「ｷｬﾝｾﾙ」「５０％」が普通に混ざるため、
 * 比べる前に NFKC で揃える。
 */
function normalize(text: string): string {
  return text.normalize('NFKC').toLowerCase()
}

/**
 * 探すための処理は画面から切り離しておく。
 * 検索対象を変えたい（タグを足す等）ときに、画面側を触らずに済む。
 */
export function filterItems(
  items: FAQItem[],
  keyword: string,
  category: CategoryFilter,
): FAQItem[] {
  const q = normalize(keyword.trim())

  const matched = items.filter((item) => {
    if (category !== 'all' && item.category !== category) return false
    if (q === '') return true
    // 質問だけでなく返信文も探す。
    // 「キャンセル」のように、質問文には入っていないが返信文には入っている語で引きたいため。
    return (
      normalize(item.question).includes(q) ||
      normalize(item.answer).includes(q)
    )
  })

  // お気に入りを上に。同じ条件なら登録順を保つ（並びが毎回変わると探しにくい）
  return matched
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      if (a.item.favorite !== b.item.favorite) return a.item.favorite ? -1 : 1
      return a.index - b.index
    })
    .map((x) => x.item)
}

export type EmptyReason =
  | 'none'
  | 'no-items'
  | 'no-match'
  | 'no-in-category'
  | 'no-match-in-category'

/**
 * 0件には4つの状況がある。混ぜると誤報になる。
 * とくに「絞り込み中に検索して0件」を「そんな返信文は無い」と伝えると、
 * 実際には登録済みなのに利用者が作り直してしまう。
 */
export function emptyReason(
  totalCount: number,
  visibleCount: number,
  keyword: string,
  category: CategoryFilter,
): EmptyReason {
  if (visibleCount > 0) return 'none'
  if (totalCount === 0) return 'no-items'

  const hasKeyword = keyword.trim() !== ''
  if (hasKeyword && category !== 'all') return 'no-match-in-category'
  if (hasKeyword) return 'no-match'
  if (category !== 'all') return 'no-in-category'
  return 'no-items'
}
