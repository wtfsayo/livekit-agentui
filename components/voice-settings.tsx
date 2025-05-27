"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Settings, Mic, Volume2, TestTube } from "lucide-react"

interface VoiceSettingsProps {
  onSettingsChange?: (settings: VoiceSettings) => void
}

interface VoiceSettings {
  inputDevice: string
  outputDevice: string
  inputVolume: number
  outputVolume: number
  noiseSuppression: boolean
  echoCancellation: boolean
}

export default function VoiceSettings({ onSettingsChange }: VoiceSettingsProps) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [settings, setSettings] = useState<VoiceSettings>({
    inputDevice: "default",
    outputDevice: "default",
    inputVolume: 80,
    outputVolume: 80,
    noiseSuppression: true,
    echoCancellation: true,
  })
  const [isTestingMic, setIsTestingMic] = useState(false)

  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices()
        setDevices(deviceList)
      } catch (error) {
        console.error("Error getting devices:", error)
      }
    }

    getDevices()
  }, [])

  useEffect(() => {
    onSettingsChange?.(settings)
  }, [settings, onSettingsChange])

  const testMicrophone = async () => {
    setIsTestingMic(true)

    // Get canvas element first and set it up
    const canvas = document.getElementById("mic-test-canvas") as HTMLCanvasElement
    if (!canvas) {
      console.error("Canvas not found")
      setIsTestingMic(false)
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Canvas context not found")
      setIsTestingMic(false)
      return
    }

    // Set canvas size explicitly
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Draw initial state
    ctx.fillStyle = "#374151"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "#9ca3af"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Initializing microphone...", canvas.width / 2, canvas.height / 2 + 4)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: settings.inputDevice !== "default" ? settings.inputDevice : undefined,
          noiseSuppression: settings.noiseSuppression,
          echoCancellation: settings.echoCancellation,
        },
      })

      // Create audio context and analyser for waveform
      const audioContext = new AudioContext()

      // Resume audio context if suspended
      if (audioContext.state === "suspended") {
        await audioContext.resume()
      }

      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.3
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      let animationId: number
      let isDrawing = true

      const draw = () => {
        if (!isDrawing || !isTestingMic) {
          cancelAnimationFrame(animationId)
          return
        }

        animationId = requestAnimationFrame(draw)

        // Get frequency data
        analyser.getByteFrequencyData(dataArray)

        // Clear canvas with dark background
        ctx.fillStyle = "#374151"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Calculate average volume for overall level
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i]
        }
        const average = sum / bufferLength

        // Draw waveform bars
        const barCount = 32
        const barWidth = canvas.width / barCount

        for (let i = 0; i < barCount; i++) {
          // Use frequency data with some smoothing
          const dataIndex = Math.floor((i / barCount) * bufferLength)
          const barHeight = (dataArray[dataIndex] / 255) * canvas.height * 0.8

          // Create gradient for each bar
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
          gradient.addColorStop(0, "#3b82f6")
          gradient.addColorStop(0.5, "#60a5fa")
          gradient.addColorStop(1, "#93c5fd")

          ctx.fillStyle = gradient
          ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight)
        }

        // Draw volume level indicator
        ctx.fillStyle = "#9ca3af"
        ctx.font = "10px sans-serif"
        ctx.textAlign = "right"
        ctx.fillText(`Level: ${Math.round(average)}`, canvas.width - 5, 15)
      }

      // Start drawing
      draw()

      // Test for 5 seconds
      setTimeout(() => {
        isDrawing = false
        setIsTestingMic(false)
        cancelAnimationFrame(animationId)
        stream.getTracks().forEach((track) => track.stop())
        audioContext.close()

        // Clear canvas with dark background
        ctx.fillStyle = "#374151"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw placeholder text
        ctx.fillStyle = "#9ca3af"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("Click 'Test Microphone' to see audio waveform", canvas.width / 2, canvas.height / 2 + 4)
      }, 5000)
    } catch (error) {
      console.error("Microphone test failed:", error)
      setIsTestingMic(false)

      // Show error on canvas
      ctx.fillStyle = "#7f1d1d"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#f87171"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Microphone access denied", canvas.width / 2, canvas.height / 2 + 4)
    }
  }

  const inputDevices = devices.filter((device) => device.kind === "audioinput" && device.deviceId)
  const outputDevices = devices.filter((device) => device.kind === "audiooutput" && device.deviceId)

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Settings className="w-5 h-5" />
          Voice Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Device */}
        <div className="space-y-2">
          <Label className="text-gray-300">Microphone</Label>
          <Select
            value={settings.inputDevice}
            onValueChange={(value) => setSettings((prev) => ({ ...prev, inputDevice: value }))}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Select microphone" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="default" className="text-white hover:bg-gray-600">
                Default Microphone
              </SelectItem>
              {inputDevices.map((device) => (
                <SelectItem
                  key={device.deviceId}
                  value={device.deviceId || `input-${Math.random().toString(36).substr(2, 9)}`}
                  className="text-white hover:bg-gray-600"
                >
                  {device.label || `Microphone ${device.deviceId?.slice(0, 8) || "Unknown"}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Output Device */}
        <div className="space-y-2">
          <Label className="text-gray-300">Speakers</Label>
          <Select
            value={settings.outputDevice}
            onValueChange={(value) => setSettings((prev) => ({ ...prev, outputDevice: value }))}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Select speakers" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="default" className="text-white hover:bg-gray-600">
                Default Speakers
              </SelectItem>
              {outputDevices.map((device) => (
                <SelectItem
                  key={device.deviceId}
                  value={device.deviceId || `output-${Math.random().toString(36).substr(2, 9)}`}
                  className="text-white hover:bg-gray-600"
                >
                  {device.label || `Speaker ${device.deviceId?.slice(0, 8) || "Unknown"}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Volume Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-300">
              <Mic className="w-4 h-4" />
              Input Volume: {settings.inputVolume}%
            </Label>
            <Slider
              value={[settings.inputVolume]}
              onValueChange={([value]) => setSettings((prev) => ({ ...prev, inputVolume: value }))}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-300">
              <Volume2 className="w-4 h-4" />
              Output Volume: {settings.outputVolume}%
            </Label>
            <Slider
              value={[settings.outputVolume]}
              onValueChange={([value]) => setSettings((prev) => ({ ...prev, outputVolume: value }))}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Test Microphone */}
        <div className="space-y-3">
          <Button
            onClick={testMicrophone}
            disabled={isTestingMic}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <TestTube className="w-4 h-4 mr-2" />
            {isTestingMic ? "Testing... (5s)" : "Test Microphone"}
          </Button>

          {/* Waveform Canvas */}
          <div className="h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden relative">
            <canvas
              id="mic-test-canvas"
              className="w-full h-full rounded-lg"
              style={{ display: "block", width: "100%", height: "100%" }}
            />
            {!isTestingMic && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-gray-400 text-sm">Click 'Test Microphone' to see audio waveform</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
