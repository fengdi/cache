# cache

    var Store = require('cache');


    var s = new Store({
        dir:"./cache/",
        ttl:30          //Time to live 30 Seconds
    });

    s.set("foo", "helloworld");
    
    s.get("foo");   //"helloworld"