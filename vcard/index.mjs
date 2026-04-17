/* global localStorage, window, document, navigator */

import { WebHaptics } from './webHaptics.mjs'
import { Workbox } from './workbox-window.prod.mjs'

const haptics = new WebHaptics()
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const initializeServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('./sw.js')

    wb.addEventListener('waiting', () => {
      console.info('New service worker available. Waiting for user prompt.')
      showUpdateToast(wb)
    })

    wb.register()
      .then(r => r && console.debug('Service worker registered successfully:', r.scope))
      .catch(e => console.error('Service worker registration failed:', e))
    return
  }
  console.warn('Service worker is not supported in this browser.')
}

const showUpdateToast = (wb) => {
  let toast = document.getElementById('updateToast')
  if (!toast) {
    toast = document.createElement('div')
    toast.id = 'updateToast'
    toast.setAttribute('role', 'alert')
    toast.setAttribute('aria-live', 'polite')
    toast.innerHTML = `
      <span>A new version is available.</span>
      <button type="button" id="updateToastRefresh">Refresh</button>
      <button type="button" id="updateToastDismiss" aria-label="Dismiss">Later</button>
    `
    document.body.appendChild(toast)

    toast.querySelector('#updateToastRefresh').addEventListener('click', () => {
      haptics.trigger('medium')
      toast.classList.remove('show')
      wb.addEventListener('controlling', () => window.location.reload())
      wb.messageSkipWaiting()
    })
    toast.querySelector('#updateToastDismiss').addEventListener('click', () => {
      haptics.trigger('light')
      toast.classList.remove('show')
    })
  }
  requestAnimationFrame(() => toast.classList.add('show'))
}

const initializeAnimations = () => {
  if (prefersReducedMotion) {
    document.querySelectorAll('#topActions button, #profilePhoto, #info, .action-button').forEach(el => {
      el.style.opacity = '1'
      el.style.transform = 'none'
    })
    return
  }

  const animate = (selector, delay, initialOpacity = '0', initialTransform = 'translateY(20px)') => {
    document.querySelectorAll(selector).forEach((el, index) => {
      el.style.opacity = initialOpacity
      el.style.transform = initialTransform
      setTimeout(() => {
        el.style.opacity = '1'
        el.style.transform = ''
      }, delay + index * 100)
    })
  }

  animate('#topActions button', 100, '0', 'translateY(-10px)')
  animate('#profilePhoto', 300, '0', 'scale(0.8) translateY(0)')
  animate('#info', 500)
  animate('.action-button', 700)
}

const initializeWindowControlsOverlay = () => {
  const wco = navigator.windowControlsOverlay
  if (!wco) return

  const updateTitleBarArea = () => {
    const rect = wco.getTitlebarAreaRect()
    const isVisible = wco.visible
    const rootStyle = document.documentElement.style

    if (isVisible && rect) {
      rootStyle.setProperty('--titlebar-area-x', `${rect.x}px`)
      rootStyle.setProperty('--titlebar-area-y', `${rect.y}px`)
      rootStyle.setProperty('--titlebar-area-width', `${rect.width}px`)
      rootStyle.setProperty('--titlebar-area-height', `${rect.height}px`)
      rootStyle.setProperty('--safe-area-top', `${rect.height}px`)
      rootStyle.setProperty('--content-top-margin', `${Math.max(rect.height + 20, 20)}px`)
      return
    }
    rootStyle.setProperty('--safe-area-top', '0px')
    rootStyle.setProperty('--content-top-margin', '20px')
  }

  updateTitleBarArea()
  wco.addEventListener('geometrychange', updateTitleBarArea)
}

const initializeTheme = () => {
  const html = document.documentElement

  const applyTheme = (theme) => {
    html.classList.add('theme-transitioning')
    html.setAttribute('data-theme', theme)
    setTimeout(() => html.classList.remove('theme-transitioning'), 500)
  }

  const setTheme = (theme) => {
    applyTheme(theme)
    localStorage.setItem('theme', theme)
  }

  applyTheme(localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    haptics.trigger('light')
    setTheme(html.getAttribute('data-theme') === 'light' ? 'dark' : 'light')
  })

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light')
  })
}

