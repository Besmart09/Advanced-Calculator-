"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { History, Copy, Trash2, RotateCcw } from "lucide-react"
import { MathEngine } from "@/lib/math-engine"
import { cn } from "@/lib/utils"

interface HistoryItem {
  id: string
  expression: string
  result: string
  timestamp: Date
}

export default function AdvancedCalculator() {
  const [display, setDisplay] = useState("0")
  const [expression, setExpression] = useState("")
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isError, setIsError] = useState(false)
  const [lastResult, setLastResult] = useState("")

  const mathEngine = new MathEngine()

  // Real-time evaluation
  useEffect(() => {
    if (expression && !isError) {
      try {
        const result = mathEngine.evaluate(expression)
        if (result !== null && result !== undefined && !isNaN(result)) {
          setDisplay(result.toString())
        }
      } catch (error) {
        // Don't update display during typing if there's an error
      }
    }
  }, [expression])

  const handleNumber = (num: string) => {
    setIsError(false)
    if (display === "0" || isError) {
      setDisplay(num)
      setExpression(num)
    } else {
      setDisplay(display + num)
      setExpression(expression + num)
    }
  }

  const handleOperator = (op: string) => {
    setIsError(false)
    const newExpression = expression + op
    setExpression(newExpression)
    setDisplay(newExpression)
  }

  const handleFunction = (func: string) => {
    setIsError(false)
    let newExpression = ""

    switch (func) {
      case "sin":
      case "cos":
      case "tan":
      case "log":
      case "ln":
      case "√":
        newExpression = expression + func + "("
        break
      case "π":
        newExpression = expression + "π"
        break
      case "e":
        newExpression = expression + "e"
        break
      case "x²":
        newExpression = expression + "²"
        break
      case "x³":
        newExpression = expression + "³"
        break
      case "1/x":
        newExpression = expression + "1/("
        break
      default:
        newExpression = expression + func
    }

    setExpression(newExpression)
    setDisplay(newExpression)
  }

  const handleEquals = () => {
    if (!expression) return

    try {
      const result = mathEngine.evaluate(expression)
      const resultStr = result.toString()

      // Add to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        expression: expression,
        result: resultStr,
        timestamp: new Date(),
      }

      setHistory((prev) => [historyItem, ...prev.slice(0, 49)]) // Keep last 50 items
      setDisplay(resultStr)
      setExpression(resultStr)
      setLastResult(resultStr)
      setIsError(false)
    } catch (error) {
      setDisplay("Error")
      setIsError(true)
    }
  }

  const handleClear = () => {
    setDisplay("0")
    setExpression("")
    setIsError(false)
  }

  const handleBackspace = () => {
    if (expression.length <= 1) {
      handleClear()
    } else {
      const newExpression = expression.slice(0, -1)
      setExpression(newExpression)
      setDisplay(newExpression || "0")
      setIsError(false)
    }
  }

  const handleHistorySelect = (item: HistoryItem) => {
    setExpression(item.result)
    setDisplay(item.result)
    setShowHistory(false)
    setIsError(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const clearHistory = () => {
    setHistory([])
  }

  const buttonClass = "h-14 text-lg font-medium transition-all duration-150 active:scale-95"
  const operatorClass = "bg-orange-500 hover:bg-orange-600 text-white"
  const functionClass = "bg-gray-600 hover:bg-gray-700 text-white"
  const numberClass = "bg-gray-800 hover:bg-gray-700 text-white"

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-md mx-auto">
      <Card className="bg-gray-900 border-gray-700 overflow-hidden">
        {/* Display Area */}
        <div className="p-4 bg-gray-800">
          <div className="flex justify-between items-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-gray-400 hover:text-white"
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(display)}
              className="text-gray-400 hover:text-white"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-400 h-6 overflow-hidden">
              {expression && expression !== display ? expression : ""}
            </div>
            <div className={cn("text-3xl font-mono break-all", isError ? "text-red-400" : "text-white")}>{display}</div>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="border-t border-gray-700">
            <div className="flex justify-between items-center p-3 bg-gray-800">
              <span className="text-sm font-medium">History</span>
              <Button variant="ghost" size="sm" onClick={clearHistory} className="text-gray-400 hover:text-white">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-48 p-2">
              {history.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No calculations yet</div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleHistorySelect(item)}
                    className="p-2 hover:bg-gray-800 cursor-pointer rounded text-sm"
                  >
                    <div className="text-gray-400">{item.expression}</div>
                    <div className="text-white font-mono">= {item.result}</div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        )}

        <Separator className="bg-gray-700" />

        {/* Button Grid */}
        <div className="p-4 grid grid-cols-4 gap-2">
          {/* Row 1 - Functions */}
          <Button onClick={handleClear} className={cn(buttonClass, "bg-red-600 hover:bg-red-700 text-white")}>
            C
          </Button>
          <Button onClick={handleBackspace} className={cn(buttonClass, functionClass)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={() => handleOperator("(")} className={cn(buttonClass, functionClass)}>
            (
          </Button>
          <Button onClick={() => handleOperator(")")} className={cn(buttonClass, functionClass)}>
            )
          </Button>

          {/* Row 2 - Scientific Functions */}
          <Button onClick={() => handleFunction("sin")} className={cn(buttonClass, functionClass)}>
            sin
          </Button>
          <Button onClick={() => handleFunction("cos")} className={cn(buttonClass, functionClass)}>
            cos
          </Button>
          <Button onClick={() => handleFunction("tan")} className={cn(buttonClass, functionClass)}>
            tan
          </Button>
          <Button onClick={() => handleOperator("÷")} className={cn(buttonClass, operatorClass)}>
            ÷
          </Button>

          {/* Row 3 - More Functions */}
          <Button onClick={() => handleFunction("log")} className={cn(buttonClass, functionClass)}>
            log
          </Button>
          <Button onClick={() => handleFunction("ln")} className={cn(buttonClass, functionClass)}>
            ln
          </Button>
          <Button onClick={() => handleFunction("√")} className={cn(buttonClass, functionClass)}>
            √
          </Button>
          <Button onClick={() => handleOperator("×")} className={cn(buttonClass, operatorClass)}>
            ×
          </Button>

          {/* Row 4 - Numbers and Operations */}
          <Button onClick={() => handleNumber("7")} className={cn(buttonClass, numberClass)}>
            7
          </Button>
          <Button onClick={() => handleNumber("8")} className={cn(buttonClass, numberClass)}>
            8
          </Button>
          <Button onClick={() => handleNumber("9")} className={cn(buttonClass, numberClass)}>
            9
          </Button>
          <Button onClick={() => handleOperator("-")} className={cn(buttonClass, operatorClass)}>
            -
          </Button>

          {/* Row 5 */}
          <Button onClick={() => handleNumber("4")} className={cn(buttonClass, numberClass)}>
            4
          </Button>
          <Button onClick={() => handleNumber("5")} className={cn(buttonClass, numberClass)}>
            5
          </Button>
          <Button onClick={() => handleNumber("6")} className={cn(buttonClass, numberClass)}>
            6
          </Button>
          <Button onClick={() => handleOperator("+")} className={cn(buttonClass, operatorClass)}>
            +
          </Button>

          {/* Row 6 */}
          <Button onClick={() => handleNumber("1")} className={cn(buttonClass, numberClass)}>
            1
          </Button>
          <Button onClick={() => handleNumber("2")} className={cn(buttonClass, numberClass)}>
            2
          </Button>
          <Button onClick={() => handleNumber("3")} className={cn(buttonClass, numberClass)}>
            3
          </Button>
          <Button onClick={() => handleFunction("^")} className={cn(buttonClass, functionClass)}>
            x^y
          </Button>

          {/* Row 7 */}
          <Button onClick={() => handleFunction("π")} className={cn(buttonClass, functionClass)}>
            π
          </Button>
          <Button onClick={() => handleNumber("0")} className={cn(buttonClass, numberClass)}>
            0
          </Button>
          <Button onClick={() => handleNumber(".")} className={cn(buttonClass, numberClass)}>
            .
          </Button>
          <Button onClick={handleEquals} className={cn(buttonClass, "bg-blue-600 hover:bg-blue-700 text-white")}>
            =
          </Button>
        </div>
      </Card>
    </div>
  )
}
