(function() {
/**
 * almond 0.1.4 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        aps = [].slice;

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!defined.hasOwnProperty(name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    function makeMap(name, relName) {
        var prefix, plugin,
            index = name.indexOf('!');

        if (index !== -1) {
            prefix = normalize(name.slice(0, index), relName);
            name = name.slice(index + 1);
            plugin = callDep(prefix);

            //Normalize according
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            p: plugin
        };
    }

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = makeRequire(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = defined[name] = {};
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = {
                        id: name,
                        uri: '',
                        exports: defined[name],
                        config: makeConfig(name)
                    };
                } else if (defined.hasOwnProperty(depName) || waiting.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else if (!defining[depName]) {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        waiting[name] = [name, deps, callback];
    };

    define.amd = {
        jQuery: true
    };
}());

define("../build/almond", function(){});

define('Class',[], function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  var Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
  
  return Class;
});
/**
 * Requester of a resource by an URI
 */
define('AsyncRequester',['Class'], function(Class) {
    
    var AsyncRequester = Class.extend({
        init: function(session) {
          this.session = session;  
        },
        makeRequest: function(promise, callbacks) {
            var self = this;
            var p = promise
                    .fail(function(response) { return self.invalidTokenHandler(response); })
                    .fail(function(response) { return self.adaptError(response); } ); 
            if(callbacks) {
                var cb = this.getCallbacks(callbacks);
                p.then(cb.success, cb.error).end();
            } else {
                return p;
            }
        },
        /**
         * Filter the errors to handle 401 properly (it is currently returned with status = 0)
         */
        invalidTokenHandler: function(response) {
           if(response.status == 0) {
              response.status = 401;
              response.error = {};
              response.error.errors = {};
              response.error.errors.error = {code: "Unauthorized", description:"Invalid token"};
              
              // Remove all session data (token, auth flag)
              this.session.disconnect();
           }
           // Re throw the exception
           throw response;
        },
        failRequest: function(data, callbacks) {
            if(callbacks) {
                cb.error(data);
            } else {
                var defer = Q.defer();
                defer.reject(data);
                return defer.promise;
            }
        },
        load: function(resource, parameters, callbacks) {
            if(resource && resource.uri) {
                return this.makeRequest(this.session.retrieve(resource.uri, parameters), callbacks);
            } else {
                return this.failRequest("The resource does not provide a URI", callbacks);
            }
        },
        adaptError: function(response) {
            if(response.error && response.error.errors && response.error.errors.error) {
                response.error = response.error.errors.error;
            }
            throw {status: response.status, details: response};        
        },
        getCallbacks: function(callbacks){
            var that = this;
            var cb = {};
            if(!callbacks) callbacks = {};
            
            cb.error = function(response) {
                
                // If both success and error function are set
                if(callbacks.error && typeof callbacks.error === 'function'){
                    callbacks.error(response);
                    // If callDefaultError is set, call de default error handler
                    if(callbacks.callDefaultErrorHandler){
                        if(that.options.error && typeof that.options.error === 'function') {
                            that.options.error(response);
                        }
                    }
                
                // If no specific error handler was set, call the default error handler
                } else if(that.options.error && typeof that.options.error === 'function') {
                    that.options.error(response);
                }       
            };
            
            cb.success = function(data) {
                // If both success and error function are set
                if(callbacks.success && typeof callbacks.success === 'function'){
                    callbacks.success(data);
                
                // If only one success callback function is set 
                } else if(callbacks && typeof callbacks === 'function') {
                    callbacks(data);
                
                //  
                } else if(that.options.success && typeof that.options.success === 'function') {
                    that.options.success(data);
                }       
            };
            
            return cb; 
        }   
    });
    return AsyncRequester;
});
define('service/BaseService',['AsyncRequester'], function(AsyncRequester) {
    /**
     * Super Class for Service
     * most of Service objects will inherit from this 
     */
    return AsyncRequester.extend({
        init: function(client) {
            if(!client) {
                throw "Client must be instantiated";
            }
            this._super(client.session);
            
            this.client = client;
            this.options = client.options; // Default options when creating the Client
        },
        
        /**
         * Gets the requested entity corresponding to uri and id
         */
        get: function(id, parameters, callbacks){
            // Add the corresponding url to the base    
            var uri = this.uri + "/" + id;
        
            // Call the session retrieve
            return this.makeRequest(this.session.retrieve(uri, parameters), callbacks);
        },
        
        /**
         * Gets a list of entities corresponding to uri
         */
        list: function(parameters, callbacks){
            return this.makeRequest(this.session.retrieve(this.uri, parameters), callbacks); 
        },
        
        parseResponse: function(data) {
            return data;
        },
        
        replaceTemplate: function(template, params){
            for (var name in params) {
                template = template.replace('{'+name+'}', params[name]);
            }
            return template;
        }  
        
    });
});
/**
 * General functions required on the library
 */
define('Util',[], function() {
    var result = {};
    result.namespace = function(namespaceString) {
        var parts = namespaceString.split('.'),
            parent = window,
            currentPart = '';    
    
        for(var i = 0, length = parts.length; i < length; i++) {
            currentPart = parts[i];
            parent[currentPart] = parent[currentPart] || {};
            parent = parent[currentPart];
        }
    
        return parent;
    };
    result.is_array = function(input){
        return typeof(input)=='object'&&(input instanceof Array);
    }
    result.is_string = function(input){
        return typeof(input)=='string';
    }
    
    result.getAttribute = function(object, attribute) {
        var parts = attribute.split('.'),
        parent = object,
        currentPart = '';   
        for(var i = 0, length = parts.length; i < length; i++) {
            currentPart = parts[i];
            parent[currentPart] = parent[currentPart] || {};
            parent = parent[currentPart];
        }
    
        return parent;        
    }
    
    result.setAttribute = function(object, attribute, value) {
        var parts = attribute.split('.'),
        parent = object,
        currentPart = '';   
        for(var i = 0, length = parts.length; i < length - 1; i++) {
            currentPart = parts[i];
            parent[currentPart] = parent[currentPart] || {};
            parent = parent[currentPart];
        }
        parent[parts[length-1]] = value;
    }
    result.merge = function(object1, object2) {
        for (var name in object2) {
            object1[name] = object2[name];
        }
        return object1;
    }
    
    result.isAbsoluteUri = function(uri) {
        return (uri.lastIndexOf("http", 0) === 0);
    }
    
    result.Error = function(message) {
        this.message = message;
    };
    
    result.getQueryStringParam = function(url, name) {
        var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
        if (!results) { 
            return ""; 
        }
        return results[1] || 0;
    }
    
    result.getCurrentPath = function() {
        var url = window.location.href.replace(window.location.hash, "");
        return url.substring(0, url.lastIndexOf("/"));
    }
    
    return result;
});
define('Config',['Util'], function(Util) {
    var result = {};
    /**
     * Auth modes
     */
    result.authMode = {
        // Shows a POPUP with the login form
        POPUP: "POPUP",
        // Shows an IFRAME with the login form
        IFRAME: "IFRAME",
        // Shows the login form in a new window/tab
        WINDOW: "WINDOW",
        // Manual mode. The client app uses the data and methods provided to implement the process itself (see AuthManualView.js)
        MANUAL: "MANUAL"
    }
    
    /**
     * Configuration params and constants
     */
    result.config = {
        AUTH_FRAME_ID: "drApiAuthFrame", 
        DEFAULT_REDIRECT_URI: Util.getCurrentPath() + "/drapi-auth.html",
        EDIT_ACCOUNT_FRAME_ID: "drEditAccountFrame",
        EDIT_ACCOUNT_REDIRECT_URI: Util.getCurrentPath() + "/drapi-editaccount.html"
    }
    
    /**
     * Connection Request constants required
     */
    result.connection = {};
    result.connection.URI = {
        BASE_URL: null,
        DEV_BASE_URL: 'https://api.digitalriver.com/',
        PRD_BASE_URL: 'https://api.digitalriver.com/',
        // DEV_BASE_URL: 'https://api.digitalriver.com/',
        // PRD_BASE_URL: 'https://api.digitalriver.com/',
        VERSION: 'v1',
        ANONYMOUS_LOGIN: 'oauth20/token',
        LOGIN: 'oauth20/authorize'
    };
    
    result.connection.TYPE = {
        XML: '1',
        JSON: '2',
        TEXT: '3',
        UNSIGNED_BYTES: '4'
    };
    
    /**
     * URI Constants required by the Services
     */
    result.service = {};
    result.service.URI = {
        CATEGORIES: 'shoppers/me/categories',
        PRODUCTS: 'shoppers/me/products',
        PRODUCTS_BY_CATEGORY: 'shoppers/me/categories/{categoryId}/products',
        OFFERS: 'shoppers/me/point-of-promotions/{popName}/offers',
        PRODUCT_OFFERS: 'shoppers/me/point-of-promotions/{popName}/offers/{offerId}/product-offers',
        PRODUCTS_SEARCH: '/shoppers/me/product-search',
        CART: 'shoppers/me/carts/active',
        CART_LINE_ITEMS: 'shoppers/me/carts/active/line-items',
        CART_OFFERS: 'shoppers/me/carts/active/point-of-promotions/{popName}/offers',
        CART_APPLY_SHOPPER: 'shoppers/me/carts/active/apply-shopper',
        CART_SHIPPING_OPTIONS: 'shoppers/me/carts/active/shipping-options',
        CART_APPLY_SHIPPING_OPTION: 'shoppers/me/carts/active/apply-shipping-option',
        SHOPPER:'shoppers/me',
        SHOPPER_PAYMENT_OPTION:'shoppers/me/payment-options',
        SHOPPER_ACCOUNT: 'shoppers/me/account',
        ORDERS:'shoppers/me/orders',
        ORDER_SHIPPING_ADDRESS:'shoppers/me/orders/{orderId}/shipping-address',
        ORDER_BILLING_ADDRESS:'shoppers/me/orders/{orderId}/billing-address',
        ADDRESS:'shoppers/me/addresses'
    }
    
    return result;
});
// vim:ts=4:sts=4:sw=4:
/*jshint browser: true, node: true,
  curly: true, eqeqeq: true, noarg: true, nonew: true, trailing: true,
  undef: true
 */
/*global define: false, Q: true, msSetImmediate: true, setImmediate: true,
  MessageChannel: true */
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function (definition) {

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // RequireJS
    if (typeof define === "function") {
        define('q',[],definition);

    // CommonJS
    } else if (typeof exports === "object") {
        definition(void 0, exports);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = function () {
                var Q = {};
                return definition(void 0, Q);
            };
        }

    // <script>
    } else {
        definition(void 0, Q = {});
    }

})(function (require, exports) {


// shims

// used for fallback "defend" and in "allResolved"
var noop = function () {};

// for the security conscious, defend may be a deep freeze as provided
// by cajaVM.  Otherwise we try to provide a shallow freeze just to
// discourage promise changes that are not compatible with secure
// usage.  If Object.freeze does not exist, fall back to doing nothing
// (no op).
var defend = Object.freeze || noop;
if (typeof cajaVM !== "undefined") {
    defend = cajaVM.def;
}

// use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick;
if (typeof process !== "undefined") {
    // node
    nextTick = process.nextTick;
} else if (typeof msSetImmediate === "function") {
    // IE 10 only, at the moment
    nextTick = msSetImmediate;
} else if (typeof setImmediate === "function") {
    // https://github.com/NobleJS/setImmediate
    nextTick = setImmediate;
} else if (typeof MessageChannel !== "undefined") {
    // modern browsers
    // http://www.nonblocking.io/2011/06/windownexttick.html
    var channel = new MessageChannel();
    // linked list of tasks (single, with head node)
    var head = {}, tail = head;
    channel.port1.onmessage = function () {
        head = head.next;
        var task = head.task;
        delete head.task;
        task();
    };
    nextTick = function (task) {
        tail = tail.next = {task: task};
        channel.port2.postMessage(0);
    };
} else {
    // old browsers
    nextTick = function (task) {
        setTimeout(task, 0);
    };
}

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this does have the nice side-effect of reducing the size
// of the code by reducing x.call() to merely x(), eliminating many
// hard-to-minify characters.
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var uncurryThis;
// I have kept both variations because the first is theoretically
// faster, if bind is available.
if (Function.prototype.bind) {
    var Function_bind = Function.prototype.bind;
    uncurryThis = Function_bind.bind(Function_bind.call);
} else {
    uncurryThis = function (f) {
        return function (thisp) {
            return f.call.apply(f, arguments);
        };
    };
}

var Array_slice = uncurryThis(Array.prototype.slice);

var Array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var Object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var Object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        keys.push(key);
    }
    return keys;
};

