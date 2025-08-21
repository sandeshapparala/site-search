'use client'

import SearchInterface from '@/components/SearchInterface'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Site Search
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Search and discover content across websites with AI-powered semantic search
            </p>
          </div>
          <SearchInterface />
        </div>
      </div>
    </div>
  )
}
