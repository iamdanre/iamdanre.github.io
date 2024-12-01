const jQuery = document.scripts.namedItem('jquery').ownerDocument.defaultView.jQuery
const Plyr = document.scripts.namedItem('plyr').ownerDocument.defaultView.Plyr

const width = jQuery(window).width()
globalThis.onscroll = () => {
  if (width >= 1000) {
    if (document.body.scrollTop > 80 ||
      document.documentElement.scrollTop > 80) {
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
}

jQuery('#whyMe').click(() => {
  jQuery('html, body').animate(
    {
      scrollTop: jQuery('#skills').offset().top - 45
    },
    1000
  )
})

document.addEventListener('DOMContentLoaded', () => {
  // const Plyr = require('plyr')
  const tds = document.querySelectorAll('.stagger_data_anim td')
  tds.forEach((td, index) => {
    td.style.animationDelay = `${0.2 * (index + 1)}s`
  })

  jQuery('a').on('click', function (event) {
    if (this.hash !== '') {
      event.preventDefault()
      const hash = this.hash
      jQuery('body,html').animate(
        {
          scrollTop: jQuery(hash).offset().top
        },
        1800,
        function () {
          globalThis.location.hash = hash
        }
      )
    }
  })

  /*
  new Plyr('#artifactVideo', {
    title: 'Artifact Demo',
    controls: ['play-large'],
    muted: true,
    clickToPlay: true,
    hideControls: false
  }).on('ready', () => {
    console.log('Artifact ready')
    // const observer = new window.IntersectionObserver((entries) => {
    //     entries.forEach(entry => {
    //       if (entry.isIntersecting) {
    //         player.play()
    //         player.elements.container.querySelector('.plyr__control').style.display = 'none'
    //       } else {
    //         player.pause()
    //         player.elements.container.querySelector('.plyr__control').style.display = 'block'
    //       }
    //     })
    //   }, { threshold: 0.5 })
    //   observer.observe(player.elements.container)
  })
*/

  new Plyr('#secVideo', {
    title: 'Securitree Demo',
    controls: ['play-large'],
    muted: true,
    clickToPlay: true,
    hideControls: true
  }).on('ready', function () {
    console.log('plyr ready')
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
  document.querySelector('head').insertAdjacentHTML('beforeend', '<link rel="icon" href="' + favicons[imageCounter] + '" type="image/gif">')
  if (imageCounter === favicons.length - 1) {
    imageCounter = 0
  } else {
    imageCounter++
  }
  const delay = imageCounter % 2 === 0 ? 1000 : 500
  setTimeout(changeFavicon, delay)
}
