import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, ChevronRight } from 'lucide-react'
import styles from './TestPage.module.css'

const DEFAULT_KEYWORDS = 'Friendly Staff, Great Food, Fast Service, Clean Place, Good Pricing'

export default function TestPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    business: '',
    logo: '',
    address: '',
    phone: '',
    google: '',
    keywords: DEFAULT_KEYWORDS,
    facebook: '',
    instagram: '',
    justdial: '',
  })

  const [errors, setErrors] = useState({})

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.business.trim()) errs.business = 'Business name is required'
    if (!form.google.trim()) errs.google = 'Google review URL is required'
    if (!form.keywords.trim()) errs.keywords = 'At least one keyword is required'
    return errs
  }

  const handleStart = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const params = new URLSearchParams()
    params.set('business', form.business.trim())
    if (form.logo.trim())      params.set('logo', form.logo.trim())
    if (form.address.trim())   params.set('address', form.address.trim())
    if (form.phone.trim())     params.set('phone', form.phone.trim())
    params.set('google', form.google.trim())
    params.set('keywords', form.keywords.trim())
    if (form.facebook.trim())  params.set('facebook', form.facebook.trim())
    if (form.instagram.trim()) params.set('instagram', form.instagram.trim())
    if (form.justdial.trim())  params.set('justdial', form.justdial.trim())

    navigate(`/feedback?${params.toString()}`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.badge}>
            <FlaskConical size={18} />
            QA / Test Mode
          </div>
          <h1 className={styles.title}>Configure Feedback Page</h1>
          <p className={styles.subtitle}>
            Set up your business details to preview the customer review flow.
          </p>
        </div>

        <div className={styles.form}>
          {/* ── Required ───────────────────────────── */}
          <div className={styles.fieldGroup}>
            <p className={styles.groupLabel}>Required</p>

            <Field
              label="Business Name"
              placeholder="e.g. ABC Cafe"
              value={form.business}
              onChange={set('business')}
              error={errors.business}
              required
            />

            <Field
              label="Google Review URL"
              placeholder="https://g.page/r/XXXXX/review"
              value={form.google}
              onChange={set('google')}
              error={errors.google}
              required
            />

            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                Keywords
                <span className={styles.requiredMark}>*</span>
              </label>
              <textarea
                className={`${styles.textarea} ${errors.keywords ? styles.inputError : ''}`}
                placeholder="Friendly Staff, Great Food, Fast Service"
                value={form.keywords}
                onChange={set('keywords')}
                rows={3}
              />
              <p className={styles.fieldHint}>Comma-separated keyword chips shown to the user</p>
              {errors.keywords && <p className={styles.errorMsg}>{errors.keywords}</p>}
            </div>
          </div>

          {/* ── Optional ───────────────────────────── */}
          <div className={styles.fieldGroup}>
            <p className={styles.groupLabel}>Optional</p>

            <Field
              label="Logo URL"
              placeholder="https://example.com/logo.png"
              value={form.logo}
              onChange={set('logo')}
            />

            <Field
              label="Address"
              placeholder="C 31, Shop No 5, Mechanic Nagar..."
              value={form.address}
              onChange={set('address')}
            />

            <Field
              label="Phone Number"
              placeholder="9109826755044"
              value={form.phone}
              onChange={set('phone')}
            />
          </div>

          {/* ── Social ─────────────────────────────── */}
          <div className={styles.fieldGroup}>
            <p className={styles.groupLabel}>Social Links (optional)</p>

            <Field
              label="Facebook URL"
              placeholder="https://facebook.com/yourbusiness"
              value={form.facebook}
              onChange={set('facebook')}
            />

            <Field
              label="Instagram URL"
              placeholder="https://instagram.com/yourbusiness"
              value={form.instagram}
              onChange={set('instagram')}
            />

            <Field
              label="JustDial URL"
              placeholder="https://justdial.com/..."
              value={form.justdial}
              onChange={set('justdial')}
            />
          </div>
        </div>

        <button className={styles.startBtn} onClick={handleStart} type="button">
          Start Test
          <ChevronRight size={18} />
        </button>

        {/* Preview URL */}
        {form.business && form.google && (
          <p className={styles.previewUrl}>
            Preview:{' '}
            <span className={styles.urlText}>
              /feedback?business={encodeURIComponent(form.business)}&amp;google=…
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

function Field({ label, placeholder, value, onChange, error, required, type = 'text' }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        {label}
        {required && <span className={styles.requiredMark}>*</span>}
      </label>
      <input
        type={type}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  )
}
