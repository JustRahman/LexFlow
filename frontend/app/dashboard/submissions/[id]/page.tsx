'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Submission {
  id: string
  form_id: string
  client_id: string
  form_data: Record<string, any>
  signature_status: string
  payment_status: string
  status: string
  created_at: string
  updated_at: string
}

interface Client {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  status: string
}

interface IntakeForm {
  id: string
  name: string
  description: string
  retainer_amount: string
  payment_required: boolean
}

export default function SubmissionDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const submissionId = params.id as string

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [form, setForm] = useState<IntakeForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Fetch submission details
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/submissions/${submissionId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Submission not found')
        return res.json()
      })
      .then(async (submissionData) => {
        setSubmission(submissionData)

        // Fetch client details
        const clientRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients/${submissionData.client_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (clientRes.ok) {
          const clientData = await clientRes.json()
          setClient(clientData)
        }

        // Fetch form details
        const formRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/forms/${submissionData.form_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (formRes.ok) {
          const formData = await formRes.json()
          setForm(formData)
        }

        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching submission:', error)
        setLoading(false)
      })
  }, [submissionId, router])

  const updateStatus = async (newStatus: string) => {
    const token = localStorage.getItem('token')
    if (!token || !submission) return

    setUpdating(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setSubmission({ ...submission, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'processing':
        return 'bg-blue-100 text-blue-700'
      case 'submitted':
        return 'bg-yellow-100 text-yellow-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      case 'pending':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading submission details...</div>
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission not found</h2>
        <Link href="/dashboard/submissions" className="text-blue-600 hover:text-blue-700">
          Back to Submissions
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/submissions" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Submissions
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submission Details</h1>
            <p className="text-gray-600 font-mono text-sm">ID: {submission.id}</p>
          </div>
          <div className="flex gap-2">
            {submission.signature_status === 'signed' && (
              <Link
                href={`/signed-agreement/${submission.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                View Signed Agreement
              </Link>
            )}
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
            >
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Status</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(submission.status)}`}>
            {submission.status}
          </span>
          <div className="mt-4">
            <select
              value={submission.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
            >
              <option value="submitted">Submitted</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Payment Status</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(submission.payment_status)}`}>
            {submission.payment_status}
          </span>
          {form?.retainer_amount && (
            <p className="text-gray-600 mt-2">Amount: ${form.retainer_amount}</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Signature Status</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(submission.signature_status)}`}>
            {submission.signature_status}
          </span>
          {submission.signature_status === 'signed' && (
            <div className="mt-4">
              <Link
                href={`/signed-agreement/${submission.id}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Agreement
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Client Information */}
      {client && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-gray-900 font-semibold">{client.first_name} {client.last_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-gray-900">{client.email}</p>
            </div>
            {client.phone && (
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-gray-900">{client.phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(client.status)}`}>
                {client.status}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href={`/dashboard/clients/${client.id}`}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View Full Client Profile →
            </Link>
          </div>
        </div>
      )}

      {/* Form Information */}
      {form && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Form Information</h2>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">Form Name</p>
              <p className="text-gray-900 font-semibold">{form.name}</p>
            </div>
            {form.description && (
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-900">{form.description}</p>
              </div>
            )}
          </div>
          <div className="mt-4">
            <Link
              href={`/dashboard/forms/${form.id}`}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View Form Details →
            </Link>
          </div>
        </div>
      )}

      {/* Submitted Data */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Submitted Information</h2>

        {submission.form_data && Object.keys(submission.form_data).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(submission.form_data).map(([key, value]) => (
              <div key={key} className="border-b border-gray-200 pb-4 last:border-0">
                <p className="text-sm font-medium text-gray-600 mb-1 capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-gray-900">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '—')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No data submitted</p>
        )}
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Submission Metadata</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium">Submitted:</span>{' '}
            {new Date(submission.created_at).toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Last Updated:</span>{' '}
            {new Date(submission.updated_at).toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Form ID:</span>{' '}
            <span className="font-mono text-xs">{submission.form_id}</span>
          </p>
          <p>
            <span className="font-medium">Client ID:</span>{' '}
            <span className="font-mono text-xs">{submission.client_id}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
