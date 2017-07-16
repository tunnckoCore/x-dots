(function() {
    // Set default coords, dont worry about rounding
    var w = (.6 * window.innerWidth) / 2,
        h = (.6 * window.innerHeight) / 2,
        coords = {
            x1: (window.innerWidth / 2) - w,
            y1: (window.innerHeight / 2) - h,
            x2: (window.innerWidth / 2) + w,
            y2: (window.innerHeight / 2) + h,
            width: Math.round(w * 2),
            height: Math.round(h * 2)
        };
    
    var selection = $('#blank').imgAreaSelect({
        handles: true,
        x1: coords.x1, y1: coords.y1, x2: coords.x2, y2: coords.y2,
        onSelectEnd: function(img, selectedCoords) {
            coords = selectedCoords;
        },
        instance: true,
        keys: true,
        persistent: true
    });
    
    $('#tooltip').on('click', function(e) {
        $('body').empty();
        setTimeout(function() {
            chrome.runtime.sendMessage({coords: selection.getSelection()}, function() {});
            parent.postMessage('removeRegion', '*');
        }, 50);
    });
    
    $('#cancel').on('click', function() {
        parent.postMessage('removeRegion', '*');
    });
})();