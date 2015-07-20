$('.setup-heading').on('click', function(){
	$(this).parents('.panel').find('input').prop('checked', true);
});