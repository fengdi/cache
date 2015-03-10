var Store = require('./index.js');


var s = new Store({
	ttl:20
});


// s.set('a','test', function(){

// setTimeout(function(){
// 	s.get('a', function(e, data){
// 		if(e){console.log(e)}else{
// 			console.log(data);
// 		}
// 	});
// }, 600);

// });
s.get('a');
s.set('a','sdasdsad');
console.log(s.get('a'));


s.set('aslkdasjl289138912_+_123=-\\[],./;','8');
s.set('http://trade.taobao.com/trade/itemlist/list_sold_items.htm','http://trade.taobao.com/trade/itemlist/list_sold_items.htm');


