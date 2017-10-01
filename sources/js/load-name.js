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

            console.log($nameContainer.height())
            while($nameContainer.height() > 45) {1
                $nameContainer.css('font-size', (parseInt($nameContainer.css('font-size')) - 1) + 'px');
            }

        }
        else {
            $nameContainer.css('display', 'none');
            $nameCaption.css('display', 'none');
        }
    }))