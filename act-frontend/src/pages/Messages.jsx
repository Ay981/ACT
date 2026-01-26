import AppLayout from '../layouts/AppLayout.jsx'
import ConversationList from '../components/messages/ConversationList.jsx'
import { useState, useEffect } from 'react'
import { getConversations } from '../lib/api.js'

export default function Messages(){
  const [test, setTest] = useState('loading')
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Test basic functionality first
    setTimeout(() => setTest('loaded'), 1000)
    
    // Load conversations
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const data = await getConversations()
      setItems(data)
      console.log('Loaded conversations:', data)
      
      // Auto-select first conversation if available
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id)
      }
    } catch (e) {
      console.error("Failed to load conversations", e)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectConversation = (id) => {
    console.log('Selected conversation:', id)
    setSelectedId(id)
  }

  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900">Messages Page</h1>
        <p className="text-slate-600 mt-2">Status: {test}</p>
        <p className="text-slate-600 mt-1">Conversations: {items.length}</p>
        <button 
          onClick={() => setTest('clicked')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Test Button
        </button>
        
        {/* Test ConversationList */}
        <div className="mt-8 max-w-md">
          <ConversationList 
            items={items} 
            selectedId={selectedId} 
            onSelect={handleSelectConversation}
            query="" 
            onQueryChange={() => {}} 
          />
        </div>
      </div>
    </AppLayout>
  )
}
