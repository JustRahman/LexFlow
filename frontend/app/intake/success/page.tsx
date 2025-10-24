'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function IntakeSuccessPage() {
  const searchParams = useSearchParams()
  const submissionId = searchParams.get('submission_id')
  const [submission, setSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!submissionId) {
      setLoading(false)
      return
    }

    // Fetch submission details
    const fetchSubmission = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/public/submissions/${submissionId}`
        )

        if (response.ok) {
          const data = await response.json()
          setSubmission(data)
        }
      } catch (error) {
        console.error('Error fetching submission:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmission()
  }, [submissionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const getNextSteps = () => {
    const steps = []

    if (submission) {
      // Check signature status
      if (submission.signature_status === 'pending') {
        steps.push({
          title: 'Document Signature',
          description: 'Retainer agreement signature pending',
          status: 'pending',
          color: 'yellow'
        })
      } else if (submission.signature_status === 'sent' || submission.signature_status === 'delivered') {
        steps.push({
          title: 'Document Signature',
          description: 'Signature request sent - check your email',
          status: 'in_progress',
          color: 'blue'
        })
      } else if (submission.signature_status === 'signed') {
        steps.push({
          title: 'Document Signed',
          description: 'Retainer agreement has been signed',
          status: 'completed',
          color: 'green'
        })
      }

      // Check payment status
      if (submission.payment_status === 'pending' && submission.payment_amount) {
        steps.push({
          title: 'Payment Required',
          description: `Retainer payment of $${submission.payment_amount}`,
          status: 'pending',
          color: 'yellow'
        })
      } else if (submission.payment_status === 'succeeded') {
        steps.push({
          title: 'Payment Completed',
          description: 'Retainer payment has been processed',
          status: 'completed',
          color: 'green'
        })
      }

      // Review step (always included)
      steps.push({
        title: 'Under Review',
        description: 'Our team is reviewing your submission',
        status: submission.status === 'completed' ? 'completed' : 'in_progress',
        color: submission.status === 'completed' ? 'green' : 'blue'
      })
    }

    return steps
  }

  const nextSteps = getNextSteps()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Submission Received!</h1>
          <p className="text-lg text-gray-600">
            Thank you for completing your intake form. Here's what happens next:
          </p>
        </div>

        {/* Submission Details */}
        {submission && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Submission Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Submission ID:</span>
                <span className="font-mono text-gray-900 text-xs">{submission.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-blue-600 capitalize">{submission.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span className="text-gray-900">
                  {new Date(submission.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Next Steps</h2>

          <div className="space-y-4">
            {nextSteps.map((step, index) => (
              <div
                key={index}
                className={`border-l-4 ${
                  step.color === 'green'
                    ? 'border-green-500 bg-green-50'
                    : step.color === 'blue'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-yellow-500 bg-yellow-50'
                } p-4 rounded-r-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-700">{step.description}</p>
                  </div>
                  {step.status === 'completed' && (
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">What to Expect</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>You will receive a confirmation email shortly</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Our team will review your submission within 1-2 business days</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>We'll contact you if we need any additional information</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>A team member will reach out to schedule your consultation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Questions?</h3>
          <p className="text-sm text-blue-800">
            If you have any questions about your submission, please don't hesitate to contact us.
            We're here to help!
          </p>
        </div>

        {/* Actions */}
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Return to Home
          </Link>
          {submissionId && (
            <p className="text-sm text-gray-600">
              Keep this page bookmarked to check your submission status
            </p>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by LexFlow</p>
        </div>
      </div>
    </div>
  )
}
