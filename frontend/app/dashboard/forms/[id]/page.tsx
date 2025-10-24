'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface IntakeForm {
  id: string
  name: string
  description: string
  retainer_amount: string
  payment_required: boolean
  is_active: boolean
  fields_schema: any
  created_at: string
  updated_at: string
}

export default function FormDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const formId = params.id as string

  const [form, setForm] = useState<IntakeForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [submissionCount, setSubmissionCount] = useState(0)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Fetch form details
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/forms/${formId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/submissions?form_id=${formId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ])
      .then(async ([formRes, submissionsRes]) => {
        if (!formRes.ok) throw new Error('Form not found')

        const formData = await formRes.json()
        const submissionsData = await submissionsRes.json()

        setForm(formData)
        setSubmissionCount(submissionsData.total || 0)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching form:', error)
        setLoading(false)
      })
  }, [formId, router])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/forms/${formId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        router.push('/dashboard/forms')
      }
    } catch (error) {
      console.error('Error deleting form:', error)
    }
  }

  const toggleFormStatus = async () => {
    if (!form) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !form.is_active }),
      })

      if (response.ok) {
        setForm({ ...form, is_active: !form.is_active })
      }
    } catch (error) {
      console.error('Error updating form status:', error)
    }
  }

  const copyFormLink = () => {
    const link = `${window.location.origin}/intake/${formId}`
    navigator.clipboard.writeText(link)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  if (loading) {
    return <div className="text-center py-12">Loading form details...</div>
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Form not found</h2>
        <Link href="/dashboard/forms" className="text-blue-600 hover:text-blue-700">
          Back to Forms
        </Link>
      </div>
    )
  }

  const fields = form.fields_schema?.properties ? Object.entries(form.fields_schema.properties) : []
  const requiredFields = form.fields_schema?.required || []

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/forms" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Forms
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{form.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                form.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {form.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-gray-600">{form.description || 'No description'}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleFormStatus}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
            >
              {form.is_active ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Submissions</p>
          <p className="text-3xl font-bold text-gray-900">{submissionCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Retainer Amount</p>
          <p className="text-3xl font-bold text-gray-900">
            {form.retainer_amount ? `$${form.retainer_amount}` : '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Payment Required</p>
          <p className="text-3xl font-bold text-gray-900">
            {form.payment_required ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      {/* Share Link */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Share Form</h2>
        <p className="text-gray-600 mb-4">Share this link with your clients to collect intake information</p>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/intake/${formId}`}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-mono text-sm"
          />
          <button
            onClick={copyFormLink}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            {copySuccess ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Form Fields ({fields.length})</h2>

        {fields.length === 0 ? (
          <p className="text-gray-600">No fields configured</p>
        ) : (
          <div className="space-y-3">
            {fields.map(([fieldName, fieldConfig]: [string, any], index) => (
              <div key={fieldName} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-gray-500 w-8">{index + 1}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{fieldConfig.title || fieldName}</p>
                    <p className="text-sm text-gray-600">Field name: {fieldName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 capitalize">
                    {fieldConfig.type || 'text'}
                  </span>
                  {requiredFields.includes(fieldName) && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      Required
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Submissions</h2>
          <Link
            href={`/dashboard/submissions?form_id=${formId}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        {submissionCount === 0 ? (
          <p className="text-gray-600">No submissions yet</p>
        ) : (
          <p className="text-gray-600">{submissionCount} submissions received</p>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-6 text-sm text-gray-500">
        <p>Created: {new Date(form.created_at).toLocaleString()}</p>
        <p>Last updated: {new Date(form.updated_at).toLocaleString()}</p>
      </div>
    </div>
  )
}
