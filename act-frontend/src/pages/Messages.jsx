import AppLayout from '../layouts/AppLayout.jsx'
import ConversationList from '../components/messages/ConversationList.jsx'
import MessageThread from '../components/messages/MessageThread.jsx'
import MessageComposer from '../components/messages/MessageComposer.jsx'
import { useState, useEffect, useRef } from 'react'
import { getConversations, sendMessage, initConversation, markAsRead } from '../lib/api.js'
import { useLocation } from 'react-router-dom'

export default function Messages(){
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const initiatedRef = useRef(false) // Track if we've handled the route initiation

  const selectedIdRef = useRef(selectedId)
  const itemsRef = useRef(items)

  // Keep refs in sync
  useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])
  useEffect(() => { itemsRef.current = items }, [items])

  useEffect(() => {
    loadConversations()

    // Real-time polling
    const interval = setInterval(() => {
        loadConversations(true)
    }, 3000)

    return () => clearInterval(interval)
  }, [])
  
  // Mark as read when selected or when new messages arrive
  useEffect(() => {
     if (selectedId && items.length > 0) {
         const currentConv = items.find(i => i.id === selectedId)
         // Only trigger if we actually have unread messages locally
         if (currentConv && currentConv.unread > 0) {
             markAsRead(selectedId).then(() => {
                 // Update local state to remove badge immediately
                 setItems(prev => prev.map(item => 
                     item.id === selectedId ? { ...item, unread: 0 } : item
                 ))
             }).catch(err => console.error("Failed to mark read", err))
         }
     }
  }, [selectedId, items])

  const loadConversations = (isBackground = false) => {
    if (!isBackground) setLoading(true)

    getConversations().then(async data => {
      let currentItems = data
      
      // Handle navigation from course page (only on first load)
      const initiateChatUserId = location.state?.initiateChat
      if (!isBackground && initiateChatUserId && !initiatedRef.current) {
          initiatedRef.current = true
          // Check if we already have a conversation with this user
          // Note: Backend might return 'instructor_id' or similar, we need to match user logic
          // Assuming conversation.id is the Conversation ID, but initiateChatUserId is a USER ID.
          // We need to check participants. 
          // Since getConversations() returns list of conversations, we might not have user_id exposed easily
          // unless the API structure is known. 
          // For now, let's assume getConversations returns needed data.
          // BUT - initiateChat uses separate endpoint to create/get conv.
          
          try {
              const newConv = await initConversation(initiateChatUserId)
              // Check if newConv is already in currentItems
              const exists = currentItems.find(c => c.id === newConv.id)
              if (exists) {
                  setSelectedId(exists.id)
              } else {
                  currentItems = [newConv, ...currentItems]
                  setSelectedId(newConv.id)
              }
          } catch (e) {
              console.error("Failed to init chat", e)
          }
      } else if (!isBackground && currentItems.length > 0 && !selectedIdRef.current) {
        setSelectedId(currentItems[0].id)
      }

      // MERGE LOGIC: If polling (background), ensure we don't drop the currently selected conversation
      // if it hasn't appeared in the backend list yet (e.g. created but no messages sent).
      if (isBackground) {
          const currentSelectedId = selectedIdRef.current
          const currentLocalItems = itemsRef.current
          
          if (currentSelectedId) {
              const selectedItem = currentLocalItems.find(i => i.id === currentSelectedId)
              const existsInNew = currentItems.find(i => i.id === currentSelectedId)
              
              if (selectedItem && !existsInNew) {
                  // Prepend the missing active conversation
                  currentItems = [selectedItem, ...currentItems]
              }
          }
      }
      
      setItems(currentItems)
    }).finally(() => {
        if (!isBackground) setLoading(false)
    })
  }

  const selected = items.find(i => i.id === selectedId)

  const handleSend = async (text) => {
    if (!selected) return

    // Optimistic update
    const tempId = Math.random().toString(36).slice(2,9)
    const newMessage = { id: tempId, sender: 'student', text, at: new Date().toISOString() }
    
    setItems(prev => prev.map(c => c.id === selectedId ? ({
      ...c,
      messages: [...c.messages, newMessage],
      lastMessageAt: new Date().toISOString(),
    }) : c))

    try {
      await sendMessage(selected.id, text)
      // Ideally substitute tempId with real ID or re-fetch
      loadConversations() // Re-fetch to confirm sync
    } catch (err) {
      console.error("Failed to send message", err)
      alert("Failed to send message")
      // Revert optimistic update
      loadConversations() 
    }
  }

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl h-[70vh]">
          <ConversationList items={items} selectedId={selectedId} onSelect={setSelectedId} query={query} onQueryChange={setQuery} />
        </aside>
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl h-[70vh] overflow-hidden flex flex-col">
          {selected ? (
            <>
              <MessageThread conversation={selected} />
              <MessageComposer onSend={handleSend} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
               Select or start a conversation
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
