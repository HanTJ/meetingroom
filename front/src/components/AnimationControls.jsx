import { useState } from 'react'
import useAnimation from '../hooks/useAnimation'

const AnimationControls = () => {
  const { isAnimationEnabled, animationSpeed, toggleAnimation, updateAnimationSpeed } = useAnimation()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`animation-controls ${isExpanded ? 'expanded' : ''}`}>
      <button
        className="controls-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        ⚙️ 애니메이션 설정
      </button>

      {isExpanded && (
        <div className="controls-panel scale-in">
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={isAnimationEnabled}
                onChange={toggleAnimation}
              />
              애니메이션 활성화
            </label>
          </div>

          <div className="control-group">
            <label>애니메이션 속도</label>
            <input
              type="range"
              min="0.25"
              max="2"
              step="0.25"
              value={animationSpeed}
              onChange={(e) => updateAnimationSpeed(parseFloat(e.target.value))}
              disabled={!isAnimationEnabled}
            />
            <span className="speed-label">{animationSpeed}x</span>
          </div>

          <div className="speed-presets">
            {[0.5, 1, 1.5, 2].map(speed => (
              <button
                key={speed}
                className={`preset-btn ${animationSpeed === speed ? 'active' : ''}`}
                onClick={() => updateAnimationSpeed(speed)}
                disabled={!isAnimationEnabled}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AnimationControls