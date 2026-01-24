// LocalStorage helpers for saving in-progress quizzes

const KEY = 'quizProgress'

function readAll() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getProgress(quizId) {
  const all = readAll()
  return all[quizId] || null
}

export function saveProgress(quizId, data) {
  const all = readAll()
  all[quizId] = { ...data, timestamp: Date.now() }
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {}
}

export function clearProgress(quizId) {
  const all = readAll()
  delete all[quizId]
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {}
}