var Object_toString = Object.prototype.toString;

function isStopIteration(exception) {
    return (
        Object_toString(exception) === "[object StopIteration]" ||
        exception instanceof ReturnValue
    );
}

if (typeof ReturnValue === "undefined") {
    new Function("return this")().ReturnValue = function (value) {
        this.value = value;
    };
}

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
exports.nextTick = nextTick;

/**
 * Constructs a {promise, resolve} object.
 *
 * The resolver is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke the resolver with any value that is
 * not a function. To reject the promise, invoke the resolver with a rejection
 * object. To put the promise in the same state as another promise, invoke the
 * resolver with that other promise.
 */
exports.defer = defer;
function defer() {
    // if "pending" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the pending array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the ref promise because it handles both fully
    // resolved values and other promises gracefully.
    var pending = [], value;

    var deferred = Object_create(defer.prototype);
    var promise = Object_create(makePromise.prototype);

    promise.promiseSend = function () {
        var args = Array_slice(arguments);
        if (pending) {
            pending.push(args);
        } else {
            nextTick(function () {
                value.promiseSend.apply(value, args);
            });
        }
    };

    promise.valueOf = function () {
        if (pending) {
            return promise;
        }
        return value.valueOf();
    };

    function become(resolvedValue) {
        if (!pending) {
            return;
        }
        value = resolve(resolvedValue);
        Array_reduce(pending, function (undefined, pending) {
            nextTick(function () {
                value.promiseSend.apply(value, pending);
            });
        }, void 0);
        pending = void 0;
        return value;
    }

    defend(promise);

    deferred.promise = promise;
    deferred.resolve = become;
    deferred.reject = function (exception) {
        return become(reject(exception));
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.node = // XXX deprecated
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(Array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param makePromise {Function} a function that returns nothing and accepts
 * the resolve and reject functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in makePromise
 */
exports.promise = promise;
function promise(makePromise) {
    var deferred = defer();
    call(
        makePromise,
        void 0,
        deferred.resolve,
        deferred.reject
    ).fail(deferred.reject);
    return deferred.promise;
}

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * put(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
exports.makePromise = makePromise;
function makePromise(descriptor, fallback, valueOf, rejected) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error("Promise does not support operation: " + op));
        };
    }

    var promise = Object_create(makePromise.prototype);

    promise.promiseSend = function (op, resolved /* ...args */) {
        var args = Array_slice(arguments, 2);
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.apply(promise, [op].concat(args));
            }
        } catch (exception) {
            result = reject(exception);
        }
        resolved(result);
    };

    if (valueOf) {
        promise.valueOf = valueOf;
    }

    if (rejected) {
        promise.promiseRejected = true;
    }

    defend(promise);

    return promise;
}

// provide thenables, CommonJS/Promises/A
makePromise.prototype.then = function (fulfilled, rejected) {
    return when(this, fulfilled, rejected);
};

// Chainable methods
Array_reduce(
    [
        "isResolved", "isFulfilled", "isRejected",
        "when", "spread", "send",
        "get", "put", "del",
        "post", "invoke",
        "keys",
        "apply", "call", "bind",
        "fapply", "fcall", "fbind",
        "all", "allResolved",
        "view", "viewInfo",
        "timeout", "delay",
        "catch", "finally", "fail", "fin", "end"
    ],
    function (prev, name) {
        makePromise.prototype[name] = function () {
            return exports[name].apply(
                exports,
                [this].concat(Array_slice(arguments))
            );
        };
    },
    void 0
);

makePromise.prototype.toSource = function () {
    return this.toString();
};

makePromise.prototype.toString = function () {
    return "[object Promise]";
};

defend(makePromise.prototype);

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */
exports.nearer = valueOf;
function valueOf(value) {
    // if !Object.isObject(value)
    if (Object(value) !== value) {
        return value;
    } else {
        return value.valueOf();
    }
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
exports.isPromise = isPromise;
function isPromise(object) {
    return object && typeof object.promiseSend === "function";
}

/**
 * @returns whether the given object is a resolved promise.
 */
exports.isResolved = isResolved;
function isResolved(object) {
    return isFulfilled(object) || isRejected(object);
}

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
exports.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(valueOf(object));
}

