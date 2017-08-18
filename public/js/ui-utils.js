//////////////////////// 显示或隐藏排名面板
$('#show-rank').change(function() {
  if (this.checked === true) {
    $("#rank-panel").animate({
      right: '10px',
      // opacity: '0.5',
      // height: '150px',
      // width: '150px'
    });
  } else {
    $("#rank-panel").animate({
      right: '-200px',
      // opacity: '0.5',
      // height: '150px',
      // width: '150px'
    });
  }
});

window.CM_UIUtil = {
  showSearchBar: function() {
    $('#search-bar-container').animate({
      top: 0,
    });
    $('#fab-button').animate({
      opacity: '0.0',
    });
  },
  hideSearchBar: function() {
    $('#search-bar-container').animate({
      top: '-500px',
    });
    $('#fab-button').animate({
      opacity: '1.0',
    });
  },
};