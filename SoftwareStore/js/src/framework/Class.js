/**
 * Base Class for all classes. Provides the "extend" functionality
 */
(function () {
    var initializing = false, fnTest = /xyz/.test(function () { xyz; }) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    var Clazz = function () { };

    // Create a new Class that inherits from this class
    Clazz.extend = function (constructor, instanceMembers, staticMembers) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        instanceMembers = instanceMembers || {};

        instanceMembers["init"] = constructor;
        // Copy the properties over onto the new prototype
        for (var name in instanceMembers) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof instanceMembers[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(instanceMembers[name]) ?
                (function (name, fn) {
                    return function () {
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
                })(name, instanceMembers[name]) :
                instanceMembers[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        for (var name in staticMembers) {
            Class[name] = staticMembers[name];
        }

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };

    WinJS.Namespace.define("DR", {
        Class: Clazz
    });
})();

