'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface IntakeForm {
  id: string
  name: string
  description: string
  is_active: boolean
  created_at: string
}

export default function FormsPage() {
  const [forms, setForms] = useState<IntakeForm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/forms`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setForms(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleFormStatus = async (formId: string, currentStatus: boolean) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (response.ok) {
        setForms(forms.map(f =>
          f.id === formId ? { ...f, is_active: !currentStatus } : f
        ))
      }
    } catch (error) {
      console.error('Error updating form status:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading forms...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intake Forms</h1>
          <p className="text-gray-600 mt-2">Manage your client intake forms</p>
        </div>
        <Link
          href="/dashboard/forms/new"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          + Create Form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">No forms yet</h3>
          <p className="text-gray-600 mb-6">Create your first intake form to get started</p>
          <Link
            href="/dashboard/forms/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Create Your First Form
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {forms.map((form) => (
            <div key={form.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{form.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      form.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {form.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{form.description || 'No description'}</p>
                  <p className="text-sm text-gray-500">
                    Created {new Date(form.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleFormStatus(form.id, form.is_active)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                  >
                    {form.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <Link
                    href={`/dashboard/forms/${form.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
