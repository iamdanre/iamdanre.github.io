/* global localStorage, window, document, navigator */

import { trigger } from './haptics.js'
import { Workbox } from './workbox-window.prod.mjs'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const initializeServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        const wb = new Workbox('./sw.js')

        wb.addEventListener('waiting', () => {
            console.info('New service worker available. Waiting for user prompt.')
            showUpdateToast(wb)
        })

        wb.register()
            .then((registration) => {
                if (registration) {
                    console.debug('Service worker registered successfully:', registration.scope)
                }
            })
            .catch((error) => {
                console.error('Service worker registration failed:', error)
            })
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
        toast.innerHTML =
            '<span>A new version is available.</span>' +
            '<button type="button" id="updateToastRefresh">Refresh</button>' +
            '<button type="button" id="updateToastDismiss" aria-label="Dismiss">Later</button>'
        document.body.appendChild(toast)

        toast.querySelector('#updateToastRefresh').addEventListener('click', () => {
            trigger('light')
            toast.classList.remove('show')

            wb.addEventListener('controlling', () => {
                window.location.reload()
            })

            wb.messageSkipWaiting()
        })
        toast.querySelector('#updateToastDismiss').addEventListener('click', () => {
            trigger('light')
            toast.classList.remove('show')
        })
    }

    requestAnimationFrame(() => {
        toast.classList.add('show')
    })
}

const initializeAnimations = () => {
    if (prefersReducedMotion) {
        document.querySelectorAll('#topActions button, #profilePhoto, #info, .action-button').forEach((el) => {
            el.style.opacity = '1'
            el.style.transform = 'none'
        })
        return
    }

    const animate = (selector, delay, initialOpacity = 0, initialTransform = 'translateY(20px)') => {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.style.opacity = String(initialOpacity)
            el.style.transform = initialTransform
            setTimeout(() => {
                el.style.opacity = '1'
                el.style.transform = ''
            }, delay + index * 100)
        })
    }

    animate('#topActions button', 100, 0, 'translateY(-10px)')
    animate('#profilePhoto', 300, 0, 'scale(0.8) translateY(0)')
    animate('#info', 500)
    animate('.action-button', 700)
}

const initializeWindowControlsOverlay = () => {
    if (!navigator.windowControlsOverlay) return

    const updateTitleBarArea = () => {
        const titleBarRect = navigator.windowControlsOverlay.getTitlebarAreaRect()
        const isVisible = navigator.windowControlsOverlay.visible

        if (isVisible && titleBarRect) {
            document.documentElement.style.setProperty('--titlebar-area-x', `${titleBarRect.x}px`)
            document.documentElement.style.setProperty('--titlebar-area-y', `${titleBarRect.y}px`)
            document.documentElement.style.setProperty('--titlebar-area-width', `${titleBarRect.width}px`)
            document.documentElement.style.setProperty('--titlebar-area-height', `${titleBarRect.height}px`)
            document.documentElement.style.setProperty('--safe-area-top', `${titleBarRect.height}px`)
            document.documentElement.style.setProperty('--content-top-margin', `${Math.max(titleBarRect.height + 20, 20)}px`)
            return
        }
        document.documentElement.style.setProperty('--safe-area-top', '0px')
        document.documentElement.style.setProperty('--content-top-margin', '20px')
    }

    updateTitleBarArea()

    navigator.windowControlsOverlay.addEventListener('geometrychange', () => {
        updateTitleBarArea()
    })
}

const initializeTheme = () => {
    const themeToggle = document.getElementById('themeToggle')
    const html = document.documentElement

    const applyTheme = (theme) => {
        html.classList.add('theme-transitioning')
        html.setAttribute('data-theme', theme)
        setTimeout(() => {
            html.classList.remove('theme-transitioning')
        }, 500)
    }

    const setTheme = (theme) => {
        applyTheme(theme)
        localStorage.setItem('theme', theme)
    }

    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    applyTheme(initialTheme)

    themeToggle?.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme')
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'
        trigger('light')
        setTheme(newTheme)
    })

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light')
    })
}

