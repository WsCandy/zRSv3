;(function() {
	
	'use strict';

	var version = '0.1',
		name = 'zRS';

	$.fn.zRS = function(settings, params) {
		
		var results = [];

		for(var i = 0; i < this.length; i++) {

			var self = $(this[i]);

			if(!self.data('ins')) {

				if(typeof settings == 'string' && console) {

					console.error('['+ name +' '+ version +'] - not running, try firing methods after initialisation'); 
					continue;

				}

				var ins = new zRS_core(self, settings);

				self.data('ins', ins);

			} else {

				var ins = self.data('ins');

				if(ins['public'][settings]) {

					if(this.length > 1) {

						results.push(ins['public'][settings](params));

					} else {

						return ins['public'][settings](params);
						
					}

				} else {

					if(console) console.warn('['+ name +' '+ version +'] - '+ settings +' is not a public method');

				}

			}

		}

		if(results.length >= 1) return results;

	}

	var zRS_core = function(self, settings) {

		var ins = this;
		
		ins.defaults = {};
		
		var options = $.extend(ins.defaults, settings), objs = {}, elem = {};

		var setUp = {

			init: function() {

				secret.defineModules();

				for(var obj in objs) {

					objs[obj].setUp();

				}

			},

			defineModules: function() {

				objs['inner'] = new innerSlider();

			}

		}

		ins.public = {


		}

		var innerSlider = function() {

			this.setUp = function() {

				elem['inner'] = self.find('.inner-slider');

				elem['inner'].css({

					'posiition' : 'relative',
					'width' : '100%',
					'overflow' : 'hidden'

				});

			}

		}

		setUp.init();

	}

})();

$(document).ready(function(){

	$('.slider').zRS();

});