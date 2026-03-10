import { customEvent, sleep } from './util'
import * as download from './download'
import * as assets from './assets'

let $host = null as HTMLElement | null
let downloading = false

export default async function downloadImage()
{
  if (downloading) return
  // find primary image
  const image = download.findPrimaryImage()
  if (!image) return
  try
  {
    setup(true)
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
  }
  else
  {
    $host = null
  }
}