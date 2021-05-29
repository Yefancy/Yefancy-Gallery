$.fn.scroll_register = function(){
    let dom = $(this)
    dom.before()
}

// Initialization
$(function(){
    $('[scroll-watcher]').scroll_register();
});