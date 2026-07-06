declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackLinkClick(title: string, type: string) {
  window.gtag?.('event', 'link_click', {
    link_title: title,
    link_type: type
  })
}