/**
 * @returns whether the given object is a rejected promise.
 */
exports.isRejected = isRejected;
function isRejected(object) {
    object = valueOf(object);
    return object && !!object.promiseRejected;
}

var rejections = [];
var errors = [];
if (typeof window !== "undefined") {
    // This promise library consumes exceptions thrown in handlers so
    // they can be handled by a subsequent promise.  The rejected
    // promises get added to this array when they are created, and
    // removed when they are handled.
    console.log("Should be empty:", errors);
}

/**
 * Constructs a rejected promise.
 * @param exception value describing the failure
 */
exports.reject = reject;
function reject(exception) {
    var rejection = makePromise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                var at = rejections.indexOf(this);
                if (at !== -1) {
                    errors.splice(at, 1);
                    rejections.splice(at, 1);
                }
            }
            return rejected ? rejected(exception) : reject(exception);
        }
    }, function fallback(op) {
        return reject(exception);
    }, function valueOf() {
        return reject(exception);
    }, true);
    // note that the error has not been handled
    rejections.push(rejection);
    errors.push(exception);
    return rejection;
}

/**
 * Constructs a promise for an immediate reference.
 * @param value immediate reference
 */
exports.begin = resolve; // XXX experimental
exports.resolve = resolve;
exports.ref = resolve; // XXX deprecated, use resolve
function resolve(object) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (isPromise(object)) {
        return object;
    }
    // assimilate thenables, CommonJS/Promises/A
    if (object && typeof object.then === "function") {
        var result = defer();
        object.then(result.resolve, result.reject);
        return result.promise;
    }
    return makePromise({
        "when": function (rejected) {
            return object;
        },
        "get": function (name) {
            return object[name];
        },
        "put": function (name, value) {
            return object[name] = value;
        },
        "del": function (name) {
            return delete object[name];
        },
        "post": function (name, value) {
            return object[name].apply(object, value);
        },
        "apply": function (self, args) {
            return object.apply(self, args);
        },
        "fapply": function (args) {
            return object.apply(void 0, args);
        },
        "viewInfo": function () {
            var on = object;
            var properties = {};

            function fixFalsyProperty(name) {
                if (!properties[name]) {
                    properties[name] = typeof on[name];
                }
            }

            while (on) {
                Object.getOwnPropertyNames(on).forEach(fixFalsyProperty);
                on = Object.getPrototypeOf(on);
            }
            return {
                "type": typeof object,
                "properties": properties
            };
        },
        "keys": function () {
            return keys(object);
        }
    }, void 0, function valueOf() {
        return object;
    });
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
exports.master = master;
function master(object) {
    return makePromise({
        "isDef": function () {}
    }, function fallback(op) {
        var args = Array_slice(arguments);
        return send.apply(void 0, [object].concat(args));
    }, function () {
        return valueOf(object);
    });
}

exports.viewInfo = viewInfo;
function viewInfo(object, info) {
    object = resolve(object);
    if (info) {
        return makePromise({
            "viewInfo": function () {
                return info;
            }
        }, function fallback(op) {
            var args = Array_slice(arguments);
            return send.apply(void 0, [object].concat(args));
        }, function () {
            return valueOf(object);
        });
    } else {
        return send(object, "viewInfo");
    }
}

exports.view = view;
function view(object) {
    return viewInfo(object).when(function (info) {
        var view;
        if (info.type === "function") {
            view = function () {
                return apply(object, void 0, arguments);
            };
        } else {
            view = {};
        }
        var properties = info.properties || {};
        Object_keys(properties).forEach(function (name) {
            if (properties[name] === "function") {
                view[name] = function () {
                    return post(object, name, arguments);
                };
            }
        });
        return resolve(view);
    });
}

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value     promise or immediate reference to observe
 * @param fulfilled function to be called with the fulfilled value
 * @param rejected  function to be called with the rejection exception
 * @return promise for the return value from the invoked callback
 */
exports.when = when;
function when(value, fulfilled, rejected) {
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return fulfilled ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        try {
            return rejected ? rejected(exception) : reject(exception);
        } catch (exception) {
            return reject(exception);
        }
    }

    nextTick(function () {
        resolve(value).promiseSend("when", function (value) {
            if (done) {
                return;
            }
            done = true;
            resolve(value).promiseSend("when", function (value) {
                deferred.resolve(_fulfilled(value));
            }, function (exception) {
                deferred.resolve(_rejected(exception));
            });
        }, function (exception) {
            if (done) {
                return;
            }
            done = true;
            deferred.resolve(_rejected(exception));
        });
    });

    return deferred.promise;
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
exports.spread = spread;
function spread(promise, fulfilled, rejected) {
    return when(promise, function (values) {
        return fulfilled.apply(void 0, values);
    }, rejected);
}

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  This presently only works in
 * Firefox/Spidermonkey, however, this code does not cause syntax
 * errors in older engines.  This code should continue to work and
 * will in fact improve over time as the language improves.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 *  - in present implementations of generators, when a generator
 *    function is complete, it throws ``StopIteration``, ``return`` is
 *    a syntax error in the presence of ``yield``, so there is no
 *    observable return value. There is a proposal[1] to add support
 *    for ``return``, which would permit the value to be carried by a
 *    ``StopIteration`` instance, in which case it would fulfill the
 *    promise returned by the asynchronous generator.  This can be
 *    emulated today by throwing StopIteration explicitly with a value
 *    property.
 *
 *  [1]: http://wiki.ecmascript.org/doku.php?id=strawman:async_functions#reference_implementation
 *
 */
exports.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;
            try {
                result = generator[verb](arg);
            } catch (exception) {
                if (isStopIteration(exception)) {
                    return exception.value;
                } else {
                    return reject(exception);
                }
            }
            return when(result, callback, errback);
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "send");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 * Only useful presently in Firefox/SpiderMonkey since generators are
 * implemented.
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
exports['return'] = _return;
function _return(value) {
    throw new ReturnValue(value);
}

/**
 * Constructs a promise method that can be used to safely observe resolution of
 * a promise for an arbitrarily named method like "propfind" in a future turn.
 */
