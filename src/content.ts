import Content from './component/Content'
import { checkPage, customEvent, removeElement } from './libs/util'
import downloadPost from './libs/download-post'
import downloadImage from './libs/download-image'

// setup assets
let lastHref = location.href
let $host: HTMLElement | null

function syncPage()
{
  if (location.href !== lastHref)
  {
    lastHref = location.href
    if ($host) $host = removeElement($host)
  }
  // check page url
  if (!checkPage())
  {
    if ($host) $host = removeElement($host)
    return
  }
  // set host element
  if ($host?.isConnected) return
  $host = Content()
  if (!$host) return
  $host.addEventListener('download-baguni', downloadPost)
  $host.addEventListener('download-image', downloadImage)
  // append to body
  const targetElement = document.body || document.documentElement
  targetElement.appendChild($host)
}

// 백그라운드와의 통신
chrome.runtime.onMessage.addListener(req => {
  if (!$host?.isConnected) return
  if (req?.type !== 'DOWNLOAD_POST_STATE') return
  customEvent($host, 'download-post-state', {
    status: req.status,
  })
})

// set observer
const observer = new MutationObserver(syncPage)
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
})
window.addEventListener('popstate', syncPage)
window.addEventListener('pageshow', syncPage)

// call sync page
syncPage()
