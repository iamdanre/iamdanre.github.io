var width = $(window).width();
window.onscroll = function () {
    if (width >= 1000) {
        if (
            document.body.scrollTop > 80 ||
            document.documentElement.scrollTop > 80
        ) {
            $("#header").css("background", "#252422");
            $("#header").css("box-shadow", "0px 0px 20px #000");
            $("#header").css("padding", "4vh 4vw");
            $("#navigation a").hover(
                function () {
                    $(this).css("border-bottom", "2px solid rgb(255, 44, 90)");
                },
                function () {
                    $(this).css("border-bottom", "2px solid transparent");
                }
            );
        } else {
            $("#header").css("background", "transparent");
            $("#header").css("color", "#fff");
            $("#header").css("box-shadow", "0px 0px 0px #252422");
            $("#header").css("padding", "6vh 4vw");
            $("#navigation a").hover(
                function () {
                    $(this).css("border-bottom", "2px solid #fff");
                },
                function () {
                    $(this).css("border-bottom", "2px solid transparent");
                }
            );
        }
    }
};

$("#whyMe").click(function () {
    $("html, body").animate(
        {
            scrollTop: $("#skills").offset().top-45,
        },
        1000
    );
});

function magnify(imglink) {
    $("#img_here").css("background", `url('${imglink}') center center`);
    $("#magnify").css("display", "flex");
    $("#magnify").addClass("animated fadeIn");
    setTimeout(function () {
        $("#magnify").removeClass("animated fadeIn");
    }, 200);
}

function closemagnify() {
    $("#magnify").addClass("animated fadeOut");
    setTimeout(function () {
        $("#magnify").css("display", "none");
        $("#magnify").removeClass("animated fadeOut");
        $("#img_here").css("background", `url('') center center`);
    }, 200);
}

// setTimeout(function () {
//     $("#loading").addClass("animated fadeOut");
//     setTimeout(function () {
//         $("#loading").removeClass("animated fadeOut");
//         $("#loading").css("display", "none");
//     }, 50);
// }, 100);

$(document).ready(function () {
    const tds = document.querySelectorAll(".stagger_data_anim td");
    tds.forEach((td, index) => {
        td.style.animationDelay = `${0.2 * (index + 1)}s`;
    });

    $("a").on("click", function (event) {
        if (this.hash !== "") {
            event.preventDefault();
            var hash = this.hash;
            $("body,html").animate(
                {
                    scrollTop: $(hash).offset().top,
                },
                1800,
                function () {
                    window.location.hash = hash;
                }
            );
        }
    });
});

const artifactVideo = document.getElementById("artifactVideo");
const player = new Plyr(artifactVideo, {
    title: 'Artifact Demo',
    controls: ["play-large"],
    muted: true,
    clickToPlay: true,
    hideControls: true,
    autoplay: true,
    loop: { active: true },
});

const securitreeVideo = document.getElementById("securitreeVideo");
const player1 = new Plyr(secVideo, {
    title: 'Securitree Demo',
    controls: ["play-large"],
    muted: true,
    clickToPlay: true,
    hideControls: true,
    autoplay: true,
    loop: { active: true },
});