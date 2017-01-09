;(function() {

	'use strict';

	var version = '3.0a',
		name = 'zRS',
		extendableObjs = {

			transition: {},
			publicF: {},
			pager: {}

		};

	$.fn.zRS3 = function(settings, params) {

		if(!this[0] && settings === 'extend') {
            
            if(!extendableObjs[params.name]) {
                
               extendableObjs[params.name] = {

                   core: params.extend,
                   handle: params.handle

               };
                
            } else {

                extendableObjs[params.name][params.handle] = {

                    core: params.extend,
                    handle: params.handle

                };
                
            }
            
			return;

		}
		
		var results = [];

		for(var i = 0; i < this.length; i++) {

			var self = $(this[i]),
                ins;

			if(!self.data('ins')) {

				if(typeof settings === 'string' && console) {

					console.error('['+ name +' '+ version +'] - not running, try firing methods after initialisation'); 
					continue;

				}

				ins = new ZRS_core(self, settings);
				
				for(var customObj in extendableObjs) {
                                        
                    if(extendableObjs.hasOwnProperty(customObj)) {
                        
                        if(ins[customObj]) {
                            continue;
                        }
					
				        ins[customObj] = extendableObjs[customObj].core;

					}
					
				}

				ins.init();

				self.data('ins', ins);

			} else {

				ins = self.data('ins');

				if(ins.publicF[settings]) {

					if(this.length > 1) {

						results.push(ins.publicF[settings](params));

					} else {

						return ins.publicF[settings](params);
						
					}

				} else {

					if(console) {
					
						console.error('['+ name +' '+ version +'] - "'+ settings +'" is not a public method here\'s a nice list:');
						return ins.publicF;

					}

				}

			}

		}

		if(results.length >= 1) {
            return results;
        }

	};

	var ZRS_core = function(self, settings) {

		var ins = this;		
			ins.defaults = {

				transition : 'fade',
				textFade : false,
				fluidHeight : false,
				direction : 'forward',
				speed : 1500,
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

			};
		
		var options = $.extend(ins.defaults, settings), objs = {}, elem = {};
		
		ins.cssPrefix = ['webkit', 'moz', 'o', 'ms', 'transition'];
		ins.animationFrameSupport = window.requestAnimationFrame !== undefined;

		var setUp = {

			init: function() {

				setUp.defineModules();

				for(var obj in objs) {

					if(!objs[obj].setUp) {continue;}

					try {

						objs[obj].setUp();
						
					} catch(error) {

						objs.misc.report('group', error.message + ', tracer below...');
						console.info(error.stack.split('\n')[1]);
						console.groupEnd();

					}

				}
				
				objs.controls.play();

				$(window).on('blur', objs.controls.pause);
				$(window).on('focus', function() {
                    
                    if(options.transition === 'slide') {

                        if(objs.slides.currentSlide > (objs.slides.count() -1)) {

                            objs.slides.currentSlide = 0;

                        }
                        
                        ins.publicF.jumpTo(objs.slides.currentSlide);
                        
                    }
                    
                    objs.controls.play();                        
                    
				});

			},

			defineModules: function() {

				var modules = ['misc', 'inner', 'slides', 'transition', 'pager', 'controls'], extend;

				for(var i = 0; i < modules.length; i++) {

					objs[modules[i]] = new ins[modules[i]]();

				}

				for(var customObj in extendableObjs) {
                    
                    if(extendableObjs.hasOwnProperty(customObj)) {
                    
                        var data = {

                            self: self,
                            ins: ins,
                            objs: objs,
                            elem: elem,
                            options: options

                        };

                        if(customObj === 'publicF') {

                            for(extend in extendableObjs[customObj]) {

                                if(extendableObjs.hasOwnProperty(extend)) {

                                    ins.publicF[extendableObjs[customObj][extend].handle] = extendableObjs[customObj][extend].core;							

                                }

                            }

                        } else if(!objs[customObj]) {

                            objs[customObj] = new extendableObjs[customObj].core(data);

                        } else {

                            for(extend in extendableObjs[customObj]) {

                                if(extendableObjs[customObj].hasOwnProperty(extend)) {

                                    objs[customObj][extendableObjs[customObj][extend].handle] = (typeof objs[customObj][extendableObjs[customObj][extend].handle] !== 'function' ? new extendableObjs[customObj][extend].core(data) : extendableObjs[customObj][extend].core);

                                }

                            }

                        }
                        
                    }

				}

			}

		};

		ins.publicF = {

			slideCount : function() {

				return objs.slides.count();

			},

			pause : function() {

				objs.controls.pause();

			},

			play : function() {

				objs.controls.play();

			},

			next : function() {

				objs.transition.before(options.transition, 'forward');

			},

			prev: function() {

				objs.transition.before(options.transition, 'back');

			},

			currentSlide: function() {

				return objs.slides.currentSlide;

			},

			reIndex: function() {

				return objs.slides.reIndex();

			},

			goTo: function(target) {

				objs.transition.goTo(target);

			},
            
            jumpTo: function(target) {
                
                objs.transition[options.transition].jumpTo(target);
                
            }

		};

		ins.misc = function() {

			var method = this;

			method.report = function(type, message) {

				if(console)	{
                    console[type]('['+ name +' '+ version +'] - ' + message);
                }

			};

		};

		ins.inner = function() {

			var method = this;

			method.setUp = function() {

				elem.inner = self.find('.inner-slider:first');
				elem.inner.css({

					'position' : 'relative',
					'width' : '100%',
					'overflow' : 'hidden'

				});

			};

		};

		ins.slides = function() {

			var method = this;

			method.setUp = function() {

				elem.slides = elem.inner.children();
				elem.slides.addClass('zRS--slide');

			};

			method.count = function() {

				objs.slides.reIndex();

				return elem.slides.length;

			};

			method.reIndex = function() {
                
                if(elem.inner.children().hasClass('carousel')) {
                    
                    elem.slides = elem.inner.children().children();
                    
                } else {
                    
				    elem.slides = elem.inner.children();
                    
                }                

			};

			this.currentSlide = 0;

		};

		ins.transition = function() {

			var transition = this;

			transition.count = 0;
			transition.textOpacity = 1;
            transition.defaultVisible = options.visibleSlides;

			transition.setUp = function() {

                objs.transition.checkVisible();
				objs.transition[options.transition].setUp();
				objs.transition.procedural(null, null, null, true);

				objs.transition.after();

			};
            
            transition.checkVisible = function() {
                            
                if(options.setVisibleSlides && typeof options.setVisibleSlides === 'object') {

                    for(var size in options.setVisibleSlides) {

                        if(document.documentElement.clientWidth <= size) {

                            options.visibleSlides = options.setVisibleSlides[size];
                            return;

                        } else {

                            options.visibleSlides = transition.defaultVisible;

                        }

                    }

                }

            };

			transition.procedural = function(target, difference, direction, initial) {
                
                var i, slide;       
                
				difference = !difference ? options.slideBy : difference;
				target = !target ? objs.transition.target(difference) : target;

				if(initial) {

					for(i = 0; i < options.visibleSlides; i++) {

						transition.swapImg(elem.slides.eq(i), difference, direction, 'initial');

					}
                    
                    if(options.visibleSlides % 1 !== 0 && options.alignment === 'center') {
                        
                        transition.swapImg(elem.slides.eq(objs.slides.count() -1), difference, direction, 'initial');
                        
                    }

					return;

				}

				transition.count = Math.abs(difference);

				for(i = 0; (difference < 0 ? i > difference : i < difference); (difference < 0 ? i-- : i++)) {

					if(ins.animationFrameSupport === true || options.transition === 'slide') {

                        var current = objs.slides.currentSlide;
                        
						if(direction !== 'back') {                            
                            
                            if(options.visibleSlides % 1 !== 0 && options.alignment === 'center') {
                                
                                current +=1;

                            }

							slide =  current + Math.ceil(options.visibleSlides) - (i + 1);
				            slide = (slide >= objs.slides.count()) ? slide - objs.slides.count() : slide;

						} else {

                            if(options.visibleSlides % 1 !== 0 && options.alignment === 'center') {
                                
                                current -=1;

                            }

                            
				            slide = current - i;
                            
						}

						transition.swapImg(elem.slides.eq(slide), direction, difference);

					} else {						

						transition.swapImg(elem.slides.eq((difference < 0 ? Math.abs(i) : (i + difference) - (Math.ceil(options.visibleSlides) === difference ? 0 : difference - Math.ceil(options.visibleSlides)))), direction, difference);

					}

				}
				
			};

			transition.swapImg = function(slide, direction, difference, initial) {

                var images;
                
                if(options.background === true) {
                    
                    images = slide;
                    
                } else {
                    
                    images = slide.is('img') ? slide : slide.find('img');
                    
                }                

				if(images.length === 0) {

					transition.count--;	

					if(transition.count === 0 && !initial) {

						objs.transition[options.transition][direction](difference);
							
					}

					return;

				}

				for(var i = 0; i < images.length; i++) {

					var image = $(images[i]);

					if(!image.attr('zrs-src')) {

						transition.count--;						

						if(transition.count === 0 && !initial) {

							objs.transition[options.transition][direction](difference);
							
						}

						continue;

					}
                    
                    if(options.background === true) {
                        
                        image.css({
                            
                            'background-image' : 'url('+image.attr('zrs-src')+')'
                            
                        });                        
                        
                    } else {
                        
                        image.attr('src', image.attr('zrs-src'));                        
                        
                    }
                    
                    transition.count--;

                    image.removeAttr('zrs-src');

                    if(transition.count === 0 && !initial) {

                        objs.transition[options.transition][direction](difference);

                    }

				}

			};

			transition.before = function(transition, direction, difference) {

				if(self.find('*').is(':animated')) {
                    return;
                }

                objs.slides.oldSlide = objs.slides.currentSlide;
                
				transition = !transition ? options.transition : transition;
				direction = !direction ? options.direction : direction;

				difference = (!difference ? (direction === 'back' ? -Math.abs(options.slideBy) : options.slideBy) : (direction === 'back' ? -Math.abs(difference) : difference));

				if(options.transition === 'fade' && ins.animationFrameSupport === true) {

					cancelAnimationFrame(objs.transition.animate);

				}

				objs.transition.pre_trans();                
				objs.transition.update(difference);                
				objs.transition.procedural(null, difference, direction);

			};

            transition.pre_trans = function() {             
                         
                if(typeof options.pre_trans_callback === 'function') {

                    return options.pre_trans_callback({

                        current: elem.slides.eq(objs.slides.currentSlide)

                    });

                }            
                
            };
            
			transition.after = function() {

				if(typeof options.trans_callback === 'function') {
                    
                    options.trans_callback({

                        current: elem.slides.eq(objs.slides.currentSlide)

                    });
                    
                }

			};

			transition.target = function(difference) {

				if((objs.slides.currentSlide + difference) > objs.slides.count() -1) {

					return (objs.slides.currentSlide + difference) - objs.slides.count();

				} else if(objs.slides.currentSlide + difference < 0) {

					return objs.slides.count() + (objs.slides.currentSlide + difference);

				} else {

					return objs.slides.currentSlide + difference;
					
				}

			};

			transition.update = function(difference) {

				objs.slides.currentSlide = transition.target(difference);

				objs.slides.reIndex();

				if(options.pager) { 
                    objs.pager.update(); 
                }
				objs.controls.play();

			};

			transition.goTo = function(target) {

				var difference = target - objs.slides.currentSlide;

				if(target < objs.slides.currentSlide) {

					objs.transition.before(options.transition, 'back', difference);

				} else if(target > objs.slides.currentSlide) {

					objs.transition.before(options.transition, 'forward', difference);

				}

			};

			transition.fade = {

				setUp : function() {

					elem.slides.eq(0).show();

					elem.slides.css({

						'top' : '0px',
						'left' : '0px',
						'float' : 'left',
						'width' : '100%'

					});
                    
                    elem.slides.data('opacity', 0);

					for(var i = 0; i < objs.slides.count(); i++) {

						if(i === 0) {

							if(ins.animationFrameSupport === true) {
                                
								if(options.fluidHeight === true) {

									elem.inner.css({

										'min-height' : elem.slides.eq(i).outerHeight(true) + 'px',
										'transition' : '0.25s'

									});
									
								}

								elem.slides.eq(i).css({

									'position' : 'relative',
									'z-index' : '2',
									'opacity' : '1'

								});

							} else {

								elem.slides.eq(i).css({

									'position' : 'relative',
									'z-index' : '1',
                                    'opacity' : '1'

								});								

							}


						} else {

							if(ins.animationFrameSupport === true) {

								elem.slides.eq(i).css({

									'position' : 'absolute',
									'z-index' : '0',
									'opacity' : '0'

								});

							} else {

								elem.slides.eq(i).css({

									'position' : 'absolute',
									'z-index' : '0',
                                    'opacity' : '1'

								}).hide();

							}

						}

					}

				},

				progress : function(difference, direction) {
                    
                    var newHeight;
                    
					objs.transition.animate = requestAnimationFrame(function() {

						if(elem.slides.eq(objs.slides.currentSlide).data('opacity') === 0) {

							if(options.fluidHeight === true) {

								newHeight = elem.slides.eq(objs.slides.currentSlide).outerHeight(true);
                                
								if(elem.inner.height() < newHeight) {

									elem.inner.css({

										'min-height' : newHeight + 'px'

									});
									
								}				

							}
                            
                            elem.slides.css({

                                'z-index' : '0'

							});
                            
                            elem.slides.eq(objs.slides.currentSlide).css({
                                
                                'z-index' : '1'
                                
                            });
                                                                                    
							elem.slides.not(elem.slides.eq(objs.slides.currentSlide)).not(elem.slides.eq(objs.slides.oldSlide)).css({

                                'opacity' : '0'

							}).data('opacity', 0);                            

						}

						if(options.textFade === true) {

							transition.textOpacity-=((1 / (options.speed / 10)) * 1.5);
                            
							elem.slides.eq(objs.slides.oldSlide).css({

								'opacity': Math.max(transition.textOpacity, 0)

							});
								
						}

						elem.slides.eq(objs.slides.currentSlide).data().opacity +=(1 / (options.speed / 60));

						elem.slides.eq(objs.slides.currentSlide).css({

							'opacity' : Math.min(elem.slides.eq(objs.slides.currentSlide).data('opacity'), 1)

						});

						if(Math.min(elem.slides.eq(objs.slides.currentSlide).data('opacity'), 1) === 1) {

							newHeight = elem.slides.eq(objs.slides.currentSlide).outerHeight(true);

							elem.slides.eq(objs.slides.currentSlide).data('opacity', 0);
							transition.textOpacity = 1;

							if(elem.inner.height() > newHeight && options.fluidHeight === true) {

								elem.inner.css({

									'min-height' : newHeight + 'px'

								});
								
							}
                            
                            elem.slides.eq(objs.slides.currentSlide).css({
                                
                                'position' : 'relative'
                                
                            });

							elem.slides.not(elem.slides.eq(objs.slides.currentSlide)).css({

								'opacity': 0,
                                'position' : 'absolute'

							});

							objs.transition.after();

							return;

						}

						objs.transition.fade[direction](difference, direction);

					});

				},

                forward : function(difference) {

					if(ins.animationFrameSupport === true) {

						objs.transition.fade.progress(difference, 'forward');

					} else {

						elem.slides.eq(difference).css({

							'z-index' : '2'

						}).fadeIn(options.speed, function() {
						
							elem.slides.eq(difference).css({

								'position' : 'relative'

							});
							
							for(var i = 0; i < difference; i++) {

								elem.slides.eq(0).css({

									'z-index' : '1',
									'position' : 'absolute'

								}).appendTo(elem.inner).hide();
								
								objs.slides.reIndex();

							}

							objs.transition.after();

						});						

					}

				},

				back : function(difference) {
				
					if(ins.animationFrameSupport === true) {

						objs.transition.fade.progress(difference, 'back');

					} else {

						for(var i = 0; i > difference; i--) {

							elem.slides.eq(objs.slides.count() - 1).prependTo(elem.inner);
							objs.slides.reIndex();

						}

						elem.slides.css({

							'z-index' : '0'

						});

						elem.slides.eq(0).css({

							'z-index' : '1',
							'position' : 'absolute'

						}).fadeIn(options.speed, function(){

							elem.slides.eq(0).css({

								'position' : 'relative'

							});

							elem.slides.not(':first-child').css({

								'z-index' : '0',
								'position' : 'absolute'

							}).hide();

							objs.transition.after();

						});						

					}

				}

			};

		};

		ins.controls = function() {

			var method = this;

			method.play = function() {

				method.pause();
				
				if(options.delay === 0 || objs.slides.count() <= 1) {return;}
				ins.timer = setTimeout(objs.transition.before, options.delay, options.transition);

			};

			method.pause = function() {

				clearTimeout(ins.timer);

			};

		};

		ins.pager = function() {

			var method = this,
				pagers;

			method.setUp = function() {

				if(!method.checks()) {return;}

				method.populate();

				elem.pager = options.pager;
				pagers = elem.pager.children();

				method.update();
				method.bindings();

			};

			method.checks = function() {

				if(!options.pager) { return false; }

				if(typeof options.pager !== 'object') {

					objs.misc.report('warn', 'Please pass an jQuery selector as the pager option!');
					return false;

				}

				if(options.pager.size() <= 0) {

					objs.misc.report('error', 'Cannot find pager container, please double check your selector!');
					return false;

				}

				return true;

			};

			method.populate = function() {

				for(var i = 0; i < objs.slides.count(); i++) {

					$('<a />', {

						'data-target' : i

					}).appendTo(options.pager);

				}

			};

			method.update = function() {

				pagers.removeClass('active');
				pagers.eq(objs.slides.currentSlide).addClass('active');

			};

			method.bindings = function() {

				pagers.on('click', objs.pager.goTo);

			};

			method.goTo = function(e) {
                
                if(e) {
                    
                    e.preventDefault();
                    
                }

				objs.transition.goTo($(this).data('target'));

			};

		};

		ins.init = function() {

			setUp.init();

		};

	};

})();