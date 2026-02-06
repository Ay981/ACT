export const conversations = [
  {
    id: 't1',
    title: 'Intro to Databases',
    participant: 'Dr. A. Semma',
    unread: 2,
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    messages: [
      { id: 'm1', sender: 'instructor', text: 'Please review chapter 2 before the quiz.', at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), read: false },
      { id: 'm2', sender: 'student', text: 'Got it — thanks!', at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), read: true },
      { id: 'm3', sender: 'instructor', text: 'Sharing a resource link shortly.', at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), read: false },
    ],
  },
  {
    id: 't2',
    title: 'Data Structures with Java',
    participant: 'Michael Busch',
    unread: 0,
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    messages: [
      { id: 'm1', sender: 'student', text: 'Can you clarify Big-O for linked lists?', at: new Date(Date.now() - 1000 * 60 * 620).toISOString(), read: true },
      { id: 'm2', sender: 'instructor', text: 'Sure — check lecture 3 slide 14.', at: new Date(Date.now() - 1000 * 60 * 600).toISOString(), read: true },
    ],
  },
]
