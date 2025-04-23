import './confetti.min.js'

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal')
    const closeBtn = document.getElementById('close')
    const copyView = document.getElementById('copyView')
    const copyURLBtn = document.getElementById('copyURL')
    const qrView = document.getElementById('qrView')
    // const qr = document.getElementById('qr')
    const shareBtn = document.getElementById('share')
    const showQRBtn = document.getElementById('showQR')

    // begin qr modal
    const toggleVisibility = (element) => {
        if (element.style.top === '2rem') {
            element.style.visibility = 'visible'
            element.style.top = '0px'
            element.style.opacity = 1
            return
        }
        element.style.top = '2rem'
        element.style.opacity = 0
        setTimeout(() => {
            element.style.visibility = 'hidden'
        }, 200)
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


    /*window.addEventListener('load', () => {
        if (window.QRCode) {
            qr.innerHTML = new QRCode({
                content: window.location.href,
                container: 'svg-viewbox',
                join: true,
                ecl: 'L',
                padding: 0,
            }).svg()
        }
    })*/

    if (navigator.canShare) {
        shareBtn.addEventListener('click', async () => {
            try {
                await navigator.share({
                    title: 'danré',
                    text: 'check out my contact card',
                    url: window.location.href,
                })
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Sharing failed', error)
                }
            }
        })
    } else {
        shareBtn.addEventListener('click', () => {
            toggleVisibility(modal)
            showElementFlex(copyView)
            hideElement(qrView)
        })
    }

    showQRBtn.addEventListener('click', () => {
        toggleVisibility(modal)
        showElementBlock(qrView)
        hideElement(copyView)
    })

    closeBtn.addEventListener('click', () => toggleVisibility(modal))

    copyURLBtn.addEventListener('click', async () => {
        const iconText = copyURLBtn.querySelector('span.iconColor')
        if (!iconText) return;
        const originalText = iconText.innerText;
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
        if (window.confetti && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            confetti({
                particleCount: 100,
                startVelocity: 30,
                spread: 360,
                origin: {
                    x: Math.random(),
                    y: Math.random() - 0.2,
                },
            })
        }
    }

    const handleDoubleTap = (event) => {
        const currentTime = Date.now
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

    // begin theme toggle
    const themeToggle = document.getElementById('themeToggle')
    const moonIcon = document.getElementById('moonIcon')
    const sunIcon = document.getElementById('sunIcon')
    const html = document.documentElement

    const setTheme = (theme) => {
        html.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)

        if (moonIcon && sunIcon) {
            moonIcon.style.display = theme === 'light' ? 'block' : 'none'
            sunIcon.style.display = theme === 'light' ? 'none' : 'block'
        }
    }

    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme)


    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme')
            const newTheme = currentTheme === 'light' ? 'dark' : 'light'
            setTheme(newTheme)
        })
    }
    // end theme toggle
})