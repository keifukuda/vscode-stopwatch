"use strict"
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"
import * as nls from "vscode-nls"

const options: nls.Options = {
  locale: "ja",
  messageFormat: nls.MessageFormat.file
}
const localize = nls.config(options)()
const config = vscode.workspace.getConfiguration("stopwatch")

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const status = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  )

  status.command = `stopwatch.${config.statusBar.clickCommand}`
  context.subscriptions.push(status)

  let stopwatch: Stopwatch = new Stopwatch(status)

  context.subscriptions.push(
    vscode.commands.registerCommand("stopwatch.reset", () => {
      stopwatch.reset()
    })
  )
  context.subscriptions.push(
    vscode.commands.registerCommand("stopwatch.stop", () => {
      stopwatch.stop()
    })
  )
  context.subscriptions.push(
    vscode.commands.registerCommand("stopwatch.restart", () => {
      stopwatch.restart()
    })
  )
  context.subscriptions.push(
    vscode.commands.registerCommand("stopwatch.toggle", () => {
      if (stopwatch.running) {
        stopwatch.stop()
      } else {
        stopwatch.restart()
      }
    })
  )
}

class Stopwatch {
  running: boolean
  times: number[]
  time: number
  timer: any
  status: vscode.StatusBarItem

  constructor(status: vscode.StatusBarItem) {
    this.running = false
    this.times = [0, 0, 0]
    this.time = 0
    this.timer = null
    this.status = status
    this.start()
    this.status.show()
  }

  reset(): void {
    this.times = [0, 0, 0]
    this.time = 0
    this.status.text = `${this.format()} (${localize(
      "stopwatch.reset",
      "Reset"
    )})`
  }

  start(): void {
    if (this.running) {
      return
    }
    this.running = true
    this.timer = setInterval(this.step.bind(this), 1000)
  }

  stop(): void {
    if (!this.running) {
      return
    }
    this.running = false
    clearInterval(this.timer)
    this.status.text = `${this.format()} (${localize(
      "stopwatch.stop",
      "Stopped"
    )})`
  }

  restart(): void {
    if (this.running) {
      return
    }
    this.running = true
    clearInterval(this.timer)
    this.status.text = `${this.format()} (${localize(
      "stopwatch.restart",
      "Restarted"
    )})`
    this.timer = setInterval(this.step.bind(this), 1000)
  }

  format(): string {
    const hh = this.times[0].toString().padStart(2, "0")
    const mm = this.times[1].toString().padStart(2, "0")
    const ss = this.times[2].toString().padStart(2, "0")
    return `${hh}:${mm}:${ss}`
  }

  step(): void {
    if (!this.running) {
      return
    }
    this.calculate()
    this.status.text = this.format()
    this.time++
  }

  calculate(): void {
    this.times[0] = Math.floor(this.time / 3600)
    this.times[1] = Math.floor((this.time % 3600) / 60)
    this.times[2] = Math.floor(this.time % 60)
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