const initializeModal = () => {
    const modal = document.getElementById('modal')
    if (!modal) return () => { }

    const modalContent = modal.querySelector('.modal-content')
    const modalBackground = modal.querySelector('.modal-background')

    let startY = 0
    let isDragging = false
    let ticking = false

    const preventPullToRefresh = (e) => {
        if (modal.classList.contains('show')) e.preventDefault()
    }

    const toggleVisibility = () => {
        const isHidden = !modal.classList.contains('show')
        if (isHidden) {
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

        const dismissThreshold = 120
        if (deltaY > dismissThreshold) {
            trigger('light')
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
        modalContent.addEventListener(
            'touchstart',
            (e) => {
                startY = e.touches[0].clientY
                isDragging = true
                modalContent.style.transition = 'none'
                modal.style.transition = 'none'
            },
            { passive: true }
        )

        modalContent.addEventListener(
            'touchmove',
            (e) => {
                if (!isDragging) return
                const currentY = e.touches[0].clientY
                const deltaY = currentY - startY
                if (deltaY <= 0) return

                e.preventDefault()

                if (!ticking) { // optimize dragging via requestAnimationFrame (prevent layout thrash)
                    window.requestAnimationFrame(() => {
                        modalContent.style.transform = `translateX(-50%) translateY(${deltaY}px)`
                        modal.style.opacity = String(Math.max(1 - deltaY / 400, 0.2))
                        ticking = false
                    })
                    ticking = true
                }
            },
            { passive: false }
        )

        modalContent.addEventListener('touchend', (e) => {
            if (!isDragging) return
            const deltaY = e.changedTouches[0].clientY - startY
            handleDragEnd(deltaY)
        })
    }

    modalBackground?.addEventListener('click', toggleVisibility)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('show')) toggleVisibility()
    })

    return toggleVisibility
}

const initializeShare = (toggleModalVisibility) => {
    const shareBtn = document.getElementById('share')
    const copyView = document.getElementById('copyView')
    const qrView = document.getElementById('qrView')
    const copyURLBtn = document.getElementById('copyURL')

    const showView = (viewToShow, viewToHide) => {
        if (viewToShow) viewToShow.style.display = viewToShow === copyView ? 'flex' : 'block'
        if (viewToHide) viewToHide.style.display = 'none'
    }

    if (navigator.canShare) {
        shareBtn?.addEventListener('click', async () => {
            trigger('light')
            try {
                await navigator.share({
                    title: 'danré',
                    text: 'check out my contact card',
                    url: window.location.href,
                })
            } catch (error) {
                if (error.name !== 'AbortError') console.error('Sharing failed', error)
            }
        })
    } else {
        shareBtn?.addEventListener('click', () => {
            trigger('medium')
            toggleModalVisibility()
            showView(copyView, qrView)
        })
    }

    copyURLBtn?.addEventListener('click', async () => {
        const iconText = copyURLBtn.querySelector('span.iconColor')
        if (!iconText) return
        const originalText = iconText.innerText
        try {
            await navigator.clipboard.writeText(window.location.href)
            trigger('success')
            iconText.innerText = 'copied'
        } catch (error) {
            trigger('error')
            console.error('Copy to clipboard failed:', error)
            iconText.innerText = 'could not copy'
        } finally {
            setTimeout(() => {
                iconText.innerText = originalText
            }, 1200)
        }
    })
}

const initializeQREvent = (toggleModalVisibility) => {
    const showQRBtn = document.getElementById('showQR')
    const qrView = document.getElementById('qrView')
    const copyView = document.getElementById('copyView')

    showQRBtn?.addEventListener('click', () => {
        trigger('medium')
        toggleModalVisibility()
        if (qrView) qrView.style.display = 'block'
        if (copyView) copyView.style.display = 'none'
    })
}

