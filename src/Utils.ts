module Knockbone {

    /** This is an internal utility class and is not intended to be used by application code. */
    export class Utils {

        /** Checks is an object can be treated as a promise. */
        public static isPromise(arg) {
            return arg && _.isFunction(arg.then);
        }

        /** This is a quick swich that calls a callback once a promise is resolved, or immediately if the argument is not a promise. */
        public static when(arg, callback) {

            if (Utils.isPromise(arg))
                return arg.then(callback);
            else
                return callback(arg);
        }
    }
}