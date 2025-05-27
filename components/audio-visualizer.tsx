"use client"

import { useEffect, useRef, useState } from "react"

interface AudioVisualizerProps {
  audioStream?: MediaStream
  isActive?: boolean
  barCount?: number
  className?: string
}

export default function AudioVisualizer({
  audioStream,
  isActive = false,
  barCount = 20,
  className = "",
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode>()
  const [audioData, setAudioData] = useState<Uint8Array>()

  useEffect(() => {
    if (!audioStream) return

    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(audioStream)

    analyser.fftSize = 256
    source.connect(analyser)
    analyserRef.current = analyser

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    setAudioData(dataArray)

    return () => {
      audioContext.close()
    }
  }, [audioStream])

  useEffect(() => {
    if (!isActive || !analyserRef.current || !audioData) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      if (!analyserRef.current || !audioData) return

      analyserRef.current.getByteFrequencyData(audioData)

      // Clear with dark background
      ctx.fillStyle = "#374151"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = canvas.width / barCount
      let x = 0

      for (let i = 0; i < barCount; i++) {
        const barHeight = (audioData[i] / 255) * canvas.height * 0.8

        // Create gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
        gradient.addColorStop(0, "#3b82f6")
        gradient.addColorStop(1, "#60a5fa")

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight)

        x += barWidth
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, audioData, barCount])

  return <canvas ref={canvasRef} width={300} height={60} className={`w-full h-full ${className}`} />
}
