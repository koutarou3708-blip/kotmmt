(function () {
'use strict';
/* ===================== 道具 ===================== */
var app = document.getElementById('app');
var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
var store = {
  get: function (k, d) { try { var v = localStorage.getItem('gakuya.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem('gakuya.' + k, JSON.stringify(v)); } catch (e) { /* 保存できなくても動く */ } },
  del: function (k) { try { localStorage.removeItem('gakuya.' + k); } catch (e) { } }
};
var REDUCED = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)').matches : false;
var HAS_GAS = !!(window.google && google.script && google.script.run);
var MODE = HAS_GAS ? 'gas' : (window.API_URL ? 'http' : 'demo');
var APP_URL = window.APP_URL || location.href.split('#')[0];
var go = function (h) { if (location.hash === '#' + h) route(); else location.hash = h; };

var PALETTE = ['#FF7EB6', '#FFD84D', '#6CC4F0', '#9BE15D', '#FF9F43', '#B9A3F5', '#5ED6C2', '#FF7A6B'];
function hash(s) { var h = 0; s = String(s); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function tape(name) {
  var h = hash(name);
  return '<span class="tape-r" style="--c:' + PALETTE[h % 8] + ';--t:' + ((h % 7) - 3) + 'deg">' + esc(name) + '</span>';
}
function daysUntil(d) {
  if (!d) return null;
  var p = d.split('-'); if (p.length < 3) return null;
  var t = new Date(+p[0], +p[1] - 1, +p[2]), n = new Date(); n.setHours(0, 0, 0, 0);
  return Math.round((t - n) / 864e5);
}
function md(d) { if (!d) return ''; var p = d.split('-'); return +p[1] + '/' + +p[2]; }
function dateLine(w) {
  if (!w.firstDate) return '公演日 未定';
  var p = w.firstDate.split('-'), s = p[0] + '年' + (+p[1]) + '月' + (+p[2]) + '日';
  if (w.lastDate && w.lastDate !== w.firstDate) s += '〜' + md(w.lastDate);
  return s;
}
function badge(w) {
  if (w.status === 'closed') return '<span class="badge gray">千秋楽<small>おつかれさま</small></span>';
  var n = daysUntil(w.firstDate);
  if (n === null) return '<span class="badge">近日<small>公演日 未定</small></span>';
  return '<span class="badge">' + esc(md(w.firstDate)) + '<small>' + (n > 0 ? 'あと' + n + '日' : n === 0 ? '本番当日' : '公演中') + '</small></span>';
}
var STATUS_LABEL = { prep: '準備中', rehearsal: '稽古中', closed: '終演', hidden: '非公開' };

function toast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 3200);
}
function loading() { return '<div class="loading" role="status" aria-label="読み込み中">' + ART.sheep() + '</div>'; }
var LOGO = window.LOGO_SRC || 'icons/logo.png';

/* ===================== 絵 ===================== */
var ART = {
  cloud: '<svg viewBox="0 0 120 74" aria-hidden="true"><g fill="#E8857A"><circle cx="30" cy="42" r="22"/><circle cx="54" cy="28" r="24"/><circle cx="82" cy="31" r="21"/><circle cx="100" cy="47" r="16"/><rect x="20" y="42" width="86" height="24" rx="12"/></g><circle cx="27" cy="27" r="10" fill="#FFF3C9"/><circle cx="32" cy="23" r="9" fill="#E8857A"/><g fill="#FFF8EC" opacity=".35"><circle cx="60" cy="50" r="1.4"/><circle cx="74" cy="44" r="1.4"/><circle cx="88" cy="52" r="1.4"/><circle cx="46" cy="40" r="1.4"/></g></svg>',
  sheep: function (mood) {
  var ink = '#2A2530', fluff = '#FFF7F9', face = '#F6E07C', cheek = '#F4A7B9';
  var puffs = [[32, 13, 9], [21, 17, 8.5], [43, 17, 8.5], [13, 27, 8], [51, 27, 8], [11, 39, 8], [53, 39, 8], [16, 50, 8.5], [48, 50, 8.5], [26, 55, 8.5], [38, 55, 8.5]];
  var tuft = [[24, 21, 6.5], [32, 18, 7], [40, 21, 6.5]];
  var ring = function (list, w) { return list.map(function (c) { return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + ink + '" stroke="' + ink + '" stroke-width="' + w + '"/>'; }).join(''); };
  var fill = function (list) { return list.map(function (c) { return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + fluff + '"/>'; }).join(''); };
  var eyes = mood === 'happy'
    ? '<path d="M24.5 36.5q2.5-3 5 0M34.5 36.5q2.5-3 5 0" stroke="' + ink + '" stroke-width="2" fill="none" stroke-linecap="round"/>'
    : mood === 'sorry'
      ? '<path d="M24 33.8l5-1.7M40 33.8l-5-1.7" stroke="' + ink + '" stroke-width="1.8" stroke-linecap="round"/><circle cx="27" cy="37" r="2" fill="' + ink + '"/><circle cx="37" cy="37" r="2" fill="' + ink + '"/>'
      : '<circle cx="27" cy="36.5" r="2.2" fill="' + ink + '"/><circle cx="37" cy="36.5" r="2.2" fill="' + ink + '"/>';
  var mouth = mood === 'happy'
    ? '<path d="M28.5 42.5q3.5 6.5 7 0z" fill="#E36F67" stroke="' + ink + '" stroke-width="1.6" stroke-linejoin="round"/>'
    : mood === 'sorry'
      ? '<path d="M29.5 45q2.5-2 5 0" stroke="' + ink + '" stroke-width="1.7" fill="none" stroke-linecap="round"/>'
      : '<path d="M29.5 42.8q1.25 1.6 2.5 0q1.25 1.6 2.5 0" stroke="' + ink + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  return '<svg viewBox="-2 2 68 66" aria-hidden="true">' +
    ring(puffs, 4) + fill(puffs) + '<circle cx="32" cy="36" r="20" fill="' + fluff + '"/>' +
    '<ellipse cx="17.5" cy="36" rx="5.5" ry="3.2" transform="rotate(-25 17.5 36)" fill="' + face + '" stroke="' + ink + '" stroke-width="1.8"/>' +
    '<ellipse cx="46.5" cy="36" rx="5.5" ry="3.2" transform="rotate(25 46.5 36)" fill="' + face + '" stroke="' + ink + '" stroke-width="1.8"/>' +
    '<ellipse cx="32" cy="38" rx="11.5" ry="12" fill="' + face + '" stroke="' + ink + '" stroke-width="2"/>' +
    ring(tuft, 3.6) + fill(tuft) +
    eyes + '<ellipse cx="23.5" cy="41.5" rx="3" ry="1.9" fill="' + cheek + '"/><ellipse cx="40.5" cy="41.5" rx="3" ry="1.9" fill="' + cheek + '"/>' + mouth + '</svg>';
},
  mirror: '<svg class="ico" viewBox="0 0 72 72" aria-hidden="true"><rect x="7" y="5" width="58" height="62" rx="9" fill="#7A5434"/><rect x="16" y="14" width="40" height="44" rx="4" fill="#CFE3F5"/><path d="M21 19 L33 19 L21 33Z" fill="#fff" opacity=".75"/><g fill="#FFD84D" stroke="#B38F14" stroke-width="1"><circle cx="11.5" cy="16" r="3"/><circle cx="11.5" cy="30" r="3"/><circle cx="11.5" cy="44" r="3"/><circle cx="11.5" cy="58" r="3"/><circle cx="60.5" cy="16" r="3"/><circle cx="60.5" cy="30" r="3"/><circle cx="60.5" cy="44" r="3"/><circle cx="60.5" cy="58" r="3"/></g></svg>',
  lamp: '<svg class="ico" viewBox="0 0 72 72" aria-hidden="true"><rect x="16" y="56" width="40" height="8" rx="3" fill="#5F5E5A"/><rect x="31" y="46" width="10" height="12" fill="#5F5E5A"/><rect x="6" y="16" width="60" height="32" rx="10" fill="#E0402F"/><rect x="11" y="21" width="50" height="22" rx="6" fill="#F7826F"/><text x="36" y="38" text-anchor="middle" font-size="15" font-weight="700" fill="#fff" font-family="sans-serif">本番中</text></svg>',
  go: '<svg class="ico" viewBox="0 0 72 72" aria-hidden="true"><rect x="4" y="4" width="64" height="64" rx="14" fill="#1F2147"/><circle cx="36" cy="36" r="22" fill="#7ED957"/><circle cx="36" cy="36" r="22" fill="none" stroke="#C0DD97" stroke-width="3" opacity=".6"/><text x="36" y="43" text-anchor="middle" font-size="19" font-weight="700" fill="#173404" font-family="sans-serif">GO</text></svg>',
  vase: function (i) { return '<svg class="vase" viewBox="0 0 44 64" aria-hidden="true"><path d="M22 34 V14" stroke="#9BE15D" stroke-width="3" stroke-linecap="round"/><circle cx="22" cy="12" r="6" fill="' + PALETTE[(i + 3) % 8] + '" opacity=".35"/><path d="M8 34 H36 L32 60 H12Z" fill="#E8857A" opacity=".9"/><rect x="6" y="32" width="32" height="6" rx="3" fill="#C4564B"/></svg>'; }
};

/* ===================== API ===================== */
var ADMIN_ACTIONS = ['desk', 'saveWork', 'uploadPoster', 'cast', 'saveActor', 'reissueCode', 'setActorActive', 'deleteActor',
  'shelf', 'saveScriptNote', 'setScriptStatus', 'startUpload', 'uploadChunk', 'downloadChunk',
  'roles', 'saveRole', 'deleteRole', 'aiRoles', 'audios', 'saveAudioNote', 'deleteAudio', 'setAdminCode'];
var WRITES = ['saveWork', 'uploadPoster', 'saveActor', 'reissueCode', 'setActorActive', 'deleteActor', 'saveScriptNote', 'setScriptStatus', 'uploadChunk',
  'saveRole', 'deleteRole', 'aiRoles', 'saveAudioNote', 'deleteAudio'];
function api(action, payload) {
  return rawApi(action, payload).then(function (d) {
    if (WRITES.indexOf(action) >= 0) clearReads();
    return d;
  }, function (e) {
    var code = store.get('adminCode', '');
    if (e && e.code === 'auth' && code && ADMIN_ACTIONS.indexOf(action) >= 0 && !(payload && payload.asMember)) {
      /* 管理者の入館証が切れたら、覚えているコードで入り直す */
      return rawApi('adminLogin', { code: code }).then(function (r) {
        store.set('admin', r.token); return api(action, payload);
      }, function () { store.del('adminCode'); throw e; });
    }
    throw e;
  });
}
/* 読み込みを速くする：前回の結果をすぐ出し、裏で最新を取って違えば描き直す */
function ckey(action, payload) { return 'c.' + action + '.' + JSON.stringify(payload || {}); }
function clearReads() {
  try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf('gakuya.c.') === 0) localStorage.removeItem(k); }); } catch (e) { }
}
function cachedAll(list, show) {
  var olds = list.map(function (x) { return store.get(ckey(x[0], x[1]), null); });
  var shown = olds.every(function (v) { return v !== null; }) ? JSON.stringify(olds) : null;
  if (shown) show(olds, true);
  return Promise.all(list.map(function (x) {
    return api(x[0], x[1]).then(function (d) { store.set(ckey(x[0], x[1]), d); return d; });
  })).then(function (r) {
    if (JSON.stringify(r) !== shown) show(r, false);
    return r;
  }, function (e) {
    if (shown && e && e.code === 'network') return olds;
    throw e;
  });
}
function prefetch(list) { cachedAll(list, function () { }).catch(function () { }); }
function rawApi(action, payload) {
  payload = payload || {};
  var token = (action === 'me' || payload.asMember) ? (store.get('passes', {})[payload.workId] || '') :
    ADMIN_ACTIONS.indexOf(action) >= 0 ? store.get('admin', '') : '';
  return new Promise(function (resolve, reject) {
    var done = function (r) { r && r.ok ? resolve(r.data) : reject(r || { code: 'error', message: '問題が起きました' }); };
    var fail = function () { reject({ code: 'network', message: '通信できませんでした。電波のよい場所でもう一度試してください' }); };
    if (MODE === 'gas') google.script.run.withSuccessHandler(done).withFailureHandler(fail).api(action, payload, token);
    else if (MODE === 'http') fetch(window.API_URL, { method: 'POST', body: JSON.stringify({ action: action, payload: payload, token: token }) })
      .then(function (r) { return r.json(); }).then(done).catch(fail);
    else setTimeout(function () { done(DEMO.api(action, payload, token)); }, 260);
  });
}
function onAuthError(e, area) {
  if (e && e.code === 'auth') {
    if (area === 'admin') { store.del('admin'); toast(e.message); go('/admin'); return true; }
  }
  return false;
}

/* ===================== ポスター ===================== */
var posterCache = store.get('posters', {});
function savePosters() { store.set('posters', posterCache); }
function posterArt(w, small) {
  var src = posterCache[w.id];
  if (src) return '<img src="' + src + '" alt="">';
  return '<span class="gen" style="--hue:' + [338, 42, 205, 150, 268, 14][hash(w.id + w.title) % 6] + '"><b>' + esc(w.title) + '</b></span>';
}
function loadPosters(works, after) {
  works.filter(function (w) { return w.hasPoster && !posterCache[w.id]; }).forEach(function (w) {
    api('poster', { workId: w.id }).then(function (src) { if (src) { posterCache[w.id] = src; savePosters(); after(w.id); } }).catch(function () { });
  });
}

/* ===================== 楽屋口（作品一覧） ===================== */
function viewDoor() {
  var passes = store.get('passes', {});
  app.innerHTML = demoBar() +
    '<header class="sky"><div class="sky-in"><a class="logo" href="#/"><img src="' + LOGO + '" alt="劇団もしょこむ" width="160" height="86">' +
    '<span class="logo-t">楽屋<small>読み合わせ・セリフ練習</small></span></a></div>' +
    '<p class="lead">' + ART.sheep('happy').replace('<svg', '<svg class="sky-sheep"') + 'ようこそ、楽屋へ。稽古する作品を選んでね。</p></header>' +
    '<main class="wrap">' + installCard() +
    '<div class="theater"><span class="th-stage" aria-hidden="true"></span><span class="th-curtain l" aria-hidden="true"></span><span class="th-curtain r" aria-hidden="true"></span>' +
    '<span class="th-valance" aria-hidden="true"></span><div class="doors" id="board"><div class="skel"></div><div class="skel"></div></div><span class="th-floor" aria-hidden="true"></span></div>' +
    '<p class="foot"><a class="link" href="#/admin">舞台監督（管理者）の方はこちら</a></p></main>';
  bindInstall();
  if (store.get('admin', '')) prefetch([['desk'], ['shelf', {}]]);
  cachedAll([['listWorks']], function (r) {
    var works = r[0];
    var b = document.getElementById('board');
    if (!b) return;
    if (!works.length) { b.outerHTML = '<div class="empty">まだ台本が届いていません。<br>舞台監督が作品を登録するとここに並びます。</div>'; return; }
    b.innerHTML = works.map(function (w) {
      var me = passes[w.id] ? store.get('me.' + w.id, null) : null;
      return '<button class="door' + (w.status === 'closed' ? ' closed' : '') + '" data-id="' + esc(w.id) + '" aria-label="' + esc(w.title) + 'の楽屋に入る">' +
        doorArt(w, passes[w.id] ? (me && me.actor ? me.actor.name + 'さん' : 'わたしの楽屋') : '') + badge(w) +
        '<span class="cap">' + esc(dateLine(w)) + (w.venue ? '<small>' + esc(w.venue) + '</small>' : '') + '</span></button>';
    }).join('');
    var byId = {}; works.forEach(function (w) { byId[w.id] = w; });
    b.onclick = function (ev) {
      var p = ev.target.closest('.door'); if (!p) return;
      var w = byId[p.dataset.id];
      if (store.get('passes', {})[w.id]) enterWork(w); else tryRemembered(w);
    };
    loadPosters(works, function () { });
  }).catch(function (e) {
    if (store.get(ckey('listWorks'), null)) return;
    var b = document.getElementById('board');
    if (b) b.outerHTML = '<div class="empty">' + esc(e.message) + '</div>';
  });
}

