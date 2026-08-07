import { useEffect, useState } from 'react'
import { categoryLabel, type FAQItem } from '../types/faq'

interface Props {
  item: FAQItem
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export function FAQCard({ item, onDelete, onToggleFavorite }: Props) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)

  // 「コピーしました」を出したまま画面から消えると、タイマーが外れずに警告が出る
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  // 失敗表示も出しっぱなしにしない（次に押したときの結果と混ざる）
  useEffect(() => {
    if (!copyFailed) return
    const timer = window.setTimeout(() => setCopyFailed(false), 6000)
    return () => window.clearTimeout(timer)
  }, [copyFailed])

  async function handleCopy() {
    // コピーするのは常に「この項目の返信文」。他の項目の文が混ざらないよう item から直接読む
    try {
      await navigator.clipboard.writeText(item.answer)
      setCopyFailed(false)
      setCopied(true)
    } catch {
      // 権限が無い・httpでない等でコピーできないことがある。黙って失敗しない
      setCopyFailed(true)
    }
  }

  return (
    <article className={copied ? 'card copied' : 'card'}>
      <div className="card-tab">
        <span className="tag">{categoryLabel(item.category)}</span>
        <button
          type="button"
          className={item.favorite ? 'star on' : 'star'}
          onClick={() => onToggleFavorite(item.id)}
          aria-pressed={item.favorite}
          aria-label={item.favorite ? 'よく使うから外す' : 'よく使うに入れる'}
          title={item.favorite ? 'よく使うから外す' : 'よく使うに入れる'}
        >
          ★
        </button>
      </div>

      {/* 本文はテキストとして描画する。HTMLとしては解釈しない */}
      <h2 className="question">{item.question}</h2>
      <p className="answer">{item.answer}</p>

      <div className="card-actions">
        <button type="button" className="primary" onClick={handleCopy}>
          {copied ? '✓ コピーしました' : 'この返信をコピー'}
        </button>
        <button type="button" className="quiet" onClick={() => onDelete(item.id)}>
          削除
        </button>
      </div>

      {/* 画面を見ていない人にも結果が伝わるようにする */}
      <p className="sr-only" role="status">
        {copied ? `「${item.question}」の返信文をコピーしました` : ''}
      </p>

      {copyFailed && (
        <p className="error card-error" role="alert">
          コピーできませんでした。返信文を選んでコピーしてください。
        </p>
      )}
    </article>
  )
}
