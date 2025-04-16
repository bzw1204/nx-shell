import { session } from 'electron'

session.defaultSession.webRequest.onHeadersReceived({ urls: ['*://*/*'] }, (details, callback) => {
  // 允许跨域
  details.responseHeaders!['Access-Control-Allow-Origin'] = ['*']
  callback({ cancel: false, responseHeaders: details.responseHeaders })
})
