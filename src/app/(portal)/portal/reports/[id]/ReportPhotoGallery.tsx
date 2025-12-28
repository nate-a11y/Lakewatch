'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Camera, X, ChevronLeft, ChevronRight, Download, ZoomIn } from 'lucide-react'
import { toast } from 'sonner'

interface Photo {
  id?: string
  caption?: string
  url?: string
}

export default function ReportPhotoGallery({ photos }: { photos: Photo[] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const handleDownload = (photo: Photo) => {
    if (photo.url) {
      toast.success('Downloading photo...')
      // In production, this would trigger an actual download
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowRight') nextPhoto()
    if (e.key === 'ArrowLeft') prevPhoto()
  }

  if (photos.length === 0) {
    return (
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#4cbb17]" />
          Photos
        </h2>
        <div className="text-center py-8 text-[#71717a]">
          <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No photos for this inspection</p>
        </div>
      </section>
    )
  }

  const currentPhoto = photos[currentIndex]

  return (
    <>
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#4cbb17]" />
          Photos ({photos.length})
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo, idx) => (
            <button
              key={photo.id || idx}
              onClick={() => openLightbox(idx)}
              className="aspect-video bg-[#27272a] rounded-lg overflow-hidden relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4cbb17]"
            >
              {photo.url ? (
                <Image
                  src={photo.url}
                  alt={photo.caption || 'Inspection photo'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#71717a]">
                  <Camera className="w-8 h-8" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs text-white truncate">{photo.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Download button */}
          <button
            onClick={() => handleDownload(currentPhoto)}
            className="absolute top-4 right-16 p-2 text-white hover:bg-white/10 rounded-lg transition-colors z-10"
            aria-label="Download"
          >
            <Download className="w-6 h-6" />
          </button>

          {/* Previous button */}
          {photos.length > 1 && (
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Main image */}
          <div className="relative w-full max-w-5xl h-[80vh] mx-16">
            {currentPhoto?.url ? (
              <Image
                src={currentPhoto.url}
                alt={currentPhoto.caption || 'Inspection photo'}
                fill
                className="object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#71717a]">
                <Camera className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Next button */}
          {photos.length > 1 && (
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Caption and counter */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            {currentPhoto?.caption && (
              <p className="text-white font-medium mb-2">{currentPhoto.caption}</p>
            )}
            <p className="text-[#71717a] text-sm">
              {currentIndex + 1} of {photos.length}
            </p>
          </div>

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
              {photos.map((photo, index) => (
                <button
                  key={photo.id || index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-16 h-12 relative rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    index === currentIndex
                      ? 'border-[#4cbb17] scale-110'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {photo.url ? (
                    <Image
                      src={photo.url}
                      alt={photo.caption || ''}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#27272a] flex items-center justify-center">
                      <Camera className="w-4 h-4 text-[#71717a]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
