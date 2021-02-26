$(window).on("load", function () {
    "use strict";
    /*=========================================================================
        Preloader
    =========================================================================*/
    $("#preloader").delay(350).fadeOut('slow');

    /*=========================================================================
        Custom Scrollbar
    =========================================================================*/
    $(".header-inner").mCustomScrollbar();

    /*=========================================================================
     Isotope
     =========================================================================*/
    $('.portfolio-filter').on('click', 'li', function () {
        var filterValue = $(this).attr('data-filter');
        $container.isotope({
            filter: filterValue
        });
    });

    // change is-checked class on buttons
    $('.portfolio-filter').each(function (i, buttonGroup) {
        var $buttonGroup = $(buttonGroup);
        $buttonGroup.on('click', 'li', function () {
            $buttonGroup.find('.current').removeClass('current');
            $(this).addClass('current');
        });
    });

    var $container = $('.portfolio-wrapper');
    $container.imagesLoaded(function () {
        $('.portfolio-wrapper').isotope({
            // options
            itemSelector: '[class*="col-"]',
            percentPosition: true,
            masonry: {
                // use element for option
                columnWidth: '[class*="col-"]'
            }
        });
    });

    /*=========================================================================
     Infinite Scroll
     =========================================================================*/
    var curPage = 1;
    var pagesNum = $(".portfolio-pagination").find("li a:last").text(); // Number of pages

    $container.infinitescroll({
            itemSelector: '.grid-item',
            nextSelector: '.portfolio-pagination li a',
            navSelector: '.portfolio-pagination',
            extraScrollPx: 0,
            bufferPx: 0,
            maxPage: 6,
            loading: {
                finishedMsg: "No more works",
                msgText: '',
                speed: 'slow',
                selector: '.load-more',
            },
        },
        // trigger Masonry as a callback
        function (newElements) {

            var $newElems = $(newElements);
            $newElems.imagesLoaded(function () {
                $newElems.animate({
                    opacity: 1
                });
                $container.isotope('appended', $newElems);
            });

            // Check last page
            curPage++;
            if (curPage == pagesNum) {
                $('.load-more').remove();
            }

        });

    $container.infinitescroll('unbind');

    $('.load-more .btn').on('click', function () {
        $container.infinitescroll('retrieve');
        // display loading icon
        $('.load-more .btn i').css('display', 'inline-block');
        $('.load-more .btn i').addClass('fa-spin');

        $(document).ajaxStop(function () {
            setTimeout(function () {
                // hide loading icon
                $('.load-more .btn i').hide();
            }, 1000);
        });
        return false;
    });

    /* ======= Mobile Filter ======= */

    // bind filter on select change
    $('.portfolio-filter-mobile').on('change', function () {
        // get filter value from option value
        var filterValue = this.value;
        // use filterFn if matches value
        filterValue = filterFns[filterValue] || filterValue;
        $container.isotope({
            filter: filterValue
        });
    });

    var filterFns = {
        // show if number is greater than 50
        numberGreaterThan50: function () {
            var number = $(this).find('.number').text();
            return parseInt(number, 10) > 50;
        },
        // show if name ends with -ium
        ium: function () {
            var name = $(this).find('.name').text();
            return name.match(/ium$/);
        }
    };

    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            toggleSwitch.checked = true;
        }
    }

    function switchTheme(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }
    toggleSwitch.addEventListener('change', switchTheme, false);

    /*=========================================================================
     Typewriter
     =========================================================================*/

    var TxtType = function (el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.tick();
        this.isDeleting = false;
    };

    TxtType.prototype.tick = function () {
        var i = this.loopNum % this.toRotate.length;
        var fullTxt = this.toRotate[i];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

        var that = this;
        var delta = 200 - Math.random() * 100;

        if (this.isDeleting) {
            delta /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.loopNum++;
            delta = 500;
        }

        setTimeout(function () {
            that.tick();
        }, delta);
    };

    window.onload = function () {
        var elements = document.getElementsByClassName('typewrite');
        for (var i = 0; i < elements.length; i++) {
            var toRotate = elements[i].getAttribute('data-type');
            var period = elements[i].getAttribute('data-period');
            if (toRotate) {
                new TxtType(elements[i], JSON.parse(toRotate), period);
            }
        }
        // INJECT CSS
        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #fff}";
        document.body.appendChild(css);
    };

    /*=========================================================================
     Submit Contact with AWS API Gateway
	 =========================================================================*/
    let _config = {
        api: {
            invokeUrl: 'https://oreymumvah.execute-api.ap-southeast-1.amazonaws.com/prod'
        }
    }

    jQuery(document).ready(function ($) {
        let contactForm = $("#contact-form");
        contactForm.submit(function (e) {
            e.preventDefault();
            if (!grecaptcha.getResponse()) {
                Swal.fire('Warning!', 'Are you robot? Please enter captcha!', 'warning')
            } else {
                var data = {
                    name: $("#name").val(),
                    email: $("#email").val(),
                    subject: $("#subject").val(),
                    message: $("#message").val(),
                    captcha: grecaptcha.getResponse()
                }
                $.ajax({
                    url: _config.api.invokeUrl + '/contact',
                    type: 'POST',
                    crossDomain: !0,
                    dataType: 'json',
                    data: JSON.stringify(data),
                    beforeSend: function () {
                        Swal.fire({
                            title: 'Please wait',
                            showConfirmButton: !1,
                            onBeforeOpen: () => {
                                Swal.showLoading()
                            }
                        })
                    },
                    success: function (data) {
                        contactForm[0].reset();
                        grecaptcha.reset();
                        Swal.fire('Thank You!', 'I got your message', 'success')
                    },
                    error: function ajaxError(jqXHR, textStatus, errorThrown) {
                        console.error('Error requesting: ', textStatus, ', Details: ', errorThrown);
                        console.error('Response: ', jqXHR.responseText);
                        Swal.fire('Oops...', 'Something went wrong!', 'error')
                    },
                })
            }
        })
    })
});