const initializeEasterEgg = () => {
    let lastTap = 0
    const profilePhoto = document.getElementById('profilePhoto')

    const triggerConfetti = async (event) => {
        event.preventDefault()
        if (prefersReducedMotion) return
        trigger('heavy')

        if (!window.confetti) { // dynamic import: load confetti lib if user finds easter egg
            const { default: confetti } = await import('./confetti.module.min.mjs')
            window.confetti = confetti
        }

        const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4
        const particleMultiplier = isLowEndDevice ? 0.5 : 1

        const fire = (particleRatio, opts) => {
            window.confetti({
                origin: { y: 0.7 },
                ...opts,
                particleCount: Math.floor(200 * particleRatio * particleMultiplier),
            })
        }

        const confettiBurst = () => {
            fire(0.25, { spread: 26, startVelocity: 55 })
            fire(0.2, { spread: 60 })
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
            fire(0.1, { spread: 120, startVelocity: 45 })
        }

        for (let i = 0; i < (isLowEndDevice ? 1 : 3); i++) {
            setTimeout(confettiBurst, i * (isLowEndDevice ? 200 : 100))
        }
    }

    const handleDoubleTap = (event) => {
        const currentTime = Date.now()
        if (currentTime - lastTap < 300) {
            triggerConfetti(event)
            lastTap = 0
        } else {
            lastTap = currentTime
        }
    }

    profilePhoto?.addEventListener('contextmenu', triggerConfetti)
    profilePhoto?.addEventListener('touchstart', handleDoubleTap)
}

const initializeHaptics = () => {
    document.querySelectorAll('.action-button').forEach((btn) => {
        btn.addEventListener('click', () => trigger('light'))
    })
}

const isAlreadyInstalled = () => {
    if (navigator.standalone === true) return true
    return window.matchMedia(
        '(display-mode: standalone), (display-mode: window-controls-overlay), (display-mode: fullscreen)'
    ).matches
}

const isIOSSafari = () => {
    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS|Chrome/.test(ua)
    return isIOS && isSafari
}

const initializeInstall = (toggleModalVisibility) => {
    const installBtn = document.getElementById('installApp')
    const iosInstallView = document.getElementById('iosInstallView')
    const copyView = document.getElementById('copyView')
    const qrView = document.getElementById('qrView')
    if (!installBtn) return

    if (isAlreadyInstalled()) return

    let deferredPrompt = null

    const showInstallButton = () => {
        document.body.classList.add('install-available')
        installBtn.style.display = ''
        if (prefersReducedMotion) {
            installBtn.style.opacity = '1'
            installBtn.style.transform = 'none'
        } else {
            setTimeout(() => {
                installBtn.style.opacity = '1'
                installBtn.style.transform = 'none'
            }, 100)
        }
    }

    const hideInstallButton = () => {
        document.body.classList.remove('install-available')
        installBtn.style.display = 'none'
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        deferredPrompt = e
        showInstallButton()
    })

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null
        hideInstallButton()
    })

    installBtn.addEventListener('click', async () => {
        trigger('medium')

        if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') {
                deferredPrompt = null
                hideInstallButton()
            }
            return
        }

        if (!isIOSSafari()) return
        toggleModalVisibility()
        if (iosInstallView) iosInstallView.style.display = 'flex'
        if (copyView) copyView.style.display = 'none'
        if (qrView) qrView.style.display = 'none'
    })

    if (isIOSSafari()) showInstallButton() // on iOS Safari, show the button for the guided install flow
}

const buildVCard = () => {
    const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:danré',
        'TEL;TYPE=CELL:+27784585144',
        'EMAIL;TYPE=INTERNET:dev.danre@icloud.com',
        'URL;TYPE=Website:https://iamdanre.github.io/vcard/',
        'URL;TYPE=Telegram:https://t.me/xp_x_qx',
        'URL;TYPE=Instagram:https://instagram.com/_danre_',
        'URL;TYPE=X:https://x.com/xp_x_qx',
        'END:VCARD',
    ]
    return lines.join('\r\n')
}

const initializeSaveContact = () => {
    const saveBtn = document.getElementById('saveContact')
    if (!saveBtn) return

    saveBtn.addEventListener('click', async () => {
        trigger('medium')
        const vcfData = buildVCard()
        const blob = new Blob([vcfData], { type: 'text/vcard' })
        let file = null

        if (typeof window !== 'undefined' && typeof window.File === 'function') {
            try {
                file = new window.File([blob], 'danre.vcf', { type: 'text/vcard' })
            } catch (error) {
                console.warn('File constructor threw unexpectedly. Falling back to download.', error)
            }
        }

        if (file && navigator.canShare?.({ files: [file] })) { // try Web Share API with file
            try {
                await navigator.share({ files: [file], title: 'danré', text: 'Save contact' })
                trigger('success')
                return
            } catch (error) {
                if (error.name === 'AbortError') return
            }
        }

        // fallback: direct download
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
        trigger('success')
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