/* 扉の奥の楽屋（畳と両脇の鏡台） */
function roomSvg() {
  var bulbsL = '', bulbsR = '';
  [[7, 49], [7, 58], [7, 67], [7, 76], [22, 56], [22, 64], [22, 72], [22, 80]].forEach(function (p) { bulbsL += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.3" fill="#FFE58A"/>'; });
  [[93, 49], [93, 58], [93, 67], [93, 76], [78, 56], [78, 64], [78, 72], [78, 80]].forEach(function (p) { bulbsR += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.3" fill="#FFE58A"/>'; });
  return '<svg class="room" viewBox="0 0 100 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    '<defs><linearGradient id="rmWall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#F6ECD8"/><stop offset="1" stop-color="#E6D5B6"/></linearGradient>' +
    '<linearGradient id="rmSide" x1="0" x2="1"><stop offset="0" stop-color="#D9C6A2"/><stop offset="1" stop-color="#EBDDC2"/></linearGradient>' +
    '<linearGradient id="rmSideR" x1="1" x2="0"><stop offset="0" stop-color="#D9C6A2"/><stop offset="1" stop-color="#EBDDC2"/></linearGradient>' +
    '<linearGradient id="rmMirror" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#F2F7FB"/><stop offset="1" stop-color="#B9CCDA"/></linearGradient>' +
    '<radialGradient id="rmGlow" cx="50" cy="60" r="70" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF4D6" stop-opacity=".55"/><stop offset="1" stop-color="#FFF4D6" stop-opacity="0"/></radialGradient></defs>' +
    /* 天井 */
    '<polygon points="0,0 100,0 70,42 30,42" fill="#E4D3B3"/><rect x="40" y="14" width="20" height="2.2" rx="1" fill="#FFFBEA"/><rect x="40" y="16.2" width="20" height="1" fill="#E9D9B9"/>' +
    /* 奥の壁 */
    '<rect x="30" y="42" width="40" height="48" fill="url(#rmWall)"/>' +
    '<rect x="40" y="50" width="20" height="16" fill="#FFFDF6" stroke="#B8A27D" stroke-width=".6"/><text x="50" y="60.5" font-size="5" text-anchor="middle" fill="#7A5434" font-family="sans-serif" font-weight="700">楽屋</text>' +
    '<line x1="34" y1="72" x2="66" y2="72" stroke="#9A7A52" stroke-width=".8"/>' +
    '<path d="M38 72 v6 M46 72 v7 M55 72 v5 M62 72 v6" stroke="#7A5434" stroke-width=".5"/>' +
    '<rect x="36" y="77" width="5" height="8" rx="1" fill="#C4564B"/><rect x="44" y="78" width="5" height="7" rx="1" fill="#2F6FA3"/><rect x="53" y="76" width="5" height="9" rx="1" fill="#FFD84D"/><rect x="60" y="77" width="5" height="8" rx="1" fill="#6A55B5"/>' +
    /* 左右の壁と鏡台 */
    '<polygon points="0,0 30,42 30,90 0,124" fill="url(#rmSide)"/>' +
    '<polygon points="100,0 70,42 70,90 100,124" fill="url(#rmSideR)"/>' +
    '<polygon points="5,46 24,54 24,82 5,79" fill="#7A5434"/><polygon points="7.5,49.5 21.5,56 21.5,79.5 7.5,77" fill="url(#rmMirror)"/>' +
    '<polygon points="95,46 76,54 76,82 95,79" fill="#7A5434"/><polygon points="92.5,49.5 78.5,56 78.5,79.5 92.5,77" fill="url(#rmMirror)"/>' +
    bulbsL + bulbsR +
    '<polygon points="0,84 28,88 28,92 0,90" fill="#8E6A42"/><polygon points="100,84 72,88 72,92 100,90" fill="#8E6A42"/>' +
    /* 畳 */
    '<polygon points="30,90 70,90 100,124 100,160 0,160 0,124" fill="#C8C27C"/>' +
    '<g stroke="#3E5A3A" stroke-width="1.1" fill="none"><polyline points="30,90 70,90"/><line x1="50" y1="90" x2="50" y2="160"/>' +
    '<line x1="19" y1="104" x2="81" y2="104"/><line x1="6" y1="124" x2="94" y2="124"/></g>' +
    '<g stroke="#B3AC66" stroke-width=".35"><line x1="40" y1="90" x2="25" y2="160"/><line x1="60" y1="90" x2="75" y2="160"/><line x1="35" y1="90" x2="12" y2="160"/><line x1="65" y1="90" x2="88" y2="160"/></g>' +
    /* 座布団 */
    '<ellipse cx="17" cy="112" rx="9" ry="3.6" fill="#B01E26"/><ellipse cx="83" cy="112" rx="9" ry="3.6" fill="#2F4E8C"/>' +
    '<rect width="100" height="160" fill="url(#rmGlow)"/></svg>';
}

/* 和室の楽屋の小道具 */
var PROPS = (function () {
  var K = '#231F2B';
  var st = ' stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
  function stripA() {
    return '<svg class="props" viewBox="0 0 400 130" aria-hidden="true">' +
      /* 番傘 */
      '<line x1="62" y1="70" x2="40" y2="122"' + st + '/>' +
      '<path d="M8 72 Q62 0 116 72 Z" fill="#E0402F"' + st + '/>' +
      '<path d="M62 30 L20 70 M62 30 L44 72 M62 30 L62 72 M62 30 L80 72 M62 30 L104 70" stroke="#8E1E14" stroke-width="1.4" fill="none"/>' +
      '<path d="M30 56 Q62 26 94 56" stroke="#FFF8EC" stroke-width="4" fill="none"/>' +
      '<circle cx="62" cy="30" r="4" fill="#FFD23F"' + st + '/>' +
      /* 畳んだ着物 */
      '<rect x="128" y="98" width="70" height="20" rx="3" fill="#2F4E8C"' + st + '/>' +
      '<g fill="#FFF8EC"><circle cx="140" cy="108" r="2"/><circle cx="156" cy="104" r="2"/><circle cx="172" cy="110" r="2"/><circle cx="188" cy="105" r="2"/></g>' +
      '<rect x="132" y="80" width="62" height="18" rx="3" fill="#FF9EC4"' + st + '/>' +
      '<path d="M138 89 h50" stroke="#D2412F" stroke-width="2" stroke-dasharray="4 4"/>' +
      '<rect x="138" y="66" width="50" height="14" rx="3" fill="#FFD23F"' + st + '/>' +
      '<rect x="156" y="66" width="14" height="14" fill="#E0402F"' + st + '/>' +
      /* メイクボックス */
      '<polygon points="210,80 268,80 262,52 216,52" fill="#BFD7EA"' + st + '/>' +
      '<rect x="206" y="80" width="66" height="40" rx="4" fill="#8E3A31"' + st + '/>' +
      '<rect x="230" y="74" width="18" height="8" rx="2" fill="#FFD23F"' + st + '/>' +
      '<line x1="216" y1="80" x2="210" y2="60"' + st + '/><line x1="224" y1="80" x2="226" y2="56"' + st + '/>' +
      '<circle cx="210" cy="58" r="3" fill="#FF7A66"' + st + '/>' +
      /* 急須と湯のみ */
      '<path d="M282 100 q-10 -6 -14 -14"' + st + ' fill="none"/>' +
      '<ellipse cx="300" cy="104" rx="20" ry="15" fill="#3E7A55"' + st + '/>' +
      '<rect x="294" y="84" width="12" height="6" rx="2" fill="#3E7A55"' + st + '/>' +
      '<path d="M320 96 q10 4 4 14"' + st + ' fill="none"/>' +
      '<path d="M330 104 h16 l-2 16 h-12 z" fill="#FFF8EC"' + st + '/>' +
      '<path d="M331 110 h14" stroke="#3E7A55" stroke-width="2"/>' +
      /* 扇子 */
      '<path d="M362 122 L340 82 A44 44 0 0 1 396 78 Z" fill="#FFD23F"' + st + '/>' +
      '<path d="M362 122 L350 80 M362 122 L360 76 M362 122 L370 75 M362 122 L381 75 M362 122 L390 77" stroke="#D2412F" stroke-width="1.6"/>' +
      '</svg>';
  }
  function stripB() {
    return '<svg class="props" viewBox="0 0 400 130" aria-hidden="true">' +
      /* かつら台 */
      '<rect x="22" y="112" width="34" height="8" rx="2" fill="#7A5434"' + st + '/>' +
      '<line x1="39" y1="112" x2="39" y2="82"' + st + '/>' +
      '<ellipse cx="39" cy="66" rx="15" ry="18" fill="#F6E3C8"' + st + '/>' +
      '<path d="M24 64 Q24 44 39 44 Q54 44 54 64 Q46 54 39 56 Q32 54 24 64Z" fill="' + K + '"/>' +
      '<circle cx="39" cy="38" r="8" fill="' + K + '"/><line x1="26" y1="40" x2="52" y2="36" stroke="#FFD23F" stroke-width="2.4"/>' +
      /* 台本の山 */
      '<g transform="rotate(-6 100 104)"><rect x="70" y="94" width="62" height="22" rx="2" fill="#F7D9D3"' + st + '/><rect x="70" y="94" width="8" height="22" fill="#D2412F"' + st + '/></g>' +
      '<g transform="rotate(4 104 86)"><rect x="76" y="76" width="58" height="20" rx="2" fill="#D7E8F5"' + st + '/><rect x="76" y="76" width="8" height="20" fill="#2F6FA3"' + st + '/></g>' +
      '<rect x="118" y="66" width="8" height="14" fill="#FFD23F"' + st + '/>' +
      /* 差し入れの紙袋 */
      '<polygon points="160,70 214,70 218,120 156,120" fill="#D9B77E"' + st + '/>' +
      '<path d="M172 70 q0 -16 15 -16 q15 0 15 16" fill="none"' + st + '/>' +
      '<rect x="170" y="84" width="34" height="18" rx="3" fill="#FFF8EC"' + st + '/>' +
      '<text x="187" y="98" font-size="12" text-anchor="middle" font-weight="700" fill="#D2412F" font-family="sans-serif">差入</text>' +
      /* 下駄 */
      '<rect x="232" y="96" width="22" height="26" rx="8" fill="#C8A06A"' + st + '/>' +
      '<rect x="260" y="92" width="22" height="26" rx="8" fill="#C8A06A"' + st + '/>' +
      '<path d="M236 102 L243 110 L250 102 M264 98 L271 106 L278 98" stroke="#E0402F" stroke-width="3" fill="none"/>' +
      /* ペットボトル */
      '<path d="M300 120 v-38 q0 -8 6 -12 v-6 h8 v6 q6 4 6 12 v38 z" fill="#BFE6F5"' + st + '/>' +
      '<rect x="305" y="58" width="10" height="6" fill="#2F6FA3"' + st + '/>' +
      '<rect x="300" y="92" width="20" height="10" fill="#5BC0EB"' + st + '/>' +
      /* 花束 */
      '<polygon points="350,122 336,78 390,78 376,122" fill="#FF9EC4"' + st + '/>' +
      '<circle cx="348" cy="72" r="9" fill="#FFD23F"' + st + '/><circle cx="364" cy="64" r="10" fill="#E0402F"' + st + '/>' +
      '<circle cx="380" cy="72" r="9" fill="#B9A3F5"' + st + '/><circle cx="364" cy="80" r="6" fill="#FFF8EC"' + st + '/>' +
      '<path d="M352 96 l24 0" stroke="#D2412F" stroke-width="3"/>' +
      '</svg>';
  }
  /* 背景の畳にちらばる小物（くり返し模様） */
  function tile() {
    var s = ' stroke="' + K + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="440" viewBox="0 0 360 440">' +
      '<g transform="rotate(-18 30 60)"><rect x="10" y="48" width="44" height="18" rx="9" fill="#FFF8EC"' + s + '/><path d="M20 48 v18 M44 48 v18" stroke="#5BC0EB" stroke-width="3"/></g>' +
      '<g transform="rotate(12 320 40)"><rect x="300" y="24" width="38" height="30" fill="#FFFDF6"' + s + '/><path d="M306 32 h26 M306 39 h22 M306 46 h18" stroke="#9A8F7A" stroke-width="1.6"/></g>' +
      '<g transform="rotate(25 30 250)"><rect x="8" y="244" width="46" height="9" rx="4" fill="#E0402F"' + s + '/><rect x="46" y="238" width="16" height="21" rx="4" fill="#FFD23F"' + s + '/></g>' +
      '<g><circle cx="328" cy="236" r="16" fill="#FF9EC4"' + s + '/><circle cx="328" cy="236" r="6" fill="#FFF8EC"' + s + '/></g>' +
      '<g transform="rotate(-10 40 400)"><rect x="14" y="386" width="54" height="30" rx="4" fill="#B9A3F5"' + s + '/><path d="M14 398 h54" stroke="#FFD23F" stroke-width="4"/></g>' +
      '<g transform="rotate(30 320 400)"><path d="M300 400 h44 M322 400 v-20 M314 384 l8 -6 l8 6" fill="none"' + s + '/></g>' +
      '</svg>';
  }
  return { a: stripA, b: stripB, tile: tile };
})();
/* 触ると「プルッ」と動く小道具 */
var TOYS = (function () {
  var K = '#231F2B';
  var st = ' stroke="' + K + '" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"';
  var svg = function (body) { return '<svg viewBox="0 0 80 80" aria-hidden="true">' + body + '</svg>'; };
  var list = {
    makeup: ['メイク道具', 'ぽんぽん、お化粧直し', svg(
      '<rect x="8" y="30" width="50" height="32" rx="8" fill="#FF9EC4"' + st + '/>' +
      '<circle cx="21" cy="42" r="5" fill="#E0402F"' + st + '/><circle cx="35" cy="42" r="5" fill="#FFD23F"' + st + '/><circle cx="48" cy="42" r="5" fill="#5BC0EB"' + st + '/>' +
      '<rect x="15" y="51" width="36" height="6" rx="3" fill="#FFF8EC"' + st + '/>' +
      '<line x1="56" y1="66" x2="72" y2="18"' + st + '/><path d="M70 22 l4 -12 l3 2 l-2 12 z" fill="#7A5434"' + st + '/>')],
    mirror: ['手鏡', 'うん、今日もいい顔', svg(
      '<rect x="35" y="50" width="10" height="26" rx="5" fill="#FF7A66"' + st + '/>' +
      '<circle cx="40" cy="32" r="24" fill="#FF7A66"' + st + '/><circle cx="40" cy="32" r="17" fill="#D7E8F5"' + st + '/>' +
      '<path d="M30 26 q4 -8 12 -9" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>')],
    fan: ['扇子', 'パタパタ…', svg(
      '<path d="M40 74 L8 34 A46 46 0 0 1 72 34 Z" fill="#FFD23F"' + st + '/>' +
      '<path d="M40 74 L19 24 M40 74 L32 18 M40 74 L48 18 M40 74 L61 24" stroke="#D2412F" stroke-width="2"/>' +
      '<circle cx="40" cy="72" r="3.5" fill="' + K + '"/>')],
    afro: ['アフロのカツラ', 'これで主役の座はいただき', svg(
      '<g fill="#3B2A22"' + st + '><circle cx="22" cy="38" r="13"/><circle cx="40" cy="24" r="15"/><circle cx="58" cy="38" r="13"/><circle cx="30" cy="52" r="12"/><circle cx="50" cy="52" r="12"/><circle cx="40" cy="42" r="15"/></g>' +
      '<g fill="#6B4A3A"><circle cx="34" cy="20" r="3"/><circle cx="54" cy="32" r="2.5"/><circle cx="24" cy="44" r="2.5"/><circle cx="44" cy="50" r="3"/></g>' +
      '<rect x="27" y="62" width="26" height="8" rx="4" fill="#E0402F"' + st + '/>')],
    towel: ['手ぬぐい', '汗ふき、だいじ', svg(
      '<path d="M10 22 h60 v34 h-60 z" fill="#2F6FA3"' + st + '/>' +
      '<path d="M10 34 q8 -6 15 0 t15 0 t15 0 t15 0 M10 46 q8 -6 15 0 t15 0 t15 0 t15 0" stroke="#FFF8EC" stroke-width="3" fill="none"/>' +
      '<path d="M10 56 l-4 8 M18 56 l-2 8 M62 56 l2 8 M70 56 l4 8" stroke="' + K + '" stroke-width="2"/>')],
    tape: ['養生テープ', 'ビーッ！バミっとこ', svg(
      '<path d="M40 40 L74 52 L72 62 L38 50 Z" fill="#9BE15D"' + st + '/>' +
      '<circle cx="34" cy="38" r="24" fill="#9BE15D"' + st + '/><circle cx="34" cy="38" r="11" fill="#FFF8EC"' + st + '/>' +
      '<circle cx="34" cy="38" r="17" fill="none" stroke="#6FBF3A" stroke-width="2"/>')],
    mic: ['マイク', 'あー、あー、本日は晴天なり', svg(
      '<path d="M34 42 L28 76 h12 L44 42 z" fill="' + K + '"/>' +
      '<rect x="30" y="38" width="20" height="8" rx="3" fill="#B4B2A9"' + st + '/>' +
      '<circle cx="40" cy="24" r="16" fill="#D3D1C7"' + st + '/>' +
      '<path d="M28 18 h24 M26 26 h28 M30 34 h20 M34 10 v28 M46 10 v28" stroke="#888780" stroke-width="1.6"/>')],
    script: ['台本', '付箋、貼りすぎた？', svg(
      '<rect x="14" y="14" width="46" height="58" rx="3" fill="#F7D9D3"' + st + '/>' +
      '<rect x="14" y="14" width="10" height="58" fill="#D2412F"' + st + '/>' +
      '<path d="M30 28 h22 M30 36 h18 M30 44 h22 M30 52 h14" stroke="' + K + '" stroke-width="2"/>' +
      '<rect x="58" y="20" width="12" height="8" fill="#FFD23F"' + st + '/><rect x="58" y="34" width="12" height="8" fill="#5BC0EB"' + st + '/><rect x="58" y="48" width="12" height="8" fill="#FF9EC4"' + st + '/>')],
    nosegl: ['鼻メガネ', 'だれだか、わからないでしょ', svg(
      '<circle cx="24" cy="30" r="12" fill="#FFF8EC"' + st + '/><circle cx="56" cy="30" r="12" fill="#FFF8EC"' + st + '/>' +
      '<path d="M36 30 q4 -4 8 0 M12 28 l-6 -4 M68 28 l6 -4"' + st + ' fill="none"/>' +
      '<path d="M40 30 q-9 20 -2 26 q4 3 8 0 q3 -8 -6 -26z" fill="#F4A7B9"' + st + '/>' +
      '<path d="M22 64 q8 -9 18 -3 q10 -6 18 3 q-10 6 -18 0 q-8 6 -18 0z" fill="' + K + '"/>')],
    castanet: ['カスタネット', 'カッ！カッ！', svg(
      '<circle cx="40" cy="44" r="26" fill="#2F6FA3"' + st + '/>' +
      '<path d="M14 44 a26 26 0 0 0 52 0 z" fill="#E0402F"' + st + '/>' +
      '<path d="M32 18 q8 -10 16 0" stroke="#FFD23F" stroke-width="4" fill="none" stroke-linecap="round"/>')],
    bottle: ['ペットボトル', 'こまめに水分補給', svg(
      '<path d="M28 76 V34 q0 -9 7 -13 V12 h10 v9 q7 4 7 13 v42 z" fill="#BFE6F5"' + st + '/>' +
      '<rect x="34" y="6" width="12" height="8" rx="2" fill="#2F6FA3"' + st + '/>' +
      '<rect x="28" y="44" width="24" height="14" fill="#5BC0EB"' + st + '/>' +
      '<path d="M33 66 q7 -4 14 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>')]
  };
  function row(keys) {
    return '<div class="toys">' + keys.map(function (k, i) {
      var t = list[k], tilt = [-8, 6, -4, 9, -6, 4][i % 6], lift = [0, 10, 4, 14, 2, 8][i % 6];
      return '<button type="button" class="toy" data-toy="' + k + '" aria-label="' + t[0] + '" style="--t:' + tilt + 'deg;--y:' + lift + 'px">' + t[2] + '</button>';
    }).join('') + '</div>';
  }
  return { list: list, row: row };
})();

var PROPS_TILE = 'url("data:image/svg+xml,' + encodeURIComponent(PROPS.tile()).replace(/\(/g, '%28').replace(/\)/g, '%29') + '")';

/* 楽屋の扉（張り紙つき） */
var DOORS = ['#F3E6CF', '#E9D3C6', '#D9E2E6', '#E4E0D0', '#E8DDEA', '#DDE6D6', '#F0DCCB', '#DCD8E8'];
function doorArt(w, name) {
  var h = hash(w.id + w.title) % 8;
  return '<span class="d-frame" style="--dc:' + DOORS[h] + '">' +
    '<span class="d-inside" aria-hidden="true">' + roomSvg() + '</span>' +
    '<span class="d-leaf"><span class="d-front">' +
      '<span class="d-panel d-p1"></span><span class="d-panel d-p2"></span>' +
      '<span class="d-note"><small>劇団もしょこむ</small><b>' + esc(w.title) + '</b><em>' + (w.status === 'closed' ? '千秋楽' : '劇団員楽屋') + '</em></span>' +
      (name ? '<span class="d-name">' + esc(name) + '</span>' : '') +
      '<span class="d-knob" aria-hidden="true"></span></span>' +
    '<span class="d-back" aria-hidden="true"></span></span>' +
    '</span>';
}

/* 稽古台本の表紙 */
var COVERS = ['#F7D9D3', '#FBE7B5', '#D7E8F5', '#DDEFCF', '#E6DDF7', '#F6DCE7', '#D6EFEA', '#F3E3CF'];
var TAPES = ['#C4564B', '#B38F14', '#2F6FA3', '#4E8A2A', '#6A55B5', '#B0477A', '#2E8C7C', '#9A6A33'];
function cover(w, mine, opt) {
  opt = opt || {};
  var h = hash(w.id + w.title + (opt.seed || '')) % 8;
  return '<span class="cover' + (opt.state ? ' st-' + opt.state : '') + '" style="--cv:' + COVERS[h] + ';--tp:' + TAPES[h] + '">' +
    '<span class="bind" aria-hidden="true"><i></i><i></i><i></i></span>' +
    '<span class="cv-top">上演台本</span>' +
    '<span class="cv-title">' + esc(w.title) + '</span>' +
    '<span class="photo" aria-hidden="true">' + (posterCache[w.id] ? '<img src="' + posterCache[w.id] + '" alt="">' : '') + '</span>' +
    '<span class="cv-foot">劇団もしょこむ</span>' +
    (opt.label ? '<span class="cv-ver">' + esc(opt.label) + '</span>' : '') +
    (opt.state === 'final' ? '<span class="cv-stamp">確定版</span>' : '') +
    (opt.state === 'draft' ? '<span class="tab">確認中</span>' : '') +
    (mine ? '<span class="tab">わたしの台本</span>' : '') + '</span>';
}

/* 入館コードを覚えておく：一度入れたコードは、ほかの公演でも自動で試す */
function savePass(workId, r, code) {
  var passes = store.get('passes', {}); passes[workId] = r.token; store.set('passes', passes);
  store.set('me.' + workId, r);
  var norm = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (norm) {
    var codes = store.get('codes', []).filter(function (c) { return c !== norm; });
    codes.unshift(norm); store.set('codes', codes.slice(0, 8));
  }
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { }
}
function tryRemembered(w) {
  var codes = store.get('codes', []);
  if (!codes.length) { openPass(w); return; }
  toast('覚えている入館コードで確かめています…');
  var i = 0;
  var next = function () {
    if (i >= codes.length) { openPass(w); return; }
    var c = codes[i++];
    api('enter', { workId: w.id, code: c }).then(function (r) {
      savePass(w.id, r, c); toast(r.actor.name + 'さんの楽屋を開けます'); enterWork(w);
    }).catch(function (err) { if (err && err.code === 'locked') { openPass(w); return; } next(); });
  };
  next();
}

function openPass(w) {
  var v = document.createElement('div');
  v.className = 'veil';
  v.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="pass-t"><form class="pass" id="passForm">' +
    '<div class="pass-top"><b>入館パス</b><button type="button" class="btn quiet sm" id="passClose">閉じる</button></div>' +
    '<h2 id="pass-t">' + esc(w.title) + '</h2><p>舞台監督から届いた6文字のコードを入れてください。一度入れれば、この端末が覚えておきます。</p>' +
    '<label class="sr" for="codeIn">入館コード</label><input class="code-in" id="codeIn" maxlength="9" autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" inputmode="text" placeholder="・・・・・・">' +
    '<div class="say">' + ART.sheep() + '<div class="bubble" id="sheepSay">コードは大文字でも小文字でも大丈夫だよ</div></div>' +
    '<button class="btn main wide" style="margin-top:14px" id="passGo">入館する</button></form></div>';
  document.body.appendChild(v);
  var close = function () { v.remove(); };
  v.addEventListener('click', function (e) { if (e.target === v) close(); });
  v.querySelector('#passClose').onclick = close;
  var input = v.querySelector('#codeIn');
  setTimeout(function () { input.focus(); }, 300);
  v.querySelector('#passForm').onsubmit = function (e) {
    e.preventDefault();
    var code = input.value.trim();
    var say = v.querySelector('.say');
    if (code.replace(/[^0-9a-z]/gi, '').length < 6) { say.innerHTML = ART.sheep('sorry') + '<div class="bubble">6文字のコードを入れてね</div>'; return; }
    var btn = v.querySelector('#passGo'); btn.disabled = true; btn.textContent = '確かめています…';
    api('enter', { workId: w.id, code: code }).then(function (r) {
      savePass(w.id, r, code);
      close(); enterWork(w);
    }).catch(function (err) {
      btn.disabled = false; btn.textContent = '入館する';
      say.innerHTML = ART.sheep('sorry') + '<div class="bubble">' + esc(err.message) + '</div>';
      var pass = v.querySelector('.pass'); pass.classList.remove('shake'); void pass.offsetWidth; pass.classList.add('shake');
      input.select();
    });
  };
}

function enterWork(w) { enterDoor(w); }

/* 幕が開き、扉が開いて、畳の楽屋の中へ歩いて入る */
function enterDoor(w) {
  var d = document.querySelector('.door[data-id="' + w.id + '"]');
  var th = document.querySelector('.theater');
  if (REDUCED || !d || !th) { go('/w/' + w.id); return; }
  th.classList.add('opening');
  d.classList.add('open');
  setTimeout(function () {
    var r = d.querySelector('.d-inside').getBoundingClientRect();
    var f = document.createElement('div');
    f.className = 'walk';
    f.innerHTML = '<div class="walk-room" style="left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px">' + roomSvg() + '</div>';
    document.body.appendChild(f);
    var wr = f.firstChild;
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      f.classList.add('in');
      wr.style.left = '0px'; wr.style.top = '0px'; wr.style.width = '100%'; wr.style.height = '100%';
    }); });
    setTimeout(function () { f.classList.add('deep'); }, 700);
    setTimeout(function () { go('/w/' + w.id); }, 1250);
    setTimeout(function () { f.classList.add('done'); }, 1300);
    setTimeout(function () { f.remove(); }, 1800);
  }, 850);
}

