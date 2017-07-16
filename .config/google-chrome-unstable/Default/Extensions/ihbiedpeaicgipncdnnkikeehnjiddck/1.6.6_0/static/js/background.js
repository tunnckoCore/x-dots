require(['jquery', 'weather'], function($, weather) {
    
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    
    ga('create', 'UA-37022210-7', 'auto');
    ga('set', 'checkProtocolTask', function(){});
    ga('require', 'displayfeatures');
    ga('send', 'pageview', 'background.html');
    
    chrome.browserAction.setBadgeBackgroundColor({color: '#2B3A62'});
    window.update = function() {
        chrome.storage.local.get('weather', function(res) {
            if(res && res.weather && res.weather.current_observation && (new Date).getTime() - res.weather.timestamp < 600000) {
                var temp = (localStorage._units == 'c') ? res.weather.current_observation.temp_c : res.weather.current_observation.temp_f;
                chrome.browserAction.setBadgeText({text: Math.round(temp) + "°"});
            } else {
                weather.temp(function(res) {
                    if(res && !res.error) {
                        var temp = (localStorage._units == 'c') ? res.current_observation.temp_c : res.current_observation.temp_f;
                        chrome.browserAction.setBadgeText({text: Math.round(temp) + "°"});
                    }
                });
            }
        });
    };
    chrome.alarms.onAlarm.addListener(function() {
        update();
    });
    chrome.alarms.clear('update');
    chrome.alarms.create('update', {periodInMinutes: 45});
    update();
});