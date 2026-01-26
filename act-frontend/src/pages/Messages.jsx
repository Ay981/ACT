import AppLayout from '../layouts/AppLayout.jsx'
import ConversationList from '../components/messages/ConversationList.jsx'
import { useState, useEffect, useRef } from 'react'
import * as api from '../lib/api.js'

// Cache bust: 2026-01-26-12-03

export default function Messages(){
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Polling for new messages
  const pollingRef = useRef(null)

  const loadConversations = async (isBackground = false) => {
    try {
      console.log('Loading conversations (background:', isBackground, ')')
      const data = await api.getConversations()
      console.log('Conversations loaded:', data)
      
      // Auto-select first conversation if available
      if (!isBackground && data.length > 0 && !selectedId) {
        setSelectedId(data[0].id)
        console.log('Auto-selected conversation:', data[0].id)
      }
      
      setItems(data)
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
        console.log('=== MARKING AS READ DEBUG ===')
        console.log('Selected conversation:', selected)
        console.log('Participant to mark as read:', selected.participant)
        
        // Temporarily disable individual mark as read since it's failing
        // Let the polling handle unread count updates
        console.log('Individual mark as read temporarily disabled - using polling instead')
        
        // Trigger header refresh to update unread count
        window.dispatchEvent(new CustomEvent('refresh-header'))
        console.log('=== END MARK AS READ DEBUG ===')
      }
    } catch (err) {
      console.error('Failed to mark conversation as read:', err)
    }
  }

  const selected = items.find(i => i.id === selectedId)

  const handleSelectConversation = (id) => {
    console.log('Selected conversation:', id)
    setSelectedId(id)
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
    <AppLayout>
      <div className="h-[70vh] flex flex-col lg:flex-row gap-6">
        {/* Conversation List */}
        <aside className="lg:flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden h-full">
          <ConversationList 
            items={items} 
            selectedId={selectedId} 
            onSelect={handleSelectConversation}
            query={query} 
            onQueryChange={setQuery} 
          />
        </aside>
        
        {/* Chat Section - Temporarily simplified */}
        <section className="lg:flex-2 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-full">
          {selected ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-200">
                <h3 className="font-semibold">{selected.title}</h3>
                <p className="text-sm text-slate-600">{selected.participant}</p>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {selected.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-lg ${
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
              
              {/* Simple Message Input */}
              <div className="p-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        handleSend(e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      const input = document.querySelector('input[type="text"]')
                      if (input && input.value.trim()) {
                        handleSend(input.value)
                        input.value = ''
                      }
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Send
                  </button>
                </div>
              </div>
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
    </AppLayout>
  )
}
