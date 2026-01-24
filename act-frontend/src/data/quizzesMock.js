// Mock quizzes dataset for student quiz flow
// Each quiz contains metadata and an array of questions

const quizzes = {
  'ai-foundations': {
    id: 'ai-foundations',
    title: 'Foundations of AI - Chapter 1 Quiz',
    description: 'Covers introduction, history, and core concepts of AI.',
    timeLimitMinutes: 10,
    passingScorePercent: 70,
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        prompt: 'Which of the following best describes Artificial Intelligence?',
        options: [
          'A branch of computer science focused on enabling machines to perform tasks that typically require human intelligence.',
          'A mechanical process of compiling programs without errors.',
          'A system for storing and retrieving large datasets.',
          'A set of rules for creating user interfaces.'
        ],
        correctIndex: 0,
        explanation: 'AI focuses on tasks like learning, reasoning, and perception that normally require human intelligence.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        prompt: 'Who is widely considered a pioneer of AI for the Turing Test?',
        options: [
          'John McCarthy',
          'Alan Turing',
          'Marvin Minsky',
          'Norbert Wiener'
        ],
        correctIndex: 1,
        explanation: 'Alan Turing proposed the Turing Test to evaluate a machine\'s ability to exhibit intelligent behavior.'
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        prompt: 'In search problems, which algorithm guarantees the shortest path in a weighted graph if all weights are non-negative?',
        options: [
          'Depth-First Search',
          'Breadth-First Search',
          'Dijkstra\'s Algorithm',
          'Hill Climbing'
        ],
        correctIndex: 2,
        explanation: 'Dijkstra\'s Algorithm finds the shortest path with non-negative edge weights.'
      }
    ]
  }
}

export default quizzes
