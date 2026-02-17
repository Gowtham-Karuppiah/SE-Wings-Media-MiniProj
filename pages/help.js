import { useState } from 'react'
import Link from 'next/link'

export default function Help() {
  const [activeTab, setActiveTab] = useState('faqs')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'Click the "Sign in" button in the header and authenticate with your Google account. Your profile will be created automatically.'
    },
    {
      question: 'Can I save content for later?',
      answer: 'Yes! Click the bookmark icon on any blog or podcast to save it. Your bookmarks are stored locally in your browser.'
    },
    {
      question: 'How do I create a blog post?',
      answer: 'Navigate to the Blogs section, click the "Create" tab, fill in the title, description, and content, then publish. Your post will be visible to all users.'
    },
    {
      question: 'How do I upload a podcast?',
      answer: 'Go to Podcasts section, click "Upload", add your podcast title, description, audio file, and cover image, then upload. Your podcast will be available immediately.'
    },
    {
      question: 'How do I search for content?',
      answer: 'Use the search bar in the mobile menu or search page to find blogs and podcasts by title, author, or keywords.'
    },
    {
      question: 'Can I delete my content?',
      answer: 'Yes, go to your profile and manage your published content. You can delete any blogs or podcasts you\'ve created.'
    },
    {
      question: 'How do I enable dark mode?',
      answer: 'Click the theme toggle button in the header (☀️/🌙) to switch between light and dark modes. Your preference is saved automatically.'
    },
    {
      question: 'How do I manage notifications?',
      answer: 'Go to Settings and adjust your notification preferences. You can control email, push, and content notifications.'
    }
  ]

  function handleSubmit(e) {
    e.preventDefault()
    if (formData.name && formData.email && formData.message) {
      console.log('Form submitted:', formData)
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  return (
    <div className="container">
      <div className="help-header">
        <h2>Help & Support</h2>
        <p className="help-subtitle">Find answers and get help with Wings Media</p>
      </div>

      <div className="help-tabs">
        <button 
          className={`help-tab ${activeTab === 'faqs' ? 'active' : ''}`}
          onClick={() => setActiveTab('faqs')}
        >
          ❓ FAQs
        </button>
        <button 
          className={`help-tab ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          📧 Contact Us
        </button>
        <button 
          className={`help-tab ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          💬 Send Feedback
        </button>
      </div>

      {/* FAQs Tab */}
      {activeTab === 'faqs' && (
        <div className="help-content">
          <div className="faq-grid">
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <h3 className="faq-question">{faq.question}</h3>
                <p className="faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <div className="help-content">
          <div className="contact-section">
            <h3>Get in Touch</h3>
            <p>Have a question or need assistance? We're here to help!</p>

            {submitted && (
              <div className="success-message">
                ✓ Thank you for contacting us! We'll respond shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="How can we help?"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-textarea"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Tell us more about your issue..."
                  rows="6"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </form>

            <div className="contact-info">
              <h4>Other ways to reach us:</h4>
              <p>📧 Email: support@wingsmedia.com</p>
              <p>💬 Live Chat: Available 9AM-5PM EST</p>
              <p>🐦 Twitter: @wingsmedia</p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="help-content">
          <div className="feedback-section">
            <h3>We Value Your Feedback</h3>
            <p>Help us improve Wings Media by sharing your thoughts and suggestions</p>

            {submitted && (
              <div className="success-message">
                ✓ Thank you for your feedback!
              </div>
            )}

            <form onSubmit={handleSubmit} className="feedback-form">
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Feedback Type</label>
                <select className="form-input">
                  <option>📋 General Feedback</option>
                  <option>✨ Feature Request</option>
                  <option>🐛 Bug Report</option>
                  <option>💡 Improvement Suggestion</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Your Feedback</label>
                <textarea
                  className="form-textarea"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Share your thoughts..."
                  rows="6"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .help-header {
          margin-bottom: 32px;
        }

        .help-header h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
        }

        .help-subtitle {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
        }

        .help-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .theme-dark .help-tabs {
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .help-tab {
          padding: 12px 16px;
          border: 0;
          background: transparent;
          color: var(--text);
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          border-bottom: 3px solid transparent;
          transition: all 200ms ease;
        }

        .help-tab:hover {
          color: var(--brand);
        }

        .help-tab.active {
          color: var(--brand);
          border-bottom-color: var(--brand);
        }

        .help-content {
          animation: fadeIn 300ms ease;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .faq-item {
          padding: 20px;
          border-radius: 12px;
          background: var(--bg);
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
        }

        .theme-dark .faq-item {
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
        }

        .faq-question {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
        }

        .faq-answer {
          margin: 0;
          font-size: 14px;
          color: var(--muted);
          line-height: 1.5;
        }

        .contact-section,
        .feedback-section {
          max-width: 600px;
          margin: 0 auto;
        }

        .contact-section h3,
        .feedback-section h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .contact-section p:first-of-type,
        .feedback-section p:first-of-type {
          margin: 0 0 24px 0;
          color: var(--muted);
        }

        .success-message {
          padding: 12px 16px;
          background: rgba(34, 197, 94, 0.1);
          border-left: 3px solid #22c55e;
          border-radius: 6px;
          color: #22c55e;
          margin-bottom: 24px;
          font-weight: 600;
        }

        .contact-form,
        .feedback-form {
          padding: 24px;
          border-radius: 12px;
          background: var(--bg);
          border: 1px solid rgba(0, 0, 0, 0.06);
          margin-bottom: 32px;
        }

        .theme-dark .contact-form,
        .theme-dark .feedback-form {
          border-color: rgba(255, 255, 255, 0.08);
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: var(--bg);
          color: var(--text);
          font-size: 14px;
          font-family: inherit;
        }

        .theme-dark .form-input,
        .theme-dark .form-textarea {
          border-color: rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: var(--muted);
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 8px;
          border: 0;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 200ms ease;
        }

        .btn-primary {
          background: linear-gradient(90deg, #60a5fa, #7c3aed);
          color: white;
          width: 100%;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(99, 102, 241, 0.18);
        }

        .contact-info {
          padding: 20px;
          border-radius: 12px;
          background: rgba(96, 165, 250, 0.06);
          border: 1px solid rgba(96, 165, 250, 0.12);
        }

        .theme-dark .contact-info {
          background: rgba(96, 165, 250, 0.1);
          border-color: rgba(96, 165, 250, 0.2);
        }

        .contact-info h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
        }

        .contact-info p {
          margin: 8px 0;
          font-size: 14px;
          color: var(--muted);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .help-tabs {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .faq-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
