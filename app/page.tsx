'use client'

import { useEffect, useRef, useState } from 'react'

interface Keyword {
  id: number
  name: string
}

interface Image {
  id: number
  url: string
  keywords: Keyword[]
}

export default function Home() {
  const [images, setImages] = useState<Image[]>([])
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  const fetchImages = async (p: number, kw: string | null, reset = false) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p) })
    if (kw) params.append('keyword', kw)  // e.g., page=2&keyword=nature
    const res = await fetch(`/api/images?${params}`)
    const data: Image[] = await res.json()

    // If reset is true (e.g., changing to a new keyword), the system will discard the old image and overwrite it with the new image (data).
    // If reset is false: (e.g., scroll down to load the next page) the system will use the Spread Operator (...) to append the existing image (prev) 
    // to the newly loaded image (data), creating an ever-evolving list.
    setImages((prev) => (reset ? data : [...prev, ...data]))
    
    setHasMore(data.length === 8)
    setLoading(false)
  }

  useEffect(() => {
    fetchImages(1, keyword, true)
    setPage(1)
  }, [keyword])

  useEffect(() => {
    if (page === 1) return
    fetchImages(page, keyword)
  }, [page])

  useEffect(() => {
    const observer = new IntersectionObserver(
      // entries: This is a list of the objects we have instructed to observe (in this case, there is only one: observerRef).
      (entries) => {
        // isIntersecting: Has the object appeared on the screen yet?
        // hasMore: Is there still data available for the next page in the database? (If there's none, don't load.)
        // !loading: Is the previous load currently pending? (Prevents duplicate loading.)
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1)  // add page
        }
      },
      // The object must be 100% visible (the entire block) for the process to work. If only the edges are visible, do nothing yet.
      { threshold: 1.0 } 
    )
    // start observing
    if (observerRef.current) observer.observe(observerRef.current)
    return () => observer.disconnect()  // when we change page, instruct to stop observing
  }, [hasMore, loading])

  const allKeywords = Array.from(
    new Set(images.flatMap((img) => img.keywords.map((k) => k.name)))
  )

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Gallery</h1>

      {/* Keyword Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setKeyword(null)}
          className={`px-4 py-1 rounded-full border ${!keyword ? 'bg-black text-white' : 'bg-white text-black'}`}
        >
          All
        </button>
        {allKeywords.map((k) => (
          <button
            key={k}
            onClick={() => setKeyword(k)}
            className={`px-4 py-1 rounded-full border ${keyword === k ? 'bg-black text-white' : 'bg-white text-black'}`}
          >
            #{k}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="break-inside-avoid mb-4">
            <img src={img.url} alt={img.keywords.map((k) => k.name).join(', ')} className="w-full rounded-lg" />
            <div className="flex flex-wrap gap-1 mt-1">
              {img.keywords.map((k) => (
                <span
                  key={k.id}
                  onClick={() => setKeyword(k.name)}
                  className="text-xl text-blue-500 cursor-pointer hover:underline"
                >
                  #{k.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={observerRef} className="h-10 mt-4" />
      {loading && <p className="text-center text-gray-400">Loading...</p>}
    </main>
  )
}