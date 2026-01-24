// Local storage for instructor-created quizzes (drafts/published)

const KEY = 'instructorQuizzes'

function readAll(){
  try{
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  }catch{
    return []
  }
}

export function listQuizzes(){
  return readAll().sort((a,b)=> (b.createdAt||0) - (a.createdAt||0))
}

export function getQuiz(id){
  return readAll().find(q=> q.id === id) || null
}

export function saveQuiz(quiz){
  const all = readAll()
  const idx = all.findIndex(q=> q.id === quiz.id)
  if (idx >= 0) all[idx] = { ...all[idx], ...quiz }
  else all.push(quiz)
  try{ localStorage.setItem(KEY, JSON.stringify(all)) }catch{}
  return quiz
}

export function createQuizRecord(data){
  const id = data.id || (crypto?.randomUUID ? crypto.randomUUID() : `q-${Date.now()}`)
  const record = {
    id,
    title: data.title || 'Untitled Quiz',
    description: data.description || '',
    category: data.category || 'General',
    difficulty: data.difficulty || 'Beginner',
    timeLimitMinutes: data.timeLimitMinutes || 10,
    passingScorePercent: data.passingScorePercent || 70,
    immediateResults: !!data.immediateResults,
    questionCount: Array.isArray(data.questions) ? data.questions.length : (data.questionCount || 0),
    status: data.status || 'draft', // draft | published
    createdAt: Date.now(),
  }
  return saveQuiz(record)
}
