"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Mic, Settings, Phone, MessageSquare } from "lucide-react"

interface QuickStartGuideProps {
  currentStep?: number
}

export default function QuickStartGuide({ currentStep = 0 }: QuickStartGuideProps) {
  const steps = [
    {
      icon: <Settings className="w-4 h-4" />,
      title: "Configure Settings",
      description: "Set up your microphone and speakers",
      completed: currentStep > 0,
    },
    {
      icon: <Mic className="w-4 h-4" />,
      title: "Test Audio",
      description: "Run connection tests to ensure everything works",
      completed: currentStep > 1,
    },
    {
      icon: <Phone className="w-4 h-4" />,
      title: "Connect to Agent",
      description: "Join the voice chat room",
      completed: currentStep > 2,
    },
    {
      icon: <MessageSquare className="w-4 h-4" />,
      title: "Start Conversation",
      description: "Begin talking with the AI agent",
      completed: currentStep > 3,
    },
  ]

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg text-white">Quick Start Guide</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className={step.completed ? "text-green-400" : "text-gray-300"}>{step.icon}</span>
                <div className="flex-1">
                  <span className={`font-medium ${step.completed ? "text-green-300" : "text-gray-300"}`}>
                    {step.title}
                  </span>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
              </div>
              <Badge
                variant={step.completed ? "default" : "secondary"}
                className={`text-xs ${
                  step.completed ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-600 text-gray-300"
                }`}
              >
                {step.completed ? "Done" : `Step ${index + 1}`}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
