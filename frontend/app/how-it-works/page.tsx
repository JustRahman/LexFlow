'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HowItWorksPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LexFlow
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How LexFlow Works</h1>
          <p className="text-xl text-gray-600">
            Streamline your legal client intake process in 3 simple steps
          </p>
        </div>

        {/* For Lawyers Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">For Lawyers</h2>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4 flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your Intake Form</h3>
                <p className="text-gray-700 mb-3">
                  Build a custom intake form with the fields you need. Add questions about client information,
                  case details, and any other relevant data.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Example fields:</strong> Name, Email, Phone, Case Type, Description, Budget, etc.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4 flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Set Payment & Retainer</h3>
                <p className="text-gray-700 mb-3">
                  Specify your retainer amount (e.g., $500). When payment is required, clients will
                  automatically be guided through signature and payment steps.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>What happens:</strong> Client signs retainer agreement → Pays retainer → You're hired!
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4 flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Share the Link</h3>
                <p className="text-gray-700 mb-3">
                  Copy your form's public link and share it with potential clients via email, website,
                  or social media. They can fill it out anytime, anywhere.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 font-mono text-xs break-all">
                    https://lexflow.com/intake/abc123
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4 flex-shrink-0">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review Submissions</h3>
                <p className="text-gray-700 mb-3">
                  All client submissions appear in your dashboard. Review their information, see signature status,
                  check payment status, and view signed agreements.
                </p>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-900">
                    <strong>✓ Everything in one place:</strong> Client info, signed agreement, payment status
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* For Clients Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">For Clients</h2>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mr-4 flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Fill Out the Form</h3>
                <p className="text-gray-700">
                  Click the link your lawyer sent you. Fill out all required fields with your information
                  and case details. Takes just 5 minutes!
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mr-4 flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sign the Agreement</h3>
                <p className="text-gray-700 mb-3">
                  Review the retainer agreement carefully. Read all 12 sections covering scope, fees,
                  responsibilities, and terms. Sign electronically by typing your full name.
                </p>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Legal & Secure:</strong> Electronic signatures are legally binding and secure.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mr-4 flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Payment</h3>
                <p className="text-gray-700 mb-3">
                  After signing, pay the retainer fee securely. Your payment is processed immediately,
                  and you'll receive confirmation.
                </p>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Secure Payment:</strong> All payments are encrypted and PCI-compliant.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mr-4 flex-shrink-0">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Done! Your Lawyer Will Contact You</h3>
                <p className="text-gray-700">
                  That's it! Your lawyer will review your submission and contact you within 1-2 business
                  days to schedule a consultation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Custom Forms</h3>
              <p className="text-sm text-gray-600">Create unlimited forms with your own questions and fields</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">E-Signatures</h3>
              <p className="text-sm text-gray-600">Legally binding electronic signatures built-in</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Secure Payments</h3>
              <p className="text-sm text-gray-600">Collect retainer fees instantly with encrypted processing</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Dashboard</h3>
              <p className="text-sm text-gray-600">Track all submissions, signatures, and payments in one place</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Secure & Private</h3>
              <p className="text-sm text-gray-600">Bank-level encryption and attorney-client privilege protection</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Mobile Friendly</h3>
              <p className="text-sm text-gray-600">Works perfectly on phones, tablets, and computers</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Is this legally binding?</h3>
              <p className="text-gray-700">
                Yes! Electronic signatures are legally binding under the ESIGN Act and UETA in all 50 states.
                The retainer agreement is a valid contract.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">How secure is payment information?</h3>
              <p className="text-gray-700">
                All payments are processed through Stripe with bank-level encryption (AES-256). We never
                store credit card information on our servers. All data is PCI-DSS compliant.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Can I customize the retainer agreement?</h3>
              <p className="text-gray-700">
                The current version includes a comprehensive 12-section retainer agreement. Custom templates
                are coming soon. Contact support if you need specific modifications.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">What happens if a client doesn't pay?</h3>
              <p className="text-gray-700">
                You'll see the submission marked as "awaiting payment" in your dashboard. The agreement is
                signed but not completed. You can follow up with the client directly.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Can clients save their progress?</h3>
              <p className="text-gray-700">
                Currently, clients need to complete the form in one session. Draft saving is coming in a
                future update.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Do you offer support?</h3>
              <p className="text-gray-700">
                Yes! We provide email support for all users. Enterprise customers get priority support with
                faster response times.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-6 opacity-90">
              Streamline your client intake process today
            </p>
            <div className="space-x-4">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold"
                  >
                    Sign Up Free
                  </Link>
                  <Link
                    href="/login"
                    className="inline-block px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition font-semibold"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