/* ===================== 作品の楽屋（ホーム） ===================== */
function viewHome(id) {
  if (!store.get('passes', {})[id]) { go('/'); return; }
  var cached = store.get('me.' + id, null);
  if (cached) renderHome(cached); else app.innerHTML = loading();
  api('me', { workId: id }).then(function (r) { store.set('me.' + id, r); renderHome(r); }).catch(function (e) {
    if (e.code === 'auth' || e.code === 'notfound') {
      var passes = store.get('passes', {}); delete passes[id]; store.set('passes', passes); store.del('me.' + id);
      toast(e.message); go('/');
    } else if (!cached) app.innerHTML = '<div class="empty">' + esc(e.message) + '</div>';
  });
}
function renderHome(r) {
  var w = r.work, a = r.actor;
  var hasScript = !!r.script, hasAudio = !!(r.audios && r.audios.length);
  var modes = [
    ['script', '台本を見る', hasScript ? r.script.label + '（確定版）を開きます' : '確定版の台本が届くと開けます', TOYS.list.script[2], hasScript ? '' : '台本待ち'],
    ['learn', '覚える', '自分の番で止まります。言えたか自動で確かめます', ART.mirror, '準備中'],
    ['listen', '聞き流す', hasAudio ? '読み合わせの録音（' + r.audios.length + '件）を流します' : '読み合わせの録音が届くと使えます', ART.lamp, hasAudio ? '' : '録音待ち'],
    ['drive', '運転中', '画面を見ずに、声だけで練習します', ART.go, '準備中']
  ];
  document.body.className = 'room-theme';
  document.body.style.setProperty('--tile', PROPS_TILE);
  app.innerHTML = demoBar() + '<header class="roomhero">' + roomSvg() +
    '<a class="back pill" href="#/">← 楽屋口へ</a>' + badge(w) +
    '<div class="sign"><small>劇団員楽屋</small><h1>' + esc(w.title) + '</h1><span class="meta">' + esc(dateLine(w)) + (w.venue ? '・' + esc(w.venue) : '') + '</span></div>' +
    '</header><main class="wrap tatami-in">' +
    '<div class="tapes"><span>あなたの役</span>' + (a.roles.length ? a.roles.map(tape).join('') : '<span>（未定）</span>') + '</div>' +
    '<div class="say hello">' + ART.sheep('happy') + '<div class="bubble">' + esc(a.name) + 'さん、楽屋へようこそ。' + (hasScript ? '台本が届いているよ。さっそく開いてみよう' : '台本が届いたら、ここから稽古できるよ') + '</div></div>' +
    TOYS.row(['makeup', 'mirror', 'afro', 'fan', 'mic', 'towel']) +
    '<div class="modes">' + modes.map(function (m) {
      return '<button class="mode mm-' + m[0] + '"' + (m[4] ? ' aria-disabled="true"' : '') + ' data-mode="' + m[0] + '"><span class="m-ico">' + (m[3].indexOf('class=') < 0 ? m[3].replace('<svg', '<svg class="ico"') : m[3]) + '</span><span><b>' + m[1] + '</b><small>' + esc(m[2]) + '</small></span>' + (m[4] ? '<span class="soon">' + m[4] + '</span>' : '') + '</button>';
    }).join('') + '<div class="prog modeprog" hidden><i></i></div></div>' +
    '<h2 class="sec-t">楽屋花</h2><div class="flowers">' + [0, 1, 2, 3].map(ART.vase).join('') +
    '<p>場ごとに覚え具合の花が咲きます。全部の場が満開になったら、千秋楽の準備はばっちり。</p></div>' +
    TOYS.row(['script', 'nosegl', 'castanet', 'tape', 'bottle']) +
    '<p class="foot"><button class="btn quiet sm" id="dropPass">この入館パスを外す</button></p></main>';
  bindToys(app.querySelector('.tatami-in'));
  app.querySelector('.modes').onclick = function (e) {
    var b = e.target.closest('.mode'); if (!b) return;
    var m = b.dataset.mode;
    if (m === 'learn' || m === 'drive') { toast('セリフの割り振りができると使えます。いま舞台監督が準備しています'); return; }
    if (m === 'listen') { if (hasAudio) go('/w/' + w.id + '/listen'); else toast('読み合わせの録音が届くと使えます'); return; }
    if (m === 'script') {
      if (!hasScript) { toast('確定版の台本が届くと開けます'); return; }
      var bar = app.querySelector('.modeprog'); bar.hidden = false; b.disabled = true;
      var x = Object.assign({ workId: w.id }, r.script);
      scriptBlob(x, function (p) { bar.firstChild.style.width = Math.round(p * 100) + '%'; }, 'script', true)
        .then(function (blob) { bar.hidden = true; b.disabled = false; viewPdf(blob, x); })
        .catch(function (err) { bar.hidden = true; b.disabled = false; toast(err.message || '台本を開けませんでした'); });
    }
  };
  document.getElementById('dropPass').onclick = function () {
    var passes = store.get('passes', {}); delete passes[w.id]; store.set('passes', passes); store.del('me.' + w.id);
    toast('入館パスを外しました'); go('/');
  };
}