exports.sender = sender; // XXX deprecated, use dispatcher
exports.Method = sender; // XXX deprecated, use dispatcher
function sender(op) {
    return function (object) {
        var args = Array_slice(arguments, 1);
        return send.apply(void 0, [object, op].concat(args));
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param ...args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
exports.send = send; // XXX deprecated, use dispatch
function send(object, op) {
    var deferred = defer();
    var args = Array_slice(arguments, 2);
    object = resolve(object);
    nextTick(function () {
        object.promiseSend.apply(
            object,
            [op, deferred.resolve].concat(args)
        );
    });
    return deferred.promise;
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
exports.dispatch = dispatch;
function dispatch(object, op, args) {
    var deferred = defer();
    object = resolve(object);
    nextTick(function () {
        object.promiseSend.apply(
            object,
            [op, deferred.resolve].concat(args)
        );
    });
    return deferred.promise;
}

/**
 * Constructs a promise method that can be used to safely observe resolution of
 * a promise for an arbitrarily named method like "propfind" in a future turn.
 *
 * "dispatcher" constructs methods like "get(promise, name)" and "put(promise)".
 */
exports.dispatcher = dispatcher;
function dispatcher(op) {
    return function (object) {
        var args = Array_slice(arguments, 1);
        return dispatch(object, op, args);
    };
}

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
exports.get = dispatcher("get");

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
exports.put = dispatcher("put");

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
exports["delete"] = // XXX experimental
exports.del = dispatcher("del");

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
var post = exports.post = dispatcher("post");

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
exports.invoke = function (value, name) {
    var args = Array_slice(arguments, 2);
    return post(value, name, args);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param thisp     the `this` object for the call
 * @param args      array of application arguments
 */
var apply = exports.apply = dispatcher("apply"); // XXX deprecated, use fapply

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
var fapply = exports.fapply = dispatcher("fapply");

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param thisp     the `this` object for the call
 * @param ...args   array of application arguments
 */
exports.call = call; // XXX deprecated, use fcall
function call(value, thisp) {
    var args = Array_slice(arguments, 2);
    return apply(value, thisp, args);
}

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
exports["try"] = fcall; // XXX experimental
exports.fcall = fcall;
function fcall(value) {
    var args = Array_slice(arguments, 1);
    return fapply(value, args);
}

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param thisp   the `this` object for the call
 * @param ...args   array of application arguments
 */
exports.bind = bind; // XXX deprecated, use fbind
function bind(value, thisp) {
    var args = Array_slice(arguments, 2);
    return function bound() {
        var allArgs = args.concat(Array_slice(arguments));
        return apply(value, thisp, allArgs);
    };
}

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
exports.fbind = fbind;
function fbind(value) {
    var args = Array_slice(arguments, 1);
    return function fbound() {
        var allArgs = args.concat(Array_slice(arguments));
        return fapply(value, allArgs);
    };
}

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually resolved object
 */
exports.keys = dispatcher("keys");

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
exports.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var countDown = promises.length;
        if (countDown === 0) {
            return resolve(promises);
        }
        var deferred = defer();
        Array_reduce(promises, function (undefined, promise, index) {
            when(promise, function (value) {
                promises[index] = value;
                if (--countDown === 0) {
                    deferred.resolve(promises);
                }
            })
            .fail(deferred.reject);
        }, void 0);
        return deferred.promise;
    });
}

/**
 * Waits for all promises to be resolved, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
exports.allResolved = allResolved;
function allResolved(promises) {
    return when(promises, function (promises) {
        return when(all(promises.map(function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises.map(resolve);
        });
    });
}

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
exports["catch"] = // XXX experimental
exports.fail = fail;
function fail(promise, rejected) {
    return when(promise, void 0, rejected);
}

/**
 * Provides an opportunity to observe the rejection of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
exports["finally"] = // XXX experimental
exports.fin = fin;
function fin(promise, callback) {
    return when(promise, function (value) {
        return when(callback(), function () {
            return value;
        });
    }, function (exception) {
        return when(callback(), function () {
            return reject(exception);
        });
    });
}

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
exports.end = end; // XXX stopgap
function end(promise) {
    when(promise, void 0, function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        nextTick(function () {
            throw error;
        });
    });
}

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
exports.timeout = timeout;
function timeout(promise, ms) {
    var deferred = defer();
    when(promise, deferred.resolve, deferred.reject);
    setTimeout(function () {
        deferred.reject(new Error("Timed out after " + ms + "ms"));
    }, ms);
    return deferred.promise;
}

/**
 * Returns a promise for the given value (or promised value) after some
 * milliseconds.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after some
 * time has elapsed.
 */
exports.delay = delay;
function delay(promise, timeout) {
    if (timeout === void 0) {
        timeout = promise;
        promise = void 0;
    }
    var deferred = defer();
    setTimeout(function () {
        deferred.resolve(promise);
    }, timeout);
    return deferred.promise;
}

/**
 * Passes a continuation to a Node function, which is called with a given
 * `this` value and arguments provided as an array, and returns a promise.
 *
 *      var FS = require("fs");
 *      Q.napply(FS.readFile, FS, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
exports.napply = napply;
function napply(callback, thisp, args) {
    return nbind(callback).apply(thisp, args);
}

/**
 * Passes a continuation to a Node function, which is called with a given
 * `this` value and arguments provided individually, and returns a promise.
 *
 *      var FS = require("fs");
 *      Q.ncall(FS.readFile, FS, __filename)
 *      .then(function (content) {
 *      })
 *
 */
exports.ncall = ncall;
function ncall(callback, thisp /*, ...args*/) {
    var args = Array_slice(arguments, 2);
    return napply(callback, thisp, args);
}

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 *
 *      Q.nbind(FS.readFile, FS)(__filename)
 *      .then(console.log)
 *      .end()
 *
 */
exports.nbind = nbind;
function nbind(callback /* thisp, ...args*/) {
    if (arguments.length > 1) {
        var args = Array_slice(arguments, 1);
        callback = callback.bind.apply(callback, args);
    }
    return function () {
        var deferred = defer();
        var args = Array_slice(arguments);
        // add a continuation that resolves the promise
        args.push(deferred.makeNodeResolver());
        // trap exceptions thrown by the callback
        fapply(callback, args)
        .fail(deferred.reject);
        return deferred.promise;
    };
}

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
exports.npost = npost;
function npost(object, name, args) {
    return napply(object[name], name, args);
}

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
exports.ninvoke = ninvoke;
function ninvoke(object, name /*, ...args*/) {
    var args = Array_slice(arguments, 2);
    return napply(object[name], name, args);
}

defend(exports);

});

define('view/EditAccountIFrameView',['Config'], function(Config) {
    /**
     * IFrame auth view.
     * Opens an IFrame inside the specified DOM Element (using the parent size).
     * Visually, it looks like the login form is part of the application
     * 
     */
    var EditAccountIFrameView = function(uri, redirectUri, options) {
        this.uri = uri + "?redirect_uri=" + encodeURIComponent(redirectUri);
        this.id = Config.config.EDIT_ACCOUNT_FRAME_ID;
        this.parentElementId = options.elementId;
    }
    
    /**
     * Opens the IFrame
     */
    EditAccountIFrameView.prototype.open = function(reqToken, onViewLoadedCallback) {
        var iframe = document.getElementById(this.id);
        if(!iframe) {
            iframe = this.create();
        } 
        
        var finalUri = this.uri + "&token=" + reqToken + "&Env=DESIGN"; 
        iframe.onload = function() {
            if(this.src == finalUri) {
                if(onViewLoadedCallback) {
                    onViewLoadedCallback();
                }
            }
        }
        iframe.src = finalUri;
    }
    
    /**
     * Removes the IFrame when finished
     */
    EditAccountIFrameView.prototype.close = function() {
        console.log("Closing Edit Account IFrame");
        var iframe = document.getElementById(this.id);
        
        if(iframe) {
            iframe.parentNode.removeChild(iframe);
        }
    }
    
    /**
     * Creates a new IFrame with the correct properties
     */
    EditAccountIFrameView.prototype.create = function() {
        var iframe = document.createElement("iframe");
        iframe.id = this.id;   
        iframe.width = "100%";
        iframe.height = "100%";
        iframe.style.margin="auto";
        iframe.style.border="none";
        iframe.scrolling = "auto";
        
        var parent = (this.parentElementId != "")? document.getElementById(this.parentElementId) : document.body; 
        parent.appendChild(iframe);
        
        return iframe;
    }
    
    return EditAccountIFrameView;
});
define('service/ShopperService',['service/BaseService', 'Config', 'q', 'view/EditAccountIFrameView'], function(BaseService, Config, Q, EditAccountIFrameView) {
    /**
     * Service Manager for Shopper Resource
     */
    var ShopperService = BaseService.extend({
        
        uri: Config.service.URI.SHOPPER,
        
        /**
         * get Shopper 
         */
        get: function(parameters, callbacks) {
            return this.makeRequest(this.session.retrieve(this.uri, parameters), callbacks);
        },    
    
        /**
         * get Shopper Addresses
         */
        getAddresses:function(parameters, callbacks){
            var uri = Config.service.URI.ADDRESS;       
            return this.makeRequest(this.session.retrieve(uri, parameters), callbacks);
        },
        
        /**
         * Gets the payment options for the shopper
         */
        getPaymentOptions: function(parameters, callbacks){
            var uri = Config.service.URI.SHOPPER_PAYMENT_OPTION; 
            return this.makeRequest(this.session.retrieve(uri, parameters), callbacks);
        },
        
        /**
         * Edit shopper account
         */
        editAccount: function(options, callbacks, editViewLoadedCallback){
            
            var uri = Config.connection.URI.BASE_URL + Config.connection.URI.VERSION + "/" + Config.service.URI.SHOPPER_ACCOUNT; 
            var defer = Q.defer();
            var redirectUri = Config.config.EDIT_ACCOUNT_REDIRECT_URI;
    
            this.view =  new EditAccountIFrameView(uri, redirectUri, options);
            ShopperService.currentRequest = {"defer": defer, "view": this.view};
            
            this.view.open(this.session.token, editViewLoadedCallback);
    
            return this.makeRequest(defer.promise, callbacks);
        }
            
    });
    
    /**
     * Callback used by the view (iframe or window) to notify the library when it finished
     */
    ShopperService.editCallback= function() {
        var req = ShopperService.currentRequest;
        if(req) {
            req.view.close();
            req.view = null;        
            ShopperService.currentRequest = null;
            window.focus();
            req.defer.resolve();
        }
    }
    
    return ShopperService;
});
/**
 * Common Functions for AuthViews
 */
