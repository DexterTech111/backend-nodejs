self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('app-cache').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/icon-1.png',
                '/assets/images/noback.png',
                '/assets/covered.png',
                '/assets/policy.png',
                '/assets/lock.png'
                // Add other resources you want to cache
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
