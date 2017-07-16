$(function() {
    var ext = chrome.extension.getBackgroundPage();

    if(ext.screenshot) {
        $('<img />').attr({'src': ext.screenshot, 'id': 'blur'}).appendTo(document.body);
        
        var canvas = $('<canvas />').attr('id', 'screenshot'),
            context = canvas[0].getContext('2d'),
            img = new Image(),
            stored = false,
            getMerged = function() {
                // Create the merged image
                var mergeCanvas = document.createElement('canvas'),
                    mergeContext = mergeCanvas.getContext('2d');
                    
                    mergeCanvas.width = canvas[0].width;
                    mergeCanvas.height = canvas[0].height;
                    
                    mergeContext.drawImage(img, 0, 0);
                    mergeContext.drawImage(canvas[0], 0, 0);
                
                return mergeCanvas.toDataURL();
            }
            
        img.onload = function() {
            if(this.width < window.innerWidth - 100) {
                $(canvas).css({marginTop: 100});
            }
            canvas.attr({width: this.width, height: this.height}).css({backgroundImage: "url(" + ext.screenshot + ")"});
            canvas.appendTo(document.body);
            canvas.sketch();
        }
        img.src = ext.screenshot;
        
        var policyCache,
            upload = function(res) {
                    id = res.id,
                        fd = new FormData();
                        
                        fd.append('key', id);
                        fd.append('acl', "public-read");
                        fd.append('content-type', "image/png");
                        fd.append('AWSAccessKeyId', res.key);
                        fd.append('policy', res.policy);
                        fd.append('signature', res.signature);
                        fd.append('file', dataToBlob(getMerged()));
                    
                    $('body').addClass('uploading');
                    
                    var showProgress = function(e) {
                        $('#progress_bar').css('width', Math.round(100 * (e.loaded / e.total)) + '%');
                    }
                    
                    $.ajax({
                        type: 'POST',
                        url: 'http://s3.amazonaws.com/upload.screenshot.co',
                        data: fd,
                        processData: false,
                        contentType: false,
                        xhr: function() {
                            var myXhr = $.ajaxSettings.xhr();
                            if(myXhr.upload){
                                myXhr.upload.addEventListener('progress',showProgress, false);
                            }
                            
                            return myXhr;
                        }
                    }).done(function(data) {
                        $('body').removeClass('uploading');
                        
                        // Store the last few shares
                        if(stored == false) {
                            chrome.storage.sync.get('shares', function(res) {
                                if(Array.isArray(res.shares)) {
                                    res.shares.unshift({id: id, time: (new Date()).getTime()});
                                    res.shares = res.shares.slice(0,3);
                                } else {
                                    res.shares = [{id: id, time: (new Date()).getTime()}];
                                }
                                chrome.storage.sync.set({shares: res.shares});
                            });
                            stored = true;
                        }
                        
                        // On purpose lag to not flash the status bar
                        setTimeout(function() {
                            $('#loading').hide();
                            $('#progress_bar').css('width', '0%');
                            window.open('http://screenshot.co/' + id);
                            
                        }, 300);
                        
                    });
            };
        
        $('#upload').on('click', function() {
            $('#loading').fadeIn('fast');
            
            
            if(policyCache) {
                upload(policyCache);
                return;
            }
            
            $.get('http://s3policy.64px.com', function(res) {
                policyCache = res;
                upload(res);
                
            }, 'json').error(function() {
                $('#loading').hide();
                $('#progress_bar').css('width', '0%');
            });
        });
        
    }
    
    $('#reset').on('click', function() {
        canvas[0].width = canvas[0].width;
        canvas.sketch('actions',[]);
    });
    
    $('#download').on('click', function() {
        window.open(getMerged());
    });
    
    $('#cancel').on('click', function() {
        window.close();
    });
    
    $('#marker').on('click', function() {
        $('#marker_settings').toggle();
    });
    
    // Copy to clipboard
    var $copy = $('#copy').on('click', function() {
        chrome.permissions.request({
            permissions: ['clipboardWrite']
        }, function(granted) {
            if(granted) {
                $copy.text('Copied!');
                setTimeout(function() {
                    $copy.text('Copy');
                }, 1500);
                window.getSelection().empty();
                
                var sel = window.getSelection(),
                    img = new Image();
                    
                img.onload = function() {
                    this.contentEditable = true;
                    var r = document.createRange();
                    document.body.appendChild(this);
                    r.selectNode(this);
                    sel.addRange(r);
                    document.execCommand('copy');
                    this.contentEditable = false;
                    document.body.removeChild(this);
                }
                img.src = getMerged();
            }
        });
  
    });
    
});


// Utility stuff

// Convert data to blob
function dataToBlob(e){
    var n;if(e.split(",")[0].indexOf("base64")>=0){n=atob(e.split(",")[1])}else{n=unescape(e.split(",")[1])}var r=e.split(",")[0].split(":")[1].split(";")[0];var i=new ArrayBuffer(n.length);var s=new Uint8Array(i);for(var o=0;o<n.length;o++){s[o]=n.charCodeAt(o)}var u=window.WebKitBlobBuilder||window.MozBlobBuilder;var a=new Blob([i],{type:r});
    return a;
}