const initializeModal = () => {
  const modal = document.getElementById('modal')
  if (!modal) return () => { }

  const modalContent = modal.querySelector('.modal-content')
  let startY = 0; let isDragging = false; let ticking = false

  const preventPullToRefresh = e => modal.classList.contains('show') && e.preventDefault()

  const toggleVisibility = () => {
    if (!modal.classList.contains('show')) {
      modal.style.opacity = ''
      modal.style.transition = ''
      modal.style.visibility = 'visible'
      modal.classList.add('show')
      document.body.addEventListener('touchstart', preventPullToRefresh, { passive: false })
      document.body.addEventListener('touchmove', preventPullToRefresh, { passive: false })
      return
    }
    modal.classList.remove('show')
    document.body.removeEventListener('touchstart', preventPullToRefresh)
    document.body.removeEventListener('touchmove', preventPullToRefresh)
    setTimeout(() => {
      modal.style.visibility = 'hidden'
      modal.style.opacity = ''
      modal.style.transition = ''
      if (modalContent) {
        modalContent.style.transform = ''
        modalContent.style.transition = ''
      }
    }, 300)
  }

  const handleDragEnd = (deltaY) => {
    isDragging = false
    if (modalContent) modalContent.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    modal.style.transition = 'opacity 0.3s ease'

    if (deltaY > 120) {
      haptics.trigger('nudge')
      toggleVisibility()
      if (modalContent) modalContent.style.transform = 'translateX(-50%) translateY(100%)'
      modal.style.opacity = '0'
      return
    }
    if (modalContent) modalContent.style.transform = 'translateX(-50%) translateY(0)'
    modal.style.opacity = ''
    modal.style.transition = ''
  }

  if (modalContent) {
    modalContent.addEventListener('touchstart', e => {
      startY = e.touches[0].clientY
      isDragging = true
      modalContent.style.transition = 'none'
      modal.style.transition = 'none'
    }, { passive: true })

    modalContent.addEventListener('touchmove', e => {
      if (!isDragging) return
      const deltaY = e.touches[0].clientY - startY
      if (deltaY <= 0) return
      e.preventDefault()

      if (!ticking) {
        window.requestAnimationFrame(() => {
          modalContent.style.transform = `translateX(-50%) translateY(${deltaY}px)`
          modal.style.opacity = String(Math.max(1 - deltaY / 400, 0.2))
          ticking = false
        })
        ticking = true
      }
    }, { passive: false })

    modalContent.addEventListener('touchend', e => {
      if (isDragging) handleDragEnd(e.changedTouches[0].clientY - startY)
    })
  }

  modal.querySelector('.modal-background')?.addEventListener('click', () => {
    if (modal.classList.contains('show')) haptics.trigger('nudge')
    toggleVisibility()
  })

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      haptics.trigger('nudge')
      toggleVisibility()
    }
  })

  return toggleVisibility
}

const initializeShare = (toggleModalVisibility) => {
  const copyURLBtn = document.getElementById('copyURL')

  if (navigator.canShare) {
    document.getElementById('share')?.addEventListener('click', async () => {
      haptics.trigger('medium')
      try {
        await navigator.share({ title: 'danré', text: 'check out my contact card', url: window.location.href })
      } catch (error) {
        if (error.name !== 'AbortError') console.error('Sharing failed', error)
      }
    })
  } else {
    document.getElementById('share')?.addEventListener('click', () => {
      haptics.trigger('medium')
      toggleModalVisibility()
      const copyView = document.getElementById('copyView')
      const qrView = document.getElementById('qrView')
      if (copyView) copyView.style.display = 'flex'
      if (qrView) qrView.style.display = 'none'
    })
  }

  copyURLBtn?.addEventListener('click', async () => {
    const iconText = copyURLBtn.querySelector('span.iconColor')
    if (!iconText) return
    const originalText = iconText.innerText
    try {
      await navigator.clipboard.writeText(window.location.href)
      haptics.trigger('success')
      iconText.innerText = 'copied'
    } catch (error) {
      haptics.trigger('error')
      console.error('Copy to clipboard failed:', error)
      iconText.innerText = 'could not copy'
    } finally {
      setTimeout(() => { iconText.innerText = originalText }, 1200)
    }
  })
}

const initializeQREvent = (toggleModalVisibility) => {
  document.getElementById('showQR')?.addEventListener('click', () => {
    haptics.trigger('rigid')
    toggleModalVisibility()
    const qrView = document.getElementById('qrView')
    const copyView = document.getElementById('copyView')
    if (qrView) qrView.style.display = 'block'
    if (copyView) copyView.style.display = 'none'
  })
}