/* ===================== 聞き流す（録音の再生） ===================== */
var player = { audio: null, url: '', cur: null, timer: null };
function stopPlayer() {
  if (player.audio) { player.audio.pause(); savePos(); }
  clearInterval(player.timer);
}
function savePos() { if (player.cur && player.audio) store.set('pos.' + player.cur.id, Math.floor(player.audio.currentTime)); }
function clock(t) { t = Math.max(0, Math.floor(t || 0)); var h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s2 = t % 60; return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s2 < 10 ? '0' : '') + s2; }
function viewListen(id) {
  if (!store.get('passes', {})[id]) { go('/'); return; }
  var me = store.get('me.' + id, null);
  document.body.className = 'room-theme'; document.body.style.setProperty('--tile', PROPS_TILE);
  var draw = function (r) {
    var list = r.audios || [];
    app.innerHTML = '<header class="listenhead"><a class="back pill" href="#/w/' + esc(id) + '">← 楽屋へ</a><h1>' + ART.lamp.replace('<svg', '<svg class="h-ico"') + '聞き流す</h1><p>' + esc(r.work.title) + '</p></header>' +
      '<main class="wrap tatami-in"><div class="player card" id="player"><p class="note pl-empty">聞く録音を選んでください</p></div>' +
      '<h2 class="sec-t">録音</h2><div class="audiolist mine" id="lsList">' + list.map(function (x) {
        var pos = store.get('pos.' + x.id, 0);
        return '<button class="aurow pick" data-id="' + esc(x.id) + '"><span class="au-ico">' + TOYS.list.mic[2] + '</span><span class="au-t"><b>' + esc(x.label) + '</b><small>' + esc(kb(x.size)) + (pos ? '・続きは ' + clock(pos) + ' から' : '') + '</small></span></button>';
      }).join('') + '</div>' +
      '<p class="note" style="margin-top:14px">一度聞いた録音はこの端末に保存されるので、次からは電波がなくても聞けます。画面をロックしても流れ続けます。</p></main>';
    document.getElementById('lsList').onclick = function (e) {
      var b = e.target.closest('.aurow'); if (!b) return;
      var x = list.filter(function (y) { return y.id === b.dataset.id; })[0];
      loadTrack(Object.assign({ workId: id }, x), r.work);
    };
    if (player.cur && player.cur.workId === id && player.audio) drawPlayer(r.work);
  };
  if (me) draw(me); else app.innerHTML = loading();
  api('me', { workId: id }).then(function (r) {
    store.set('me.' + id, r);
    if (!me || JSON.stringify(me.audios) !== JSON.stringify(r.audios)) draw(r);
  }).catch(function (e) { if (!me) app.innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
}
function loadTrack(x, work) {
  var box = document.getElementById('player'); if (!box) return;
  if (player.cur && player.cur.id === x.id && player.audio) { drawPlayer(work); return; }
  stopPlayer();
  box.innerHTML = '<b>' + esc(x.label) + '</b><p class="note">録音を準備しています…</p><div class="prog"><i></i></div>';
  var bar = box.querySelector('.prog i');
  scriptBlob(x, function (p) { bar.style.width = Math.round(p * 100) + '%'; }, 'audio', true).then(function (blob) {
    if (player.url) URL.revokeObjectURL(player.url);
    player.url = URL.createObjectURL(blob);
    if (!player.audio) { player.audio = new Audio(); player.audio.preload = 'auto'; }
    var au = player.audio;
    au.src = player.url; au.playbackRate = store.get('speed', 1);
    player.cur = x;
    var pos = store.get('pos.' + x.id, 0);
    au.onloadedmetadata = function () { if (pos && pos < au.duration - 5) au.currentTime = pos; tick(); };
    au.onplay = au.onpause = function () { savePos(); tick(); };
    au.onended = function () { store.del('pos.' + x.id); tick(); };
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({ title: x.label, artist: work.title, album: 'もしょこむ楽屋', artwork: [{ src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }] });
        navigator.mediaSession.setActionHandler('play', function () { au.play(); });
        navigator.mediaSession.setActionHandler('pause', function () { au.pause(); });
        navigator.mediaSession.setActionHandler('seekbackward', function () { au.currentTime = Math.max(0, au.currentTime - 10); });
        navigator.mediaSession.setActionHandler('seekforward', function () { au.currentTime = Math.min(au.duration || 0, au.currentTime + 10); });
      } catch (e) { }
    }
    drawPlayer(work);
  }).catch(function (err) { box.innerHTML = '<p class="note">' + esc(err.message || '録音を開けませんでした') + '</p>'; });
}
function drawPlayer(work) {
  var box = document.getElementById('player'), au = player.audio, x = player.cur; if (!box || !au || !x) return;
  var sp = store.get('speed', 1);
  box.innerHTML = '<b class="pl-t">' + esc(x.label) + '</b>' +
    '<input type="range" class="pl-seek" min="0" max="1000" value="0" aria-label="再生位置"><div class="pl-time"><span id="plNow">0:00</span><span id="plAll">--:--</span></div>' +
    '<div class="pl-btns"><button class="btn quiet" data-p="back">−10秒</button><button class="btn brand pl-main" data-p="play">▶ 再生</button><button class="btn quiet" data-p="fwd">＋10秒</button></div>' +
    '<div class="pl-speed" role="group" aria-label="速さ">' + [0.75, 1, 1.25, 1.5, 2].map(function (v) {
      return '<button class="rchip' + (v === sp ? ' on' : '') + '" data-sp="' + v + '">' + v + '倍</button>';
    }).join('') + '</div>';
  var seek = box.querySelector('.pl-seek'), dragging = false;
  seek.oninput = function () { dragging = true; document.getElementById('plNow').textContent = clock(seek.value / 1000 * (au.duration || 0)); };
  seek.onchange = function () { if (au.duration) au.currentTime = seek.value / 1000 * au.duration; dragging = false; };
  box.onclick = function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.sp) {
      var v = +b.dataset.sp; au.playbackRate = v; store.set('speed', v);
      box.querySelectorAll('.pl-speed .rchip').forEach(function (c) { c.classList.toggle('on', +c.dataset.sp === v); }); return;
    }
    if (b.dataset.p === 'play') { if (au.paused) au.play().catch(function () { toast('再生できませんでした'); }); else au.pause(); }
    if (b.dataset.p === 'back') au.currentTime = Math.max(0, au.currentTime - 10);
    if (b.dataset.p === 'fwd') au.currentTime = Math.min(au.duration || 0, au.currentTime + 10);
    tick();
  };
  player.tick = function () {
    var n = document.getElementById('plNow'); if (!n) return;
    if (!dragging) { n.textContent = clock(au.currentTime); seek.value = au.duration ? Math.round(au.currentTime / au.duration * 1000) : 0; }
    document.getElementById('plAll').textContent = au.duration && isFinite(au.duration) ? clock(au.duration) : '--:--';
    box.querySelector('.pl-main').textContent = au.paused ? '▶ 再生' : '❚❚ 一時停止';
  };
  clearInterval(player.timer);
  player.timer = setInterval(function () { tick(); if (!au.paused && Math.floor(au.currentTime) % 5 === 0) savePos(); }, 500);
  tick();
}
function tick() { if (player.tick) player.tick(); }

/* 小道具の仕掛け：触るとプルッと動いて、ひと言しゃべる */
var toyAudio = null, toysTouched = {};
function clack() {
  try {
    toyAudio = toyAudio || new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.13].forEach(function (d) {
      var n = toyAudio.createBufferSource(), b = toyAudio.createBuffer(1, 2200, toyAudio.sampleRate), ch = b.getChannelData(0);
      for (var i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / 260);
      var f = toyAudio.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2600; f.Q.value = 3;
      var g = toyAudio.createGain(); g.gain.value = 0.9;
      n.buffer = b; n.connect(f).connect(g).connect(toyAudio.destination); n.start(toyAudio.currentTime + d);
    });
  } catch (e) { }
}
function bindToys(root) {
  if (!root) return;
  root.addEventListener('click', function (e) {
    var t = e.target.closest('.toy'); if (!t) return;
    var k = t.dataset.toy, info = TOYS.list[k];
    t.classList.remove('boing'); void t.offsetWidth; t.classList.add('boing');
    document.querySelectorAll('.toy-say').forEach(function (o) { o.remove(); });
    var say = document.createElement('span'); say.className = 'toy-say'; say.textContent = info[1];
    t.appendChild(say); setTimeout(function () { say.remove(); }, 1800);
    if (k === 'castanet') clack();
    toysTouched[k] = true;
    if (Object.keys(toysTouched).length === Object.keys(TOYS.list).length && !toysTouched._done) {
      toysTouched._done = true;
      setTimeout(function () { confetti(); toast('小道具ぜんぶ確認！小道具係、合格です'); }, 500);
    }
  });
}
function confetti() {
  if (REDUCED) return;
  var box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
  var colors = ['#FFD23F', '#FF7A66', '#5BC0EB', '#7EE07E', '#B9A3F5', '#FF9EC4'];
  for (var i = 0; i < 46; i++) {
    var p = document.createElement('i');
    p.style.left = (Math.random() * 100) + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = (Math.random() * 0.4) + 's';
    p.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
    p.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
    box.appendChild(p);
  }
  document.body.appendChild(box); setTimeout(function () { box.remove(); }, 2600);
}

/* ===================== 管理：ログイン ===================== */
function dayHead(title, right, tab) {
  var tabs = tab ? '<nav class="tabs" aria-label="管理メニュー"><a href="#/admin"' + (tab === 'desk' ? ' aria-current="page"' : '') + '>プロンプトデスク</a>' +
    '<a href="#/admin/shelf"' + (tab === 'shelf' ? ' aria-current="page"' : '') + '>台本棚</a></nav>' : '';
  return demoBar() + '<header class="dayhead"><div class="dayhead-in"><h1>' + ART.sheep() + esc(title) + '</h1>' + (right || '') + '</div>' + tabs + '</header>';
}
function viewAdminLogin() {
  app.innerHTML = dayHead('舞台監督の入口', '<a class="btn ghost sm" href="#/">楽屋口へ</a>') +
    '<main class="wrap"><form class="card login" id="loginForm"><h2>管理者コード</h2>' +
    '<p class="note" style="margin:0 0 12px">はじめての方は、配られた管理者コードを入れてください。入ったあと、これから使うコードを自分で決められます。</p>' +
    '<label class="sr" for="adminCode">管理者コード</label><input class="code-in" id="adminCode" maxlength="12" autocapitalize="characters" spellcheck="false" style="letter-spacing:.2em">' +
    '<div class="say">' + ART.sheep() + '<div class="bubble" id="loginSay">プロンプトデスクへようこそ</div></div>' +
    '<button class="btn brand wide" style="margin-top:12px">入る</button>' +
    '<p class="note" style="margin:10px 0 0">この端末では、次から入力しなくても入れます。</p></form></main>';
  document.getElementById('loginForm').onsubmit = function (e) {
    e.preventDefault();
    var code = document.getElementById('adminCode').value;
    api('adminLogin', { code: code }).then(function (r) {
      store.set('admin', r.token); store.set('adminCode', code); prefetch([['desk'], ['shelf', {}]]);
      if (r.mustSet) { store.set('adminMustSet', true); go('/admin/code'); } else { store.del('adminMustSet'); go('/admin'); }
    })
      .catch(function (err) { document.getElementById('loginSay').textContent = err.message; });
  };
}

/* ===================== 管理：プロンプトデスク ===================== */
function viewDesk() {
  app.innerHTML = dayHead('プロンプトデスク', '<button class="btn ghost sm" id="logout">ログアウト</button>', 'desk') +
    '<main class="wrap"><div class="row" style="justify-content:space-between;margin-bottom:14px">' +
    '<p class="note" style="margin:0">作品ごとの状態です。ランプ：緑＝稽古中、黄＝準備中、灰＝終演</p>' +
    '<a class="btn main" href="#/admin/w/new">＋ 新しい作品</a></div><div class="desk" id="desk">' + loading() + '</div>' +
    '<p class="note" style="margin-top:22px;text-align:center"><a href="#/admin/code">管理者コードを変える</a>　・　<a href="check.html">この端末の動作チェック</a></p></main>';
  document.getElementById('logout').onclick = logout;
  cachedAll([['desk']], function (r, old) {
    var works = r[0];
    var d = document.getElementById('desk'); if (!d) return;
    if (!old) { prefetch([['shelf', {}]]); works.forEach(function (w) { prefetch([['cast', { workId: w.id }]]); }); }
    if (!works.length) { d.innerHTML = '<div class="card"><h2>最初の作品を登録しましょう</h2><p class="note">ポスター、公演日、出演者を登録すると、劇団員に入館パスを配れます。</p></div>'; return; }
    d.innerHTML = works.map(function (w) {
      return '<a class="deskrow" href="#/admin/w/' + esc(w.id) + '"><span class="thumb" data-art="' + esc(w.id) + '">' + posterArt(w, true) + '</span>' +
        '<span><b>' + esc(w.title) + '</b><small>' + esc(dateLine(w)) + '</small><small>出演者 ' + w.castCount + '人・入館済み ' + w.enteredCount + '人</small>' +
        '<small>台本：' + (w.finalLabel ? '確定版 ' + esc(w.finalLabel) : '確定版なし') + (w.draftCount ? '・下書き ' + w.draftCount : '') + '</small></span>' +
        '<span class="lamp ' + esc(w.status) + '">' + STATUS_LABEL[w.status] + '</span></a>';
    }).join('');
    var byId = {}; works.forEach(function (w) { byId[w.id] = w; });
    loadPosters(works, function (id) { var a = document.querySelector('[data-art="' + id + '"]'); if (a) a.innerHTML = posterArt(byId[id], true); });
  }).catch(function (e) { if (!onAuthError(e, 'admin')) document.getElementById('desk').innerHTML = '<div class="card">' + esc(e.message) + '</div>'; });
}

