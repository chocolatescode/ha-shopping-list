// Lista zakupów z kategoriami, sortowaniem i flagą "pilne".
// Dane listy: todo (todo/item/subscribe). Ręczne kategorie i "pilne": sensor.lista_zakupow_kategorie
// (atrybuty tagi / pilne), zapisywane przez script.lista_zakupow_ustaw_kategorie (packages/zakupy_lista.yaml).
// Kategoria produktu: ręczne przypisanie > najdłuższe dopasowane słowo kluczowe > "inne".
// Definicje kategorii edytowane w karcie (⚙ Kategorie) trafiają do atrybutu "kategorie" tego samego
// sensora (wspólne dla wszystkich urządzeń); brak atrybutu = kategorie z configu albo domyślne poniżej.
//
// type: custom:zakupy-lista-card
// entity: todo.lista_zakupow
// kategorie:            # opcjonalnie – nadpisuje domyślne (kolejność = kolejność grup)
//   - id: pieczywo
//     nazwa: Pieczywo
//     ikona: mdi:baguette
//     kolor: '#c58b3a'
//     slowa: [chleb, bulk]   # początek słowa, bez polskich znaków; "por=" = całe słowo;
//                            # "!sok=" = pierwszeństwo ("sok pomarańczowy" to napój, nie owoc)

// Leki: nazwa z numerem PESEL (11 cyfr) i kodem recepty (4 cyfry) – zawsze pilne.
const LEKI_RE = /(^|\D)\d{11}(\D|$)/;
const KOD_RE = /(^|\D)\d{4}(\D|$)/;
const jestLek = (nazwa) => LEKI_RE.test(nazwa) && KOD_RE.test(nazwa.replace(/\d{11}/g, ' '));

