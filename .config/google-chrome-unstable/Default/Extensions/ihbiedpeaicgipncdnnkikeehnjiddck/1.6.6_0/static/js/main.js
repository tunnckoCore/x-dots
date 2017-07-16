define(['jquery', 'weather'], function($, weather) {
    // If they are offline, let em know
    if(!navigator.onLine) {
        $('#offline').show();
        return;
    }
    
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    
    ga('create', 'UA-37022210-7', 'auto');
    ga('set', 'checkProtocolTask', function(){});
    ga('require', 'displayfeatures');
    ga('send', 'pageview', 'popup.html');
    
    
    // Otherwise show a loading indicator
    $('#loading').show();
    
/*
    setTimeout(function() {
        $('<iframe id="banner" src="http://update.64px.com/weather" frameborder="0"></iframe>').appendTo(document.body);
    },1);
*/
    
    weather.forecast(function(res) {
        if(res && res.response && res.response.error) {
            
            return $('#loading').text('There was a problem loading your forecast, please try again later');    
        }
        
        if(res.response.error && res.response.error.type == 'querynotfound') {
            $('#loading').text('This location has no current weather data, please update your location in options.');
            return;
        }
        $('#loading').fadeOut('fast', function() {
            // Show the main weather area
            $('#online').fadeIn('fast');
        });
        
        
        // Add the current conditions
        var temp = (localStorage._units == 'c') ? res.current_observation.temp_c : res.current_observation.temp_f;
        $('#conditions').append('<div class="temp">' + Math.round(temp) + '&deg;</div>')
                        .append('<div class="details">' + res.current_observation.weather + '</div>')
                        .on('click', function() {
                            window.open(res.current_observation.forecast_url + '?apiref=40c64ece8843c98f');
                        });
        
        
        
        // Add the hourly info
        var hourly = res.hourly_forecast.slice(0, 8);
        $.each(hourly, function(i) {
            var unit = (localStorage._units == 'c') ? 'metric' : 'english';
            var html = '<div class="icon">' + weather.getIcon(this.icon) + '</div>';
                if(this.FCTTIME.hour == 0) { this.FCTTIME.hour = 12; }
                html += '<div class="date">' + (this.FCTTIME.hour > 12 ? this.FCTTIME.hour - 12 : this.FCTTIME.hour) + this.FCTTIME.ampm + "</div>";
                
                html += '<div class="temp"><span class="high">' + this.temp[unit] + '&deg; </span></div>';
                
            $('<li />').html(html).appendTo('#hourly').data('weather', this);
        });
        
        // Add the forecast icons
        $.each(res.forecast.simpleforecast.forecastday, function() {
            var unit = (localStorage._units == 'c') ? 'celsius' : 'fahrenheit';
            var html = '<div class="icon">' + weather.getIcon(this.icon) + '</div>';
                html += '<div class="date">' + this.date.weekday_short + "</div>";
                html += '<div class="temp"><span class="low">' + this.low[unit] + '&deg; </span> / <span class="high">' + this.high[unit] + "&deg;</span></div>";
                
            $('<li />').html(html).appendTo('#weather').data('weather', this);
        });
        
        
        var tooltip = $('<div />').addClass('tooltip').appendTo('body').hide();
        $('#weather li, #hourly li').hover(function() {
            var target = $(this),
                conditions = target.data('weather'),
                offset = target.offset(),
                html = '<div class="section">' + (conditions.conditions || conditions.condition);
                html += '<br /><span style="opacity: 0.5">' + conditions.pop + '% chance of rain</span></div>';
            
            if(offset.left -1 < 0) {
                tooltip.empty().html(html).stop().show().css({left: offset.left - 1, top: offset.top - tooltip.outerHeight()});
            } else if(offset.left + 100 > $('body').width()) {
                tooltip.empty().html(html).stop().show().css({left: offset.left - 101 + target.outerWidth(), top: offset.top - tooltip.outerHeight()});
            } else {
                tooltip.empty().html(html).stop().show().css({left: offset.left - 1 - 50 + target.outerWidth() / 2, top: offset.top - tooltip.outerHeight()});
            }
        }, function() {
            tooltip.hide();
        });
        
        // Show the location
        $('#location').text(res.current_observation.display_location.full);
        
        // Add the location / more link
        $('#location,#weather li, #hourly li').on('click', function() {
            window.open(res.current_observation.forecast_url + '?apiref=40c64ece8843c98f');
        });
    });
});