/* ===================== 管理：作品の編集 ===================== */
function viewAdminWork(id) {
  var isNew = id === 'new';
  app.innerHTML = dayHead(isNew ? '新しい作品' : '作品の設定', '<a class="btn ghost sm" href="#/admin">← デスク</a>') + '<main class="wrap" id="aw">' + loading() + '</main>';
  if (isNew) { renderAdminWork(null, []); return; }
  var busy = function () { var m = document.getElementById('aw'); return m && m.contains(document.activeElement) && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName); };
  cachedAll([['desk'], ['cast', { workId: id }], ['roles', { workId: id }]], function (r, old) {
    var w = r[0].filter(function (x) { return x.id === id; })[0];
    if (!w) { if (!old) throw { code: 'notfound', message: 'この作品は見つかりません' }; return; }
    if (!old && busy()) return; /* 入力中は描き直さない */
    renderAdminWork(w, r[1], r[2]);
  }).catch(function (e) { if (!onAuthError(e, 'admin')) document.getElementById('aw').innerHTML = '<div class="card">' + esc(e.message) + '</div>'; });
}
function renderAdminWork(w, cast, roles) {
  roles = roles || [];
  w = w || { title: '', firstDate: '', lastDate: '', venue: '', status: 'prep', note: '' };
  var main = document.getElementById('aw');
  var opts = ['prep', 'rehearsal', 'closed', 'hidden'].map(function (s) {
    return '<option value="' + s + '"' + (w.status === s ? ' selected' : '') + '>' + STATUS_LABEL[s] + '</option>';
  }).join('');
  main.innerHTML =
    '<form class="card form" id="workForm"><h2>作品の情報</h2>' +
    '<label class="f">作品名<input class="in" name="title" required value="' + esc(w.title) + '" placeholder="もし夜が来なくても、夢を見る。"></label>' +
    '<div class="two"><label class="f">初日<input class="in" type="date" name="firstDate" value="' + esc(w.firstDate) + '"></label>' +
    '<label class="f">千秋楽<input class="in" type="date" name="lastDate" value="' + esc(w.lastDate) + '"></label></div>' +
    '<div class="two"><label class="f">会場<input class="in" name="venue" value="' + esc(w.venue) + '" placeholder="釜石市民ホールTETTO"></label>' +
    '<label class="f">状態<select class="in" name="status">' + opts + '</select><span>「非公開」は楽屋口に出ません</span></label></div>' +
    (w.id ? '<div class="posterpick"><span class="thumb" id="pthumb">' + posterArt(w, true) + '</span><div><label class="btn quiet">ポスター画像を選ぶ<input type="file" accept="image/*" id="pfile" class="sr"></label><p class="note">スマホで撮った写真でも大丈夫。自動で小さくしてから保存します。</p></div></div>' : '<p class="note">保存すると、ポスター画像と出演者を登録できます。</p>') +
    '<div class="row end"><button class="btn brand" id="saveWork">' + (w.id ? '変更を保存' : '作品を登録') + '</button></div></form>' +
    (w.id ? stepsCard(w, roles) + castCard(w, cast, roles) : '');
  document.getElementById('workForm').onsubmit = function (e) {
    e.preventDefault();
    var f = e.target, v = function (n) { return f.elements.namedItem(n).value; };
    var data = { id: w.id, title: v('title'), firstDate: v('firstDate'), lastDate: v('lastDate') || v('firstDate'), venue: v('venue'), status: v('status') };
    var b = document.getElementById('saveWork'); b.disabled = true;
    api('saveWork', { work: data }).then(function (nw) {
      b.disabled = false; toast('保存しました');
      if (!w.id) go('/admin/w/' + nw.id); else Object.assign(w, nw);
    }).catch(function (err) { b.disabled = false; if (!onAuthError(err, 'admin')) toast(err.message); });
  };
  if (!w.id) return;
  bindCast(w, cast, roles);
  if (w.hasPoster) loadPosters([w], function () { var t = document.getElementById('pthumb'); if (t) t.innerHTML = posterArt(w, true); });
  document.getElementById('pfile').onchange = function (e) {
    var file = e.target.files[0]; if (!file) return;
    toast('ポスターを保存しています…');
    shrink(file, 900).then(function (dataUrl) { return api('uploadPoster', { workId: w.id, dataUrl: dataUrl }).then(function () { posterCache[w.id] = dataUrl; savePosters(); }); })
      .then(function () { document.getElementById('pthumb').innerHTML = posterArt(w, true); toast('ポスターを貼りました'); })
      .catch(function (err) { if (!onAuthError(err, 'admin')) toast(err.message || '画像を読み込めませんでした'); });
  };
}
function shrink(file, max) {
  return new Promise(function (resolve, reject) {
    var img = new Image(), url = URL.createObjectURL(file);
    img.onload = function () {
      var s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = function () { reject({ message: '画像を読み込めませんでした' }); };
    img.src = url;
  });
}

/* ---------- 出演者と入館パス ---------- */
function rolePicker(roles, picked, name) {
  if (!roles.length) return '<input class="in" name="' + name + '" value="' + esc(picked.join('、')) + '" placeholder="ソラ、通行人A"><span>②で登場人物を登録すると、ここで選べるようになります</span>';
  return '<div class="rolepick" data-name="' + name + '">' + roles.map(function (r) {
    var on = picked.indexOf(r.name) >= 0;
    return '<button type="button" class="rchip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-role="' + esc(r.name) + '">' + esc(r.name) + '</button>';
  }).join('') + '</div>';
}
function pickedRoles(root, name) {
  var box = root.querySelector('.rolepick[data-name="' + name + '"]');
  if (box) return Array.prototype.map.call(box.querySelectorAll('.rchip.on'), function (b) { return b.dataset.role; });
  var inp = root.querySelector('[name="' + name + '"]');
  return inp ? inp.value.split(/[、,，]/).map(function (x) { return x.trim(); }).filter(Boolean) : [];
}
function castCard(w, cast, roles) {
  var taken = {}; cast.forEach(function (a) { if (a.active) a.roles.forEach(function (n) { taken[n] = 1; }); });
  var free = roles.filter(function (r) { return !taken[r.name]; });
  return '<section class="card" id="castCard"><h2>出演者と入館パス</h2>' +
    '<p class="note" style="margin:-4px 0 12px">役者ごとにコードを発行します。ほかの公演に同じ名前の人がいれば、同じコードになります（劇団員が覚えるコードは1つで済みます）。</p>' +
    (free.length ? '<p class="note freeroles">まだ配役していない役：' + free.map(function (r) { return esc(r.name); }).join('、') + '</p>' : '') +
    '<div class="cast" id="castList">' + castRows(cast, roles) + '</div>' +
    '<form class="form" id="addActor" style="margin-top:16px;border-top:2px dashed var(--line);padding-top:16px">' +
    '<label class="f">役者の名前<input class="in" name="name" placeholder="山田 太郎" required></label>' +
    '<div class="f"><span class="flabel">役</span>' + rolePicker(roles, [], 'roles') + '</div>' +
    '<div class="row end"><button class="btn main">＋ 出演者を追加</button></div></form></section>';
}
function castRows(cast, roles) {
  if (!cast.length) return '<p class="note">まだ出演者がいません。下から追加してください。</p>';
  return cast.map(function (a) {
    return '<div class="castrow' + (a.active ? '' : ' off') + '" data-id="' + esc(a.id) + '">' +
      '<div class="who"><b>' + esc(a.name) + '</b><div class="tapes">' + a.roles.map(tape).join('') + '</div>' +
      '<div class="seen">' + (a.active ? (a.lastSeenAt ? '入館済み（' + esc(a.lastSeenAt.slice(0, 10)) + '）' : 'まだ入館していません') : 'このパスは無効です') + '</div></div>' +
      '<div class="codebox" aria-label="入館コード">' + esc(a.code.slice(0, 3) + ' ' + a.code.slice(3)) + '</div>' +
      '<div class="acts"><button class="btn quiet sm" data-act="copy">コードをコピー</button>' +
      '<button class="btn quiet sm" data-act="edit">名前と役を直す</button>' +
      '<button class="btn quiet sm" data-act="reissue">コードを作り直す</button>' +
      '<button class="btn quiet sm" data-act="toggle">' + (a.active ? '無効にする' : '有効に戻す') + '</button>' +
      '<button class="btn quiet sm danger" data-act="delete">削除</button></div></div>';
  }).join('');
}
function bindCast(w, cast, roles) {
  var byId = function (id) { return cast.filter(function (a) { return a.id === id; })[0]; };
  var list = document.getElementById('castList');
  var redraw = function () { list.innerHTML = castRows(cast, roles); };
  var replace = function (na) { cast = cast.map(function (a) { return a.id === na.id ? na : a; }); redraw(); };
  var card = document.getElementById('castCard');
  card.addEventListener('click', function (e) {
    var c = e.target.closest('.rchip'); if (!c) return;
    c.classList.toggle('on'); c.setAttribute('aria-pressed', c.classList.contains('on'));
  });
  list.onclick = function (e) {
    var b = e.target.closest('button[data-act]'); if (!b) return;
    var rowEl = b.closest('.castrow'), a = byId(rowEl.dataset.id), act = b.dataset.act;
    if (act === 'copy') { copyText(a.code); return; }
    if (act === 'edit') {
      rowEl.innerHTML = '<form class="form editactor"><label class="f">役者の名前<input class="in" name="ename" value="' + esc(a.name) + '" required></label>' +
        '<div class="f"><span class="flabel">役</span>' + rolePicker(roles, a.roles, 'eroles') + '</div>' +
        '<div class="row end"><button type="button" class="btn quiet sm" data-act="cancel">やめる</button><button class="btn main sm">保存</button></div></form>';
      var f = rowEl.querySelector('form');
      f.onsubmit = function (ev) {
        ev.preventDefault();
        api('saveActor', { actor: { id: a.id, workId: w.id, name: f.elements.namedItem('ename').value, roles: pickedRoles(f, 'eroles') } })
          .then(function (na) { replace(na); toast('保存しました'); })
          .catch(function (err) { if (!onAuthError(err, 'admin')) toast(err.message); });
      };
      return;
    }
    if (act === 'cancel') { redraw(); return; }
    if ((act === 'reissue' || act === 'delete' || (act === 'toggle' && a.active)) && b.dataset.sure !== '1') {
      b.dataset.sure = '1'; var old = b.textContent; b.textContent = '本当に？もう一度押す';
      setTimeout(function () { if (b.isConnected) { b.dataset.sure = ''; b.textContent = old; } }, 3500); return;
    }
    b.disabled = true;
    if (act === 'delete') {
      api('deleteActor', { actorId: a.id }).then(function () {
        cast = cast.filter(function (x) { return x.id !== a.id; }); redraw(); toast(a.name + 'さんを削除しました');
      }).catch(function (err) { b.disabled = false; if (!onAuthError(err, 'admin')) toast(err.message); });
      return;
    }
    (act === 'reissue' ? api('reissueCode', { actorId: a.id }) : api('setActorActive', { actorId: a.id, active: !a.active }))
      .then(function (na) { replace(na); toast(act === 'reissue' ? '新しいコードにしました。古いコードは使えません' : na.active ? '有効に戻しました' : '無効にしました'); })
      .catch(function (err) { b.disabled = false; if (!onAuthError(err, 'admin')) toast(err.message); });
  };
  document.getElementById('addActor').onsubmit = function (e) {
    e.preventDefault();
    var f = e.target, nameIn = f.elements.namedItem('name');
    api('saveActor', { actor: { workId: w.id, name: nameIn.value, roles: pickedRoles(f, 'roles') } }).then(function (na) {
      cast.push(na); redraw(); f.reset();
      f.querySelectorAll('.rchip.on').forEach(function (c) { c.classList.remove('on'); c.setAttribute('aria-pressed', 'false'); });
      nameIn.focus(); toast(na.name + 'さんの入館パスを作りました');
    }).catch(function (err) { if (!onAuthError(err, 'admin')) toast(err.message); });
  };
}
function copyText(text) {
  var ok = function () { toast('コードをコピーしました'); };
  var fallback = function () {
    var t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); ok(); } catch (e) { toast('コピーできませんでした'); }
    t.remove();
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
}
function stepsCard(w, roles) {
  var s = [
    ['台本を登録', w.finalLabel ? '確定版：' + w.finalLabel + (w.draftCount ? '（下書き ' + w.draftCount + '）' : '') : (w.draftCount ? '下書き ' + w.draftCount + '冊。確定版にすると練習に使えます' : 'まだ台本がありません'), TOYS.list.script[2], '#/admin/shelf/' + w.id, '台本棚へ'],
    ['割り振りを登録', roles.length ? '登場人物 ' + roles.length + '人' : 'AIが台本から登場人物を読み取ります', TOYS.list.script[2], '#/admin/roles/' + w.id, '割り振りへ'],
    ['録音を登録', w.audioCount ? '録音 ' + w.audioCount + '件' : '読み合わせの録音を入れます（なくても大丈夫）', TOYS.list.mic[2], '#/admin/audio/' + w.id, '録音へ']
  ];
  return '<section class="card"><h2>稽古の準備</h2><div class="steps">' + s.map(function (x, i) {
    return '<a class="step stepbtn" href="' + esc(x[3]) + '"><span class="no">' + (i + 1) + '</span><span class="step-ico">' + x[2] + '</span><b>' + x[0] + '</b><small>' + esc(x[1]) + '</small><span class="btn quiet sm">' + x[4] + ' →</span></a>';
  }).join('') + '</div></section>';
}

