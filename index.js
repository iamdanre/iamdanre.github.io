const jQuery = document.scripts.namedItem('jquery').ownerDocument.defaultView.jQuery
const Plyr = document.scripts.namedItem('plyr').ownerDocument.defaultView.Plyr

const width = jQuery(window).width()
const throttle = (func, limit) => {
  let inThrottle
  return function () {
    const args = arguments
    if (inThrottle) {
      return
    }
    func.apply(this, args)
    inThrottle = true
    setTimeout(() => (inThrottle = false), limit)
  }
}

globalThis.onscroll = throttle(() => {
  if (width >= 1000) {
    if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
      jQuery('#header').css('background', '#252422')
      jQuery('#header').css('box-shadow', '0px 0px 20px #000')
      jQuery('#header').css('padding', '4vh 4vw')
      jQuery('#navigation a').hover(
        function () {
          jQuery(this).css('border-bottom', '2px solid rgb(255, 44, 90)')
        },
        function () {
          jQuery(this).css('border-bottom', '2px solid transparent')
        }
      )
    } else {
      jQuery('#header').css('background', 'transparent')
      jQuery('#header').css('color', '#fff')
      jQuery('#header').css('box-shadow', '0px 0px 0px #252422')
      jQuery('#header').css('padding', '6vh 4vw')
      jQuery('#navigation a').hover(
        function () {
          jQuery(this).css('border-bottom', '2px solid #fff')
        },
        function () {
          jQuery(this).css('border-bottom', '2px solid transparent')
        }
      )
    }
  }
}, 100)

document.addEventListener('DOMContentLoaded', () => {
  jQuery('#whyMe').on('click', () => {
    jQuery('html, body').animate(
      {
        scrollTop: jQuery('#skills').offset().top - 45
      },
      1000
    )
  })

  jQuery('#vcardButton').on('click', () => {
    location.href = 'vcard/'
  })

  const tds = document.querySelectorAll('.stagger_data_anim td')
  tds.forEach((td, index) => {
    td.style.animationDelay = `${0.2 * (index + 1)}s`
  })

  jQuery('a').on('click', function (event) {
    if (this.hash === '') {
      return
    }
    event.preventDefault()
    const hash = this.hash
    jQuery('body,html').animate(
      {
        scrollTop: jQuery(hash).offset().top
      },
      1800,
      () => {
        globalThis.location.hash = hash
      }
    )
  })

  new Plyr('#secVideo', {
    title: 'Securitree Demo',
    controls: ['play-large'],
    muted: true,
    clickToPlay: true,
    hideControls: true
  }).on('ready', () => {
    console.debug('plyr ready for #secVideo')
  })

  new Plyr('#artifactVideo', {
    title: 'ArtiFact Demo',
    controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
    muted: true,
    clickToPlay: true
  }).on('ready', () => {
    console.debug('plyr ready for #artifactVideo')
  })

  changeFavicon()
})

let imageCounter = 0
const favicons = ['img/favicons/favicon_1.ico', 'img/favicons/favicon_2.ico', 'img/favicons/favicon_3.ico', 'img/favicons/favicon_4.ico']
function changeFavicon () {
  const currentIcon = document.querySelector("link[rel='icon']")
  if (currentIcon !== null) {
    currentIcon.remove()
  }
  document.querySelector('head').insertAdjacentHTML('beforeend', `<link rel="icon" href="${favicons[imageCounter]}" type="image/gif">`)
  if (imageCounter === favicons.length - 1) {
    imageCounter = 0
  } else {
    imageCounter++
  }
  const delay = imageCounter % 2 === 0 ? 1000 : 500
  setTimeout(changeFavicon, delay)
}
