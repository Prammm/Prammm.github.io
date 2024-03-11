importScripts('src/js/idb.js');
importScripts('src/js/utility.js');

var CACHE_STATIC_NAME = 'static-v18';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';
var STATIC_FILES = [
  '/',
  'index.html',
  'offline.html',
  'isi1.html?id=0',
  'isi1.html?id=1',
  'isi1.html?id=2',
  'isi1.html?id=3',
  'isi1.html?id=4',
  'isi1.html?id=5',
  'src/js/app.js',
  'src/js/feed.js',
  'src/js/idb.js',
  'src/js/promise.js',
  'src/js/fetch.js',
  'src/js/material.min.js',
  'src/js/utility.js',
  'src/js/vendor/jquery-1.12.4.min.js',
  'src/js/jquery.slicknav.min.js', 
  'src/js/main.js',  
  'src/css/app.css',
  'src/css/feed.css',
  'src/css/bootstrap.min.css',
  'src/css/owl.carousel.min.css',
  'src/css/slicknav.css',
  'src/css/flaticon.css',
  'src/css/gijgo.css',
  'src/css/animate.min.css',
  'src/css/animated-headline.css',
  'src/css/magnific-popup.css',
  'src/css/fontawesome-all.min.css',
  'src/css/themify-icons.css',
  'src/css/slick.css',
  'src/css/nice-select.css',
  'src/css/style.css',
  'src/images/cr1.png',
  'src/images/cr2.png',
  'src/images/cr3.png',
  'src/images/cr4.png',
  'src/images/cr5.png',
  'src/images/cr6.png',
  'src/images/cr7.png',
  'https://fonts.googleapis.com/css2?family=Palanquin+Dark:wght@200;300;400;500;600;700&family=Roboto+Condensed:ital,wght@0,300;0,400;1,300;1,400&family=Anton&family=Francois+One&family=Palanquin+Dark:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
    .then(function (cache) {
      console.log('[Service Worker] Precaching App Shell');
      cache.addAll(STATIC_FILES);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
    .then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
          console.log('[Service Worker] Removing old cache.', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});


function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) {
    cachePath = string.substring(self.origin.length);
  } else {
    cachePath = string;
  }
  return array.indexOf(cachePath) > -1;
}


self.addEventListener('fetch', function (event) {
  var url = 'https://quiz1-a68c6-default-rtdb.asia-southeast1.firebasedatabase.app/card/';
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      fetch(event.request).then(function (res) {
        var clonedRes = res.clone();
        clearAllData('posts').then(function () {
          return clonedRes.json();
        }).then(function (data) {
          for (var key in data) {
            writeData('posts', data[key]);
          }
        });
        return res;
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request).then(function (res) {
            return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
              cache.put(event.request.url, res.clone());
              return res;
            });
          }).catch(function () {
            return caches.open(CACHE_STATIC_NAME).then(function (cache) {
              if (event.request.headers.get('accept').includes('text/html')) {
                return cache.match('offline.html');
              }
            });
          });
        }
      })
    );
  }
});

// self.addEventListener('fetch', function (event) {
//     var url = 'https://quiz1-a68c6-default-rtdb.asia-southeast1.firebasedatabase.app/card/';
//     if (event.request.url.indexOf(url) > -1) {
//         // Handle requests to your database: Cache then network strategy
//         event.respondWith(
//             fetch(event.request)
//                 .then(function (res) {
//                     var clonedRes = res.clone();
//                     clearAllData('posts')
//                         .then(function () {
//                             return clonedRes.json();
//                         })
//                         .then(function (data) {
//                             for (var key in data) {
//                                 writeData('posts', data[key]);
//                             }
//                         });
//                     return res;
//                 })
//         );
//     } else if (isInArray(event.request.url, STATIC_FILES)) {
//         // Cache only for static files
//         event.respondWith(caches.match(event.request));
//     } else {
//         event.respondWith(
//             caches.match(event.request)
//                 .then(function (response) {
//                     if (response) {
//                         // If there is an entry in the cache for event.request, then response will be defined
//                         // and we can return it.
//                         return response;
//                     } else {
//                         // If there is no entry in the cache for event.request, then response will be undefined
//                         // and we need to fetch it from the network.
//                         return fetch(event.request)
//                             .then(function (res) {
//                                 return caches.open(CACHE_DYNAMIC_NAME)
//                                     .then(function (cache) {
//                                         // Put the network response in cache, but clone it because the response is a stream
//                                         cache.put(event.request.url, res.clone());
//                                         return res; // return the network response
//                                     })
//                             })
//                             .catch(function (err) {
//                                 // If both the network and the cache fail (e.g., the user is offline),
//                                 // we can serve the offline page.
//                                 return caches.open(CACHE_STATIC_NAME)
//                                     .then(function (cache) {
//                                         if (event.request.url.indexOf('/isi1.html') !== -1) {
//                                             return cache.match('/offline.html');
//                                         }
//                                     });
//                             });
//                     }
//                 })
//         );
//     }
// });

//   var url = 'https://pwagram-99adf.firebaseio.com/posts';
//   if (event.request.url.indexOf(url) > -1) {
//     event.respondWith(fetch(event.request)
//       .then(function (res) {
//         var clonedRes = res.clone();
//         clearAllData('posts')
//           .then(function () {
//             return clonedRes.json();
//           })
//           .then(function (data) {
//             for (var key in data) {
//               writeData('posts', data[key])
//             }
//           });
//         return res;
//       })
//     );
//   } else if (isInArray(event.request.url, STATIC_FILES)) {
//     event.respondWith(
//       caches.match(event.request)
//     );
//   } else {
//     event.respondWith(
//       caches.match(event.request)
//         .then(function (response) {
//           if (response) {
//             return response;
//           } else {
//             return fetch(event.request)
//               .then(function (res) {
//                 return caches.open(CACHE_DYNAMIC_NAME)
//                   .then(function (cache) {
//                     // trimCache(CACHE_DYNAMIC_NAME, 3);
//                     cache.put(event.request.url, res.clone());
//                     return res;
//                   })
//               })
//               .catch(function (err) {
//                 return caches.open(CACHE_STATIC_NAME)
//                   .then(function (cache) {
//                     if (event.request.headers.get('accept').includes('text/html')) {
//                       return cache.match('/offline.html');
//                     }
//                   });
//               });
//           }
//         })
//     );
//   }
// });

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//             })
//             .catch(function(err) {
//               return caches.open(CACHE_STATIC_NAME)
//                 .then(function(cache) {
//                   return cache.match('/offline.html');
//                 });
//             });
//         }
//       })
//   );
// });

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .then(function(res) {
//         return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//       })
//       .catch(function(err) {
//         return caches.match(event.request);
//       })
//   );
// });

// Cache-only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// Network-only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     fetch(event.request)
//   );
// });