/* ===================== 管理：割り振り（登場人物） ===================== */
function viewRoles(workId) {
  app.innerHTML = dayHead('割り振り', '<a class="btn ghost sm" href="#/admin/w/' + esc(workId) + '">← 作品</a>') + '<main class="wrap" id="rl">' + loading() + '</main>';
  cachedAll([['desk'], ['roles', { workId: workId }], ['shelf', { workId: workId }]], function (r) {
    var w = r[0].filter(function (x) { return x.id === workId; })[0];
    if (!w) throw { code: 'notfound', message: 'この作品は見つかりません' };
    renderRoles(w, r[1], r[2]);
  }).catch(function (e) { if (!onAuthError(e, 'admin')) { var m = document.getElementById('rl'); if (m) m.innerHTML = '<div class="card">' + esc(e.message) + '</div>'; } });
}
function renderRoles(w, roles, scripts) {
  var main = document.getElementById('rl'); if (!main) return;
  var src = scripts.filter(function (x) { return x.status === 'final'; })[0] || scripts.filter(function (x) { return x.status === 'draft'; }).sort(function (a, b) { return b.version - a.version; })[0];
  main.innerHTML = '<h2 class="pagetitle">' + esc(w.title) + '</h2>' +
    '<section class="card"><h2>登場人物</h2>' +
    '<p class="note" style="margin:-4px 0 12px">ここで登録した役が、出演者の配役で選べるようになります。名前を直すと、配役も一緒に直ります。</p>' +
    (src ? '<div class="aibox"><button class="btn brand" id="aiRead">' + ART.sheep('happy') + '台本からAIで読み込む</button>' +
      '<p class="note">「' + esc(src.label) + '」' + (src.status === 'final' ? '（確定版）' : '（下書き）') + 'を読みます。すでにある役は、そのまま残ります。</p><div class="prog" hidden><i></i></div></div>'
      : '<p class="note">先に①で台本PDFを入れると、AIで登場人物を読み込めます。</p>') +
    '<div class="rolelist" id="roleList">' + roleRows(roles) + '</div>' +
    '<form class="form addrole" id="addRole"><div class="two"><label class="f">役の名前<input class="in" name="rname" required placeholder="ソラ"></label>' +
    '<label class="f">メモ<input class="in" name="rnote" placeholder="高校2年生・ハルの幼なじみ"></label></div>' +
    '<div class="row end"><button class="btn main">＋ 役を追加</button></div></form></section>' +
    '<section class="card"><h2>セリフの割り振り</h2><p class="note">次の段階で、AIが台本のセリフを役ごとに分け、それを台本を追いながら確認・修正できるようにします。割り振りが終わると、劇団員の「覚える」「運転中」が使えるようになります。</p></section>';
  var list = document.getElementById('roleList');
  var redraw = function () { list.innerHTML = roleRows(roles); };
  list.onclick = function (e) {
    var b = e.target.closest('button[data-act]'); if (!b) return;
    var rowEl = b.closest('.rolerow'), x = roles.filter(function (r) { return r.id === rowEl.dataset.id; })[0], act = b.dataset.act;
    if (act === 'edit') {
      rowEl.innerHTML = '<form class="form two"><input class="in" name="n" value="' + esc(x.name) + '" required aria-label="役の名前"><input class="in" name="m" value="' + esc(x.note) + '" aria-label="メモ">' +
        '<div class="row end" style="grid-column:1/-1"><button type="button" class="btn quiet sm" data-act="cancel">やめる</button><button class="btn main sm">保存</button></div></form>';
      var f = rowEl.querySelector('form'); f.elements.namedItem('n').focus();
      f.onsubmit = function (ev) {
        ev.preventDefault();
        api('saveRole', { role: { id: x.id, workId: w.id, name: f.elements.namedItem('n').value, note: f.elements.namedItem('m').value } })
          .then(function (nr) { roles = roles.map(function (r) { return r.id === nr.id ? nr : r; }); redraw(); toast('保存しました'); })
          .catch(function (err) { if (!onAuthError(err, 'admin')) toast(err.message); });
      };
      return;
    }
    if (act === 'cancel') return redraw();
    if (act === 'delete') {
      if (b.dataset.sure !== '1') {
        b.dataset.sure = '1'; b.textContent = '本当に？もう一度';
        setTimeout(function () { if (b.isConnected) { b.dataset.sure = ''; b.textContent = '削除'; } }, 3500); return;
      }
      b.disabled = true;
      api('deleteRole', { roleId: x.id }).then(function () { roles = roles.filter(function (r) { return r.id !== x.id; }); redraw(); toast(x.name + 'を削除しました'); })
        .catch(function (err) { b.disabled = false; if (!onAuthError(err, 'admin')) toast(err.message); });
    }
  };
  document.getElementById('addRole').onsubmit = function (e) {
    e.preventDefault(); var f = e.target;
    api('saveRole', { role: { workId: w.id, name: f.elements.namedItem('rname').value, note: f.elements.namedItem('rnote').value } })
      .then(function (nr) { roles.push(nr); redraw(); f.reset(); f.elements.namedItem('rname').focus(); })
      .catch(function (err) { if (!onAuthError(err, 'admin')) toast(err.message); });
  };
  var ai = document.getElementById('aiRead');
  if (ai) ai.onclick = function () {
    var box = ai.parentNode, bar = box.querySelector('.prog'), say = box.querySelector('.note');
    ai.disabled = true; bar.hidden = false; bar.firstChild.style.width = '5%';
    say.textContent = '台本を開いています…';
    scriptBlob(src, function (r) { bar.firstChild.style.width = Math.round(5 + r * 35) + '%'; })
      .then(function (blob) { say.textContent = '台本の文字を読み取っています…'; return pdfText(blob, function (r) { bar.firstChild.style.width = Math.round(40 + r * 30) + '%'; }); })
      .then(function (text) { say.textContent = 'AIが登場人物を探しています（30秒ほど）…'; bar.firstChild.style.width = '80%'; return api('aiRoles', { workId: w.id, text: text }); })
      .then(function (r) {
        roles = r.roles; redraw(); bar.hidden = true; ai.disabled = false;
        say.textContent = r.added ? r.added + '人の登場人物を見つけました。違うところは直したり削除したりしてください。' : '新しい登場人物は見つかりませんでした。';
      })
      .catch(function (err) {
        bar.hidden = true; ai.disabled = false;
        if (onAuthError(err, 'admin')) return;
        say.textContent = err.code === 'nokey' ? 'AIを使うには、GASのスクリプト プロパティに GEMINI_KEY（Gemini APIキー）を入れてください。' : (err.message || '読み込めませんでした');
      });
  };
}
function roleRows(roles) {
  if (!roles.length) return '<p class="note">まだ登場人物がいません。</p>';
  return roles.map(function (r) {
    return '<div class="rolerow" data-id="' + esc(r.id) + '">' + tape(r.name) + '<span class="rnote">' + esc(r.note) + '</span>' +
      '<span class="acts"><button class="btn quiet sm" data-act="edit">直す</button><button class="btn quiet sm danger" data-act="delete">削除</button></span></div>';
  }).join('');
}
/* PDFから文字を取り出す（縦書きでも、ページごとに上から順に） */
function pdfText(blob, onProgress) {
  return loadPdfJs().then(function (lib) {
    return blob.arrayBuffer().then(function (buf) {
      return lib.getDocument({ data: new Uint8Array(buf), cMapUrl: PDFJS + 'cmaps/', cMapPacked: true, standardFontDataUrl: PDFJS + 'standard_fonts/' }).promise;
    });
  }).then(function (doc) {
    var out = [], i = 0;
    var next = function () {
      i++; if (i > doc.numPages) { doc.destroy(); return out.join('\n\n'); }
      return doc.getPage(i).then(function (pg) { return pg.getTextContent(); }).then(function (tc) {
        out.push(tc.items.map(function (it) { return it.str + (it.hasEOL ? '\n' : ''); }).join(''));
        if (onProgress) onProgress(i / doc.numPages);
        return next();
      });
    };
    return next();
  });
}

/* ===================== 管理：録音 ===================== */
function viewAudio(workId) {
  app.innerHTML = dayHead('録音', '<a class="btn ghost sm" href="#/admin/w/' + esc(workId) + '">← 作品</a>') + '<main class="wrap" id="au">' + loading() + '</main>';
  cachedAll([['desk'], ['audios', { workId: workId }]], function (r) {
    var w = r[0].filter(function (x) { return x.id === workId; })[0];
    if (!w) throw { code: 'notfound', message: 'この作品は見つかりません' };
    renderAudio(w, r[1]);
  }).catch(function (e) { if (!onAuthError(e, 'admin')) { var m = document.getElementById('au'); if (m) m.innerHTML = '<div class="card">' + esc(e.message) + '</div>'; } });
}
function renderAudio(w, list) {
  var main = document.getElementById('au'); if (!main) return;
  main.innerHTML = '<h2 class="pagetitle">' + esc(w.title) + '</h2>' +
    '<section class="card"><h2>' + TOYS.list.mic[2].replace('<svg', '<svg class="h-ico"') + '読み合わせの録音</h2>' +
    '<p class="note" style="margin:-4px 0 12px">ここに入れた録音を、劇団員が「聞き流す」で再生できます。1時間を超える録音も大丈夫です（300MBまで）。<br>iPhoneのボイスメモ（.m4a）やMP3をそのまま入れられます。</p>' +
    '<label class="btn brand">＋ 録音ファイルを入れる<input type="file" accept="audio/*,.m4a,.mp3,.wav,.aac" class="sr" id="aufile"></label>' +
    '<div class="prog" id="auprog" hidden><i></i></div>' +
    '<div class="audiolist" id="auList">' + audioRows(list) + '</div></section>';
  var box = document.getElementById('auList');
  var redraw = function () { box.innerHTML = audioRows(list); };
  document.getElementById('aufile').onchange = function (e) {
    var file = e.target.files[0]; e.target.value = ''; if (!file) return;
    var bar = document.getElementById('auprog'); bar.hidden = false; bar.firstChild.style.width = '0%';
    var mime = file.type || (/\.mp3$/i.test(file.name) ? 'audio/mpeg' : /\.wav$/i.test(file.name) ? 'audio/wav' : 'audio/mp4');
    toast('録音を送っています。画面を閉じずにお待ちください');
    uploadFile(file, { workId: w.id, kind: 'audio', mime: mime }, function (r) { bar.firstChild.style.width = Math.round(r * 100) + '%'; })
      .then(function (r) { bar.hidden = true; if (r.audio) list.push(r.audio); redraw(); toast('録音を入れました'); })
      .catch(function (err) { bar.hidden = true; if (!onAuthError(err, 'admin')) toast(err.message); });
  };
  box.onclick = function (e) {
    var b = e.target.closest('button[data-act]'); if (!b) return;
    var rowEl = b.closest('.aurow'), x = list.filter(function (y) { return y.id === rowEl.dataset.id; })[0], act = b.dataset.act;
    if (act === 'rename') {
      var nl = prompt('録音の名前', x.label); if (nl === null) return;
      api('saveAudioNote', { audioId: x.id, label: nl }).then(function (nx) { list = list.map(function (y) { return y.id === nx.id ? nx : y; }); redraw(); })
        .catch(function (err) { if (!onAuthError(err, 'admin')) toast(err.message); });
      return;
    }
    if (act === 'delete') {
      if (b.dataset.sure !== '1') {
        b.dataset.sure = '1'; b.textContent = '本当に？もう一度';
        setTimeout(function () { if (b.isConnected) { b.dataset.sure = ''; b.textContent = '削除'; } }, 3500); return;
      }
      b.disabled = true;
      api('deleteAudio', { audioId: x.id }).then(function () { list = list.filter(function (y) { return y.id !== x.id; }); redraw(); toast('削除しました'); })
        .catch(function (err) { b.disabled = false; if (!onAuthError(err, 'admin')) toast(err.message); });
    }
  };
}
function audioRows(list) {
  if (!list.length) return '<p class="note" style="margin-top:14px">まだ録音がありません。</p>';
  return list.map(function (x) {
    return '<div class="aurow" data-id="' + esc(x.id) + '"><span class="au-ico">' + TOYS.list.mic[2] + '</span><span class="au-t"><b>' + esc(x.label) + '</b><small>' + esc(kb(x.size)) + '・' + esc(day(x.createdAt)) + '</small></span>' +
      '<span class="acts"><button class="btn quiet sm" data-act="rename">名前</button><button class="btn quiet sm danger" data-act="delete">削除</button></span></div>';
  }).join('');
}

/* ===================== 管理：管理者コードを決める ===================== */
function viewAdminCode() {
  var first = store.get('adminMustSet', false);
  app.innerHTML = dayHead(first ? 'はじめまして' : '管理者コード', first ? '' : '<a class="btn ghost sm" href="#/admin">← デスク</a>') +
    '<main class="wrap"><form class="card login" id="codeForm"><h2>' + (first ? 'これから使う管理者コードを決めてください' : '新しい管理者コード') + '</h2>' +
    '<p class="note" style="margin:0 0 12px">6文字以上の英数字。ほかの管理者にも、このコードを伝えてください。前のコードは使えなくなります。</p>' +
    '<label class="sr" for="nc1">新しいコード</label><input class="code-in" id="nc1" maxlength="20" autocapitalize="characters" spellcheck="false" autocomplete="off" style="letter-spacing:.15em" placeholder="新しいコード">' +
    '<label class="sr" for="nc2">もう一度</label><input class="code-in" id="nc2" maxlength="20" autocapitalize="characters" spellcheck="false" autocomplete="off" style="letter-spacing:.15em;margin-top:10px" placeholder="もう一度">' +
    '<div class="say">' + ART.sheep() + '<div class="bubble" id="codeSay">英字の大文字・小文字は区別しません</div></div>' +
    '<button class="btn brand wide" style="margin-top:12px">このコードにする</button></form></main>';
  document.getElementById('codeForm').onsubmit = function (e) {
    e.preventDefault();
    var a = document.getElementById('nc1').value, b = document.getElementById('nc2').value, say = document.getElementById('codeSay');
    var norm = function (v) { return String(v).toUpperCase().replace(/[^A-Z0-9]/g, ''); };
    if (norm(a).length < 6) { say.textContent = '6文字以上の英数字にしてください'; return; }
    if (norm(a) !== norm(b)) { say.textContent = '2回の入力が違います'; return; }
    api('setAdminCode', { code: a }).then(function (r) {
      store.set('admin', r.token); store.set('adminCode', r.code); store.del('adminMustSet');
      toast('管理者コードを「' + r.code + '」にしました'); go('/admin');
    }).catch(function (err) { if (!onAuthError(err, 'admin')) say.textContent = err.message; });
  };
}

