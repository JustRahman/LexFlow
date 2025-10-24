'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface IntakeForm {
  id: string
  name: string
  description: string
  retainer_amount: string
  payment_required: boolean
  is_active: boolean
  fields_schema: any
  firm_id: string
}

export default function PublicIntakeFormPage() {
  const params = useParams()
  const formId = params.formId as string

  const [form, setForm] = useState<IntakeForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    // Fetch form details (public endpoint, no auth required)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/public/forms/${formId}`)
      .then(res => {
        if (!res.ok) throw new Error('Form not found')
        return res.json()
      })
      .then(data => {
        setForm(data)
        setLoading(false)
      })
      .catch((error) => {
        setError(error.message || 'Failed to load form')
        setLoading(false)
      })
  }, [formId])

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Submit the intake form
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/public/forms/${formId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form_data: formData
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to submit form'
        try {
          const data = await response.json()
          errorMessage = data.detail || data.message || errorMessage
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()

      // Handle workflow based on next_step
      if (result.next_step === 'signature' && result.signature_url) {
        // Signature required first
        window.location.href = result.signature_url
        return
      }

      if (result.next_step === 'payment' && result.payment_url) {
        // Payment required (no signature)
        window.location.href = result.payment_url
        return
      }

      // No signature or payment required, go to success page
      if (result.id) {
        window.location.href = `/intake/success?submission_id=${result.id}`
        return
      }

      // Fallback: Success!
      setSubmitted(true)
    } catch (err: any) {
      console.error('Form submission error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while submitting the form'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (fieldName: string, fieldConfig: any, required: boolean) => {
    const fieldType = fieldConfig.type || 'string'
    const label = fieldConfig.title || fieldName

    const commonClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"

    switch (fieldType) {
      case 'string':
      case 'text':
        return (
          <input
            type="text"
            required={required}
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={commonClasses}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        )

      case 'email':
        return (
          <input
            type="email"
            required={required}
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={commonClasses}
            placeholder="your.email@example.com"
          />
        )

      case 'tel':
      case 'phone':
        return (
          <input
            type="tel"
            required={required}
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={commonClasses}
            placeholder="+1 555 123 4567"
          />
        )

      case 'number':
        return (
          <input
            type="number"
            required={required}
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={commonClasses}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        )

      case 'textarea':
        return (
          <textarea
            required={required}
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            rows={4}
            className={commonClasses}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            required={required}
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={commonClasses}
          />
        )

      default:
        return (
          <input
            type="text"
            required={required}
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={commonClasses}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  if (error && !form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Not Available</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your intake form has been submitted successfully. We'll review your information and get back to you soon.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!form) return null

  const fields = form.fields_schema?.properties ? Object.entries(form.fields_schema.properties) : []
  const requiredFields = form.fields_schema?.required || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            LexFlow
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{form.name}</h2>
          {form.description && (
            <p className="text-gray-600">{form.description}</p>
          )}
        </div>

        {/* Payment Info */}
        {form.payment_required && form.retainer_amount && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> A retainer payment of ${form.retainer_amount} is required after form submission.
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map(([fieldName, fieldConfig]: [string, any]) => {
              const isRequired = requiredFields.includes(fieldName)
              const label = fieldConfig.title || fieldName

              return (
                <div key={fieldName}>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {label}
                    {isRequired && <span className="text-red-600 ml-1">*</span>}
                  </label>
                  {renderField(fieldName, fieldConfig, isRequired)}
                </div>
              )
            })}

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Intake Form'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Powered by LexFlow</p>
          </div>
        </div>
      </div>
    </div>
  )
}
