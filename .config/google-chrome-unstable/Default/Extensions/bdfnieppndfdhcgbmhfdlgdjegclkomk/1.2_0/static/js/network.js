(function(app, didRun) {
    if(didRun) { return; }
    localStorage._networkOnce = '1';
    
    var displayName = app.name.replace(/[^a-z0-9\s]/gi, '').replace(/\s{2,}/g, ' ').replace(/\s/g, '-')
        url = 'http://64px.com/' + encodeURIComponent(displayName).toLowerCase() + '/' + app.id + '/install';
    
    window.open(url);
})(chrome.app.getDetails(), localStorage._networkOnce);