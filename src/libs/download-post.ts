import { customEvent, sleep } from './util'
import * as download from './download'
import * as assets from './assets'

let $host = null as HTMLElement | null
let downloading = false

export default async function downloadPost()
{
  if (downloading) return
  // find primary image
  const image = download.findPrimaryImage()
  if (!image) return
  try
  {
    setup(true)
    // 프롬프트 텍스트 가져오기
    const prompt = getPromptText()
    // 레퍼런스 이미지 가져오기
    const refs = getReferenceImages()
    // URL 주소 가져오기
    const url = getUrlPath()
    // 유저 데아터 가져오기
    const user = getUserData()
    // 서비스워커에게 다운로드 리다이렉트 준비하라고 메시지 보내기
    await chrome.runtime.sendMessage({
      type: 'PREPARE_DOWNLOAD_REDIRECT',
      meta: { url, prompt, user, refs },
    })
    // 컨텍스트 메뉴열기
    const pos = download.openContextMenu(image)
    await sleep(320)
    // 컨텍스트 메뉴에서 'Save Image' 메뉴 클릭하기
    const $button = download.selectContextMenuItem(pos)
    $button.click()
  }
  catch (e)
  {
    alert('이미지 다운로드에 실패했습니다.')
    console.error(`ERROR) ${e}`)
  }
  finally
  {
    setup(false)
  }
}

function setup(sw: boolean)
{
  downloading = sw
  if (sw)
  {
    $host = document.getElementById(assets.HOST_ID)
    customEvent($host, 'download-post-state', { status: 'processing' })
  }
  else
  {
    $host = null
  }
}

function getPromptText()
{
  const $wrap = document.getElementById('lightboxPrompt')
  const $el = $wrap.querySelector('[class*="group/promptText"] p')
  const $opts = $wrap.querySelector('[class*="group/promptText"]').parentElement
  const $optButtons = $opts.querySelectorAll('button')
  const opts = [...$optButtons].map($button => {
    const $spans = $button.querySelectorAll('span')
    if (!$spans.length) return false
    const $span = [...$spans].find($span => /^--/.test($span.innerText))
    return $span?.innerText || false
  }).filter(Boolean).join(' ')
  let result = ($el as any)?.innerText || ''
  if (result && opts) result += ' ' + opts
  return result
}
function getUrlPath()
{
  const url = new URL(location.href)
  url.searchParams.delete('index')
  return url.toString()
}
function getUserData()
{
  const $wrap = document.getElementById('lightboxPrompt').parentElement
  const $link = $wrap.querySelector('a')
  if (!$link) return null
  return {
    url: $link.href,
    name: $link.innerText,
  }
}
function getReferenceImages()
{
  const $wrap = document.getElementById('lightboxPrompt')
  const $opts = $wrap.querySelector('[class*="group/promptText"]').parentElement
  const $optImages = $opts.querySelectorAll('img')
  return [...$optImages].map(($img, idx) => {
    const $parent = $img.parentElement
    if ($parent.tagName?.toLowerCase() !== 'button') return false
    if (!($parent.title && $img.alt)) return false
    return {
      key: $parent.title,
      value: $img.alt,
    }
  }).filter(Boolean)
}
