import { dispatchMouseEvent } from './util'
import * as assets from './assets'

export function findPrimaryImage(): HTMLImageElement | null
{
  const candidates = Array.from(document.images).filter(img => {
    if (!checkVisibleElement(img)) return false
    if (img.naturalWidth < 300 || img.naturalHeight < 300) return false
    const src = img.currentSrc || img.src || ''
    return src.startsWith('http')
  })
  if (!candidates.length) return null
  candidates.sort((a, b) => scoreImage(b) - scoreImage(a))
  return candidates[0]
}
function checkVisibleElement(el: HTMLElement)
{
  if (!isVisible(el)) return false
  const rect = el.getBoundingClientRect()
  return rect.width >= 150 && rect.height >= 150
}
function isVisible(el: HTMLElement)
{
  if (!(el instanceof Element)) return false
  const style = window.getComputedStyle(el)
  const rect = el.getBoundingClientRect()
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    rect.width > 0 &&
    rect.height > 0
  )
}

export function openContextMenu($target: HTMLElement, pos?: any)
{
  pos = pos || { x: 0, y: 0 }
  const rect = $target.getBoundingClientRect()
  const positionOffset = Math.floor(Math.random() * (50 - 10 + 1)) + 10
  const clientX = Math.round(rect.left + Math.min(rect.width / 2, positionOffset))
  const clientY = Math.round(rect.top + Math.min(rect.height / 2, positionOffset))
  const $evt = document.elementFromPoint(clientX, clientY) || $target
  dispatchMouseEvent($evt, 'pointerdown', { clientX, clientY, button: 2, buttons: 2 })
  dispatchMouseEvent($evt, 'mousedown', { clientX, clientY, button: 2, buttons: 2 })
  dispatchMouseEvent($evt, 'contextmenu', { clientX, clientY, button: 2, buttons: 2 })
  dispatchMouseEvent($evt, 'mouseup', { clientX, clientY, button: 2, buttons: 0 })
  dispatchMouseEvent($evt, 'pointerup', { clientX, clientY, button: 2, buttons: 0 })
  return {
    x: clientX,
    y: clientY,
  }
}
export function selectContextMenuItem(pos)
{
  let $context = document.elementFromPoint(pos.x, pos.y)
  if (!$context) throw new Error('Context menu not found')
  const $keyword = Array.from($context.querySelectorAll('span')).find(el => el.innerText?.includes(assets.CONTEXT_MENU_ITEM_LABEL))
  if (!$keyword) throw new Error('Context menu item not found')
  const $button = $keyword.closest('button')
  if (!$button) throw new Error('Context menu button not found')
  return $button
}

export function scoreImage(img: HTMLImageElement)
{
  const rect = img.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const distance = Math.hypot(window.innerWidth / 2 - centerX, window.innerHeight / 2 - centerY)
  const area = rect.width * rect.height
  const visibilityBonus = rect.top >= -80 && rect.bottom <= window.innerHeight + 80 ? 60000 : 0
  return area + visibilityBonus - distance * 180
}
