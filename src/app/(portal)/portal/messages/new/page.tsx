'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'

export default function NewMessagePage() {
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock properties - in production, fetch from API
  const properties = [
    { id: '1', name: '123 Lakefront Drive' },
    { id: '2', name: '456 Sunset Cove' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim() || !message.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          content: message,
          property_id: propertyId || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send message')
      }

      const data = await response.json()
      router.push(`/portal/messages/${data.conversation_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/portal/messages"
          className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Messages
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">New Message</h1>
        <p className="text-[#a1a1aa]">
          Send a message to the Lake Watch Pros team
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Property Selection (Optional) */}
          <div>
            <label htmlFor="property" className="block text-sm font-medium mb-2">
              Property <span className="text-[#71717a]">(optional)</span>
            </label>
            <select
              id="property"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] transition-colors"
            >
              <option value="">Select a property...</option>
              {properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-2">
              Subject <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What is this about?"
              className="w-full px-4 py-3 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] transition-colors"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={6}
              className="w-full px-4 py-3 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] transition-colors resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/portal/messages"
              className="px-6 py-3 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
