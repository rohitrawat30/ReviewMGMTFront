import styles from './KeywordChips.module.css'

export default function KeywordChips({ keywords, selected, onToggle }) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.heading}>What did you enjoy?</p>
      <div className={styles.chips}>
        {keywords.map((kw) => {
          const isSelected = selected.includes(kw)
          return (
            <button
              key={kw}
              type="button"
              className={`${styles.chip} ${isSelected ? styles.selected : ''}`}
              onClick={() => onToggle(kw)}
              aria-pressed={isSelected}
            >
              {isSelected && <span className={styles.check}>✓</span>}
              {kw}
            </button>
          )
        })}
      </div>
    </div>
  )
}
