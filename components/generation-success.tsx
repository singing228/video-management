"use client"

import { Check } from "lucide-react"

interface GenerationSuccessProps {
  language: string
  onDismiss: () => void
}

export function GenerationSuccess({ language, onDismiss }: GenerationSuccessProps) {
  return (
    <div
      className="flex items-center gap-2 mb-4 px-4 py-2 bg-[#F5F9FF] rounded-md"
      onClick={(e) => {
        // Prevent the click from propagating to document
        e.stopPropagation()
      }}
    >
      <div className="rounded-full bg-[#E8F5E9] p-1">
        <Check className="h-4 w-4 text-green-600" />
      </div>
      <span className="text-gray-700">{language} 摘要已生成完成</span>
    </div>
  )
}