/* ===================== 大きなファイルの分割送受信 ===================== */
function readChunk(blob) {
  return new Promise(function (resolve, reject) {
    var r = new FileReader();
    r.onload = function () { resolve(String(r.result).split(',')[1] || ''); };
    r.onerror = function () { reject({ message: 'ファイルを読み込めませんでした' }); };
    r.readAsDataURL(blob);
  });
}
function uploadFile(file, meta, onProgress) {
  return api('startUpload', Object.assign({ name: file.name, mime: file.type || 'application/pdf', size: file.size }, meta)).then(function (s) {
    var offset = 0;
    var next = function () {
      var piece = file.slice(offset, offset + s.chunk);
      return readChunk(piece).then(function (data) {
        return api('uploadChunk', { uploadId: s.uploadId, offset: offset, data: data });
      }).then(function (r) {
        offset += piece.size;
        if (onProgress) onProgress(Math.min(1, offset / file.size));
        return r.done ? r : next();
      });
    };
    return next();
  });
}
function b64ToBytes(b64) { var bin = atob(b64), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
function downloadScript(x, onProgress, kind, member) {
  var parts = [], got = 0;
  var step = function (offset) {
    var q = kind === 'audio' ? { audioId: x.id, offset: offset } : { scriptId: x.id, offset: offset };
    if (member) { q.asMember = true; q.workId = x.workId; }
    return api('downloadChunk', q).then(function (r) {
      var b = b64ToBytes(r.data); parts.push(b); got += b.length;
      if (onProgress) onProgress(Math.min(1, got / (r.size || x.size)));
      return r.next === null ? new Blob(parts, { type: x.mime || 'application/pdf' }) : step(r.next);
    });
  };
  return step(0);
}
/* 台本は版ごとに中身が変わらないので、一度取ったら端末に置いておく */
var FILES = 'gakuya-files';
function scriptBlob(x, onProgress, kind, member) {
  kind = kind || 'script';
  var key = './__' + kind + '/' + x.id;
  var fromNet = function () {
    return downloadScript(x, onProgress, kind, member).then(function (blob) {
      if (window.caches) caches.open(FILES).then(function (c) { return c.put(key, new Response(blob, { headers: { 'Content-Type': x.mime || 'application/pdf' } })); }).catch(function () { });
      return blob;
    });
  };
  if (!window.caches || MODE === 'demo') return fromNet();
  return caches.open(FILES).then(function (c) { return c.match(key); }).then(function (hit) {
    return hit ? hit.blob() : fromNet();
  }, fromNet);
}
/* 台本ビューア：PDFをそのままの見た目（縦書きは縦書き）で、アプリの中に表示する */
var PDFJS = window.PDFJS_BASE || 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/';
var pdfjsReady = null;
function loadPdfJs() {
  if (pdfjsReady) return pdfjsReady;
  pdfjsReady = new Promise(function (resolve, reject) {
    var s = document.createElement('script');
    s.src = PDFJS + 'legacy/build/pdf.min.js';
    s.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'legacy/build/pdf.worker.min.js'; resolve(window.pdfjsLib); };
    s.onerror = function () { pdfjsReady = null; reject({ message: '台本を表示する部品を読み込めませんでした。電波のよい場所で試してください' }); };
    document.head.appendChild(s);
  });
  return pdfjsReady;
}
function viewPdf(blob, x) {
  var v = document.createElement('div'); v.className = 'viewer'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-label', x.label);
  v.innerHTML = '<div class="vw-bar"><b>' + esc(x.label) + '</b><span class="vw-tools">' +
    '<button class="btn quiet sm" data-z="-1" aria-label="小さく">－</button><button class="btn quiet sm" data-z="1" aria-label="大きく">＋</button>' +
    '<button class="btn quiet sm" data-rot aria-label="回転">↻</button><button class="btn main sm" data-close>閉じる</button></span></div>' +
    '<div class="vw-pages">' + loading() + '</div>';
  document.body.appendChild(v); document.body.classList.add('noscroll');
  var pages = v.querySelector('.vw-pages'), doc = null, zoom = 1, rot = 0, io = null, alive = true;
  var ZOOMS = [1, 1.5, 2, 3];
  var close = function () { alive = false; if (io) io.disconnect(); if (doc) doc.destroy(); v.remove(); document.body.classList.remove('noscroll'); };
  var draw = function (holder) {
    var n = +holder.dataset.n; holder.dataset.done = '1';
    doc.getPage(n).then(function (pg) {
      if (!alive) return;
      var base = pg.getViewport({ scale: 1, rotation: (pg.rotate + rot) % 360 });
      var cssW = holder.clientWidth, dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      var vp = pg.getViewport({ scale: cssW / base.width * dpr, rotation: (pg.rotate + rot) % 360 });
      var c = document.createElement('canvas'); c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
      holder.style.aspectRatio = base.width + ' / ' + base.height;
      return pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise.then(function () {
        if (!alive) return; holder.innerHTML = ''; holder.appendChild(c);
      });
    }).catch(function () { holder.dataset.done = ''; });
  };
  var layout = function () {
    if (io) io.disconnect();
    return doc.getPage(1).then(function (p1) {
      var b = p1.getViewport({ scale: 1, rotation: (p1.rotate + rot) % 360 });
      var html = '';
      for (var i = 1; i <= doc.numPages; i++) html += '<div class="vw-page" data-n="' + i + '" style="width:' + (zoom * 100) + '%;aspect-ratio:' + b.width + ' / ' + b.height + '"><span>' + i + '</span></div>';
      pages.innerHTML = html;
      io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !e.target.dataset.done) draw(e.target); }); }, { root: pages, rootMargin: '800px 400px' });
      pages.querySelectorAll('.vw-page').forEach(function (h) { io.observe(h); });
    });
  };
  v.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.hasAttribute('data-close')) return close();
    if (!doc) return;
    if (t.hasAttribute('data-rot')) { rot = (rot + 90) % 360; layout(); return; }
    var i = ZOOMS.indexOf(zoom) + (+t.dataset.z); if (i < 0 || i >= ZOOMS.length) return;
    var keep = pages.scrollTop / (pages.scrollHeight || 1);
    zoom = ZOOMS[i]; layout().then(function () { pages.scrollTop = keep * pages.scrollHeight; });
  });
  loadPdfJs().then(function (lib) {
    return blob.arrayBuffer().then(function (buf) {
      return lib.getDocument({ data: new Uint8Array(buf), cMapUrl: PDFJS + 'cmaps/', cMapPacked: true, standardFontDataUrl: PDFJS + 'standard_fonts/' }).promise;
    });
  }).then(function (d) { if (!alive) { d.destroy(); return; } doc = d; return layout(); })
    .catch(function (err) {
      if (!alive) return;
      pages.innerHTML = '<div class="card" style="margin:20px">' + esc(err.message || '台本を開けませんでした') + '<p><button class="btn quiet" data-raw>別の画面で開く</button></p></div>';
      pages.querySelector('[data-raw]').onclick = function () { openBlob(blob, x.fileName); };
    });
}
function kb(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(n / 1024)) + 'KB'; }
function day(iso) { if (!iso) return ''; var d = new Date(iso); return (d.getMonth() + 1) + '/' + d.getDate(); }

function logout() { store.del('admin'); store.del('adminCode'); clearReads(); go('/'); }

/* ===================== 管理：台本棚 ===================== */
function viewShelf(workId) {
  app.innerHTML = dayHead('台本棚', '<button class="btn ghost sm" id="logout">ログアウト</button>', 'shelf') +
    '<main class="wrap" id="shelf">' + loading() + '</main>';
  document.getElementById('logout').onclick = logout;
  cachedAll([['desk'], ['shelf', {}]], function (r) { renderShelf(r[0], r[1], workId); })
    .catch(function (e) { if (!onAuthError(e, 'admin')) { var m = document.getElementById('shelf'); if (m) m.innerHTML = '<div class="card">' + esc(e.message) + '</div>'; } });
}
function renderShelf(works, scripts, workId) {
  var main = document.getElementById('shelf'); if (!main) return;
  if (!works.length) { main.innerHTML = '<div class="card"><h2>まず作品を登録しましょう</h2><p class="note">台本は作品ごとの棚に入ります。</p><a class="btn main" href="#/admin/w/new">＋ 新しい作品</a></div>'; return; }
  var shown = workId ? works.filter(function (w) { return w.id === workId; }) : works;
  main.innerHTML = '<p class="note" style="margin:0 0 10px">練習に使うのは「確定版」の台本だけです。台本を押すと、開く・確定版にする などができます。</p>' +
    '<div class="filters" role="group" aria-label="作品で絞り込む"><a class="chip" href="#/admin/shelf"' + (workId ? '' : ' aria-current="true"') + '>すべての作品</a>' +
    works.map(function (w) { return '<a class="chip" href="#/admin/shelf/' + esc(w.id) + '"' + (w.id === workId ? ' aria-current="true"' : '') + '>' + esc(w.title) + '</a>'; }).join('') + '</div>' +
    '<div class="bookcase">' + shown.map(function (w) { return shelfRow(w, scripts.filter(function (x) { return x.workId === w.id; })); }).join('') + '</div>';
  shown.forEach(function (w) { bindShelf(w, scripts); });
}
var SHELF_ORDER = { final: 0, draft: 1, past: 2 };
var STATE_LABEL = { final: '確定版', draft: '下書き', past: '過去の版' };
function shelfRow(w, list) {
  list = list.slice().sort(function (a, b) { return (SHELF_ORDER[a.status] - SHELF_ORDER[b.status]) || (b.version - a.version); });
  return '<section class="shelfrow" data-wid="' + esc(w.id) + '">' +
    '<div class="plate"><b>' + esc(w.title) + '</b><span class="lamp ' + esc(w.status) + '">' + STATUS_LABEL[w.status] + '</span></div>' +
    '<div class="shelfbooks">' + '<label class="sbook add"><span class="addslot"><b>＋</b>台本PDFを<br>入れる</span><input type="file" accept="application/pdf,.pdf" class="sr" data-up="' + esc(w.id) + '">' +
    '<span class="prog uplprog" hidden><i></i></span></label>' + list.map(function (x) {
      return '<button class="sbook st-' + x.status + '" data-sid="' + esc(x.id) + '" aria-label="' + esc(x.label + '（' + STATE_LABEL[x.status] + '）') + '">' +
        cover(w, false, { label: x.label, state: x.status, seed: x.version }) +
        '<span class="sb-cap"><b>' + esc(x.label) + '</b><small>' + STATE_LABEL[x.status] + '</small></span></button>';
    }).join('') + '</div>' +
    (list.length ? '' : '<p class="note shelfempty">まだ台本がありません。「＋」から台本PDFを入れると、下書きとして棚に並びます。</p>') +
    '<div class="board-plank" aria-hidden="true"></div></section>';
}
function bindShelf(w, scripts) {
  var row = document.querySelector('.shelfrow[data-wid="' + w.id + '"]'); if (!row) return;
  var reload = function () { viewShelf((location.hash.split('/')[3]) || ''); };
  row.querySelector('input[data-up]').onchange = function (e) {
    var file = e.target.files[0]; e.target.value = ''; if (!file) return;
    if (file.type && file.type !== 'application/pdf') { toast('台本はPDFで入れてください'); return; }
    var bar = row.querySelector('.uplprog'); bar.hidden = false;
    uploadFile(file, { workId: w.id, kind: 'script', mime: 'application/pdf' }, function (r) { bar.firstChild.style.width = Math.round(r * 100) + '%'; })
      .then(function (r) { toast((r.script ? r.script.label : '台本') + 'を下書きとして棚に入れました'); reload(); })
      .catch(function (err) { bar.hidden = true; if (!onAuthError(err, 'admin')) toast(err.message); });
  };
  row.querySelector('.shelfbooks').addEventListener('click', function (e) {
    var b = e.target.closest('button.sbook'); if (!b) return;
    var x = scripts.filter(function (y) { return y.id === b.dataset.sid; })[0];
    if (x) bookSheet(w, x, reload);
  });
}
function bookSheet(w, x, reload) {
  var when = x.status === 'final' ? day(x.confirmedAt) + 'に確定' : x.status === 'past' ? day(x.confirmedAt) + '〜' + day(x.archivedAt) + 'に使用' : day(x.createdAt) + 'に入れた下書き';
  var v = document.createElement('div'); v.className = 'veil';
  v.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="bk-t"><div class="pass bookpass">' +
    '<div class="pass-top"><b>' + STATE_LABEL[x.status] + '</b><button type="button" class="btn quiet sm" data-act="close">閉じる</button></div>' +
    '<div class="bk-head"><span class="bk-cover">' + cover(w, false, { label: x.label, state: x.status, seed: x.version }) + '</span>' +
    '<div><h2 id="bk-t">' + esc(x.label) + '</h2><p>' + esc(w.title) + '</p><p class="note">' + esc(when) + '・' + esc(kb(x.size)) + '<br>' + esc(x.fileName) + '</p>' +
    (x.note ? '<p class="vnote">' + esc(x.note) + '</p>' : '') + '</div></div>' +
    '<div class="prog" hidden><i></i></div>' +
    '<div class="bk-acts"><button class="btn quiet" data-act="open">台本を開く</button>' +
    (x.status === 'draft' ? '<button class="btn main" data-act="confirm">確定版にする</button>' : '') +
    (x.status === 'past' ? '<button class="btn main" data-act="restore">確定版に戻す</button>' : '') +
    '<button class="btn quiet" data-act="rename">名前とメモ</button>' +
    (x.status === 'draft' ? '<button class="btn quiet" data-act="delete">削除</button>' : '') + '</div>' +
    (x.status === 'draft' ? '<p class="note">確定版にすると、今の確定版は「過去の版」の棚に移ります。</p>' : '') + '</div></div>';
  document.body.appendChild(v);
  var close = function () { v.remove(); };
  v.addEventListener('click', function (e) {
    if (e.target === v) return close();
    var b = e.target.closest('button[data-act]'); if (!b) return;
    var act = b.dataset.act;
    if (act === 'close') return close();
    if (act === 'open') {
      var bar = v.querySelector('.prog'); bar.hidden = false; b.disabled = true;
      scriptBlob(x, function (r) { bar.firstChild.style.width = Math.round(r * 100) + '%'; }).then(function (blob) {
        b.disabled = false; bar.hidden = true; close(); viewPdf(blob, x);
      }).catch(function (err) { b.disabled = false; bar.hidden = true; if (!onAuthError(err, 'admin')) toast(err.message); });
      return;
    }
    if (act === 'rename') { close(); editVer(x, reload); return; }
    if (b.dataset.sure !== '1') {
      b.dataset.sure = '1'; var old = b.textContent; b.textContent = '本当に？もう一度押す';
      setTimeout(function () { if (b.isConnected) { b.dataset.sure = ''; b.textContent = old; } }, 3500); return;
    }
    b.disabled = true;
    api('setScriptStatus', { scriptId: x.id, action: act }).then(function () {
      close(); toast(act === 'delete' ? '下書きを削除しました' : x.label + 'を確定版にしました'); reload();
    }).catch(function (err) { b.disabled = false; if (!onAuthError(err, 'admin')) toast(err.message); });
  });
}
function openBlob(blob, name) {
  var url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener';
  if (!/iPhone|iPad|iPod/.test(navigator.userAgent)) a.download = name || 'script.pdf';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
}
function editVer(x, done) {
  var v = document.createElement('div'); v.className = 'veil';
  v.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ev-t"><form class="pass form" id="evForm"><div class="pass-top"><b>台本の名前とメモ</b>' +
    '<button type="button" class="btn quiet sm" id="evClose">閉じる</button></div><h2 id="ev-t" class="sr">台本の名前とメモ</h2>' +
    '<label class="f">名前<input class="in" name="label" value="' + esc(x.label) + '"></label>' +
    '<label class="f">メモ<textarea class="in" name="note" placeholder="12/3の稽古で第3場を差し替え">' + esc(x.note) + '</textarea></label>' +
    '<button class="btn brand wide">保存</button></form></div>';
  document.body.appendChild(v);
  var close = function () { v.remove(); };
  v.addEventListener('click', function (e) { if (e.target === v) close(); });
  v.querySelector('#evClose').onclick = close;
  v.querySelector('#evForm').onsubmit = function (e) {
    e.preventDefault(); var f = e.target;
    api('saveScriptNote', { scriptId: x.id, label: f.elements.namedItem('label').value, note: f.elements.namedItem('note').value })
      .then(function () { close(); toast('保存しました'); done(); })
      .catch(function (err) { if (!onAuthError(err, 'admin')) toast(err.message); });
  };
}

/* ===================== ホーム画面に置く案内 ===================== */
var installEvt = null;
window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault(); installEvt = e;
  var c = document.getElementById('install'); if (c) { c.outerHTML = installCard(); bindInstall(); }
});
function isStandalone() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; }
function installCard() {
  if (MODE === 'gas' || isStandalone() || store.get('installHidden', false)) return '<div id="install" hidden></div>';
  var ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!ios && !installEvt) return '<div id="install" hidden></div>';
  return '<div class="install" id="install">' + ART.sheep('happy') + '<div><b>ホーム画面に楽屋を置こう</b><p>' +
    (ios ? 'Safariの共有ボタン（四角に上向きの矢印）→「ホーム画面に追加」で、アプリのように開けます。' : 'ホーム画面から、アプリのように開けるようになります。') + '</p>' +
    '<div class="row">' + (installEvt ? '<button class="btn main sm" id="doInstall">ホーム画面に追加</button>' : '') +
    '<button class="btn quiet sm" id="hideInstall">あとで</button></div></div></div>';
}
function bindInstall() {
  var h = document.getElementById('hideInstall'), d = document.getElementById('doInstall');
  if (h) h.onclick = function () { store.set('installHidden', true); var c = document.getElementById('install'); if (c) c.remove(); };
  if (d) d.onclick = function () { installEvt.prompt(); installEvt.userChoice.then(function () { installEvt = null; var c = document.getElementById('install'); if (c) c.remove(); }); };
}
if ('serviceWorker' in navigator && MODE !== 'gas' && location.protocol === 'https:' && !window.NO_SW) {
  window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { }); });
}

