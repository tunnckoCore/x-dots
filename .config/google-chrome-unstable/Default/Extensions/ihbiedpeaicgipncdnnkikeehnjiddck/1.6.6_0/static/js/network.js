(function(app, didRun) {
    
    var displayName = app.name.replace(/[^a-z0-9\s]/gi, '').replace(/\s{2,}/g, ' ').replace(/\s/g, '-')
        url = 'http://64px.com/' + encodeURIComponent(displayName).toLowerCase() + '/' + app.id + '/install';
    
    if(chrome.runtime && chrome.runtime.setUninstallURL) {
        chrome.runtime.setUninstallURL('http://64px.com/' + encodeURIComponent(displayName).toLowerCase() + '/' + app.id + '/uninstall');
    }
    
    if(didRun) { return; }
    
    localStorage._networkOnce = '1';
    window.open(url);
    
})(chrome.app.getDetails(), localStorage._networkOnce);