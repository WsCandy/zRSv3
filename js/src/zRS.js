;(function() {

	'use strict';

	var version = '3.0a',
		name = 'zRS',
		extendableObjs = {

			transition: {},
			publicF: {},
			pager: {}

		};

	$.fn.zRS = function(settings, params) {

		if(!this[0] && settings == 'extend') {

			!extendableObjs[params.name] ? extendableObjs[params.name] : extendableObjs[params.name][params.handle] = {

				core: params.extend,
				handle: params.handle

			};

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

				var ins = new zRS_core(self, settings);
				
				for(var customObj in extendableObjs) {

					if(ins[customObj]) continue;
					ins[customObj] = extendableObjs[customObj].core;
					
				}

				ins.init();

				self.data('ins', ins);

			} else {

				var ins = self.data('ins');

				if(ins['publicF'][settings]) {

					if(this.length > 1) {

						results.push(ins['publicF'][settings](params));

					} else {

						return ins['publicF'][settings](params);
						
					}

				} else {

					if(console) {
					
						console.error('['+ name +' '+ version +'] - "'+ settings +'" is not a public method here\'s a nice list:');
						return ins['publicF'];

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
				pager: $('.pager'),
				visibleSlides: 1,
				trans_callback: null,
				pre_trans_callback: null

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

				objs['controls'].play();

			},

			defineModules: function() {

				var modules = ['misc', 'inner', 'slides', 'transition', 'pager', 'controls'];

				for(var i = 0; i < modules.length; i++) {

					objs[modules[i]] = new ins[modules[i]]();

				}

				for(var customObj in extendableObjs) {

					var data = {

						self: self,
						ins: ins,
						objs: objs,
						elem: elem,
						options: options

					}

					if(customObj === 'publicF') {

						for(var extend in extendableObjs[customObj]) {

							ins.publicF[extendableObjs[customObj][extend].handle] = extendableObjs[customObj][extend].core;							

						}

					} else if(!objs[customObj]) {

						objs[customObj] = new extendableObjs[customObj].core(data);

					} else {

						for(var extend in extendableObjs[customObj]) {

							objs[customObj][extendableObjs[customObj][extend].handle] = (typeof objs[customObj][extendableObjs[customObj][extend].handle] !== 'function' ? new extendableObjs[customObj][extend].core(data) : extendableObjs[customObj][extend].core);

						}

					}

				}

			}

		}

		ins.publicF = {

			slideCount : function() {

				return objs['slides'].count();

			},

			pause : function() {

				objs['controls'].pause();

			},

			play : function() {

				objs['controls'].play();

			},

			next : function() {

				objs['transition'][options.transition]['forward']();

			},

			prev: function() {

				objs['transition'][options.transition]['back']();

			},

			currentSlide: function() {

				return objs['slides'].currentSlide;

			},

			reIndex: function() {

				return objs['slides'].reIndex();

			}

		}

		ins.misc = function() {

			var method = this;

			method.report = function(type, message) {

				if(console)	console[type]('['+ name +' '+ version +'] - ' + message);

			}

		}

		ins.inner = function() {

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

		ins.slides = function() {

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

			this.currentSlide = 0;

		}

		ins.transition = function() {

			var transition = this;

			transition.setUp = function() {

				objs['transition'][options.transition].setUp();
				objs['transition'].procedural('initial');

			}

			transition.procedural = function(target, difference) {

				difference = !difference ? options.slideBy : difference;
				target = !target ? objs['transition'].target(difference) : target;

				if(target == 'initial') {

					for(var i = 0; i < options.visibleSlides; i++) {

						transition.swapImg(elem['slides'].eq(i));

					}

					return;

				}

				for(var i = 0; (difference < 0 ? i > difference : i < difference); (difference < 0 ? i-- : i++)) {

					transition.swapImg(elem['slides'].eq((difference < 0 ? Math.abs(i) : (i + difference) - (options.visibleSlides === difference ? 0 : difference - options.visibleSlides))));

				}
				
			}

			transition.swapImg = function(slide) {

				var images = slide.is('img') ? slide : slide.find('img');

				for(var i = 0; i < images.length; i++) {

					var image = $(images[i]);

					image.attr('src', image.attr('zrs-src'));

				}

			}

			transition.before = function(transition, direction, difference) {

				if(self.find('*').is(':animated')) return;

				transition = !transition ? options.transition : transition;
				direction = !direction ? options.direction : direction;

				difference = (!difference ? (direction == 'back' ? -Math.abs(options.slideBy) : options.slideBy) : (direction == 'back' ? -Math.abs(difference) : difference));

				objs['transition'][options.transition][direction](difference);
				
				objs['transition'].procedural(null, difference);				
				objs['transition'].update(difference);

				if(typeof options['pre_trans_callback'] === 'function') options['pre_trans_callback']();

				setTimeout(objs['transition'].after, options.speed);

			}

			transition.after = function() {

				if(typeof options['trans_callback'] === 'function')	options['trans_callback']();

			}

			transition.target = function(difference) {

				if((objs['slides'].currentSlide + difference) > objs['slides'].count() -1) {

					return (objs['slides'].currentSlide + difference) - objs['slides'].count();

				} else if(objs['slides'].currentSlide + difference < 0) {

					return objs['slides'].count() + (objs['slides'].currentSlide + difference);

				} else {

					return objs['slides'].currentSlide + difference;
					
				}

			}

			transition.update = function(difference) {

				objs['slides'].currentSlide = transition.target(difference);

				objs['slides'].reIndex();

				objs['controls'].play();
				options.pager ? objs['pager'].update() : null;

			}

			transition.goTo = function(target) {

				var difference = target - objs['slides'].currentSlide;

				if(target < objs['slides'].currentSlide) {

					objs['transition'].before(options.transition, 'back', difference);

				} else if(target > objs['slides'].currentSlide) {

					objs['transition'].before(options.transition, 'forward', difference);

				}

			}

			transition.fade = new function() {

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

			}

		}

		ins.controls = function() {

			var method = this;

			method.play = function() {

				method.pause();
				ins.timer = setTimeout(objs['transition'].before, options.delay, options.transition);

			}

			method.pause = function() {

				clearTimeout(ins.timer);

			}

		}

		ins.pager = function() {

			var method = this,
				pagers;

			method.setUp = function() {

				if(!method.checks()) return;

				method.populate();

				elem['pager'] = options.pager;
				pagers = elem['pager'].children();

				method.update();
				method.bindings();

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

			method.update = function() {

				pagers.removeClass('active');
				pagers.eq(objs['slides'].currentSlide).addClass('active');

			}

			method.bindings = function() {

				pagers.on('click', objs['pager'].goTo);

			}

			method.goTo = function() {

				objs['transition'].goTo($(this).data('target'));

			}

		}

		ins.init = function() {

			setUp.init();

		}

	}

})();