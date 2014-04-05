// Generated by CoffeeScript 1.3.3
(function() {
  var Instafeed, root;

  Parse.initialize("5gGqqkDVidcpxWH6ww8fcz06d09jzeiKLgep9CYh",
                   "8BlrPvM5B4ctm1eN3Wrhp57tE2XGdh5GWvIg8kuk");

  Instafeed = (function() {

    function Instafeed(params) {
      var option, value;
      this.options = {
        target: 'instafeed',
        get: 'popular',
        resolution: 'thumbnail',
        sortBy: 'most-recent',
        links: true,
        limit: 15,
        mock: false
      };
      if (typeof params === 'object') {
        for (option in params) {
          value = params[option];
          this.options[option] = value;
        }
      }
      this.unique = this._genKey();
    }

    Instafeed.prototype.run = function() {
      var header, instanceName, script;
      if (typeof this.options.clientId !== 'string') {
        if (typeof this.options.accessToken !== 'string') {
          throw new Error("Missing clientId or accessToken.");
        }
      }
      if (typeof this.options.accessToken !== 'string') {
        if (typeof this.options.clientId !== 'string') {
          throw new Error("Missing clientId or accessToken.");
        }
      }
      if ((this.options.before != null) && typeof this.options.before === 'function') {
        this.options.before.call(this);
      }
      if (typeof document !== "undefined" && document !== null) {
        script = document.createElement('script');
        script.id = 'instafeed-fetcher';
        script.src = this._buildUrl();
        //header = document.getElementsByTagName('head'); // AT this is not needed for Parse
        //header[0].appendChild(script);
        instanceName = "instafeedCache" + this.unique;
        window[instanceName] = new Instafeed(this.options);
        window[instanceName].unique = this.unique;
      }
      return true;
    };

    Instafeed.prototype.parse = function(response) {
      var anchor, fragment, header, htmlString, image, imageString, images, img, instanceName, reverse, sortSettings, _i, _j, _len, _len1;
      if (typeof response !== 'object') {
        if ((this.options.error != null) && typeof this.options.error === 'function') {
          this.options.error.call(this, 'Invalid JSON data');
          return false;
        } else {
          throw new Error('Invalid JSON response');
        }
      }
      if (response.meta.code !== 200) {
        if ((this.options.error != null) && typeof this.options.error === 'function') {
          this.options.error.call(this, response.meta.error_message);
          return false;
        } else {
          throw new Error("Error from Instagram: " + response.meta.error_message);
        }
      }
      if (response.data.length === 0) {
        if ((this.options.error != null) && typeof this.options.error === 'function') {
          this.options.error.call(this, 'No images were returned from Instagram');
          return false;
        } else {
          throw new Error('No images were returned from Instagram');
        }
      }
      if ((this.options.success != null) && typeof this.options.success === 'function') {
        this.options.success.call(this, response);
      }
      if (this.options.sortBy !== 'most-recent') {
        if (this.options.sortBy === 'random') {
          sortSettings = ['', 'random'];
        } else {
          sortSettings = this.options.sortBy.split('-');
        }
        reverse = sortSettings[0] === 'least' ? true : false;
        switch (sortSettings[1]) {
          case 'random':
            response.data.sort(function() {
              return 0.5 - Math.random();
            });
            break;
          case 'recent':
            response.data = this._sortBy(response.data, 'created_time', reverse);
            break;
          case 'liked':
            response.data = this._sortBy(response.data, 'likes.count', reverse);
            break;
          case 'commented':
            response.data = this._sortBy(response.data, 'comments.count', reverse);
            break;
          default:
            throw new Error("Invalid option for sortBy: '" + this.options.sortBy + "'.");
        }
      }
      if ((typeof document !== "undefined" && document !== null) && this.options.mock === false) {
        //if (!document.getElementById(this.options.target))
          document.getElementById(this.options.target).innerHTML = '';
        images = response.data;
        if (images.length > this.options.limit) {
          images = images.slice(0, this.options.limit + 1 || 9e9);
        }
        if ((this.options.template != null) && typeof this.options.template === 'string') {
          htmlString = '';
          imageString = '';
          for (_i = 0, _len = images.length; _i < _len; _i++) {
            image = images[_i];
            imageString = this._makeTemplate(this.options.template, {
              model: image,
              id: image.id,
              username: this._getObjectProperty(image, 'user.username'),
              link: image.link,
              image: image.images[this.options.resolution].url,
              caption: this._getObjectProperty(image, 'caption.text'),
              likes: image.likes.count,
              comments: image.comments.count,
              location: this._getObjectProperty(image, 'location.name')
            });
            htmlString += imageString;
          }
          document.getElementById(this.options.target).innerHTML += htmlString;
        } else {
          fragment = document.createDocumentFragment();
          for (_j = 0, _len1 = images.length; _j < _len1; _j++) {
            image = images[_j];
            img = document.createElement('img');
            img.src = image.images[this.options.resolution].url;
            if (this.options.links === true) {
              anchor = document.createElement('a');
              anchor.href = image.link;
              anchor.appendChild(img);
              fragment.appendChild(anchor);
            } else {
              fragment.appendChild(img);
            }
          }
          //TODO for (var i = 0; i < this.options.target.length; i++) {
            document.getElementById(this.options.target).appendChild(fragment);
          //};
        }
        //header = document.getElementsByTagName('head')[0]; // AT this is not needed for Parse
        //header.removeChild(document.getElementById('instafeed-fetcher'));
        instanceName = "instafeedCache" + this.unique;
        delete window[instanceName];
      }
      if ((this.options.after != null) && typeof this.options.after === 'function') {
        this.options.after.call(this);
      }
      return true;
    };

    Instafeed.prototype._buildUrl = function() {

      var _options = this.options;
      var _callback = "instafeedCache" + this.unique;

      if (_options.get == "user") {
        if (typeof _options.userId !== 'number') {
          throw new Error("No user specified. Use the 'userId' option.");
        }
        if (typeof _options.accessToken !== 'string') {
          throw new Error("No access token. Use the 'accessToken' option.");
        }
        Parse.Cloud.run('getRecentMediaByUser', {userId: ""+_options.userId, callback: _callback}, {
          success: function(result) {
            if (result.meta.code !== 200 || result.data.length === 0) {
              console.log("Loading data from cache.");
              result = getCachedRecentMediaByUser(_options.userId);
              result["callback"] = _callback;
            }
            window[result.callback].parse(result);
          },
          error: function(error) {
            console.log(error);
            console.log("Loading data from cache.");
            result = getCachedRecentMediaByUser(_options.userId);
            result["callback"] = _callback;
            window[result.callback].parse(result);
          }
        });
      } else if (_options.get == "liked") {
        if (typeof _options.userId !== 'number') {
          throw new Error("No user specified. Use the 'userId' option.");
        }
        if (typeof _options.accessToken !== 'string') {
          throw new Error("No access token. Use the 'accessToken' option.");
        }
        Parse.Cloud.run('getSelfLikedMedia', {token: _options.accessToken, callback: _callback}, {
          success: function(result) {
           if (result.meta.code !== 200 || result.data.length === 0) {
              console.log("Loading data from cache.");
              result = getCachedLikedMedia(_options.accessToken);
              result["callback"] = _callback;
            }
            window[result.callback].parse(result);
          },
          error: function(error) {
            console.log(error);
            console.log("Loading data from cache.");
            result = getCachedLikedMedia(_options.accessToken);
            result["callback"] = _callback;
            window[result.callback].parse(result);
          }
        });
      } else {
        throw new Error("Invalid option for get: '" + this.options.get + "'.");
      }

      // var base, endpoint, final;
      // base = "https://api.instagram.com/v1";
      // switch (this.options.get) {
      //   case "popular":
      //     endpoint = "media/popular";
      //     break;
      //   case "tagged":
      //     if (typeof this.options.tagName !== 'string') {
      //       throw new Error("No tag name specified. Use the 'tagName' option.");
      //     }
      //     endpoint = "tags/" + this.options.tagName + "/media/recent";
      //     break;
      //   case "location":
      //     if (typeof this.options.locationId !== 'number') {
      //       throw new Error("No location specified. Use the 'locationId' option.");
      //     }
      //     endpoint = "locations/" + this.options.locationId + "/media/recent";
      //     break;
      //   case "user":
      //     if (typeof this.options.userId !== 'number') {
      //       throw new Error("No user specified. Use the 'userId' option.");
      //     }
      //     if (typeof this.options.accessToken !== 'string') {
      //       throw new Error("No access token. Use the 'accessToken' option.");
      //     }
      //     Parse.Cloud.run('getRecentMediaByUser', {userId: ""+this.options.userId, callback: "instafeedCache" + this.unique}, {
      //       success: function(result) {
      //         // Call the instafeedCache.parse function with the result
      //         var resultJSON = result;
      //         window[resultJSON.callback].parse(resultJSON);
      //         //this.parse(result);
      //       },
      //       error: function(error) {
      //         console.log(error);
      //       }
      //     });
      //     endpoint = "users/" + this.options.userId + "/media/recent";
      //     break;
      //   case "liked":
      //     if (typeof this.options.userId !== 'number') {
      //       throw new Error("No user specified. Use the 'userId' option.");
      //     }
      //     if (typeof this.options.accessToken !== 'string') {
      //       throw new Error("No access token. Use the 'accessToken' option.");
      //     }
      //     Parse.Cloud.run('getSelfLikedMedia', {token: this.options.accessToken, callback: "instafeedCache" + this.unique}, {
      //       success: function(result) {
      //         // Call the instafeedCache.parse function with the result
      //         var resultJSON = result;
      //         window[resultJSON.callback].parse(resultJSON);
      //         //this.parse(result);
      //       },
      //       error: function(error) {
      //         console.log(error);
      //       }
      //     });
      //     endpoint = "users/self/media/liked";
      //     break;
      //   default:
      //     throw new Error("Invalid option for get: '" + this.options.get + "'.");
      // }
      // final = "" + base + "/" + endpoint;
      // if (this.options.accessToken != null) {
      //   final += "?access_token=" + this.options.accessToken;
      // } else {
      //   final += "?client_id=" + this.options.clientId;
      // }
      // final += "&count=" + this.options.limit;
      // final += "&callback=instafeedCache" + this.unique + ".parse";
      // return final;
    };

    Instafeed.prototype._genKey = function() {
      var S4;
      S4 = function() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      };
      return "" + (S4()) + (S4()) + (S4()) + (S4());
    };

    Instafeed.prototype._makeTemplate = function(template, data) {
      var output, pattern, varName, varValue, _ref;
      pattern = /(?:\{{2})([\w\[\]\.]+)(?:\}{2})/;
      output = template;
      while (pattern.test(output)) {
        varName = output.match(pattern)[1];
        varValue = (_ref = this._getObjectProperty(data, varName)) != null ? _ref : '';
        output = output.replace(pattern, "" + varValue);
      }
      return output;
    };

    Instafeed.prototype._getObjectProperty = function(object, property) {
      var piece, pieces;
      property = property.replace(/\[(\w+)\]/g, '.$1');
      pieces = property.split('.');
      while (pieces.length) {
        piece = pieces.shift();
        if ((object != null) && piece in object) {
          object = object[piece];
        } else {
          return null;
        }
      }
      return object;
    };

    Instafeed.prototype._sortBy = function(data, property, reverse) {
      var sorter;
      sorter = function(a, b) {
        var valueA, valueB;
        valueA = this._getObjectProperty(a, property);
        valueB = this._getObjectProperty(b, property);
        if (reverse) {
          if (valueA > valueB) {
            return 1;
          } else {
            return -1;
          }
        }
        if (valueA < valueB) {
          return 1;
        } else {
          return -1;
        }
      };
      data.sort(sorter.bind(this));
      return data;
    };

    return Instafeed;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Instafeed = Instafeed;

}).call(this);