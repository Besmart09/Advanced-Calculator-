export class MathEngine {
  private constants = {
    π: Math.PI,
    e: Math.E,
  }

  evaluate(expression: string): number {
    if (!expression || expression.trim() === "") {
      return 0
    }

    try {
      // Replace display symbols with JavaScript operators
      let processedExpression = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, Math.PI.toString())
        .replace(/e(?![0-9])/g, Math.E.toString())

      // Handle scientific functions
      processedExpression = this.processFunctions(processedExpression)

      // Handle powers (x² and x³)
      processedExpression = processedExpression
        .replace(/(\d+)²/g, "Math.pow($1, 2)")
        .replace(/(\d+)³/g, "Math.pow($1, 3)")

      // Handle square root
      processedExpression = processedExpression.replace(/√$$([^)]+)$$/g, "Math.sqrt($1)")
      processedExpression = processedExpression.replace(/√(\d+)/g, "Math.sqrt($1)")

      // Handle power operator
      processedExpression = processedExpression.replace(/\^/g, "**")

      // Validate parentheses
      if (!this.validateParentheses(processedExpression)) {
        throw new Error("Mismatched parentheses")
      }

      // Use Function constructor for safe evaluation
      const result = new Function(`"use strict"; return (${processedExpression})`)()

      if (typeof result !== "number" || !isFinite(result)) {
        throw new Error("Invalid calculation")
      }

      // Round to avoid floating point precision issues
      return Math.round(result * 1e12) / 1e12
    } catch (error) {
      throw new Error("Invalid expression")
    }
  }

  private processFunctions(expression: string): string {
    // Handle trigonometric functions (convert to radians)
    expression = expression.replace(/sin$$([^)]+)$$/g, (match, angle) => {
      return `Math.sin(${angle} * Math.PI / 180)`
    })

    expression = expression.replace(/cos$$([^)]+)$$/g, (match, angle) => {
      return `Math.cos(${angle} * Math.PI / 180)`
    })

    expression = expression.replace(/tan$$([^)]+)$$/g, (match, angle) => {
      return `Math.tan(${angle} * Math.PI / 180)`
    })

    // Handle logarithmic functions
    expression = expression.replace(/log$$([^)]+)$$/g, "Math.log10($1)")
    expression = expression.replace(/ln$$([^)]+)$$/g, "Math.log($1)")

    // Handle reciprocal
    expression = expression.replace(/1\/$$([^)]+)$$/g, "(1/($1))")

    return expression
  }

  private validateParentheses(expression: string): boolean {
    let count = 0
    for (const char of expression) {
      if (char === "(") count++
      if (char === ")") count--
      if (count < 0) return false
    }
    return count === 0
  }

  // Additional utility methods for future enhancements
  formatResult(result: number): string {
    if (Math.abs(result) >= 1e15 || (Math.abs(result) < 1e-6 && result !== 0)) {
      return result.toExponential(6)
    }
    return result.toString()
  }

  isValidExpression(expression: string): boolean {
    try {
      this.evaluate(expression)
      return true
    } catch {
      return false
    }
  }
}
