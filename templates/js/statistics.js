/**
 * Fetchs de order detail and appends to the page
 * ****************************
 * Please change 'json/statistics.json' 
 * with your service endpoint below
 * ****************************
 */
fetch('http://0.0.0.0:3008/contest-backend/v1/statistics')
    .then(response => response.json())
    .then(statistics => {
        let template = createStatisticsTemplate(statistics);
        $("#statistics").append(template);
    });

/**
 * Find the template tag and populate it with the data
 * @param statistics 
 */
function createStatisticsTemplate(statistics) {
    let template = $("#statistics-template")[0].innerHTML;
    return Mustache.render(template, statistics);
}
