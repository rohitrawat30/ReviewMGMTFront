import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapPin, Phone, Loader2, Sparkles, User, Mail, PhoneCall } from 'lucide-react'
import StarRating from '../components/StarRating'
import KeywordChips from '../components/KeywordChips'
import GoogleLogo from '../components/GoogleLogo'
import { generateReview, submitReview } from '../api/client'
import styles from './FeedbackPage.module.css'

const DEFAULT_CONFIG = {
  businessName: 'Your Business',
  logoUrl: '',
  address: '',
  phone: '',
  googleReviewUrl: 'https://g.page/r/YOUR_ID/review',
  keywords: ['Friendly Staff', 'Great Food', 'Fast Service', 'Clean Place', 'Good Pricing'],
  facebookUrl: '',
  instagramUrl: '',
  justDialUrl: '',
}

function parseConfig(params) {
  const raw = {
    businessName: params.get('business') || DEFAULT_CONFIG.businessName,
    logoUrl: params.get('logo') || DEFAULT_CONFIG.logoUrl,
    address: params.get('address') || DEFAULT_CONFIG.address,
    phone: params.get('phone') || DEFAULT_CONFIG.phone,
    googleReviewUrl: params.get('google') || DEFAULT_CONFIG.googleReviewUrl,
    keywords: params.get('keywords')
      ? params.get('keywords').split(',').map((k) => k.trim()).filter(Boolean)
      : DEFAULT_CONFIG.keywords,
    facebookUrl: params.get('facebook') || DEFAULT_CONFIG.facebookUrl,
    instagramUrl: params.get('instagram') || DEFAULT_CONFIG.instagramUrl,
    justDialUrl: params.get('justdial') || DEFAULT_CONFIG.justDialUrl,
  }
  return raw
}

// Phase constants
const PHASE = {
  RATING: 'rating',
  REVIEW: 'review',
  CONNECT_CUSTOMER: 'connect_customer',
  SUCCESS_THANKYOU: 'success_thankyou',
}

