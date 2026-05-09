import { useState } from 'react'
import { Star } from 'lucide-react'
import styles from './StarRating.module.css'

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

export default function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0)

  const active = hovered || value

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.stars}
        onMouseLeave={() => !readonly && setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${styles.star} ${star <= active ? styles.filled : ''} ${readonly ? styles.readonly : ''}`}
            onClick={() => !readonly && onChange(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            <Star
              size={40}
              strokeWidth={1.5}
              fill={star <= active ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>
      <div className={styles.label}>
        {active > 0 ? LABELS[active] : 'Tap to rate'}
      </div>
    </div>
  )
}
