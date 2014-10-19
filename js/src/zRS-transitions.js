$.fn.zRS('extend', {

	name : 'test',
	extend : function(data) {

		var method = this;

		method.setUp = function() {
				
			data.objs['misc'].report('warn', 'Extended method fired!');

		}

	}

});