/* ===================== デモ（GASの外で開いたとき） ===================== */
function demoBar() {
  return MODE === 'demo' ? '<div class="demo">デモ表示です。入館コード <b>KTR7MA</b>／管理者コード <b>DEMO2027</b> で試せます（この端末だけに保存）</div>' : '';
}
var DEMO = {
  db: null,
  load: function () {
    if (this.db) return this.db;
    this.db = store.get('demo', null) || {
      works: [
        { id: 'w1', title: '2027年2月公演（仮題）', firstDate: '2027-02-20', lastDate: '2027-02-21', venue: '釜石市民ホールTETTO', status: 'rehearsal', posterId: '', note: '' },
        { id: 'w2', title: '2028年1月公演（仮題）', firstDate: '2028-01-22', lastDate: '2028-01-23', venue: '', status: 'prep', posterId: '', note: '' },
        { id: 'w3', title: 'もし夜が来なくても、夢を見る。', firstDate: '2026-02-21', lastDate: '2026-02-22', venue: '釜石市民ホールTETTO ホールA', status: 'closed', posterId: '', note: '' }
      ],
      actors: [
        { id: 'a1', workId: 'w1', name: 'こたろう', roles: 'ソラ', code: 'KTR7MA', active: true, lastSeenAt: '' },
        { id: 'a2', workId: 'w1', name: 'はるか', roles: 'ハル', code: 'HRK2QX', active: true, lastSeenAt: '2026-11-18T10:00:00Z' },
        { id: 'a3', workId: 'w1', name: 'みなと', roles: 'ミナト,通行人A', code: 'MNT4PW', active: true, lastSeenAt: '' },
        { id: 'a4', workId: 'w2', name: 'こたろう', roles: '語り手', code: 'KTR7MA', active: true, lastSeenAt: '' }
      ]
    };
    return this.db;
  },
  save: function () { store.set('demo', this.db); },
  files: {}, ups: {},
  api: function (action, p, token) {
    var db = this.load(), self = this;
    var ok = function (d) { return { ok: true, data: d }; }, ng = function (c, m) { return { ok: false, code: c, message: m }; };
    var pw = function (w) { return { id: w.id, title: w.title, firstDate: w.firstDate, lastDate: w.lastDate, venue: w.venue, status: w.status, hasPoster: false, note: w.note }; };
    var pa = function (a) { return { id: a.id, workId: a.workId, name: a.name, roles: a.roles ? a.roles.split(',') : [], code: a.code, active: a.active, lastSeenAt: a.lastSeenAt }; };
    var isAdmin = token === 'demo-admin';
    var norm = function (v) { return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); };
    var newCode = function () { var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)]; return s; };
    var rank = { rehearsal: 0, prep: 1, closed: 2, hidden: 3 };
    var sort = function (a, b) { return rank[a.status] - rank[b.status] || String(b.firstDate).localeCompare(String(a.firstDate)); };
    var adminOnly = ADMIN_ACTIONS;
    db.scripts = db.scripts || []; db.roles = db.roles || []; db.audios = db.audios || [];
    var memberOf = function () { var t = String(token).split('.'), m = db.actors.filter(function (x) { return x.id === t[1]; })[0]; return m && m.code === t[2] && m.active ? m : null; };
    if (adminOnly.indexOf(action) >= 0 && !isAdmin && !(action === 'downloadChunk' && memberOf())) return ng('auth', 'もう一度、管理者コードを入れてください');
    var rolesOf = function (wid) { return db.roles.filter(function (x) { return x.workId === wid; }); };
    var castRename = function (wid, from, to) { db.actors.forEach(function (a) { if (a.workId !== wid) return; var l = a.roles ? a.roles.split(',') : [], i = l.indexOf(from); if (i < 0) return; if (to) l[i] = to; else l.splice(i, 1); a.roles = l.join(','); }); };
    switch (action) {
      case 'listWorks': return ok(db.works.filter(function (w) { return w.status !== 'hidden'; }).map(pw).sort(sort));
      case 'poster': return ok(null);
      case 'enter':
        var a = db.actors.filter(function (x) { return x.workId === p.workId && x.code === norm(p.code) && x.active; })[0];
        if (!a) return ng('badcode', 'コードが違うみたい');
        a.lastSeenAt = new Date().toISOString(); self.save();
        return ok({ token: 'demo-m.' + a.id + '.' + a.code, actor: { id: a.id, name: a.name, roles: pa(a).roles }, work: pw(db.works.filter(function (w) { return w.id === p.workId; })[0]) });
      case 'me':
        var parts = String(token).split('.'), me = db.actors.filter(function (x) { return x.id === parts[1]; })[0];
        if (!me || me.code !== parts[2] || !me.active || me.workId !== p.workId) return ng('auth', '入館パスが変わりました。新しいコードを入れてください');
        var mf = db.scripts.filter(function (x) { return x.workId === me.workId && x.status === 'final'; })[0];
        return ok({ actor: { id: me.id, name: me.name, roles: pa(me).roles }, work: pw(db.works.filter(function (w) { return w.id === me.workId; })[0]),
          script: mf || null, audios: db.audios.filter(function (x) { return x.workId === me.workId; }) });
      case 'adminLogin': return norm(p.code) === (db.adminCode || 'DEMO2027') ? ok({ token: 'demo-admin', mustSet: false }) : ng('badcode', '管理者コードが違います');
      case 'setAdminCode': if (norm(p.code).length < 6) return ng('invalid', '6文字以上の英数字にしてください'); db.adminCode = norm(p.code); self.save(); return ok({ token: 'demo-admin', code: db.adminCode });
      case 'deleteActor': db.actors = db.actors.filter(function (x) { return x.id !== p.actorId; }); self.save(); return ok({ deleted: p.actorId });
      case 'roles': return ok(rolesOf(p.workId));
      case 'saveRole':
        var rn = String(p.role.name || '').trim(); if (!rn) return ng('invalid', '役の名前を入れてください');
        if (p.role.id) { var cr = db.roles.filter(function (x) { return x.id === p.role.id; })[0]; if (cr.name !== rn) castRename(cr.workId, cr.name, rn); cr.name = rn; cr.note = String(p.role.note || ''); self.save(); return ok(cr); }
        if (rolesOf(p.role.workId).some(function (x) { return x.name === rn; })) return ng('invalid', '同じ名前の役があります');
        var nr = { id: 'r' + Date.now(), workId: p.role.workId, name: rn, note: String(p.role.note || ''), order: rolesOf(p.role.workId).length + 1 }; db.roles.push(nr); self.save(); return ok(nr);
      case 'deleteRole': var dr = db.roles.filter(function (x) { return x.id === p.roleId; })[0]; castRename(dr.workId, dr.name, ''); db.roles = db.roles.filter(function (x) { return x !== dr; }); self.save(); return ok({ deleted: dr.id });
      case 'aiRoles':
        var seen = {}, added = 0;
        String(p.text || '').replace(/([^\s「」（）()、。]{1,8})「/g, function (m0, nm) { seen[nm] = 1; });
        Object.keys(seen).forEach(function (nm) { if (!rolesOf(p.workId).some(function (x) { return x.name === nm; })) { db.roles.push({ id: 'r' + Date.now() + added, workId: p.workId, name: nm, note: '（デモ）', order: rolesOf(p.workId).length + 1 }); added++; } });
        self.save(); return ok({ added: added, roles: rolesOf(p.workId) });
      case 'audios': return ok(db.audios.filter(function (x) { return x.workId === p.workId; }));
      case 'saveAudioNote': var ax = db.audios.filter(function (x) { return x.id === p.audioId; })[0]; ax.label = String(p.label || '').trim() || ax.fileName; self.save(); return ok(ax);
      case 'deleteAudio': db.audios = db.audios.filter(function (x) { return x.id !== p.audioId; }); delete self.files[p.audioId]; self.save(); return ok({ deleted: p.audioId });
      case 'desk': return ok(db.works.map(function (w) {
        var c = db.actors.filter(function (x) { return x.workId === w.id && x.active; }), o = pw(w);
        o.castCount = c.length; o.enteredCount = c.filter(function (x) { return x.lastSeenAt; }).length;
        var fin = db.scripts.filter(function (x) { return x.workId === w.id && x.status === 'final'; })[0];
        o.finalLabel = fin ? fin.label : ''; o.draftCount = db.scripts.filter(function (x) { return x.workId === w.id && x.status === 'draft'; }).length;
        o.roleCount = rolesOf(w.id).length; o.audioCount = db.audios.filter(function (x) { return x.workId === w.id; }).length;
        return o;
      }).sort(sort));
      case 'saveWork':
        if (!String(p.work.title || '').trim()) return ng('invalid', '作品名を入れてください');
        var w = p.work.id ? db.works.filter(function (x) { return x.id === p.work.id; })[0] : null;
        if (w) Object.assign(w, p.work); else { w = Object.assign({ posterId: '', note: '' }, p.work, { id: 'w' + Date.now() }); db.works.push(w); }
        self.save(); return ok(pw(w));
      case 'uploadPoster': return ok(pw(db.works.filter(function (x) { return x.id === p.workId; })[0]));
      case 'cast': return ok(db.actors.filter(function (x) { return x.workId === p.workId; }).map(pa));
      case 'saveActor':
        if (!String(p.actor.name || '').trim()) return ng('invalid', '役者の名前を入れてください');
        var same = db.actors.filter(function (x) { return x.name === p.actor.name.trim() && x.workId !== p.actor.workId && x.active; })[0];
        var usedHere = function (c) { return db.actors.some(function (x) { return x.workId === p.actor.workId && x.code === c; }); };
        var rl = (Array.isArray(p.actor.roles) ? p.actor.roles : String(p.actor.roles || '').split(/[、,，]/)).map(function (s) { return String(s).trim(); }).filter(Boolean).join(',');
        if (p.actor.id) { var ea = db.actors.filter(function (x) { return x.id === p.actor.id; })[0]; ea.name = p.actor.name.trim(); ea.roles = rl; self.save(); return ok(pa(ea)); }
        var na = { id: 'a' + Date.now(), workId: p.actor.workId, name: p.actor.name.trim(), roles: rl, code: same && !usedHere(same.code) ? same.code : newCode(), active: true, lastSeenAt: '' };
        db.actors.push(na); self.save(); return ok(pa(na));
      case 'reissueCode':
        var r = db.actors.filter(function (x) { return x.id === p.actorId; })[0]; r.code = newCode(); r.lastSeenAt = ''; self.save(); return ok(pa(r));
      case 'shelf': return ok(db.scripts.filter(function (x) { return !p.workId || x.workId === p.workId; }).slice().sort(function (a, b) { return b.version - a.version; }));
      case 'saveScriptNote':
        var sn = db.scripts.filter(function (x) { return x.id === p.scriptId; })[0];
        sn.label = String(p.label || '').trim() || ('第' + sn.version + '版'); sn.note = String(p.note || '').trim(); self.save(); return ok(sn);
      case 'setScriptStatus':
        var sx = db.scripts.filter(function (x) { return x.id === p.scriptId; })[0];
        if (p.action === 'delete') { db.scripts = db.scripts.filter(function (x) { return x !== sx; }); delete self.files[sx.id]; self.save(); return ok({ deleted: sx.id }); }
        db.scripts.forEach(function (y) { if (y.workId === sx.workId && y.status === 'final' && y !== sx) { y.status = 'past'; y.archivedAt = new Date().toISOString(); } });
        sx.status = 'final'; sx.confirmedAt = new Date().toISOString(); sx.archivedAt = ''; self.save(); return ok(sx);
      case 'startUpload':
        var uid = 'u' + Date.now(); self.ups[uid] = { meta: p, parts: [], got: 0 }; return ok({ uploadId: uid, chunk: 4 * 1024 * 1024 });
      case 'uploadChunk':
        var up = self.ups[p.uploadId], bytes = b64ToBytes(p.data); up.parts.push(bytes); up.got += bytes.length;
        if (up.got < up.meta.size) return ok({ done: false, received: up.got });
        var all = new Uint8Array(up.got), o2 = 0; up.parts.forEach(function (b) { all.set(b, o2); o2 += b.length; });
        if (up.meta.kind === 'audio') {
          var av = { id: 'v' + Date.now(), workId: up.meta.workId, label: up.meta.name.replace(/\.[^.]+$/, ''), fileName: up.meta.name, mime: up.meta.mime, size: up.meta.size, createdAt: new Date().toISOString(), note: '' };
          self.files[av.id] = all; db.audios.push(av); delete self.ups[p.uploadId]; self.save(); return ok({ done: true, audio: av });
        }
        var ver = db.scripts.filter(function (x) { return x.workId === up.meta.workId; }).reduce(function (m, x) { return Math.max(m, x.version); }, 0) + 1;
        var sc = { id: 's' + Date.now(), workId: up.meta.workId, version: ver, label: '第' + ver + '版', status: 'draft', fileName: up.meta.name, mime: up.meta.mime, size: up.meta.size, createdAt: new Date().toISOString(), confirmedAt: '', archivedAt: '', note: '' };
        self.files[sc.id] = all; db.scripts.push(sc); delete self.ups[p.uploadId]; self.save();
        return ok({ done: true, script: sc });
      case 'downloadChunk':
        var fb = self.files[p.scriptId || p.audioId];
        if (!fb) return ng('notfound', 'デモでは、ページを読み込み直すとPDFの中身は消えます');
        var st = Number(p.offset) || 0, en = Math.min(st + 4 * 1024 * 1024, fb.length), bin = '';
        for (var k = st; k < en; k += 32768) bin += String.fromCharCode.apply(null, fb.subarray(k, Math.min(k + 32768, en)));
        return ok({ data: btoa(bin), next: en < fb.length ? en : null, size: fb.length });
      case 'setActorActive':
        var s = db.actors.filter(function (x) { return x.id === p.actorId; })[0]; s.active = !!p.active; self.save(); return ok(pa(s));
    }
    return ng('unknown', '不明な操作です');
  }
};

/* ===================== 待受画面（起動したときだけ） ===================== */
function splash() {
  var seen = false; try { seen = sessionStorage.getItem('gakuya.splash') === '1'; sessionStorage.setItem('gakuya.splash', '1'); } catch (e) { }
  if (seen || location.hash.indexOf('#/admin') === 0) return;
  var el = document.createElement('div');
  el.className = 'splash'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<div class="splash-in"><img src="' + LOGO + '" alt="" width="260" height="140">' + ART.sheep('happy') + '<b>楽屋</b><small>開場します</small></div>';
  document.body.appendChild(el);
  var end = function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 500); };
  el.addEventListener('click', end);
  setTimeout(end, REDUCED ? 600 : 1500);
}

/* ===================== 道案内 ===================== */
function route() {
  var parts = (location.hash.slice(1) || '/').split('/').filter(Boolean);
  window.scrollTo(0, 0);
  document.querySelectorAll('.veil').forEach(function (v) { v.remove(); });
  if (parts[0] === 'admin') {
    stopPlayer();
    document.body.className = 'day';
    if (!store.get('admin', '')) {
      var code = store.get('adminCode', '');
      if (!code) return viewAdminLogin();
      app.innerHTML = loading();
      api('adminLogin', { code: code }).then(function (r) { store.set('admin', r.token); route(); })
        .catch(function (e) { if (e.code !== 'network') store.del('adminCode'); viewAdminLogin(); });
      return;
    }
    if (parts[1] === 'w') return viewAdminWork(parts[2] || 'new');
    if (parts[1] === 'shelf') return viewShelf(parts[2] || '');
    if (parts[1] === 'roles' && parts[2]) return viewRoles(parts[2]);
    if (parts[1] === 'audio' && parts[2]) return viewAudio(parts[2]);
    if (parts[1] === 'code' || store.get('adminMustSet', false)) return viewAdminCode();
    return viewDesk();
  }
  document.body.className = 'night';
  if (!(parts[0] === 'w' && parts[2] === 'listen')) stopPlayer();
  if (parts[0] === 'w' && parts[1] && parts[2] === 'listen') return viewListen(parts[1]);
  if (parts[0] === 'w' && parts[1]) return viewHome(parts[1]);
  return viewDoor();
}
window.addEventListener('hashchange', route);
splash();
route();
})();
