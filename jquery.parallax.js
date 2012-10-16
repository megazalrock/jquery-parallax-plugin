/*
 * jQuery Parallax Plugin 1.0
 * Author : Otto Kamiya (MegazalRock)
 * License : Dual licensed under the MIT or GPL Version 2 licenses.
 * Browser : Chrome23+ (Win/Mac) Firefox14+ (Win/Mac) Opera12+ (Win/Mac) Safari6+(Mac) IE9+(Win) IE8(Win)
 * Usage : http://
 */
(function(){
	$.extend({
		parallax:{
			progress:function(fnc){
				var _para = this;
				if(_para._g.o.useLoadprogress){
					$.loadprogress({
						bodyOverflowFixTo:false,
						manualMode:true
					});
					var loaded = 0;
					$(window)
						.one('load loadprogressEnd',function(e){
							loaded += 1;
							if(loaded >= 2){
								setTimeout(function(){
									fnc.call();
								},1);
							}
						})
				}else{
					fnc.call()
				}
			},
			init:function(_o){
				var _para = this;
				_o = _o || {};
				var o = {
					useLoadprogress:true,
					onScroll:undefined,
					keyScrollAmount:20,
					scrollRate:0.8,
					startPosAutoOffset:0,
					endPosAutoOffset:-100,
					showScrollBar:false,
					mode:'scroll' //'scroll' or 'page'
				};
				$.extend(o,_o);
				_para._g['o'] = o;
				_para._g['scrollDistance'] = 0;

				this.progress(function(){
					_para._g.scrollDistance = $('html')[0].scrollTop || $('body')[0].scrollTop;
					_para._g['bodyHeight'] = $('body').height();

					function onWheel(e){
						e = e || window.event;
						var delta = e.detail || -e.wheelDelta;
						//delta = (delta > 0)? 1 : (delta < 0)? -1 : 0;
						addScrollDistance(delta * o.scrollRate);
						_para.doAnimate(_para._g.scrollDistance);
						if (e.preventDefault){
							e.preventDefault();
						}else{
							e.returnValue = false;
							return false;
						}
					}
					if(!o.showScrollBar){
						$('body').css('overflow','hidden');
						if(window.addEventListener){
							window.addEventListener('DOMMouseScroll', onWheel, false);
						}
						window.onmousewheel = document.onmousewheel = onWheel;
					}else{
						$(window).scroll(function(){
							_para.doAnimate(_para._g.scrollDistance);
						});
					}
					
					$(document)
						.on('keydown',function(e){
							switch(e.keyCode){
							case 38://up
								addScrollDistance(-o.keyScrollAmount);
								_para.doAnimate(_para._g.scrollDistance);
								break;
							case 40://down
								addScrollDistance(o.keyScrollAmount);
								_para.doAnimate(_para._g.scrollDistance);
								break;
							}
						});
					$(window)	
						.resize(function(){
							_para.doAnimate(_para._g.scrollDistance);
						});
					
					function addScrollDistance(num){
						if(_para._g.scrollDistance + num < 0){
							_para._g.scrollDistance = 0;
						}else if(_para._g.scrollDistance + num > _para._g['bodyHeight']){
							_para._g.scrollDistance = _para._g['bodyHeight'];
						}else{
							_para._g.scrollDistance += num;
						}
					}
					
				});//this.progress(function(){ end
			},
			start:function(){
				var _para = this;
				if(_para._g.o.useLoadprogress){
					$(window).one('loadprogressEnd',function(){
						_para.doAnimate(_para._g.scrollDistance);
						$(this).trigger('loadprogressManualEnd');
					});
				}else{
					setTimeout(function(){
						_para.doAnimate(_para._g.scrollDistance);
					},1);
				}
			},
			doAnimate:function(d){
				d = d || $('html')[0].scrollTop || $('body')[0].scrollTop;
				var _para = this;
				if(!_para._g.o.showScrollBar){
					$('body')[0].scrollTop = $('html')[0].scrollTop  = d;
				}
				if($.isFunction(_para._g.o.onScroll)){
					_para._g.o.onScroll.call();
				}
				for(var i=0; this.list[i]; i+=1){
					var $_target = $(this.list[i]);
					var p = $_target.data('_param');
					if(p.start >= d){
						$_target
							.stop(true,true)
							.css(p.startProp);
					}else if(p.end <= d){
						$_target
						.stop(true,true)
						.css(p.endProp);
					}else{
						var per = (d - p.start) / (p.end - p.start);
						var easingPer = $.easing[p.easing]( per, per * 1000, 0, 1, 1000 );
						var prop = {};
						$.each(p.endProp,function(key){
							p.startProp[key] = parseFloat(p.startProp[key]);
							p.endProp[key] = parseFloat(p.endProp[key]);
							prop[key] = (p.endProp[key] - p.startProp[key]) * easingPer + p.startProp[key];
						});
						$_target.css(prop);
					}
				}
				_para._g.scrollDistance = d;
			},
			_g:{},
			list:[]
		}
	});
	$.fn.extend({
		paraAnimate:function(_para){
			var p = {
				easing:'swing',
				start:'auto',
				end:'auto'
			};
			$.extend(p,_para);
			var $_target = $(this);
			p.startProp = p.startProp || {};
			p.endProp = p.endProp || {};
			if(p.startProp.height !== undefined && p.startProp.height === 'auto'){
				p.startProp.height = $_target.height();
			}
			if(p.startProp.width !== undefined && p.startProp.width === 'auto'){
				p.startProp.width = $_target.width();
			}
			if(p.endProp.height !== undefined && p.endProp.height === 'auto'){
				p.endProp.height = $_target.height();
			}
			if(p.endProp.width !== undefined && p.endProp.width === 'auto'){
				p.endProp.width = $_target.width();
			}
			if(p.start === 'auto'){
				p.start = $_target.offset().top - $(window).height() + $.parallax._g.o.startPosAutoOffset;
			}
			if(p.end === 'auto'){
				p.end = $_target.offset().top  + $.parallax._g.o.endPosAutoOffset;
			}
			if(p.animateStart !== undefined){
				p.start = p.animateStart;
			}
			if(p.animateEnd !== undefined){
				p.end = p.animateEnd;
			}
			$.each(p.startProp,function(key){
				if(p.endProp[key] === undefined){
					if($_target.css(key) === 'auto' && key.indexOf('margin') !== -1){
						p.endProp[key] = 0;
					}else{
						p.endProp[key] = parseFloat($_target.css(key));
					}
				}
				if(typeof p.startProp[key] === 'string'){
					$_target.css(key,p.startProp[key]);
					p.startProp[key] = parseFloat($_target.css(key));
				}
			});
			$.each(p.endProp,function(key){
				if(p.startProp[key] === undefined){
					if($_target.css(key) === 'auto' && key.indexOf('margin') !== -1){
						p.startProp[key] = 0;
					}else{
						p.startProp[key] = parseFloat($_target.css(key));
					}
				}
				if(typeof p.endProp[key] === 'string'){
					$_target.css(key,p.endProp[key]);
					p.endProp[key] = parseFloat($_target.css(key));
				}
			});
			$.parallax.list.push($(this).data('_param',p));
			return this;
		}
	});
	/*
	 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
	 *
	 * Uses the built in easing capabilities added In jQuery 1.1
	 * to offer multiple easing options
	 *
	 * TERMS OF USE - jQuery Easing
	 * 
	 * Open source under the BSD License. 
	 * 
	 * Copyright © 2008 George McGinley Smith
	 * All rights reserved.
	 * 
	 * Redistribution and use in source and binary forms, with or without modification, 
	 * are permitted provided that the following conditions are met:
	 * 
	 * Redistributions of source code must retain the above copyright notice, this list of 
	 * conditions and the following disclaimer.
	 * Redistributions in binary form must reproduce the above copyright notice, this list 
	 * of conditions and the following disclaimer in the documentation and/or other materials 
	 * provided with the distribution.
	 * 
	 * Neither the name of the author nor the names of contributors may be used to endorse 
	 * or promote products derived from this software without specific prior written permission.
	 * 
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
	 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
	 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
	 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
	 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
	 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
	 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
	 * OF THE POSSIBILITY OF SUCH DAMAGE. 
	 *
	*/

	// t: current time, b: begInnIng value, c: change In value, d: duration
	jQuery.easing['jswing'] = jQuery.easing['swing'];

	jQuery.extend( jQuery.easing,
	{
		def: 'easeOutQuad',
		swing: function (x, t, b, c, d) {
			//alert(jQuery.easing.default);
			return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
		},
		easeInQuad: function (x, t, b, c, d) {
			return c*(t/=d)*t + b;
		},
		easeOutQuad: function (x, t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		},
		easeInOutQuad: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t + b;
			return -c/2 * ((--t)*(t-2) - 1) + b;
		},
		easeInCubic: function (x, t, b, c, d) {
			return c*(t/=d)*t*t + b;
		},
		easeOutCubic: function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t + 1) + b;
		},
		easeInOutCubic: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t + b;
			return c/2*((t-=2)*t*t + 2) + b;
		},
		easeInQuart: function (x, t, b, c, d) {
			return c*(t/=d)*t*t*t + b;
		},
		easeOutQuart: function (x, t, b, c, d) {
			return -c * ((t=t/d-1)*t*t*t - 1) + b;
		},
		easeInOutQuart: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
			return -c/2 * ((t-=2)*t*t*t - 2) + b;
		},
		easeInQuint: function (x, t, b, c, d) {
			return c*(t/=d)*t*t*t*t + b;
		},
		easeOutQuint: function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t*t*t + 1) + b;
		},
		easeInOutQuint: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
			return c/2*((t-=2)*t*t*t*t + 2) + b;
		},
		easeInSine: function (x, t, b, c, d) {
			return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
		},
		easeOutSine: function (x, t, b, c, d) {
			return c * Math.sin(t/d * (Math.PI/2)) + b;
		},
		easeInOutSine: function (x, t, b, c, d) {
			return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
		},
		easeInExpo: function (x, t, b, c, d) {
			return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
		},
		easeOutExpo: function (x, t, b, c, d) {
			return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
		},
		easeInOutExpo: function (x, t, b, c, d) {
			if (t==0) return b;
			if (t==d) return b+c;
			if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
			return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
		},
		easeInCirc: function (x, t, b, c, d) {
			return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
		},
		easeOutCirc: function (x, t, b, c, d) {
			return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
		},
		easeInOutCirc: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
			return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
		},
		easeInElastic: function (x, t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		},
		easeOutElastic: function (x, t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
		},
		easeInOutElastic: function (x, t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
			return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
		},
		easeInBack: function (x, t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c*(t/=d)*t*((s+1)*t - s) + b;
		},
		easeOutBack: function (x, t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		},
		easeInOutBack: function (x, t, b, c, d, s) {
			if (s == undefined) s = 1.70158; 
			if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
			return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
		},
		easeInBounce: function (x, t, b, c, d) {
			return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
		},
		easeOutBounce: function (x, t, b, c, d) {
			if ((t/=d) < (1/2.75)) {
				return c*(7.5625*t*t) + b;
			} else if (t < (2/2.75)) {
				return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
			} else if (t < (2.5/2.75)) {
				return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
			} else {
				return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
			}
		},
		easeInOutBounce: function (x, t, b, c, d) {
			if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
			return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
		}
	});

	/*
	 *
	 * TERMS OF USE - EASING EQUATIONS
	 * 
	 * Open source under the BSD License. 
	 * 
	 * Copyright © 2001 Robert Penner
	 * All rights reserved.
	 * 
	 * Redistribution and use in source and binary forms, with or without modification, 
	 * are permitted provided that the following conditions are met:
	 * 
	 * Redistributions of source code must retain the above copyright notice, this list of 
	 * conditions and the following disclaimer.
	 * Redistributions in binary form must reproduce the above copyright notice, this list 
	 * of conditions and the following disclaimer in the documentation and/or other materials 
	 * provided with the distribution.
	 * 
	 * Neither the name of the author nor the names of contributors may be used to endorse 
	 * or promote products derived from this software without specific prior written permission.
	 * 
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
	 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
	 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
	 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
	 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
	 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
	 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
	 * OF THE POSSIBILITY OF SUCH DAMAGE. 
	 *
	 */
	
})(jQuery);
