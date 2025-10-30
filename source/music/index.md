---
title: 音乐馆
type: music
comments: false
aside: false
aplayer: true
top_img: false
pjax: false
---

<!-- Fix: 保持主题原配色，覆盖 hexo-anzhiyu-music 的全局样式，不让导航和背景变灰 -->
<style>
  /* 还原站点背景与遮罩 */
  body:has(#anMusic-page) {
    background-color: inherit !important;
  }
  body:has(#anMusic-page) #web_bg {
    display: block !important;
  }
  body:has(#anMusic-page) #an_music_bg {
    display: none !important;
    filter: none !important;
  }

  /* 还原导航栏样式与文字颜色 */
  .page:has(#anMusic-page) #nav {
    backdrop-filter: unset !important;
    background: unset !important;
    border-bottom: unset !important;
    box-shadow: unset !important;
  }
  .page:has(#anMusic-page) #page-header.not-top-img #nav a,
  .page:has(#anMusic-page) #page-header #nav .back-home-button {
    color: inherit !important;
  }

  /* 显示页脚（插件样式会隐藏） */
  body:has(#anMusic-page) #footer {
    display: block !important;
  }
</style>

<meting-js
  server="netease"
  type="playlist"
  id="8662123215"
  fixed="false"
  autoplay="false"
  order="list"
  list-folded="false"
  lrc-type="1">
</meting-js>
