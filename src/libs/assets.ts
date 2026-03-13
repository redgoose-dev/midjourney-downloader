// midjourney.com 또는 www.midjourney.com으로 시작하는 패턴
export const DOMAIN_PATTERN = /^https:\/\/(?:www\.)?midjourney\.com$/
// midjourney.com이 포함된 패턴
export const DOMAIN_PATTERN_SIMPLE = /midjourney\.com/
// /jobs/로 시작하고 그 뒤에 슬래시가 없는 패턴
export const PAGE_PATTERN = /^\/jobs\/[^/]+\/?$/

// 호스트 엘리먼트 id
export const HOST_ID = 'mj_downloader_host'

// 컨텍스트 메뉴에서 가져오는 메뉴의 텍스트
export const CONTEXT_MENU_ITEM_LABEL = 'Save Image'

// 다운로드 서브 디렉토리 이름
export const DOWNLOAD_DIRECTORY = '[JOBS] MJ-IMAGES'

// 버튼 아이디
export const BUTTON_ID = {
  BAGUNI: 'baguni',
  IMAGE: 'image',
}
