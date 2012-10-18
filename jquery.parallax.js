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
						});
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
					endPosAutoOffset:-10,
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
					}else{
						$(window).scroll(function(){
							_para.doAnimate(_para._g.scrollDistance);
						});
					}
					
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

					if(typeof p.start === 'string'){
						if(p.start === 'auto'){
							p.start = $_target.offset().top - $(window).height() + $.parallax._g.o.startPosAutoOffset;
						}else if(p.start.replace(' ','').indexOf('auto+') !== -1){
							p.start = $_target.offset().top - $(window).height() + $.parallax._g.o.startPosAutoOffset + parseFloat(p.start.split('+')[1]);
						}else if(p.start.replace(' ','').indexOf('auto-') !== -1){
							p.start = $_target.offset().top - $(window).height() + $.parallax._g.o.startPosAutoOffset - parseFloat(p.start.split('-')[1]);
						}
					}
					if(typeof p.end === 'string'){
						if(p.end === 'auto'){
							p.end = $_target.offset().top  + $.parallax._g.o.endPosAutoOffset;
						}else if(p.end.replace(' ','').indexOf('auto+') !== -1){
							p.end = $_target.offset().top  + $.parallax._g.o.endPosAutoOffset + parseFloat(p.end.split('+')[1]);
						}else if(p.end.replace(' ','').indexOf('auto-') !== -1){
							p.end = $_target.offset().top  + $.parallax._g.o.endPosAutoOffset - parseFloat(p.end.split('-')[1]);
						}
					}
					if(p.animateStart !== undefined){
						p.start = p.animateStart;
					}
					if(p.animateEnd !== undefined){
						p.end = p.animateEnd;
					}
					
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
})(jQuery);
