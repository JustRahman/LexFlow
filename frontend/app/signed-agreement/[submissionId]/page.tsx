'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignedAgreementViewer() {
  const params = useParams()
  const router = useRouter()
  const submissionId = params.submissionId as string

  const [submission, setSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchSubmission = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/submissions/${submissionId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          setSubmission(data)
        } else {
          setError('Submission not found or you do not have permission to view it')
        }
      } catch (error) {
        console.error('Error fetching submission:', error)
        setError('Failed to load submission')
      } finally {
        setLoading(false)
      }
    }

    fetchSubmission()
  }, [submissionId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading signed agreement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/dashboard/submissions" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              Back to Submissions
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!submission) return null

  // Format signature date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Signed Retainer Agreement</h1>
            <p className="text-lg text-gray-600">
              View the signed retainer agreement for this submission
            </p>
          </div>
          <Link
            href="/dashboard/submissions"
            className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
          >
            Back to Submissions
          </Link>
        </div>

        {/* Signature Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Document Signed</h3>
              <p className="text-sm text-gray-600">
                Signed on {formatDate(submission.signed_at)}
              </p>
              {submission.form_data?.signature_name && (
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Signed by:</strong> {submission.form_data.signature_name}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                {submission.signature_status === 'signed' ? 'Completed' : submission.signature_status}
              </span>
            </div>
          </div>
        </div>

        {/* Document Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
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
                    <strong>Date Signed:</strong> {formatDate(submission.signed_at)}
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

              {/* Signature Section */}
              <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200 mt-6">
                <p className="font-semibold text-gray-900 mb-4 text-base">ELECTRONIC SIGNATURE</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-900">
                      <strong>Signed by:</strong> {submission.form_data?.signature_name || 'Not recorded'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-900">
                      <strong>Signed on:</strong> {formatDate(submission.signed_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className="text-sm text-gray-900">
                      <strong>Status:</strong> Legally Binding Electronic Signature
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-4">
                  This electronic signature is legally binding under the ESIGN Act and UETA. This document has been
                  executed electronically and is valid and enforceable.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Link
            href="/dashboard/submissions"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Back to Submissions
          </Link>
        </div>
      </div>
    </div>
  )
}