/*=========================================================================
            Carousels
=========================================================================*/
$(document).on('ready', function () {
    "use strict";

    $('.testimonials-wrapper').slick({
        dots: true,
        arrows: false,
        slidesToShow: 2,
        slidesToScroll: 2,
        responsive: [{
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                dots: true,
                arrows: false,
            }
        }]
    });

    $('.clients-wrapper').slick({
        dots: false,
        arrows: false,
        slidesToShow: 4,
        slidesToScroll: 4,
        responsive: [{
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    dots: false,
                    arrows: false,
                }
            },
            {
                breakpoint: 425,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: false,
                    arrows: false,
                }
            }
        ]
    });

});

$(function () {
    "use strict";

    $('.menu-icon').on('click', function () {
        $('header.left').toggleClass('open');
        $('.mobile-header, main.content').toggleClass('push');
    });

    $('main.content, header.left button.close').on('click', function () {
        $('header.left').removeClass('open');
        $('.mobile-header, main.content').removeClass('push');
    });

    /*=========================================================================
     Counterup JS for facts
	 =========================================================================*/
    for (let i = 1; i <= 4; i++) {
        if ($.isNumeric($('#count' + i).html())) {
            $('#count' + i).counterUp({
                delay: 10,
                time: 2000
            });
        } else {
            $('#count' + i).removeClass("count")
            $('#count' + i).css("font-size", "28px")
        }
    }

    /*=========================================================================
     Progress bar animation with Waypoint JS
     =========================================================================*/
    if ($('.skill-item').length > 0) {
        var waypoint = new Waypoint({
            element: document.getElementsByClassName('skill-item'),
            handler: function (direction) {

                $('.progress-bar').each(function () {
                    var bar_value = $(this).attr('aria-valuenow') + '%';
                    $(this).animate({
                        width: bar_value
                    }, {
                        easing: 'linear'
                    });
                });

                this.destroy()
            },
            offset: '50%'
        });
    }

    /*=========================================================================
     One Page Scroll with jQuery
     =========================================================================*/
    $('.vertical-menu li a[href^="#"]:not([href="#"])').on('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - 50
        }, 800, 'easeInOutQuad');
        event.preventDefault();
    });

    /*=========================================================================
     Add (nav-link) class to main menu.
     =========================================================================*/
    $('.vertical-menu li a').addClass('nav-link');

    /*=========================================================================
     Bootstrap Scrollspy
     =========================================================================*/
    $("body").scrollspy({
        target: ".scrollspy",
        offset: 500
    });

    /*=========================================================================
     Background Image with Data Attribute
     =========================================================================*/
    var bg_img = document.getElementsByClassName('background');

    for (var i = 0; i < bg_img.length; i++) {
        var src = bg_img[i].getAttribute('data-image-src');
        bg_img[i].style.backgroundImage = "url('" + src + "')";
    }

    /*=========================================================================
     Spacer with Data Attribute
     =========================================================================*/
    var list = document.getElementsByClassName('spacer');

    for (var i = 0; i < list.length; i++) {
        var size = list[i].getAttribute('data-height');
        list[i].style.height = "" + size + "px";
    }

    /*=========================================================================
            Scroll to Top
    =========================================================================*/
    $(window).scroll(function () {
        if ($(this).scrollTop() >= 250) { // If page is scrolled more than 50px
            $('#return-to-top').fadeIn(200); // Fade in the arrow
        } else {
            $('#return-to-top').fadeOut(200); // Else fade out the arrow
        }
    });
    $('#return-to-top').on('click', function () { // When arrow is clicked
        $('body,html').animate({
            scrollTop: 0 // Scroll to top of body
        }, 400);
    });

});
