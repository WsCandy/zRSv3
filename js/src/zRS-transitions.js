$.fn.zRS('extend', {

	name : 'transition',
	handle : 'slide',

	extend : function(core) {

		var transition = this;

		transition.setUp = function() {

			console.warn('test');

		}

		transition.forward = function() {

			if(core.elem['slides'].is(':animated')) return;

			console.warn('forward');

		}

		transition.back = function() {

			if(core.elem['slides'].is(':animated')) return;

			console.warn('back');

		}

	}

});