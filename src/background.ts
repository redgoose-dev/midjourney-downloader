import * as assets from './libs/assets'

const REDIRECT_TTL_MS = 10_000
const META_DOWNLOAD_TTL_MS = 10_000
let pendingRedirect: { expiresAt: number, meta: Record<string, any>, tabId: number | null } | null = null
let pendingMetaDownload: { expiresAt: number, filename: string } | null = null
let activeDownload: {
  tabId: number | null
  imageId: number | null
  metaId: number | null
  imageDone: boolean
  metaDone: boolean
} | null = null

chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req?.type === 'PREPARE_DOWNLOAD_REDIRECT')
  {
    pendingRedirect = {
      expiresAt: Date.now() + REDIRECT_TTL_MS,
      meta: req.meta,
      tabId: sender.tab?.id ?? null,
    }
  }
})

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  if (shouldHandleMetaDownload(item))
  {
    if (activeDownload) activeDownload.metaId = item.id

    const filename = pendingMetaDownload?.filename
    pendingMetaDownload = null
    if (filename)
    {
      suggest({
        filename,
        conflictAction: 'uniquify'
      })
      return
    }
  }
  if (!shouldRedirectDownload(item))
  {
    suggest()
    return
  }
  const filename = buildRedirectedFilename(item)
  const meta = pendingRedirect?.meta || null

  activeDownload = {
    tabId: pendingRedirect?.tabId ?? null,
    imageId: item.id,
    metaId: null,
    imageDone: false,
    metaDone: !meta,
  }

  pendingRedirect = null

  suggest({
    filename,
    conflictAction: 'uniquify'
  })

  if (meta) void downloadMeta(meta, filename)
})

chrome.downloads.onChanged.addListener(delta => {
  if (!activeDownload || typeof delta.id !== 'number') return

  const currentState = delta.state?.current
  if (!currentState) return

  if (delta.id === activeDownload.imageId)
  {
    if (currentState === 'complete') activeDownload.imageDone = true
    if (currentState === 'interrupted') void finishActiveDownload('failed')
  }

  if (delta.id === activeDownload.metaId)
  {
    if (currentState === 'complete') activeDownload.metaDone = true
    if (currentState === 'interrupted') void finishActiveDownload('failed')
  }

  if (activeDownload.imageDone && activeDownload.metaDone)
  {
    void finishActiveDownload('completed')
  }
})

function shouldHandleMetaDownload(item: any)
{
  if (!pendingMetaDownload) return false
  if (pendingMetaDownload.expiresAt < Date.now())
  {
    pendingMetaDownload = null
    return false
  }

  return item.byExtensionId === chrome.runtime.id
}

function shouldRedirectDownload(item: any)
{
  if (!pendingRedirect) return false
  if (pendingRedirect.expiresAt < Date.now())
  {
    pendingRedirect = null
    return false
  }
  const sources = [
    item.finalUrl,
    item.url,
    item.referrer,
  ].filter(Boolean)
  return sources.some(source => assets.DOMAIN_PATTERN_SIMPLE.test(source as string))
}

function buildRedirectedFilename(file: any)
{
  const name = file.url?.split('/').pop()
  const ext = file.mime?.split('/').pop() || 'png'
  return `${assets.DOWNLOAD_DIRECTORY}/${name}.${ext}`
}

async function downloadMeta(meta: Record<string, any>, filename: string)
{
  const json = JSON.stringify(meta, null, 2)
  const url = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`
  const metaFilename = filename.replace(/\.[^.]+$/, '.json')
  pendingMetaDownload = {
    expiresAt: Date.now() + META_DOWNLOAD_TTL_MS,
    filename: metaFilename,
  }
  await chrome.downloads.download({
    url,
    saveAs: false,
    conflictAction: 'uniquify'
  })
}

async function finishActiveDownload(status: 'completed' | 'failed')
{
  if (!activeDownload) return
  const { tabId } = activeDownload
  activeDownload = null
  if (typeof tabId !== 'number') return
  try
  {
    await chrome.tabs.sendMessage(tabId, {
      type: 'DOWNLOAD_POST_STATE',
      status,
    })
  }
  catch (e)
  {
    console.warn('다운로드 상태 메시지 전송 실패', e)
  }
}

// print startup message
console.warn(`[${new Date().toLocaleString('ko-KR')}] 🚀 미드저니 다운로드 서비스 워커가 시작되었습니다.`)
