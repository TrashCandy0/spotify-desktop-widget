$(function() {

  $('.wrap').addClass('loaded');

  $('.range').bind('change mousemove', function() {
    change(this);
  });
  $('.range').change(function() {
    change(this);
  });
  function change(obj) {
    var val = $(obj).val();
    var buf = $(obj).attr("buff");
    $(obj).css(
      'background',
      'linear-gradient(to right, #cc181e 0%, #cc181e ' + val + '%, #777 ' + val + '%, #777 ' + buf + '%, #444 ' + buf + '%, #444 100%)'
    );
  }

  var timeout;
  $('.wrap').bind('focusin mouseover mousedown hover', function() {
    window.clearTimeout(timeout);
    $(this).addClass('hover');
  });
  $('.wrap').bind('focusout mouseout mouseup', function() {
    window.clearTimeout(timeout);
    timeout = setTimeout(function(){removeHoverClass();}, 1000);
  });
  function removeHoverClass() {
    if (!$('.wrap').is(":hover")) {
      $('.wrap').removeClass('hover');
    }
  }

});
