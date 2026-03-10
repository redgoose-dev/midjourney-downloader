
export default function Button({ id, title, label })
{
  const $button = document.createElement('button')
  $button.title = title
  $button.classList.add(id)
  $button.textContent = label
  return $button
}
