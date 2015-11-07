var https = require('https');
var request = require('request');
var async = require('async');

function CloudFlare(db) {
  var timer;
  var self = this;
  var settings = db.collection('settings');
  var zones = db.collection('zones');
  var reservedZones = db.collection('reservedZones');
  var options = {
    hostname: 'api.cloudflare.com',
    port: 443,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  var getCurrentIp = function(ipServer, callback) {
    request.get(ipServer)
      .on('error', function(err) {
        callback(err);
      })
      .on('data', function(data) {
        callback(null, data);
      });
  };

  var requestToCF = function(path, callback) {
    self.getSettings(function(doc) {
      options.path = path;
      if (!doc[0]) {
        return;
      }
      options.headers['X-Auth-Key'] = doc[0].api;
      options.headers['X-Auth-Email'] = doc[0].email;
      options.method = 'GET';
      var req = https.request(options, function(res) {
        var big = '';
        res.on('data', function(data) {
          big += data;
        });
        res.on('end', function() {
          callback(big);
        });
      });
      req.end();
      req.on('error', function(e) {
        console.error(e);
      });
    });
  };

  this.getSettings = function(callback) {
    settings.find().toArray(function(err, doc) {
      if (err) {
        throw err;
      }

      callback(doc);
    });
  }

  this.saveSettings = function(items) {
    settings.save(items, function(err, doc) {
      if (err) {
        throw err;
      }
    });
  }

  this.saveZones = function(items) {
    reservedZones.remove({}, function(err, doc) {
      if (err) {
        throw err;
      }
      Object.keys(items).forEach(function(value) {
        items[value].forEach(function(record) {
          reservedZones.save(record, function(err, doc) {
            if (err) {
              throw err;
            }
          });
        });
      });
    });
  };

  this.getZones = function(callback) {
    zones.find({}).toArray(function(err, doc) {
      if (err) {
        throw err;
      }

      callback(doc);
    });
  };

  this.getReservedZones = function(callback) {
    reservedZones.find({}).toArray(function(err, doc) {
      if (err) {
        throw err;
      }

      callback(doc);
    });
  };

  this.fetchZonesList = function(callback) {
    var records = [];

    // Get zones list
    var path = '/client/v4/zones?status=active&page=1&per_page=20&order=status&direction=desc&match=all';
    requestToCF(path, function(data) {
      var result = JSON.parse(data).result;
      var zonesList = [];

      async.eachSeries(result, function(zone, callback) {
        var path = '/client/v4/zones/' + zone.id + '/dns_records';
        requestToCF(path, function(data) {
          var item = {};
          var records = JSON.parse(data).result;

          item.name = zone.name;
          item.id = zone.id;
          item.records = [];

          async.eachSeries(records, function(record, next) {
            // item.records[i] = {};
            // item.records[i].name = records[i].name;
            // item.records[i]._id = records[i].id;
            // item.records[i].zone_id = records[i].zone_id;
            // item.records[i].content = records[i].content;
            // item.records[i].type = records[i].type;
            // item.records[i].ddns = false;
            item.records.push({
              _id: record.id,
              name: record.name,
              zone_id: record.zone_id,
              content: record.content,
              type: record.type,
              ddns: false
            });

            if (record.type !== 'A') {
              next();
              return;
            }

            reservedZones.find({
              '_id': record.id
            }).toArray(function(err, doc) {
              if (err) {
                throw err;
              }

              if (doc.length && doc[0].content !== record.content) {
                doc[0].content = record.content;
                reservedZones.save(doc[0], function(err, doc) {
                  if (err) {
                    throw err;
                  }
                  next();
                });
              } else {
                next();
              }
            });

          }, function() {
            zones.save({
              '_id': item.id,
              'name': item.name,
              'records': item.records
            }, function(err, doc) {
              if (err) {
                throw err;
              }
              callback();
            });
          });
        });
      }, function() {
        callback(true);
      });
    });
  }

  this.updateDnsRecord = function(settings, record, callback) {

    options.path = '/client/v4/zones/' + record.zone_id + '/dns_records/' + record._id;
    if (!settings[0]) {
      return;
    }
    options.headers['X-Auth-Key'] = settings[0].api;
    options.headers['X-Auth-Email'] = settings[0].email;
    options.method = 'PUT';

    var req = https.request(options, function(res) {
      var big = '';
      res.on('data', function(data) {
        big += data;
      });
      res.on('end', function() {
        callback();
      });
    });
    var ddns = record.ddns;
    delete record.ddns;
    req.write(JSON.stringify(record));
    record.ddns = ddns;
    req.end();
    req.on('error', function(e) {
      console.error(e);
    });

  };

  this.updateAllDnsRecords = function() {
    var ipPattern = /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
    this.getSettings(function(settings) {
      getCurrentIp('http://ipinfo.io/ip', function(err, data) {
        if (err) {
          throw err;
        }

        currentIp = data.toString('utf8').replace(/\n/g, '');
        if (!ipPattern.test(currentIp)) {
          console.error('ERROR: IP server output is not valid.');
          return;
        }

        self.getReservedZones(function(records) {
          async.eachSeries(records, function(record, next) {
            if (record.content !== currentIp) {
              var oldIp = record.content;
              record.content = currentIp;
              self.updateDnsRecord(settings, record, function() {
                reservedZones.save(record, function(err, doc) {
                  if (err) {
                    throw err;
                  }
                  console.log(Date.now() + ' ' + record.name + '\'s IP(' + oldIp + ') changed to ' + record.content);
                  next();
                });
              });
            } else {
              console.log(Date.now() + ' Ip is ' + record.content + ', ' + record.name + ' no needs to update');
              next();
            }
          });
        });
      });
    });
  }

  this.setTimer = function(time) {
    var timer;
    this.getSettings(function(settings) {
      var time = arguments.length ? settings[0].time : time;
      timer = setInterval(function() {
        self.updateAllDnsRecords();
      }, time * 1000);
    });
  }
}
module.exports = CloudFlare
