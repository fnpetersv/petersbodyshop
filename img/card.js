$(".card").on("mouseover", function() {
    let $this = $(this);
    setTimeout(function() {
      $this.find(".mask").css({left:"initial",right:0});
    }, 300);
  }).finish();
  
  $(".card").on("mouseleave", function() {
    let $this = $(this);
    setTimeout(function() {
      $this.find(".mask").css({right:"initial",left:0});
    }, 300).finish();
  });
  