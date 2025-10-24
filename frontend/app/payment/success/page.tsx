'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const submissionId = searchParams.get('submission_id')
  const [paymentStatus, setPaymentStatus] = useState<string>('pending')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!submissionId) {
      setLoading(false)
      return
    }

    // Fetch submission status to verify payment
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/public/submissions/${submissionId}`
        )

        if (response.ok) {
          const data = await response.json()
          setPaymentStatus(data.payment_status || 'pending')

          // If payment succeeded, redirect to intake success page after 3 seconds
          if (data.payment_status === 'succeeded') {
            setTimeout(() => {
              window.location.href = `/intake/success?submission_id=${submissionId}`
            }, 3000)
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkPaymentStatus()
  }, [submissionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h1>

          <p className="text-gray-600 mb-6">
            Thank you for your payment. Your retainer fee has been processed successfully.
          </p>

          {paymentStatus === 'succeeded' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-900 font-medium">
                ✓ Payment confirmed and processed
              </p>
              <p className="text-sm text-green-800 mt-1">
                Redirecting you to your submission details...
              </p>
              <div className="mt-2 flex items-center text-xs text-green-700">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700 mr-2"></div>
                <span>Please wait...</span>
              </div>
            </div>
          ) : paymentStatus === 'pending' ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-900 font-medium">
                ⏳ Payment is being processed
              </p>
              <p className="text-sm text-yellow-800 mt-1">
                Your payment is being confirmed. This usually takes a few moments.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                You will receive a confirmation email shortly with the payment details and next steps.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Our team will review your submission and contact you within 1-2 business days.
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
