import { useState, type FormEvent } from 'react'
import {
  CATEGORIES,
  MAX_ANSWER_LENGTH,
  MAX_QUESTION_LENGTH,
  type FAQCategory,
} from '../types/faq'

interface Props {
  onAdd: (question: string, answer: string, category: FAQCategory) => void
}

export function FAQForm({ onAdd }: Props) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [category, setCategory] = useState<FAQCategory>('hours')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (question.trim() === '' || answer.trim() === '') {
      setError('質問と返信文の両方を入れてください。')
      return
    }
    onAdd(question.trim(), answer.trim(), category)
    setQuestion('')
    setAnswer('')
    setError('')
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>返信を登録する</h2>

      <label className="field">
        <span className="label">
          よく聞かれること <em className="required">必須</em>
        </span>
        <input
          type="text"
          value={question}
          maxLength={MAX_QUESTION_LENGTH}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="例）駐車場はありますか？"
        />
      </label>

      <label className="field">
        <span className="label">
          返す文章 <em className="required">必須</em>
        </span>
        <textarea
          value={answer}
          maxLength={MAX_ANSWER_LENGTH}
          onChange={(e) => setAnswer(e.target.value)}
          rows={5}
          placeholder="例）お問い合わせありがとうございます。&#10;店舗前に2台分の駐車スペースがございます。"
        />
        <span className="hint">
          あいさつから結びまで、そのまま送れる形で書いておくと貼るだけで済みます。
          <span className="counter">
            {answer.length} / {MAX_ANSWER_LENGTH}文字
          </span>
        </span>
      </label>

      <label className="field">
        <span className="label">種類</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as FAQCategory)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      {error !== '' && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="primary">
        登録する
      </button>
    </form>
  )
}
