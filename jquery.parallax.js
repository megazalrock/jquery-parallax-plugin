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
				$(window).one('load',function(){
					fnc.call();
				});
			},
			init:function(_o){
				var _para = this;
				_o = _o || {};
				var o = {
					keyScrollAmount:20,
					scrollRate:0.8,
					startPosAutoOffset:100,
					endPosAutoOffset:-100
				};
				$.extend(o,_o);
				_para._g['o'] = o;
				_para._g['scrollDistance'] = 0;
				
				$('body').css('overflow','hidden');
				
				this.progress(function(){
					_para._g['bodyHeight'] = $('body').height();
					_para._g['longKeryPress'] = false;

					function onWheel(e){
						var delta = e.detail || -e.wheelDelta;
						//delta = (delta > 0)? 1 : (delta < 0)? -1 : 0;
						addScrollDistance(delta * o.scrollRate);
						_para.doAnimate(_para._g['scrollDistance']);
						if (e.preventDefault){
							e.preventDefault();
						}else{
							e.returnValue = false;
							return false;
						}
					}
					if(window.addEventListener){
						window.addEventListener('DOMMouseScroll', onWheel, false);
					}
					window.onmousewheel = document.onmousewheel = onWheel;

					_para.doAnimate(_para._g['scrollDistance']);
					
					$(document)
						.on('keydown',function(e){
							switch(e.keyCode){
							case 38://up
								addScrollDistance(-o.keyScrollAmount);
								break;
							case 40://down
								addScrollDistance(o.keyScrollAmount);
								break;
							}
							_para.doAnimate(_para._g['scrollDistance']);
						});
					
					function addScrollDistance(num){
						if(_para._g['scrollDistance'] + num < 0){
							_para._g['scrollDistance'] = 0;
						}else if(_para._g['scrollDistance'] + num > _para._g['bodyHeight']){
							_para._g['scrollDistance'] = _para._g['bodyHeight'];
						}else{
							_para._g['scrollDistance'] += num;
						}
					}
					
				});
				
			},
			doAnimate:function(d){
				$('#scrollDistance').val(d);
				$('body')[0].scrollTop = d;
				$('html')[0].scrollTop = d;
				var _para = this;

				//console.log(_para._g['scrollDistance']);

				for(var i=0; this.list[i]; i+=1){
					var $_target = $(this.list[i]);
					var p = $_target.data('_param');
					if(p.startProp.height !== undefined && p.startProp.height === 'auto'){
						p.startProp.height = $_target.height();
					}
					if(p.startProp.width !== undefined && p.startProp.width === 'auto'){
						p.startProp.width = $_target.width();
					}
					if(p.start === 'auto'){
						p.start = $_target.offset().top - $(window).height() + _para._g.o.startPosAutoOffset;
					}
					if(p.end === 'auto'){
						p.end = $_target.offset().top  + _para._g.o.endPosAutoOffset;
						console.log(_para._g.o.endPosAutoOffset);
					}
					
					if(p.start > d){
						$_target
							.stop(true,true)
							.css(p.startProp);
					}else if(p.end < d){
						$_target
						.stop(true,true)
						.css(p.endProp);
					}else{
						var per = (d - p.start) / (p.end - p.start);
						var easingPer = $.easing[p.easing]( per, per * 1000, 0, 1, 1000 );
						var prop = {};
						$.each(p.endProp,function(key){
							prop[key] = (p.endProp[key] - p.startProp[key]) * easingPer + p.startProp[key];
							
						});
						$_target.css(prop);
					}
					
				}
			},
			_g:{
				
			},
			list:[]
		}
	});
	$.fn.extend({
		paraAnimate:function(_para){
			var para = {
				easing:'swing',
				start:'auto',
				end:'auto'
			};
			$.extend(para,_para);
			$.parallax.list.push($(this).data('_param',para));
			return this;
		}
	});
	
})(jQuery);
