let progressSvg = null
$(document).ready(function () {
    progressSvg = d3.select('#progress')
})
function showProgress() {
    let progress_bar = d3.select(progressSvg.selectAll('rect').nodes()[1])
    let progress_dots = progressSvg.selectAll('circle')
        .call(d3.drag()
            .on('start', function(e){
            })
            .on('drag', function(e){
                if (e.y < 720 && e.y > 0) {
                    progress_dots.attr('cy', e.y)
                    progress_bar.attr('height', e.y)
                }
            })
            .on('end', function(e){
            }));
    progressSvg.attr("display", null)
        .attr('opacity', 0)
        .transition().duration(1500)
        .attr('opacity', 1)
}