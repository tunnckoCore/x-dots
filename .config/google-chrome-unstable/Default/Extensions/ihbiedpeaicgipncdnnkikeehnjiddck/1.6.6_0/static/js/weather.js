define(function() {
    var API = 'http://api.wunderground.com/api/a71f2e6769460c47/';
    
    return {
        forecast: function(fn) {
            var that = this;
            
            chrome.storage.local.get('weather', function(res) {
                if(res && res.weather && res.weather.current_observation && (new Date).getTime() - res.weather.timestamp < 600000) {
                    fn(res.weather);
                } else {
                    
                    if(localStorage._zmw) {
                        try { ga('send', 'event', 'API', 'Call', 'zmw') } catch(e) {}
                        
                        that.api('hourly/conditions/forecast/q/zmw:' + localStorage._zmw, function(res) {
                            res.timestamp = (new Date()).getTime();
                            chrome.storage.local.set({weather: res});
                            fn(res);
                        });
                    } else {
                        try { ga('send', 'event', 'API', 'Call', 'autoip') } catch(e) {}
                        
                        that.api('hourly/conditions/forecast/q/autoip', function(res) {
                            res.timestamp = (new Date()).getTime();
                            chrome.storage.local.set({weather: res});
                            fn(res);
                        });
                    }
            
                }
            });

        },
        temp: function(fn) {
            try { ga('send', 'event', 'API', 'Call', 'temp') } catch(e) {}
            
            if(localStorage._zmw) {
                this.api('conditions/q/zmw:' + localStorage._zmw, fn);
            } else {
                this.api('conditions/q/autoip', fn);
            }
        },
        api: function(path, fn) {
            $.get(API + path + '.json', fn);
        },
        getIcon: function(icon) {
            switch(icon) {
                case 'flurries':
                case 'chanceflurries':
                case 'chancesnow':
                case 'snow':
                    return 'W'
                break;
                case 'chancerain':
                case 'rain':
                case 'chancesleet':
                    return 'R';
                break;
                case 'chanceclear':
                case 'mostlycloudy':
                case 'mostlysunny':
                case 'partlycloudy':
                case 'partlysunny':
                    //if((new Date()).getHours() > 6 && (new Date()).getHours() < 21) {
                        return 'H';
                    //} else {
                        return 'I';
                    //}
                break;
                case 'sleet':
                    return 'X';
                break;
                
                case 'chancetstorms':
                case 'tstorms':
                    return '0';
                break;
                case 'fog':
                case 'hazy':
                    return 'L';
                break;
                case 'cloudy':
                    return 'Y';
                break;
                case 'sunny':
                case 'clear':
                    //if((new Date()).getHours() > 6 && (new Date()).getHours() < 21) {
                        return 'B';
                    //} else {
                        return '2';
                    //}
                break;
                default:
                    return 'A';
                break;
            }
        }
    };
});