const DOMYSLNE_KATEGORIE = [
  { id: 'leki', nazwa: 'Leki', ikona: 'mdi:pill', kolor: '#8e24aa', slowa: ['!recept', '!apteka', '!lekarstw'] },
  { id: 'pieczywo', nazwa: 'Pieczywo', ikona: 'mdi:baguette', kolor: '#c58b3a',
    slowa: ['chleb', 'bulk', 'bulecz', 'bagiet', 'rogal', 'croissant', 'drozdz', 'tost', 'kajzer', 'grahamk',
      'pieczyw', 'chalk', 'precel', 'pita=', 'tortill', 'wrap', 'jagodziank', 'paczki='] },
  { id: 'nabial', nazwa: 'Nabiał', ikona: 'mdi:cheese', kolor: '#4a90d9',
    slowa: ['mlek', 'mleko', 'ser=', 'sera=', 'serem', 'serek', 'serki', 'smietan', 'jogurt', 'kefir', 'maslank',
      'maslo', 'masla', 'twarog', 'mascarpone', 'mozzarell', 'camembert', 'cheddar', 'feta', 'parmezan', 'gouda',
      'edam', 'jajk', 'jaja', 'jajek', 'skyr', 'ricott', 'margaryn', 'kremowk'] },
  { id: 'sypkie', nazwa: 'Sypkie', ikona: 'mdi:grain', kolor: '#8d6e63',
    slowa: ['mak', 'makaron', 'maka', 'kasz', 'ryz', 'platki', 'owsian', 'kuskus', 'bulgur', 'quinoa', 'komos',
      'cukier', 'bulka tarta', 'panierk', 'kakao', 'skrobi', 'maizen', 'otreb', 'soczewic', 'ciecierzyc',
      'groch', 'nitki', 'spaghetti', 'penne', 'tagliatelle', 'tagiatelle', 'lasagne', 'drozdze'] },
  { id: 'owoce_warzywa', nazwa: 'Owoce i warzywa', ikona: 'mdi:food-apple', kolor: '#43a047',
    slowa: ['jabl', 'grusz', 'banan', 'pomarancz', 'mandaryn', 'cytryn', 'limonk', 'grejpfrut', 'winogron',
      'trusk', 'malin', 'borowk', 'jagod', 'sliwk', 'brzoskw', 'nektaryn', 'ananas', 'mango', 'kiwi', 'arbuz',
      'melon', 'awokado', 'pomidor', 'ogor', 'papryk', 'cebul', 'czosn', 'ziemniak', 'marchew', 'marchw',
      'pietrusz', 'seler', 'por=', 'pory=', 'kapust', 'kalafior', 'brokul', 'cukini', 'baklazan', 'salat',
      'rukol', 'szpinak', 'rzodkiew', 'burak', 'dyni', 'kukurydz', 'koper', 'szczypior', 'natk', 'wloszczyzn',
      'pieczark', 'grzyb', 'imbir', 'fasolk', 'surowk', 'rabarbar', 'kalarep', 'warzyw', 'owoc', 'zielenin'] },
  { id: 'chemia', nazwa: 'Chemia', ikona: 'mdi:spray-bottle', kolor: '#00a3b4',
    slowa: ['plyn', 'kapsul', 'granulk', 'proszek', 'proszk', 'recznik', 'papier toalet', 'chusteczk', 'rekawicz',
      'szmat', 'gabk', 'worki', 'workow', 'worek', 'szczot', 'lenor', 'perwoll', 'domestos', 'cif=', 'ajax',
      'vanish', 'tabletki do', 'sol do zmywark', 'odplamiacz', 'odkamieniacz', 'wybielacz', 'mydl', 'szampon',
      'zel pod', 'pasta do zeb', 'dezodorant', 'pieluch', 'folia', 'sciereczk', 'zmywak', 'odswiezacz',
      'kostka do wc', 'srodek do', 'zawieszk', 'szczoteczk'] },
  { id: 'slodycze', nazwa: 'Słodycze / przekąski', ikona: 'mdi:candy', kolor: '#d81b60',
    slowa: ['czekolad', 'cukierk', 'baton', 'ciastk', 'ciasto', 'wafel', 'wafl', 'chips', 'chrupk', 'paluszk',
      'orzesz', 'orzech', 'zelk', 'zelki', 'lizak', 'lody', 'pianki', 'krakers', 'popcorn', 'draze', 'prince polo',
      'delicje', 'nutell', 'krem czekolad', 'snick', 'twix', 'kinder', 'michalk', 'herbatnik', 'biszkopt',
      'przekask', 'slodycz'] },
  { id: 'napoje', nazwa: 'Napoje', ikona: 'mdi:bottle-soda-classic-outline', kolor: '#3949ab',
    slowa: ['!sok=', '!soki=', '!soku=', '!soczek', '!syrop', '!oranzad', '!cola', '!pepsi', '!fanta', '!sprite',
      '!napoj', '!woda', '!wody', '!wode', '!picie', '!nektar', '!lemoniad', '!kompot', '!piwo', '!piwa', '!wino',
      '!wina=', '!energetyk', '!tymbark', '!kubus', '!herbata mrozona', '!ice tea', 'kawa', 'kawy', 'herbat'] },
  { id: 'przyprawy', nazwa: 'Przyprawy', ikona: 'mdi:shaker-outline', kolor: '#ef6c00',
    slowa: ['!przypraw', '!granulowan', '!mielon', '!suszon', '!wedzon', '!papryka ostra', '!papryka slodka',
      'pieprz', 'sol=', 'soli=', 'oregano', 'bazyli', 'majeranek', 'tymianek', 'rozmaryn', 'kmin', 'cynamon',
      'kurkum', 'curry', 'chili', 'lisc laur', 'liscie laur', 'ziele angielsk', 'galka', 'gozdzik', 'vegeta',
      'kostka rosol', 'kostki rosol', 'ziol', 'lubczyk', 'imbir mielony', 'gyros', 'musztard', 'ketchup', 'majonez',
      'ocet', 'sos sojow', 'czosnek granul', 'kminek'] },
  { id: 'mrozonki', nazwa: 'Mrożonki', ikona: 'mdi:snowflake', kolor: '#29b6f6',
    slowa: ['!mrozon', '!mrozona', 'frytki', 'pyzy', 'pierog', 'kopytk', 'uszka', 'nuggets', 'paluszki rybne',
      'mieszanka warzyw', 'warzywa na patelni', 'pizza mroz', 'krokiet', 'kluski slaskie', 'knedl'] },
];
const INNE = { id: 'inne', nazwa: 'Inne', ikona: 'mdi:tag-outline', kolor: '#9e9e9e', slowa: [] };
// Szybki wybór w edytorze kategorii.
const IKONY = ['mdi:tag-outline', 'mdi:food-steak', 'mdi:fish', 'mdi:sausage', 'mdi:baguette', 'mdi:cheese', 'mdi:egg-outline',
  'mdi:food-apple', 'mdi:carrot', 'mdi:grain', 'mdi:pasta', 'mdi:candy', 'mdi:coffee', 'mdi:bottle-wine', 'mdi:beer',
  'mdi:snowflake', 'mdi:shaker-outline', 'mdi:spray-bottle', 'mdi:paper-roll', 'mdi:baby-bottle-outline', 'mdi:paw',
  'mdi:pill', 'mdi:lipstick', 'mdi:hammer-wrench', 'mdi:lightbulb-outline', 'mdi:flower', 'mdi:gift-outline', 'mdi:silverware-fork-knife'];
const KOLORY = ['#c58b3a', '#4a90d9', '#8d6e63', '#43a047', '#00a3b4', '#d81b60', '#3949ab', '#ef6c00', '#29b6f6',
  '#8e24aa', '#e53935', '#fdd835', '#6d4c41', '#546e7a', '#9e9e9e'];
const SORTY = [
  { id: 'kat', nazwa: 'Kategorie', ikona: 'mdi:shape-outline' },
  { id: 'az', nazwa: 'A–Z', ikona: 'mdi:sort-alphabetical-ascending' },
  { id: 'za', nazwa: 'Z–A', ikona: 'mdi:sort-alphabetical-descending' },
  { id: 'lista', nazwa: 'Kolejność', ikona: 'mdi:sort-numeric-ascending' },
];

const norm = (s) => (s || '').toLowerCase().trim();
const bezZnakow = (s) => norm(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* brak storage */ } },
};

class ZakupyListaCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) throw new Error('Podaj entity (todo.*)');
    this._config = {
      sensor: 'sensor.lista_zakupow_kategorie',
      script: 'script.lista_zakupow_ustaw_kategorie',
      czeste: 'sensor.lista_zakupow_czesto_kupowane',
      ...config,
    };
    this._bazowe = config.kategorie || DOMYSLNE_KATEGORIE;
    this._zrodloKat = undefined;
    this._ustawKategorie(this._bazowe);
    this._ed = null;
    this._klucz = `zakupy-lista-card:${config.entity}`;
    const zap = ls.get(this._klucz, {});
    this._sort = zap.sort || 'kat';
    this._filtr = zap.filtr || 'wszystkie';
    this._pokazKupione = !!zap.kupione;
    this._items = this._items || [];
    this._menu = null;
    if (!this.shadowRoot) this._zbuduj();
  }

  set hass(hass) {
    const stary = this._hass;
    this._hass = hass;
    if (!this._sub && hass.connection) this._subskrybuj();
    const s = hass.states[this._config.sensor];
    const zk = s && s.attributes.kategorie;
    if (zk !== this._zrodloKat) {
      this._zrodloKat = zk;
      this._ustawKategorie(Array.isArray(zk) && zk.length ? zk : this._bazowe);
    }
    const c = this._config.czeste;
    if (!stary || stary.states[this._config.sensor] !== s || stary.states[c] !== hass.states[c]) this._render();
  }

  connectedCallback() { if (this._hass && !this._sub) this._subskrybuj(); }
  disconnectedCallback() {
    if (this._sub) { this._sub.then((u) => u && u()).catch(() => {}); this._sub = null; }
  }

  getCardSize() { return 6; }
  getGridOptions() { return { columns: 'full', min_columns: 6 }; }

  _subskrybuj() {
    this._sub = this._hass.connection.subscribeMessage(
      (ev) => { this._items = ev.items || []; this._render(); },
      { type: 'todo/item/subscribe', entity_id: this._config.entity },
    ).catch((e) => { this._sub = null; console.error('zakupy-lista-card', e); });
  }

  // "Inne" zawsze istnieje i jest ostatnia (zbiera wszystko bez dopasowania).
  _ustawKategorie(lista) {
    this._kategorie = [...lista.filter((k) => k.id !== 'inne'), lista.find((k) => k.id === 'inne') || INNE]
      .map((k) => ({ ...k, slowa: k.id === 'inne' ? [] : (k.slowa || []) }));
    this._kat = Object.fromEntries(this._kategorie.map((k) => [k.id, k]));
  }

  _zapiszKategorie(lista) {
    this._ustawKategorie(lista);
    const dane = this._kategorie.map(({ id, nazwa, ikona, kolor, slowa }) => ({ id, nazwa, ikona, kolor, slowa }));
    this._skrypt({ kategorie: dane });
    this._render();
  }

  _zapisz() { ls.set(this._klucz, { sort: this._sort, filtr: this._filtr, kupione: this._pokazKupione }); }

  // --- dane pomocnicze ---
  _attr() {
    const s = this._hass && this._hass.states[this._config.sensor];
    const p = (s && s.attributes.pilne) || [];
    return { tagi: (s && s.attributes.tagi) || {}, pilne: p };
  }

  // Pilne: ręczna flaga albo kategoria Leki (zawsze pilne).
  _pilne(item, attr) {
    return attr.pilne.includes(norm(item.summary)) || this._kategoria(item, attr).id === 'leki';
  }

  // Podpowiedzi w polu dodawania: historia dodawanych produktów (sensor "często kupowane"),
  // od najczęstszych, bez pozycji już na liście i bez leków (PESEL).
  _podpowiedzi() {
    const s = this._hass.states[this._config.czeste];
    const c = (s && s.attributes.czeste) || {};
    const na = new Set(this._items.filter((i) => i.status === 'needs_action').map((i) => norm(i.summary)));
    const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
    return Object.entries(c)
      .filter(([n]) => !na.has(n) && !jestLek(n))
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pl'))
      .map(([n]) => cap(n));
  }

  _auto(nazwa) {
    if (this._kat.leki && jestLek(nazwa)) return 'leki';
    const n = ` ${bezZnakow(nazwa).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ')} `;
    // Najpierw słowa z "!" (pierwszeństwo), potem zwykłe; w obu przypadkach wygrywa najdłuższe dopasowanie.
    for (const prio of [true, false]) {
      let best = null, len = 0;
      for (const k of this._kategorie) {
        for (const sl of k.slowa || []) {
          if (sl.startsWith('!') !== prio) continue;
          const cale = sl.endsWith('=');
          const w = bezZnakow(sl.replace(/^!/, '').replace(/=$/, ''));
          if (w.length > len && n.includes(` ${w}${cale ? ' ' : ''}`)) { best = k.id; len = w.length; }
        }
      }
      if (best) return best;
    }
    return 'inne';
  }

  _kategoria(item, attr) {
    const r = attr.tagi[norm(item.summary)];
    return r && this._kat[r] ? { id: r, reczna: true } : { id: this._auto(item.summary), reczna: false };
  }

  // --- akcje ---
  _skrypt(dane) {
    return this._hass.callService('script', this._config.script.replace(/^script\./, ''), dane);
  }

  _dodaj() {
    const inp = this.shadowRoot.getElementById('nowy');
    const nazwa = inp.value.trim();
    if (!nazwa) return;
    inp.value = '';
    this._hass.callService('todo', 'add_item', { item: nazwa }, { entity_id: this._config.entity });
    const pilne = this.shadowRoot.getElementById('nowy-pilne').classList.contains('on');
    const dane = { nazwa };
    // Dodawanie przy aktywnym filtrze kategorii przypisuje tę kategorię (jeśli auto wskazuje inną).
    if (this._kat[this._filtr] && this._auto(nazwa) !== this._filtr) dane.tag = this._filtr;
    if (pilne || this._filtr === 'pilne') dane.pilne = true;
    if (Object.keys(dane).length > 1) this._skrypt(dane);
    this.shadowRoot.getElementById('nowy-pilne').classList.remove('on');
  }

  _item(uid) { return this._items.find((i) => i.uid === uid); }

  _akcja(el) {
    const a = el.dataset.a, uid = el.dataset.uid, it = uid && this._item(uid);
    const attr = this._attr();
    switch (a) {
      case 'sort': this._sort = el.dataset.v; this._zapisz(); this._render(); break;
      case 'filtr': this._filtr = this._filtr === el.dataset.v ? 'wszystkie' : el.dataset.v; this._zapisz(); this._render(); break;
      case 'dodaj': this._dodaj(); break;
      case 'nowy-pilne': el.classList.toggle('on'); break;
      case 'kupione': this._pokazKupione = !this._pokazKupione; this._zapisz(); this._render(); break;
      case 'check': {
        if (!it) return;
        const done = it.status === 'needs_action';
        this._hass.callService('todo', 'update_item', { item: uid, status: done ? 'completed' : 'needs_action' }, { entity_id: this._config.entity });
        if (done && attr.pilne.includes(norm(it.summary))) this._skrypt({ nazwa: it.summary, pilne: false });
        break;
      }
      case 'pilne':
        if (it) this._skrypt({ nazwa: it.summary, pilne: !attr.pilne.includes(norm(it.summary)) });
        break;
      case 'menu': this._menu = this._menu === uid ? null : uid; this._render(); break;
      case 'ustaw':
        if (it) {
          const auto = this._auto(it.summary);
          this._skrypt({ nazwa: it.summary, tag: el.dataset.v === 'auto' || el.dataset.v === auto ? '' : el.dataset.v });
        }
        this._menu = null; this._render();
        break;
      case 'zmien': {
        if (!it) return;
        const nowa = prompt('Nazwa produktu', it.summary);
        if (!nowa || !nowa.trim() || nowa.trim() === it.summary) return;
        this._hass.callService('todo', 'update_item', { item: uid, rename: nowa.trim() }, { entity_id: this._config.entity });
        const k = this._kategoria(it, attr), p = attr.pilne.includes(norm(it.summary));
        if (k.reczna || p) {
          this._skrypt({ nazwa: nowa.trim(), ...(k.reczna ? { tag: k.id } : {}), ...(p ? { pilne: true } : {}) });
          this._skrypt({ nazwa: it.summary, ...(k.reczna ? { tag: '' } : {}), ...(p ? { pilne: false } : {}) });
        }
        this._menu = null;
        break;
      }
      case 'usun':
        if (it && confirm(`Usunąć „${it.summary}”?`)) {
          this._hass.callService('todo', 'remove_item', { item: uid }, { entity_id: this._config.entity });
          if (attr.pilne.includes(norm(it.summary))) this._skrypt({ nazwa: it.summary, pilne: false });
        }
        this._menu = null;
        break;
      case 'wyczysc':
        if (confirm('Usunąć wszystkie kupione pozycje?')) {
          this._hass.callService('todo', 'remove_completed_items', {}, { entity_id: this._config.entity });
        }
        break;
      default:
        if (a.startsWith('ed-')) this._akcjaEd(a, el);
    }
  }

  // --- edytor kategorii ---
  _akcjaEd(a, el) {
    const $ = (id) => this.shadowRoot.getElementById(id);
    const lista = [...this._kategorie];
    const i = lista.findIndex((k) => k.id === el.dataset.id);
    switch (a) {
      case 'ed-otworz': this._menu = null; this._ed = { tryb: 'lista' }; this._render(); break;
      case 'ed-zamknij': this._ed = null; this._render(); break;
      case 'ed-wstecz': this._ed = { tryb: 'lista' }; this._render(); break;
      case 'ed-gora':
      case 'ed-dol': {
        const j = a === 'ed-gora' ? i - 1 : i + 1;
        if (i < 0 || j < 0 || j >= lista.length - 1) return; // "Inne" zostaje na końcu
        [lista[i], lista[j]] = [lista[j], lista[i]];
        this._zapiszKategorie(lista);
        break;
      }
      case 'ed-edytuj': this._ed = { tryb: 'form', id: el.dataset.id }; this._renderEd(); break;
      case 'ed-nowa': this._ed = { tryb: 'form', id: null }; this._renderEd(); break;
      case 'ed-usun': {
        const k = lista[i];
        if (!k || k.id === 'inne') return;
        const attr = this._attr();
        const reczne = Object.values(attr.tagi).filter((t) => t === k.id).length;
        const n = this._items.filter((it) => it.status === 'needs_action' && this._kategoria(it, attr).id === k.id).length;
        let msg = `Usunąć kategorię „${k.nazwa}”?`;
        if (n) msg += `\n${n} produkt(y) na liście dostaną kategorię automatycznie (albo „Inne”).`;
        if (reczne) msg += `\nRęczne przypisania do tej kategorii: ${reczne} – zostaną pominięte.`;
        if (!confirm(msg)) return;
        lista.splice(i, 1);
        if (this._filtr === k.id) { this._filtr = 'wszystkie'; this._zapisz(); }
        this._zapiszKategorie(lista);
        break;
      }
      case 'ed-domyslne':
        if (!confirm('Przywrócić domyślne kategorie? Twoje zmiany (nowe kategorie, słowa, kolory) zostaną utracone.')) return;
        this._skrypt({ kategorie: [] });
        this._ustawKategorie(this._bazowe);
        this._render();
        break;
      case 'ed-ikona': $('ed-ikona').value = el.dataset.v; this._podglad(); break;
      case 'ed-kolor': $('ed-kolor').value = el.dataset.v; this._podglad(); break;
      case 'ed-zapisz': {
        const nazwa = $('ed-nazwa').value.trim();
        if (!nazwa) { $('ed-nazwa').focus(); return; }
        const id = this._ed.id;
        const stara = id ? this._kat[id] : null;
        const k = {
          id: id || `k_${Date.now().toString(36)}`,
          nazwa,
          ikona: $('ed-ikona').value.trim() || 'mdi:tag-outline',
          kolor: $('ed-kolor').value || '#9e9e9e',
          slowa: id === 'inne' ? [] : [...new Set($('ed-slowa').value.split(/[,;\n]+/).map((w) => w.trim().toLowerCase()).filter(Boolean))],
        };
        if (!k.ikona.includes(':')) k.ikona = `mdi:${k.ikona}`;
        if (stara) lista[lista.indexOf(stara)] = k;
        else lista.splice(lista.length - 1, 0, k); // nowa przed "Inne"
        this._ed = { tryb: 'lista' };
        this._zapiszKategorie(lista);
        break;
      }
      default:
    }
  }

  _podglad() {
    const $ = (id) => this.shadowRoot.getElementById(id);
    const ik = $('ed-ikona').value.trim() || 'mdi:tag-outline', kol = $('ed-kolor').value;
    const pv = $('ed-pv');
    pv.style.setProperty('--k', kol);
    pv.innerHTML = `<ha-icon icon="${esc(ik.includes(':') ? ik : `mdi:${ik}`)}"></ha-icon>${esc($('ed-nazwa').value.trim() || 'Nowa kategoria')}`;
    this.shadowRoot.querySelectorAll('[data-a="ed-kolor"]').forEach((b) => b.classList.toggle('cur', b.dataset.v === kol));
    this.shadowRoot.querySelectorAll('[data-a="ed-ikona"]').forEach((b) => b.classList.toggle('cur', b.dataset.v === ik));
  }

  // Formularz renderowany tylko na żądanie (aktualizacje hass nie kasują wpisywanego tekstu).
  _renderEd() {
    const ed = this.shadowRoot.getElementById('ed');
    if (!this._ed) { ed.innerHTML = ''; return; }
    if (this._ed.tryb === 'lista') {
      const attr = this._attr();
      const akt = this._items.filter((i) => i.status === 'needs_action');
      const ost = this._kategorie.length - 1;
      ed.innerHTML = `
        <div class="ed-hdr"><span>Kategorie</span><button class="link" data-a="ed-zamknij"><ha-icon icon="mdi:check"></ha-icon>Gotowe</button></div>
        ${this._kategorie.map((k, i) => {
          const n = akt.filter((it) => this._kategoria(it, attr).id === k.id).length;
          const opis = k.id === 'inne' ? 'produkty bez dopasowania' : `${k.slowa.length} słów kluczowych`;
          return `<div class="ek" style="--k:${k.kolor}">
            <ha-icon icon="${esc(k.ikona)}"></ha-icon>
            <div class="ek-nm" data-a="ed-edytuj" data-id="${esc(k.id)}">${esc(k.nazwa)}<span class="ek-op">${opis}${n ? ` · ${n} na liście` : ''}</span></div>
            <button class="pb" data-a="ed-gora" data-id="${esc(k.id)}" ${i === 0 || i === ost ? 'disabled' : ''} title="W górę"><ha-icon icon="mdi:chevron-up"></ha-icon></button>
            <button class="pb" data-a="ed-dol" data-id="${esc(k.id)}" ${i >= ost - 1 ? 'disabled' : ''} title="W dół"><ha-icon icon="mdi:chevron-down"></ha-icon></button>
            <button class="pb" data-a="ed-edytuj" data-id="${esc(k.id)}" title="Edytuj"><ha-icon icon="mdi:pencil"></ha-icon></button>
            <button class="pb del" data-a="ed-usun" data-id="${esc(k.id)}" ${i === ost ? 'disabled title="Kategorii Inne nie można usunąć"' : 'title="Usuń"'}><ha-icon icon="mdi:delete-outline"></ha-icon></button>
          </div>`;
        }).join('')}
        <div class="stopka">
          <button class="link" data-a="ed-nowa"><ha-icon icon="mdi:plus"></ha-icon>Dodaj kategorię</button>
          <button class="link" data-a="ed-domyslne"><ha-icon icon="mdi:restore"></ha-icon>Przywróć domyślne</button>
        </div>`;
      return;
    }
    const k = this._ed.id ? this._kat[this._ed.id] : { nazwa: '', ikona: 'mdi:tag-outline', kolor: KOLORY.find((c) => !this._kategorie.some((x) => x.kolor === c)) || '#546e7a', slowa: [] };
    if (!k) { this._ed = { tryb: 'lista' }; this._renderEd(); return; }
    const inne = this._ed.id === 'inne';
    ed.innerHTML = `
      <div class="ed-hdr"><button class="link" data-a="ed-wstecz"><ha-icon icon="mdi:arrow-left"></ha-icon>Kategorie</button>
        <span>${this._ed.id ? 'Edycja kategorii' : 'Nowa kategoria'}</span></div>
      <div class="pole"><span class="chip sel" id="ed-pv"></span></div>
      <label class="pole">Nazwa<input id="ed-nazwa" value="${esc(k.nazwa)}" placeholder="np. Mięso" autocomplete="off"></label>
      <div class="pole">Kolor<div class="wyb">${KOLORY.map((c) => `<button class="kol" style="background:${c}" data-a="ed-kolor" data-v="${c}"></button>`).join('')}
        <input type="color" id="ed-kolor" value="${esc(k.kolor)}" title="Własny kolor"></div></div>
      <div class="pole">Ikona<div class="wyb">${IKONY.map((ik) => `<button class="ikb" data-a="ed-ikona" data-v="${ik}"><ha-icon icon="${ik}"></ha-icon></button>`).join('')}</div>
        <input id="ed-ikona" value="${esc(k.ikona)}" placeholder="mdi:nazwa-ikony" autocomplete="off"></div>
      ${inne ? '' : `<label class="pole">Słowa kluczowe <span class="pod">oddzielone przecinkami; wystarczy początek słowa (np. „kiełbas” łapie „kiełbasa”, „kiełbaski”).
        Na końcu „=” – tylko całe słowo (np. „por=”); na początku „!” – pierwszeństwo przed innymi kategoriami.</span>
        <textarea id="ed-slowa" rows="5" placeholder="np. mięs, kurczak, schab, kiełbas, szynk">${esc(k.slowa.join(', '))}</textarea></label>`}
      ${this._ed.id === 'leki' ? '<div class="pod">Nazwy z numerem PESEL i kodem recepty zawsze trafiają do tej kategorii i są pilne.</div>' : ''}
      <div class="stopka">
        <button class="link" data-a="ed-wstecz">Anuluj</button>
        <button class="ib prim szer" data-a="ed-zapisz"><ha-icon icon="mdi:content-save"></ha-icon>Zapisz</button>
      </div>`;
    this._podglad();
    if (!this._ed.id) this.shadowRoot.getElementById('ed-nazwa').focus();
  }

  // --- widok ---
  _zbuduj() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        ha-card { padding: 12px 12px 8px; }
        .row { display: flex; align-items: center; gap: 8px; }
        .add { margin-bottom: 10px; }
        .add input { flex: 1; min-width: 0; font: inherit; font-size: 15px; padding: 10px 12px; border-radius: 10px;
          border: 1px solid var(--divider-color); background: var(--secondary-background-color); color: var(--primary-text-color); outline: none; }
        .add input:focus { border-color: var(--primary-color); }
        .ib { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 10px;
          cursor: pointer; color: var(--secondary-text-color); border: 1px solid var(--divider-color); background: none; flex: none; }
        .ib.prim { background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: transparent; }
        .ib.on { color: #fff; background: var(--error-color, #db4437); border-color: transparent; }
        .seg { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
        .seg button, .chip { font: inherit; font-size: 12.5px; border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
          border-radius: 16px; padding: 5px 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
        .seg button.sel { background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: transparent; }
        .chip ha-icon, .seg ha-icon { --mdc-icon-size: 16px; }
        .chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .chip .n { opacity: .7; font-size: 11.5px; }
        .chip.sel { background: var(--k); color: #fff; border-color: transparent; }
        .chip.sel .n { opacity: .9; }
        .grp { display: flex; align-items: center; gap: 6px; margin: 12px 2px 4px; font-size: 13px; font-weight: 600; color: var(--k); }
        .grp ha-icon { --mdc-icon-size: 18px; }
        .grp .n { font-weight: 400; color: var(--secondary-text-color); }
        .it { display: flex; align-items: center; gap: 6px; padding: 2px 0 2px 6px; border-left: 3px solid var(--k); border-radius: 2px; min-height: 42px; }
        .it + .it { border-top: 1px solid var(--divider-color); }
        .it.pil { background: rgba(219, 68, 55, .08); }
        .cb { width: 22px; height: 22px; flex: none; border: 2px solid var(--secondary-text-color); border-radius: 6px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; margin: 0 4px; }
        .cb ha-icon { --mdc-icon-size: 18px; color: #fff; }
        .done .cb { background: var(--primary-color); border-color: var(--primary-color); }
        .nm { flex: 1; min-width: 0; font-size: 15px; cursor: pointer; overflow-wrap: anywhere; }
        .done .nm { text-decoration: line-through; color: var(--secondary-text-color); }
        .tag { font-size: 11px; padding: 2px 8px; border-radius: 10px; color: #fff; background: var(--k); cursor: pointer; white-space: nowrap; border: none; font-family: inherit; }
        .tag.auto { background: none; color: var(--k); border: 1px dashed var(--k); }
        .pb { width: 34px; height: 34px; border: none; background: none; cursor: pointer; color: var(--disabled-text-color, #bbb); flex: none;
          display: flex; align-items: center; justify-content: center; border-radius: 8px; }
        .pb ha-icon { --mdc-icon-size: 20px; }
        .pb.on { color: var(--error-color, #db4437); }
        .pb[disabled] { cursor: default; }
        .pil-txt { font-size: 10.5px; font-weight: 700; color: var(--error-color, #db4437); letter-spacing: .3px; margin-right: 4px; }
        .menu { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 6px 10px 38px; }
        .menu .chip.cur { background: var(--k); color: #fff; border-color: transparent; }
        .menu .chip.warn { color: var(--error-color, #db4437); }
        .pusto { color: var(--secondary-text-color); padding: 16px 4px; text-align: center; }
        .stopka { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 6px; border-top: 1px solid var(--divider-color); }
        .link { background: none; border: none; font: inherit; font-size: 13px; color: var(--primary-color); cursor: pointer; padding: 6px 2px;
          display: inline-flex; align-items: center; gap: 4px; }
        .link ha-icon { --mdc-icon-size: 18px; }
        .seg .cfg { margin-left: auto; color: var(--secondary-text-color); }
        [hidden] { display: none !important; }
        .ed-hdr { display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 15px; margin-bottom: 6px; }
        .ek { display: flex; align-items: center; gap: 4px; padding: 4px 0 4px 8px; border-left: 3px solid var(--k); min-height: 44px; }
        .ek + .ek { border-top: 1px solid var(--divider-color); }
        .ek > ha-icon { color: var(--k); --mdc-icon-size: 20px; margin-right: 6px; }
        .ek-nm { flex: 1; min-width: 0; cursor: pointer; font-size: 15px; }
        .ek-op { display: block; font-size: 11.5px; color: var(--secondary-text-color); }
        .ek .pb:not([disabled]) { color: var(--secondary-text-color); }
        .ek .pb[disabled] { opacity: .35; }
        .ek .pb.del:not([disabled]) { color: var(--error-color, #db4437); }
        .pole { display: flex; flex-direction: column; gap: 6px; margin: 10px 0; font-size: 13px; color: var(--secondary-text-color); }
        .pole input:not([type=color]), .pole textarea { font: inherit; font-size: 15px; padding: 9px 11px; border-radius: 10px; border: 1px solid var(--divider-color);
          background: var(--secondary-background-color); color: var(--primary-text-color); outline: none; resize: vertical; }
        .pole input:focus, .pole textarea:focus { border-color: var(--primary-color); }
        .pod { font-size: 11.5px; color: var(--secondary-text-color); font-weight: 400; }
        .wyb { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .kol { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; }
        .kol.cur { border-color: var(--primary-text-color); box-shadow: 0 0 0 2px var(--card-background-color, #fff) inset; }
        .wyb input[type=color] { width: 36px; height: 30px; border: none; background: none; padding: 0; cursor: pointer; }
        .ikb { width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--divider-color); background: none; cursor: pointer;
          color: var(--primary-text-color); display: flex; align-items: center; justify-content: center; }
        .ikb.cur { background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: transparent; }
        #ed-pv { align-self: flex-start; font-size: 14px; padding: 6px 12px; }
        .ib.szer { width: auto; padding: 0 16px; gap: 6px; font: inherit; font-size: 14px; }
      </style>
      <ha-card>
        <div id="glowny">
        <div class="row add">
          <input id="nowy" list="podp" placeholder="Dodaj produkt…" enterkeyhint="done" autocomplete="off"><datalist id="podp"></datalist>
          <button class="ib" id="nowy-pilne" data-a="nowy-pilne" title="Dodaj jako pilne"><ha-icon icon="mdi:alert-circle-outline"></ha-icon></button>
          <button class="ib prim" data-a="dodaj" title="Dodaj"><ha-icon icon="mdi:plus"></ha-icon></button>
        </div>
        <div class="seg" id="sort"></div>
        <div class="chips" id="chips"></div>
        <div id="lista"></div>
        <div id="kupione"></div>
        </div>
        <div id="ed" hidden></div>
      </ha-card>`;
    root.getElementById('nowy').addEventListener('keydown', (e) => { if (e.key === 'Enter') this._dodaj(); });
    root.addEventListener('input', (e) => { if (['ed-nazwa', 'ed-ikona', 'ed-kolor'].includes(e.target.id)) this._podglad(); });
    root.addEventListener('click', (e) => {
      const el = e.composedPath().find((n) => n.dataset && n.dataset.a);
      if (el) { e.stopPropagation(); this._akcja(el); }
    });
  }

  _wiersz(it, attr) {
    const k = this._kategoria(it, attr), kat = this._kat[k.id];
    const done = it.status === 'completed';
    const pil = !done && this._pilne(it, attr);
    const lek = k.id === 'leki';
    let h = `<div class="it ${done ? 'done' : ''} ${pil ? 'pil' : ''}" style="--k:${kat.kolor}">
      <div class="cb" data-a="check" data-uid="${esc(it.uid)}">${done ? '<ha-icon icon="mdi:check"></ha-icon>' : ''}</div>
      <div class="nm" data-a="zmien" data-uid="${esc(it.uid)}">${pil ? '<span class="pil-txt">PILNE</span>' : ''}${esc(it.summary)}</div>
      <button class="tag ${k.reczna ? '' : 'auto'}" data-a="menu" data-uid="${esc(it.uid)}" title="${k.reczna ? 'Kategoria przypisana ręcznie' : 'Kategoria dobrana automatycznie'}">${esc(kat.nazwa)}</button>
      ${done ? '' : `<button class="pb ${pil ? 'on' : ''}" ${lek ? 'disabled title="Leki są zawsze pilne"' : ''} data-a="pilne" data-uid="${esc(it.uid)}" title="Pilne"><ha-icon icon="${pil ? 'mdi:alert-circle' : 'mdi:alert-circle-outline'}"></ha-icon></button>`}
    </div>`;
    if (this._menu === it.uid) {
      const auto = this._auto(it.summary);
      h += `<div class="menu">${this._kategorie.map((c) => `<button class="chip ${c.id === k.id ? 'cur' : ''}" style="--k:${c.kolor}" data-a="ustaw" data-v="${c.id}" data-uid="${esc(it.uid)}"><ha-icon icon="${c.ikona}"></ha-icon>${esc(c.nazwa)}${c.id === auto ? ' <span class="n">(auto)</span>' : ''}</button>`).join('')}
        <button class="chip" data-a="zmien" data-uid="${esc(it.uid)}"><ha-icon icon="mdi:pencil"></ha-icon>Zmień nazwę</button>
        <button class="chip warn" data-a="usun" data-uid="${esc(it.uid)}"><ha-icon icon="mdi:delete-outline"></ha-icon>Usuń</button></div>`;
    }
    return h;
  }

  _render() {
    if (!this.shadowRoot || !this._hass) return;
    const $ = (id) => this.shadowRoot.getElementById(id);
    $('glowny').hidden = !!this._ed;
    $('ed').hidden = !this._ed;
    if (!this._ed || this._ed.tryb === 'lista') this._renderEd();
    const attr = this._attr();
    const aktywne = this._items.filter((i) => i.status === 'needs_action');
    const kupione = this._items.filter((i) => i.status === 'completed');
    const katOf = new Map(this._items.map((i) => [i.uid, this._kategoria(i, attr).id]));
    const jestPilne = (i) => this._pilne(i, attr);

    $('podp').innerHTML = this._podpowiedzi().map((n) => `<option value="${esc(n)}"></option>`).join('');

    $('sort').innerHTML = SORTY.map((s) => `<button class="${s.id === this._sort ? 'sel' : ''}" data-a="sort" data-v="${s.id}"><ha-icon icon="${s.ikona}"></ha-icon>${s.nazwa}</button>`).join('')
      + '<button class="cfg" data-a="ed-otworz" title="Dodawaj, usuwaj i zmieniaj kategorie"><ha-icon icon="mdi:cog-outline"></ha-icon>Kategorie</button>';

    const ile = (id) => aktywne.filter((i) => katOf.get(i.uid) === id).length;
    const nPilne = aktywne.filter(jestPilne).length;
    if (this._filtr !== 'wszystkie' && this._filtr !== 'pilne' && !this._kat[this._filtr]) this._filtr = 'wszystkie';
    $('chips').innerHTML = [
      `<button class="chip ${this._filtr === 'wszystkie' ? 'sel' : ''}" style="--k:var(--primary-color)" data-a="filtr" data-v="wszystkie">Wszystkie <span class="n">${aktywne.length}</span></button>`,
      `<button class="chip ${this._filtr === 'pilne' ? 'sel' : ''}" style="--k:var(--error-color, #db4437)" data-a="filtr" data-v="pilne"><ha-icon icon="mdi:alert-circle"></ha-icon>Pilne <span class="n">${nPilne}</span></button>`,
      ...this._kategorie.map((k) => {
        const n = ile(k.id);
        if (k.id === 'inne' && !n && this._filtr !== 'inne') return '';
        return `<button class="chip ${this._filtr === k.id ? 'sel' : ''}" style="--k:${k.kolor}" data-a="filtr" data-v="${k.id}"><ha-icon icon="${k.ikona}"></ha-icon>${esc(k.nazwa)} <span class="n">${n}</span></button>`;
      }),
    ].join('');

    let lista = aktywne;
    if (this._filtr === 'pilne') lista = lista.filter(jestPilne);
    else if (this._filtr !== 'wszystkie') lista = lista.filter((i) => katOf.get(i.uid) === this._filtr);

    const poz = new Map(this._items.map((i, n) => [i.uid, n]));
    const alfa = (a, b) => a.summary.localeCompare(b.summary, 'pl', { sensitivity: 'base' });
    const cmp = {
      az: alfa, kat: alfa,
      za: (a, b) => -alfa(a, b),
      lista: (a, b) => poz.get(a.uid) - poz.get(b.uid),
    }[this._sort] || alfa;
    // Pilne zawsze na górze (w grupie / na liście).
    lista = [...lista].sort((a, b) => (jestPilne(b) - jestPilne(a)) || cmp(a, b));

    let h = '';
    if (!lista.length) {
      h = `<div class="pusto">${aktywne.length ? 'Brak produktów w tym filtrze' : 'Lista jest pusta 🎉'}</div>`;
    } else if (this._sort === 'kat') {
      for (const k of this._kategorie) {
        const g = lista.filter((i) => katOf.get(i.uid) === k.id);
        if (!g.length) continue;
        h += `<div class="grp" style="--k:${k.kolor}"><ha-icon icon="${k.ikona}"></ha-icon>${esc(k.nazwa)} <span class="n">${g.length}</span></div>`;
        h += g.map((i) => this._wiersz(i, attr)).join('');
      }
    } else {
      h = lista.map((i) => this._wiersz(i, attr)).join('');
    }
    $('lista').innerHTML = h;

    $('kupione').innerHTML = kupione.length ? `
      <div class="stopka">
        <button class="link" data-a="kupione"><ha-icon icon="${this._pokazKupione ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>Kupione (${kupione.length})</button>
        <button class="link" data-a="wyczysc"><ha-icon icon="mdi:delete-sweep-outline"></ha-icon>Usuń kupione</button>
      </div>
      ${this._pokazKupione ? [...kupione].sort(alfa).map((i) => this._wiersz(i, attr)).join('') : ''}` : '';
  }

  static getStubConfig() { return { entity: 'todo.lista_zakupow' }; }
}

if (!customElements.get('zakupy-lista-card')) customElements.define('zakupy-lista-card', ZakupyListaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'zakupy-lista-card', name: 'Lista zakupów (kategorie)', description: 'Lista todo z kategoriami, sortowaniem i flagą pilne' });
