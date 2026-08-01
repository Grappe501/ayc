import { useEffect } from 'react'
import {
  AYC_DEFAULT_DESCRIPTION,
  AYC_DEFAULT_OG_IMAGE,
  AYC_SITE_ORIGIN,
} from '@/content/site'

type Props = {
  title: string
  description: string
  /** Absolute or site-relative path; defaults to shared OG card. */
  image?: string
  /** Open Graph type — website or article. */
  type?: 'website' | 'article'
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function resolveImage(image?: string): string {
  if (!image) return AYC_DEFAULT_OG_IMAGE
  if (image.startsWith('http://') || image.startsWith('https://')) return image
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : AYC_SITE_ORIGIN
  return `${origin}${image.startsWith('/') ? image : `/${image}`}`
}

export function DocumentMeta({
  title,
  description,
  image,
  type = 'website',
}: Props) {
  useEffect(() => {
    document.title = title

    const desc = description || AYC_DEFAULT_DESCRIPTION
    const ogImage = resolveImage(image)
    const pageUrl =
      typeof window !== 'undefined' ? window.location.href : AYC_SITE_ORIGIN

    upsertMeta('name', 'description', desc)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:url', pageUrl)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:site_name', 'Arkansas Youth Coalition')
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', desc)
    upsertMeta('name', 'twitter:image', ogImage)
  }, [title, description, image, type])

  return null
}
