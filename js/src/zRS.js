;(function() {

	'use strict';

	var version = '0.1',
		name = 'zRS',
		customObjs = {};

	$.fn.zRS = function(settings, params) {
		
		if(!this[0] && settings == 'extend') {

			customObjs[params.name] = params.extend;
			return;

		}
		
		var results = [];

		for(var i = 0; i < this.length; i++) {

			var self = $(this[i]);

			if(!self.data('ins')) {

				if(typeof settings == 'string' && console) {

					console.error('['+ name +' '+ version +'] - not running, try firing methods after initialisation'); 
					continue;

				}

				for(var customObj in customObjs) {

					zRS_core.prototype[customObj] = customObjs[customObj];
					
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

					if(console) {
					
						console.error('['+ name +' '+ version +'] - "'+ settings +'" is not a public method here\'s a nice list:');
						return ins['public'];

					}

				}

			}

		}

		if(results.length >= 1) return results;

	}

	var zRS_core = function(self, settings) {

		var ins = this;		
			ins.defaults = {

				transition : 'fade',
				direction : 'forward',
				speed : 1500,
				delay: 6000,
				slideBy: 1,
				pager: $('.pager')

			};
		
		var options = $.extend(ins.defaults, settings), objs = {}, elem = {};

		var setUp = {

			init: function() {

				setUp.defineModules();

				for(var obj in objs) {

					if(!objs[obj].setUp) continue;

					try {

						objs[obj].setUp();
						
					} catch(error) {

						objs['misc'].report('group', error['message'] + ', tracer below...');
						console.info(error['stack'].split('\n')[1]);
						console.groupEnd();

					}

				}

			},

			defineModules: function() {

				objs['misc'] = new misc();
				objs['inner'] = new innerSlider();
				objs['slides'] = new slides();
				objs['transition'] = new transition();
				objs['controls'] = new controls();
				objs['pager'] = new pager();

				for(var customObj in customObjs) {

					objs[customObj] = new customObjs[customObj]({

						self: self,
						ins: ins,
						objs: objs,
						elem: elem,
						options: options

					});

				}				

			}

		}

		ins.public = {

			slideCount : function() {

				return objs['slides'].count();

			},

			pause : function() {

				objs['controls'].pause();

			},

			play : function(direction) {

				direction = (!direction ? options.direction : direction);

				objs['controls'].pause();
				objs['controls'].play(direction);

			},

			next : function() {

				objs['transition'][options.transition]('forward');

			},

			prev: function() {

				objs['transition'][options.transition]('back');

			}

		}

		var misc = function() {

			var method = this;

			method.report = function(type, message) {

				if(console)	console[type]('['+ name +' '+ version +'] - ' + message);

			}

		}

		var innerSlider = function() {

			var method = this;

			method.setUp = function() {

				elem['inner'] = self.find('.inner-slider');

				elem['inner'].css({

					'posiition' : 'relative',
					'width' : '100%',
					'overflow' : 'hidden'

				});

			}

		}

		var slides = function() {

			var method = this;

			method.setUp = function() {

				elem['slides'] = elem['inner'].children();
				elem['slides'].addClass('zRS--slide');

			}

			method.count = function() {

				objs['slides'].reIndex();

				return elem['slides'].length;

			}

			method.reIndex = function() {

				elem['slides'] = self.find('.zRS--slide');				

			}

		}

		var transition = function() {

			var transition = this;

			transition.setUp = function() {

				objs['transition'][options.transition]('setUp');

			}

			transition.fade = function(action) {

				var method = this;

				method.setUp = function() {

					elem['slides'].eq(0).show();

					elem['slides'].css({

						'top' : '0px',
						'left' : '0px',
						'float' : 'left',
						'width' : '100%'

					});

					for(var i = 0; i < objs['slides'].count(); i++) {

						if(i == 0) {

							elem['slides'].eq(i).css({

								'position' : 'relative',
								'z-index' : '1'

							});

						} else {

							elem['slides'].eq(i).css({

								'position' : 'absolute',
								'z-index' : '0'

							}).hide();

						}

					}

				}

				method.forward = function(difference) {

					difference = (!difference ? options.slideBy : difference);

					elem['slides'].eq(difference).css({

						'z-index' : '2'

					}).fadeIn(options.speed, function() {
					
						elem['slides'].eq(difference).css({

							'position' : 'relative'

						});
						
						for(var i = 0; i < difference; i++) {

							elem['slides'].eq(0).css({

								'z-index' : '1',
								'position' : 'absolute'

							}).appendTo(elem['inner']).hide();
							
							objs['slides'].reIndex();

						}

					});

				}

				method.back = function(difference) {

					difference = (!difference ? -Math.abs(options.slideBy) : difference);

					for(var i = 0; i > difference; i--) {

						elem['slides'].eq(objs['slides'].count() - 1).prependTo(elem['inner']);
						objs['slides'].reIndex();

					}

					elem['slides'].css({

						'z-index' : '0'

					});

					elem['slides'].eq(0).css({

						'z-index' : '1',
						'position' : 'absolute'

					}).fadeIn(options.speed, function(){

						elem['slides'].eq(0).css({

							'position' : 'relative'

						});

						elem['slides'].not(':first-child').css({

							'z-index' : '0',
							'position' : 'absolute'

						}).hide();

					});

				}

				if(!elem['slides'].is(':animated')) method[action]();

			}

		}

		var controls = function() {

			var method = this;

			method.play = function(direction) {

				direction = (!direction ? options.direction : direction);

				ins.timer = setInterval(objs['transition'][options.transition], options.delay, direction);

			}

			method.pause = function() {

				clearInterval(ins.timer);

			}

			method.play();

		}

		var pager = function() {

			var method = this;

			method.setUp = function() {

				if(!method.checks()) return;

				method.populate();

			}

			method.checks = function() {

				if(!options.pager) return false;

				if(typeof options.pager != 'object') {

					objs['misc'].report('warn', 'Please pass an jQuery selector as the pager option!');
					return false;

				}

				if(options.pager.size() <= 0) {

					objs['misc'].report('error', 'Cannot find pager container, please double check your selector!');
					return false;

				}

				return true;

			}

			method.populate = function() {

				for(var i = 0; i < objs['slides'].count(); i++) {

					$('<a />', {

						'href' : 'javascript:void(0);',
						'data-target' : i

					}).appendTo(options.pager);

				}

			}

		}

		setUp.init();

	}

})();