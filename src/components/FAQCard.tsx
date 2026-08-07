import { useEffect, useId, useRef, useState } from 'react'
import { categoryLabel, type FAQItem } from '../types/faq'

interface Props {
  item: FAQItem
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export function FAQCard({ item, onDelete, onToggleFavorite }: Props) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [clamped, setClamped] = useState(false)
  const answerRef = useRef<HTMLParagraphElement>(null)
  const answerId = useId()

  /**
   * 8行に収まっているカードにまで「全文を見る」を出すと邪魔なので、
   * 実際に入りきらないときだけ出す。折り返し数は幅で変わるため、
   * 幅の変化を見て測り直す。
   */
  useEffect(() => {
    const el = answerRef.current
    if (!el) return
    const check = () => {
      if (expanded) return // 開いている間は畳めるようにボタンを残す
      setClamped(el.scrollHeight > el.clientHeight + 1)
    }
    check()
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [expanded, item.answer])

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
      <p
        ref={answerRef}
        id={answerId}
        className={expanded ? 'answer' : 'answer clamp'}
      >
        {item.answer}
      </p>

      {clamped && (
        <button
          type="button"
          className="more"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={answerId}
        >
          {expanded ? '閉じる' : '全文を見る'}
        </button>
      )}

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