export default function FeedbackPage() {
  const [searchParams] = useSearchParams()
  const config = parseConfig(searchParams)

  const [phase, setPhase] = useState(PHASE.RATING)
  const [rating, setRating] = useState(0)
  const [selectedKeywords, setSelectedKeywords] = useState([])
  const [comment, setComment] = useState('')
  const [isManualComment, setIsManualComment] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const debounceRef = useRef(null)

  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '' })
  const [contactErrors, setContactErrors] = useState({})
  const [isContactSubmitted, setIsContactSubmitted] = useState(false)

  const handleRatingSelect = (value) => {
    setRating(value)
    setPhase(PHASE.REVIEW)
    setSelectedKeywords([])
    setComment('')
    setIsManualComment(false)
    setGenerateError('')
    setSubmitError('')
  }

  const toggleKeyword = (kw) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    )
  }

  const handleCommentChange = (e) => {
    const val = e.target.value
    setComment(val)
    // If user clears the field, allow AI to take over again
    setIsManualComment(val.trim().length > 0)
  }

  // Auto-generate whenever keywords change (debounced, skips if user typed manually)
  useEffect(() => {
    if (phase !== PHASE.REVIEW) return
    if (isManualComment) return

    if (selectedKeywords.length === 0) {
      setComment('')
      setGenerateError('')
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setIsGenerating(true)
      setGenerateError('')
      try {
        const { review } = await generateReview({ rating, keywords: selectedKeywords })
        setComment(review)
      } catch (err) {
        setGenerateError(err.message || 'Failed to generate review. Please try again.')
      } finally {
        setIsGenerating(false)
      }
    }, 500)

    return () => clearTimeout(debounceRef.current)
  }, [selectedKeywords]) // eslint-disable-line react-hooks/exhaustive-deps

  const canSubmit = comment.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    setSubmitError('')
    try {
      const { action } = await submitReview({ rating, comment: comment.trim() })
      if (action === 'redirect') {
        await copyToClipboard(comment.trim())
        window.location.href = config.googleReviewUrl
      } else {
        setPhase(PHASE.CONNECT_CUSTOMER)
      }
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // clipboard may not be available in all contexts
    }
  }

  const setContactField = (field) => (e) => {
    setContactForm((prev) => ({ ...prev, [field]: e.target.value }))
    setContactErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!contactForm.name.trim())  errs.name  = 'Name is required'
    if (!contactForm.email.trim()) errs.email = 'Email is required'
    if (!contactForm.phone.trim()) errs.phone = 'Phone number is required'
    if (Object.keys(errs).length > 0) { setContactErrors(errs); return }

    console.log('=== Customer Connect Submission ===')
    console.log('Business :', config.businessName)
    console.log('Rating   :', rating, '/ 5')
    console.log('Comment  :', comment || '(none)')
    console.log('Keywords :', selectedKeywords.join(', ') || '(none)')
    console.log('---')
    console.log('Name     :', contactForm.name.trim())
    console.log('Email    :', contactForm.email.trim())
    console.log('Phone    :', contactForm.phone.trim())
    console.log('===================================')

    setIsContactSubmitted(true)
    setTimeout(() => {
      setIsContactSubmitted(false)
      setContactForm({ name: '', email: '', phone: '' })
      setPhase(PHASE.SUCCESS_THANKYOU)
    }, 1500)
  }

  const handleReset = () => {
    setPhase(PHASE.RATING)
    setRating(0)
    setSelectedKeywords([])
    setComment('')
    setIsManualComment(false)
    setGenerateError('')
    setSubmitError('')
    setContactForm({ name: '', email: '', phone: '' })
    setContactErrors({})
    setIsContactSubmitted(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* ── Business Header ─────────────────────────────── */}
        <div className={styles.header}>
          {config.logoUrl ? (
            <img src={config.logoUrl} alt={config.businessName} className={styles.logo} />
          ) : (
            <div className={styles.logoPlaceholder}>
              {config.businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className={styles.businessName}>{config.businessName}</h1>

          {config.address && (
            <div className={styles.metaRow}>
              <MapPin size={14} className={styles.metaIcon} />
              <span>{config.address}</span>
            </div>
          )}
          {config.phone && (
            <div className={styles.metaRow}>
              <Phone size={14} className={styles.metaIcon} />
              <span>{config.phone}</span>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        {/* ── Google Review Prompt ──────────────────────────── */}
        {(phase === PHASE.RATING || phase === PHASE.REVIEW) && (
          <div className={styles.googlePrompt}>
            <p className={styles.promptHeading}>Review us on</p>
            <div className={styles.googleBadge}>
              <GoogleLogo size={26} />
              <span className={styles.googleText}>
                <span style={{ color: '#4285F4' }}>G</span>
                <span style={{ color: '#EA4335' }}>o</span>
                <span style={{ color: '#FBBC05' }}>o</span>
                <span style={{ color: '#4285F4' }}>g</span>
                <span style={{ color: '#34A853' }}>l</span>
                <span style={{ color: '#EA4335' }}>e</span>
              </span>
            </div>
            <p className={styles.promptSub}>We value your feedback</p>
          </div>
        )}

        {/* ─────────────────────────────────────────────────── */}
        {/* PHASE: RATING                                       */}
        {/* ─────────────────────────────────────────────────── */}
        {phase === PHASE.RATING && (
          <div className={`${styles.section} animate-fade-in-up`}>
            <p className={styles.ratingPrompt}>How was your experience?</p>
            <StarRating value={rating} onChange={handleRatingSelect} />
          </div>
        )}

        {/* ─────────────────────────────────────────────────── */}
        {/* PHASE: REVIEW                                       */}
        {/* ─────────────────────────────────────────────────── */}
        {phase === PHASE.REVIEW && (
          <div className={`${styles.section} animate-fade-in-up`}>
            {/* Current rating display */}
            <div className={styles.ratingDisplay}>
              <StarRating value={rating} onChange={handleRatingSelect} />
            </div>

            <div className={styles.divider} />

            {/* Keywords */}
            <KeywordChips
              keywords={config.keywords}
              selected={selectedKeywords}
              onToggle={toggleKeyword}
            />

            <div className={styles.divider} />

            {/* Textarea */}
            <div className={styles.textareaWrapper}>
              <div className={styles.textareaHeader}>
                <label className={styles.textareaLabel}>Your Review</label>
                {isGenerating && (
                  <span className={styles.generatingBadge}>
                    <Sparkles size={11} />
                    AI writing…
                  </span>
                )}
                {!isGenerating && comment && !isManualComment && (
                  <span className={styles.aiBadge}>
                    <Sparkles size={11} />
                    AI generated
                  </span>
                )}
              </div>
              <div className={styles.textareaContainer}>
                <textarea
                  className={`${styles.textarea} ${isGenerating ? styles.textareaLoading : ''}`}
                  rows={5}
                  placeholder={
                    selectedKeywords.length === 0
                      ? 'Select keywords above to auto-generate a review, or type your own…'
                      : 'Generating your review…'
                  }
                  value={comment}
                  onChange={handleCommentChange}
                  disabled={isGenerating}
                />
                {isGenerating && (
                  <div className={styles.textareaSpinner}>
                    <Loader2 size={20} className={styles.spinner} />
                  </div>
                )}
              </div>
              {selectedKeywords.length === 0 && !comment && (
                <p className={styles.hintText}>Select keywords above to generate a review with AI</p>
              )}
            </div>

            {/* Errors */}
            {generateError && <p className={styles.errorText}>{generateError}</p>}
            {submitError && <p className={styles.errorText}>{submitError}</p>}

            {/* Submit Button */}
            <button
              className={`${styles.btnPrimary} ${!canSubmit || isGenerating ? styles.btnDisabled : ''}`}
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting || isGenerating}
              type="button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className={styles.spinner} />
                  Submitting…
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────── */}
        {/* PHASE: CONNECT CUSTOMER                             */}
        {/* ─────────────────────────────────────────────────── */}
        {phase === PHASE.CONNECT_CUSTOMER && (
          <div className={`${styles.section} animate-fade-in-up`}>
            <div className={styles.connectHeader}>
              <div className={styles.connectIcon}>💬</div>
              <h2 className={styles.connectTitle}>We'd love to hear more</h2>
              <p className={styles.connectSub}>
                Share your contact details and we'll get back to you personally.
              </p>
            </div>

            <form className={styles.contactForm} onSubmit={handleContactSubmit} noValidate>
              <div className={styles.contactField}>
                <div className={`${styles.contactInput} ${contactErrors.name ? styles.contactInputError : ''}`}>
                  <User size={16} className={styles.contactIcon} />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={contactForm.name}
                    onChange={setContactField('name')}
                    autoComplete="name"
                  />
                </div>
                {contactErrors.name && <p className={styles.contactError}>{contactErrors.name}</p>}
              </div>

              <div className={styles.contactField}>
                <div className={`${styles.contactInput} ${contactErrors.email ? styles.contactInputError : ''}`}>
                  <Mail size={16} className={styles.contactIcon} />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={contactForm.email}
                    onChange={setContactField('email')}
                    autoComplete="email"
                  />
                </div>
                {contactErrors.email && <p className={styles.contactError}>{contactErrors.email}</p>}
              </div>

              <div className={styles.contactField}>
                <div className={`${styles.contactInput} ${contactErrors.phone ? styles.contactInputError : ''}`}>
                  <PhoneCall size={16} className={styles.contactIcon} />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={contactForm.phone}
                    onChange={setContactField('phone')}
                    autoComplete="tel"
                  />
                </div>
                {contactErrors.phone && <p className={styles.contactError}>{contactErrors.phone}</p>}
              </div>

              <button
                className={`${styles.btnPrimary} ${isContactSubmitted ? styles.btnSuccess : ''}`}
                type="submit"
                disabled={isContactSubmitted}
              >
                {isContactSubmitted ? '✓ Submitted!' : 'Submit'}
              </button>
            </form>

            <button className={styles.btnGhost} onClick={handleReset} type="button">
              Back
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────── */}
        {/* PHASE: SUCCESS — THANK YOU                          */}
        {/* ─────────────────────────────────────────────────── */}
        {phase === PHASE.SUCCESS_THANKYOU && (
          <div className={`${styles.successCard} animate-scale-in`}>
            <div className={styles.successIcon}>🙏</div>
            <h2 className={styles.successTitle}>Thank you!</h2>
            <p className={styles.successSub}>
              We appreciate your feedback. We'll be in touch with you soon.
            </p>
            <button className={styles.btnGhost} onClick={handleReset} type="button">
              Back
            </button>
          </div>
        )}

        {/* ── Social / Footer ───────────────────────────────── */}
        {(config.facebookUrl || config.instagramUrl || config.justDialUrl) && (
          <>
            <div className={styles.divider} />
            <div className={styles.socialRow}>
              {config.facebookUrl && (
                <a
                  href={config.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </a>
              )}
              {config.instagramUrl && (
                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
              )}
            </div>
            {config.justDialUrl && (
              <a
                href={config.justDialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.justDialBtn}
              >
                JUSTDIAL
              </a>
            )}
          </>
        )}

      </div>
    </div>
  )
}

/* ─── Inline SVG Icons ───────────────────────────────────── */

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}
