"use client"

import type React from "react"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Info,
  ChevronLeft,
  Wand2,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState, useEffect, useRef } from "react"
import { NotificationBanner } from "@/components/notification-banner"
import { GenerationSuccess } from "@/components/generation-success"

export default function VideoManagement() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [processingDialogOpen, setProcessingDialogOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedText, setGeneratedText] = useState("")
  const [editableText, setEditableText] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false)
  const [currentGeneratingLanguage, setCurrentGeneratingLanguage] = useState("")
  const [saveChangesDialogOpen, setSaveChangesDialogOpen] = useState(false)
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const [showGenerationSuccess, setShowGenerationSuccess] = useState(false)
  const [scrollToPosition, setScrollToPosition] = useState<number | null>(null)
  const [unsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [initialContent, setInitialContent] = useState("")
  const [separatorPosition, setSeparatorPosition] = useState<number | null>(null)

  // Ref for the textarea to enable auto-scrolling
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Check if character count exceeds limit
  const isCharacterLimitExceeded = editableText.length > 1000

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showNotification])

  // Modified auto-scroll textarea useEffect to scroll to the separator position
  useEffect(() => {
    if (scrollToPosition !== null && textareaRef.current && separatorPosition !== null) {
      // Calculate approximate position to scroll to
      const textarea = textareaRef.current
      const lineHeight = 20 // Approximate line height in pixels
      const paddingTop = 16 // Padding top of the textarea (from p-4)

      // Calculate the position to scroll to (separator position minus a few lines to show context)
      const scrollToLine = Math.max(0, separatorPosition - 2) // Go 2 lines above separator
      const scrollPosition = scrollToLine * lineHeight + paddingTop

      // Set the scroll position
      textarea.scrollTop = scrollPosition

      // Reset the scroll position and separator position
      setScrollToPosition(null)
      setSeparatorPosition(null)
    }
  }, [scrollToPosition, separatorPosition])

  // Reset placeholder when content is cleared
  useEffect(() => {
    if (editableText === "" && generatedText === "") {
      setShowPlaceholder(true)
    }
  }, [editableText, generatedText])

  // Track changes to detect unsaved content
  useEffect(() => {
    if (editableText !== initialContent) {
      setHasChanges(true)
    } else {
      setHasChanges(false)
    }
  }, [editableText, initialContent])

  // Add a useEffect to handle document-wide click events to dismiss the success message
  useEffect(() => {
    if (showGenerationSuccess) {
      const handleDocumentClick = () => {
        setShowGenerationSuccess(false)
      }

      document.addEventListener("click", handleDocumentClick)

      return () => {
        document.removeEventListener("click", handleDocumentClick)
      }
    }
  }, [showGenerationSuccess])

  const languageOptions = [
    { id: "original", label: "影片原文 (自動產生)", disabled: false },
    { id: "english-trans", label: "英文 (自動翻譯)", disabled: false },
    { id: "chinese", label: "中文", disabled: true },
    { id: "english", label: "English", disabled: true },
  ]

  const handleLanguageChange = (checked: boolean, id: string) => {
    setSelectedLanguages((prev) => (checked ? [...prev, id] : prev.filter((lang) => lang !== id)))
  }

  // Modify the handleTextChange function to limit text to 1000 characters
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Limit text to 1000 characters
    const text = e.target.value.slice(0, 1000)
    setEditableText(text)
    if (text !== "") {
      setShowPlaceholder(false)
    }
  }

  const handleTextareaClick = () => {
    if (showPlaceholder && !isGenerating) {
      setShowPlaceholder(false)
      setEditableText("")
    }
  }

  const handleSaveAndPublish = async () => {
    // Here you would typically make an API call to save and publish the content
    setInitialContent(editableText) // Update initial content to track changes
    setHasChanges(false)
    setSuccessDialogOpen(true)
    setIsPublished(true)
  }

  const handleSaveChanges = async () => {
    // Here you would typically make an API call to save the changes
    setInitialContent(editableText) // Update initial content to track changes
    setHasChanges(false)
    setSaveChangesDialogOpen(true)
  }

  const confirmSaveChanges = async () => {
    setSaveChangesDialogOpen(false)
    setShowNotification(true)
  }

  const handleCancelPublish = () => {
    setUnpublishDialogOpen(true)
  }

  const confirmUnpublish = async () => {
    // Here you would typically make an API call to unpublish the content
    setUnpublishDialogOpen(false)
    setIsPublished(false)
    setShowNotification(true)
  }

  const handleBackToVideoManagement = () => {
    if (hasChanges) {
      setUnsavedChangesDialogOpen(true)
    } else {
      // Navigate back to video management
      console.log("Navigating back to video management")
    }
  }

  // Count the number of newlines in a string
  const countLines = (text: string): number => {
    return text.split("\n").length
  }

  // Modify the simulateGeneration function to add content with a slight delay
  const simulateGeneration = async () => {
    const isEnglishTranslation = selectedLanguages.includes("english-trans")
    const isEnglish = selectedLanguages.includes("english")
    const isChinese = selectedLanguages.includes("chinese")
    const isOriginal = selectedLanguages.includes("original")

    // Set the current generating language for display
    if (isEnglish) {
      setCurrentGeneratingLanguage("English")
    } else if (isChinese) {
      setCurrentGeneratingLanguage("中文")
    } else if (isEnglishTranslation) {
      setCurrentGeneratingLanguage("英文 (自動翻譯)")
    } else if (isOriginal) {
      setCurrentGeneratingLanguage("影片原文 (自動產生)")
    } else {
      setCurrentGeneratingLanguage("影片原文 (自動產生)") // Default to original if no language selected
    }

    // Show processing dialog only for Chinese
    if (isChinese) {
      setDialogOpen(false)
      setProcessingDialogOpen(true)

      // Simulate backend processing and show success message after 3 seconds
      setTimeout(() => {
        setProcessingDialogOpen(false)
        setShowGenerationSuccess(true)
      }, 3000)
      return
    }

    // Close the dialog
    setDialogOpen(false)
    setShowPlaceholder(false)

    // Set isGenerating to true to disable interactions
    setIsGenerating(true)

    // Get the existing content
    const existingContent = editableText || generatedText || ""

    // If there's existing content, add a separator
    const separator = existingContent ? "\n\n" + "─".repeat(50) + "\n\n" : ""
    const startContent = existingContent + separator

    // Calculate the line number where the separator starts
    const separatorLineNumber = countLines(existingContent)
    setSeparatorPosition(separatorLineNumber)

    // Select content based on language
    let newContent = ""

    if (isEnglish) {
      newContent = `Peptic Ulcer Disease: Comprehensive Analysis

1. Definition
Peptic ulcer refers to breaks in the digestive tract mucosa, including gastric, duodenal, and esophageal ulcers.

2. Symptoms
Pain: Typically in the upper abdomen, may worsen on empty stomach or during hunger in duodenal ulcer patients.
Nausea and vomiting: Common accompanying symptoms.
Signs of bleeding: Such as black stools.
Perforation complications: Leading to severe peritonitis.
Bloating: Causing loss of appetite and repeated vomiting.

3. Diagnostic Methods
Endoscopy: Used to observe ulcer location and treatment.
Imaging: Such as ultrasound and CT scans for auxiliary diagnosis.`
    } else if (isEnglishTranslation) {
      newContent = `Peptic Ulcer Disease: Comprehensive Analysis

1. Definition
Peptic ulcer refers to breaks in the digestive tract mucosa, including gastric, duodenal, and esophageal ulcers.

2. Symptoms
Pain: Typically in the upper abdomen, may worsen on empty stomach or during hunger in duodenal ulcer patients.
Nausea and vomiting: Common accompanying symptoms.
Signs of bleeding: Such as black stools.
Perforation complications: Leading to severe peritonitis.
Bloating: Causing loss of appetite and repeated vomiting.

3. Diagnostic Methods
Endoscopy: Used to observe ulcer location and treatment.
Imaging: Such as ultrasound and CT scans for auxiliary diagnosis.

4. Formation Mechanism
Erosive factors:`
    } else {
      newContent = `消化性潰瘍: 全面分析
1. 定義
消化性潰瘍是指影響消化道黏膜的裂開，包括胃潰瘍、十二指腸潰瘍和食道潰瘍等。

2. 症狀
疼痛：通常位於上腹，可能在空腹狀態下加劇，或在十二指腸潰瘍患者的飢餓時刻更為明顯。
嘔吐與噁心：常見伴隨症狀。
出血跡象：如黑色便秘。
穿孔併發症：導致嚴重腹膜炎。
飽脹：引發食慾缺乏和反覆嘔吐。

3. 診斷方法
內視鏡檢查：用於觀察潰瘍位置和處理。
影像學檢查：如超聲和 CT 掃描輔助診斷。

4. 形成機制
侵蝕因素：`
    }

    // Check if adding the new content would exceed the character limit
    if ((startContent + newContent).length > 1000) {
      // Truncate the new content to fit within the 1000 character limit
      const availableSpace = 1000 - startContent.length
      newContent = newContent.substring(0, availableSpace)
    }

    // Set initial content
    setGeneratedText(startContent)
    setEditableText(startContent)

    // Add a slight delay before adding the new content
    setTimeout(() => {
      // Add the full content at once
      const fullContent = startContent + newContent
      setGeneratedText(fullContent)
      setEditableText(fullContent)

      // Update initial content to track changes
      setInitialContent(fullContent)
      setHasChanges(false)

      // Trigger scroll to the separator position
      setScrollToPosition(Date.now())

      // End generating state
      setIsGenerating(false)

      // Show notification
      setShowNotification(true)
    }, 800) // Adjust the delay (in milliseconds) to control the pause before content appears
  }

  return (
    <>
      {showNotification && <NotificationBanner onClose={() => setShowNotification(false)} />}
      <div className="max-w-7xl mx-auto p-4 font-sans">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 text-[#0099CC] border-[#0099CC] hover:bg-[#0099CC]/10"
              onClick={handleBackToVideoManagement}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>回到影片管理</span>
            </Button>
            <h1 className="ml-4 text-lg">摘要管理：Week 1: 電影的聲音</h1>
          </div>
          <hr className="border-gray-200" />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <h2 className="text-lg font-medium">影片摘要</h2>
            </div>

            <div className="flex items-center mb-4">
              <Button
                className="flex items-center gap-2 bg-[#0099CC] hover:bg-[#0099CC]/90 text-white"
                onClick={() => !isGenerating && setDialogOpen(true)}
                disabled={isGenerating}
              >
                <Wand2 className="h-4 w-4" />
                <span>AI 生成摘要</span>
              </Button>
              <Popover>
                <PopoverTrigger>
                  <div className="ml-2 text-[#0099CC] cursor-pointer">
                    <Info className="h-5 w-5" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80" side="bottom" align="start">
                  <div className="text-sm space-y-2">
                    <p className="font-medium">AI 生成摘要 (實驗功能) 請注意以下注意事項：</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>目前僅支援中文及英文。</li>
                      <li>影片摘要是根據字幕內容生成的，若影片無字幕，則無法產生摘要。</li>
                      <li>若影片摘要已生成，可選擇字幕；若尚未生成，則無法選擇字幕。</li>
                      <li>影片摘要由 AI 自動生成，僅呈現來源內容，可能會有不準確或語意不順的情況。</li>
                    </ul>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Generation success message */}
            {showGenerationSuccess && (
              <GenerationSuccess
                language={currentGeneratingLanguage}
                onDismiss={() => setShowGenerationSuccess(false)}
              />
            )}

            {/* Text editor */}
            <div
              className={`border rounded-md h-[428px] flex flex-col ${isGenerating ? "opacity-70 pointer-events-none" : ""}`}
            >
              {/* Toolbar */}
              <div className="flex border-b">
                <div className="flex items-center p-2 border-r">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isGenerating}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isGenerating}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isGenerating}>
                    <Underline className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center p-2 border-r">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isGenerating}>
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isGenerating}>
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isGenerating}>
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center p-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isGenerating}>
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isGenerating}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center p-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isGenerating}>
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Text area */}
              <textarea
                ref={textareaRef}
                className="w-full p-4 flex-1 text-gray-700 resize-none focus:outline-none whitespace-pre-wrap overflow-y-auto"
                value={showPlaceholder ? "" : editableText || generatedText || ""}
                onChange={handleTextChange}
                onClick={handleTextareaClick}
                disabled={isGenerating}
                placeholder="請輸入或點擊 AI 生成摘要，然後點擊 『儲存並發布』 ，摘要將顯示在影片播放頁面。"
                style={{ color: showPlaceholder ? "#33333399" : undefined }}
              />

              {/* Character count and publish status */}
              <div className="p-2 text-sm border-t flex justify-end items-center gap-3">
                <span className={editableText.length >= 1000 ? "text-red-500" : "text-gray-500"}>
                  {editableText.length || generatedText.length} / 1000
                </span>
                {isPublished ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="h-4 w-4" />
                    <span>已發布</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-ban"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                    <span>未發布</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 mt-4">
              {isPublished ? (
                <>
                  <Button
                    variant="outline"
                    className="text-[#0099CC] border-[#0099CC] hover:bg-[#0099CC]/10"
                    onClick={handleCancelPublish}
                    disabled={isGenerating}
                  >
                    取消發布
                  </Button>
                  <Button
                    className="bg-[#0099CC] hover:bg-[#0099CC]/90 text-white"
                    onClick={handleSaveChanges}
                    disabled={isGenerating || isCharacterLimitExceeded}
                  >
                    儲存變更
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="text-[#0099CC] border-[#0099CC] hover:bg-[#0099CC]/10"
                    disabled={isGenerating || isCharacterLimitExceeded}
                  >
                    儲存
                  </Button>
                  <Button
                    className="bg-[#0099CC] hover:bg-[#0099CC]/90 text-white"
                    onClick={handleSaveAndPublish}
                    disabled={isGenerating || isCharacterLimitExceeded}
                  >
                    儲存並發布
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Video preview section */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="h-[88px] invisible"></div>
            <div className="bg-black rounded-md overflow-hidden w-[424px] h-[280px]">
              <video
                src="https://files-1.testing.dlc.ntu.edu.tw/cool-video/202412/38e7d83f-0cfe-4b42-b8f6-29bad679d313/video.mp4"
                poster="https://files-1.testing.dlc.ntu.edu.tw/cool-video/202412/38e7d83f-0cfe-4b42-b8f6-29bad679d313/thumbnail.png"
                controls
                width={424}
                height={280}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 bg-gray-50 rounded-md p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">影片連結</p>
                  <a
                    href="https://cool.testing.dlc.ntu.edu.tw/courses/32/external_tools/4"
                    className="text-[#0099CC] break-words text-sm hover:underline"
                  >
                    https://cool.testing.dlc.ntu.edu.tw/courses/32/external_tools/4
                  </a>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">影片名稱</p>
                  <p className="text-sm">Week 1: 電影的聲音</p>
                </div>
              </div>
            </div>
          </div>

          {/* Language Selection Dialog - Changed to checkboxes with disabled options */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>AI 生成摘要 (系統將根據您選擇的字幕生成內容)</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-4">
                  {languageOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2 border-b border-gray-100 pb-4 last:border-0"
                    >
                      <Checkbox
                        id={option.id}
                        checked={selectedLanguages.includes(option.id)}
                        onCheckedChange={(checked) =>
                          !option.disabled && handleLanguageChange(checked as boolean, option.id)
                        }
                        disabled={option.disabled}
                        className={option.disabled ? "opacity-50 cursor-not-allowed" : ""}
                      />
                      <Label htmlFor={option.id} className={option.disabled ? "opacity-50 cursor-not-allowed" : ""}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button
                  type="button"
                  className="bg-[#0099CC] hover:bg-[#0099CC]/90 text-white"
                  onClick={simulateGeneration}
                >
                  確定
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Success Dialog */}
          <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>影片摘要發布成功</DialogTitle>
              </DialogHeader>
              <div className="py-6 flex items-start gap-4">
                <div className="rounded-full bg-green-100 p-2">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <p>摘要已成功發布！學生現在可以在影片播放頁查看最新內容。</p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  className="bg-[#0099CC] hover:bg-[#0099CC]/90 text-white w-full sm:w-auto"
                  onClick={() => setSuccessDialogOpen(false)}
                >
                  確定
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Processing Dialog */}
          <Dialog open={processingDialogOpen} onOpenChange={setProcessingDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>影片摘要處理中</DialogTitle>
              </DialogHeader>
              <div className="py-6">
                <p>目前影片摘要尚未生成，這可能需要較長的時間處理。</p>
                <p>我們會在摘要準備好後通知您，屆時請再次點選「AI 生成摘要」按鈕即可取得摘要。</p>
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setProcessingDialogOpen(false)}>
                  取消
                </Button>
                <Button
                  type="button"
                  className="bg-[#0099CC] hover:bg-[#0099CC]/90 text-white"
                  onClick={() => setProcessingDialogOpen(false)}
                >
                  確定
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Unpublish Confirmation Dialog */}
          <Dialog open={unpublishDialogOpen} onOpenChange={setUnpublishDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>取消發布</DialogTitle>
              </DialogHeader>
              <div className="py-6">
                <p>取消發布後，學生將無法看到摘要，確定要取消嗎？</p>
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setUnpublishDialogOpen(false)}>
                  取消
                </Button>
                <Button
                  type="button"
                  className="bg-[#0099CC] hover:bg-[#0099CC]/90 text-white"
                  onClick={confirmUnpublish}
                >
                  確定
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Save Changes Dialog */}
          <Dialog open={saveChangesDialogOpen} onOpenChange={setSaveChangesDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>影片摘要更新成功</DialogTitle>
              </DialogHeader>
              <div className="py-6 flex items-start gap-4">
                <div className="rounded-full bg-green-100 p-2">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <p>摘要已更新！學生現在可以在影片播放頁查看最新內容。</p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  className="bg-[#0099CC] hover:bg-[#0099CC]/90 text-white w-full sm:w-auto"
                  onClick={confirmSaveChanges}
                >
                  確定
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Unsaved Changes Dialog */}
          <Dialog open={unsavedChangesDialogOpen} onOpenChange={setUnsavedChangesDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>影片摘要尚未儲存</DialogTitle>
              </DialogHeader>
              <div className="py-6">
                <p>摘要尚未儲存，離開此頁將遺失編輯內容，是否確認離開？</p>
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUnsavedChangesDialogOpen(false)}
                  className="text-[#0099CC] border-[#0099CC] hover:bg-[#0099CC]/10"
                >
                  取消
                </Button>
                <Button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    setUnsavedChangesDialogOpen(false)
                    // Navigate back to video management
                    console.log("Confirmed leaving - navigating back to video management")
                  }}
                >
                  確定離開
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )
}

