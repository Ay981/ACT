import AppLayout from '../layouts/AppLayout.jsx'
import { useState, useEffect } from 'react'
import { getAdminInstructors, deleteAdminInstructor, approveAdminInstructor } from '../lib/api.js'

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInstructors()
  }, [])

  const loadInstructors = () => {
    setLoading(true)
    getAdminInstructors()
        .then(setInstructors)
        .catch(console.error)
        .finally(() => setLoading(false))
  }

  const handleDelete = async (id) => {
    if(confirm('Are you sure you want to remove this instructor?')) {
        try {
            await deleteAdminInstructor(id)
            setInstructors(instructors.filter(i => i.id !== id))
        } catch (e) {
            alert('Failed to delete instructor: ' + e.message)
        }
    }
  }

  const handleApprove = async (id) => {
      try {
          await approveAdminInstructor(id)
          setInstructors(instructors.map(i => i.id === id ? {...i, status: 'Active'} : i))
      } catch (e) {
          alert('Failed to approve: ' + e.message)
      }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manage Instructors</h1>
            <p className="text-slate-500 text-sm mt-1">View and manage instructor accounts</p>
          </div>
          <button onClick={() => alert('Feature already on Dashboard!')} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm">
            + Invite Instructor
          </button>
        </header>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Courses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {instructors.map((instructor) => (
                <tr key={instructor.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                        {instructor.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{instructor.name}</div>
                        <div className="text-sm text-slate-500">{instructor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      instructor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {instructor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {instructor.courses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {instructor.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {instructor.status === 'Pending' && (
                        <button onClick={() => handleApprove(instructor.id)} className="text-green-600 hover:text-green-900 mr-4">Approve</button>
                    )}
                    <button onClick={() => handleDelete(instructor.id)} className="text-red-600 hover:text-red-900">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
