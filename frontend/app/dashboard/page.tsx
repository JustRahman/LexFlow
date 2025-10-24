'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    forms: 0,
    submissions: 0,
    clients: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showStripeModal, setShowStripeModal] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    // Fetch dashboard stats
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/forms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
    ])
      .then(async ([formsRes, submissionsRes, clientsRes]) => {
        const forms = await formsRes.json()
        const submissions = await submissionsRes.json()
        const clients = await clientsRes.json()

        setStats({
          forms: Array.isArray(forms) ? forms.length : 0,
          submissions: submissions.total || 0,
          clients: clients.total || 0,
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your overview.</p>
      </div>

      {/* Stripe Connect Banner */}
      <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Accept Payments Directly</h3>
            <p className="text-gray-700 text-sm">
              Connect your Stripe account to receive client payments directly to your bank account.
            </p>
          </div>
          <button
            onClick={() => setShowStripeModal(true)}
            className="ml-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold whitespace-nowrap"
          >
            Connect Stripe Account
          </button>
        </div>
      </div>

      {/* Stripe Modal */}
      {showStripeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon!</h3>

              <p className="text-gray-600 mb-6">
                Stripe Connect integration is under development. Once available, you'll be able to:
              </p>

              <div className="text-left space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">Receive payments directly to your bank account</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">Automatic payment processing</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">Track all transactions in one place</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">Secure PCI-compliant payment handling</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                For now, you can still test the payment flow. Clients will see the payment option during checkout.
              </p>

              <button
                onClick={() => setShowStripeModal(false)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div>
            <p className="text-sm text-gray-600 mb-1">Intake Forms</p>
            <p className="text-3xl font-bold text-gray-900">{stats.forms}</p>
          </div>
          <Link href="/dashboard/forms" className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block">
            View all forms →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div>
            <p className="text-sm text-gray-600 mb-1">Submissions</p>
            <p className="text-3xl font-bold text-gray-900">{stats.submissions}</p>
          </div>
          <Link href="/dashboard/submissions" className="text-sm text-purple-600 hover:text-purple-700 mt-4 inline-block">
            View submissions →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div>
            <p className="text-sm text-gray-600 mb-1">Clients</p>
            <p className="text-3xl font-bold text-gray-900">{stats.clients}</p>
          </div>
          <Link href="/dashboard/clients" className="text-sm text-green-600 hover:text-green-700 mt-4 inline-block">
            View clients →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/forms/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
          >
            <div className="font-semibold text-gray-900">Create New Form</div>
            <div className="text-sm text-gray-600">Build a custom intake form</div>
          </Link>

          <Link
            href="/dashboard/clients"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center"
          >
            <div className="font-semibold text-gray-900">Add Client</div>
            <div className="text-sm text-gray-600">Manually add a new client</div>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      {stats.forms === 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Get Started with LexFlow</h3>
          <p className="text-gray-600 mb-4">
            Create your first intake form to start collecting client information automatically.
          </p>
          <Link
            href="/dashboard/forms/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Create Your First Form
          </Link>
        </div>
      )}
    </div>
  )
}
