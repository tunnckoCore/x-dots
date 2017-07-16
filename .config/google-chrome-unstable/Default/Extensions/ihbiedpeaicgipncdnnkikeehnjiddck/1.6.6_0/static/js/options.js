$(function() {
    
    $('#units').val(localStorage._units || $('#units').val()).on('change', function() {
        localStorage._units = $(this).val();
        chrome.extension.getBackgroundPage().update();
    });
    
    var data = false;
    
    if(localStorage._zmw && localStorage._typeaheadDisplayName) {
        $('#location').val(localStorage._typeaheadDisplayName);
        data = {zmw: localStorage._zmw};
    }
    
    var results = $('<div />').addClass('results').hide().appendTo(document.body).on('click', '.result', function() {
        data = $(this).data();
        location.val(data.name);
        results.empty().hide();
    });
    
    $('#save').on('click', function() {
        if(data) {
            localStorage._zmw = data.zmw;
            localStorage._typeaheadDisplayName = data.name;
            $(this).text('Saved!');
            chrome.storage.local.remove('weather');
            setTimeout(function() {
                $('#save').text('Save Location');
            }, 1000);
        }
    });
    
    $('#clear').on('click', function() {
        data = false;
        localStorage.removeItem('_zmw');
        localStorage.removeItem('_typeaheadDisplayName');
        chrome.storage.local.remove('weather');
        location.val('');
    });
    
    var location = $('#location').on('keyup', function() {
        $.get('http://autocomplete.wunderground.com/aq?query=' + encodeURIComponent($(this).val()), function(res) {
            results.empty();
            $.each(res.RESULTS, function() {
                $('<div class="result">' + this.name + '</div>').data(this).appendTo(results);
            });
            results.css({top: location.offset().top + location.outerHeight(), left: location.offset().left}).show();
        }, 'json');
    })
});