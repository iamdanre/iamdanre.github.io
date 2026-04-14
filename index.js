import { trigger } from './vcard/haptics.js'

const jQuery = window.jQuery
const Plyr = window.Plyr

function handleScroll() {
  const header = document.getElementById('header')
  if (!header) return

  if (window.innerWidth > 890) {
    const scrolled = window.scrollY > 80 || document.documentElement.scrollTop > 80
    if (scrolled) {
      header.classList.add('scrolled')
    } else {
      header.classList.remove('scrolled')
    }
  } else {
    header.classList.remove('scrolled')
  }
}

let isScrolling = false
window.addEventListener('scroll', () => {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      handleScroll()
      isScrolling = false
    })
    isScrolling = true
  }
})

// kept globally for backwards compatibility or inline DOM reference
window.closemagnify = function() {
  trigger('light')
  const magnify = document.getElementById('magnify')
  if (magnify) magnify.style.display = 'none'
}

document.addEventListener('DOMContentLoaded', () => {
  // theme toggle
  const themeToggleBtn = document.getElementById('themeToggle')
  const savedTheme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  applyTheme(savedTheme)

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light')
    }
  })

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation() // prevent header click-to-top triggering
      trigger('light')
      const current = document.documentElement.getAttribute('data-theme')
      const next = current === 'light' ? 'dark' : 'light'
      applyTheme(next)
      localStorage.setItem('theme', next)
    })
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme')
    }
  }

  // header click to scroll top
  const header = document.getElementById('header')
  if (header) {
    header.addEventListener('click', (e) => {
      if (e.target.closest('#themeToggle')) return
      trigger('light')
      jQuery('html, body').animate({ scrollTop: 0 }, 1000)
    })
  }

  // action buttons
  const whyMeBtn = document.getElementById('whyMe')
  if (whyMeBtn) {
    whyMeBtn.addEventListener('click', () => {
      trigger('medium')
      jQuery('html, body').animate(
        {
          scrollTop: jQuery('#skills').offset().top - 45,
        },
        1000
      )
    })
  }

  const vcardButton = document.getElementById('vcardButton')
  if (vcardButton) {
    vcardButton.addEventListener('click', () => {
      trigger('medium')
      location.href = 'vcard/'
    })
  }

  document.querySelectorAll('.social').forEach(el => {
    el.addEventListener('click', () => trigger('light'))
  })

  const contactForm = document.querySelector('#contact form')
  if (contactForm) {
    contactForm.addEventListener('submit', () => trigger('success'))
  }

  const tds = document.querySelectorAll('.stagger_data_anim td')
  tds.forEach((td, index) => {
    td.style.animationDelay = `${0.2 * (index + 1)}s`
  })

  jQuery('a').on('click', function (event) {
    if (this.hash === '') return

    trigger('light')
    event.preventDefault()
    const hash = this.hash
    jQuery('body,html').animate(
      {
        scrollTop: jQuery(hash).offset().top,
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
    hideControls: true,
  }).on('ready', () => {
    console.debug('plyr ready')
  })

  changeFavicon()
})

let imageCounter = 0
const favicons = ['img/favicons/favicon_1.ico', 'img/favicons/favicon_2.ico', 'img/favicons/favicon_3.ico', 'img/favicons/favicon_4.ico']
const changeFavicon = () => {
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

// register service worker for PWA offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/vcard/sw.js').then(
      (registration) => {
        console.debug('ServiceWorker registration successful with scope: ', registration.scope)
      },
      (err) => {
        console.error('ServiceWorker registration failed: ', err)
      }
    )
  })
}
