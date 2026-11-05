// Mimics amzn_vpaid_wrapper.js media selection: keep files where videoSlot.canPlayType(type) is truthy, pick the closest to the slot size.
(function () {
  var MEDIA = [
    { url: 'https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.m3u8', type: 'application/x-mpegURL', w: 256, h: 144 },
    { url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?s=1280', type: 'video/mp4', w: 1280, h: 720 },
    { url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?s=640', type: 'video/mp4', w: 640, h: 360 }
  ];
  function Ad() { this.h = {}; }
  Ad.prototype = {
    handshakeVersion: function () { return '2.0'; },
    initAd: function (w, hgt, mode, br, cd, env) {
      this.slot = env.videoSlot; this.el = env.slot; this.w = w; this.hgt = hgt;
      var s = this.slot, ok = MEDIA.filter(function (m) { return !!s.canPlayType(m.type); });
      ok.sort(function (a, b) { return Math.abs(a.w - w) + Math.abs(a.h - hgt) - Math.abs(b.w - w) - Math.abs(b.h - hgt); });
      this.pick = ok[0];
      var self = this;
      s.addEventListener('error', function () { self.emit('AdError', 'video_error_unsupported ' + (s.error && s.error.code) + ' ' + self.pick.type); });
      s.addEventListener('playing', function () { self.emit('AdVideoStart'); });
      s.addEventListener('ended', function () { self.emit('AdVideoComplete'); self.emit('AdStopped'); });
      this.emit('AdLoaded');
    },
    startAd: function () { this.slot.src = this.pick.url; this.slot.play(); this.emit('AdStarted'); this.emit('AdImpression'); },
    stopAd: function () { this.emit('AdStopped'); }, skipAd: function () { this.emit('AdSkipped'); },
    resizeAd: function (w, h) { this.w = w; this.hgt = h; this.emit('AdSizeChange'); },
    pauseAd: function () { this.slot.pause(); this.emit('AdPaused'); }, resumeAd: function () { this.slot.play(); this.emit('AdPlaying'); },
    expandAd: function () {}, collapseAd: function () {},
    getAdLinear: function () { return true; }, getAdExpanded: function () { return false; }, getAdSkippableState: function () { return false; },
    getAdWidth: function () { return this.w; }, getAdHeight: function () { return this.hgt; }, getAdRemainingTime: function () { return -1; },
    getAdDuration: function () { return 10; }, getAdVolume: function () { return this.slot.volume; }, setAdVolume: function (v) { this.slot.volume = v; },
    getAdCompanions: function () { return ''; }, getAdIcons: function () { return false; },
    subscribe: function (fn, ev, ctx) { (this.h[ev] = this.h[ev] || []).push(fn.bind(ctx)); },
    unsubscribe: function (fn, ev) { this.h[ev] = []; },
    emit: function (ev, msg) { (this.h[ev] || []).forEach(function (f) { f(msg); }); }
  };
  window.getVPAIDAd = function () { return new Ad(); };
})();
