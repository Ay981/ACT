import AppLayout from '../layouts/AppLayout.jsx'
import { useState, useEffect } from 'react'

export default function Messages(){
  const [test, setTest] = useState('loading')

  useEffect(() => {
    setTimeout(() => setTest('loaded'), 1000)
  }, [])

  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900">Messages Page</h1>
        <p className="text-slate-600 mt-2">Status: {test}</p>
        <button 
          onClick={() => setTest('clicked')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Test Button
        </button>
      </div>
    </AppLayout>
  )
}
