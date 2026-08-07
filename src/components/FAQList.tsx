import type { FAQItem } from '../types/faq'
import type { EmptyReason } from '../utils/search'
import { FAQCard } from './FAQCard'

interface Props {
  items: FAQItem[]
  reason: EmptyReason
  keyword: string
  categoryLabel: string
  onResetCategory: () => void
  onAddClick: () => void
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
  onAddClick,
  onDelete,
  onToggleFavorite,
}: Props) {
  if (reason === 'no-items') {
    return (
      <div className="empty">
        <p>まだ登録がありません。</p>
        <p className="empty-sub">
          いつも聞かれることを1つ入れておくと、次から探して貼るだけになります。
        </p>
        <button type="button" className="primary" onClick={onAddClick}>
          ＋ 最初の返信を登録する
        </button>
      </div>
    )
  }

  if (reason === 'no-match') {
    return (
      <div className="empty">
        <p>「{shorten(keyword)}」に当てはまる返信文がありません。</p>
        <p className="empty-sub">別の言い方で探すか、この機会に登録できます。</p>
        <button type="button" className="ghost" onClick={onAddClick}>
          ＋ この返信を登録する
        </button>
      </div>
    )
  }

  if (reason === 'no-in-category') {
    return (
      <div className="empty">
        <p>「{categoryLabel}」にはまだ登録がありません。</p>
        <button type="button" className="ghost" onClick={onResetCategory}>
          すべての種類を見る
        </button>
      </div>
    )
  }

  if (reason === 'no-match-in-category') {
    return (
      <div className="empty">
        <p>
          いま「{categoryLabel}」だけを表示しています。
          <br />
          この中に「{shorten(keyword)}」はありませんでした。
        </p>
        <button type="button" className="ghost" onClick={onResetCategory}>
          すべての種類から探す
        </button>
      </div>
    )
  }

  return (
    <div className="cards">
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
