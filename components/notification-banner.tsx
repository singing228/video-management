"use client"

import { Check, X } from "lucide-react"

interface NotificationBannerProps {
  onClose: () => void
}

export function NotificationBanner({ onClose }: NotificationBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 bg-green-50 p-4 flex items-center justify-between z-50">
      <div className="flex items-center gap-2">
        <Check className="h-5 w-5 text-green-600" />
        <span>影片摘要已成功生成</span>
      </div>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

