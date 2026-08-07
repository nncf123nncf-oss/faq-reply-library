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
  }

  function handleDelete(id: string) {
    // 一番よく押す「コピー」の隣にあるので、指が滑っても消えないようにする。
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
          いつも聞かれることへの返信を置いておいて、探してコピーするだけにする道具です。
        </p>
        <p className="note">
          登録した内容はこのブラウザの中だけに保存されます。どこにも送信されません。
        </p>
        {saveFailed && (
          <p className="error banner" role="alert">
            このブラウザに保存できませんでした。閉じると内容が消えます。
            プライベートモードを解除するか、必要な返信文は他の場所に控えてください。
          </p>
        )}
      </header>

      <main className="layout">
        <section className="col-form">
          <FAQForm onAdd={handleAdd} />
        </section>

        <section className="col-list">
          <div className="card search">
            <label className="field">
              <span className="label">探す</span>
              <input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="例）キャンセル / 駐車場 / 時間"
              />
              <span className="hint">
                質問文だけでなく、返信文の中身も探します。
              </span>
            </label>

            <div className="filters" role="group" aria-label="種類でしぼる">
              <button
                type="button"
                className={category === 'all' ? 'chip on' : 'chip'}
                onClick={() => setCategory('all')}
                aria-pressed={category === 'all'}
              >
                すべて
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={category === c.value ? 'chip on' : 'chip'}
                  onClick={() => setCategory(c.value)}
                  aria-pressed={category === c.value}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <p className="count" aria-live="polite">
              {visible.length}件 / 全{items.length}件
            </p>
          </div>

          <FAQList
            items={visible}
            reason={reason}
            keyword={keyword}
            categoryLabel={
              category === 'all' ? 'すべて' : categoryLabel(category)
            }
            onResetCategory={() => setCategory('all')}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
          />
        </section>
      </main>
    </div>
  )
}

export default App
