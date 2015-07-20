$('.setup-heading').on('click', function(){
    $(this).parents('.panel').find('input').prop('checked', true);
});

$('#webhookButton').on('click', function(event){
    event.preventDefault();
    var repos = [];
    $('.alert').addClass('hide');
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
            $('.alert').removeClass('hide');
            $('input:checked').prop('checked', false);
            setTimout(function(){
                $('.alert').addClass('hide');
            },5000);
        }
    });
});