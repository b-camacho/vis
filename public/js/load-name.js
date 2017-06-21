/**
 * Created by nopony on 17.06.17.
 */
$('document').ready(
    $.ajax('name').done(function (response) {
        var $nameContainer = $('#query-name-container')
            ,$nameCaption = $('#query-name-caption');
        if(response.available) {
            $nameContainer.text(response.name);
            $nameContainer.css('display', 'visible');
            $nameCaption.css('display', 'visible');
        }
        else {
            $nameContainer.css('display', 'none');
            $nameCaption.css('display', 'none');
        }
    }))