/*
 * Copyright 2019 GoDataDriven B.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Declared as global, the Closure compiler will inline these.
// (The closure compiler requires them to be declared globally.)

/** @define {string} */
var PARTY_COOKIE_NAME = '_dvp';
/** @define {number} */
var PARTY_ID_TIMEOUT_SECONDS = 2 * 365 * 24 * 60 * 60;
/** @define {string} */
var SESSION_COOKIE_NAME = '_dvs';
/** @define {number} */
var SESSION_ID_TIMEOUT_SECONDS = 30 * 60;
/** @define {number} */
var EVENT_TIMEOUT_SECONDS = 1.0;
/** @define {string} */
var COOKIE_DOMAIN = '';
/** @define {boolean} */
var LOGGING = false;
/** @define {string} */
var SCRIPT_NAME = 'divolte.js';
/** @define {string} */
var EVENT_SUFFIX = 'csc-event';
/** @define {boolean} */
var AUTO_PAGE_VIEW_EVENT = true;

(function (global, factory) {
  factory(global);
}('undefined' !== typeof window ? window : this, function(window) {
  "use strict";

  // Alias some references that we frequently use.
  var document = window.document,
      navigator = window.navigator,
      console = window.console,
      // On some browsers, logging functions are methods that expect to access the console as 'this'.
      bound = function(method, instance) {
        return method.bind ? method.bind(instance) : method;
      },
      log = LOGGING && console ? bound(console.log, console) : function() {},
      info = LOGGING && console ? bound(console.info, console) : function() {},
      warn = LOGGING && console ? bound(console.warn, console) : function() {},
      error = LOGGING && console ? bound(console.error, console) : function() {};

  log("Initializing Divolte.");

  /**
   * The URL used to load this script.
   * (This will include the anchor on the URL, if any.)
   *
   * @const
   * @type {string}
   */
  var divolteScriptUrl = function() {
    var couldNotInitialize = function(reason) {
      var error = "Divolte could not initialize itself";
      if (LOGGING) {
        error += '; ' + reason;
      }
      error += '.';
      throw error;
    };
    /*
     * Modern browsers set a 'currentScript' attribute to the script element
     * of the running script, so we check that first. If that fails we fall
     * back to searching the document for a <script> tag that refers to the
     * our script name, as configured by the globally defined SCRIPT_NAME
     * value.
     */
    var myElement = document['currentScript'];
    var url;
    if ('undefined' === typeof myElement) {
      var regexEscape = function (s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      };
      var scriptElements = document.getElementsByTagName('script');
      var scriptPattern = new RegExp("^(:?.*\/)?" + regexEscape(SCRIPT_NAME) + "(:?[?#].*)?$");
      for (var i = scriptElements.length - 1; i >= 0; --i) {
        var scriptElement = scriptElements.item(i);
        var scriptUrl = scriptElement.src;
        if (scriptPattern.test(scriptUrl)) {
          if ('undefined' === typeof url) {
            url = scriptUrl;
          } else {
            couldNotInitialize('multiple script elements found with src="???/' + SCRIPT_NAME + '"');
          }
        }
      }
    } else {
      url = myElement.src;
    }
    if ('undefined' === typeof url) {
      couldNotInitialize('could not locate script with src=".../' + SCRIPT_NAME + '"');
    }
    return url;
  }();

  /**
   * The base URL for the Divolte server that served this file.
   *
   * @const
   * @type {string}
   */
  var divolteUrl = function(myUrl) {
    return myUrl.substr(0, 1 + myUrl.lastIndexOf('/'));
  }(divolteScriptUrl);
  info("Divolte base URL detected", divolteUrl);

  /**
   * Obtain the body element for the current document.
   * This needs to be retrieved on demand: the body element can be
   * replaced in the DOM, and may also be unavailable duringn initial
   * page loading.
   * @returns {?(HTMLElement|Node)}
   */
  var bodyElement = function() {
    return document.body || document.getElementsByTagName('body').item(0);
  };

  /* Some current browser features that we send to Divolte. */
  var
      /**
       * The width of the user screen.
       * @const
       * @type {number}
       */
      screenWidth = window.screen.availWidth,
      /**
       * The height of the user screen.
       * @const
       * @type {number}
       */
      screenHeight = window.screen.availHeight,
      /**
       * Query the current width of the browser window.
       * @type {function():?number}
       */
      windowWidth = function() {
        return window['innerWidth'] || document.documentElement['clientWidth'] || bodyElement()['clientWidth'] || document.documentElement['offsetWidth'] || bodyElement()['offsetWidth'];
      },
      /**
       * Query the current height of the browser window.
       * @type {function():?number}
       */
      windowHeight = function() {
        return window['innerHeight'] || document.documentElement['clientHeight'] || bodyElement()['clientHeight'] || document.documentElement['offsetHeight'] || bodyElement()['offsetHeight'];
      };

  /**
   * Get the value of a cookie.
   *
   * @param {string} name   The name of the cookie to retrieve.
   * @return {?string}      the value of the cookie, if the cookie exists, or null otherwise.
   */
  var getCookie = function(name) {
        // Assumes cookie name and value are sensible.
        return document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + name + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1") || null;
      };
  /**
   * Set a cookie.
   *
   * @param {string} name          The name of the cookie to set.
   * @param {string} value         The value to assign to the cookie.
   * @param {number} maxAgeSeconds The expiry (age) of the cookie, in seconds from now.
   * @param {number} nowMs         The current time, in milliseconds since the Unix epoch.
   * @param {string} domain        The domain to set the cookies for, if non-zero in length.
   */
  var setCookie = function(name, value, maxAgeSeconds, nowMs, domain) {
        var expiry = new Date(nowMs + 1000 * maxAgeSeconds);
        // Assumes cookie name and value are sensible. (For our use they are.)
        // Note: No domain means these are always first-party cookies.
        var cookieString = name + '=' + value + "; path=/; expires=" + expiry.toUTCString() + "; max-age=" + maxAgeSeconds;
        if (domain) {
          cookieString += "; domain=" + domain;
        }
        document.cookie = cookieString;
      };

  /**
   * Get the server-supplied pageview ID, if present.
   * The server can supply a pageview ID by placing it in the anchor of the script URL.
   *
   * @param {string} myUrl The URL used to load this script.
   * @return {?string} the server-supplied pageview ID, if present, or null if not.
   * @throws {string} if the pageview ID is supplied but contains a slash ('/').
   */
  var getServerPageView = function(myUrl) {
    var anchorIndex = myUrl.indexOf("#"),
        anchor = -1 !== anchorIndex ? myUrl.substring(anchorIndex + 1) : null;
    if (null !== anchor && -1 !== anchor.indexOf('/')) {
      throw "DVT not initialized correctly; page view ID may not contain a slash ('/').";
    }
    return anchor;
  };

  /**
   * Convenience method for the current time.
   * The time is returned as a Java-style timestamp.
   *
   * @return {number} the number of milliseconds since the start of 1970, UTC.
   */
  var now = function() {
    // Older IE doesn't support Date.now().
    return new Date().getTime();
  };

  /**
   * Implementation of SHA3 (256).
   *
   * This is based on an original implementation by Chris Drost of drostie.org
   * and placed into the public domain. (Thanks!)
   *
   * @param {string} message    The message to product a digest of.
   * @return {!Array.<number>} the calculated 256-bit SHA-3 digest of the supplied message.
   */
  var sha3_256 = function() {
    var permute = [0, 10, 20, 5, 15, 16, 1, 11, 21, 6, 7, 17, 2, 12, 22, 23, 8, 18, 3, 13, 14, 24, 9, 19, 4],
        RC = [ 0x1, 0x8082, 0x808a, 0x80008000, 0x808b, 0x80000001, 0x80008081, 0x8009,
               0x8a, 0x88, 0x80008009, 0x8000000a, 0x8000808b, 0x8b, 0x8089, 0x8003,
               0x8002, 0x80, 0x800a, 0x8000000a, 0x80008081, 0x8080 ],
        r = [0, 1, 30, 28, 27, 4, 12, 6, 23, 20, 3, 10, 11, 25, 7, 9, 13, 15, 21, 8, 18, 2, 29, 24, 14],
        rotate = function(s, n) {
          return (s << n) | (s >>> (32 - n));
        };
    return function (message) {
      var i,
          state = [];
      for (i = 0; i < 25; i += 1) {
        state[i] = 0;
      }
      if (message.length % 16 === 15) {
        message += "\u8001";
      } else {
        message += "\x01";
        while (message.length % 16 !== 15) {
          message += "\0";
        }
        message += "\u8000";
      }
      for (var b = 0; b < message.length; b += 16) {
        for (i = 0; i < 16; i += 2) {
          state[i / 2] ^= message.charCodeAt(b + i) + message.charCodeAt(b + i + 1) * 65536;
        }
        for (var round = 0; round < 22; round += 1) {
          var C = [];
          for (i = 0; i < 5; i += 1) {
            C[i] = state[i] ^ state[i + 5] ^ state[i + 10] ^ state[i + 15] ^ state[i + 20];
          }
          var D = [];
          for (i = 0; i < 5; i += 1) {
            D[i] = C[(i + 4) % 5] ^ rotate(C[(i + 1) % 5], 1);
          }
          var next = [];
          for (i = 0; i < 25; i += 1) {
            next[permute[i]] = rotate(state[i] ^ D[i % 5], r[i]);
          }
          for (i = 0; i < 5; i += 1) {
            for (var j = 0; j < 25; j += 5) {
              state[j + i] = next[j + i] ^ ((~ next[j + (i + 1) % 5]) & (next[j + (i + 2) % 5]));
            }
          }
          state[0] ^= RC[round];
        }
      }
      var output = [];
      for (i = 0; i < 8; ++i) {
        var n = state[i];
        output.push(n & 255, n >>> 8, n >>> 16, n >>> 24);
      }
      return output;
    }}();

  /**
   * Implementation of (32-bit) MurmurHash3.
   *
   * This is based on an original implementation by Peter Zotov and placed into
   * the public domain. (Thanks!)
   *
   * The data to hash must contain only single-byte codepoints.
   *
   * @param {string} bytes  A string containing the bytes that should be encoded.
   * @param {number=} seed  An optional number to seed the hash algorithm with. (If not supplied, 0 is used.)
   * @return {number} a 32-bit number containing the hash of the supplied data.
   */
  var murmum3_32 = function() {
    var c1 = 0xcc9e2d51,
        c2 = 0x1b873593,
        mul32 = function(m, n) {
          var nlo = n & 0xffff;
          var nhi = n - nlo;
          return ((nhi * m | 0) + (nlo * m | 0)) | 0;
        },
        fmix = function(h) {
          h ^= h >>> 16;
          h  = mul32(h, 0x85ebca6b);
          h ^= h >>> 13;
          h  = mul32(h, 0xc2b2ae35);
          h ^= h >>> 16;
          return h;
        };
    return function(bytes, seed) {
      var len = bytes.length,
          hash = ('undefined' !== typeof seed) ? seed : 0,
          roundedEnd = len & ~0x3;

      // Bulk of the data.
      var k;
      for (var i = 0; i < roundedEnd; i += 4) {
        k = (bytes.charCodeAt(i)     & 0xff)        |
           ((bytes.charCodeAt(i + 1) & 0xff) << 8)  |
           ((bytes.charCodeAt(i + 2) & 0xff) << 16) |
           ((bytes.charCodeAt(i + 3) & 0xff) << 24);

        k = mul32(k, c1);
        // ROTL32(k,15);
        k = ((k & 0x1ffff) << 15) | (k >>> 17);
        k = mul32(k, c2);

        hash ^= k;
        // ROTL32(hash,13);
        hash = ((hash & 0x7ffff) << 13) | (hash >>> 19);
        hash = (hash * 5 + 0xe6546b64) | 0;
      }

      // Leftover data.
      k = 0;
      switch (len % 4) {
        case 3:
          k = (bytes.charCodeAt(roundedEnd + 2) & 0xff) << 16;
          // Intentional fall-through.
        case 2:
          k |= (bytes.charCodeAt(roundedEnd + 1) & 0xff) << 8;
          // Intentional fall-through.
        case 1:
          k |= (bytes.charCodeAt(roundedEnd) & 0xff);

          k = mul32(k, c1);
          k = ((k & 0x1ffff) << 15) | (k >>> 17);  // ROTL32(k,15);
          k = mul32(k, c2);
          hash ^= k;
      }

      // Finalization.
      hash ^= len;
      hash = fmix(hash);

      return hash;
    }
  }();

  /**
   * Generate a globally unique identifier, optionally prefixed with a timestamp.
   * There are two internal implementations, depending on whether Crypto
   * extensions are detected or not.
   *
   * @param {boolean} includeTimestampPrefix  whether or not the a timestamp
   *        should be included in the identifier. (This timestamp is always
   *        the module load time.)
   * @return {!string} a unique identifier.
   */
  var generateId = function() {
    /*
     * An identifier is a hash of:
     *  - The time;
     *  - The current browser URL;
     *  - Some random values;
     *  - Optionally, some features specific to the current browser.
     *
     * Random values are generated using Crypto extensions if they are present, or
     * Math.random() otherwise.
     *
     * Note that in theory when we use the Crypto extensions we shouldn't need to
     * include any other values, or even hash things. However we've observed collisions
     * from some clients that do not appear to seed the random source in Crypto
     * extensions properly. (eg. Google Web Preview.)
     */

    var math = Math,
        crypto = window['crypto'] || window['msCrypto'],
        hasSecureRandom = ('undefined' !== typeof crypto && 'undefined' !== typeof crypto['getRandomValues']),
        /**
         * Generate a sequence of random numbers.
         * Each random number is between 0 and 255, inclusive.
         * @type {function(number):!(Uint8Array|Array.<number>)}
         */
        generateRandomNumbers = hasSecureRandom
            ? function(length) {
              // We have Crypto extensions. Use them directly.
              var array = new Uint8Array(length);
              crypto['getRandomValues'](array);
              return array;
            }
            : function(length) {
              // We have no crypto extensions. This is a last resort.
              var array = new Array(length);
              for (var i = 0; i < length; ++i) {
                array[i] = math.floor(math.random() * 0x100);
              }
              return array;
            },
        /**
         * Generate a string with random character.
         * Each character is a code-point in the range between
         * 0 and 255, inclusive.
         * @type {function(number):string}
         */
        generateRandomString = function(length) {
          var numbers = generateRandomNumbers(length),
              s = "";
          for (var i = 0; i < numbers.length; ++i) {
            s += String.fromCharCode(numbers[i]);
          }
          return s;
        },
        /**
         * A set of MIME-types to probe for.
         * What we want here is the smallest set that discriminates best amongst users.
         * This list is relatively arbitrary based on observed industry practice.
         * (It doesn't necessarily meet the criteria of most efficient discrimination.)
         * @const
         * @type {!Array.<string>}
         */
        probeMimeTypes = [
          "application/pdf",
          "video/quicktime",
          "video/x-msvideo",
          "audio/x-pn-realaudio-plugin",
          "audio/mpeg3",
          "application/googletalk",
          "application/x-mplayer2",
          "application/x-director",
          "application/x-shockwave-flash",
          "application/x-java-vm",
          "application/x-googlegears",
          "application/x-silverlight"
        ],
        /**
         * Generate a string that varies depending on some of the MIME-types that are available.
         * @type {function():string}
         */
        getMimeTypeInformation = function() {
          var plugins,
              mimeTypes = navigator['mimeTypes'];
          if (mimeTypes) {
            plugins = "plugins:";
            for (var i = 0, l = probeMimeTypes.length; i < l; ++i) {
              var probeMimeType = probeMimeTypes[i];
              plugins += probeMimeType in mimeTypes ? '1' : '0';
            }
          } else {
            plugins = "";
          }
          return plugins;
        },
        /**
         * A set of ActiveX controls to probe for.
         * What we want here is the smallest set that discriminates best amongst users.
         * This list is relatively arbitrary based on observed industry practice.
         * (It doesn't necessarily meet the criteria of most efficient discrimination.)
         * @const
         * @type {!Array.<string>}
         */
        probeActiveXControls = [
          "ShockwaveFlash.ShockwaveFlash.1",
          "AcroPDF.PDF",
          "AgControl.AgControl",
          "QuickTime.QuickTime"
        ],
        /**
         * Generate a string that varies depending on some of the ActiveX controls that
         * are available.
         * @type {function():string}
         */
        getActiveXTypeInformation = function() {
          var plugins;
          if ('ActiveXObject' in window) {
            plugins = "activex:";
            for (var i = 0, l = probeActiveXControls.length; i < l; ++i) {
              var probeActiveXControl = probeActiveXControls[i];
              try {
                var plugin = new ActiveXObject(probeActiveXControl);
                plugins += "1";
                if ('getVersions' in plugin) {
                  plugins += "(" + plugin['getVersions']() + ")";
                } else if ('getVariable' in plugin) {
                  plugins += "(" + plugin['getVariable']("$version") + ")";
                }
              } catch(unused) {
                plugins += '0';
              }
            }
          } else {
            plugins = "";
          }
          return plugins;
        },
        /**
         * Return an array containing strings that are based on local
         * information.
         * @type {function():!Array.<string>}
         */
        getAdditionalLocalFacts = function() {
          var winWidth = windowWidth(),
              winHeight = windowHeight();
          return [
            // Some browser features that should vary between users.
            navigator['userAgent'] || "",
            navigator['platform'] || "",
            navigator['language'] || "",
            navigator['systemLanguage'] || "",
            navigator['userLanguage'] || "",
            screenWidth ? screenWidth.toString(36) : '',
            screenHeight ? screenHeight.toString(36) : '',
            winWidth ? winWidth.toString(36) : '',
            winHeight ? winWidth.toString(36) : '',
            // A mask that depends on some plugin-supported MIME types.
            getMimeTypeInformation(),
            getActiveXTypeInformation()
          ];
        },
        /**
         * Generate a string that is globally unique.
         * This is based on a cryptographic hash of local information
         * that should be random.
         * @type {function():!Array.<number>}
         */
        generateRandomDigest = function() {
          var message = [
            // Number of milliseconds since 1970.
            now().toString(36),
            // Current browser location.
            window.location.href || "",
            // Random values.
            generateRandomString(32)
          ];
          if (!hasSecureRandom) {
            message.push.apply(message, getAdditionalLocalFacts());
          }
          return sha3_256(message.join(""));
        },
        /**
         * Digits used for base-64 encoding.
         * @const
         * @type {string}
         */
        digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxzy0123456789~_',
        /**
         * Generate a random identifier.
         * @type {function():string}
         */
        generateDigits = function() {
          var randomData = generateRandomDigest();
          var id = "";
          for (var i = 0, l = randomData.length; i < l; ++i) {
            // Warning: IE6 doesn't support [] syntax on strings.
            id += digits.charAt(randomData[i] & 0x3f);
          }
          // Mark pseudo-random identifiers with a '!' suffix, so we
          // can see them amongst secure-random identifiers.
          if (!hasSecureRandom) {
            id += '!';
          }
          return id;
        };

    /**
     * Time of module initialization.
     * This is used to ensure consistent timestamps when multiple identifiers are generated.
     * @const
     * @type {number}
     */
    var scriptLoadTime = now();

    return function(includeTimestampPrefix) {
      var digits = generateDigits();
      // For now our identifiers are version 0.
      return "0:" + (includeTimestampPrefix ? (scriptLoadTime.toString(36) + ':' + digits) : digits);
    };
  }();

  /*
   * Locate our identifiers, or generate them if necessary.
   */
  var /**
       * The identifier of the session to which this page-view belongs.
       * @type {!string}
       */
      partyId,
      /**
       * The identifier of the session to which this page-view belongs.
       * @type {!string}
       */
      sessionId,
      /**
       * The identifier of this page-view, if provided by the server or
       * the page-view has started.
       * @type {?string}
       */
      pageViewId = getServerPageView(divolteScriptUrl),
      /**
       * Whether or not this is the first page view for this party.
       * @type {!boolean}
       */
      isNewParty,
      /**
       * Whether or not this is the first page view for this session.
       * @type {!boolean}
       */
      isFirstInSession,
      /**
       * Whether or not the page-view was supplied by the server of the page or not.
       * @type {!boolean}
       */
      isServerPageView = Boolean(pageViewId);

  (function() {
    var restoredPartyId   = getCookie(PARTY_COOKIE_NAME),
        restoredSessionId = getCookie(SESSION_COOKIE_NAME);
    if ((isNewParty = !restoredPartyId)) {
      log("New party; generating identifier.");
      partyId = generateId(true);
    } else {
      partyId = restoredPartyId;
    }
    if ((isFirstInSession = !restoredSessionId)) {
      log("New session; generating identifier.");
      sessionId = generateId(true);
    } else {
      sessionId = restoredSessionId;
    }
  })();

  if (isServerPageView) {
    log("Using server-provided pageview identifier.", pageViewId);
  }

  info("Divolte party/session identifiers", partyId, sessionId);

  /**
   * A counter of the number of events that have been issued for this
   * page view.
   *
   * @type {number}
   */
  var eventCounter = 0;
  /**
   * Generate an event identifier.
   * Note that the implementation requires that pageview identifiers also be unique.
   *
   * @return {string} a unique event identifier.
   */
  var generateEventId = function() {
    // These don't have to be globally unique. So we can leverage the pageview
    // id with a simple counter.
    var thisEventCounter = eventCounter++;
    return pageViewId + thisEventCounter.toString(16);
  };

  /**
   * Utility function for invoking a callback after a specific timeout if it
   * hasn't already been invoked.
   *
   * @param {function(): undefined} callback
   *        the function to invoke after the timout if it hasn't already been.
   * @param {number} timeoutMilliseconds
   *        the timeout after which the method should be invoked if it hasn't already.
   * @return {function(): undefined}
   *         a function to be used as callback instead of the wrapped function.
   */
  var withTimeout = function(callback, timeoutMilliseconds) {
    var calledAlready = false;
    var timerHandle = setTimeout(function() {
      if (!calledAlready) {
        calledAlready = true;
        log("Timeout waiting for event callback; invoking anyway.", this, arguments);
        callback.apply(this, arguments);
      }
    }, timeoutMilliseconds);
    return function() {
      if (!calledAlready) {
        calledAlready = true;
        clearTimeout(timerHandle);
        callback.apply(this, arguments);
      }
    };
  };

  /**
   * A signal queue.
   * This can hold a list of the signal events that are pending.
   * If a signal event is currently underway, it is always the
   * first element in the queue.
   *
   * Functions can be interspersed with events in the queue. When
   * a function is encountered it is invoked, and then removed
   * from the queue when the function returns.
   *
   * @constructor
   * @final
   */
  var SignalQueue = function() {
    /**
     * The internal queue of signal events.
     * @private
     * @const
     * @type {!Array.<string|function()>}
     */
    this.queue = [];
  };
  /**
   * Enqueue a signal event or a callback to be invoked when
   * all prior events have been delivered.
   *
   * If delivery of a prior event or callback invocation is not
   * still underway, processing of this item will commence immediately.
   * Otherwise it will be queued.
   *
   * @param item {string|function()}
   *        the pre-calculated (and rendered) event to queue, or a
   *        callback to invoke when the queue drains to this point.
   */
  SignalQueue.prototype.enqueue = function(item) {
    var pendingEvents = this.queue;
    log("Queueing item for processing; " + pendingEvents.length + " currently pending.", item);
    pendingEvents.push(item);
    if (1 === pendingEvents.length) {
      log("No pending items; processing immediately.", item);
      this.processNextItem();
    }
  };
  /**
   * @private
   * Process the next pending event.
   */
  SignalQueue.prototype.processNextItem = function() {
    var firstPendingItem = this.queue[0];
    // Would normally use double-dispatch for this sort of thing, but
    // this is simpler and sufficient for now.
    switch (typeof firstPendingItem) {
      case 'string':
        this.deliverFirstPendingEvent(firstPendingItem);
        break;
      case 'function':
        this.invokeFirstPendingCallback(firstPendingItem);
        break;
      default:
        error("Dropping unknown type of item in signal queue.", firstPendingItem);
        this.onFirstPendingItemCompleted();
    }
  };
  /**
   * @private
   * Start the next signal event.
   *
   * @param firstPendingEvent {string} the event to start delivering.
   */
  SignalQueue.prototype.deliverFirstPendingEvent = function(firstPendingEvent) {
    var signalQueue = this;
    var image = new Image(1,1);
    log("Delivering pending event.", firstPendingEvent);
    var completionHandler = withTimeout(function() {
      // We can't use onFirstPendingItemCompleted directly because 'this' isn't bound correctly.
      // (And sadly, function.bind() isn't available universally.)
      signalQueue.onFirstPendingItemCompleted();
    }, EVENT_TIMEOUT_SECONDS * 1000);
    image.onload = completionHandler;
    image.onerror = !LOGGING ? completionHandler : function(event) {
      warn("Error delivering event", firstPendingEvent);
      completionHandler();
    };
    image.src = divolteUrl + EVENT_SUFFIX + '?' + firstPendingEvent;
  };
  /**
   * @private
   * Invoke the callback that is now at the front of the queue.
   *
   * @param firstPendingCallback {function()} the callback to invoke.
   */
  SignalQueue.prototype.invokeFirstPendingCallback = function(firstPendingCallback) {
    firstPendingCallback();
    this.onFirstPendingItemCompleted();
  };
  /**
   * @private
   * Handler for when the first item in the queue has been completed.
   */
  SignalQueue.prototype.onFirstPendingItemCompleted = function() {
    log("Marking pending item as complete.");
    // Delete the first event from the queue.
    var pendingEvents = this.queue;
    pendingEvents.shift();
    // If there are still pending events, schedule the next.
    var remainingEvents = pendingEvents.length;
    if (0 < remainingEvents) {
      log("Processing next item; remaining count:", remainingEvents);
      this.processNextItem();
    } else {
      log("All pending items have been delivered.");
    }
  };

  /**
   * The queue for pending signal events.
   * This ensures that signals are received in the same order that
   * they are issued in the browser.
   * @const
   * @type {SignalQueue}
   */
  var signalQueue = new SignalQueue();

  /**
   * UTF-8 encode a string.
   *
   * @param {string} s  The string to UTF-8 encode.
   * @return {string} The UTF-8 encoded string, as a string whereby every character corresponds
   *    to a byte of the UTF-8 encoding of the original string.
   */
  var utf8encode = function(s) {
    return unescape(encodeURIComponent(s));
  };

  /**
   * Produce a checksum for a multimap.
   *
   * The checksum is a hash of a canonical string derived
   * from the multimap. The multimap format is an object
   * whose values are arrays of strings.
   *
   * @param {Object.<string, Array.<string>>} multimap   The multimap whose contents should be checksummed.
   * @return {number} a number that represents a checksum of the multimap.
   */
  var calculateChecksum = function(multimap) {
    /*
     * Build up a canonical representation of the query parameters. The canonical order is:
     *  1) Sort the query parameters by key, preserving multiple values (and their order).
     *  2) Build up a string. For each parameter:
     *     a) Append the parameter name, followed by a '='.
     *     b) Append each value of the parameter, followed by a ','.
     *     c) Append a ';'.
     *  This is designed to be unambiguous in the face of many edge cases.
     */
    var keys = [];
    for (var k in multimap) {
      if (multimap.hasOwnProperty(k)) {
        keys.push(k);
      }
    }
    keys.sort();
    var canonicalString = "";
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i],
          values = multimap[key];
      canonicalString += key;
      canonicalString += '=';
      for (var j = 0; j < values.length; ++j) {
        canonicalString += values[j];
        canonicalString += ',';
      }
      canonicalString += ';';
    }
    var canonicalBytes = utf8encode(canonicalString);
    return murmum3_32(canonicalBytes);
  };


  /**
   * Serialize a value as a string.
   * This function can serialize anything that JSON.stringify() can,
   * and honours toJSON() semantics. It does not, however, use the JSON
   * encoding to serialize the value.
   * @param {*} value The value to serialize.
   * @return {string} a string that represents the serialized value.
   */
  var mincode = function() {
    /**
     * Class for serializing values using a minimum encoding.
     *
     * The encoding is designed to be short, url-friendly, and capable of representing anything
     * that JSON could.
     *
     * Objects are encoded as a series of records. The format of a record is:
     *  - Character: indicates the type of record.
     *  - Optional: If encoding an object, the name of the property which the record encodes.
     *  - Optional: Record-specific payload.
     *
     * Property names are presented as is, terminated with a "!". Within the string itself, any
     * occurrences of "!" or "~" are prefixed with "~".
     *
     * The record types are:
     * <li>'s': for a string, with a payload of the string itself encoded in the same was as
     *          property names (described above).</li>
     * <li>'t': for a boolean, with a value of true.</li>
     * <li>'f': for a boolean, with a value of false.</li>
     * <li>'n': for null.</li>
     * <li>'d': for a number, with a payload of the the base36-encoded number terminated with
     *          a "!".</li>
     * <li>'j': for a number, with a payload containing the JSON-encoded number terminated with
     *          a "!".</li>
     * <li>'(': a special record indicating the start of an object.</li>
     * <li>')': a special record indicating the end of an object.</li>
     * <li>'a': a special record indicating the start of an array.</li>
     * <li>'.': a special record indicating the end of an array.</li>
     *
     * @constructor
     * @final
     */
    var Mincoder = function() {
      /**
       * Buffer containing the records encoded so far.
       * @protected
       * @type {string}
       */
      this.buffer = '';
      /**
       * Field containing the name of the property to which the next
       * record will be assigned. Used when encoding objects.
       * @type {?string}
       */
      this.pendingFieldName = null;
    };
    /**
     * Start encoding an object.
     * @private
     */
    Mincoder.prototype.startObject = function() {
      this.addRecord('(');
    };
    /**
     * Finish encoding an object.
     * @private
     */
    Mincoder.prototype.endObject = function() {
      this.pendingFieldName = null;
      this.addRecord(')');
    };
    /**
     * Start encoding an array.
     * @private
     */
    Mincoder.prototype.startArray = function() {
      this.addRecord('a');
    };
    /**
     * Finished encoding an array.
     * @private
     */
    Mincoder.prototype.endArray = function() {
      this.addRecord('.');
    };
    /**
     * Set the name of the property that the next record will be assigned
     * to.
     * @private
     * @param {string} fieldName the property name.
     */
    Mincoder.prototype.setNextFieldName = function(fieldName) {
      this.pendingFieldName = fieldName;
    };
    /**
     * Add a record to the buffer.
     * @private
     * @param {string} recordType the type of the record.
     * @param {string=} payload    the (optional) payload for this record.
     */
    Mincoder.prototype.addRecord = function(recordType, payload) {
      this.buffer += recordType;
      if (null !== this.pendingFieldName) {
        this.buffer += Mincoder.escapeString(this.pendingFieldName);
        this.buffer += '!';
        this.pendingFieldName = null;
      }
      if (payload) {
        this.buffer += payload;
      }
    };
    /**
     * Encode a variable-length string value.
     * @param {string} s the string to encode.
     */
    Mincoder.escapeString = function() {
      /**
       * Regular expression for escaping strings while serializing.
       * @const
       * @type {RegExp}
       */
      var stringEscapingRegex = /[~!]/g;
      return function(s) {
        return s.replace(stringEscapingRegex, "~$&");
      }
    }();
    /**
     * Encode a string.
     * @private
     * @param {string} s the string to encode as a record.
     */
    Mincoder.prototype.encodeString = function(s) {
      this.addRecord('s', Mincoder.escapeString(s) + '!');
    };
    /**
     * Encode a number.
     * @private
     * @param {number} n the number to encode as a record.
     */
    Mincoder.prototype.encodeNumber = function(n) {
      if (isFinite(n)) {
        // A 'd' record is only allowed to encode integers.
        var dEncoding = n === Math.floor(n) ? n.toString(36) : null,
            jEncoding1 = n.toExponential(),
            jEncoding2 = String(n);
        // We prefer a 'd' record to 'j' even if equal length because they're
        // more efficient to process on the server.
        if (null !== dEncoding &&
            dEncoding.length <= jEncoding1.length &&
            dEncoding.length <= jEncoding2.length) {
          this.addRecord('d', dEncoding + '!');
        } else {
          this.addRecord('j', (jEncoding1.length < jEncoding2.length ? jEncoding1 : jEncoding2) + '!');
        }
      } else {
        this.encode(null, false);
      }
    };
    /**
     * Encode a boolean.
     * @private
     * @param b {boolean} b the boolean to encode as a record.
     */
    Mincoder.prototype.encodeBoolean = function(b) {
      this.addRecord(b ? 't' : 'f');
    };
    /**
     * Encode a null.
     * @private
     */
    Mincoder.prototype.encodeNull = function() {
      this.addRecord('n');
    };
    /**
     * Encode an array.
     * @private
     * @param {!Array<*>} a the array to encode as a series of records.
     */
    Mincoder.prototype.encodeArray = function(a) {
      this.startArray();
      for (var i = 0; i < a.length; ++i) {
        this.encode(a[i], true);
      }
      this.endArray();
    };
    /**
     * Encode a Date.
     * Dates are encoded as a string, as with JSON.
     * @private
     * @param {!Date} d the date to encode as a record.
     */
    Mincoder.prototype.encodeDate = function() {
      /**
       * Zero-pad a number.
       * @param {number} len the length to pad to.
       * @param {number} n   the number to
       * @returns {string} the number, zero-padded to the required length
       */
      var pad = function(len, n) {
            var result = n.toString();
            while(result.length < len) {
              result = '0' + result;
            }
            return result;
          };
      return function(d) {
        var rendered = isFinite(d.valueOf())
                ? d.getUTCFullYear() + '-' +
                  pad(2,d.getUTCMonth() + 1) + '-' +
                  pad(2,d.getUTCDate()) + 'T' +
                  pad(2,d.getUTCHours()) + ':' +
                  pad(2,d.getUTCMinutes()) + ':' +
                  pad(2,d.getUTCSeconds()) + '.' +
                  pad(3,d.getUTCMilliseconds()) + 'Z'
                : null;
        this.encode(rendered, false);
      }
    }();
    /**
     * Encode a generic object.
     * @private
     * @param {!Object} o an object to encode.
     */
    Mincoder.prototype.encodeJavaScriptObject = function(o) {
      this.startObject();
      for (var k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k)) {
          this.setNextFieldName(k);
          this.encode(o[k], false);
        }
      }
      this.endObject();
    };
    /**
     * Encode an object.
     * Note that arrays, dates and null are all objects.
     * @param {Object} o the object to encode as a series of records.
     * @param {boolean} replaceUndefinedWithNull
     *                  true if undefined values should be replaced with null, or false if they should be elided.
     */
    Mincoder.prototype.encodeObject = function(o, replaceUndefinedWithNull) {
      if (o === null) {
        this.encodeNull();
      } else if (typeof o.toJSON === 'function') {
        this.encode(o.toJSON(), replaceUndefinedWithNull)
      } else {
        switch (Object.prototype.toString.call(o)) {
          case '[object Array]':
            this.encodeArray(/**@type !Array<*>*/(o));
            break;
          case '[object Date]':
            this.encodeDate(/**@type !Date*/(o));
            break;
          default:
            this.encodeJavaScriptObject(o);
        }
      }
    };
    /**
     * Encode a value as a series of records.
     * @param {*} value the value to encode.
     * @param {boolean} replaceUndefinedWithNull
     *                  true if undefined values should be replaced with null, or false if they should be elided.
     */
    Mincoder.prototype.encode = function(value,replaceUndefinedWithNull) {
      switch (typeof value) {
        case 'string':
          this.encodeString(value);
          break;
        case 'number':
          this.encodeNumber(value);
          break;
        case 'boolean':
          this.encodeBoolean(value);
          break;
        case 'object':
          this.encodeObject(/**@type !Object*/(value), replaceUndefinedWithNull);
          break;
        case 'undefined':
          if (replaceUndefinedWithNull) {
            this.encode(null, false);
          }
          break;
        default:
          throw "Cannot encode of type: " + typeof value;
      }
    };
    Mincoder.mincode = function(value) {
      var mincoder = new Mincoder();
      mincoder.encode(value, false);
      var result = mincoder.buffer;
      return result !== '' ? result : undefined;
    };
    return Mincoder.mincode;
  }();

  /**
   * Start a page view.
   *
   * This triggers generation of the page view identifier, which happens here
   * due to script re-use on forward/backward browser navigation. Because events
   * identifiers are also tied to page-view via the event counter, we also handle
   * its initialization here.
   */
  var startPageView = function() {
    if (!isServerPageView) {
      pageViewId = generateId(false);
      divolte['pageViewId'] = pageViewId;
      eventCounter = 0;
    }
    info("Starting page view", pageViewId);
    if (AUTO_PAGE_VIEW_EVENT) {
      signal('pageView');
    }
  };

  /**
   * Event logger.
   *
   * Invoking this method will cause an event to be logged with the Divolte
   * server. This function returns immediately, the event itself is logged
   * asynchronously.
   *
   * Events are normally delivered to the server serially in the order they
   * are signalled. A queued event will be delivered when any of the following
   * occurs:
   *
   *  - A prior event is successfully flushed.
   *  - An error occurs flushed the prior event. (No retry is attempted.)
   *  - It takes too long for the prior event to be flushed.
   *
   * @param {string} type The type of event to log.
   * @param {Object=} [customParameters]
   *    Optional object containing custom parameters to log alongside the event.
   *
   * @return {?string} the unique event identifier for this event.
   */
  var signal = function(type, customParameters) {
    // If we have been invoked prior to the current page-view starting, first trigger
    // that.
    if (null === pageViewId) {
      startPageView();
    }
    // Only proceed if we have an event type.
    var eventId;
    if (type) {
      eventId = generateEventId();
      if ('undefined' === typeof customParameters) {
        info("Signalling event: " + type, eventId);
      } else {
        info("Signalling event: " + type, eventId, customParameters);
      }
      var referrer = document.referrer,
          eventTime = now(),
          event = {
            // Note: numbers will be automatically base-36 encoded.
            'p': partyId,
            's': sessionId,
            'v': pageViewId,
            'e': eventId,
            'c': eventTime,
            'n': isNewParty ? 't' : 'f',
            'f': isFirstInSession ? 't' : 'f',
            'l': window.location.href,
            'r': referrer ? referrer : undefined,
            'i': screenWidth,
            'j': screenHeight,
            'k': window['devicePixelRatio'],
            'w': windowWidth(),
            'h': windowHeight(),
            't': type
          };

      // We don't need anything special for cache-busting; the event ID ensures that each
      // request is for a new and unique URL.

      var /**
           * Query string, incrementally being constructed.
           * @type {string}
           */
          queryString = "",
          /**
           * Query parameters, stored as a multimap.
           * @type {Object.<string, Array.<string>>}
           */
          params = {},
          /**
           * Add a parameter to the query string being built up.
           * @type {function(string,string)}
           */
          addParam = function(name,value) {
            if (queryString.length > 0) {
              queryString += '&';
            }
            var paramValues = params[name];
            if ('undefined' === typeof paramValues) {
              paramValues = [];
              params[name] = paramValues;
            }
            paramValues.push(value);
            // Value can safely contain '&' and '=' without any problems.
            queryString += name + '=' + encodeURIComponent(value);
          };

      // These are the parameters relating to the event itself.
      for (var name in event) {
        if (event.hasOwnProperty(name)) {
          var value = event[name];
          switch (typeof value) {
            case 'undefined':
              // No value available. Omit parameter entirely.
              break;
            case 'number':
              // Base 36 encoding for numbers.
              addParam(name, value.toString(36));
              break;
            default:
              addParam(name, value);
          }
        }
      }
      // Custom parameters are supplied, render as JSON to send to the server.
      if (typeof customParameters !== 'undefined') {
        addParam('u', mincode(customParameters));
      }

      // After the first request it's neither a new party nor a new session,
      // as far as events are concerned.
      // (We don't modify the module exports: they refer to the page view.)
      isNewParty = false;
      isFirstInSession = false;

      // Update the party and session cookies.
      setCookie(SESSION_COOKIE_NAME, sessionId, SESSION_ID_TIMEOUT_SECONDS, eventTime, COOKIE_DOMAIN);
      setCookie(PARTY_COOKIE_NAME, partyId, PARTY_ID_TIMEOUT_SECONDS, eventTime, COOKIE_DOMAIN);

      // Last thing we do: add a checksum to the queryString.
      addParam('x', calculateChecksum(params).toString(36));

      signalQueue.enqueue(queryString);
    } else {
      warn("Ignoring event with no type.");
      eventId = null;
    }
    return eventId;
  };

  /**
   * Register a callback to be invoked when all currently pending events
   * have been flushed to the server.
   *
   * Signalled events are queued for asynchronous delivery to the Divolte
   * Collector. This method can be used to register a one-off callback that
   * will be invoked when all pending events on the queue have been flushed.
   *
   * (Any events placed on the queue after this callback is registered will
   * not be considered.)
   *
   * @param {function()} callback
   *        The callback to invoke.
   * @param {number=} timeoutMilliseconds
   *        If supplied, the number of milliseconds after which the callback
   *        should be invoked even if the pending events have not been flushed.
   */
  var whenCommitted = function(callback, timeoutMilliseconds) {
    info("Registering callback for when events have been flushed to server.");
    if ('undefined' !== typeof timeoutMilliseconds) {
      log("Callback will time out after " + timeoutMilliseconds + "ms.");
      callback = withTimeout(callback, timeoutMilliseconds);
    }
    signalQueue.enqueue(callback);
  };

  /**
   * The namespace that we export.
   * @const
   * @type {{partyId: string,
   *         sessionId: string,
   *         pageViewId: ?string,
   *         isNewPartyId: boolean,
   *         isFirstInSession: boolean,
   *         isServerPageView: boolean,
   *         signal: function(string,Object=): ?string,
   *         whenCommitted: function(function()): undefined}};
   */
  var divolte = {
    'partyId':          partyId,
    'sessionId':        sessionId,
    'pageViewId':       pageViewId,
    'isNewPartyId':     isNewParty,
    'isFirstInSession': isFirstInSession,
    'isServerPageView': isServerPageView,
    'signal':           signal,
    'whenCommitted':    whenCommitted
  };

  if ("object" !== typeof window['divolte']) {
    // Expose divolte module.
    if (typeof window['define'] === "function" && window['define']['amd']) {
      window['define'](function () {
        return divolte;
      });
    } else if (typeof window['module'] !== 'undefined' && window['module']['exports']) {
      window['module']['exports'] = divolte;
    } else {
      window['divolte'] = divolte;
    }
    log("Module initialized.", divolte);

    /*
     * A new 'pageView' starts when:
     *  - The script loads and the page is already 'visible'.
     *  - The page becomes visible and the script has already loaded.
     *  - The 'signal' API is invoked but the page view hasn't yet commenced.
     *  - The page is returned to via the 'back' navigation stack.
     *  - The page is reloaded.
     *
     * Note that some browsers don't reload the javascript when returning to a
     * page via navigation, and some do. These rules ensure consistency across
     * all browsers.

     * Some notes on triggering page-views:
     *  - Some browser anticipate navigation and pre-load and initialize Javascript before the page is
     *    visited.
     *  - Some browsers do not destroy/recreate the Javascript context for a page when a user navigates away
     *    and then returns. (This is often called the 'bfcache'.)
     *
     * Browsers provide some mechanisms for detecting and coping with these:
     *  - The document.hidden property, which indicates if the page is visible or not;
     *  - The 'visibilitychange' document event which indicates the document.hidden property has changed;
     *  - The 'pageshow' and 'pagehide' window events.
     *
     * The 'pageshow' and 'pagehide' events appear to be the best fit for purpose. However there is no way
     * to detect during initialization whether the pageshow has already fired or not. (It relies internally
     * on a 'page showing' flag that is not exposed.)
     *
     * With this in mind, our strategy is:
     *
     *  - On startup:
     *     1. the page-view state is 'uninitialized'.
     *     2. Look for the hidden/visibilitychange support on document.
     *         * If available but we're visible, start the page-view immediately.
     *         * If available but we're hidden, register a visibilitychange listener that will (possibly) start
     *           the page-view.
     *         * If unavailable, start the pageview immediately.
     *     3. Check for pageshow/pagehide support. If available register a listener for the pagehide event.
     *  - When the visibilitychange event fires:
     *     1. If the page-view hasn't already started and the page is now visible, start the page-view.
     *     2. If the page-view has now started, deregister the listener.
     *  - When a page-hide event occurs register a page-show listener.
     *  - When a page-show event occurs start a new pageview.
     *  - When an event is signalled, if the page-view state is uninitialized then we start a new page-view.
     *  - Starting a page-view involves:
     *     1. Setting the current page-view identifier.
     *     2. If auto page-views are enabled, signalling the event.
     *
     *  The initial page-show is an unreliable event because we don't know if it's fired yet or not. Hence we
     *  rely on the visibilitychange API for the initial page-view, and then fall back to pagehide/pageshow for
     *  subsequent page-views that are triggered within the same Javascript context.
     *
     *  We assume that:
     *   - Browsers supporting the pageshow/pagehide API also support the hidden/visibilitychange API.
     *   - If neither are supported, the script will be initialized on each and every navigation event.
     *
     *  Events signalled before the first page-view cause it to start.
     *  Events signalled 'between' page views (after hide, but before show) are associated with the previous
     *  page-view.
     */

    /*
     * If the Page Visibility API is supported, this will be the basis for deciding when
     * the initial page-view commences.
     */
    /** @type {string} */
    var hiddenProperty;
    /** @type {string} */
    var visibilityEventName;
    if (typeof document['hidden'] !== "undefined") { // Opera 12.10 and Firefox 18 and later support
      hiddenProperty = "hidden";
      visibilityEventName = "visibilitychange";
    } else if (typeof document['mozHidden'] !== "undefined") {
      hiddenProperty = "mozHidden";
      visibilityEventName = "mozvisibilitychange";
    } else if (typeof document['msHidden'] !== "undefined") {
      hiddenProperty = "msHidden";
      visibilityEventName = "msvisibilitychange";
    } else if (typeof document['webkitHidden'] !== "undefined") {
      hiddenProperty = "webkitHidden";
      visibilityEventName = "webkitvisibilitychange";
    } else {
      warn("Could not detect property for document visibility.")
    }
    if (!document[hiddenProperty]) {
      log("Page already visible; starting page view immediately.");
      startPageView();
    } else if (document['addEventListener'] && document['removeEventListener']) {
      log("Page currently hidden; deferring start of page view.");
      document['addEventListener'](visibilityEventName, function visibilityListener() {
        if (null === pageViewId && document[hiddenProperty] === false) {
          log("Page became visible; starting deferred page view.");
          startPageView();
        }
        if (null !== pageViewId) {
          document['removeEventListener'](visibilityEventName, visibilityListener);
        }
      });
    } else {
      warn("Page currently hidden, but don't know how to defer start of page view; starting page view immediately.");
      startPageView();
    }
    /*
     * Next we check for the Page Transition Event API. If present, we use this to ensure that
     * new page-views are triggered as the use navigates forwards/backwards and so forth.
     */
    if ('onpageshow' in window && 'onpagehide' in window
         && window['addEventListener'] && window['removeEventListener']) {
      log("Detected Page Transition Event API; will trigger additional page-views during navigation.");
      window['addEventListener']('pagehide', function initialPageHideListener() {
        window['removeEventListener']('pagehide', initialPageHideListener);
        window['addEventListener']('pageshow', function () {
          log("Returning to page that is still loaded; starting a new page-view.");
          startPageView();
        })
      })
    } else {
      // Old Opera doesn't have a mechanism for detected bfcache'd back/forward navigation,
      // but we can disable its bfcache using this property.
      /** @type {Object} */
      var history = window['history'];
      if (history && typeof(history['navigationMode'] !== 'undefined')) {
        info("Changing navigation mode from " + history['navigationMode'] + " to 'compatible'.");
        history['navigationMode'] = 'compatible';
      }
    }
  } else {
    warn("Divolte module already initialized; existing module left intact.");
  }

  return divolte;
}));
