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
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState, useEffect, useRef } from "react"
import { NotificationBanner } from "@/components/notification-banner"
import { GenerationSuccess } from "@/components/generation-success"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function VideoManagement() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [processingDialogOpen, setProcessingDialogOpen] = useState(false)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  // Add a new state for save success dialog
  // Change language selection from multi-select to single-select
  // 1. Update the state to store a single string instead of an array
  const [selectedLanguage, setSelectedLanguage] = useState<string>("original")
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
  // Add a new state for the badge and timer
  const [chineseOptionEnabled, setChineseOptionEnabled] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState<string>("影片摘要已成功生成")
  // 1. 添加一個新的 state 變量來跟踪按鈕是否禁用：
  const [isSummaryButtonDisabled, setIsSummaryButtonDisabled] = useState(true)

  // Ref for the textarea to enable auto-scrolling
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Check if character count exceeds limit
  const isCharacterLimitExceeded = editableText.length > 3000

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

  // Add useEffect to enable Chinese option after 2 minutes
  // 移除啟用中文選項的 useEffect
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setChineseOptionEnabled(true)
  //   }, 120000) // 2 minutes in milliseconds

  //   return () => clearTimeout(timer)
  // }, [])

  // Add useEffect to enable AI summary button after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSummaryButtonDisabled(false)
    }, 30000) // 30 seconds in milliseconds

    return () => clearTimeout(timer)
  }, [])

  // Update the languageOptions array to use the dynamic state for Chinese
  // Update the languageOptions array to make Chinese always available and remove the chip
  const languageOptions = [
    { id: "original", label: "影片原文", disabled: false, status: "" },
    { id: "english", label: "英文", disabled: false, status: "" },
    { id: "chinese", label: "中文", disabled: false, status: "" },
    { id: "english-full", label: "English", disabled: true, status: "摘要生成中" },
  ]

  // 2. Replace the handleLanguageChange function
  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value)
  }

  // Modify the handleTextChange function to remove the character limit
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // 移除字數限制，允許用戶輸入任意長度的文字
    const text = e.target.value
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

  // Add a new function to handle the save button click
  const handleSave = async () => {
    // Here you would typically make an API call to save the content
    setInitialContent(editableText) // Update initial content to track changes
    setHasChanges(false)
    // 設置通知消息為"儲存成功"
    setNotificationMessage("儲存成功")
    setShowNotification(true)
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
    setNotificationMessage("影片摘要已成功生成")
    setShowNotification(true)
  }

  const confirmSave = async () => {}

  const handleCancelPublish = () => {
    setUnpublishDialogOpen(true)
  }

  const confirmUnpublish = async () => {
    // Here you would typically make an API call to unpublish the content
    setUnpublishDialogOpen(false)
    setIsPublished(false)
    setNotificationMessage("已取消發布")
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

  // 3. Update the simulateGeneration function to use the single selected language
  const simulateGeneration = async () => {
    const isEnglishTranslation = selectedLanguage === "english"
    const isEnglish = selectedLanguage === "english-full"
    const isChinese = selectedLanguage === "chinese"
    const isOriginal = selectedLanguage === "original"

    // Set the current generating language for display
    if (isEnglish) {
      setCurrentGeneratingLanguage("English")
    } else if (isChinese) {
      setCurrentGeneratingLanguage("中文")
    } else if (isEnglishTranslation) {
      setCurrentGeneratingLanguage("英文")
    } else if (isOriginal) {
      setCurrentGeneratingLanguage("影片原文")
    } else {
      setCurrentGeneratingLanguage("影片原文") // Default to original if no language selected
    }

    // Show error dialog for Chinese option
    if (isChinese) {
      setDialogOpen(false)
      // Show error dialog instead of processing dialog
      setErrorDialogOpen(true)
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
      newContent = `💫 Summary

This video teaches you how to use Power BI to transform large datasets into interactive charts. It covers everything from data import and formatting to cross-table calculations, and demonstrates the use of visualization design and filtering features.

✨ Highlights

The video introduces how to perform data analysis using Power BI, especially how to import data from Excel and prepare it for visualization.

Introduces the Power BI software and explains its function of transforming large datasets into visually appealing interactive charts to help users understand the data context.
Guides viewers through downloading and installing Power BI, and shows how to get started with data analysis.
Uses Excel as an example to explain how to check and format the Excel sheet before importing to ensure data cleanliness.
Explains how Power BI automatically converts each Excel worksheet into a separate table and offers suggestions for handling multiple data segments.
Demonstrates how to select and import the created Excel tables into Power BI and verify the available data list.
How to split data and create relationships in Power BI, and how to perform cross-table calculations to analyze sales data:

Introduces the use of slashes as delimiters to split data.
Power BI's interface is similar to Office and provides various features to create charts and connect to databases.
Shows how to view relationships between tables and perform interactive queries and calculations.
Provides an example of a cross-table calculation to compute total sales.
How to set chart backgrounds, create bar charts, and use filter tools in Power BI to analyze data:

Demonstrates how to open the formatting panel in Power BI and set the page background color, including adjusting transparency and using images as backgrounds.
Details the steps to create a bar chart, including selecting the chart type and dragging data to the appropriate fields.
Explains how to customize visual elements in charts, such as adjusting colors and toggling data labels.
Covers how to use filter tools to analyze data for specific stores and set filtering conditions.
How to create and work with data tables in Power BI, including how to add a month column and calculate employee performance achievement rates:

Begins with switching to the "Table" view and opening the "Sales" table to create a Chinese month column.
Notes that incorrect sorting occurs due to text data types and introduces a solution.
Uses a horizontal bar chart to display employee performance achievement, calculating the ratio of actual to target performance.
Returns to the chart page to add a "Grouped Bar Chart" and sets the summary type to "Sum."
How to create a dashboard in Power BI and use different visualization tools to present sales data and other key metrics:

Drags the store's city/county location to the "Location" field and total sales to the "Size" field, so each store's sales appear as circles sized by volume.
Creates text cards on the dashboard to highlight key figures, such as "Total Sales."
Allows turning off units via formatting options and duplicating text cards to display other key data like the number of sales points.
Adds the company logo to the top-left corner of the dashboard and adjusts the background color to enhance visual impact.
The "View" tab includes a variety of color themes to help users customize the dashboard's appearance.
`
    } else {
      newContent = `
      💫 總結

      這部影片教你如何使用 Power BI 將大量數據轉換成互動式圖表，從資料導入、格式化到跨表計算，並展示了視覺化設計與篩選功能的應用。

      ✨ 亮點

      這段影片介紹了如何使用 Power BI 進行數據分析，特別是如何從 Excel 匯入數據並準備進行可視化。- 簡介 Power BI 軟體，說明其功能是將大量數據轉換成美觀的互動圖表，幫助使用者理解數據的背景。
- 指導觀眾如何下載並安裝 Power BI，並介紹如何開始使用該軟體進行數據分析。
- 以 Excel 為例，說明在導入數據前需要對 Excel 表格進行簡單的格式檢查，以確保數據的整齊性。
- 解釋 Power BI 如何自動將 Excel 的每個工作表轉換為獨立的表格，並提供如何處理多個數據片段的建議。
- 展示如何在 Power BI 中選擇剛剛創建的 Excel 表格進行數據匯入，並確認可用的數據列表。
          
如何在PowerBI中進行數據拆分和建立數據關聯，並展示了如何進行交叉表計算以分析銷售數據。- 介紹如何使用斜線作為分隔符來拆分數據。
- Power BI的操作介面類似於Office，並提供多種功能來創建圖表和連接數據庫。
- 展示如何查看數據表之間的關係，並進行互動查詢和計算。
- 進行交叉表計算的示例，計算銷售的總金額。
          
如何在 Power BI 中設置圖表的背景、創建條形圖以及使用過濾工具來分析數據。- 介紹如何在 Power BI 中打開格式面板並設置頁面背景顏色，包括透明度和使用圖片作為背景。
- 詳細說明了創建條形圖的步驟，包括選擇圖表類型和拖放數據到相應的字段中。
- 介紹如何自定義圖表中的視覺元素，如顏色和數據標籤的顯示與隱藏。
- 講解了如何使用過濾工具來分析特定商店的數據，以及設置數據篩選條件。
          
如何在 Power BI 中創建和處理數據表，包括如何添加月份列和計算員工的績效達成率。- 開始於切換到 '表格' 視圖，並打開 '銷售' 數據表以創建中文月份列。
- 提到由於數據類型為文本，導致月份排序錯誤，並介紹了解決方案。
- 使用 '橫條圖' 來展示員工績效達成率，並計算實際績效與目標績效的比率。
- 回到圖表頁面，添加 '群組條形圖'，並設置總結類型為 '總和'。
          
如何在 Power BI 中創建儀表板，並使用不同的視覺化工具來展示銷售數據和其他重要指標。- 將商店所在地的「縣市」拖到位置欄，並將總銷售額拖到「大小」欄，這樣每個商店的銷售額將以圓圈的大小呈現。
- 在儀表板中創建一些文字卡片來標示重要數據，包括「總銷售額」等指標。
- 可以通過格式選項關閉單位顯示，並複製文字卡片以替換為其他重要數據，如銷售點數量。
- 添加公司標誌到儀表板的左上角，並調整背景顏色以增強視覺效果。
- 在「檢視」選項卡中可以找到許多顏色主題，方便用戶自定義儀表板的外觀。
          
      `
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

      // 設置通知消息
      setNotificationMessage("影片摘要已成功生成")
      setShowNotification(true)
    }, 800) // Adjust the delay (in milliseconds) to control the pause before content appears
  }

  return (
    <>
      {showNotification && (
        <NotificationBanner message={notificationMessage} onClose={() => setShowNotification(false)} />
      )}
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

            {/* Modify the AI generate summary button to include the badge */}
            <div className="flex items-center mb-4">
              <Button
                className={`flex items-center gap-2 ${
                  isGenerating || isSummaryButtonDisabled
                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                    : "bg-[#0099CC] hover:bg-[#0099CC]/90"
                } text-white`}
                onClick={() => !isGenerating && !isSummaryButtonDisabled && setDialogOpen(true)}
                disabled={isGenerating || isSummaryButtonDisabled}
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
              className={`border rounded-md h-[428px] flex flex-col ${
                isGenerating ? "opacity-70 pointer-events-none" : ""
              } ${isCharacterLimitExceeded ? "border-red-500" : ""}`}
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
                <span className={editableText.length > 3000 ? "text-red-500" : "text-gray-500"}>
                  {editableText.length || generatedText.length} / 3000
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
                    className={`${
                      isGenerating || isCharacterLimitExceeded
                        ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                        : "bg-[#0099CC] hover:bg-[#0099CC]/90"
                    } text-white`}
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
                    className={`${
                      isGenerating || isCharacterLimitExceeded
                        ? "text-gray-400 border-gray-400 cursor-not-allowed"
                        : "text-[#0099CC] border-[#0099CC] hover:bg-[#0099CC]/10"
                    }`}
                    onClick={handleSave}
                    disabled={isGenerating || isCharacterLimitExceeded}
                  >
                    儲存
                  </Button>
                  <Button
                    className={`${
                      isGenerating || isCharacterLimitExceeded
                        ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                        : "bg-[#0099CC] hover:bg-[#0099CC]/90"
                    } text-white`}
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
                <DialogTitle>AI 生成摘要</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">系統將根據您選擇的字幕生成內容</p>
              </DialogHeader>
              {/* 4. Replace the checkboxes with radio buttons in the dialog */}
              <div className="py-4">
                <RadioGroup value={selectedLanguage} onValueChange={handleLanguageChange} className="space-y-8">
                  {languageOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2 pb-4 border-b border-gray-200 last:border-0"
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        disabled={option.disabled}
                        className={option.disabled ? "opacity-50 cursor-not-allowed" : ""}
                      />
                      <Label htmlFor={option.id} className={option.disabled ? "opacity-50 cursor-not-allowed" : ""}>
                        {option.label}
                      </Label>
                      {option.status && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2">
                          {option.status}
                        </span>
                      )}
                    </div>
                  ))}
                </RadioGroup>
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

          {/* Error Dialog for Chinese generation */}
          <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>影片摘要生成結果</DialogTitle>
              </DialogHeader>
              <div className="py-6 flex items-start gap-4">
                <div className="rounded-full bg-red-100 p-2 flex-shrink-0">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <p>影片摘要生成失敗，請重新操作或聯繫 NTU COOL 客服團隊協助。</p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  className="bg-[#0099CC] hover:bg-[#0099CC]/90 text-white w-full sm:w-auto"
                  onClick={() => setErrorDialogOpen(false)}
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

