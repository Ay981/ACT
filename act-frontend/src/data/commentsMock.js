export const commentsSeed = [
  {
    id: 'm1',
    author: 'Michael Busch',
    text: 'Dummy comment – But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born…',
    likes: 12,
    createdAt: new Date(Date.now() - 1000*60*60*24*7).toISOString(),
    replies: [
      {
        id: 'm1r1',
        author: 'Jason',
        text: 'Dummy comment – But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences…',
        likes: 3,
        createdAt: new Date(Date.now() - 1000*60*60*24*6).toISOString(),
        replies: []
      }
    ]
  }
]

export default commentsSeed

