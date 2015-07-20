$('.setup-heading').on('click', function(){
    $(this).parents('.panel').find('input').prop('checked', true);
});

$('#webhookButton').on('click', function(event){
    event.preventDefault();
    var repos = [];
    $('input:checked').each(function(){
        repos.push($(this).val());
    });
    $.ajax({
        type: 'POST',
        url: '/setup/webhooks',
        data: JSON.stringify({
            'repos': repos
        }),
        contentType: 'application/json',
        success: function(){

        }
    });
});