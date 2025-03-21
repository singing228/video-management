import { Check } from "lucide-react"

export function PublishStatus() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#0099CC]/[0.04] text-[#0099CC] rounded-md mb-4">
      <Check className="h-4 w-4" />
      <span>摘要已發布</span>
    </div>
  )
}

