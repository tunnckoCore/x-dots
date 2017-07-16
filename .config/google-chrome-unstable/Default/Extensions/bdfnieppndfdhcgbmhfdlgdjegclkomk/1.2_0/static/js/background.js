var screenshot = '',
    cropAndPreview = function(coords) {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d');
            
            canvas.width = coords.width;
            canvas.height = coords.height;

        var img = new Image();
        img.onload = function() {
            context.drawImage(this, coords.x1, coords.y1, coords.width, coords.height, 0, 0, coords.width, coords.height);
            
            screenshot = canvas.toDataURL('image/png');
            window.open('preview.html');
        };

        chrome.tabs.captureVisibleTab({format: 'png'}, function(res) {
            img.src = res;
        });
    },
    receiveMessage = function(data) {
        if(data && data.image) {
            if(Array.isArray(data.image)) {
                var canvas = document.createElement('canvas'),
                    context = canvas.getContext('2d'),
                    image,
                    done = 0;
                
                    canvas.width = data.width;
                    canvas.height = data.height;
                
                    
                for(var i = 0; i < data.image.length; i++) {
                    (function(i) {
                        image = new Image();
                        image.onload = function() {
                            context.drawImage(this, 0, data.image[i].position, this.width, this.height);
                            if(++done == data.image.length) {
                                screenshot = canvas.toDataURL('image/png');
                                window.open('preview.html');
                            }
                        }
                        image.src = data.image[i].image;
                    })(i);
                } 
            } else {
                screenshot = data.image;
                window.open('preview.html');
                return;
            }
        }
        
        if(data && data.coords) {
            cropAndPreview(data.coords);
        }
    };

chrome.runtime.onMessage.addListener(receiveMessage);


// Add in context menu
chrome.contextMenus.removeAll(function() {
    chrome.contextMenus.create({
        id: 'images',
        title: 'Screenshot This Image',
        contexts: ['image'],
        onclick: function(data) {
            var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d');

            var img = new Image();
            img.onload = function() {
                canvas.width = this.width;
                canvas.height = this.height;
                context.drawImage(this, 0,0, this.width, this.height);
                
                screenshot = canvas.toDataURL('image/png');
                window.open('preview.html');
            };
            img.src = data.srcUrl;
        }
    });
    
    chrome.contextMenus.create({
        id: 'visible',
        title: 'Screenshot Visible Area',
        contexts: ['page'],
        onclick: function(data) {
            chrome.tabs.captureVisibleTab({format: 'png'}, function(res) {
                screenshot = res;
                window.open('preview.html');
            });
        }
    });
    
    chrome.contextMenus.create({
        id: 'region',
        title: 'Select an Area to Screenshot',
        contexts: ['page'],
        onclick: function(data) {
            chrome.tabs.executeScript({
                'file': 'static/js/region.inject.js',
                'runAt': 'document_idle'
            });
        }
    });
});