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
            <p className="text-slate-600">Participant: {selected.participant}</p>
            <p className="text-slate-600">Messages: {selected.messages?.length || 0}</p>
            <p className="text-slate-600">Unread: {selected.unread || 0}</p>
            
            {/* Debug messages array */}
            <div className="mt-4 p-4 bg-slate-100 rounded-lg">
              <p className="text-sm font-medium mb-2">Messages Array Debug:</p>
              <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(selected.messages, null, 2)}
              </pre>
            </div>
            
            {/* Show messages */}
            <div className="mt-4 space-y-2">
              {selected.messages && selected.messages.length > 0 ? (
                selected.messages.map((msg, index) => (
                  <div key={msg.id || index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-medium text-blue-600">From: {msg.sender || 'Unknown'}</p>
                    <p className="text-sm text-slate-800 mt-1">{msg.text || 'No text'}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Time: {msg.at ? new Date(msg.at).toLocaleString() : 'No timestamp'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Message ID: {msg.id || 'No ID'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No messages found</p>
              )}
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
