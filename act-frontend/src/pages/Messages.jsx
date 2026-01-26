import AppLayout from '../layouts/AppLayout.jsx'
import ConversationList from '../components/messages/ConversationList.jsx'
import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import * as api from '../lib/api.js'

// Cache bust: 2026-01-26-12-03

export default function Messages(){
  const location = useLocation()
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [draft, setDraft] = useState('')
  const initHandledRef = useRef(false)

  // Polling for new messages
  const pollingRef = useRef(null)

  const loadConversations = async (isBackground = false) => {
    try {
      console.log('Loading conversations (background:', isBackground, ')')
      const data = await api.getConversations()
      console.log('Conversations loaded:', data)
      
      // Apply localStorage read state to conversations
      const dataWithReadState = data.map(conv => {
        const readTime = localStorage.getItem(`conversation_${conv.id}_read`)
        if (readTime) {
          // If conversation was marked as read within last 10 minutes, keep unread at 0
          const timeSinceRead = Date.now() - parseInt(readTime)
          if (timeSinceRead < 600000) { // 10 minutes
            console.log(`Keeping conversation ${conv.id} as read`)
            return { ...conv, unread: 0 }
          } else {
            // Clear old read state
            localStorage.removeItem(`conversation_${conv.id}_read`)
          }
        }
        return conv
      })
      
      const params = new URLSearchParams(location.search)
      const hasDeepLink = !!(location.state?.initiateChat || params.get('instructor'))

      // Auto-select first conversation if available
      if (!isBackground && dataWithReadState.length > 0 && !selectedId && !hasDeepLink) {
        setSelectedId(dataWithReadState[0].id)
        console.log('Auto-selected conversation:', dataWithReadState[0].id)
      }
      
      setItems(dataWithReadState)
      return dataWithReadState
    } catch (e) {
      console.error("Failed to load conversations", e)
      setError(e.message)
      // Set some dummy data to prevent white screen
      if (!isBackground) {
        setItems([{
          id: 1,
          title: "Test Conversation",
          participant: "Test User",
          messages: [
            { id: 1, text: "Hello", sender: "student", at: new Date().toISOString() }
          ]
        }])
      }
      return null
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  // Start polling for real-time updates
  const startPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    
    pollingRef.current = setInterval(() => {
      loadConversations(true) // Background refresh
    }, 5000) // Poll every 5 seconds
  }

  // Stop polling
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  useEffect(() => {
    console.log('Messages component mounted')
    loadConversations()
    startPolling()
    
    // Cleanup on unmount
    return () => stopPolling()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const deepLinkInstructor = location.state?.initiateChat || params.get('instructor')
    if (!deepLinkInstructor) return
    if (initHandledRef.current) return
    if (loading) return
    initHandledRef.current = true

    ;(async () => {
      try {
        const instructorId = String(deepLinkInstructor)
        console.log('=== DEEP-LINK DEBUG ===')
        console.log('Instructor ID from deep link:', instructorId)

        // Ensure the conversation exists
        const initResult = await api.initConversation(instructorId)
        console.log('initConversation result:', initResult)

        // If initConversation returns a conversation with an id, select it immediately
        const initId = initResult?.id
        if (initId) {
          setSelectedId(initId)
          console.log('Selected conversation from initConversation result:', initId)
          // Ensure the new conversation appears in the UI immediately
          setItems(prev => {
            const exists = prev.some(c => c.id === initId)
            if (!exists && initResult) {
              return [initResult, ...prev]
            }
            return prev
          })
        }

        // Reload conversations to get the latest list (important if list was empty before)
        const refreshed = await loadConversations(false)
        let list = refreshed || []
        console.log('Conversations after reload:', list)

        // If we selected a new conversation via initConversation and it's not in the list, add it back
        if (initId && initResult && !list.some(c => c.id === initId)) {
          list = [initResult, ...list]
          setItems(list)
          console.log('Added new conversation back to list after reload')
        }

        // If we didn't already select via initResult, try to find by matching instructor
        if (!initId) {
          const match = list.find(c => (
            String(c?.participant_id) === instructorId ||
            String(c?.participant?.id) === instructorId ||
            String(c?.partner_id) === instructorId ||
            String(c?.user_id) === instructorId ||
            String(c?.recipient_id) === instructorId ||
            String(c?.participant) === instructorId
          ))
          console.log('Matched conversation for instructor:', match)

          if (match?.id) {
            setSelectedId(match.id)
            console.log('Selected conversation ID from match:', match.id)
          }
        }
        // Always open chat panel on mobile when deep-linking
        setShowChat(true)
        console.log('=== END DEEP-LINK DEBUG ===')
      } catch (e) {
        console.error('Deep-link error:', e)
        setShowChat(true)
      }
    })()
  }, [location.search, location.state, loading])

  // Restart polling when selected conversation changes
  useEffect(() => {
    if (selectedId) {
      startPolling()
      // Mark conversation as read when selected
      markConversationAsRead(selectedId)
    }
  }, [selectedId])

  // Mark conversation as read
  const markConversationAsRead = async (conversationId) => {
    try {
      const selected = items.find(i => i.id === conversationId)
      if (selected && selected.participant) {
        console.log('=== MARKING CONVERSATION AS READ DEBUG ===')
        console.log('Selected conversation:', selected)
        console.log('Participant to mark as read:', selected.participant)
        
        // Clear unread count for this conversation immediately
        setItems(prev => prev.map(c => 
          c.id === conversationId ? { ...c, unread: 0 } : c
        ))
        
        // Store the cleared state in localStorage to persist through polling
        localStorage.setItem(`conversation_${conversationId}_read`, Date.now().toString())
        
        // Try the API call first
        try {
          const response = await api.markAsRead(selected.participant)
          console.log('Mark as read response:', response)
        } catch (apiError) {
          console.log('API mark as read failed, using manual approach:', apiError.message)
          
          // Manual approach: reduce unread count by the number of unread messages in this conversation
          const unreadInThisConversation = selected.messages?.filter(msg => 
            msg.sender !== 'student' && !msg.is_read
          ).length || 0
          
          if (unreadInThisConversation > 0) {
            console.log(`Manually reducing unread count by ${unreadInThisConversation}`)
            
            // Get current unread count from localStorage or use a default
            const currentUnread = parseInt(localStorage.getItem('current_unread_count') || '0')
            const newUnread = Math.max(0, currentUnread - unreadInThisConversation)
            
            // Update localStorage to track the reduction
            localStorage.setItem('current_unread_count', newUnread.toString())
            localStorage.setItem('manual_unread_adjustment', Date.now().toString())
            
            // Trigger header refresh
            window.dispatchEvent(new CustomEvent('refresh-header'))
          }
        }
        
        console.log('=== END MARKING CONVERSATION AS READ DEBUG ===')
      }
    } catch (err) {
      console.error('Failed to mark conversation as read:', err)
    }
  }

  const selected = items.find(i => i.id === selectedId)
  const finalUnread = items.reduce((total, conv) => total + (conv.unread || 0), 0)

  const handleSelectConversation = (id) => {
    console.log('Selected conversation:', id)
    setSelectedId(id)
    setShowChat(true)
  }

  const handleBackToList = () => {
    setShowChat(false)
  }

  const handleSend = async (text) => {
    console.log('Sending message:', text)
    if (!selected) return

    // Optimistic update - show message immediately
    const tempId = Date.now().toString()
    const newMessage = { 
      id: tempId, 
      sender: 'student', 
      text, 
      at: new Date().toISOString() 
    }
    
    setItems(prev => prev.map(c => c.id === selectedId ? ({
      ...c,
      messages: [...c.messages, newMessage],
      lastMessageAt: new Date().toISOString(),
    }) : c))

    // Actually send to API - try different approaches
    try {
      console.log('=== SENDING MESSAGE DEBUG ===')
      console.log('Selected conversation:', selected)
      console.log('Conversation ID:', selected.id)
      console.log('Participant:', selected.participant)
      
      // Try multiple approaches to find the right recipient ID
      let recipientId = selected.participant
      
      // Approach 1: Try conversation ID
      console.log('=== TRYING CONVERSATION ID ===')
      try {
        const response1 = await api.sendMessage(selected.id, text)
        console.log('SUCCESS with conversation ID:', response1)
        console.log('=== END DEBUG ===')
        return
      } catch (err1) {
        console.log('FAILED with conversation ID:', err1.message)
      }
      
      // Approach 2: Try participant username
      console.log('=== TRYING PARTICIPANT USERNAME ===')
      try {
        const response2 = await api.sendMessage(selected.participant, text)
        console.log('SUCCESS with participant username:', response2)
        console.log('=== END DEBUG ===')
        return
      } catch (err2) {
        console.log('FAILED with participant username:', err2.message)
      }
      
      // Approach 3: Try to extract user ID from messages
      if (selected.messages && selected.messages.length > 0) {
        const instructorMessage = selected.messages.find(msg => msg.sender === 'instructor')
        if (instructorMessage && instructorMessage.sender_id) {
          console.log('=== TRYING SENDER_ID FROM MESSAGES ===')
          try {
            const response3 = await api.sendMessage(instructorMessage.sender_id, text)
            console.log('SUCCESS with sender_id:', response3)
            console.log('=== END DEBUG ===')
            return
          } catch (err3) {
            console.log('FAILED with sender_id:', err3.message)
          }
        }
      }
      
      // If all approaches fail
      throw new Error('All sending approaches failed')
      
    } catch (err) {
      console.error('=== FINAL ERROR DEBUG ===')
      console.error('All approaches failed:', err)
      console.error('=== END ERROR DEBUG ===')
      alert('Failed to send message: ' + err.message)
      // Remove the optimistic update on error
      setItems(prev => prev.map(c => c.id === selectedId ? ({
        ...c,
        messages: c.messages.filter(m => m.id !== tempId),
      }) : c))
    }
  }

  return (
    <AppLayout hideMobileFooter={showChat}>
      <div className="flex flex-col lg:h-[70vh] h-[calc(100vh-80px)]">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">Messages</h1>
          <div className="flex items-center gap-2">
            {finalUnread > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {finalUnread}
              </span>
            )}
          </div>
        </div>
        
        {/* Mobile and Desktop Layout */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Conversation List */}
          <aside className={`${selected && showChat ? 'hidden lg:block' : 'block'} lg:flex-1 bg-white border-b lg:border-b-0 lg:border-r lg:border-slate-200 rounded-2xl lg:rounded-none lg:border-none overflow-hidden flex flex-col min-h-0`}>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <ConversationList 
                items={items} 
                selectedId={selectedId} 
                onSelect={handleSelectConversation}
                query={query} 
                onQueryChange={setQuery} 
              />
            </div>
          </aside>
          
          {/* Chat Section */}
          <section className={`${selected && showChat ? 'block' : 'hidden'} lg:block lg:flex-2 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-full lg:h-full min-h-0`}>
            {selected ? (
              <div className="flex flex-col h-full min-h-0">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleBackToList}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h3 className="font-semibold text-slate-900">{selected.title}</h3>
                      <p className="text-sm text-slate-600">{selected.participant}</p>
                    </div>
                  </div>
                  {selected.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {selected.unread}
                    </span>
                  )}
                </div>
                
                {/* Desktop Header */}
                <div className="hidden lg:block px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{selected.title}</h3>
                    <p className="text-sm text-slate-600">{selected.participant}</p>
                  </div>
                  {selected.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {selected.unread}
                    </span>
                  )}
                </div>
                
                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 min-h-0 overscroll-contain touch-pan-y lg:overscroll-auto lg:touch-auto"
                  style={{ WebkitOverflowScrolling: 'touch', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 132px)' }}
                >
                  {selected.messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'student' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-slate-200 text-slate-800'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Message Input */}
                <>
                  {/* Mobile: fixed input bar (prevents disappearing on scroll/address-bar changes) */}
                  <div
                    className="lg:hidden fixed left-0 right-0 bottom-0 z-50 bg-white border-t border-slate-200 p-4"
                    style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
                  >
                    <div className="mx-auto max-w-7xl">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Type a message..."
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && draft.trim()) {
                              handleSend(draft)
                              setDraft('')
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            if (draft.trim()) {
                              handleSend(draft)
                              setDraft('')
                            }
                          }}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop: sticky within panel */}
                  <div className="hidden lg:block p-4 border-t border-slate-200 bg-white sticky bottom-0 z-10">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type a message..."
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && draft.trim()) {
                            handleSend(draft)
                            setDraft('')
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          if (draft.trim()) {
                            handleSend(draft)
                            setDraft('')
                          }
                        }}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              </div>
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
        </div>
      </div>
    </AppLayout>
  )
}
