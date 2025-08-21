'use client'

import { useState } from 'react'
import { Search, Loader2, ExternalLink, Hash, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import DOMPurify from 'dompurify'

interface SearchResult {
  ordinal: number
  score: number
  html_snippet: string
  text_preview: string
  tokens: number
}

interface SearchResponse {
  url: string
  query: string
  count: number
  results: SearchResult[]
}

export default function SearchInterface() {
  const [url, setUrl] = useState('https://www.sandesh.io')
  const [query, setQuery] = useState('')
  const [resultCount, setResultCount] = useState('5')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!url.trim() || !query.trim()) {
      setError('Please enter both URL and search query')
      return
    }

    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('http://localhost:8000/api/search/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          query: query.trim(),
          count: parseInt(resultCount)
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SearchResponse = await response.json()
      
      // Sort results by score (highest score first for better matches)
      const sortedData = {
        ...data,
        results: data.results.sort((a, b) => (b.score || 0) - (a.score || 0))
      }
      
      setResults(sortedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch()
    }
  }

  const sanitizeHtml = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'strong', 'em', 'span', 'div', 'br'],
      ALLOWED_ATTR: ['class']
    })
  }

  const getScoreColor = (score: number) => {
    if (score > 0.8) return 'bg-green-100 text-green-800'
    if (score > 0.6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Website URL
              </label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Search Query
              </label>
              <div className="flex gap-2">
                <Input
                  id="query"
                  type="text"
                  placeholder="What are you looking for?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Select value={resultCount} onValueChange={setResultCount}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading || !url.trim() || !query.trim()}
                  className="px-6"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-2">Search</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search Results */}
      {results && (
        <div className="space-y-4">
          {/* Results Header */}
          <Card className="bg-slate-50 dark:bg-slate-800/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Found {results.count} results for &ldquo;{results.query}&rdquo; on {results.url}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results List */}
          {results.results.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400">
                  No results found. Try a different search query.
                </p>
              </CardContent>
            </Card>
          ) : (
            results.results
              .slice(0, parseInt(resultCount))
              .map((result, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Result Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Hash className="h-3 w-3 mr-1" />
                          {result.ordinal}
                        </Badge>
                        <Badge className={`text-xs ${getScoreColor(result.score)}`}>
                          Score: {(result.score * 100).toFixed(1)}%
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {result.tokens} tokens
                        </Badge>
                      </div>
                    </div>

                    {/* Text Preview */}
                    <div className="space-y-2">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        Text Preview
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        {result.text_preview}
                        {result.text_preview.length >= 400 && '...'}
                      </p>
                    </div>

                    {/* HTML Snippet */}
                    <div className="space-y-2">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        HTML Content
                      </h3>
                      <div 
                        className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ 
                          __html: sanitizeHtml(result.html_snippet) 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
