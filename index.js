

var fs = require('fs');
var path = require('path');

var Base64 = {
	encode:function(str){
		return new Buffer(str).toString('base64');
	},
	decode:function(str){
		return new Buffer(str, 'base64').toString('ascii');
	}
};//require('js-base64').Base64; // https://github.com/dankogai/js-base64



function Store(config) {
	config = config || {};
	this.dir = path.normalize(config.dir||'./cache/');
	this.ttl = config.ttl || 0;
	this.extname = config.extname ? config.extname : '.data';
	this.prename = 'Base64#';

	if(!fs.existsSync(this.dir)){
		fs.mkdirSync(this.dir)
	}
  console.log(this.ttl);
	if(this.ttl>0){
		//自动巡视清除过期存储文件
		this._autoFree();
	}
}

Store.prototype.has = function(key, callback){
	var fileName = Base64.encode(key);
	var filePath = this.dir + this.prename + fileName + this.extname;
	if (typeof callback == 'function') {
		fs.exists(filePath, function(isExists){
			callback.call(self, isExists);
		});
	}else{
		return this.hasSync(key);
	}
};
Store.prototype.hasSync = function(key){
	try{
		var fileName = Base64.encode(key);
		var filePath = this.dir + this.prename + fileName + this.extname;
		return fs.existsSync(filePath);
	}catch(e){console.log(e)};
};


Store.prototype.get = function(key, callback) {
	var self = this;
	var fileName = Base64.encode(key);
	var filePath = this.dir + this.prename + fileName + this.extname;

	if (typeof callback == 'function') {
		fs.exists(filePath, function(isExists){
			if(isExists){
				if(self.ttl > 0){
					fs.stat(filePath, function(err, stats){
						if(err){callback.call(self, err);}else{
							// atime "Access Time" - 文件数据上次被访问的时间.
							// mtime "Modified Time" - 文件上次被修改的时间。
							// ctime "Change Time" - 文件状态上次改变的时间。
							// 
							if( (new Date()).getTime() - stats.mtime.getTime() > self.ttl){
								//文件过期
								callback.call(self, null, undefined);
								fs.unlinkSync(filePath);
							}else{
								fs.readFile( filePath, function (err, data) {
									if(err){callback.call(self, err);}else{
										callback.call(self, err, data+"");
									}
								});
							}
						}
					});
				}else{
					fs.readFile( filePath, function (err, data) {
						if(err){callback.call(self, err);}else{
							callback.call(self, err, data+"");
						}
					});
				}
			}else{
				callback.call(self, null, undefined);
			}
		});
	}else{
		return this.getSync(key);
	}
};
Store.prototype.getSync = function(key) {
	try{
		var self = this;
		var fileName = Base64.encode(key);
		var filePath = this.dir + this.prename + fileName + this.extname;
		if(fs.existsSync(filePath)){
			if(self.ttl > 0){
				var stats = fs.statSync(filePath);
				if( (new Date()).getTime() - stats.mtime.getTime() > self.ttl){
					fs.unlinkSync(filePath);
				}else{
					return fs.readFileSync(filePath)+"";
				}
			}else{
				return fs.readFileSync(filePath)+""
			}
		}
	}catch(e){console.log(e)};
};


Store.prototype.set = function(key, value, callback){
	var self = this;

	var fileName = Base64.encode(key);
	var filePath = this.dir + this.prename + fileName + this.extname;

	if (typeof callback == 'function') {

		if(value === null || value === undefined){
			fs.unlink(filePath, function(){
				callback.call(self, null);
			});
		}else{
			fs.writeFile( filePath, value, function (err) {
				callback.call(self, err);
			});
		}
	}else{
		return this.setSync(key, value);
	}

};
Store.prototype.setSync = function(key, value) {
	try{
		var fileName = Base64.encode(key);
		var filePath = this.dir + this.prename + fileName + this.extname;
		if(value === null || value === undefined){
			return fs.unlinkSync(filePath);
		}else{
			return fs.writeFileSync(filePath, value);
		}
	}catch(e){console.log(e)};
};


Store.prototype._autoFree = function(){
	var self = this;

	if(self.ttl){
		clearInterval(this.tid);
		this.tid = setInterval(function(){
			try{
				fs.readdir(self.dir, function(err, files){
					if(err){}else{
						files.forEach(function(file){
							fs.stat( self.dir + file, function(err, stats){
								if(err){}else{
									if( (new Date()).getTime() - stats.mtime.getTime() > self.ttl){
										//文件过期
										fs.unlink(self.dir + file);
									}
								}
							});
						});
					}
				});
			}catch(e){console.log(e)};

		}, self.ttl);
	}

};




module.exports = Store;