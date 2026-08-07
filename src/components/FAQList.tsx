import type { FAQItem } from '../types/faq'
import type { EmptyReason } from '../utils/search'
import { FAQCard } from './FAQCard'

interface Props {
  items: FAQItem[]
  reason: EmptyReason
  keyword: string
  categoryLabel: string
  onResetCategory: () => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}

/** 検索語をそのまま出すと、長文を貼られたときに画面が壊れる */
function shorten(text: string): string {
  const t = text.trim()
  return t.length > 40 ? `${t.slice(0, 40)}…` : t
}

export function FAQList({
  items,
  reason,
  keyword,
  categoryLabel,
  onResetCategory,
  onDelete,
  onToggleFavorite,
}: Props) {
  if (reason === 'no-items') {
    return (
      <p className="empty">
        まだ登録がありません。登録フォームから、よく聞かれることを1つ入れてみてください。
      </p>
    )
  }

  if (reason === 'no-match') {
    return (
      <p className="empty">「{shorten(keyword)}」に当てはまる返信文がありません。</p>
    )
  }

  if (reason === 'no-in-category') {
    return <p className="empty">「{categoryLabel}」にはまだ登録がありません。</p>
  }

  if (reason === 'no-match-in-category') {
    return (
      <p className="empty">
        いま「{categoryLabel}」だけを表示しています。
        <br />
        この中に「{shorten(keyword)}」はありませんでした。
        <br />
        <button type="button" className="ghost reset" onClick={onResetCategory}>
          すべての種類から探す
        </button>
      </p>
    )
  }

  return (
    <div className="faq-grid">
      {items.map((item) => (
        <FAQCard
          key={item.id}
          item={item}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}
