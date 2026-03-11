import { sleep, customEvent } from '../libs/util'
import { HOST_ID, BUTTON_ID } from '../libs/assets'
import Button from './Button'
import css from './style.css'

const downloadButton = {
  [BUTTON_ID.BAGUNI]: {
    title: '바구니 담기',
  },
  [BUTTON_ID.IMAGE]: {
    title: '이미지 다운로드',
  },
}

export default function Content(): HTMLElement
{
  let $host = null as HTMLElement | null
  let shadowRootNode: ShadowRoot | null

  // set host element
  $host = document.createElement('nav')
  $host.id = HOST_ID
  shadowRootNode = $host.attachShadow({ mode: 'open' })
  $host.addEventListener('download-post-state', onDownloadPostState)

  // set style
  const style = new CSSStyleSheet()
  style.replaceSync(css)
  shadowRootNode.adoptedStyleSheets = [ style ]

  // set body
  const $body = document.createElement('div')
  $body.classList.add('midjourney-downloader')
  shadowRootNode.appendChild($body)

  // set download button
  Object.entries(downloadButton).forEach(([ id, o ]) => {
    const $button = Button({
      id: id,
      title: o.title,
    })
    $button.addEventListener('click', () => customEvent($host, `download-${id}`))
    $body.appendChild($button)
  })

  // append to body
  const targetElement = document.body || document.documentElement
  targetElement.appendChild($host)

  return $host
}

async function onDownloadPostState(e: CustomEvent)
{
  const $host = e.target as HTMLElement
  const status = e.detail?.status
  if (!$host?.shadowRoot) return
  const $button: HTMLElement = $host.shadowRoot.querySelector('.baguni')
  if (!$button) return
  if (status === 'processing')
  {
    $button.classList.add('processing')
    $button.setAttribute('disabled', 'disabled')
  }
  switch (status)
  {
    case 'processing':
      $button.title = '처리중...'
      return
    case 'completed':
      $button.title = '완료됨'
      break
    default:
      $button.title = '실패'
      break
  }
  await sleep(800)
  if (!$host.isConnected || !$button.isConnected) return
  $button.title = downloadButton[BUTTON_ID.BAGUNI].title
  $button.classList.remove('processing')
  $button.removeAttribute('disabled')
}
