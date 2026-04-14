'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface ToolPageProps {
  title: string
  icon: string
  children: ReactNode
}

export function ToolPage({ title, icon, children }: ToolPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-4">
          <Link href="/" className="text-textMuted hover:text-text transition-colors">
            ← Back
          </Link>
          <span className="text-xl">{icon}</span>
          <h1 className="text-xl font-semibold text-text">{title}</h1>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {children}
      </div>
    </main>
  )
}

interface TextAreaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

export function TextArea({ value, onChange, placeholder, rows = 10, className = '' }: TextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full bg-surface border border-border rounded-xl p-4 text-text placeholder-textDim font-mono text-sm resize-y focus:outline-none focus:border-primary transition-colors ${className}`}
    />
  )
}

interface ButtonProps {
  onClick?: () => void
  children: ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

export function Button({ onClick, children, variant = 'primary', className = '', type = 'button', disabled = false }: ButtonProps) {
  const base = 'px-4 py-2 rounded-lg font-medium transition-all duration-200'
  const variants = {
    primary: 'bg-primary text-white hover:bg-primaryHover',
    secondary: 'bg-surface border border-border text-text hover:bg-surfaceHover'
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {children}
    </button>
  )
}

interface ResultBoxProps {
  title: string
  children: ReactNode
}

export function ResultBox({ title, children }: ResultBoxProps) {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-border text-sm text-textMuted flex justify-between items-center">
        <span>{title}</span>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

interface CopyButtonProps {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
  }
  return (
    <button
      onClick={handleCopy}
      className="text-xs text-textMuted hover:text-primary transition-colors"
    >
      Copy
    </button>
  )
}