const initializeEasterEgg = () => {
  let lastTap = 0
  const profilePhoto = document.getElementById('profilePhoto')

  const triggerConfetti = async (e) => {
    e.preventDefault()
    if (prefersReducedMotion) return

    haptics.trigger([ // call haptics synchronously so iOS Safari accepts the user interaction
      { duration: 70, intensity: 1 },
      { duration: 170, intensity: 0 },
      { delay: 40, duration: 20, intensity: 1 },
      { delay: 90, duration: 100, intensity: 1 },
      { delay: 40, duration: 50 },
      { delay: 30, duration: 50, intensity: 1 },
      { delay: 10, duration: 170, intensity: 1 },
      { delay: 50, duration: 20, intensity: 1 }
    ])

    if (!window.confetti) window.confetti = (await import('./confetti.module.min.mjs')).default

    const isLowEnd = navigator.hardwareConcurrency < 4
    const multiplier = isLowEnd ? 0.5 : 1

    const fire = (particleRatio, opts) => window.confetti({ origin: { y: 0.7 }, ...opts, particleCount: Math.floor(200 * particleRatio * multiplier) })

    const burst = () => {
      fire(0.25, { spread: 26, startVelocity: 55 })
      fire(0.2, { spread: 60 })
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
      fire(0.1, { spread: 120, startVelocity: 45 })
    }

    for (let i = 0; i < (isLowEnd ? 1 : 3); i++) setTimeout(burst, i * (isLowEnd ? 200 : 100))
  }

  profilePhoto?.addEventListener('contextmenu', triggerConfetti)
  profilePhoto?.addEventListener('touchstart', e => {
    const now = Date.now()
    if (now - lastTap < 300) {
      triggerConfetti(e)
      lastTap = 0
    } else lastTap = now
  })
}

const initializeHaptics = () => document.querySelectorAll('.action-button').forEach(btn => btn.addEventListener('click', () => haptics.trigger('rigid')))

const isAlreadyInstalled = () => navigator.standalone === true || window.matchMedia('(display-mode: standalone), (display-mode: window-controls-overlay), (display-mode: fullscreen)').matches

const isIOSSafari = () => {
  const ua = navigator.userAgent
  return (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS|Chrome/.test(ua)
}

const initializeInstall = (toggleModalVisibility) => {
  const installBtn = document.getElementById('installApp')
  if (!installBtn || isAlreadyInstalled()) return

  let deferredPrompt = null

  const showInstallButton = () => {
    document.body.classList.add('install-available')
    installBtn.style.display = ''
    if (prefersReducedMotion) {
      installBtn.style.opacity = '1'
      installBtn.style.transform = 'none'
      return
    }
    setTimeout(() => {
      installBtn.style.opacity = '1'
      installBtn.style.transform = 'none'
    }, 100)
  }

  const hideInstallButton = () => {
    document.body.classList.remove('install-available')
    installBtn.style.display = 'none'
  }

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault()
    deferredPrompt = e
    showInstallButton()
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    hideInstallButton()
  })

  installBtn.addEventListener('click', async () => {
    haptics.trigger('heavy')

    if (deferredPrompt) {
      deferredPrompt.prompt()
      if ((await deferredPrompt.userChoice).outcome === 'accepted') {
        deferredPrompt = null
        hideInstallButton()
      }
      return
    }

    if (!isIOSSafari()) return
    toggleModalVisibility()
    const iosInstallView = document.getElementById('iosInstallView')
    const copyView = document.getElementById('copyView')
    const qrView = document.getElementById('qrView')
    if (iosInstallView) iosInstallView.style.display = 'flex'
    if (copyView) copyView.style.display = 'none'
    if (qrView) qrView.style.display = 'none'
  })

  if (isIOSSafari()) showInstallButton()
}

const initializeSaveContact = () => {
  document.getElementById('saveContact')?.addEventListener('click', async () => {
    haptics.trigger('medium')
    const blob = new Blob([[
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:danré',
      'TEL;TYPE=CELL:+27784585144',
      'EMAIL;TYPE=INTERNET:dev.danre@icloud.com',
      'URL;TYPE=Website:https://iamdanre.github.io/vcard/',
      'URL;TYPE=Telegram:https://t.me/xp_x_qx',
      'URL;TYPE=Instagram:https://instagram.com/_danre_',
      'URL;TYPE=X:https://x.com/xp_x_qx',
      'END:VCARD'
    ].join('\r\n')], { type: 'text/vcard' })

    let file = null
    if (typeof window !== 'undefined' && typeof window.File === 'function') {
      try {
        file = new window.File([blob], 'danre.vcf', { type: 'text/vcard' })
      } catch (error) {
        console.warn('File constructor threw unexpectedly. Falling back to download.', error)
      }
    }

    if (file && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'danré', text: 'Save contact' })
        haptics.trigger('success')
        return
      } catch (error) {
        if (error.name === 'AbortError') return
      }
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'danre.vcf'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      URL.revokeObjectURL(url)
      a.remove()
    }, 100)
    haptics.trigger('success')
  })
}

document.addEventListener('DOMContentLoaded', () => {
  initializeWindowControlsOverlay()
  initializeServiceWorker()
  initializeAnimations()
  initializeTheme()
  const toggleModalVisibility = initializeModal()
  initializeShare(toggleModalVisibility)
  initializeQREvent(toggleModalVisibility)
  initializeInstall(toggleModalVisibility)
  initializeSaveContact()
  initializeEasterEgg()
  initializeHaptics()
})
