/* global confetti, localStorage, window, document, navigator, confirm */

import './confetti.min.js'

import { Workbox } from './workbox-window.prod.mjs'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const initializeServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        const wb = new Workbox('./sw.js')

        wb.addEventListener('installed', (event) => {
            if (event.isUpdate) {
                console.info('New service worker available. Refresh to update.')
                if (confirm('A new version is available. Refresh to update?')) {
                    window.location.reload()
                }
            }
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
                el.style.transform = 'none'
            }, delay + index * 100)
        })
    }

    animate('#topActions button', 100, 0, 'translateY(-10px)')
    animate('#profilePhoto', 300, 0, 'scale(0.8) translateY(0)')
    animate('#info', 500)
    animate('.action-button', 700)
}

const initializeTheme = () => {
    const themeToggle = document.getElementById('themeToggle')
    const html = document.documentElement

    const setTheme = (theme) => {
        html.classList.add('theme-transitioning')
        html.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
        setTimeout(() => {
            html.classList.remove('theme-transitioning')
        }, 500)
    }

    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)

    themeToggle?.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme')
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
    })
}

const initializeModal = () => {
    const modal = document.getElementById('modal')
    if (!modal) return () => {}

    const modalContent = modal.querySelector('.modal-content')
    const modalBackground = modal.querySelector('.modal-background')

    let startY = 0
    let isDragging = false

    const preventPullToRefresh = (e) => {
        if (modal.classList.contains('show')) e.preventDefault()
    }

    const toggleVisibility = () => {
        const isHidden = !modal.classList.contains('show')
        if (isHidden) {
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
            if (navigator.vibrate) navigator.vibrate(50)
            toggleVisibility()
            if (modalContent) modalContent.style.transform = 'translateX(-50%) translateY(100%)'
            modal.style.opacity = '0'
            return
        }
        if (modalContent) modalContent.style.transform = 'translateX(-50%) translateY(0)'
        modal.style.opacity = '1'
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
                if (deltaY <= 0) {
                    return
                }
                e.preventDefault()
                modalContent.style.transform = `translateX(-50%) translateY(${deltaY}px)`
                modal.style.opacity = String(Math.max(1 - deltaY / 400, 0.2))
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
            iconText.innerText = 'copied'
        } catch (error) {
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
        toggleModalVisibility()
        if (qrView) qrView.style.display = 'block'
        if (copyView) copyView.style.display = 'none'
    })
}

const initializeEasterEgg = () => {
    let lastTap = 0
    const profilePhoto = document.getElementById('profilePhoto')

    const triggerConfetti = (event) => {
        event.preventDefault()
        if (prefersReducedMotion || !window.confetti) return

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

document.addEventListener('DOMContentLoaded', () => {
    initializeServiceWorker()
    initializeAnimations()
    initializeTheme()
    const toggleModalVisibility = initializeModal()
    initializeShare(toggleModalVisibility)
    initializeQREvent(toggleModalVisibility)
    initializeEasterEgg()
})
