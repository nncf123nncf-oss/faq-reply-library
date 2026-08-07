export type FAQCategory =
  | 'hours'
  | 'price'
  | 'reservation'
  | 'location'
  | 'other'

export interface FAQItem {
  id: string
  question: string
  answer: string
  category: FAQCategory
  favorite: boolean
}

/** 画面に出す順。値は型と一致させる（ズレると絞り込みが静かに壊れる） */
export const CATEGORIES: { value: FAQCategory; label: string }[] = [
  { value: 'hours', label: '営業時間' },
  { value: 'price', label: '料金' },
  { value: 'reservation', label: '予約' },
  { value: 'location', label: '場所' },
  { value: 'other', label: 'その他' },
]

/** 絞り込みの「すべて」を含めた値 */
export type CategoryFilter = FAQCategory | 'all'

/**
 * 入力の上限。保存先の localStorage には容量の上限があり、
 * 際限なく貼り付けられると保存が失敗する。入口で止める。
 */
export const MAX_QUESTION_LENGTH = 200
export const MAX_ANSWER_LENGTH = 2000

export function categoryLabel(value: FAQCategory): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? 'その他'
}

/**
 * 最初から空の画面だと何をする道具か伝わらないので、サンプルを3件置く。
 * 実在の店舗・顧客の情報は使わない。
 */
export const SAMPLE_ITEMS: FAQItem[] = [
  {
    id: 'sample-hours',
    question: '営業時間は何時から何時までですか？',
    answer:
      'お問い合わせありがとうございます。\n営業時間は10:00〜19:00です（最終受付18:00）。\n定休日は毎週水曜日です。\nご来店をお待ちしております。',
    category: 'hours',
    favorite: true,
  },
  {
    id: 'sample-reservation',
    question: '予約はどうすればいいですか？',
    answer:
      'お問い合わせありがとうございます。\nご予約はこのメッセージで承ります。\nご希望の日付と時間帯を2〜3候補お知らせください。\n折り返し空き状況をご連絡します。',
    category: 'reservation',
    favorite: false,
  },
  {
    id: 'sample-cancel',
    question: 'キャンセルはいつまでにすればいいですか？',
    answer:
      'ご連絡ありがとうございます。\n前日までのご連絡はキャンセル料をいただいておりません。\n当日のキャンセルは料金の50%を申し受けます。\n変更をご希望の場合もこのメッセージでお知らせください。',
    category: 'other',
    favorite: false,
  },
]
