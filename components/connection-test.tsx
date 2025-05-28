"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Loader2, Wifi, Mic, Volume2, Settings } from "lucide-react"

interface ConnectionTestProps {
  onTestComplete: (success: boolean) => void
}

export default function ConnectionTest({ onTestComplete }: ConnectionTestProps) {
  const [tests, setTests] = useState({
    microphone: { status: "pending", message: "" },
    speakers: { status: "pending", message: "" },
    network: { status: "pending", message: "" },
  })
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string>("")
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedInputDevice, setSelectedInputDevice] = useState<string>("default")
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>("default")
  const [isLoadingDevices, setIsLoadingDevices] = useState(true)
  const [showDeviceSelection, setShowDeviceSelection] = useState(false)

  // Load available devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        setIsLoadingDevices(true)
        const deviceList = await navigator.mediaDevices.enumerateDevices()
        setDevices(deviceList)
      } catch (error) {
        console.error("Error getting devices:", error)
      } finally {
        setIsLoadingDevices(false)
      }
    }

    getDevices()
  }, [])

  const runTests = async () => {
    setIsRunning(true)
    let testResults = {
      microphone: { status: "pending", message: "" },
      speakers: { status: "pending", message: "" },
      network: { status: "pending", message: "" },
    }

    // Test microphone access and input detection
    setCurrentTest("microphone")
    try {
      const audioConstraints = {
        audio: selectedInputDevice !== "default" ? { deviceId: selectedInputDevice } : true
      }
      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints)
      
      // Update UI to show we're listening
      setTests((prev) => ({
        ...prev,
        microphone: { status: "running", message: "Listening for input... (speak now)" },
      }))
      
      // Test for actual microphone input
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      
      // Configure analyzer for better sensitivity
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.2
      source.connect(analyser)

      // Check for audio input over a short period
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      let hasInput = false
      let maxLevel = 0
      
      // Wait 3 seconds and check for audio input
      await new Promise((resolve) => {
        let checkCount = 0
        const maxChecks = 30 // Check 30 times over 3 seconds
        
        const checkAudio = () => {
          analyser.getByteFrequencyData(dataArray)
          // Check both average and peak levels
          const sum = dataArray.reduce((a, b) => a + b)
          const average = sum / dataArray.length
          const peak = Math.max(...dataArray)
          maxLevel = Math.max(maxLevel, peak)
          
          // More sensitive detection - check for any significant audio activity
          if (average > 5 || peak > 15) { 
            hasInput = true
            resolve(true)
            return
          }
          
          checkCount++
          if (checkCount < maxChecks) {
            setTimeout(checkAudio, 100)
          } else {
            resolve(false)
          }
        }
        
        checkAudio()
      })

      testResults.microphone = hasInput
        ? { status: "success", message: "Microphone input detected successfully" }
        : { status: "success", message: "Microphone accessible (no input detected)" }

      // Clean up
      stream.getTracks().forEach((track) => track.stop())
      audioContext.close()
    } catch (error) {
      testResults.microphone = { status: "error", message: "Microphone access denied" }
    }

    // Test speakers (basic audio context)
    setCurrentTest("speakers")
    setTests((prev) => ({
      ...prev,
      speakers: { status: "running", message: "Testing audio output..." },
    }))
    
    try {
      const audioContext = new AudioContext()
      await audioContext.resume()
      testResults.speakers = { status: "success", message: "Audio output available" }
      audioContext.close()
    } catch (error) {
      testResults.speakers = { status: "error", message: "Audio output unavailable" }
    }

    // Test network connectivity
    setCurrentTest("network")
    setTests((prev) => ({
      ...prev,
      network: { status: "running", message: "Testing network connection..." },
    }))
    
    try {
      const response = await fetch("/api/health", { method: "HEAD" })
      if (response.ok) {
        testResults.network = { status: "success", message: "Network connection stable" }
      } else {
        throw new Error("Network test failed")
      }
    } catch (error) {
      testResults.network = { status: "error", message: "Network connection issues" }
    }

    setCurrentTest("")

    // Update state with all results
    setTests(testResults)
    setIsRunning(false)

    // Check if all tests passed
    const allPassed = Object.values(testResults).every((test) => test.status === "success")
    onTestComplete(allPassed)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />
      case "running":
        return <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
      case "pending":
        return <div className="w-5 h-5 rounded-full border-2 border-gray-500" />
      default:
        return <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
    }
  }

  const getTestIcon = (testType: string) => {
    switch (testType) {
      case "microphone":
        return <Mic className="w-4 h-4 text-gray-300" />
      case "speakers":
        return <Volume2 className="w-4 h-4 text-gray-300" />
      case "network":
        return <Wifi className="w-4 h-4 text-gray-300" />
      default:
        return null
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          Connection Test
          <Badge variant="outline" className="border-gray-600 text-gray-300">
            Pre-flight Check
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {Object.entries(tests).map(([testType, result]) => (
            <div key={testType} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 flex-1">
                {getTestIcon(testType)}
                <span className="font-medium capitalize text-white">{testType}</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(result.status)}
                <span className="text-sm text-gray-300">{result.message}</span>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={runTests} disabled={isRunning} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {currentTest ? `Testing ${currentTest}...` : "Running Tests..."}
            </>
          ) : (
            "Run Connection Test"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
