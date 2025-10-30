// Restore Butterfly theme colors on music page by overriding hexo-anzhiyu-music CSS
(function(){
  try {
    var css = [
      'body:has(#anMusic-page){background-color:inherit!important}',
      'body:has(#anMusic-page) #web_bg{display:block!important}',
      'body:has(#anMusic-page) #an_music_bg{display:none!important;filter:none!important}',
      '.page:has(#anMusic-page) #nav{backdrop-filter:unset!important;background:unset!important;border-bottom:unset!important;box-shadow:unset!important}',
      '.page:has(#anMusic-page) #page-header.not-top-img #nav a,.page:has(#anMusic-page) #page-header #nav .back-home-button{color:inherit!important}',
      'body:has(#anMusic-page) #footer{display:block!important}'
    ].join('\n');
    var s = document.createElement('style');
    s.setAttribute('data-music-override', 'true');
    s.textContent = css;
    document.addEventListener('DOMContentLoaded', function(){
      document.head.appendChild(s);
    });
  } catch(e) {
    console && console.warn && console.warn('music-override failed:', e);
  }
})();
