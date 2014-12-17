$.fn.zRS('extend', {

	name : 'transition',
	handle : 'slide',

	extend : function(core) {

		var transition = this;

		transition.setUp = function() {

			core['elem']['slides'].wrapAll('<div class="carousel" />');

			core['elem']['carousel'] = core['self'].find('.carousel');
			core['elem']['carousel'].css({

				'width' : (100 * core.ins['publicF'].slideCount()) + '%',
				'float' : 'left',
				'position' : 'relative'

			});
			
			core['elem']['slides'].css({

				'float' : 'left',
				'width' : ((100 / core.ins['publicF'].slideCount()) / core['options'].visibleSlides) + '%',
				'position' : 'relative',
				'display' : 'block'

			});

		}

		transition.forward = function(difference) {

			difference = (!difference ? core['options'].slideBy : difference);

			var callback = function() {

				core['elem']['carousel'].css({

					'left' : '0%'

				});

				for(var i = 0; i < difference; i++) {

					core['elem']['slides'].eq(i).appendTo(core['elem']['carousel']);

				}

			}

			if(core['elem']['carousel'].is(':animated')) return;

			core['elem']['carousel'].animate({

				'left' : '-' + ((100 * difference) / core['options'].visibleSlides) + '%'

			}, core['options'].speed, callback);			

			core.objs['transition'].update(difference);

		}

		transition.back = function(difference) {

			difference = (!difference ? -Math.abs(core['options'].slideBy) : difference);
			
			if(core['elem']['carousel'].is(':animated')) return;

			for(var i = 0; i > difference; i--) {

				core.ins['publicF'].reIndex();
				core['elem']['slides'].eq(core.ins['publicF'].slideCount() -1).prependTo(core['elem']['carousel']);

			}
			
			core['elem']['carousel'].css({

				'left' : (100 * difference) / core['options'].visibleSlides + '%'

			});

			core['elem']['carousel'].animate({

				'left' : '0%'

			}, core['options'].speed);			

			core.objs['transition'].update(difference);

		}

	}

});

$.fn.zRS('extend', {

	name : 'transition',
	handle : 'sam',

	extend : function(core) {

		var transition = this;

		transition.setUp = function() {

			console.log('Sam');

		}

		transition.forward = function(difference) {

			console.log('Sam forward');

		}

		transition.back = function(difference) {

			console.log('Sam back');

		}

	}

});