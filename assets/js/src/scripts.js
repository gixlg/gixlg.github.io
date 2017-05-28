// Add lightbox class to all image links
$("a[href$='.jpg'],a[href$='.jpeg'],a[href$='.JPG'],a[href$='.png'],a[href$='.gif']").addClass("image-popup");

// FitVids options
$(function() {
  $(".content").fitVids();
});

function setLeftImage(){
  var slidersImg = [
    '../images/slider-images/01.jpg',
    '../images/slider-images/04.png',
    '../images/slider-images/05.png',
    '../images/slider-images/06.png',
    '../images/slider-images/08.png',
    '../images/slider-images/09.png',
    '../images/slider-images/10.png',
    '../images/slider-images/11.png',
    '../images/slider-images/12.png',
    '../images/slider-images/13.png',
    '../images/slider-images/14.png',
    '../images/slider-images/15.png'
  ];
  var randomIndex = Math.floor(Math.random() * slidersImg.length);
  $('.block-left').css('background-image', 'linear-gradient(rgba(44, 45, 51, 0.4), rgba(44, 45, 51, 0.4)), url(' + slidersImg[randomIndex] + ')');
}

// All others
$(document).ready(function() {
  setLeftImage();

	$('.image-popup').magnificPopup({
    type: 'image',
    tLoading: 'Loading image #%curr%...',
    gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0,1] // Will preload 0 - before current, and 1 after the current image
    },
    image: {
      tError: '<a href="%url%">Image #%curr%</a> could not be loaded.',
    },
    removalDelay: 300, // Delay in milliseconds before popup is removed
    // Class that is added to body when popup is open.
    // make it unique to apply your CSS animations just to this exact popup
    mainClass: 'mfp-fade'
  });
});
