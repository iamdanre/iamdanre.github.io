import { PageProps } from "$fresh/server.ts";
import "../index.css";
import jQuery from 'https://cdn.jsdelivr.net/npm/jquery@3.7.1/+esm';
import Plyr from 'https://cdn.jsdelivr.net/npm/plyr@3.7.8/+esm';

export default function Home(props: PageProps) {
	return (
		<div>
				<div id="magnify">
					<h1 onclick="closemagnify()"><i class="fas fa-times"></i></h1>
					<div id="img_here"></div>
				</div>
				<header
					id="header"
					class="animate__animated animate__slideInDown"
					onclick="$('html, body').animate({scrollTop: 0},1000);"
				>
					<table>
						<tr>
							<td id="logo"><span class="blink_me">❯_</span> danré</td>
						</tr>
					</table>
				</header>
				<table id="top_part">
					<tr>
						<td id="about" class="animate__animated animate__slideInLeft">
							<h1 id="text">
								software developer.<br />full stack web.<br />UX/UI, design.
							</h1>
							<button class="btn_one" id="whyMe">why me?</button>
							<br />
							<table>
								<tr class="stagger_data_anim">
									<td class="animate__animated animate__zoomIn">
										<a
											class="social"
											aria-label="github"
											href="https://github.com/iamdanre"
											target="_blank"
										><i class="fab fa-github"></i></a>
									</td>
									<td class="animate__animated animate__zoomIn">
										<a
											class="social"
											aria-label="spotify"
											href="https://open.spotify.com/user/ob7mvyi83kza9lw510kipb786?si=Z31DBcGBRyWuYXXsWrIQeg"
											target="_blank"
										><i class="fab fa-spotify"></i></a>
									</td>
									<td class="animate__animated animate__zoomIn">
										<a
											class="social"
											aria-label="instagram"
											href="https://www.instagram.com/_danre_/"
											target="_blank"
										><i class="fab fa-instagram"></i></a>
									</td>
									<td class="animate__animated animate__zoomIn">
										<a
											class="social"
											aria-label="telegram"
											href="https://t.me/xp_x_qx/"
											target="_blank"
										><i class="fab fa-telegram-plane"></i></a>
									</td>
									<td class="animate__animated animate__zoomIn">
										<a
											class="social"
											aria-label="tumblr"
											href="https://iamdanre.tumblr.com/"
											target="_blank"
										><i class="fab fa-tumblr"></i></a>
									</td>
								</tr>
							</table>
						</td>
						<td id="rightImage" class="animate__animated animate__bounceInRight">
						</td>
					</tr>
				</table>

				<div id="skills">
					<h1>skills</h1>
					<div class="skill-grid">
						<div class="skill-grid-cell">
							<h2>front:</h2>
							<li>HTML5</li>
							<li>CSS/Sass</li>
							<li>Javascript</li>
							<li>Typescript</li>
							<li>Angular</li>
							<li>Vue</li>
							<li>Ionic</li>
						</div>
						<div class="skill-grid-cell">
							<h2>back:</h2>
							<li>C++</li>
							<li>C#</li>
							<li>Java</li>
							<li>Node</li>
							<li>Python</li>
							<li>PHP</li>
							<li>MongoDB</li>
							<li>MySQL</li>
							<li>PostgreSQL</li>
							<li>Neo4j</li>
						</div>
						<div class="skill-grid-cell">
							<h2>other:</h2>
							<li>Photoshop</li>
							<li>GIMP</li>
							<li>MS Office</li>
							<li>Git</li>
						</div>
					</div>
				</div>

				<div id="work">
					<h1>work</h1>
					<br />
					<div id="artifact">
						<h2>ArtiFact</h2>
						<div id="videos">
							<video autoplay loop muted playsinline>
								<source src="img/artifact/mac.mov" type="video/mp4;codecs=hvc1" />
								<source src="img/artifact/mac.webm" type="video/webm" />
							</video>
							<video autoplay loop muted playsinline>
								<source src="img/artifact/iPad.mov " type="video/mp4;codecs=hvc1" />
								<source src="img/artifact/iPad.webm" type="video/webm" />
							</video>
							<video autoplay loop muted playsinline>
								<source
									src="img/artifact/iPhone.mov"
									type="video/mp4;codecs=hvc1"
								/>
								<source src="img/artifact/iPhone.webm" type="video/webm" />
							</video>
						</div>
						<video id="artifactVideo" width="100%" autoplay loop muted playsinline>
							<source src="img/artifact/artifactdemo.mp4" type="video/mp4" />
						</video>

						<p>
							ArtiFact is a third-year software engineering project by team 5Bits
							from the University of Pretoria for our client EPI-USE.<br />
							The system uses artificial intelligence to analyse bodies of text and
							determine the likelihood of it being fake news.
							<br />
							<a href="https://taydos.github.io/">Thato</a> and I were in charge of
							the front-end. Using Angular, Firebase, Typescript and modern web
							technologies, we developed a Progressive Web App which makes it
							platform-agnostic, and a handy Chrome extension lets you check your
							news on the fly.<br />
							Check it out on
							<a
								href="https://github.com/COS301-SE-2020/AI-Online-Assistant-Fake-News-Detector"
								aria-label="artifact github"
								target="_blank"
							>Github</a>!
						</p>
					</div>
					<br />
					<div id="AngelAcademy">
						<h2>Angel Academy Daycare</h2>
						<lite-youtube videoid="KQMULsrBfc4"></lite-youtube>
						<p>
							A community project developed for a pre-primary school in Mamelodi,
							Pretoria.
						</p>
					</div>
					<br />

					<div id="Lessor">
						<h2>Lessor</h2>
						<img
							loading="lazy"
							width="100%"
							src="img/lessor/lessor.png"
							alt="lessor"
						/>
						<p>
							Airbnb clone written in PHP. Project I did for a multimedia course.
							Code's on
							<a
								href="https://github.com/iamdanre/lessor"
								target="_blank"
								aria-label="lessor github"
							>Github</a>.
						</p>
					</div>

					<br />
					<div id="HapticHands">
						<h2>Haptic Hands</h2>
						<div class="haptic">
							<img
								loading="lazy"
								width="100%"
								src="img/hapticHands/hapticPoster.webp"
								alt="hapticHands"
							/>
						</div>
						<p>
							Website for my twin sister's Kinderkinetics practice. Check it out
							<a
								href="https://haptichands.net/"
								aria-label="hapticHands website"
								target="_blank"
							>here</a>.
						</p>
					</div>

					<br />
					<div id="Securitree">
						<h2>SecuriTree</h2>
						<div class="sec">
							<video id="secVideo" width="100%" loop muted playsinline>
								<source src="img/securitree/st.mp4" type="video/mp4" />
							</video>
						</div>
						<p>
							Recruiting exercise I did for a job interview. Built using MongoDB
							Atlas, Mongoose, Node.js and Angular.js <br />
							<br />
							<a
								href="https://github.com/iamdanre/SecuriTree"
								target="_blank"
								aria-label="securitree github"
							>Link to the repository.</a>
						</p>
						<p>
							Also did a presentation on one of my favourite topics, operating
							systems: check it out
							<a
								href="img/OS/index.html"
								target="_blank"
								aria-label="os presentation"
							>
								here
							</a>
							and come back when you're done.
						</p>
					</div>

					<br />
					<div id="clientLink">
						<h2>clientLink</h2>
						<div class="clientLink">
							<lite-youtube videoid="FZKj_LVBsMo"></lite-youtube>
						</div>
						<p>
							Demo app built using Vue and MongoDB. Code's on
							<a
								href="https://github.com/iamdanre/clientLink"
								target="_blank"
								aria-label="clientLink github"
							>Github</a>.
						</p>
					</div>
				</div>

				<div id="bio">
					<h1>about</h1>
					<p>Hi, I'm danré.</p>
					Developer of software and designer of user experiences. I have formal
					education in computer science, informatics and multimedia and knack for
					creative problem solving.
					<p></p>
				</div>
				<div id="contact">
					<h1>contact</h1>
					<table>
						<tr>
							<td>
								<div id="inner_div">
									<table id="inner_table">
										<tr>
											<td>
												<img src="img/qr.webp" alt="qr code" class="qr" />
												<br />
												<a
													onclick="location.href='vcard'"
													id="vcardButton"
													aria-label="contact card"
												>contact card</a>
											</td>
										</tr>
									</table>
								</div>
							</td>
							<td>
								<form
									action="https://airform.io/dev.danre@icloud.com"
									method="POST"
								>
									<input name="name" type="text" placeholder="name" />
									<input name="email" type="email" placeholder="email" required />
									<br />
									<textarea
										name="message"
										placeholder="your message"
										rows="4"
										required
									></textarea>
									<br />
									<button class="btn_one" type="submit">
										send <i class="fas fa-paper-plane"></i>
									</button>
								</form>
							</td>
						</tr>
					</table>
				</div>
				<div id="footer">
					made on earth by a human <br />
					<a href="https://github.com/iamdanre" target="_blank">iamdanre</a>
				</div>
		</div>
	);
}

const width = jQuery(window).width();
globalThis.onscroll = () => {
  if (width >= 1000) {
    if (document.body.scrollTop > 80 ||
      document.documentElement.scrollTop > 80) {
        jQuery('#header').css('background', '#252422');
        jQuery('#header').css('box-shadow', '0px 0px 20px #000');
        jQuery('#header').css('padding', '4vh 4vw');
      jQuery('#navigation a').hover(
        function () {
            jQuery(this).css('border-bottom', '2px solid rgb(255, 44, 90)');
          },
          function () {
            jQuery(this).css('border-bottom', '2px solid transparent');
        }
      )
    } else {
        jQuery('#header').css('background', 'transparent');
        jQuery('#header').css('color', '#fff');
        jQuery('#header').css('box-shadow', '0px 0px 0px #252422');
        jQuery('#header').css('padding', '6vh 4vw');
      jQuery('#navigation a').hover(
        function () {
            jQuery(this).css('border-bottom', '2px solid #fff');
          },
          function () {
            jQuery(this).css('border-bottom', '2px solid transparent');
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
const favicons = ['favicon.ico', 'img/favicons/favicon_2.ico', 'img/favicons/favicon_3.ico', 'img/favicons/favicon_4.ico']
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