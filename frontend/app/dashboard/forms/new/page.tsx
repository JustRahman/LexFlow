'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewFormPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    retainer_amount: '',
    payment_required: true,
  })
  const [fields, setFields] = useState<any[]>([
    { id: 1, name: 'first_name', label: 'First Name', type: 'text', required: true },
    { id: 2, name: 'last_name', label: 'Last Name', type: 'text', required: true },
    { id: 3, name: 'email', label: 'Email Address', type: 'email', required: true },
    { id: 4, name: 'phone', label: 'Phone Number', type: 'tel', required: false },
    { id: 5, name: 'case_type', label: 'Type of Case', type: 'text', required: true },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addField = () => {
    const newField = {
      id: fields.length + 1,
      name: '',
      label: '',
      type: 'text',
      required: false,
    }
    setFields([...fields, newField])
  }

  const updateField = (id: number, key: string, value: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f))
  }

  const removeField = (id: number) => {
    setFields(fields.filter(f => f.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const token = localStorage.getItem('token')
    if (!token) return

    // Build fields schema
    const fieldsSchema = {
      type: 'object',
      properties: fields.reduce((acc, field) => ({
        ...acc,
        [field.name]: {
          type: field.type === 'number' ? 'number' : 'string',
          title: field.label,
        }
      }), {}),
      required: fields.filter(f => f.required).map(f => f.name),
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intake/forms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          fields_schema: fieldsSchema,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to create form')
      }

      router.push('/dashboard/forms')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Intake Form</h1>
        <p className="text-gray-600 mt-2">Build a custom form for your clients</p>
      </div>

      <div className="max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Form Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Form Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Personal Injury Intake Form"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="This form collects initial information from potential clients for personal injury cases"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retainer Amount
                  </label>
                  <input
                    type="text"
                    value={formData.retainer_amount}
                    onChange={(e) => setFormData({ ...formData, retainer_amount: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="5000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Required
                  </label>
                  <select
                    value={formData.payment_required ? 'yes' : 'no'}
                    onChange={(e) => setFormData({ ...formData, payment_required: e.target.value === 'yes' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Form Fields</h2>
              <button
                type="button"
                onClick={addField}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
              >
                + Add Field
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-900 mb-1">
                        Field Name
                      </label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(field.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-900 mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, 'label', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-900 mb-1">
                        Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) => updateField(field.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="tel">Phone</option>
                        <option value="number">Number</option>
                        <option value="textarea">Textarea</option>
                        <option value="date">Date</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="flex items-center justify-center h-10 px-3 py-2 bg-gray-50 border border-gray-300 rounded cursor-pointer hover:bg-gray-100 transition">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                          className="rounded mr-2"
                        />
                        <span className="text-xs font-medium text-gray-900">Required</span>
                      </label>
                    </div>

                    <div className="col-span-2">
                      <button
                        type="button"
                        onClick={() => removeField(field.id)}
                        className="w-full px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Form'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
