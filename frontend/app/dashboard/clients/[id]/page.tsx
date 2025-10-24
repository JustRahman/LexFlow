'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Client {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  status: string
  intake_data: Record<string, any>
  created_at: string
  updated_at: string
}

interface Submission {
  id: string
  form_id: string
  form_name?: string
  status: string
  created_at: string
}

export default function ClientDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Fetch client details
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients/${clientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/submissions?client_id=${clientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ])
      .then(async ([clientRes, submissionsRes]) => {
        if (!clientRes.ok) throw new Error('Client not found')

        const clientData = await clientRes.json()
        const submissionsData = await submissionsRes.json()

        setClient(clientData)
        setSubmissions(submissionsData.items || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching client:', error)
        setLoading(false)
      })
  }, [clientId, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'signed':
        return 'bg-blue-100 text-blue-700'
      case 'paid':
        return 'bg-purple-100 text-purple-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading client details...</div>
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Client not found</h2>
        <Link href="/dashboard/clients" className="text-blue-600 hover:text-blue-700">
          Back to Clients
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/clients" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Clients
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {client.first_name} {client.last_name}
            </h1>
            <p className="text-gray-600">{client.email}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(client.status)}`}>
            {client.status}
          </span>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Full Name</p>
            <p className="text-gray-900 font-semibold">
              {client.first_name} {client.last_name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Email Address</p>
            <p className="text-gray-900">{client.email}</p>
          </div>
          {client.phone && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Phone Number</p>
              <p className="text-gray-900">{client.phone}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 mb-1">Client Since</p>
            <p className="text-gray-900">{new Date(client.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Intake Data */}
      {client.intake_data && Object.keys(client.intake_data).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Initial Intake Information</h2>
          <div className="space-y-4">
            {Object.entries(client.intake_data).map(([key, value]) => (
              <div key={key} className="border-b border-gray-200 pb-3 last:border-0">
                <p className="text-sm font-medium text-gray-600 mb-1 capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-gray-900">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '—')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submissions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Form Submissions ({submissions.length})
        </h2>

        {submissions.length === 0 ? (
          <p className="text-gray-600">No submissions yet</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    Submission #{submission.id.substring(0, 8)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Submitted {new Date(submission.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(submission.status)}`}>
                    {submission.status}
                  </span>
                  <Link
                    href={`/dashboard/submissions/${submission.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Client Timeline</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Client Created</p>
              <p className="text-xs text-gray-600">{new Date(client.created_at).toLocaleString()}</p>
            </div>
          </div>
          {submissions.map((submission) => (
            <div key={submission.id} className="flex gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-1"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Form Submitted</p>
                <p className="text-xs text-gray-600">{new Date(submission.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
