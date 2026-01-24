// Lightweight localStorage-based persistence for quiz attempts

const KEY = 'quizAttempts'

export function getAttempts() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveAttempt(attempt) {
  const list = getAttempts()
  list.push({
    id: crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    ...attempt
  })
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {}
  return list[list.length - 1]
}

export function getLastAttemptByQuiz(quizId) {
  const list = getAttempts().filter(a => a.quizId === quizId)
  return list.sort((a, b) => b.timestamp - a.timestamp)[0]
}
