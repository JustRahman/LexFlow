'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

export default function SignaturePage() {
  const searchParams = useSearchParams()
  const submissionId = searchParams.get('submission_id')

  const [submission, setSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [signature, setSignature] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [signed, setSigned] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

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
        } else {
          setError('Submission not found')
        }
      } catch (error) {
        console.error('Error fetching submission:', error)
        setError('Failed to load submission')
      } finally {
        setLoading(false)
      }
    }

    fetchSubmission()
  }, [submissionId])

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleSign = async () => {
    if (!signature.trim()) {
      setError('Please enter your full name')
      return
    }

    if (!agreed) {
      setError('Please agree to the terms')
      return
    }

    setSigning(true)
    setError('')

    try {
      // For now, just mark as signed in the database
      // In production, this would upload the signature and document
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/signatures/public/sign/${submissionId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            signature_name: signature,
            signature_date: new Date().toISOString()
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to submit signature')
      }

      const result = await response.json()

      // Mark as signed and show payment section
      setSigned(true)
      setSigning(false)

      // If no payment required, redirect to success
      if (!submission.payment_amount) {
        setTimeout(() => {
          window.location.href = `/intake/success?submission_id=${submissionId}`
        }, 1500)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit signature')
      setSigning(false)
    }
  }

  const handlePayment = async () => {
    try {
      // Call backend to mark payment as completed
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/signatures/public/pay/${submissionId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        setShowPaymentModal(true)
      } else {
        setError('Failed to process payment')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process payment')
    }
  }

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false)
    // Redirect to success page after closing modal
    window.location.href = `/intake/success?submission_id=${submissionId}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    )
  }

  if (error && !submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Retainer Agreement</h1>
          <p className="text-lg text-gray-600">
            Please review and sign the retainer agreement to proceed
          </p>
        </div>

        {/* Document Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-gray-200">
          <div className="prose max-w-none">
            {/* Header */}
            <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">LEGAL SERVICES RETAINER AGREEMENT</h1>
              <p className="text-sm text-gray-600 uppercase tracking-wide">Attorney-Client Engagement Letter</p>
            </div>

            {/* Parties Section */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">PARTIES TO THIS AGREEMENT</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Client Information</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {submission?.form_data?.first_name} {submission?.form_data?.last_name}
                  </p>
                  <p className="text-sm text-gray-700">{submission?.form_data?.email}</p>
                  {submission?.form_data?.phone && (
                    <p className="text-sm text-gray-700">{submission?.form_data?.phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Agreement Details</p>
                  <p className="text-sm text-gray-700">
                    <strong>Date:</strong> {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {submission?.payment_amount && (
                    <p className="text-sm text-gray-700">
                      <strong>Initial Retainer:</strong> ${submission.payment_amount} USD
                    </p>
                  )}
                  <p className="text-sm text-gray-700">
                    <strong>Agreement ID:</strong> {submissionId?.substring(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Agreement Body */}
            <div className="space-y-6 text-gray-800 text-sm leading-relaxed">
              <p className="font-semibold">
                This Legal Services Retainer Agreement ("Agreement") is entered into as of the date set forth above
                by and between the Client identified above ("Client") and the undersigned law firm ("Firm" or "Attorney").
              </p>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                  1. SCOPE OF REPRESENTATION
                </h3>
                <p className="mb-2">
                  The Firm agrees to represent the Client in connection with the legal matter(s) discussed during
                  the initial consultation and intake process. The specific scope of representation includes, but
                  may not be limited to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Initial case evaluation and legal analysis</li>
                  <li>Consultation and legal advice regarding the matter</li>
                  <li>Document review and preparation as necessary</li>
                  <li>Communication with opposing parties and third parties</li>
                  <li>Court appearances and legal proceedings as required</li>
                </ul>
                <p className="mt-2">
                  Any services beyond this scope will require separate written authorization and may be subject
                  to additional fees.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                  2. RETAINER FEE AND TRUST ACCOUNT
                </h3>
                <p className="mb-2">
                  Client agrees to pay an initial retainer fee of <strong>${submission?.payment_amount || '[AMOUNT]'} USD</strong>.
                  This retainer shall be deposited into the Firm's Interest on Lawyers' Trust Account (IOLTA) in
                  compliance with applicable state bar rules and regulations.
                </p>
                <p className="mb-2">
                  The retainer will be applied against fees and costs as they are incurred. The Firm will provide
                  detailed monthly billing statements showing all work performed, time expended, and expenses incurred.
                </p>
                <p>
                  If the retainer is depleted, Client agrees to replenish it within seven (7) business days of
                  receiving notice from the Firm. Any unused portion of the retainer will be refunded to Client
                  upon conclusion of the representation.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                  3. FEES AND BILLING
                </h3>
                <p className="mb-2">
                  The Firm's fees are based on the time expended by attorneys and staff on Client's matter. The
                  current hourly rates are as follows:
                </p>
                <ul className="list-none pl-6 space-y-1 mb-2">
                  <li>• Senior Partner: $400-$500 per hour</li>
                  <li>• Associate Attorney: $250-$350 per hour</li>
                  <li>• Paralegal/Legal Assistant: $125-$175 per hour</li>
                </ul>
                <p className="mb-2">
                  These rates are subject to change upon thirty (30) days written notice. The Firm bills in
                  increments of one-tenth (0.1) of an hour (6 minutes), rounded up.
                </p>
                <p>
                  Client will be billed for all reasonable and necessary costs and expenses, including but not
                  limited to: filing fees, service of process fees, court reporter fees, expert witness fees,
                  photocopying ($0.25 per page), postage, courier services, and long-distance telephone charges.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                  4. BILLING STATEMENTS AND PAYMENT
                </h3>
                <p className="mb-2">
                  The Firm will provide Client with itemized billing statements on a monthly basis, typically
                  within the first week of each month for the previous month's services.
                </p>
                <p>
                  All invoices are due and payable within thirty (30) days of the invoice date. Past due balances
                  may be subject to interest charges at the rate of 1.5% per month (18% per annum) or the maximum
                  rate permitted by law, whichever is less. The Firm reserves the right to suspend services if
                  Client's account becomes more than thirty (30) days past due.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                  5. CLIENT RESPONSIBILITIES
                </h3>
                <p className="mb-2">Client agrees to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide truthful and complete information to the Firm</li>
                  <li>Cooperate fully in the handling of the matter</li>
                  <li>Respond promptly to requests for information or documents</li>
                  <li>Keep the Firm informed of any changes in contact information</li>
                  <li>Notify the Firm immediately of any developments affecting the case</li>
                  <li>Make timely payment of all fees and expenses</li>
                  <li>Attend all scheduled meetings, hearings, and court appearances</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                  6. COMMUNICATION AND AVAILABILITY
                </h3>
                <p className="mb-2">
                  The Firm will make reasonable efforts to keep Client informed of significant developments in
                  the matter. However, Client acknowledges that the Firm cannot guarantee immediate responses
                  to all communications. The Firm will endeavor to respond to Client inquiries within two (2)
                  business days.
                </p>
                <p>
                  Client may contact the Firm during normal business hours (9:00 AM to 5:00 PM, Monday through
                  Friday, excluding holidays). Emergency matters will be handled on a case-by-case basis.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                  7. TERMINATION OF REPRESENTATION
                </h3>
                <p className="mb-2">
                  Either party may terminate this Agreement upon written notice to the other party. Upon termination:
                </p>
                <ul className="list-disc pl-6 space-y-1 mb-2">
                  <li>Client remains responsible for all fees and costs incurred up to the date of termination</li>
                  <li>The Firm will provide Client with a final invoice within thirty (30) days</li>
                  <li>The Firm will return Client's file and property upon receipt of payment in full</li>
                  <li>Any unused retainer funds will be promptly refunded to Client</li>
                </ul>
                <p>
                  The Firm may withdraw from representation for good cause, including but not limited to:
                  non-payment of fees, Client's failure to cooperate, or if continuing representation would
                  result in a violation of ethical rules.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                  8. CONFIDENTIALITY AND ATTORNEY-CLIENT PRIVILEGE
                </h3>
                <p className="mb-2">
                  All communications between Client and the Firm are protected by the attorney-client privilege
                  and will be kept strictly confidential, except as required by law or court order, or as necessary
                  to defend the Firm against claims by Client.
                </p>
                <p>
                  Client acknowledges that confidentiality may be waived if Client discloses privileged information
                  to third parties. Client should consult with the Firm before discussing the matter with anyone else.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                  9. NO GUARANTEE OF OUTCOME
                </h3>
                <p>
                  The Firm makes no guarantee or warranty, express or implied, regarding the outcome of Client's
                  matter. Legal matters involve inherent uncertainties, and the Firm cannot predict with certainty
                  how courts, opposing parties, or other third parties will act. The Firm will use its best
                  professional judgment and skill in representing Client's interests.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                  10. FILE RETENTION AND DOCUMENT DESTRUCTION
                </h3>
                <p>
                  Following the conclusion of representation, the Firm will retain Client's file for a period of
                  seven (7) years in accordance with professional standards and state bar requirements. After this
                  retention period, the Firm may destroy the file without further notice to Client. Client may
                  request return of original documents at any time during the retention period.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                  11. DISPUTE RESOLUTION
                </h3>
                <p>
                  In the event of any dispute arising from this Agreement or the Firm's representation of Client,
                  the parties agree to first attempt to resolve the matter through good faith negotiation. If
                  negotiation is unsuccessful, the parties agree to submit the dispute to mediation before
                  pursuing litigation.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                  12. ENTIRE AGREEMENT
                </h3>
                <p>
                  This Agreement constitutes the entire agreement between the parties regarding the subject matter
                  herein and supersedes all prior agreements and understandings, whether written or oral. This
                  Agreement may only be modified in writing signed by both parties.
                </p>
              </div>

              {/* Acknowledgment */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
                <p className="font-semibold text-gray-900 mb-2">CLIENT ACKNOWLEDGMENT</p>
                <p className="text-sm">
                  By signing this Agreement electronically below, Client acknowledges that they have read,
                  understood, and agree to be bound by all terms and conditions set forth in this Retainer
                  Agreement. Client confirms that they have had the opportunity to ask questions and seek
                  independent legal advice regarding this Agreement if desired.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!signed ? (
            <>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Electronic Signature</h3>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

          <div className="space-y-6">
            {/* Typed Signature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name (type to sign) *
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Enter your full legal name"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                By typing your name above, you agree that this constitutes your legal electronic signature
              </p>
            </div>

            {/* Canvas Signature (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Draw Signature (optional)
              </label>
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full bg-white cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
              <button
                type="button"
                onClick={clearSignature}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Clear drawn signature
              </button>
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="agree" className="ml-3 text-sm text-gray-700">
                I have read and agree to the terms of this Retainer Agreement. I understand that by
                signing electronically, I am creating a legally binding agreement.
              </label>
            </div>

            {/* Sign Button */}
            <button
              onClick={handleSign}
              disabled={signing || !signature.trim() || !agreed}
              className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signing ? 'Processing Signature...' : 'Sign Agreement & Continue'}
            </button>

            {submission?.payment_amount && (
              <p className="text-center text-sm text-gray-600">
                After signing, you'll be redirected to payment (${submission.payment_amount})
              </p>
            )}
          </div>
            </>
          ) : (
            // After signature - show payment section
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Document Signed Successfully!</h3>
                <p className="text-gray-600">
                  Your signature has been recorded. Thank you for signing the retainer agreement.
                </p>
              </div>

              {submission?.payment_amount ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Payment Required</h4>
                    <p className="text-gray-700 mb-4">
                      Please complete your retainer payment to finalize the process.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        ${submission.payment_amount}
                      </span>
                      <button
                        onClick={handlePayment}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Redirecting to confirmation page...</p>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">Payment Completed!</h3>

                <p className="text-gray-600 mb-4">
                  Your payment has been successfully processed.
                </p>

                <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-semibold text-green-900">Payment Status: Succeeded</span>
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Amount:</strong> ${submission?.payment_amount}</p>
                    <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
                    <p><strong>Status:</strong> Completed</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg mb-6">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> This is a test payment for demonstration purposes.
                    In production, real Stripe payment processing will be used with full security and compliance.
                  </p>
                </div>

                <button
                  onClick={handlePaymentModalClose}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Continue to Success Page
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by LexFlow - Secure Electronic Signatures</p>
        </div>
      </div>
    </div>
  )
}
