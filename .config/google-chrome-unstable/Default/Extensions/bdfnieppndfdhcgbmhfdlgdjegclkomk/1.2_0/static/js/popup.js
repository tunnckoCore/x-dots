(function($) {
    var loaded = function() {
        $('#entire').on('click', function() {
            var images = [],
                height,
                width,
                windowHeight,
                capture = function(scrollPosition, callback) {
                    chrome.tabs.executeScript({
                        code: 'window.scrollTo(0,' + scrollPosition + '); window.scrollY;'
                    }, function(scroll) {
                        setTimeout(function () {
                            chrome.tabs.captureVisibleTab({format: 'png'}, function(res) {
                                callback(res, scroll[0]);
                            });
                        }, 100);
                    });
                },
                position = 0;
                
            // First get the height
            chrome.tabs.executeScript({
                code: "document.body.style.webkitTransform = 'translateZ(0)'; document.body.style.overflow = 'hidden'; ([document.body.scrollHeight, window.innerHeight, document.body.scrollWidth]);"
            }, function(res) {
                height = res[0][0];
                width = res[0][2];
                windowHeight = res[0][1];
                callback = function(res, scroll) {
                    images.push({image: res, position: scroll});

                    if(position <= (height - windowHeight)) {
                        position += windowHeight;
                        capture(position, callback);
                    } else {
                        chrome.tabs.executeScript({
                            code: "document.body.style.overflow = 'visible';"
                        });
                        chrome.runtime.sendMessage({image: images, height: height, width: width}, function() {});
                    }
                };
                
                capture(position, callback);
            });
        });
        
        $('#visible').on('click', function() {
            chrome.tabs.captureVisibleTab({format: 'png'}, function(res) {
                chrome.runtime.sendMessage({image: res}, function() {});
            });
        });
        
        $('#region').on('click', function() {
            chrome.tabs.executeScript({
                'file': 'static/js/region.inject.js',
                'runAt': 'document_idle'
            });
            window.close();
        });
        
        
        // Display the latest few shares
        chrome.storage.sync.get('shares', function(res) {
            if(Array.isArray(res.shares)) {
                var ul = $('<ul />').addClass('recent');
                ul.append('<li class="title">Recently Shared</li>');
                $.each(res.shares, function() {
                    $('<li />').html('<a target="_blank" href="http://screenshot.co/#!/' + this.id + '">' + moment(this.time).fromNow() + '</a>').appendTo(ul);
                });
                ul.appendTo(document.body);
            }
        });
    };
    
    $(loaded);
})(jQuery);