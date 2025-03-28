"use client"

import { Check, X } from "lucide-react"

interface NotificationBannerProps {
  onClose: () => void
  message?: string
}

export function NotificationBanner({ onClose, message = "影片摘要已成功生成" }: NotificationBannerProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="w-[320px] bg-green-50 p-4 rounded-md shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <span>{message}</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

