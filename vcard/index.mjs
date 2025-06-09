import './confetti.min.js'

document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    initializeAnimations()

    const modal = document.getElementById('modal')
    const copyView = document.getElementById('copyView')
    const copyURLBtn = document.getElementById('copyURL')
    const qrView = document.getElementById('qrView')
    const shareBtn = document.getElementById('share')
    const showQRBtn = document.getElementById('showQR')

    let startY = 0
    let currentY = 0
    let isDragging = false

    function initializeAnimations() {
        if (prefersReducedMotion) {
            const allElements = document.querySelectorAll('#topActions button, #profilePhoto, #info, .action-button')
            allElements.forEach(element => {
                element.style.opacity = '1'
                element.style.transform = 'none'
            })

            return
        }

        const topActionButtons = document.querySelectorAll('#topActions button')
        topActionButtons.forEach((button, index) => {
            setTimeout(() => {
                button.style.opacity = '1'
                button.style.transform = 'translateY(0)'
            }, 100 + (index * 100))
        })

        const profilePhoto = document.getElementById('profilePhoto')
        if (profilePhoto) {
            setTimeout(() => {
                profilePhoto.style.opacity = '1'
                profilePhoto.style.transform = 'scale(1) translateY(0)'
            }, 300)
        }

        const info = document.getElementById('info')
        if (info) {
            setTimeout(() => {
                info.style.opacity = '1'
                info.style.transform = 'translateY(0)'
            }, 500)
        }

        const actionButtons = document.querySelectorAll('.action-button')
        actionButtons.forEach((button, index) => {
            setTimeout(() => {
                button.style.opacity = '1'
                button.style.transform = 'translateY(0)'
            }, 700 + (index * 100))
        })
    }

    const toggleVisibility = (element) => {
        if (!element) {
            console.error('Modal element not found')
            return
        }

        const isHidden = !element.classList.contains('show')

        if (isHidden) {
            element.style.visibility = 'visible'
            element.classList.remove('hide')
            element.classList.add('show')
            return
        }
        element.classList.remove('show')
        element.classList.add('hide')
        setTimeout(() => {
            element.style.visibility = 'hidden'
            const modalContent = element.querySelector('.modal-content')
            element.style.opacity = ''
            if (modalContent) {
                modalContent.style.transform = ''
                modalContent.style.transition = ''
            }
        }, 400)
    }

    const modalContent = modal.querySelector('.modal-content')

    function dismissSwipedModal() {
        if (navigator.vibrate) {
            navigator.vibrate(50)
        }
        modal.classList.remove('show')
        modal.classList.add('hide')
        modalContent.style.transform = 'translateX(-50%) translateY(100%)'
        modal.style.opacity = '0'
        setTimeout(() => {
            modal.style.visibility = 'hidden'
            modal.classList.remove('hide')
            // Reset for next time
            modal.style.opacity = ''
            modal.style.transition = ''
            modalContent.style.transform = ''
            modalContent.style.transition = ''
        }, 400)
    }

    if (modalContent) {
        modalContent.addEventListener('touchstart', (e) => {
            if (prefersReducedMotion) return

            startY = e.touches[0].clientY
            currentY = startY
            isDragging = true
            modalContent.style.transition = 'none'
            modal.style.transition = 'none'
        }, { passive: true })

        modalContent.addEventListener('touchmove', (e) => {
            if (!isDragging) return

            currentY = e.touches[0].clientY
            const deltaY = currentY - startY

            if (deltaY <= 0) {
                return
            }
            e.preventDefault()

            modalContent.style.transform = `translateX(-50%) translateY(${Math.min(deltaY, window.innerHeight)}px)`
            const opacity = Math.max(1 - (deltaY / 400), 0.2)
            modal.style.opacity = opacity.toString()
        }, { passive: false })

        modalContent.addEventListener('touchend', () => {
            if (!isDragging) return

            isDragging = false
            modalContent.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            modal.style.transition = 'opacity 0.3s ease'

            const deltaY = currentY - startY
            const dismissThreshold = 120

            if (deltaY > dismissThreshold) {
                dismissSwipedModal()
            } else {
                modalContent.style.transform = 'translateX(-50%) translateY(0)'
                modal.style.opacity = '1'
            }
        })

        let isMouseDragging = false
        let mouseStartY = 0
        let mouseCurrentY = 0

        modalContent.addEventListener('mousedown', (e) => {
            if (prefersReducedMotion) return

            mouseStartY = e.clientY
            mouseCurrentY = mouseStartY
            isMouseDragging = true
            modalContent.style.transition = 'none'
            modal.style.transition = 'none'
            modalContent.style.cursor = 'grabbing'

            document.body.style.userSelect = 'none'
            document.body.style.webkitUserSelect = 'none'

            e.preventDefault()
        })

        document.addEventListener('mousemove', (e) => {
            if (!isMouseDragging) return

            mouseCurrentY = e.clientY
            const deltaY = mouseCurrentY - mouseStartY

            if (deltaY <= 0) return

            modalContent.style.transform = `translateX(-50%) translateY(${Math.min(deltaY, window.innerHeight)}px)`
            const opacity = Math.max(1 - (deltaY / 400), 0.2)
            modal.style.opacity = opacity.toString()
        })

        document.addEventListener('mouseup', () => {
            if (!isMouseDragging) return

            isMouseDragging = false
            modalContent.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            modal.style.transition = 'opacity 0.3s ease'
            modalContent.style.cursor = ''

            document.body.style.userSelect = ''
            document.body.style.webkitUserSelect = ''

            const deltaY = mouseCurrentY - mouseStartY
            const dismissThreshold = 120

            if (deltaY > dismissThreshold) {
                dismissSwipedModal()
            } else {
                modalContent.style.transform = 'translateX(-50%) translateY(0)'
                modal.style.opacity = '1'
            }
        })
    }

    const modalBackground = modal.querySelector('.modal-background')
    if (modalBackground) {
        modalBackground.addEventListener('click', () => {
            toggleVisibility(modal)
        })
    }

    const hideElement = (element) => {
        element.style.display = 'none'
    }

    const showElementFlex = (element) => {
        element.style.display = 'flex'
    }

    const showElementBlock = (element) => {
        element.style.display = 'block'
    }

    if (navigator.canShare) {
        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                try {
                    await navigator.share({
                        title: 'danré',
                        text: 'check out my contact card',
                        url: window.location.href
                    })
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error('Sharing failed', error)
                    }
                }
            })
        }
    } else if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (!modal.classList.contains('show')) {
                toggleVisibility(modal)
            }
            showElementFlex(copyView)
            hideElement(qrView)
        })
    }

    if (showQRBtn) {
        showQRBtn.addEventListener('click', () => {
            if (!modal.classList.contains('show')) {
                toggleVisibility(modal)
            }
            showElementBlock(qrView)
            hideElement(copyView)
        })
    } else {
        console.error('showQR button not found')
    }

    copyURLBtn.addEventListener('click', async () => {
        const iconText = copyURLBtn.querySelector('span.iconColor')
        if (!iconText) return
        const originalText = iconText.innerText
        try {
            await navigator.clipboard.writeText(window.location.href)
            iconText.innerText = 'copied'
            setTimeout(() => {
                iconText.innerText = originalText
            }, 1200)
        } catch (error) {
            console.error('Copy to clipboard failed:', error)
            iconText.innerText = 'could not copy'
            setTimeout(() => {
                iconText.innerText = originalText
            }, 1500)
        }
    })
    // end qr modal

    // begin easter egg
    let lastTap = 0

    const triggerConfetti = (event) => {
        event.preventDefault()

        if (prefersReducedMotion || !window.confetti) {
            return
        }

        const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4
        const count = isLowEndDevice ? 1 : 3

        const defaults = {
            origin: { y: 0.7 }
        }

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(200 * particleRatio * (isLowEndDevice ? 0.5 : 1))
            }))
        }

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                fire(0.25, {
                    spread: 26,
                    startVelocity: 55
                })
                fire(0.2, {
                    spread: 60
                })
                fire(0.35, {
                    spread: 100,
                    decay: 0.91,
                    scalar: 0.8
                })
                fire(0.1, {
                    spread: 120,
                    startVelocity: 25,
                    decay: 0.92,
                    scalar: 1.2
                })
                fire(0.1, {
                    spread: 120,
                    startVelocity: 45
                })
            }, i * (isLowEndDevice ? 200 : 100))
        }
    }

    const handleDoubleTap = (event) => {
        const currentTime = Date.now()
        const tapLength = currentTime - lastTap
        if (tapLength < 300 && tapLength > 0) {
            triggerConfetti(event)
            lastTap = 0
        } else {
            lastTap = currentTime
        }
    }

    const profilePhoto = document.getElementById('profilePhoto')
    if (profilePhoto) {
        profilePhoto.addEventListener('contextmenu', triggerConfetti)
        profilePhoto.addEventListener('touchstart', handleDoubleTap)
    }
    // end easter egg

    const themeToggle = document.getElementById('themeToggle')
    const html = document.documentElement

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            toggleVisibility(modal)
        }
    })

    const setTheme = (theme) => {
        html.classList.add('theme-transitioning')

        html.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)

        setTimeout(() => {
            html.classList.remove('theme-transitioning')
        }, 500)
    }

    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme')
            const newTheme = currentTheme === 'light' ? 'dark' : 'light'
            setTheme(newTheme)
        })
    }
})
