import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { nanoid } from 'nanoid'

export type TerminalType = 'cmd' | 'powershell' | 'gitbash' | 'wt' | 'wsl'

export interface TerminalOption {
  id: string
  name: string
  path: string
  args?: string[]
  icon: string
  type: TerminalType
}

const iconsBase = path.join(__dirname, '../../resources/icons')

function exists(p: string): boolean {
  try {
    return fs.existsSync(p)
  } catch {
    return false
  }
}

function where(cmd: string): string | null {
  try {
    const out = execSync(`where ${cmd}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString()
    const first = out.split('\n')[0].trim()
    return exists(first) ? first : null
  } catch {
    return null
  }
}

function detectWSL(): TerminalOption[] {
  try {
    // 获取原始 Buffer（不要设置 encoding）
    const raw = execSync('wsl -l -q')

    // 将其以 UTF-16LE 解码成字符串
    const str = raw.toString('utf16le')

    // 清理非法字符（如 \u0000、\r），并按行拆分
    const list = str
      .replace(/\0/g, '') // 移除空字符
      .replace(/\r/g, '') // 移除回车符
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)

    return list.map(distro => ({
      id: `wsl:${distro}`,
      name: `WSL - ${distro}`,
      path: 'wsl.exe',
      args: ['-d', distro],
      icon: path.join(iconsBase, 'wsl.png'),
      type: 'wsl'
    }))
  } catch (err) {
    console.error('WSL 检测失败:', err)
    return []
  }
}

export function getAvailableShells(): TerminalOption[] {
  const terminals: TerminalOption[] = []

  // CMD
  const cmdPath = where('cmd') || 'C:\\Windows\\System32\\cmd.exe'
  if (exists(cmdPath)) {
    terminals.push({
      id: `cmd:${nanoid(5)}`,
      name: '命令提示符 (CMD)',
      path: cmdPath,
      icon: path.join(iconsBase, 'windows_cmd.png'),
      type: 'cmd'
    })
  }

  // PowerShell
  const powershellPath
    = where('powershell') || 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
  if (exists(powershellPath)) {
    terminals.push({
      id: `powershell:${nanoid(5)}`,
      name: 'PowerShell',
      path: powershellPath,
      icon: path.join(iconsBase, 'windows_powershell.png'),
      type: 'powershell'
    })
  }

  // Git Bash
  const gitBashPaths = [
    where('git-bash.exe'),
    'C:\\Program Files\\Git\\git-bash.exe',
    'C:\\Program Files (x86)\\Git\\git-bash.exe'
  ].filter(Boolean) as string[]

  const gitBashPath = gitBashPaths.find(exists)
  if (gitBashPath) {
    terminals.push({
      id: `gitbash:${nanoid(5)}`,
      name: 'Git Bash',
      path: gitBashPath,
      icon: path.join(iconsBase, 'git_bash.png'),
      type: 'gitbash'
    })
  }

  // Windows Terminal (wt.exe)
  const wtPath
    = where('wt')
    || path.join(process.env.LOCALAPPDATA || '', 'Microsoft\\WindowsApps\\wt.exe')
  if (exists(wtPath)) {
    terminals.push({
      id: `wt:${nanoid(5)}`,
      name: 'Windows Terminal',
      path: wtPath,
      icon: path.join(iconsBase, 'windows_terminal.png'),
      type: 'wt'
    })
  }

  // WSL distros
  const wslTerminals = detectWSL()
  terminals.push(...wslTerminals)

  return terminals
}
