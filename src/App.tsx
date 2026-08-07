import { useEffect, useMemo, useState } from 'react'
import { FAQForm } from './components/FAQForm'
import { FAQList } from './components/FAQList'
import {
  CATEGORIES,
  categoryLabel,
  type CategoryFilter,
  type FAQCategory,
  type FAQItem,
} from './types/faq'
import { createId, loadItems, saveItems } from './utils/storage'
import { emptyReason, filterItems } from './utils/search'
import './App.css'

function App() {
  const [items, setItems] = useState<FAQItem[]>(() => loadItems())
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [saveFailed, setSaveFailed] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  // 追加・削除・お気に入りのどれでも保存する（操作ごとに書くと必ず書き漏れる）
  // 保存できなかったことは必ず画面に出す。黙って失敗すると書き溜めた内容が消える
  useEffect(() => {
    setSaveFailed(!saveItems(items))
  }, [items])

  const visible = useMemo(
    () => filterItems(items, keyword, category),
    [items, keyword, category],
  )
  const reason = emptyReason(items.length, visible.length, keyword, category)

  function handleAdd(question: string, answer: string, cat: FAQCategory) {
    setItems((prev) => [
      ...prev,
      { id: createId(), question, answer, category: cat, favorite: false },
    ])
    setFormOpen(false)
  }

  function handleDelete(id: string) {
    // 一番よく押す「コピー」の近くにあるので、指が滑っても消えないようにする。
    // 編集機能もバックアップも無いため、消えると戻せない
    const target = items.find((item) => item.id === id)
    if (!target) return
    const ok = window.confirm(
      `「${target.question}」を削除します。\n元に戻せません。よろしいですか？`,
    )
    if (!ok) return
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  function handleToggleFavorite(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item,
      ),
    )
  }

  return (
    <div className="page">
      <header className="head">
        <h1>FAQ返信集</h1>
        <p className="lead">
          いつも聞かれることへの返信を置いておいて、探して貼るだけにする道具です。
        </p>
      </header>

      {/* この道具の主役は「探す」。最初に目に入る場所に置く */}
      <section className="hero">
        <div className="searchbox">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="聞かれたことを入れる（例）キャンセル / 駐車場 / 水曜"
            aria-label="返信文を探す"
          />
        </div>
        <p className="sub">質問文だけでなく、返信文の中身も探します。</p>

        <div className="tabs" role="group" aria-label="種類でしぼる">
          <button
            type="button"
            className={category === 'all' ? 'tab on' : 'tab'}
            onClick={() => setCategory('all')}
            aria-pressed={category === 'all'}
          >
            すべて
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              className={category === c.value ? 'tab on' : 'tab'}
              onClick={() => setCategory(c.value)}
              aria-pressed={category === c.value}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {saveFailed && (
        <p className="error banner" role="alert">
          このブラウザに保存できませんでした。閉じると内容が消えます。
          プライベートモードを解除するか、必要な返信文は他の場所に控えてください。
        </p>
      )}

      <div className="bar">
        <p className="count" aria-live="polite">
          {visible.length}件<span className="of"> / 全{items.length}件</span>
        </p>
        <button
          type="button"
          className={formOpen ? 'add open' : 'add'}
          onClick={() => setFormOpen((v) => !v)}
          aria-expanded={formOpen}
        >
          {formOpen ? '閉じる' : '＋ 返信を追加'}
        </button>
      </div>

      {formOpen && <FAQForm onAdd={handleAdd} onCancel={() => setFormOpen(false)} />}

      <main>
        <FAQList
          items={visible}
          reason={reason}
          keyword={keyword}
          categoryLabel={category === 'all' ? 'すべて' : categoryLabel(category)}
          onResetCategory={() => setCategory('all')}
          onAddClick={() => setFormOpen(true)}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
        />
      </main>

      <footer className="foot">
        登録した内容はこのブラウザの中だけに保存されます。どこにも送信されません。
      </footer>
    </div>
  )
}

export default App
