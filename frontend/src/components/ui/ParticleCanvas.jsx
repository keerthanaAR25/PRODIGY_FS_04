import React, { useEffect, useRef } from 'react'

export default function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    class Particle {
      constructor() { this.reset() }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = (Math.random() - 0.5) * 0.3 - 0.1
        this.radius = Math.random() * 2 + 0.5
        this.alpha = Math.random() * 0.4 + 0.1
        this.color = Math.random() > 0.5
          ? `rgba(59,130,246,${this.alpha})`
          : `rgba(99,102,241,${this.alpha})`
        this.life = 0
        this.maxLife = Math.random() * 300 + 100
      }
      update() {
        this.x += this.vx
        this.y += this.vy
        this.life++
        if (this.life > this.maxLife || this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
          this.reset()
          this.y = canvas.height + 10
        }
      }
      draw() {
        const fadeIn = Math.min(this.life / 30, 1)
        const fadeOut = Math.max(0, 1 - (this.life - this.maxLife + 30) / 30)
        const currentAlpha = this.alpha * fadeIn * fadeOut
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color.replace(/[\d.]+\)$/, `${currentAlpha})`)
        ctx.fill()
      }
    }

    for (let i = 0; i < 80; i++) particles.push(new Particle())

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => { p.update(); p.draw() })
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(59,130,246,${0.08 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}