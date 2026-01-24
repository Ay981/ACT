import { useMemo, useState, useEffect } from 'react'
import CommentComposer from './CommentComposer.jsx'
import CommentItem from './CommentItem.jsx'
import { getComments, createComment, updateComment, deleteComment, toggleLikeComment } from '../../lib/api.js'

export default function CommentsSection({ initialComments = [], context = null, currentUser = null }){
  const [comments, setComments] = useState(initialComments)
  const [sort, setSort] = useState('recent')

  useEffect(() => {
    if (context) {
        getComments(context.type, context.id).then(setComments).catch(console.error)
    }
  }, [context?.id, context?.type])

  const sorted = useMemo(() => {
    const arr = [...comments]
    if (sort === 'recent') arr.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))
    if (sort === 'top') arr.sort((a,b)=>(b.likes||0)-(a.likes||0))
    return arr
  }, [comments, sort])

  const addRoot = async (text) => {
    if (context) {
        try {
            const newComment = await createComment({ ...context, content: text })
            setComments([newComment, ...comments])
        } catch (e) {
            alert("Failed to post comment")
        }
    } else {
        setComments([{ id: cryptoId(), author: currentUser?.name || 'You', userId: currentUser?.id, text, likes: 0, createdAt: new Date().toISOString(), replies: [] }, ...comments])
    }
  }

  const addReply = async (parentId, text) => {
      if (context) {
          try {
              const reply = await createComment({ ...context, content: text, parent_id: parentId })
              // Optimistic update or refetch? Let's optimistic update manually
              setComments(list => list.map(c => c.id === parentId ? ({...c, replies: [reply, ...(c.replies||[])]}) : ({...c, replies: addReplyDeep(c.replies, parentId, text, reply)})))
          } catch (e) {
              alert("Failed to reply")
          }
      } else {
         setComments(list => list.map(c => c.id === parentId ? ({...c, replies: [...(c.replies||[]), { id: cryptoId(), author: currentUser?.name || 'You', userId: currentUser?.id, text, likes:0, createdAt: new Date().toISOString(), replies: [] }]}) : ({...c, replies: addReplyDeep(c.replies, parentId, text, null, currentUser)})))
      }
  }
  
  const handleEditComment = async (id, text) => {
    if (context) {
        try {
            await updateComment(id, text)
        } catch(e) {
            alert("Failed to update comment")
            return
        }
    }
    setComments(list => list.map(c => c.id===id? {...c, text} : {...c, replies: editDeep(c.replies, id, text)}))
  }
  const handleDeleteComment = async (id) => {
     if (context) {
        if (!confirm("Are you sure?")) return
        try {
            await deleteComment(id)
        } catch(e) {
            alert("Failed to delete comment")
            return
        }
    }
    setComments(list => list.filter(c => c.id!==id).map(c => ({...c, replies: deleteDeep(c.replies, id)})))
  }
  const toggleLike = async (id) => {
    try {
        const { liked, likes_count } = await toggleLikeComment(id)
        setComments(list => likeDeep(list, id, liked, likes_count))
    } catch(e) {
        // revert optimistic or just show error
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6">
      <h3 className="font-semibold">Add a comment</h3>
      <div className="mt-3">
        <CommentComposer onSubmit={addRoot} submitLabel="Comment" />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h4 className="font-semibold">Comments on this item</h4>
        <div className="text-sm">
          <label className="mr-2 text-slate-600">Sort</label>
          <select value={sort} onChange={(e)=>setSort(e.target.value)} className="rounded-lg border-slate-300 text-sm">
            <option value="recent">Most recent</option>
            <option value="top">Top</option>
          </select>
        </div>
      </div>

      <div className="mt-4 space-y-6">
        {comments.length === 0 && context && <div className="text-slate-500 text-sm">No comments yet. Be the first!</div>}
        {sorted.map(c => (
          <CommentItem key={c.id} comment={c} currentUser={currentUser} onReply={addReply} onEdit={handleEditComment} onDelete={handleDeleteComment} onLike={toggleLike} />
        ))}
      </div>
    </div>
  )
}

function cryptoId(){
  return Math.random().toString(36).slice(2,9)
}

function likeDeep(list = [], id, liked, count){
    return list?.map(r => r.id===id ? ({...r, likes: count, isLiked: liked}) : ({...r, replies: likeDeep(r.replies, id, liked, count)}))
}

function addReplyDeep(list = [], parentId, text, apiReply = null, currentUser = null){
  return list?.map(r => r.id===parentId 
    ? ({...r, replies:[ apiReply || { id: cryptoId(), author: currentUser?.name || 'You', userId: currentUser?.id, text, likes:0, createdAt: new Date().toISOString(), replies: [] }, ...(r.replies||[])]}) 
    : ({...r, replies:addReplyDeep(r.replies, parentId, text, apiReply, currentUser)}))
}
function editDeep(list = [], id, text){
  return list?.map(r => r.id===id ? ({...r, text}) : ({...r, replies: editDeep(r.replies, id, text)}))
}
function deleteDeep(list = [], id){
  return list?.filter(r => r.id!==id).map(r => ({...r, replies: deleteDeep(r.replies, id)}))
}
