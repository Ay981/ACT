import AppLayout from '../layouts/AppLayout.jsx'
import ConversationList from '../components/messages/ConversationList.jsx'
import { useState, useEffect, useRef } from 'react'
import { getConversations } from '../lib/api.js'

export default function Messages(){
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const loadConversations = async () => {
    try {
      const data = await getConversations()
      console.log('Conversations loaded:', data)
      setItems(data)
      
      // Auto-select first conversation if available
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id)
        console.log('Auto-selected conversation:', data[0].id)
      }
    } catch (e) {
      console.error("Failed to load conversations", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  const selected = items.find(i => i.id === selectedId)

  const handleSelectConversation = (id) => {
    console.log('Selected conversation:', id)
    setSelectedId(id)
  }

  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-600 mt-2">Loading: {loading ? 'Yes' : 'No'}</p>
        <p className="text-slate-600 mt-1">Conversations: {items.length}</p>
        <p className="text-slate-600 mt-1">Selected: {selectedId || 'None'}</p>
        
        {selected && (
          <div className="mt-8 p-6 bg-white border border-slate-200 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Selected Conversation</h2>
            <p className="text-slate-600">ID: {selected.id}</p>
            <p className="text-slate-600">Title: {selected.title}</p>
            <p className="text-slate-600">Messages: {selected.messages?.length || 0}</p>
            
            {/* Show messages */}
            <div className="mt-4 space-y-2">
              {selected.messages?.map((msg, index) => (
                <div key={msg.id || index} className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium">From: {msg.sender}</p>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs text-slate-500">{new Date(msg.at).toLocaleString()}</p>
                </div>
              )) || <p className="text-slate-500">No messages</p>}
            </div>
          </div>
        )}
        
        {/* Conversation List */}
        <div className="mt-8 max-w-md">
          <ConversationList 
            items={items} 
            selectedId={selectedId} 
            onSelect={handleSelectConversation}
            query={query} 
            onQueryChange={setQuery} 
          />
        </div>
      </div>
    </AppLayout>
  )
}