define('view/AuthViewUtil',[], function() {
    return {
        /**
         * Builds the URI using the parameters
         */
        buildUriFromOptions: function(uri, redirectUri, options) {
            var resultUri = uri + "?redirect_uri=" + encodeURIComponent(redirectUri)
                + "&response_type=token" + "&client_id=" + options.client_id;
            
            return resultUri;
        },
        
        /**
         * Returns an URI with the corresponding anonymous token addded to it
         */
        getUriWithToken: function(uri, reqToken) {
            var finalUri = uri + "&dr_limited_token=" + reqToken;
            return finalUri;
        }        
    }

});
define('view/AuthWindowView',['view/AuthViewUtil', 'Config'], function(Util, Config) {
    /**
     * Window auth view.
     * It opens a new window or tab with the login form and closes it when finished 
     * 
     */
    var AuthWindowView = function(uri, redirectUri, options) {
        this.uri = Util.buildUriFromOptions(uri, redirectUri, options);
        this.id = Config.config.AUTH_FRAME_ID;
    }
    
    /**
     * Opens the new window/tab with the login form
     */
    AuthWindowView.prototype.open = function(reqToken, onViewLoadedCallback) {
        if(this.popup) {
            this.close();
        }
        
        var finalUri = Util.getUriWithToken(this.uri, reqToken);
        this.popup = window.open(finalUri, this.id);
        
        this.popup.focus();  
    }
    
    /**
     * Closes the login form window
     */
    AuthWindowView.prototype.close = function() {
        console.log("Closing Auth popup");
        if(this.popup) {
            this.popup.close();
            this.popup = null;
        }
    }
    
    return AuthWindowView;
});
define('view/AuthIFrameView',['view/AuthViewUtil', 'Config'], function(Util, Config) {
    /**
     * IFrame auth view.
     * Opens an IFrame inside the specified DOM Element (using the parent size).
     * Visually, it looks like the login form is part of the application
     * 
     */
    var AuthIFrameView = function(uri, redirectUri, options) {
        this.uri = Util.buildUriFromOptions(uri, redirectUri, options);
        this.id = Config.config.AUTH_FRAME_ID;
        this.parentElementId = options.elementId;
    }
    
    /**
     * Opens the IFrame
     */
    AuthIFrameView.prototype.open = function(reqToken, onViewLoadedCallback) {
        var authFrame = document.getElementById(this.id);
        if(!authFrame) {
            authFrame = this.create();
        } 
        
        var finalUri = Util.getUriWithToken(this.uri, reqToken); 
        authFrame.onload = function() {
            if(this.src == finalUri) {
                if(onViewLoadedCallback) {
                    onViewLoadedCallback();
                }
            }
        }
        authFrame.src = finalUri;
    }
    
    /**
     * Removes the IFrame when finished
     */
    AuthIFrameView.prototype.close = function() {
        console.log("Closing Auth IFrame");
        var iframe = document.getElementById(this.id);
        
        if(iframe) {
            iframe.parentNode.removeChild(iframe);
        }
    }
    
    /**
     * Creates a new IFrame with the correct properties
     */
    AuthIFrameView.prototype.create = function() {
        var authFrame = document.createElement("iframe");
        authFrame.id = this.id;   
        authFrame.width = "100%";
        authFrame.height = "100%";
        authFrame.style.margin="auto";
        authFrame.style.border="none";
        authFrame.scrolling = "auto";
        
        var parent = (this.parentElementId != "")? document.getElementById(this.parentElementId) : document.body; 
        parent.appendChild(authFrame);
        
        return authFrame;
    }
    
    AuthIFrameView.prototype.AddOnLoadedHandler = function() {
        authFrame
    }
    
    return AuthIFrameView;
});
define('view/AuthManualView',['view/AuthViewUtil', 'Config'], function(Util, Config) {
    /**
     * IFrame manual view.
     * Empty view used when the client app handles the UI portion of the logic process
     * It will call a callback with the required info to perform the login
     * 
     * The client app should call the client.login() method with a onDataReadyCallback callback, that callback will include this manual view
     * The process can be performed using the view's .uri attribute and the setResults(token, expires_in) 
     * or setError(error, error_description) methods 
     */
    var AuthManualView = function(uri, redirectUri, options) {
        this.uri = Util.buildUriFromOptions(uri, redirectUri, options);
    }
    
    /**
     * Calls the passed callback with this "view" as parameter
     */
    AuthManualView.prototype.open = function(reqToken, onDataReadyCallback) {
        if(onDataReadyCallback) {
            onDataReadyCallback(this);
        }
    }
    
    /**
     * Does nothing
     */
    AuthManualView.prototype.close = function() {
    }
    
    /**
     * Completes the process with the passed results (collected by the client app)
     */
    AuthManualView.prototype.setResults = function(token, expires_in) {
        dr.api.callbacks.auth(token, expires_in, null, null);
    }
    
    /**
     * Finishes the process with the passed error (collected by the client app)
     */
    AuthManualView.prototype.setError = function(error, error_description) {
        dr.api.callbacks.auth(null, null, error, error_description);
    }
    
    
    return AuthManualView;
});
define('auth/AuthManager',['q', 'view/AuthWindowView', 'view/AuthIFrameView', 'view/AuthManualView'], function(Q, AuthWindowView, AuthIFrameView, AuthManualView) {
    /**
     * This class handles Authentication/Authorization by opening a auth view (new window/tab or iframe)
     * 
     */
    var AuthManager = function(authUri, options) {
        this.redirectUri = options.authRedirectUrl;
        this.uri = authUri;
        
        this.views = {
            "IFRAME": AuthIFrameView,
            "WINDOW": AuthWindowView,
            "MANUAL": AuthManualView
        };
        
        this.view = this.createView(options.strategy, options);
    }
    
    /**
     * Creates the appropiate view according to the configuration
     */
    AuthManager.prototype.createView = function(strategy, options) {
        return new this.views[strategy](this.uri, this.redirectUri, options);
    }
    
    /**
     * Initializes the login process
     * @param reqToken Anonymous token identifying the current session 
     * @returns Promise to handle a successful auth
     */
    AuthManager.prototype.login = function(reqToken, onViewLoadedCallback) {
        var defer = Q.defer();
        AuthManager.currentRequest = {"defer": defer, "view": this.view};
        this.view.open(reqToken, onViewLoadedCallback);
        return defer.promise;
    }
    
    /**
     * Callback used by the view (iframe or window) to notify the library when it finished
     */
    AuthManager.authCallback = function(token, expiresIn, error, error_description) {
        var req = AuthManager.currentRequest;
        if(req) {
            req.view.close();
            req.view = null;        
            AuthManager.currentRequest = null;
            window.focus();
            if(!error){
                var response = {"token": token, "expires_in": expiresIn};
                req.defer.resolve(response);
            }
            else{
                var errorResponse = {"error": error, "error_description": error_description}
                req.defer.reject(errorResponse);
            }
        }
    }
    
    AuthManager.getError = function(error) {
        switch (error) {
            case "invalid_request":
                return {"error": error, "error_description": "Invalid Request. Please check the parameters."};
                break;
            
        }
    }

    return AuthManager;
});
define('Ajax',['q'], function(Q) {
    var result = {};
    /**
     * Implementation of a resource request through an URI with Ajax 
     * avoiding the use of JQuery library
     */
    result.doAjax = function(url, method, urlParams, headerParams, body) {
    	var defer = Q.defer();
    	var req = this.createRequest(); // XMLHTTPRequest object instance
    	
    	req.onreadystatechange  = function() {
    		if(req.readyState == 4) {
    			
    			var data = req.responseText;
                
                if(data != "") {
                    data = JSON.parse(data);
                }
    			if(req.status != "" && req.status < 300) {
    			    defer.resolve(data);
    			} else {
    			    var error = data.Exception?data.Exception.Error:data;
    			    defer.reject({status: req.status, error: error});
    			}
    		}
    	}
    	
    	this.sendRequest(url, method, urlParams, headerParams, req, body);
    	return defer.promise;
    }
    
    /**
     * Creates an XMLHttpRequest object
     * @returns {XMLHttpRequest}
     */
    result.createRequest = function() {
    	try {
    		req = new XMLHttpRequest(); /* e.g. Firefox */
    	} catch(err1)  {
    		try {
    			req = new ActiveXObject('Msxml2.XMLHTTP');
    			/* some versions IE */
    		} catch(err2) {
    			try {
    				req = new ActiveXObject('Microsoft.XMLHTTP');
    				/* some versions IE */
    			} catch(err3) {
    				req = false;
    			}
    		}
    	}
    	return req;
    }
    
    /**
     * Request open and send
     */
    result.sendRequest = function(url, method, urlParams, headerParams, req, body) {
        // Add timestamp so the request is not cached
        urlParams = urlParams || {};
        urlParams["drapits"] = new Date().getTime();

    	// Get possible params and encode the query
    	var queryString = this.utf8Encode(this.getQueryString(urlParams));
    	var uri = url;
    	if(queryString != "") {
    	    uri += (url.indexOf("?") > 0?"&":"?") + queryString;
    	}
    	req.open(method, uri, true);
    
    	req = this.setHeader(headerParams, req);
    	
    	if(body) {
    	    var contentType = headerParams["Content-Type"];
    	    if(contentType == "application/x-www-form-urlencoded") {
    	        body = this.utf8Encode(this.getQueryString(body));
    	    }
    		req.send(body);
    	}else{
    		req.send();
    	}
    }
    
    /**
     * Set url params
     */
    result.getQueryString = function(params){
    	
        var qs = ""
        for (var name in params) {
            if(name) {
            	qs += name + '=' + params[name] + "&";
            }
        }
        return qs.substring(0,qs.length-1);
    }
    
    /**
     * Get params from url
     */
    /*
    ns.getUrlParams = function(url){
    	
    	var obj = {};
      	var param = {}; 
    	var result = {};
        var params = url.split('?')[1];
        params = params.split('&');
        
        for (var pos=0; pos < params.length; pos++) {
        	var param = params[pos].split('=');
        	obj[params[pos].split('=')] = params[pos].split('')[1];
        	result.push(obj);
        }
        return result;
    }*/
    
    /**
     * Set request header params
     */
    result.setHeader = function(params, req){
    	
    	// Set default header fields
    	req.setRequestHeader('Accept', 'application/json');
    	
        for (var name in params) {
        	req.setRequestHeader(name, params[name]);
        }	
        return req;
    }
    
    /**
     * Url encoder
     */
    result.utf8Encode = function (string) {
    	string = string.replace(/\r\n/g,"\n");
    	var utftext = "";
     
    	for (var n = 0; n < string.length; n++) {
     
    		var c = string.charCodeAt(n);
    		if (c < 128) {
    			utftext += String.fromCharCode(c);
    		}
    		else if((c > 127) && (c < 2048)) {
    			utftext += String.fromCharCode((c >> 6) | 192);
    			utftext += String.fromCharCode((c & 63) | 128);
    		}
    		else {
    			utftext += String.fromCharCode((c >> 12) | 224);
    			utftext += String.fromCharCode(((c >> 6) & 63) | 128);
    			utftext += String.fromCharCode((c & 63) | 128);
    		}
     	}
    	return utftext;
    };
    
    /**
     * is empty common function
     */
    result.isEmpty = function(map) {
       for(var key in map) return false;
       return true;
    }
    
    return result;

});
define('connection/Connection',['Config', 'Ajax', 'Util'], function(Config, Ajax, Util) {
    /**
     * This object is for the Apigee connection. It will provide
     * CRUD calls for the resources required 
     */
    var Connection = function(){
        console.log("Using real Connection");
        this.baseUrl = Config.connection.URI.BASE_URL + Config.connection.URI.VERSION + "/";
    }
    
    /**
     * Create
     */
    Connection.prototype.create = function(uri, urlParams, headerParams, body){
        return this.request(uri, 'POST', urlParams, headerParams, body);
    }
    
    /**
     * Retrieve
     */
    Connection.prototype.retrieve = function(uri, urlParams, headerParams, body){
        return this.request(uri, 'GET', urlParams, headerParams, body);
    }
    
    /**
     * Update
     */
    Connection.prototype.update = function(uri, urlParams, headerParams){
        return this.request(uri, 'PUT', urlParams, headerParams);
    }
    
    /**
     * Delete / Remove
     */
    Connection.prototype.remove = function(uri, urlParams, headerParams){
        return this.request(uri, 'DELETE', urlParams, headerParams);
    }
    
    /**
     * Submits a form
     */
    Connection.prototype.submitForm = function(uri, fields, headers) {
        headers = headers || {};
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        return this.request(uri, "POST", {}, headers, fields);
    }
    
    /**
     * Generic Request
     */
    Connection.prototype.request = function(uri, method, urlParams, headerParams, body) {
        if(!Util.isAbsoluteUri(uri)) {
            uri = this.baseUrl+uri;
        }
        return Ajax.doAjax(uri, method, urlParams, headerParams, body); 
    }
    
    return Connection;
});
define('connection/Session',['Config', 'connection/Connection', 'auth/AuthManager', 'q'], function(Config, Connection, AuthManager, Q) {
    /**
     * This object is for getting a Session for connecting
     * @returns {Session}
     */
    var Session = function(apikey, authOptions){
        this.apikey = apikey;
            
        this.connection = new Connection();
        this.authManager = new AuthManager(Config.connection.URI.BASE_URL + Config.connection.URI.LOGIN, authOptions);  
        
       this.reset();
    }
    
    /**
     * Creates a new error promise with the specified error message
     */
    Session.prototype.createErrorPromise = function(message) {
        console.log("Operation not allowed: " + message);
        var errorResponse = this.createServerErrorResponse();
        var d = Q.defer();
        d.reject(errorResponse);
        return d.promise;
    }
    
    /**
     * Creates a new error promise indicating the user must be connected before using the API
     */
    Session.prototype.createDisconnectedError = function() {
        return this.createErrorPromise("You must be connected to the server in order to use the API")
    }
    
    /**
     * Creates a server_error response
     */
    Session.prototype.createServerErrorResponse = function(){
        var errorResponse = {};
        var error = {};
        error.code = "server_error";
        error.description = "Service Temporaly Unavailable. Please try again later or contact the System Administrator.";
        errorResponse.status = 500;
        errorResponse.error = {};
        errorResponse.error.errors = {};
        errorResponse.error.errors.error = error;
        return errorResponse;
    }
    
    
    /**
     * Connection.create
     */
    Session.prototype.create = function(uri, urlParams){
    
        // Check if session is logged in
        if(!this.connected){
            return this.createDisconnectedError();
        }
        
        // Http Request Header fields for all Creations
        var headerParams = {};
        headerParams['Authorization'] = 'bearer ' + this.token;
        
        var promise = this.connection.create(uri, urlParams, headerParams)
                       .then(function(data) {
                           for(var name in data) {
                               if(name) {
                                   return data[name];
                               }
                           }
                       });
        
        return promise;
    }
    
    /**
     * Connection.retrieve
     */
    Session.prototype.remove = function(uri, urlParams){
    
        // Check if session is logged in
        if(!this.connected){
           return this.createDisconnectedError();
        }
        
        // Http Request Header fields for all Retrieves
        var headerParams = {};
        headerParams['Authorization'] = 'bearer ' + this.token;
        
        if(!urlParams) {
            urlParams = {};
        }
        urlParams.client_id = this.apikey;
        
        var promise = this.connection.remove(uri, urlParams, headerParams)
                       .then(function(data) {
                           for(var name in data) {
                               if(name) {
                                   return data[name];
                               }
                           }
                       });
        return promise;
    }
    
    /**
     * Connection.retrieve
     */
    Session.prototype.retrieve = function(uri, urlParams){
    
        // Check if session is logged in
        if(!this.connected){
            return this.createDisconnectedError();
        }
        
        // Http Request Header fields for all Retrieves
        var headerParams = {};
        headerParams['Authorization'] = 'bearer ' + this.token;
        
        if(!urlParams) {
            urlParams = {};
        }
        urlParams.client_id = this.apikey;
        
        var self = this;
        var promise = this.connection.retrieve(uri, urlParams, headerParams)
                       .then(function(data) {
                           for(var name in data) {
                               if(name) {
                                   return data[name];
                               }
                           }
                       });
        /*
        if(urlParams.expand && urlParams.expand !== "") {
            promise = this.handleExpansion(promise, urlParams.expand);
        }
        */
        return promise;
    }
    
    Session.prototype.errorHandle = function(response) {
    }
    
    /**
     * Performs an anonymous authentication to the DR Server.
     * This should always be the first step in the session (required to use anonymous APIs and also to authenticate)
     */
    Session.prototype.anonymousLogin = function() {
        
        var uri = Config.connection.URI.BASE_URL + Config.connection.URI.ANONYMOUS_LOGIN;
        var that = this;
        
        var d = new Date();
        
        if(this.refreshToken){
            return this.getRefreshToken();  
        }
        
        var fields = {"client_id": this.apikey, "ts": d.getTime(), "grant_type": "password", "username": "anonymous", "password": "anonymous"};
        
        return this.connection.submitForm(uri, fields,{})
            .then(function(data){
                that.connected = true;
                that.token = data.access_token;
                that.refreshToken = data.refresh_token;
                console.debug("[DR Api Library] Anonymous token obtained: " + that.token);
                that.tokenStartTime = new Date().getTime()/1000;
                that.tokenExpirationTime = new Date().getTime()/1000 + parseInt(data.expires_in);
                return data;
            }).fail(function(data){
                // If fails cleans the refresh_token to obtain a new one on the next anonymousLogin call
                console.debug("[DR Api Library] Token failure. Application could not obtain an anonymous token.");
                that.reset();
                var errorResponse = that.createServerErrorResponse();
                
                throw errorResponse;
            });
    };
    
    /**
     * Refresh an anonymous token authentication to the DR Server.
    */
    Session.prototype.getRefreshToken = function() {
        
        var uri = Config.connection.URI.BASE_URL + Config.connection.URI.ANONYMOUS_LOGIN;
        var that = this;
        
        var d = new Date();
        
        var fields = {"client_id": this.apikey, "ts": d.getTime(), "grant_type": "refresh_token", "refresh_token": this.refreshToken};
        
        return this.connection.submitForm(uri, fields, {})
            .then(function(data){
                that.connected = true;
                that.token = data.access_token;
                that.refreshToken = data.refresh_token;
                console.debug("[DR Api Library] Anonymous token obtained using Refresh Token: " + that.token);
                that.tokenStartTime = new Date().getTime()/1000;
                that.tokenExpirationTime = new Date().getTime()/1000 + parseInt(data.expires_in);
                return data;
            }).fail(function(data){
                // If fails cleans the refresh_token to obtain a new one on the next anonymousLogin call
                console.debug("[DR Api Library] Token failure. Application could not obtain an anonymous token using a refresh token.");
                that.refreshToken = null;
                var errorResponse = {};
                var error = {};
                error.code = "refresh_token_invalid";
                error.description = "The Refresh Token is invalid";
                errorResponse.status = 401;
                errorResponse.error = {};
                errorResponse.error.errors = {};
                errorResponse.error.errors.error = error;
                
                throw errorResponse;
            });
    };
    
    /**
     * Forces to refresh token even if the access_token isn't expired 
     */
    Session.prototype.forceRefreshToken = function(){
        return this.getRefreshToken();
    };
    
    /**
     * Forces to get restart the connection getting a new access token
     */
    Session.prototype.forceResetSession = function(){
        this.reset();
        return this.anonymousLogin();
    };
    
    /**
     * Resets the token session variables
     */
    Session.prototype.reset = function() {
        this.token = null;
        this.refreshToken = null;
        this.connected = false;
        this.authenticated = false;
        this.tokenStartTime = null;
        this.tokenExpirationTime = null;
        
    };
    
    
    /**
     * Triggers the OAuth flow in order to get credentials from the user and authenticate him/her
     * This will allow to use protected APIs (such as GetShopper)
     */
    Session.prototype.authenticate = function(onViewLoadedCallback) {
        var self = this;
        
        // Check if session is logged in
        if(!this.connected){
            return this.createDisconnectedError();
        }
        
        var p = this.authManager.login(this.token, onViewLoadedCallback);
        p.then(function(data) {
                if(data.token != "") {
                    self.token = data.token;
                    self.authenticated = true;
                    self.refreshToken = null;
                    self.tokenStartTime = new Date().getTime()/1000;
                    self.tokenExpirationTime = new Date().getTime()/1000 + parseInt(data.expires_in);
                    console.debug("[DR Api Library] Authenticated token obtained: " + self.token);
                }
                return data.token;
            });  
        
        return p;
    };
    
    /**
     * Disconnects from the service by clearing the session data
     */
    Session.prototype.disconnect = function() {
        this.token = null;
        this.authenticated = false;
        this.connected = false;
        
        var defer = Q.defer();
        defer.resolve();
        return defer.promise;
    }
    
    /**
     * Ends the session by clearing the session data and starting an anonymous one.
     */
    Session.prototype.logout = function() {
        if(!this.connected){
            return this.createDisconnectedError();
        }
        if(this.authenticated) {
            // User is authenticated, forget the token and create an anonymous session
            // this.token = null;
            // this.authenticated = false;
            this.reset();
            
            return this.anonymousLogin();
        } else {
            // User is anonymous already, do nothing
            var defer = Q.defer();
            defer.resolve();
            return defer.promise;
        }
        
    }
    
    /**
     * Temporary implementation of the 'expand' param due to a workInProgress by Apigee
     */
    Session.prototype.handleExpansion = function(promise, attribute) {
        var that = this;
        
        return promise
                .then(function(data) { 
                        return that.expand(data, attribute);
                }); 
    }
    
    Session.prototype.expand = function(result, attribute) {
        var that = this;
        var entity = getAttribute(result, attribute);
        var promises = [];
        var isArray = is_array(entity); 
        if(isArray) {
            for(var i = 0; i < entity.length; i++) {
                var o = entity[i];
                promises.push(that.retrieve(o.uri, {}));
            }
        } else {
             promises.push(that.retrieve(entity.uri, {}));
        }
        return Q.all(promises)
            .then(function(results) {
                if(isArray) {
                    setAttribute(result, attribute, []);
                    var entity = getAttribute(result, attribute);
                    for(var i = 0; i < results.length; i++) {
                        entity.push(results[i]);    
                    }
                } else {
                    setAttribute(result, attribute, results[0]);
                }
                return result;
            });
    }
    
    return Session;    
});
define('service/CartService',['service/BaseService', 'Config'], function(BaseService, Config) {
    /**
     * Service Manager for Cart Resource
     */
    return BaseService.extend({
        uri: Config.service.URI.CART,
        
        /**
         * Adds a Line Item
         * @param product: Product to add to the cart
         * @addToCartUri: (Optional) Uri to add the product to the cart. If it is informed the service uses this uri to add
         * the product to the cart, otherwise it uses product.addProductToCart.uri. Usefull for adding a product which is part of
         * and offer
         * @param parameters
         * @param callback service response
         */
        addLineItem: function(product, addToCartUri, parameters, callbacks) {
            var uri;
            if(addToCartUri){
                uri = addToCartUri;
            }else{
                uri = product.addProductToCart.uri;
            }
            return this.makeRequest(this.session.create(uri, parameters), callbacks);
        },
        
        /**
         * Retrurns the cart
         * @param parameters
         * @param callback service response (cart)
         */
        get: function(parameters, callbacks) {
            return this.makeRequest(this.session.retrieve(this.uri, parameters), callbacks);
        },
        
        /**
         * Removes a Line Item
         * @param lineItem to remove
         * @param parameters
         * @param callback service response
         */
        removeLineItem: function(lineItem, parameters, callbacks){
            return this.makeRequest(this.session.remove(lineItem.uri, parameters), callbacks);  
        },
        
        /**
         * Gets the shipping options for a cart
         * @param parameters
         * @param callback service response
         */
        getShippingOptions: function(parameters, callbacks){
            var uri = Config.service.URI.CART_SHIPPING_OPTIONS;
            
            return this.makeRequest(this.session.retrieve(uri, parameters), callbacks);
        },
        
        /**
         * Gets the offers for a cart, depending on the product added to it
         * @popName The name of the Point Of Promotion containing the offers
         * @param parameters
         * @param callback service response
         */
        getOffers: function(popName, parameters, callbacks){
            var uri = this.replaceTemplate(Config.service.URI.CART_OFFERS, {'popName':popName});
            
            return this.makeRequest(this.session.retrieve(uri, parameters), callbacks);
        },
        
        /**
         * Applies shipping option to cart
         * @param parameters
         * @param callback service response
         */
        applyShippingOption: function(parameters, callbacks){
            var uri = Config.service.URI.CART_APPLY_SHIPPING_OPTION;
            
            return this.makeRequest(this.session.create(uri, parameters), callbacks);
        },
        
        /**
         * Applies shopper options to the cart
         */
        applyShopper: function(parameters, callbacks) {
            var uri = Config.service.URI.CART_APPLY_SHOPPER;
            
            return this.makeRequest(this.session.create(uri, parameters), callbacks);
        },
        
        /**
         * Submits a cart
         */
        submit: function(parameters, callbacks) {
            var uri = Config.service.URI.ORDERS;
            
            return this.makeRequest(this.session.create(uri, parameters), callbacks);
        }
    });
});
define('service/CategoryService',['service/BaseService', 'Config'], function(BaseService, Config) {
    /**
     * Service Manager for Category Resource
     */
    return BaseService.extend({
        uri: Config.service.URI.CATEGORIES
    });
});
define('service/ProductService',['service/BaseService', 'Config'], function(BaseService, Config) {
    /**
     * Service Manager for Product Resource
     */
    return BaseService.extend({
        uri: Config.service.URI.PRODUCTS,
    
        /**
         * list Products by Category 
         */
        listProductsByCategory: function(id, parameters, callbacks){
            var uri = this.replaceTemplate(Config.service.URI.PRODUCTS_BY_CATEGORY, {'categoryId':id});
        
            return this.makeRequest(this.session.retrieve(uri, parameters), callbacks);
        },
        
        /**
         * search Products by keyword 
         */
        search: function(parameters, callbacks){
            var uri = Config.service.URI.PRODUCTS_SEARCH;
        
            return this.makeRequest(this.session.retrieve(uri, parameters), callbacks);
        },
        
        /**
         * get Products by productIds 
         */
        getProductsByIds: function(parameters, callbacks){
            return this.makeRequest(this.session.retrieve(this.uri, parameters), callbacks);
        }
    });
});
define('service/OfferService',['service/BaseService', 'Config'], function(BaseService, Config) {
    /**
     * Service Manager for Offer Resource
     */
    return BaseService.extend({
        
        uri: Config.service.URI.OFFERS,
        
        /**
         * Gets the offers for a POP 
         */
        list: function(popName, parameters, callbacks) {
            var uri = this.replaceTemplate(this.uri, {'popName':popName});
    
            return this.makeRequest(this.session.retrieve(uri, parameters), callbacks);
        },
        
        /**
         * Gets an offer
         */
        get: function(popName, offerId, parameters, callbacks) {
            var uri = this.replaceTemplate(this.uri, {'popName':popName}) + '/' + offerId;
    
            return this.makeRequest(this.session.retrieve(uri, parameters), callbacks);
        }
    });
});
define('service/ProductOfferService',['service/BaseService', 'Config'], function(BaseService, Config) {
    /**
     * Service Manager for Offer Resource
     */
    return BaseService.extend({
        
        uri: Config.service.URI.PRODUCT_OFFERS,
        
        /**
         * Gets a product offer list
         */
        list: function(popName, offerId, parameters, callbacks) {
            var uri = this.replaceTemplate(this.uri, {'popName':popName, 'offerId':offerId});
    
            return this.makeRequest(this.session.retrieve(uri, parameters), callbacks);
        },
        
        /**
         * Gets an offer with its products
         */
        get: function(popName, offerId, id, parameters, callbacks) {
            var uri = this.replaceTemplate(this.uri, {'popName':popName, 'offerId':offerId}) + '/' + id;
    
            return this.makeRequest(this.session.retrieve(uri, parameters), callbacks);
        }
    });
});
define('service/OrderService',['service/BaseService', 'Config'], function(BaseService, Config) {
    /**
     * Service Manager for Order Resource
     */
    return BaseService.extend({
        uri: Config.service.URI.ORDERS
    });
});
define('Client',[
    'Config', 'q', 'Util', 'connection/Session', 
    'service/CartService', 'service/CategoryService', 
    'service/ProductService', 'service/OfferService', 
    'service/ProductOfferService', 'service/ShopperService',
    'service/OrderService', 'AsyncRequester'
], 
function(Config, Q, Util, Session, CartService, CategoryService, ProductService, OfferService, ProductOfferService, ShopperService, OrderService, AsyncRequester) {

    // IE FIX
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function () { };
    
    /**
     * Main library object to be instanced at the App
     * 
     * @param data
     * @param callback
     * @returns {Client}
     */
    var Client = AsyncRequester.extend({
        init: function (key, options){  
            // Default options (may be overriden by the user)
            this.options = {
                env: "prod",
                // Auth configuration
                authElementId: "",
                authRedirectUrl: Config.config.DEFAULT_REDIRECT_URI,
                authMode: Config.authMode.IFRAME
            };
            this.options = Util.merge(this.options, options);
            this.setEnvironment(this.options.env);
            this.session = new Session(key, this.createAuthConfig(key, this.options));
        
            this.cart  = new CartService(this);
            this.categories = new CategoryService(this);
            this.products = new ProductService(this);
            this.offers = new OfferService(this);
            this.productOffers = new ProductOfferService(this);
            this.shopper = new ShopperService(this);
            this.orders = new OrderService(this);
            
            this._super(this.session);
        },
        /**
         * Set Production or Development Environment (Change BASE_URL)
         */
        setEnvironment: function(env){
            if(env == 'dev'){
                Config.connection.URI.BASE_URL = Config.connection.URI.DEV_BASE_URL;
            }else{
                Config.connection.URI.BASE_URL = Config.connection.URI.PRD_BASE_URL;
            }
        },
        /**
         * Creates the Auth config using the general config
         */
        createAuthConfig: function(clientId, options) {
            return {
                    elementId: options.authElementId, 
                    authRedirectUrl: options.authRedirectUrl, 
                    strategy: options.authMode,
                    client_id: clientId
                   }
        },
        /**
         * Creates a new anonymous session by connecting to DR Service
         */    
        connect: function(callback) {
            return this.makeRequest(this.session.anonymousLogin(), callback);
        },
    
        /**
         * Refreshes the current access_token
         */
        forceRefreshToken: function(callback) {
            return this.makeRequest(this.session.forceRefreshToken(), callback);
        },
        
        /**
         * Resets the session getting a new access_token
         */
        forceResetSession: function(callback) {
            return this.makeRequest(this.session.forceResetSession(), callback);
        },
        /**
         * Triggers an OAuth flow to authenticate the user
         */    
        login: function(onViewLoadedCallback, callback){
            return this.makeRequest(this.session.authenticate(onViewLoadedCallback), callback);
        },
        /**
         * Ends the user session and starts an anonymous one.
         * Only useful when the user is authenticated (NOT anonymous).
         */    
        logout: function(callback){
            return this.makeRequest(this.session.logout(), callback);
        },
        /**
         * Disconnects from the DR Service. Reconnection will be required to continue using the API
         */    
        disconnect: function(callback){
            return this.makeRequest(this.session.disconnect(), callback);
        },
        checkConnection: function(callback){
            var defer = Q.defer();
            
            this.cart.get({"fields": "id"}, function(data){
                callback();
            });
            return defer.promise;
        },
        /**
         * Retrieves the current session information
         */
        getSessionInfo: function() {
            return {
                clientId: this.session.apikey, 
                connected: this.session.connected,
                authenticated: this.session.authenticated,
                token: this.session.token,
                refreshToken: this.session.refreshToken,
                tokenExpirationTime : this.session.tokenExpirationTime
            };
        }    
        
    });
    return Client;
});
define('Api',['service/ShopperService', 'auth/AuthManager', 'Config', 'Client', 'Util'], function(ShopperService, AuthManager, Config, Client, Util) {
    var dr = {};
    dr.api = {};
    
    dr.api.callbacks = {
            editAccount: ShopperService.editCallback,
            auth: AuthManager.authCallback    
        } 
    
    window.dr = dr;
    
    return {
        callbacks: {
            editAccount: ShopperService.editCallback,
            auth: AuthManager.authCallback    
        },
        Client: Client,
        authModes: Config.authMode,
        util: Util
   }
});
define('Wrapper',['Api', 'q'], function(Api, Q) {
    window.dr = window.dr || {};
    window.dr.api = Api; 
    if(!window.Q) {
        window.Q = Q;
    }
});require(['Wrapper'], null, null, true); }());