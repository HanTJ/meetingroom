import { useState, useEffect } from 'react'

const useAnimation = () => {
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState(1)

  useEffect(() => {
    const savedAnimationState = localStorage.getItem('animationEnabled')
    const savedAnimationSpeed = localStorage.getItem('animationSpeed')

    if (savedAnimationState !== null) {
      setIsAnimationEnabled(JSON.parse(savedAnimationState))
    }

    if (savedAnimationSpeed !== null) {
      setAnimationSpeed(parseFloat(savedAnimationSpeed))
    }
  }, [])

  const toggleAnimation = () => {
    const newState = !isAnimationEnabled
    setIsAnimationEnabled(newState)
    localStorage.setItem('animationEnabled', JSON.stringify(newState))
  }

  const updateAnimationSpeed = (speed) => {
    setAnimationSpeed(speed)
    localStorage.setItem('animationSpeed', speed.toString())
  }

  return {
    isAnimationEnabled,
    animationSpeed,
    toggleAnimation,
    updateAnimationSpeed
  }
}

export default useAnimation