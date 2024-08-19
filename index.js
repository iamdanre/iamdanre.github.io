const width = $(window).width()
window.onscroll = function () {
  if (width >= 1000) {
    if (
      document.body.scrollTop > 80 ||
document.documentElement.scrollTop > 80
    ) {
      $('#header').css('background', '#252422')
      $('#header').css('box-shadow', '0px 0px 20px #000')
      $('#header').css('padding', '4vh 4vw')
      $('#navigation a').hover(
        function () {
          $(this).css('border-bottom', '2px solid rgb(255, 44, 90)')
        },
        function () {
          $(this).css('border-bottom', '2px solid transparent')
        }
      )
    } else {
      $('#header').css('background', 'transparent')
      $('#header').css('color', '#fff')
      $('#header').css('box-shadow', '0px 0px 0px #252422')
      $('#header').css('padding', '6vh 4vw')
      $('#navigation a').hover(
        function () {
          $(this).css('border-bottom', '2px solid #fff')
        },
        function () {
          $(this).css('border-bottom', '2px solid transparent')
        }
      )
    }
  }
}

$('#whyMe').click(function () {
  $('html, body').animate(
    {
      scrollTop: $('#skills').offset().top - 45
    },
    1000
  )
})

document.addEventListener('DOMContentLoaded', function () {
  const tds = document.querySelectorAll('.stagger_data_anim td')
  tds.forEach((td, index) => {
    td.style.animationDelay = `${0.2 * (index + 1)}s`
  })

  $('a').on('click', function (event) {
    if (this.hash !== '') {
      event.preventDefault()
      const hash = this.hash
      $('body,html').animate(
        {
          scrollTop: $(hash).offset().top
        },
        1800,
        function () {
          window.location.hash = hash
        }
      )
    }
  })

  new Plyr('#artifactVideo', {
    title: 'Artifact Demo',
    controls: ['play-large'],
    muted: true,
    clickToPlay: true,
    hideControls: true
  })

  new Plyr('#secVideo', {
    title: 'Securitree Demo',
    controls: ['play-large'],
    muted: true,
    clickToPlay: true,
    hideControls: true
  })
})
