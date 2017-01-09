$(document).ready(function(){

	$('.slider').zRS3({

		transition : 'slide',
		textFade : false,
		fluidHeight : false,
		direction : 'forward',
		speed : 300,
		delay: 6000,
		decimal: 1e3,
		slideBy: 1,
		slideSpacing: 0,
		pager: null,
		visibleSlides: 1,
		alignment: null,
		setVisibleSlides: null,
		draggable: true,
		delayedLoad: false,
		trans_callback: null,
		pre_trans_callback: null,
		background: false

	});

});