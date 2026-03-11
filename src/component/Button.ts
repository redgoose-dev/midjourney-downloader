import iconImageDown from './icons/image-down.svg'
import iconLoader from './icons/loader.svg'
import iconShoppingBasket from './icons/shopping-basket.svg'

import * as assets from '../libs/assets'

export default function Button({ id, title })
{
  const $button = document.createElement('button')
  $button.title = title
  $button.classList.add(id)
  let content: string = ''
  switch (id)
  {
    case assets.BUTTON_ID.BAGUNI:
      content = iconShoppingBasket
      break
    default:
    case assets.BUTTON_ID.IMAGE:
      content = iconImageDown
      break
  }
  content += iconLoader
  $button.innerHTML = content
  return $button
}
