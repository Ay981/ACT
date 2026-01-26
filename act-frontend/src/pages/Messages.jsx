import AppLayout from '../layouts/AppLayout.jsx'
import ConversationList from '../components/messages/ConversationList.jsx'
import MessageThread from '../components/messages/MessageThread.jsx'
import MessageComposer from '../components/messages/MessageComposer.jsx'
import { useState, useEffect, useRef } from 'react'
import { getConversations, sendMessage, initConversation, markAsRead } from '../lib/api.js'
import { useLocation, useSearchParams } from 'react-router-dom'

export default function Messages(){
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const location = useLocation()
  const [searchParams] = useSearchParams()
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
      
      // Handle navigation from course page or URL parameter (only on first load)
      const initiateChatUserId = location.state?.initiateChat || searchParams.get('instructor')
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
              // Show chat on mobile when conversation is initiated
              setShowChat(true)
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

  const handleSelectConversation = (id) => {
    setSelectedId(id)
    setShowChat(true) // Show chat on mobile when conversation is selected
  }

  const handleBackToList = () => {
    setShowChat(false) // Show conversation list on mobile
  }

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
    <>
      {/* Mobile Full Screen Layout */}
      <div className="lg:hidden fixed inset-0 bg-white z-50 flex flex-col">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <h1 className="text-lg font-semibold text-slate-900">Messages</h1>
          <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>
        
        {/* Mobile Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500">Loading conversations...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Conversation List - Always visible on mobile when not in chat */}
              <aside className={`${showChat ? 'hidden' : 'block'} flex-1 bg-white`}>
                <ConversationList items={items} selectedId={selectedId} onSelect={handleSelectConversation} query={query} onQueryChange={setQuery} />
              </aside>
              
              {/* Chat Section - Hidden on mobile until conversation selected */}
              <section className={`${!showChat ? 'hidden' : 'block'} flex-1 bg-white flex flex-col`}>
                {selected ? (
                  <>
                    {/* Mobile Back Button */}
                    <div className="flex items-center p-4 border-b border-slate-200 bg-white">
                      <button 
                        onClick={handleBackToList}
                        className="mr-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{selected.title}</h3>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                      <MessageThread conversation={selected} />
                    </div>
                    <MessageComposer onSend={handleSend} />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                     <div className="text-center p-8">
                       <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                       </svg>
                       <p className="text-lg font-medium">Select a conversation</p>
                       <p className="text-sm mt-2">Choose a contact to start messaging</p>
                     </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <AppLayout>
          <div className="h-[70vh] flex flex-col lg:flex-row gap-6">
            {loading ? (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-500">Loading conversations...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Conversation List - Always visible on desktop */}
                <aside className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden h-full">
                  <ConversationList items={items} selectedId={selectedId} onSelect={handleSelectConversation} query={query} onQueryChange={setQuery} />
                </aside>
                
                {/* Chat Section - Always visible on desktop */}
                <section className="flex-2 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-full">
                  {selected ? (
                    <>
                      <MessageThread conversation={selected} />
                      <MessageComposer onSend={handleSend} />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                       <div className="text-center">
                         <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                         </svg>
                         <p className="text-lg font-medium">Select a conversation</p>
                         <p className="text-sm mt-2">Choose a contact to start messaging</p>
                       </div>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </AppLayout>
      </div>
    </>
  )
}
