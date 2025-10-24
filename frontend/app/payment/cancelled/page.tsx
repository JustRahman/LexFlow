'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentCancelledPage() {
  const searchParams = useSearchParams()
  const submissionId = searchParams.get('submission_id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Cancelled</h1>

          <p className="text-gray-600 mb-6">
            Your payment was cancelled. Your intake form submission has been saved, but payment is still required to proceed.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-900">
              You can complete the payment later. We'll send you a payment link via email.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              If you have any questions, please contact us.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Return to Home
            </Link>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Powered by LexFlow</p>
          </div>
        </div>
      </div>
    </div>
  )
}
