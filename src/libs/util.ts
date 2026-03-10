import * as assets from './assets'

export function sleep(ms: number)
{
  return new Promise(res => setTimeout(res, ms))
}

export function checkPage()
{
  if (!assets.DOMAIN_PATTERN.test(location.origin)) return false
  if (!assets.PAGE_PATTERN.test(location.pathname)) return false
  return true
}

export function customEvent($target: HTMLElement, name: string, detail?: any)
{
  if (!$target) return null
  const event = new CustomEvent(name, { detail })
  $target.dispatchEvent(event)
  return event
}

export function dispatchMouseEvent($el, type, options)
{
  const eventInit = {
    bubbles: true,
    cancelable: true,
    composed: true,
    view: window,
    clientX: options.clientX,
    clientY: options.clientY,
    screenX: window.screenX + options.clientX,
    screenY: window.screenY + options.clientY,
    button: options.button,
    buttons: options.buttons,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false
  }
  if (window.PointerEvent && type.startsWith("pointer")) {
    $el.dispatchEvent(new PointerEvent(type, {
      ...eventInit,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
    }))
    return
  }
  $el.dispatchEvent(new MouseEvent(type, eventInit))
}

export function removeElement($el: HTMLElement)
{
  if (!$el) return
  $el.parentNode?.removeChild($el)
  return null
}
