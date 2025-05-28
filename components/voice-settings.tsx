"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Settings, Mic, Volume2, TestTube, Loader2 } from "lucide-react"
import AudioVisualizer from "@/components/audio-visualizer"

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
  const [isLoadingDevices, setIsLoadingDevices] = useState(true)
  const [deviceError, setDeviceError] = useState<string>("")
  const [micTestState, setMicTestState] = useState<'idle' | 'requesting' | 'listening' | 'success' | 'failed'>('idle')
  const [hasDetectedAudio, setHasDetectedAudio] = useState(false)
  
  // Refs for cleanup
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const getDevices = async () => {
      try {
        setIsLoadingDevices(true)
        setDeviceError("")
        const deviceList = await navigator.mediaDevices.enumerateDevices()
        setDevices(deviceList)
      } catch (error) {
        console.error("Error getting devices:", error)
        setDeviceError("Failed to access audio devices. Please check permissions.")
      } finally {
        setIsLoadingDevices(false)
      }
    }

    getDevices()
  }, [])

  useEffect(() => {
    onSettingsChange?.(settings)
  }, [settings, onSettingsChange])

  // No canvas initialization needed anymore

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupMicTest()
    }
  }, [])

  // Simple audio detection for testing
  const monitorAudioLevel = () => {
    if (!streamRef.current || !audioContextRef.current) return

    const analyser = audioContextRef.current.createAnalyser()
    const source = audioContextRef.current.createMediaStreamSource(streamRef.current)
    analyser.fftSize = 256
    source.connect(analyser)

    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    
    const checkAudio = () => {
      if (!streamRef.current?.active) return
      
      analyser.getByteFrequencyData(dataArray)
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i]
      }
      const average = sum / dataArray.length
      
      if (average > 5) {
        setHasDetectedAudio(true)
      }
      
      if (streamRef.current?.active) {
        requestAnimationFrame(checkAudio)
      }
    }
    
    checkAudio()
  }

  // Cleanup function
  const cleanupMicTest = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Reset states
    setMicTestState('idle')
    setHasDetectedAudio(false)
  }

  const testMicrophone = async () => {
    if (isTestingMic) {
      // Stop the test
      setIsTestingMic(false)
      cleanupMicTest()
      return
    }
    
    setIsTestingMic(true)
    setMicTestState('requesting')

    try {
      // Request microphone access
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: settings.inputDevice !== "default" ? settings.inputDevice : undefined,
          noiseSuppression: settings.noiseSuppression,
          echoCancellation: settings.echoCancellation,
        },
      })

      // Set up audio analysis (same approach as AudioVisualizer)
      audioContextRef.current = new AudioContext()
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume()
      }

      setMicTestState('listening')

      // Start audio monitoring for detection
      monitorAudioLevel()

      // Complete test after 5 seconds
      timeoutRef.current = setTimeout(() => {
        setIsTestingMic(false)
        setMicTestState(hasDetectedAudio ? 'success' : 'failed')
        cleanupMicTest()
        
        // Reset to idle after showing result
        setTimeout(() => {
          setMicTestState('idle')
        }, 3000)
      }, 5000)

    } catch (error) {
      console.error("Microphone test failed:", error)
      setIsTestingMic(false)
      setMicTestState('failed')
      cleanupMicTest()
      
      // Reset to idle after showing error
      setTimeout(() => {
        setMicTestState('idle')
      }, 3000)
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
        {deviceError && (
          <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded border border-red-800">
            {deviceError}
          </div>
        )}
        
        {/* Input Device */}
        <div className="space-y-2">
          <Label className="text-gray-300">Microphone</Label>
          <Select
            value={settings.inputDevice}
            onValueChange={(value) => setSettings((prev) => ({ ...prev, inputDevice: value }))}
            disabled={isLoadingDevices}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder={isLoadingDevices ? "Loading devices..." : "Select microphone"} />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="default" className="text-white hover:bg-gray-600">
                Default Microphone
              </SelectItem>
              {inputDevices.map((device) => (
                <SelectItem
                  key={device.deviceId}
                  value={device.deviceId || `input-${Math.random().toString(36).substring(2, 11)}`}
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
            disabled={isLoadingDevices}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder={isLoadingDevices ? "Loading devices..." : "Select speakers"} />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="default" className="text-white hover:bg-gray-600">
                Default Speakers
              </SelectItem>
              {outputDevices.map((device) => (
                <SelectItem
                  key={device.deviceId}
                  value={device.deviceId || `output-${Math.random().toString(36).substring(2, 11)}`}
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
          {/* Status Message */}
          <div className="text-center">
            {micTestState === 'requesting' && (
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Requesting microphone access...</span>
              </div>
            )}
            {micTestState === 'listening' && (
              <div className="text-blue-400">
                <div className="text-sm font-medium">Speak now!</div>
                <div className="text-xs text-gray-400">We're listening for your voice</div>
              </div>
            )}
            {micTestState === 'success' && (
              <div className="text-green-400">
                <div className="text-sm font-medium">Perfect! We can hear you clearly</div>
                <div className="text-xs text-gray-400">Your microphone is working great</div>
              </div>
            )}
            {micTestState === 'failed' && (
              <div className="text-orange-400">
                <div className="text-sm font-medium">Try speaking a bit louder</div>
                <div className="text-xs text-gray-400">We had trouble detecting your voice</div>
              </div>
            )}
            {micTestState === 'idle' && (
              <div className="text-gray-400 text-xs">
                Test your microphone to make sure it's working properly
              </div>
            )}
          </div>

          {/* Audio Visualizer (reusing existing component) */}
          <div className="h-16 bg-gray-700 rounded-lg p-3">
            <AudioVisualizer 
              audioStream={streamRef.current || undefined}
              isActive={isTestingMic}
              className="rounded"
            />
          </div>

          {/* Test Button */}
          <Button
            onClick={testMicrophone}
            disabled={isLoadingDevices}
            variant={isTestingMic ? "destructive" : "outline"}
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
          >
            <TestTube className="w-4 h-4 mr-2" />
            {isTestingMic ? "Stop Test" : 
             isLoadingDevices ? "Loading..." : 
             "Test Microphone (5s)"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
