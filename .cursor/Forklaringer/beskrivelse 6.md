/**
* @vue/shared v3.4.38
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
function Hs(e, t) {
    const n = new Set(e.split(","));
    return s => n.has(s)
}
const ie = {}
  , _t = []
  , Pe = () => {}
  , io = () => !1
  , sn = e => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97)
  , $s = e => e.startsWith("onUpdate:")
  , fe = Object.assign
  , js = (e, t) => {
    const n = e.indexOf(t);
    n > -1 && e.splice(n, 1)
}
  , ro = Object.prototype.hasOwnProperty
  , Q = (e, t) => ro.call(e, t)
  , k = Array.isArray
  , Ct = e => Dt(e) === "[object Map]"
  , jn = e => Dt(e) === "[object Set]"
  , yi = e => Dt(e) === "[object Date]"
  , lo = e => Dt(e) === "[object RegExp]"
  , U = e => typeof e == "function"
  , re = e => typeof e == "string"
  , He = e => typeof e == "symbol"
  , ne = e => e !== null && typeof e == "object"
  , Gs = e => (ne(e) || U(e)) && U(e.then) && U(e.catch)
  , dr = Object.prototype.toString
  , Dt = e => dr.call(e)
  , oo = e => Dt(e).slice(8, -1)
  , pr = e => Dt(e) === "[object Object]"
  , ks = e => re(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e
  , Pt = Hs(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted")
  , Gn = e => {
    const t = Object.create(null);
    return n => t[n] || (t[n] = e(n))
}
  , ao = /-(\w)/g
  , Re = Gn(e => e.replace(ao, (t, n) => n ? n.toUpperCase() : ""))
  , fo = /\B([A-Z])/g
  , rt = Gn(e => e.replace(fo, "-$1").toLowerCase())
  , kn = Gn(e => e.charAt(0).toUpperCase() + e.slice(1))
  , Cn = Gn(e => e ? `on${kn(e)}` : "")
  , it = (e, t) => !Object.is(e, t)
  , Mt = (e, ...t) => {
    for (let n = 0; n < e.length; n++)
        e[n](...t)
}
  , hr = (e, t, n, s=!1) => {
    Object.defineProperty(e, t, {
        configurable: !0,
        enumerable: !1,
        writable: s,
        value: n
    })
}
  , bs = e => {
    const t = parseFloat(e);
    return isNaN(t) ? e : t
}
  , gr = e => {
    const t = re(e) ? Number(e) : NaN;
    return isNaN(t) ? e : t
}
;
let wi;
const mr = () => wi || (wi = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Wn(e) {
    if (k(e)) {
        const t = {};
        for (let n = 0; n < e.length; n++) {
            const s = e[n]
              , i = re(s) ? ho(s) : Wn(s);
            if (i)
                for (const r in i)
                    t[r] = i[r]
        }
        return t
    } else if (re(e) || ne(e))
        return e
}
const co = /;(?![^(]*\))/g
  , uo = /:([^]+)/
  , po = /\/\*[^]*?\*\//g;
function ho(e) {
    const t = {};
    return e.replace(po, "").split(co).forEach(n => {
        if (n) {
            const s = n.split(uo);
            s.length > 1 && (t[s[0].trim()] = s[1].trim())
        }
    }
    ),
    t
}
function Kn(e) {
    let t = "";
    if (re(e))
        t = e;
    else if (k(e))
        for (let n = 0; n < e.length; n++) {
            const s = Kn(e[n]);
            s && (t += s + " ")
        }
    else if (ne(e))
        for (const n in e)
            e[n] && (t += n + " ");
    return t.trim()
}
function mu(e) {
    if (!e)
        return null;
    let {class: t, style: n} = e;
    return t && !re(t) && (e.class = Kn(t)),
    n && (e.style = Wn(n)),
    e
}
const go = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly"
  , mo = Hs(go);
function vr(e) {
    return !!e || e === ""
}
function vo(e, t) {
    if (e.length !== t.length)
        return !1;
    let n = !0;
    for (let s = 0; n && s < e.length; s++)
        n = Un(e[s], t[s]);
    return n
}
function Un(e, t) {
    if (e === t)
        return !0;
    let n = yi(e)
      , s = yi(t);
    if (n || s)
        return n && s ? e.getTime() === t.getTime() : !1;
    if (n = He(e),
    s = He(t),
    n || s)
        return e === t;
    if (n = k(e),
    s = k(t),
    n || s)
        return n && s ? vo(e, t) : !1;
    if (n = ne(e),
    s = ne(t),
    n || s) {
        if (!n || !s)
            return !1;
        const i = Object.keys(e).length
          , r = Object.keys(t).length;
        if (i !== r)
            return !1;
        for (const l in e) {
            const a = e.hasOwnProperty(l)
              , o = t.hasOwnProperty(l);
            if (a && !o || !a && o || !Un(e[l], t[l]))
                return !1
        }
    }
    return String(e) === String(t)
}
function yr(e, t) {
    return e.findIndex(n => Un(n, t))
}
const wr = e => !!(e && e.__v_isRef === !0)
  , yo = e => re(e) ? e : e == null ? "" : k(e) || ne(e) && (e.toString === dr || !U(e.toString)) ? wr(e) ? yo(e.value) : JSON.stringify(e, br, 2) : String(e)
  , br = (e, t) => wr(t) ? br(e, t.value) : Ct(t) ? {
    [`Map(${t.size})`]: [...t.entries()].reduce( (n, [s,i], r) => (n[ss(s, r) + " =>"] = i,
    n), {})
} : jn(t) ? {
    [`Set(${t.size})`]: [...t.values()].map(n => ss(n))
} : He(t) ? ss(t) : ne(t) && !k(t) && !pr(t) ? String(t) : t
  , ss = (e, t="") => {
    var n;
    return He(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
}
;
/**
* @vue/reactivity v3.4.38
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Ee;
class Sr {
    constructor(t=!1) {
        this.detached = t,
        this._active = !0,
        this.effects = [],
        this.cleanups = [],
        this.parent = Ee,
        !t && Ee && (this.index = (Ee.scopes || (Ee.scopes = [])).push(this) - 1)
    }
    get active() {
        return this._active
    }
    run(t) {
        if (this._active) {
            const n = Ee;
            try {
                return Ee = this,
                t()
            } finally {
                Ee = n
            }
        }
    }
    on() {
        Ee = this
    }
    off() {
        Ee = this.parent
    }
    stop(t) {
        if (this._active) {
            let n, s;
            for (n = 0,
            s = this.effects.length; n < s; n++)
                this.effects[n].stop();
            for (n = 0,
            s = this.cleanups.length; n < s; n++)
                this.cleanups[n]();
            if (this.scopes)
                for (n = 0,
                s = this.scopes.length; n < s; n++)
                    this.scopes[n].stop(!0);
            if (!this.detached && this.parent && !t) {
                const i = this.parent.scopes.pop();
                i && i !== this && (this.parent.scopes[this.index] = i,
                i.index = this.index)
            }
            this.parent = void 0,
            this._active = !1
        }
    }
}
function vu(e) {
    return new Sr(e)
}
function wo(e, t=Ee) {
    t && t.active && t.effects.push(e)
}
function bo() {
    return Ee
}
function yu(e) {
    Ee && Ee.cleanups.push(e)
}
let dt;
class Ws {
    constructor(t, n, s, i) {
        this.fn = t,
        this.trigger = n,
        this.scheduler = s,
        this.active = !0,
        this.deps = [],
        this._dirtyLevel = 4,
        this._trackId = 0,
        this._runnings = 0,
        this._shouldSchedule = !1,
        this._depsLength = 0,
        wo(this, i)
    }
    get dirty() {
        if (this._dirtyLevel === 2 || this._dirtyLevel === 3) {
            this._dirtyLevel = 1,
            lt();
            for (let t = 0; t < this._depsLength; t++) {
                const n = this.deps[t];
                if (n.computed && (So(n.computed),
                this._dirtyLevel >= 4))
                    break
            }
            this._dirtyLevel === 1 && (this._dirtyLevel = 0),
            ot()
        }
        return this._dirtyLevel >= 4
    }
    set dirty(t) {
        this._dirtyLevel = t ? 4 : 0
    }
    run() {
        if (this._dirtyLevel = 0,
        !this.active)
            return this.fn();
        let t = nt
          , n = dt;
        try {
            return nt = !0,
            dt = this,
            this._runnings++,
            bi(this),
            this.fn()
        } finally {
            Si(this),
            this._runnings--,
            dt = n,
            nt = t
        }
    }
    stop() {
        this.active && (bi(this),
        Si(this),
        this.onStop && this.onStop(),
        this.active = !1)
    }
}
function So(e) {
    return e.value
}
function bi(e) {
    e._trackId++,
    e._depsLength = 0
}
function Si(e) {
    if (e.deps.length > e._depsLength) {
        for (let t = e._depsLength; t < e.deps.length; t++)
            Tr(e.deps[t], e);
        e.deps.length = e._depsLength
    }
}
function Tr(e, t) {
    const n = e.get(t);
    n !== void 0 && t._trackId !== n && (e.delete(t),
    e.size === 0 && e.cleanup())
}
let nt = !0
  , Ss = 0;
const xr = [];
function lt() {
    xr.push(nt),
    nt = !1
}
function ot() {
    const e = xr.pop();
    nt = e === void 0 ? !0 : e
}
function Ks() {
    Ss++
}
function Us() {
    for (Ss--; !Ss && Ts.length; )
        Ts.shift()()
}
function Er(e, t, n) {
    if (t.get(e) !== e._trackId) {
        t.set(e, e._trackId);
        const s = e.deps[e._depsLength];
        s !== t ? (s && Tr(s, e),
        e.deps[e._depsLength++] = t) : e._depsLength++
    }
}
const Ts = [];
function _r(e, t, n) {
    Ks();
    for (const s of e.keys()) {
        let i;
        s._dirtyLevel < t && (i ?? (i = e.get(s) === s._trackId)) && (s._shouldSchedule || (s._shouldSchedule = s._dirtyLevel === 0),
        s._dirtyLevel = t),
        s._shouldSchedule && (i ?? (i = e.get(s) === s._trackId)) && (s.trigger(),
        (!s._runnings || s.allowRecurse) && s._dirtyLevel !== 2 && (s._shouldSchedule = !1,
        s.scheduler && Ts.push(s.scheduler)))
    }
    Us()
}
const Cr = (e, t) => {
    const n = new Map;
    return n.cleanup = e,
    n.computed = t,
    n
}
  , An = new WeakMap
  , pt = Symbol("")
  , xs = Symbol("");
function be(e, t, n) {
    if (nt && dt) {
        let s = An.get(e);
        s || An.set(e, s = new Map);
        let i = s.get(n);
        i || s.set(n, i = Cr( () => s.delete(n))),
        Er(dt, i)
    }
}
function We(e, t, n, s, i, r) {
    const l = An.get(e);
    if (!l)
        return;
    let a = [];
    if (t === "clear")
        a = [...l.values()];
    else if (n === "length" && k(e)) {
        const o = Number(s);
        l.forEach( (f, c) => {
            (c === "length" || !He(c) && c >= o) && a.push(f)
        }
        )
    } else
        switch (n !== void 0 && a.push(l.get(n)),
        t) {
        case "add":
            k(e) ? ks(n) && a.push(l.get("length")) : (a.push(l.get(pt)),
            Ct(e) && a.push(l.get(xs)));
            break;
        case "delete":
            k(e) || (a.push(l.get(pt)),
            Ct(e) && a.push(l.get(xs)));
            break;
        case "set":
            Ct(e) && a.push(l.get(pt));
            break
        }
    Ks();
    for (const o of a)
        o && _r(o, 4);
    Us()
}
function To(e, t) {
    const n = An.get(e);
    return n && n.get(t)
}
const xo = Hs("__proto__,__v_isRef,__isVue")
  , Pr = new Set(Object.getOwnPropertyNames(Symbol).filter(e => e !== "arguments" && e !== "caller").map(e => Symbol[e]).filter(He))
  , Ti = Eo();
function Eo() {
    const e = {};
    return ["includes", "indexOf", "lastIndexOf"].forEach(t => {
        e[t] = function(...n) {
            const s = ee(this);
            for (let r = 0, l = this.length; r < l; r++)
                be(s, "get", r + "");
            const i = s[t](...n);
            return i === -1 || i === !1 ? s[t](...n.map(ee)) : i
        }
    }
    ),
    ["push", "pop", "shift", "unshift", "splice"].forEach(t => {
        e[t] = function(...n) {
            lt(),
            Ks();
            const s = ee(this)[t].apply(this, n);
            return Us(),
            ot(),
            s
        }
    }
    ),
    e
}
function _o(e) {
    He(e) || (e = String(e));
    const t = ee(this);
    return be(t, "has", e),
    t.hasOwnProperty(e)
}
class Mr {
    constructor(t=!1, n=!1) {
        this._isReadonly = t,
        this._isShallow = n
    }
    get(t, n, s) {
        const i = this._isReadonly
          , r = this._isShallow;
        if (n === "__v_isReactive")
            return !i;
        if (n === "__v_isReadonly")
            return i;
        if (n === "__v_isShallow")
            return r;
        if (n === "__v_raw")
            return s === (i ? r ? Vo : Lr : r ? Ar : Ir).get(t) || Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
        const l = k(t);
        if (!i) {
            if (l && Q(Ti, n))
                return Reflect.get(Ti, n, s);
            if (n === "hasOwnProperty")
                return _o
        }
        const a = Reflect.get(t, n, s);
        return (He(n) ? Pr.has(n) : xo(n)) || (i || be(t, "get", n),
        r) ? a : ge(a) ? l && ks(n) ? a : a.value : ne(a) ? i ? Br(a) : Xs(a) : a
    }
}
class Or extends Mr {
    constructor(t=!1) {
        super(!1, t)
    }
    set(t, n, s, i) {
        let r = t[n];
        if (!this._isShallow) {
            const o = yt(r);
            if (!Bt(s) && !yt(s) && (r = ee(r),
            s = ee(s)),
            !k(t) && ge(r) && !ge(s))
                return o ? !1 : (r.value = s,
                !0)
        }
        const l = k(t) && ks(n) ? Number(n) < t.length : Q(t, n)
          , a = Reflect.set(t, n, s, i);
        return t === ee(i) && (l ? it(s, r) && We(t, "set", n, s) : We(t, "add", n, s)),
        a
    }
    deleteProperty(t, n) {
        const s = Q(t, n);
        t[n];
        const i = Reflect.deleteProperty(t, n);
        return i && s && We(t, "delete", n, void 0),
        i
    }
    has(t, n) {
        const s = Reflect.has(t, n);
        return (!He(n) || !Pr.has(n)) && be(t, "has", n),
        s
    }
    ownKeys(t) {
        return be(t, "iterate", k(t) ? "length" : pt),
        Reflect.ownKeys(t)
    }
}
class Co extends Mr {
    constructor(t=!1) {
        super(!0, t)
    }
    set(t, n) {
        return !0
    }
    deleteProperty(t, n) {
        return !0
    }
}
const Po = new Or
  , Mo = new Co
  , Oo = new Or(!0);
const qs = e => e
  , qn = e => Reflect.getPrototypeOf(e);
function pn(e, t, n=!1, s=!1) {
    e = e.__v_raw;
    const i = ee(e)
      , r = ee(t);
    n || (it(t, r) && be(i, "get", t),
    be(i, "get", r));
    const {has: l} = qn(i)
      , a = s ? qs : n ? Zs : Zt;
    if (l.call(i, t))
        return a(e.get(t));
    if (l.call(i, r))
        return a(e.get(r));
    e !== i && e.get(t)
}
function hn(e, t=!1) {
    const n = this.__v_raw
      , s = ee(n)
      , i = ee(e);
    return t || (it(e, i) && be(s, "has", e),
    be(s, "has", i)),
    e === i ? n.has(e) : n.has(e) || n.has(i)
}
function gn(e, t=!1) {
    return e = e.__v_raw,
    !t && be(ee(e), "iterate", pt),
    Reflect.get(e, "size", e)
}
function xi(e, t=!1) {
    !t && !Bt(e) && !yt(e) && (e = ee(e));
    const n = ee(this);
    return qn(n).has.call(n, e) || (n.add(e),
    We(n, "add", e, e)),
    this
}
function Ei(e, t, n=!1) {
    !n && !Bt(t) && !yt(t) && (t = ee(t));
    const s = ee(this)
      , {has: i, get: r} = qn(s);
    let l = i.call(s, e);
    l || (e = ee(e),
    l = i.call(s, e));
    const a = r.call(s, e);
    return s.set(e, t),
    l ? it(t, a) && We(s, "set", e, t) : We(s, "add", e, t),
    this
}
function _i(e) {
    const t = ee(this)
      , {has: n, get: s} = qn(t);
    let i = n.call(t, e);
    i || (e = ee(e),
    i = n.call(t, e)),
    s && s.call(t, e);
    const r = t.delete(e);
    return i && We(t, "delete", e, void 0),
    r
}
function Ci() {
    const e = ee(this)
      , t = e.size !== 0
      , n = e.clear();
    return t && We(e, "clear", void 0, void 0),
    n
}
function mn(e, t) {
    return function(s, i) {
        const r = this
          , l = r.__v_raw
          , a = ee(l)
          , o = t ? qs : e ? Zs : Zt;
        return !e && be(a, "iterate", pt),
        l.forEach( (f, c) => s.call(i, o(f), o(c), r))
    }
}
function vn(e, t, n) {
    return function(...s) {
        const i = this.__v_raw
          , r = ee(i)
          , l = Ct(r)
          , a = e === "entries" || e === Symbol.iterator && l
          , o = e === "keys" && l
          , f = i[e](...s)
          , c = n ? qs : t ? Zs : Zt;
        return !t && be(r, "iterate", o ? xs : pt),
        {
            next() {
                const {value: u, done: h} = f.next();
                return h ? {
                    value: u,
                    done: h
                } : {
                    value: a ? [c(u[0]), c(u[1])] : c(u),
                    done: h
                }
            },
            [Symbol.iterator]() {
                return this
            }
        }
    }
}
function qe(e) {
    return function(...t) {
        return e === "delete" ? !1 : e === "clear" ? void 0 : this
    }
}
function Io() {
    const e = {
        get(r) {
            return pn(this, r)
        },
        get size() {
            return gn(this)
        },
        has: hn,
        add: xi,
        set: Ei,
        delete: _i,
        clear: Ci,
        forEach: mn(!1, !1)
    }
      , t = {
        get(r) {
            return pn(this, r, !1, !0)
        },
        get size() {
            return gn(this)
        },
        has: hn,
        add(r) {
            return xi.call(this, r, !0)
        },
        set(r, l) {
            return Ei.call(this, r, l, !0)
        },
        delete: _i,
        clear: Ci,
        forEach: mn(!1, !0)
    }
      , n = {
        get(r) {
            return pn(this, r, !0)
        },
        get size() {
            return gn(this, !0)
        },
        has(r) {
            return hn.call(this, r, !0)
        },
        add: qe("add"),
        set: qe("set"),
        delete: qe("delete"),
        clear: qe("clear"),
        forEach: mn(!0, !1)
    }
      , s = {
        get(r) {
            return pn(this, r, !0, !0)
        },
        get size() {
            return gn(this, !0)
        },
        has(r) {
            return hn.call(this, r, !0)
        },
        add: qe("add"),
        set: qe("set"),
        delete: qe("delete"),
        clear: qe("clear"),
        forEach: mn(!0, !0)
    };
    return ["keys", "values", "entries", Symbol.iterator].forEach(r => {
        e[r] = vn(r, !1, !1),
        n[r] = vn(r, !0, !1),
        t[r] = vn(r, !1, !0),
        s[r] = vn(r, !0, !0)
    }
    ),
    [e, n, t, s]
}
const [Ao,Lo,Bo,Fo] = Io();
function Ys(e, t) {
    const n = t ? e ? Fo : Bo : e ? Lo : Ao;
    return (s, i, r) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_raw" ? s : Reflect.get(Q(n, i) && i in s ? n : s, i, r)
}
const Ro = {
    get: Ys(!1, !1)
}
  , No = {
    get: Ys(!1, !0)
}
  , Do = {
    get: Ys(!0, !1)
};
const Ir = new WeakMap
  , Ar = new WeakMap
  , Lr = new WeakMap
  , Vo = new WeakMap;
function zo(e) {
    switch (e) {
    case "Object":
    case "Array":
        return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
        return 2;
    default:
        return 0
    }
}
function Ho(e) {
    return e.__v_skip || !Object.isExtensible(e) ? 0 : zo(oo(e))
}
function Xs(e) {
    return yt(e) ? e : Js(e, !1, Po, Ro, Ir)
}
function $o(e) {
    return Js(e, !1, Oo, No, Ar)
}
function Br(e) {
    return Js(e, !0, Mo, Do, Lr)
}
function Js(e, t, n, s, i) {
    if (!ne(e) || e.__v_raw && !(t && e.__v_isReactive))
        return e;
    const r = i.get(e);
    if (r)
        return r;
    const l = Ho(e);
    if (l === 0)
        return e;
    const a = new Proxy(e,l === 2 ? s : n);
    return i.set(e, a),
    a
}
function Ot(e) {
    return yt(e) ? Ot(e.__v_raw) : !!(e && e.__v_isReactive)
}
function yt(e) {
    return !!(e && e.__v_isReadonly)
}
function Bt(e) {
    return !!(e && e.__v_isShallow)
}
function Fr(e) {
    return e ? !!e.__v_raw : !1
}
function ee(e) {
    const t = e && e.__v_raw;
    return t ? ee(t) : e
}
function jo(e) {
    return Object.isExtensible(e) && hr(e, "__v_skip", !0),
    e
}
const Zt = e => ne(e) ? Xs(e) : e
  , Zs = e => ne(e) ? Br(e) : e;
class Rr {
    constructor(t, n, s, i) {
        this.getter = t,
        this._setter = n,
        this.dep = void 0,
        this.__v_isRef = !0,
        this.__v_isReadonly = !1,
        this.effect = new Ws( () => t(this._value), () => Wt(this, this.effect._dirtyLevel === 2 ? 2 : 3)),
        this.effect.computed = this,
        this.effect.active = this._cacheable = !i,
        this.__v_isReadonly = s
    }
    get value() {
        const t = ee(this);
        return (!t._cacheable || t.effect.dirty) && it(t._value, t._value = t.effect.run()) && Wt(t, 4),
        Qs(t),
        t.effect._dirtyLevel >= 2 && Wt(t, 2),
        t._value
    }
    set value(t) {
        this._setter(t)
    }
    get _dirty() {
        return this.effect.dirty
    }
    set _dirty(t) {
        this.effect.dirty = t
    }
}
function Go(e, t, n=!1) {
    let s, i;
    const r = U(e);
    return r ? (s = e,
    i = Pe) : (s = e.get,
    i = e.set),
    new Rr(s,i,r || !i,n)
}
function Qs(e) {
    var t;
    nt && dt && (e = ee(e),
    Er(dt, (t = e.dep) != null ? t : e.dep = Cr( () => e.dep = void 0, e instanceof Rr ? e : void 0)))
}
function Wt(e, t=4, n, s) {
    e = ee(e);
    const i = e.dep;
    i && _r(i, t)
}
function ge(e) {
    return !!(e && e.__v_isRef === !0)
}
function ue(e) {
    return Nr(e, !1)
}
function wu(e) {
    return Nr(e, !0)
}
function Nr(e, t) {
    return ge(e) ? e : new ko(e,t)
}
class ko {
    constructor(t, n) {
        this.__v_isShallow = n,
        this.dep = void 0,
        this.__v_isRef = !0,
        this._rawValue = n ? t : ee(t),
        this._value = n ? t : Zt(t)
    }
    get value() {
        return Qs(this),
        this._value
    }
    set value(t) {
        const n = this.__v_isShallow || Bt(t) || yt(t);
        t = n ? t : ee(t),
        it(t, this._rawValue) && (this._rawValue,
        this._rawValue = t,
        this._value = n ? t : Zt(t),
        Wt(this, 4))
    }
}
function Dr(e) {
    return ge(e) ? e.value : e
}
function bu(e) {
    return U(e) ? e() : Dr(e)
}
const Wo = {
    get: (e, t, n) => Dr(Reflect.get(e, t, n)),
    set: (e, t, n, s) => {
        const i = e[t];
        return ge(i) && !ge(n) ? (i.value = n,
        !0) : Reflect.set(e, t, n, s)
    }
};
function Vr(e) {
    return Ot(e) ? e : new Proxy(e,Wo)
}
class Ko {
    constructor(t) {
        this.dep = void 0,
        this.__v_isRef = !0;
        const {get: n, set: s} = t( () => Qs(this), () => Wt(this));
        this._get = n,
        this._set = s
    }
    get value() {
        return this._get()
    }
    set value(t) {
        this._set(t)
    }
}
function Su(e) {
    return new Ko(e)
}
function Tu(e) {
    const t = k(e) ? new Array(e.length) : {};
    for (const n in e)
        t[n] = zr(e, n);
    return t
}
class Uo {
    constructor(t, n, s) {
        this._object = t,
        this._key = n,
        this._defaultValue = s,
        this.__v_isRef = !0
    }
    get value() {
        const t = this._object[this._key];
        return t === void 0 ? this._defaultValue : t
    }
    set value(t) {
        this._object[this._key] = t
    }
    get dep() {
        return To(ee(this._object), this._key)
    }
}
class qo {
    constructor(t) {
        this._getter = t,
        this.__v_isRef = !0,
        this.__v_isReadonly = !0
    }
    get value() {
        return this._getter()
    }
}
function xu(e, t, n) {
    return ge(e) ? e : U(e) ? new qo(e) : ne(e) && arguments.length > 1 ? zr(e, t, n) : ue(e)
}
function zr(e, t, n) {
    const s = e[t];
    return ge(s) ? s : new Uo(e,t,n)
}
/**
* @vue/runtime-core v3.4.38
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function st(e, t, n, s) {
    try {
        return s ? e(...s) : e()
    } catch (i) {
        Vt(i, t, n)
    }
}
function Le(e, t, n, s) {
    if (U(e)) {
        const i = st(e, t, n, s);
        return i && Gs(i) && i.catch(r => {
            Vt(r, t, n)
        }
        ),
        i
    }
    if (k(e)) {
        const i = [];
        for (let r = 0; r < e.length; r++)
            i.push(Le(e[r], t, n, s));
        return i
    }
}
function Vt(e, t, n, s=!0) {
    const i = t ? t.vnode : null;
    if (t) {
        let r = t.parent;
        const l = t.proxy
          , a = `https://vuejs.org/error-reference/#runtime-${n}`;
        for (; r; ) {
            const f = r.ec;
            if (f) {
                for (let c = 0; c < f.length; c++)
                    if (f[c](e, l, a) === !1)
                        return
            }
            r = r.parent
        }
        const o = t.appContext.config.errorHandler;
        if (o) {
            lt(),
            st(o, null, 10, [e, l, a]),
            ot();
            return
        }
    }
}
let Qt = !1
  , Es = !1;
const he = [];
let Ve = 0;
const It = [];
let Je = null
  , ct = 0;
const Hr = Promise.resolve();
let ei = null;
function $r(e) {
    const t = ei || Hr;
    return e ? t.then(this ? e.bind(this) : e) : t
}
function Yo(e) {
    let t = Ve + 1
      , n = he.length;
    for (; t < n; ) {
        const s = t + n >>> 1
          , i = he[s]
          , r = en(i);
        r < e || r === e && i.pre ? t = s + 1 : n = s
    }
    return t
}
function Yn(e) {
    (!he.length || !he.includes(e, Qt && e.allowRecurse ? Ve + 1 : Ve)) && (e.id == null ? he.push(e) : he.splice(Yo(e.id), 0, e),
    jr())
}
function jr() {
    !Qt && !Es && (Es = !0,
    ei = Hr.then(Gr))
}
function Xo(e) {
    const t = he.indexOf(e);
    t > Ve && he.splice(t, 1)
}
function _s(e) {
    k(e) ? It.push(...e) : (!Je || !Je.includes(e, e.allowRecurse ? ct + 1 : ct)) && It.push(e),
    jr()
}
function Pi(e, t, n=Qt ? Ve + 1 : 0) {
    for (; n < he.length; n++) {
        const s = he[n];
        if (s && s.pre) {
            if (e && s.id !== e.uid)
                continue;
            he.splice(n, 1),
            n--,
            s()
        }
    }
}
function Ln(e) {
    if (It.length) {
        const t = [...new Set(It)].sort( (n, s) => en(n) - en(s));
        if (It.length = 0,
        Je) {
            Je.push(...t);
            return
        }
        for (Je = t,
        ct = 0; ct < Je.length; ct++) {
            const n = Je[ct];
            n.active !== !1 && n()
        }
        Je = null,
        ct = 0
    }
}
const en = e => e.id == null ? 1 / 0 : e.id
  , Jo = (e, t) => {
    const n = en(e) - en(t);
    if (n === 0) {
        if (e.pre && !t.pre)
            return -1;
        if (t.pre && !e.pre)
            return 1
    }
    return n
}
;
function Gr(e) {
    Es = !1,
    Qt = !0,
    he.sort(Jo);
    try {
        for (Ve = 0; Ve < he.length; Ve++) {
            const t = he[Ve];
            t && t.active !== !1 && st(t, t.i, t.i ? 15 : 14)
        }
    } finally {
        Ve = 0,
        he.length = 0,
        Ln(),
        Qt = !1,
        ei = null,
        (he.length || It.length) && Gr()
    }
}
let ae = null
  , Xn = null;
function Bn(e) {
    const t = ae;
    return ae = e,
    Xn = e && e.type.__scopeId || null,
    t
}
function Eu(e) {
    Xn = e
}
function _u() {
    Xn = null
}
function Zo(e, t=ae, n) {
    if (!t || e._n)
        return e;
    const s = (...i) => {
        s._d && Hi(-1);
        const r = Bn(t);
        let l;
        try {
            l = e(...i)
        } finally {
            Bn(r),
            s._d && Hi(1)
        }
        return l
    }
    ;
    return s._n = !0,
    s._c = !0,
    s._d = !0,
    s
}
function Cu(e, t) {
    if (ae === null)
        return e;
    const n = Qn(ae)
      , s = e.dirs || (e.dirs = []);
    for (let i = 0; i < t.length; i++) {
        let[r,l,a,o=ie] = t[i];
        r && (U(r) && (r = {
            mounted: r,
            updated: r
        }),
        r.deep && et(l),
        s.push({
            dir: r,
            instance: n,
            value: l,
            oldValue: void 0,
            arg: a,
            modifiers: o
        }))
    }
    return e
}
function De(e, t, n, s) {
    const i = e.dirs
      , r = t && t.dirs;
    for (let l = 0; l < i.length; l++) {
        const a = i[l];
        r && (a.oldValue = r[l].value);
        let o = a.dir[s];
        o && (lt(),
        Le(o, n, 8, [e.el, a, e, t]),
        ot())
    }
}
const Ze = Symbol("_leaveCb")
  , yn = Symbol("_enterCb");
function kr() {
    const e = {
        isMounted: !1,
        isLeaving: !1,
        isUnmounting: !1,
        leavingVNodes: new Map
    };
    return ln( () => {
        e.isMounted = !0
    }
    ),
    an( () => {
        e.isUnmounting = !0
    }
    ),
    e
}
const Ie = [Function, Array]
  , Wr = {
    mode: String,
    appear: Boolean,
    persisted: Boolean,
    onBeforeEnter: Ie,
    onEnter: Ie,
    onAfterEnter: Ie,
    onEnterCancelled: Ie,
    onBeforeLeave: Ie,
    onLeave: Ie,
    onAfterLeave: Ie,
    onLeaveCancelled: Ie,
    onBeforeAppear: Ie,
    onAppear: Ie,
    onAfterAppear: Ie,
    onAppearCancelled: Ie
}
  , Kr = e => {
    const t = e.subTree;
    return t.component ? Kr(t.component) : t
}
  , Qo = {
    name: "BaseTransition",
    props: Wr,
    setup(e, {slots: t}) {
        const n = fn()
          , s = kr();
        return () => {
            const i = t.default && ti(t.default(), !0);
            if (!i || !i.length)
                return;
            let r = i[0];
            if (i.length > 1) {
                for (const h of i)
                    if (h.type !== pe) {
                        r = h;
                        break
                    }
            }
            const l = ee(e)
              , {mode: a} = l;
            if (s.isLeaving)
                return is(r);
            const o = Mi(r);
            if (!o)
                return is(r);
            let f = tn(o, l, s, n, h => f = h);
            wt(o, f);
            const c = n.subTree
              , u = c && Mi(c);
            if (u && u.type !== pe && !Fe(o, u) && Kr(n).type !== pe) {
                const h = tn(u, l, s, n);
                if (wt(u, h),
                a === "out-in" && o.type !== pe)
                    return s.isLeaving = !0,
                    h.afterLeave = () => {
                        s.isLeaving = !1,
                        n.update.active !== !1 && (n.effect.dirty = !0,
                        n.update())
                    }
                    ,
                    is(r);
                a === "in-out" && o.type !== pe && (h.delayLeave = (p, w, T) => {
                    const I = Ur(s, u);
                    I[String(u.key)] = u,
                    p[Ze] = () => {
                        w(),
                        p[Ze] = void 0,
                        delete f.delayedLeave
                    }
                    ,
                    f.delayedLeave = T
                }
                )
            }
            return r
        }
    }
}
  , ea = Qo;
function Ur(e, t) {
    const {leavingVNodes: n} = e;
    let s = n.get(t.type);
    return s || (s = Object.create(null),
    n.set(t.type, s)),
    s
}
function tn(e, t, n, s, i) {
    const {appear: r, mode: l, persisted: a=!1, onBeforeEnter: o, onEnter: f, onAfterEnter: c, onEnterCancelled: u, onBeforeLeave: h, onLeave: p, onAfterLeave: w, onLeaveCancelled: T, onBeforeAppear: I, onAppear: C, onAfterAppear: S, onAppearCancelled: d} = t
      , v = String(e.key)
      , b = Ur(n, e)
      , x = (y, O) => {
        y && Le(y, s, 9, O)
    }
      , P = (y, O) => {
        const M = O[1];
        x(y, O),
        k(y) ? y.every(E => E.length <= 1) && M() : y.length <= 1 && M()
    }
      , A = {
        mode: l,
        persisted: a,
        beforeEnter(y) {
            let O = o;
            if (!n.isMounted)
                if (r)
                    O = I || o;
                else
                    return;
            y[Ze] && y[Ze](!0);
            const M = b[v];
            M && Fe(e, M) && M.el[Ze] && M.el[Ze](),
            x(O, [y])
        },
        enter(y) {
            let O = f
              , M = c
              , E = u;
            if (!n.isMounted)
                if (r)
                    O = C || f,
                    M = S || c,
                    E = d || u;
                else
                    return;
            let N = !1;
            const q = y[yn] = J => {
                N || (N = !0,
                J ? x(E, [y]) : x(M, [y]),
                A.delayedLeave && A.delayedLeave(),
                y[yn] = void 0)
            }
            ;
            O ? P(O, [y, q]) : q()
        },
        leave(y, O) {
            const M = String(e.key);
            if (y[yn] && y[yn](!0),
            n.isUnmounting)
                return O();
            x(h, [y]);
            let E = !1;
            const N = y[Ze] = q => {
                E || (E = !0,
                O(),
                q ? x(T, [y]) : x(w, [y]),
                y[Ze] = void 0,
                b[M] === e && delete b[M])
            }
            ;
            b[M] = e,
            p ? P(p, [y, N]) : N()
        },
        clone(y) {
            const O = tn(y, t, n, s, i);
            return i && i(O),
            O
        }
    };
    return A
}
function is(e) {
    if (rn(e))
        return e = Ke(e),
        e.children = null,
        e
}
function Mi(e) {
    if (!rn(e))
        return e;
    const {shapeFlag: t, children: n} = e;
    if (n) {
        if (t & 16)
            return n[0];
        if (t & 32 && U(n.default))
            return n.default()
    }
}
function wt(e, t) {
    e.shapeFlag & 6 && e.component ? wt(e.component.subTree, t) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent),
    e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t
}
function ti(e, t=!1, n) {
    let s = []
      , i = 0;
    for (let r = 0; r < e.length; r++) {
        let l = e[r];
        const a = n == null ? l.key : String(n) + String(l.key != null ? l.key : r);
        l.type === ve ? (l.patchFlag & 128 && i++,
        s = s.concat(ti(l.children, t, a))) : (t || l.type !== pe) && s.push(a != null ? Ke(l, {
            key: a
        }) : l)
    }
    if (i > 1)
        for (let r = 0; r < s.length; r++)
            s[r].patchFlag = -2;
    return s
}
/*! #__NO_SIDE_EFFECTS__ */
function ta(e, t) {
    return U(e) ? fe({
        name: e.name
    }, t, {
        setup: e
    }) : e
}
const ht = e => !!e.type.__asyncLoader;
/*! #__NO_SIDE_EFFECTS__ */
function Pu(e) {
    U(e) && (e = {
        loader: e
    });
    const {loader: t, loadingComponent: n, errorComponent: s, delay: i=200, timeout: r, suspensible: l=!0, onError: a} = e;
    let o = null, f, c = 0;
    const u = () => (c++,
    o = null,
    h())
      , h = () => {
        let p;
        return o || (p = o = t().catch(w => {
            if (w = w instanceof Error ? w : new Error(String(w)),
            a)
                return new Promise( (T, I) => {
                    a(w, () => T(u()), () => I(w), c + 1)
                }
                );
            throw w
        }
        ).then(w => p !== o && o ? o : (w && (w.__esModule || w[Symbol.toStringTag] === "Module") && (w = w.default),
        f = w,
        w)))
    }
    ;
    return ta({
        name: "AsyncComponentWrapper",
        __asyncLoader: h,
        get __asyncResolved() {
            return f
        },
        setup() {
            const p = oe;
            if (f)
                return () => rs(f, p);
            const w = S => {
                o = null,
                Vt(S, p, 13, !s)
            }
            ;
            if (l && p.suspense || cn)
                return h().then(S => () => rs(S, p)).catch(S => (w(S),
                () => s ? le(s, {
                    error: S
                }) : null));
            const T = ue(!1)
              , I = ue()
              , C = ue(!!i);
            return i && setTimeout( () => {
                C.value = !1
            }
            , i),
            r != null && setTimeout( () => {
                if (!T.value && !I.value) {
                    const S = new Error(`Async component timed out after ${r}ms.`);
                    w(S),
                    I.value = S
                }
            }
            , r),
            h().then( () => {
                T.value = !0,
                p.parent && rn(p.parent.vnode) && (p.parent.effect.dirty = !0,
                Yn(p.parent.update))
            }
            ).catch(S => {
                w(S),
                I.value = S
            }
            ),
            () => {
                if (T.value && f)
                    return rs(f, p);
                if (I.value && s)
                    return le(s, {
                        error: I.value
                    });
                if (n && !C.value)
                    return le(n)
            }
        }
    })
}
function rs(e, t) {
    const {ref: n, props: s, children: i, ce: r} = t.vnode
      , l = le(e, s, i);
    return l.ref = n,
    l.ce = r,
    delete t.vnode.ce,
    l
}
const rn = e => e.type.__isKeepAlive
  , na = {
    name: "KeepAlive",
    __isKeepAlive: !0,
    props: {
        include: [String, RegExp, Array],
        exclude: [String, RegExp, Array],
        max: [String, Number]
    },
    setup(e, {slots: t}) {
        const n = fn()
          , s = n.ctx;
        if (!s.renderer)
            return () => {
                const S = t.default && t.default();
                return S && S.length === 1 ? S[0] : S
            }
            ;
        const i = new Map
          , r = new Set;
        let l = null;
        const a = n.suspense
          , {renderer: {p: o, m: f, um: c, o: {createElement: u}}} = s
          , h = u("div");
        s.activate = (S, d, v, b, x) => {
            const P = S.component;
            f(S, d, v, 0, a),
            o(P.vnode, S, d, v, P, a, b, S.slotScopeIds, x),
            de( () => {
                P.isDeactivated = !1,
                P.a && Mt(P.a);
                const A = S.props && S.props.onVnodeMounted;
                A && ye(A, P.parent, S)
            }
            , a)
        }
        ,
        s.deactivate = S => {
            const d = S.component;
            Nn(d.m),
            Nn(d.a),
            f(S, h, null, 1, a),
            de( () => {
                d.da && Mt(d.da);
                const v = S.props && S.props.onVnodeUnmounted;
                v && ye(v, d.parent, S),
                d.isDeactivated = !0
            }
            , a)
        }
        ;
        function p(S) {
            ls(S),
            c(S, n, a, !0)
        }
        function w(S) {
            i.forEach( (d, v) => {
                const b = Ns(d.type);
                b && (!S || !S(b)) && T(v)
            }
            )
        }
        function T(S) {
            const d = i.get(S);
            d && (!l || !Fe(d, l)) ? p(d) : l && ls(l),
            i.delete(S),
            r.delete(S)
        }
        qt( () => [e.include, e.exclude], ([S,d]) => {
            S && w(v => Gt(S, v)),
            d && w(v => !Gt(d, v))
        }
        , {
            flush: "post",
            deep: !0
        });
        let I = null;
        const C = () => {
            I != null && (As(n.subTree.type) ? de( () => {
                i.set(I, wn(n.subTree))
            }
            , n.subTree.suspense) : i.set(I, wn(n.subTree)))
        }
        ;
        return ln(C),
        on(C),
        an( () => {
            i.forEach(S => {
                const {subTree: d, suspense: v} = n
                  , b = wn(d);
                if (S.type === b.type && S.key === b.key) {
                    ls(b);
                    const x = b.component.da;
                    x && de(x, v);
                    return
                }
                p(S)
            }
            )
        }
        ),
        () => {
            if (I = null,
            !t.default)
                return null;
            const S = t.default()
              , d = S[0];
            if (S.length > 1)
                return l = null,
                S;
            if (!Rt(d) || !(d.shapeFlag & 4) && !(d.shapeFlag & 128))
                return l = null,
                d;
            let v = wn(d);
            if (v.type === pe)
                return l = null,
                v;
            const b = v.type
              , x = Ns(ht(v) ? v.type.__asyncResolved || {} : b)
              , {include: P, exclude: A, max: y} = e;
            if (P && (!x || !Gt(P, x)) || A && x && Gt(A, x))
                return l = v,
                d;
            const O = v.key == null ? b : v.key
              , M = i.get(O);
            return v.el && (v = Ke(v),
            d.shapeFlag & 128 && (d.ssContent = v)),
            I = O,
            M ? (v.el = M.el,
            v.component = M.component,
            v.transition && wt(v, v.transition),
            v.shapeFlag |= 512,
            r.delete(O),
            r.add(O)) : (r.add(O),
            y && r.size > parseInt(y, 10) && T(r.values().next().value)),
            v.shapeFlag |= 256,
            l = v,
            As(d.type) ? d : v
        }
    }
}
  , Mu = na;
function Gt(e, t) {
    return k(e) ? e.some(n => Gt(n, t)) : re(e) ? e.split(",").includes(t) : lo(e) ? e.test(t) : !1
}
function sa(e, t) {
    qr(e, "a", t)
}
function ia(e, t) {
    qr(e, "da", t)
}
function qr(e, t, n=oe) {
    const s = e.__wdc || (e.__wdc = () => {
        let i = n;
        for (; i; ) {
            if (i.isDeactivated)
                return;
            i = i.parent
        }
        return e()
    }
    );
    if (Jn(t, s, n),
    n) {
        let i = n.parent;
        for (; i && i.parent; )
            rn(i.parent.vnode) && ra(s, t, n, i),
            i = i.parent
    }
}
function ra(e, t, n, s) {
    const i = Jn(t, e, s, !0);
    Xr( () => {
        js(s[t], i)
    }
    , n)
}
function ls(e) {
    e.shapeFlag &= -257,
    e.shapeFlag &= -513
}
function wn(e) {
    return e.shapeFlag & 128 ? e.ssContent : e
}
function Jn(e, t, n=oe, s=!1) {
    if (n) {
        const i = n[e] || (n[e] = [])
          , r = t.__weh || (t.__weh = (...l) => {
            lt();
            const a = bt(n)
              , o = Le(t, n, e, l);
            return a(),
            ot(),
            o
        }
        );
        return s ? i.unshift(r) : i.push(r),
        r
    }
}
const Ue = e => (t, n=oe) => {
    (!cn || e === "sp") && Jn(e, (...s) => t(...s), n)
}
  , la = Ue("bm")
  , ln = Ue("m")
  , Yr = Ue("bu")
  , on = Ue("u")
  , an = Ue("bum")
  , Xr = Ue("um")
  , oa = Ue("sp")
  , aa = Ue("rtg")
  , fa = Ue("rtc");
function ca(e, t=oe) {
    Jn("ec", e, t)
}
const ni = "components"
  , ua = "directives";
function Ou(e, t) {
    return si(ni, e, !0, t) || e
}
const Jr = Symbol.for("v-ndc");
function Iu(e) {
    return re(e) ? si(ni, e, !1) || e : e || Jr
}
function Au(e) {
    return si(ua, e)
}
function si(e, t, n=!0, s=!1) {
    const i = ae || oe;
    if (i) {
        const r = i.type;
        if (e === ni) {
            const a = Ns(r, !1);
            if (a && (a === t || a === Re(t) || a === kn(Re(t))))
                return r
        }
        const l = Oi(i[e] || r[e], t) || Oi(i.appContext[e], t);
        return !l && s ? r : l
    }
}
function Oi(e, t) {
    return e && (e[t] || e[Re(t)] || e[kn(Re(t))])
}
function Lu(e, t, n, s) {
    let i;
    const r = n;
    if (k(e) || re(e)) {
        i = new Array(e.length);
        for (let l = 0, a = e.length; l < a; l++)
            i[l] = t(e[l], l, void 0, r)
    } else if (typeof e == "number") {
        i = new Array(e);
        for (let l = 0; l < e; l++)
            i[l] = t(l + 1, l, void 0, r)
    } else if (ne(e))
        if (e[Symbol.iterator])
            i = Array.from(e, (l, a) => t(l, a, void 0, r));
        else {
            const l = Object.keys(e);
            i = new Array(l.length);
            for (let a = 0, o = l.length; a < o; a++) {
                const f = l[a];
                i[a] = t(e[f], f, a, r)
            }
        }
    else
        i = [];
    return i
}
function Bu(e, t) {
    for (let n = 0; n < t.length; n++) {
        const s = t[n];
        if (k(s))
            for (let i = 0; i < s.length; i++)
                e[s[i].name] = s[i].fn;
        else
            s && (e[s.name] = s.key ? (...i) => {
                const r = s.fn(...i);
                return r && (r.key = s.key),
                r
            }
            : s.fn)
    }
    return e
}
function Fu(e, t, n={}, s, i) {
    if (ae.isCE || ae.parent && ht(ae.parent) && ae.parent.isCE)
        return t !== "default" && (n.name = t),
        le("slot", n, s && s());
    let r = e[t];
    r && r._c && (r._d = !1),
    ci();
    const l = r && Zr(r(n))
      , a = xl(ve, {
        key: (n.key || l && l.key || `_${t}`) + (!l && s ? "_fb" : "")
    }, l || (s ? s() : []), l && e._ === 1 ? 64 : -2);
    return !i && a.scopeId && (a.slotScopeIds = [a.scopeId + "-s"]),
    r && r._c && (r._d = !0),
    a
}
function Zr(e) {
    return e.some(t => Rt(t) ? !(t.type === pe || t.type === ve && !Zr(t.children)) : !0) ? e : null
}
function Ru(e, t) {
    const n = {};
    for (const s in e)
        n[Cn(s)] = e[s];
    return n
}
const Cs = e => e ? Pl(e) ? Qn(e) : Cs(e.parent) : null
  , Kt = fe(Object.create(null), {
    $: e => e,
    $el: e => e.vnode.el,
    $data: e => e.data,
    $props: e => e.props,
    $attrs: e => e.attrs,
    $slots: e => e.slots,
    $refs: e => e.refs,
    $parent: e => Cs(e.parent),
    $root: e => Cs(e.root),
    $emit: e => e.emit,
    $options: e => ii(e),
    $forceUpdate: e => e.f || (e.f = () => {
        e.effect.dirty = !0,
        Yn(e.update)
    }
    ),
    $nextTick: e => e.n || (e.n = $r.bind(e.proxy)),
    $watch: e => Da.bind(e)
})
  , os = (e, t) => e !== ie && !e.__isScriptSetup && Q(e, t)
  , da = {
    get({_: e}, t) {
        if (t === "__v_skip")
            return !0;
        const {ctx: n, setupState: s, data: i, props: r, accessCache: l, type: a, appContext: o} = e;
        let f;
        if (t[0] !== "$") {
            const p = l[t];
            if (p !== void 0)
                switch (p) {
                case 1:
                    return s[t];
                case 2:
                    return i[t];
                case 4:
                    return n[t];
                case 3:
                    return r[t]
                }
            else {
                if (os(s, t))
                    return l[t] = 1,
                    s[t];
                if (i !== ie && Q(i, t))
                    return l[t] = 2,
                    i[t];
                if ((f = e.propsOptions[0]) && Q(f, t))
                    return l[t] = 3,
                    r[t];
                if (n !== ie && Q(n, t))
                    return l[t] = 4,
                    n[t];
                Ps && (l[t] = 0)
            }
        }
        const c = Kt[t];
        let u, h;
        if (c)
            return t === "$attrs" && be(e.attrs, "get", ""),
            c(e);
        if ((u = a.__cssModules) && (u = u[t]))
            return u;
        if (n !== ie && Q(n, t))
            return l[t] = 4,
            n[t];
        if (h = o.config.globalProperties,
        Q(h, t))
            return h[t]
    },
    set({_: e}, t, n) {
        const {data: s, setupState: i, ctx: r} = e;
        return os(i, t) ? (i[t] = n,
        !0) : s !== ie && Q(s, t) ? (s[t] = n,
        !0) : Q(e.props, t) || t[0] === "$" && t.slice(1)in e ? !1 : (r[t] = n,
        !0)
    },
    has({_: {data: e, setupState: t, accessCache: n, ctx: s, appContext: i, propsOptions: r}}, l) {
        let a;
        return !!n[l] || e !== ie && Q(e, l) || os(t, l) || (a = r[0]) && Q(a, l) || Q(s, l) || Q(Kt, l) || Q(i.config.globalProperties, l)
    },
    defineProperty(e, t, n) {
        return n.get != null ? e._.accessCache[t] = 0 : Q(n, "value") && this.set(e, t, n.value, null),
        Reflect.defineProperty(e, t, n)
    }
};
function Nu() {
    return Qr().slots
}
function Du() {
    return Qr().attrs
}
function Qr() {
    const e = fn();
    return e.setupContext || (e.setupContext = Ol(e))
}
function Ii(e) {
    return k(e) ? e.reduce( (t, n) => (t[n] = null,
    t), {}) : e
}
function Vu(e) {
    const t = fn();
    let n = e();
    return Fs(),
    Gs(n) && (n = n.catch(s => {
        throw bt(t),
        s
    }
    )),
    [n, () => bt(t)]
}
let Ps = !0;
function pa(e) {
    const t = ii(e)
      , n = e.proxy
      , s = e.ctx;
    Ps = !1,
    t.beforeCreate && Ai(t.beforeCreate, e, "bc");
    const {data: i, computed: r, methods: l, watch: a, provide: o, inject: f, created: c, beforeMount: u, mounted: h, beforeUpdate: p, updated: w, activated: T, deactivated: I, beforeDestroy: C, beforeUnmount: S, destroyed: d, unmounted: v, render: b, renderTracked: x, renderTriggered: P, errorCaptured: A, serverPrefetch: y, expose: O, inheritAttrs: M, components: E, directives: N, filters: q} = t;
    if (f && ha(f, s, null),
    l)
        for (const H in l) {
            const G = l[H];
            U(G) && (s[H] = G.bind(n))
        }
    if (i) {
        const H = i.call(n, n);
        ne(H) && (e.data = Xs(H))
    }
    if (Ps = !0,
    r)
        for (const H in r) {
            const G = r[H]
              , Z = U(G) ? G.bind(n, n) : U(G.get) ? G.get.bind(n, n) : Pe
              , Se = !U(G) && U(G.set) ? G.set.bind(n) : Pe
              , Te = Il({
                get: Z,
                set: Se
            });
            Object.defineProperty(s, H, {
                enumerable: !0,
                configurable: !0,
                get: () => Te.value,
                set: Oe => Te.value = Oe
            })
        }
    if (a)
        for (const H in a)
            el(a[H], s, n, H);
    if (o) {
        const H = U(o) ? o.call(n) : o;
        Reflect.ownKeys(H).forEach(G => {
            ri(G, H[G])
        }
        )
    }
    c && Ai(c, e, "c");
    function j(H, G) {
        k(G) ? G.forEach(Z => H(Z.bind(n))) : G && H(G.bind(n))
    }
    if (j(la, u),
    j(ln, h),
    j(Yr, p),
    j(on, w),
    j(sa, T),
    j(ia, I),
    j(ca, A),
    j(fa, x),
    j(aa, P),
    j(an, S),
    j(Xr, v),
    j(oa, y),
    k(O))
        if (O.length) {
            const H = e.exposed || (e.exposed = {});
            O.forEach(G => {
                Object.defineProperty(H, G, {
                    get: () => n[G],
                    set: Z => n[G] = Z
                })
            }
            )
        } else
            e.exposed || (e.exposed = {});
    b && e.render === Pe && (e.render = b),
    M != null && (e.inheritAttrs = M),
    E && (e.components = E),
    N && (e.directives = N)
}
function ha(e, t, n=Pe) {
    k(e) && (e = Ms(e));
    for (const s in e) {
        const i = e[s];
        let r;
        ne(i) ? "default"in i ? r = Pn(i.from || s, i.default, !0) : r = Pn(i.from || s) : r = Pn(i),
        ge(r) ? Object.defineProperty(t, s, {
            enumerable: !0,
            configurable: !0,
            get: () => r.value,
            set: l => r.value = l
        }) : t[s] = r
    }
}
function Ai(e, t, n) {
    Le(k(e) ? e.map(s => s.bind(t.proxy)) : e.bind(t.proxy), t, n)
}
function el(e, t, n, s) {
    const i = s.includes(".") ? vl(n, s) : () => n[s];
    if (re(e)) {
        const r = t[e];
        U(r) && qt(i, r)
    } else if (U(e))
        qt(i, e.bind(n));
    else if (ne(e))
        if (k(e))
            e.forEach(r => el(r, t, n, s));
        else {
            const r = U(e.handler) ? e.handler.bind(n) : t[e.handler];
            U(r) && qt(i, r, e)
        }
}
function ii(e) {
    const t = e.type
      , {mixins: n, extends: s} = t
      , {mixins: i, optionsCache: r, config: {optionMergeStrategies: l}} = e.appContext
      , a = r.get(t);
    let o;
    return a ? o = a : !i.length && !n && !s ? o = t : (o = {},
    i.length && i.forEach(f => Fn(o, f, l, !0)),
    Fn(o, t, l)),
    ne(t) && r.set(t, o),
    o
}
function Fn(e, t, n, s=!1) {
    const {mixins: i, extends: r} = t;
    r && Fn(e, r, n, !0),
    i && i.forEach(l => Fn(e, l, n, !0));
    for (const l in t)
        if (!(s && l === "expose")) {
            const a = ga[l] || n && n[l];
            e[l] = a ? a(e[l], t[l]) : t[l]
        }
    return e
}
const ga = {
    data: Li,
    props: Bi,
    emits: Bi,
    methods: kt,
    computed: kt,
    beforeCreate: me,
    created: me,
    beforeMount: me,
    mounted: me,
    beforeUpdate: me,
    updated: me,
    beforeDestroy: me,
    beforeUnmount: me,
    destroyed: me,
    unmounted: me,
    activated: me,
    deactivated: me,
    errorCaptured: me,
    serverPrefetch: me,
    components: kt,
    directives: kt,
    watch: va,
    provide: Li,
    inject: ma
};
function Li(e, t) {
    return t ? e ? function() {
        return fe(U(e) ? e.call(this, this) : e, U(t) ? t.call(this, this) : t)
    }
    : t : e
}
function ma(e, t) {
    return kt(Ms(e), Ms(t))
}
function Ms(e) {
    if (k(e)) {
        const t = {};
        for (let n = 0; n < e.length; n++)
            t[e[n]] = e[n];
        return t
    }
    return e
}
function me(e, t) {
    return e ? [...new Set([].concat(e, t))] : t
}
function kt(e, t) {
    return e ? fe(Object.create(null), e, t) : t
}
function Bi(e, t) {
    return e ? k(e) && k(t) ? [...new Set([...e, ...t])] : fe(Object.create(null), Ii(e), Ii(t ?? {})) : t
}
function va(e, t) {
    if (!e)
        return t;
    if (!t)
        return e;
    const n = fe(Object.create(null), e);
    for (const s in t)
        n[s] = me(e[s], t[s]);
    return n
}
function tl() {
    return {
        app: null,
        config: {
            isNativeTag: io,
            performance: !1,
            globalProperties: {},
            optionMergeStrategies: {},
            errorHandler: void 0,
            warnHandler: void 0,
            compilerOptions: {}
        },
        mixins: [],
        components: {},
        directives: {},
        provides: Object.create(null),
        optionsCache: new WeakMap,
        propsCache: new WeakMap,
        emitsCache: new WeakMap
    }
}
let ya = 0;
function wa(e, t) {
    return function(s, i=null) {
        U(s) || (s = fe({}, s)),
        i != null && !ne(i) && (i = null);
        const r = tl()
          , l = new WeakSet;
        let a = !1;
        const o = r.app = {
            _uid: ya++,
            _component: s,
            _props: i,
            _container: null,
            _context: r,
            _instance: null,
            version: of,
            get config() {
                return r.config
            },
            set config(f) {},
            use(f, ...c) {
                return l.has(f) || (f && U(f.install) ? (l.add(f),
                f.install(o, ...c)) : U(f) && (l.add(f),
                f(o, ...c))),
                o
            },
            mixin(f) {
                return r.mixins.includes(f) || r.mixins.push(f),
                o
            },
            component(f, c) {
                return c ? (r.components[f] = c,
                o) : r.components[f]
            },
            directive(f, c) {
                return c ? (r.directives[f] = c,
                o) : r.directives[f]
            },
            mount(f, c, u) {
                if (!a) {
                    const h = le(s, i);
                    return h.appContext = r,
                    u === !0 ? u = "svg" : u === !1 && (u = void 0),
                    c && t ? t(h, f) : e(h, f, u),
                    a = !0,
                    o._container = f,
                    f.__vue_app__ = o,
                    Qn(h.component)
                }
            },
            unmount() {
                a && (e(null, o._container),
                delete o._container.__vue_app__)
            },
            provide(f, c) {
                return r.provides[f] = c,
                o
            },
            runWithContext(f) {
                const c = gt;
                gt = o;
                try {
                    return f()
                } finally {
                    gt = c
                }
            }
        };
        return o
    }
}
let gt = null;
function ri(e, t) {
    if (oe) {
        let n = oe.provides;
        const s = oe.parent && oe.parent.provides;
        s === n && (n = oe.provides = Object.create(s)),
        n[e] = t
    }
}
function Pn(e, t, n=!1) {
    const s = oe || ae;
    if (s || gt) {
        const i = gt ? gt._context.provides : s ? s.parent == null ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
        if (i && e in i)
            return i[e];
        if (arguments.length > 1)
            return n && U(t) ? t.call(s && s.proxy) : t
    }
}
function zu() {
    return !!(oe || ae || gt)
}
const nl = {}
  , sl = () => Object.create(nl)
  , il = e => Object.getPrototypeOf(e) === nl;
function ba(e, t, n, s=!1) {
    const i = {}
      , r = sl();
    e.propsDefaults = Object.create(null),
    rl(e, t, i, r);
    for (const l in e.propsOptions[0])
        l in i || (i[l] = void 0);
    n ? e.props = s ? i : $o(i) : e.type.props ? e.props = i : e.props = r,
    e.attrs = r
}
function Sa(e, t, n, s) {
    const {props: i, attrs: r, vnode: {patchFlag: l}} = e
      , a = ee(i)
      , [o] = e.propsOptions;
    let f = !1;
    if ((s || l > 0) && !(l & 16)) {
        if (l & 8) {
            const c = e.vnode.dynamicProps;
            for (let u = 0; u < c.length; u++) {
                let h = c[u];
                if (Zn(e.emitsOptions, h))
                    continue;
                const p = t[h];
                if (o)
                    if (Q(r, h))
                        p !== r[h] && (r[h] = p,
                        f = !0);
                    else {
                        const w = Re(h);
                        i[w] = Os(o, a, w, p, e, !1)
                    }
                else
                    p !== r[h] && (r[h] = p,
                    f = !0)
            }
        }
    } else {
        rl(e, t, i, r) && (f = !0);
        let c;
        for (const u in a)
            (!t || !Q(t, u) && ((c = rt(u)) === u || !Q(t, c))) && (o ? n && (n[u] !== void 0 || n[c] !== void 0) && (i[u] = Os(o, a, u, void 0, e, !0)) : delete i[u]);
        if (r !== a)
            for (const u in r)
                (!t || !Q(t, u)) && (delete r[u],
                f = !0)
    }
    f && We(e.attrs, "set", "")
}
function rl(e, t, n, s) {
    const [i,r] = e.propsOptions;
    let l = !1, a;
    if (t)
        for (let o in t) {
            if (Pt(o))
                continue;
            const f = t[o];
            let c;
            i && Q(i, c = Re(o)) ? !r || !r.includes(c) ? n[c] = f : (a || (a = {}))[c] = f : Zn(e.emitsOptions, o) || (!(o in s) || f !== s[o]) && (s[o] = f,
            l = !0)
        }
    if (r) {
        const o = ee(n)
          , f = a || ie;
        for (let c = 0; c < r.length; c++) {
            const u = r[c];
            n[u] = Os(i, o, u, f[u], e, !Q(f, u))
        }
    }
    return l
}
function Os(e, t, n, s, i, r) {
    const l = e[n];
    if (l != null) {
        const a = Q(l, "default");
        if (a && s === void 0) {
            const o = l.default;
            if (l.type !== Function && !l.skipFactory && U(o)) {
                const {propsDefaults: f} = i;
                if (n in f)
                    s = f[n];
                else {
                    const c = bt(i);
                    s = f[n] = o.call(null, t),
                    c()
                }
            } else
                s = o
        }
        l[0] && (r && !a ? s = !1 : l[1] && (s === "" || s === rt(n)) && (s = !0))
    }
    return s
}
const Ta = new WeakMap;
function ll(e, t, n=!1) {
    const s = n ? Ta : t.propsCache
      , i = s.get(e);
    if (i)
        return i;
    const r = e.props
      , l = {}
      , a = [];
    let o = !1;
    if (!U(e)) {
        const c = u => {
            o = !0;
            const [h,p] = ll(u, t, !0);
            fe(l, h),
            p && a.push(...p)
        }
        ;
        !n && t.mixins.length && t.mixins.forEach(c),
        e.extends && c(e.extends),
        e.mixins && e.mixins.forEach(c)
    }
    if (!r && !o)
        return ne(e) && s.set(e, _t),
        _t;
    if (k(r))
        for (let c = 0; c < r.length; c++) {
            const u = Re(r[c]);
            Fi(u) && (l[u] = ie)
        }
    else if (r)
        for (const c in r) {
            const u = Re(c);
            if (Fi(u)) {
                const h = r[c]
                  , p = l[u] = k(h) || U(h) ? {
                    type: h
                } : fe({}, h)
                  , w = p.type;
                let T = !1
                  , I = !0;
                if (k(w))
                    for (let C = 0; C < w.length; ++C) {
                        const S = w[C]
                          , d = U(S) && S.name;
                        if (d === "Boolean") {
                            T = !0;
                            break
                        } else
                            d === "String" && (I = !1)
                    }
                else
                    T = U(w) && w.name === "Boolean";
                p[0] = T,
                p[1] = I,
                (T || Q(p, "default")) && a.push(u)
            }
        }
    const f = [l, a];
    return ne(e) && s.set(e, f),
    f
}
function Fi(e) {
    return e[0] !== "$" && !Pt(e)
}
const ol = e => e[0] === "_" || e === "$stable"
  , li = e => k(e) ? e.map(Ce) : [Ce(e)]
  , xa = (e, t, n) => {
    if (t._n)
        return t;
    const s = Zo( (...i) => li(t(...i)), n);
    return s._c = !1,
    s
}
  , al = (e, t, n) => {
    const s = e._ctx;
    for (const i in e) {
        if (ol(i))
            continue;
        const r = e[i];
        if (U(r))
            t[i] = xa(i, r, s);
        else if (r != null) {
            const l = li(r);
            t[i] = () => l
        }
    }
}
  , fl = (e, t) => {
    const n = li(t);
    e.slots.default = () => n
}
  , cl = (e, t, n) => {
    for (const s in t)
        (n || s !== "_") && (e[s] = t[s])
}
  , Ea = (e, t, n) => {
    const s = e.slots = sl();
    if (e.vnode.shapeFlag & 32) {
        const i = t._;
        i ? (cl(s, t, n),
        n && hr(s, "_", i, !0)) : al(t, s)
    } else
        t && fl(e, t)
}
  , _a = (e, t, n) => {
    const {vnode: s, slots: i} = e;
    let r = !0
      , l = ie;
    if (s.shapeFlag & 32) {
        const a = t._;
        a ? n && a === 1 ? r = !1 : cl(i, t, n) : (r = !t.$stable,
        al(t, i)),
        l = t
    } else
        t && (fl(e, t),
        l = {
            default: 1
        });
    if (r)
        for (const a in i)
            !ol(a) && l[a] == null && delete i[a]
}
;
function Rn(e, t, n, s, i=!1) {
    if (k(e)) {
        e.forEach( (h, p) => Rn(h, t && (k(t) ? t[p] : t), n, s, i));
        return
    }
    if (ht(s) && !i)
        return;
    const r = s.shapeFlag & 4 ? Qn(s.component) : s.el
      , l = i ? null : r
      , {i: a, r: o} = e
      , f = t && t.r
      , c = a.refs === ie ? a.refs = {} : a.refs
      , u = a.setupState;
    if (f != null && f !== o && (re(f) ? (c[f] = null,
    Q(u, f) && (u[f] = null)) : ge(f) && (f.value = null)),
    U(o))
        st(o, a, 12, [l, c]);
    else {
        const h = re(o)
          , p = ge(o);
        if (h || p) {
            const w = () => {
                if (e.f) {
                    const T = h ? Q(u, o) ? u[o] : c[o] : o.value;
                    i ? k(T) && js(T, r) : k(T) ? T.includes(r) || T.push(r) : h ? (c[o] = [r],
                    Q(u, o) && (u[o] = c[o])) : (o.value = [r],
                    e.k && (c[e.k] = o.value))
                } else
                    h ? (c[o] = l,
                    Q(u, o) && (u[o] = l)) : p && (o.value = l,
                    e.k && (c[e.k] = l))
            }
            ;
            l ? (w.id = -1,
            de(w, n)) : w()
        }
    }
}
const ul = Symbol("_vte")
  , Ca = e => e.__isTeleport
  , Ut = e => e && (e.disabled || e.disabled === "")
  , Ri = e => typeof SVGElement < "u" && e instanceof SVGElement
  , Ni = e => typeof MathMLElement == "function" && e instanceof MathMLElement
  , Is = (e, t) => {
    const n = e && e.to;
    return re(n) ? t ? t(n) : null : n
}
  , Pa = {
    name: "Teleport",
    __isTeleport: !0,
    process(e, t, n, s, i, r, l, a, o, f) {
        const {mc: c, pc: u, pbc: h, o: {insert: p, querySelector: w, createText: T, createComment: I}} = f
          , C = Ut(t.props);
        let {shapeFlag: S, children: d, dynamicChildren: v} = t;
        if (e == null) {
            const b = t.el = T("")
              , x = t.anchor = T("");
            p(b, n, s),
            p(x, n, s);
            const P = t.target = Is(t.props, w)
              , A = pl(P, t, T, p);
            P && (l === "svg" || Ri(P) ? l = "svg" : (l === "mathml" || Ni(P)) && (l = "mathml"));
            const y = (O, M) => {
                S & 16 && c(d, O, M, i, r, l, a, o)
            }
            ;
            C ? y(n, x) : P && y(P, A)
        } else {
            t.el = e.el,
            t.targetStart = e.targetStart;
            const b = t.anchor = e.anchor
              , x = t.target = e.target
              , P = t.targetAnchor = e.targetAnchor
              , A = Ut(e.props)
              , y = A ? n : x
              , O = A ? b : P;
            if (l === "svg" || Ri(x) ? l = "svg" : (l === "mathml" || Ni(x)) && (l = "mathml"),
            v ? (h(e.dynamicChildren, v, y, i, r, l, a),
            oi(e, t, !0)) : o || u(e, t, y, O, i, r, l, a, !1),
            C)
                A ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : bn(t, n, b, f, 1);
            else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
                const M = t.target = Is(t.props, w);
                M && bn(t, M, null, f, 0)
            } else
                A && bn(t, x, P, f, 1)
        }
        dl(t)
    },
    remove(e, t, n, {um: s, o: {remove: i}}, r) {
        const {shapeFlag: l, children: a, anchor: o, targetStart: f, targetAnchor: c, target: u, props: h} = e;
        if (u && (i(f),
        i(c)),
        r && i(o),
        l & 16) {
            const p = r || !Ut(h);
            for (let w = 0; w < a.length; w++) {
                const T = a[w];
                s(T, t, n, p, !!T.dynamicChildren)
            }
        }
    },
    move: bn,
    hydrate: Ma
};
function bn(e, t, n, {o: {insert: s}, m: i}, r=2) {
    r === 0 && s(e.targetAnchor, t, n);
    const {el: l, anchor: a, shapeFlag: o, children: f, props: c} = e
      , u = r === 2;
    if (u && s(l, t, n),
    (!u || Ut(c)) && o & 16)
        for (let h = 0; h < f.length; h++)
            i(f[h], t, n, 2);
    u && s(a, t, n)
}
function Ma(e, t, n, s, i, r, {o: {nextSibling: l, parentNode: a, querySelector: o, insert: f, createText: c}}, u) {
    const h = t.target = Is(t.props, o);
    if (h) {
        const p = h._lpa || h.firstChild;
        if (t.shapeFlag & 16)
            if (Ut(t.props))
                t.anchor = u(l(e), t, a(e), n, s, i, r),
                t.targetStart = p,
                t.targetAnchor = p && l(p);
            else {
                t.anchor = l(e);
                let w = p;
                for (; w; ) {
                    if (w && w.nodeType === 8) {
                        if (w.data === "teleport start anchor")
                            t.targetStart = w;
                        else if (w.data === "teleport anchor") {
                            t.targetAnchor = w,
                            h._lpa = t.targetAnchor && l(t.targetAnchor);
                            break
                        }
                    }
                    w = l(w)
                }
                t.targetAnchor || pl(h, t, c, f),
                u(p && l(p), t, h, n, s, i, r)
            }
        dl(t)
    }
    return t.anchor && l(t.anchor)
}
const Hu = Pa;
function dl(e) {
    const t = e.ctx;
    if (t && t.ut) {
        let n = e.children[0].el;
        for (; n && n !== e.targetAnchor; )
            n.nodeType === 1 && n.setAttribute("data-v-owner", t.uid),
            n = n.nextSibling;
        t.ut()
    }
}
function pl(e, t, n, s) {
    const i = t.targetStart = n("")
      , r = t.targetAnchor = n("");
    return i[ul] = r,
    e && (s(i, e),
    s(r, e)),
    r
}
let Di = !1;
const Et = () => {
    Di || (Di = !0)
}
  , Oa = e => e.namespaceURI.includes("svg") && e.tagName !== "foreignObject"
  , Ia = e => e.namespaceURI.includes("MathML")
  , Sn = e => {
    if (Oa(e))
        return "svg";
    if (Ia(e))
        return "mathml"
}
  , Tn = e => e.nodeType === 8;
function Aa(e) {
    const {mt: t, p: n, o: {patchProp: s, createText: i, nextSibling: r, parentNode: l, remove: a, insert: o, createComment: f}} = e
      , c = (d, v) => {
        if (!v.hasChildNodes()) {
            n(null, d, v),
            Ln(),
            v._vnode = d;
            return
        }
        u(v.firstChild, d, null, null, null),
        Ln(),
        v._vnode = d
    }
      , u = (d, v, b, x, P, A=!1) => {
        A = A || !!v.dynamicChildren;
        const y = Tn(d) && d.data === "["
          , O = () => T(d, v, b, x, P, y)
          , {type: M, ref: E, shapeFlag: N, patchFlag: q} = v;
        let J = d.nodeType;
        v.el = d,
        q === -2 && (A = !1,
        v.dynamicChildren = null);
        let j = null;
        switch (M) {
        case mt:
            J !== 3 ? v.children === "" ? (o(v.el = i(""), l(d), d),
            j = d) : j = O() : (d.data !== v.children && (Et(),
            d.data = v.children),
            j = r(d));
            break;
        case pe:
            S(d) ? (j = r(d),
            C(v.el = d.content.firstChild, d, b)) : J !== 8 || y ? j = O() : j = r(d);
            break;
        case Yt:
            if (y && (d = r(d),
            J = d.nodeType),
            J === 1 || J === 3) {
                j = d;
                const H = !v.children.length;
                for (let G = 0; G < v.staticCount; G++)
                    H && (v.children += j.nodeType === 1 ? j.outerHTML : j.data),
                    G === v.staticCount - 1 && (v.anchor = j),
                    j = r(j);
                return y ? r(j) : j
            } else
                O();
            break;
        case ve:
            y ? j = w(d, v, b, x, P, A) : j = O();
            break;
        default:
            if (N & 1)
                (J !== 1 || v.type.toLowerCase() !== d.tagName.toLowerCase()) && !S(d) ? j = O() : j = h(d, v, b, x, P, A);
            else if (N & 6) {
                v.slotScopeIds = P;
                const H = l(d);
                if (y ? j = I(d) : Tn(d) && d.data === "teleport start" ? j = I(d, d.data, "teleport end") : j = r(d),
                t(v, H, null, b, x, Sn(H), A),
                ht(v)) {
                    let G;
                    y ? (G = le(ve),
                    G.anchor = j ? j.previousSibling : H.lastChild) : G = d.nodeType === 3 ? Cl("") : le("div"),
                    G.el = d,
                    v.component.subTree = G
                }
            } else
                N & 64 ? J !== 8 ? j = O() : j = v.type.hydrate(d, v, b, x, P, A, e, p) : N & 128 && (j = v.type.hydrate(d, v, b, x, Sn(l(d)), P, A, e, u))
        }
        return E != null && Rn(E, null, x, v),
        j
    }
      , h = (d, v, b, x, P, A) => {
        A = A || !!v.dynamicChildren;
        const {type: y, props: O, patchFlag: M, shapeFlag: E, dirs: N, transition: q} = v
          , J = y === "input" || y === "option";
        if (J || M !== -1) {
            N && De(v, null, b, "created");
            let j = !1;
            if (S(d)) {
                j = gl(x, q) && b && b.vnode.props && b.vnode.props.appear;
                const G = d.content.firstChild;
                j && q.beforeEnter(G),
                C(G, d, b),
                v.el = d = G
            }
            if (E & 16 && !(O && (O.innerHTML || O.textContent))) {
                let G = p(d.firstChild, v, d, b, x, P, A);
                for (; G; ) {
                    Et();
                    const Z = G;
                    G = G.nextSibling,
                    a(Z)
                }
            } else
                E & 8 && d.textContent !== v.children && (Et(),
                d.textContent = v.children);
            if (O) {
                if (J || !A || M & 48) {
                    const G = d.tagName.includes("-");
                    for (const Z in O)
                        (J && (Z.endsWith("value") || Z === "indeterminate") || sn(Z) && !Pt(Z) || Z[0] === "." || G) && s(d, Z, null, O[Z], void 0, b)
                } else if (O.onClick)
                    s(d, "onClick", null, O.onClick, void 0, b);
                else if (M & 4 && Ot(O.style))
                    for (const G in O.style)
                        O.style[G]
            }
            let H;
            (H = O && O.onVnodeBeforeMount) && ye(H, b, v),
            N && De(v, null, b, "beforeMount"),
            ((H = O && O.onVnodeMounted) || N || j) && bl( () => {
                H && ye(H, b, v),
                j && q.enter(d),
                N && De(v, null, b, "mounted")
            }
            , x)
        }
        return d.nextSibling
    }
      , p = (d, v, b, x, P, A, y) => {
        y = y || !!v.dynamicChildren;
        const O = v.children
          , M = O.length;
        for (let E = 0; E < M; E++) {
            const N = y ? O[E] : O[E] = Ce(O[E])
              , q = N.type === mt;
            if (d) {
                if (q && !y) {
                    let J = O[E + 1];
                    J && (J = Ce(J)).type === mt && (o(i(d.data.slice(N.children.length)), b, r(d)),
                    d.data = N.children)
                }
                d = u(d, N, x, P, A, y)
            } else
                q && !N.children ? o(N.el = i(""), b) : (Et(),
                n(null, N, b, null, x, P, Sn(b), A))
        }
        return d
    }
      , w = (d, v, b, x, P, A) => {
        const {slotScopeIds: y} = v;
        y && (P = P ? P.concat(y) : y);
        const O = l(d)
          , M = p(r(d), v, O, b, x, P, A);
        return M && Tn(M) && M.data === "]" ? r(v.anchor = M) : (Et(),
        o(v.anchor = f("]"), O, M),
        M)
    }
      , T = (d, v, b, x, P, A) => {
        if (Et(),
        v.el = null,
        A) {
            const M = I(d);
            for (; ; ) {
                const E = r(d);
                if (E && E !== M)
                    a(E);
                else
                    break
            }
        }
        const y = r(d)
          , O = l(d);
        return a(d),
        n(null, v, O, y, b, x, Sn(O), P),
        y
    }
      , I = (d, v="[", b="]") => {
        let x = 0;
        for (; d; )
            if (d = r(d),
            d && Tn(d) && (d.data === v && x++,
            d.data === b)) {
                if (x === 0)
                    return r(d);
                x--
            }
        return d
    }
      , C = (d, v, b) => {
        const x = v.parentNode;
        x && x.replaceChild(d, v);
        let P = b;
        for (; P; )
            P.vnode.el === v && (P.vnode.el = P.subTree.el = d),
            P = P.parent
    }
      , S = d => d.nodeType === 1 && d.tagName.toLowerCase() === "template";
    return [c, u]
}
const de = bl;
function La(e) {
    return hl(e)
}
function Ba(e) {
    return hl(e, Aa)
}
function hl(e, t) {
    const n = mr();
    n.__VUE__ = !0;
    const {insert: s, remove: i, patchProp: r, createElement: l, createText: a, createComment: o, setText: f, setElementText: c, parentNode: u, nextSibling: h, setScopeId: p=Pe, insertStaticContent: w} = e
      , T = (g, m, _, F=null, L=null, R=null, z=void 0, D=null, V=!!m.dynamicChildren) => {
        if (g === m)
            return;
        g && !Fe(g, m) && (F = dn(g),
        Oe(g, L, R, !0),
        g = null),
        m.patchFlag === -2 && (V = !1,
        m.dynamicChildren = null);
        const {type: B, ref: $, shapeFlag: K} = m;
        switch (B) {
        case mt:
            I(g, m, _, F);
            break;
        case pe:
            C(g, m, _, F);
            break;
        case Yt:
            g == null && S(m, _, F, z);
            break;
        case ve:
            E(g, m, _, F, L, R, z, D, V);
            break;
        default:
            K & 1 ? b(g, m, _, F, L, R, z, D, V) : K & 6 ? N(g, m, _, F, L, R, z, D, V) : (K & 64 || K & 128) && B.process(g, m, _, F, L, R, z, D, V, Tt)
        }
        $ != null && L && Rn($, g && g.ref, R, m || g, !m)
    }
      , I = (g, m, _, F) => {
        if (g == null)
            s(m.el = a(m.children), _, F);
        else {
            const L = m.el = g.el;
            m.children !== g.children && f(L, m.children)
        }
    }
      , C = (g, m, _, F) => {
        g == null ? s(m.el = o(m.children || ""), _, F) : m.el = g.el
    }
      , S = (g, m, _, F) => {
        [g.el,g.anchor] = w(g.children, m, _, F, g.el, g.anchor)
    }
      , d = ({el: g, anchor: m}, _, F) => {
        let L;
        for (; g && g !== m; )
            L = h(g),
            s(g, _, F),
            g = L;
        s(m, _, F)
    }
      , v = ({el: g, anchor: m}) => {
        let _;
        for (; g && g !== m; )
            _ = h(g),
            i(g),
            g = _;
        i(m)
    }
      , b = (g, m, _, F, L, R, z, D, V) => {
        m.type === "svg" ? z = "svg" : m.type === "math" && (z = "mathml"),
        g == null ? x(m, _, F, L, R, z, D, V) : y(g, m, L, R, z, D, V)
    }
      , x = (g, m, _, F, L, R, z, D) => {
        let V, B;
        const {props: $, shapeFlag: K, transition: W, dirs: Y} = g;
        if (V = g.el = l(g.type, R, $ && $.is, $),
        K & 8 ? c(V, g.children) : K & 16 && A(g.children, V, null, F, L, as(g, R), z, D),
        Y && De(g, null, F, "created"),
        P(V, g, g.scopeId, z, F),
        $) {
            for (const se in $)
                se !== "value" && !Pt(se) && r(V, se, null, $[se], R, F);
            "value"in $ && r(V, "value", null, $.value, R),
            (B = $.onVnodeBeforeMount) && ye(B, F, g)
        }
        Y && De(g, null, F, "beforeMount");
        const X = gl(L, W);
        X && W.beforeEnter(V),
        s(V, m, _),
        ((B = $ && $.onVnodeMounted) || X || Y) && de( () => {
            B && ye(B, F, g),
            X && W.enter(V),
            Y && De(g, null, F, "mounted")
        }
        , L)
    }
      , P = (g, m, _, F, L) => {
        if (_ && p(g, _),
        F)
            for (let R = 0; R < F.length; R++)
                p(g, F[R]);
        if (L) {
            let R = L.subTree;
            if (m === R) {
                const z = L.vnode;
                P(g, z, z.scopeId, z.slotScopeIds, L.parent)
            }
        }
    }
      , A = (g, m, _, F, L, R, z, D, V=0) => {
        for (let B = V; B < g.length; B++) {
            const $ = g[B] = D ? Qe(g[B]) : Ce(g[B]);
            T(null, $, m, _, F, L, R, z, D)
        }
    }
      , y = (g, m, _, F, L, R, z) => {
        const D = m.el = g.el;
        let {patchFlag: V, dynamicChildren: B, dirs: $} = m;
        V |= g.patchFlag & 16;
        const K = g.props || ie
          , W = m.props || ie;
        let Y;
        if (_ && at(_, !1),
        (Y = W.onVnodeBeforeUpdate) && ye(Y, _, m, g),
        $ && De(m, g, _, "beforeUpdate"),
        _ && at(_, !0),
        (K.innerHTML && W.innerHTML == null || K.textContent && W.textContent == null) && c(D, ""),
        B ? O(g.dynamicChildren, B, D, _, F, as(m, L), R) : z || G(g, m, D, null, _, F, as(m, L), R, !1),
        V > 0) {
            if (V & 16)
                M(D, K, W, _, L);
            else if (V & 2 && K.class !== W.class && r(D, "class", null, W.class, L),
            V & 4 && r(D, "style", K.style, W.style, L),
            V & 8) {
                const X = m.dynamicProps;
                for (let se = 0; se < X.length; se++) {
                    const te = X[se]
                      , ce = K[te]
                      , Be = W[te];
                    (Be !== ce || te === "value") && r(D, te, ce, Be, L, _)
                }
            }
            V & 1 && g.children !== m.children && c(D, m.children)
        } else
            !z && B == null && M(D, K, W, _, L);
        ((Y = W.onVnodeUpdated) || $) && de( () => {
            Y && ye(Y, _, m, g),
            $ && De(m, g, _, "updated")
        }
        , F)
    }
      , O = (g, m, _, F, L, R, z) => {
        for (let D = 0; D < m.length; D++) {
            const V = g[D]
              , B = m[D]
              , $ = V.el && (V.type === ve || !Fe(V, B) || V.shapeFlag & 70) ? u(V.el) : _;
            T(V, B, $, null, F, L, R, z, !0)
        }
    }
      , M = (g, m, _, F, L) => {
        if (m !== _) {
            if (m !== ie)
                for (const R in m)
                    !Pt(R) && !(R in _) && r(g, R, m[R], null, L, F);
            for (const R in _) {
                if (Pt(R))
                    continue;
                const z = _[R]
                  , D = m[R];
                z !== D && R !== "value" && r(g, R, D, z, L, F)
            }
            "value"in _ && r(g, "value", m.value, _.value, L)
        }
    }
      , E = (g, m, _, F, L, R, z, D, V) => {
        const B = m.el = g ? g.el : a("")
          , $ = m.anchor = g ? g.anchor : a("");
        let {patchFlag: K, dynamicChildren: W, slotScopeIds: Y} = m;
        Y && (D = D ? D.concat(Y) : Y),
        g == null ? (s(B, _, F),
        s($, _, F),
        A(m.children || [], _, $, L, R, z, D, V)) : K > 0 && K & 64 && W && g.dynamicChildren ? (O(g.dynamicChildren, W, _, L, R, z, D),
        (m.key != null || L && m === L.subTree) && oi(g, m, !0)) : G(g, m, _, $, L, R, z, D, V)
    }
      , N = (g, m, _, F, L, R, z, D, V) => {
        m.slotScopeIds = D,
        g == null ? m.shapeFlag & 512 ? L.ctx.activate(m, _, F, z, V) : q(m, _, F, L, R, z, V) : J(g, m, V)
    }
      , q = (g, m, _, F, L, R, z) => {
        const D = g.component = tf(g, F, L);
        if (rn(g) && (D.ctx.renderer = Tt),
        nf(D, !1, z),
        D.asyncDep) {
            if (L && L.registerDep(D, j, z),
            !g.el) {
                const V = D.subTree = le(pe);
                C(null, V, m, _)
            }
        } else
            j(D, g, m, _, L, R, z)
    }
      , J = (g, m, _) => {
        const F = m.component = g.component;
        if (Ga(g, m, _))
            if (F.asyncDep && !F.asyncResolved) {
                H(F, m, _);
                return
            } else
                F.next = m,
                Xo(F.update),
                F.effect.dirty = !0,
                F.update();
        else
            m.el = g.el,
            F.vnode = m
    }
      , j = (g, m, _, F, L, R, z) => {
        const D = () => {
            if (g.isMounted) {
                let {next: $, bu: K, u: W, parent: Y, vnode: X} = g;
                {
                    const xt = ml(g);
                    if (xt) {
                        $ && ($.el = X.el,
                        H(g, $, z)),
                        xt.asyncDep.then( () => {
                            g.isUnmounted || D()
                        }
                        );
                        return
                    }
                }
                let se = $, te;
                at(g, !1),
                $ ? ($.el = X.el,
                H(g, $, z)) : $ = X,
                K && Mt(K),
                (te = $.props && $.props.onVnodeBeforeUpdate) && ye(te, Y, $, X),
                at(g, !0);
                const ce = fs(g)
                  , Be = g.subTree;
                g.subTree = ce,
                T(Be, ce, u(Be.el), dn(Be), g, L, R),
                $.el = ce.el,
                se === null && fi(g, ce.el),
                W && de(W, L),
                (te = $.props && $.props.onVnodeUpdated) && de( () => ye(te, Y, $, X), L)
            } else {
                let $;
                const {el: K, props: W} = m
                  , {bm: Y, m: X, parent: se} = g
                  , te = ht(m);
                if (at(g, !1),
                Y && Mt(Y),
                !te && ($ = W && W.onVnodeBeforeMount) && ye($, se, m),
                at(g, !0),
                K && ns) {
                    const ce = () => {
                        g.subTree = fs(g),
                        ns(K, g.subTree, g, L, null)
                    }
                    ;
                    te ? m.type.__asyncLoader().then( () => !g.isUnmounted && ce()) : ce()
                } else {
                    const ce = g.subTree = fs(g);
                    T(null, ce, _, F, g, L, R),
                    m.el = ce.el
                }
                if (X && de(X, L),
                !te && ($ = W && W.onVnodeMounted)) {
                    const ce = m;
                    de( () => ye($, se, ce), L)
                }
                (m.shapeFlag & 256 || se && ht(se.vnode) && se.vnode.shapeFlag & 256) && g.a && de(g.a, L),
                g.isMounted = !0,
                m = _ = F = null
            }
        }
          , V = g.effect = new Ws(D,Pe, () => Yn(B),g.scope)
          , B = g.update = () => {
            V.dirty && V.run()
        }
        ;
        B.i = g,
        B.id = g.uid,
        at(g, !0),
        B()
    }
      , H = (g, m, _) => {
        m.component = g;
        const F = g.vnode.props;
        g.vnode = m,
        g.next = null,
        Sa(g, m.props, F, _),
        _a(g, m.children, _),
        lt(),
        Pi(g),
        ot()
    }
      , G = (g, m, _, F, L, R, z, D, V=!1) => {
        const B = g && g.children
          , $ = g ? g.shapeFlag : 0
          , K = m.children
          , {patchFlag: W, shapeFlag: Y} = m;
        if (W > 0) {
            if (W & 128) {
                Se(B, K, _, F, L, R, z, D, V);
                return
            } else if (W & 256) {
                Z(B, K, _, F, L, R, z, D, V);
                return
            }
        }
        Y & 8 ? ($ & 16 && zt(B, L, R),
        K !== B && c(_, K)) : $ & 16 ? Y & 16 ? Se(B, K, _, F, L, R, z, D, V) : zt(B, L, R, !0) : ($ & 8 && c(_, ""),
        Y & 16 && A(K, _, F, L, R, z, D, V))
    }
      , Z = (g, m, _, F, L, R, z, D, V) => {
        g = g || _t,
        m = m || _t;
        const B = g.length
          , $ = m.length
          , K = Math.min(B, $);
        let W;
        for (W = 0; W < K; W++) {
            const Y = m[W] = V ? Qe(m[W]) : Ce(m[W]);
            T(g[W], Y, _, null, L, R, z, D, V)
        }
        B > $ ? zt(g, L, R, !0, !1, K) : A(m, _, F, L, R, z, D, V, K)
    }
      , Se = (g, m, _, F, L, R, z, D, V) => {
        let B = 0;
        const $ = m.length;
        let K = g.length - 1
          , W = $ - 1;
        for (; B <= K && B <= W; ) {
            const Y = g[B]
              , X = m[B] = V ? Qe(m[B]) : Ce(m[B]);
            if (Fe(Y, X))
                T(Y, X, _, null, L, R, z, D, V);
            else
                break;
            B++
        }
        for (; B <= K && B <= W; ) {
            const Y = g[K]
              , X = m[W] = V ? Qe(m[W]) : Ce(m[W]);
            if (Fe(Y, X))
                T(Y, X, _, null, L, R, z, D, V);
            else
                break;
            K--,
            W--
        }
        if (B > K) {
            if (B <= W) {
                const Y = W + 1
                  , X = Y < $ ? m[Y].el : F;
                for (; B <= W; )
                    T(null, m[B] = V ? Qe(m[B]) : Ce(m[B]), _, X, L, R, z, D, V),
                    B++
            }
        } else if (B > W)
            for (; B <= K; )
                Oe(g[B], L, R, !0),
                B++;
        else {
            const Y = B
              , X = B
              , se = new Map;
            for (B = X; B <= W; B++) {
                const xe = m[B] = V ? Qe(m[B]) : Ce(m[B]);
                xe.key != null && se.set(xe.key, B)
            }
            let te, ce = 0;
            const Be = W - X + 1;
            let xt = !1
              , gi = 0;
            const Ht = new Array(Be);
            for (B = 0; B < Be; B++)
                Ht[B] = 0;
            for (B = Y; B <= K; B++) {
                const xe = g[B];
                if (ce >= Be) {
                    Oe(xe, L, R, !0);
                    continue
                }
                let Ne;
                if (xe.key != null)
                    Ne = se.get(xe.key);
                else
                    for (te = X; te <= W; te++)
                        if (Ht[te - X] === 0 && Fe(xe, m[te])) {
                            Ne = te;
                            break
                        }
                Ne === void 0 ? Oe(xe, L, R, !0) : (Ht[Ne - X] = B + 1,
                Ne >= gi ? gi = Ne : xt = !0,
                T(xe, m[Ne], _, null, L, R, z, D, V),
                ce++)
            }
            const mi = xt ? Fa(Ht) : _t;
            for (te = mi.length - 1,
            B = Be - 1; B >= 0; B--) {
                const xe = X + B
                  , Ne = m[xe]
                  , vi = xe + 1 < $ ? m[xe + 1].el : F;
                Ht[B] === 0 ? T(null, Ne, _, vi, L, R, z, D, V) : xt && (te < 0 || B !== mi[te] ? Te(Ne, _, vi, 2) : te--)
            }
        }
    }
      , Te = (g, m, _, F, L=null) => {
        const {el: R, type: z, transition: D, children: V, shapeFlag: B} = g;
        if (B & 6) {
            Te(g.component.subTree, m, _, F);
            return
        }
        if (B & 128) {
            g.suspense.move(m, _, F);
            return
        }
        if (B & 64) {
            z.move(g, m, _, Tt);
            return
        }
        if (z === ve) {
            s(R, m, _);
            for (let K = 0; K < V.length; K++)
                Te(V[K], m, _, F);
            s(g.anchor, m, _);
            return
        }
        if (z === Yt) {
            d(g, m, _);
            return
        }
        if (F !== 2 && B & 1 && D)
            if (F === 0)
                D.beforeEnter(R),
                s(R, m, _),
                de( () => D.enter(R), L);
            else {
                const {leave: K, delayLeave: W, afterLeave: Y} = D
                  , X = () => s(R, m, _)
                  , se = () => {
                    K(R, () => {
                        X(),
                        Y && Y()
                    }
                    )
                }
                ;
                W ? W(R, X, se) : se()
            }
        else
            s(R, m, _)
    }
      , Oe = (g, m, _, F=!1, L=!1) => {
        const {type: R, props: z, ref: D, children: V, dynamicChildren: B, shapeFlag: $, patchFlag: K, dirs: W, cacheIndex: Y} = g;
        if (K === -2 && (L = !1),
        D != null && Rn(D, null, _, g, !0),
        Y != null && (m.renderCache[Y] = void 0),
        $ & 256) {
            m.ctx.deactivate(g);
            return
        }
        const X = $ & 1 && W
          , se = !ht(g);
        let te;
        if (se && (te = z && z.onVnodeBeforeUnmount) && ye(te, m, g),
        $ & 6)
            so(g.component, _, F);
        else {
            if ($ & 128) {
                g.suspense.unmount(_, F);
                return
            }
            X && De(g, null, m, "beforeUnmount"),
            $ & 64 ? g.type.remove(g, m, _, Tt, F) : B && !B.hasOnce && (R !== ve || K > 0 && K & 64) ? zt(B, m, _, !1, !0) : (R === ve && K & 384 || !L && $ & 16) && zt(V, m, _),
            F && un(g)
        }
        (se && (te = z && z.onVnodeUnmounted) || X) && de( () => {
            te && ye(te, m, g),
            X && De(g, null, m, "unmounted")
        }
        , _)
    }
      , un = g => {
        const {type: m, el: _, anchor: F, transition: L} = g;
        if (m === ve) {
            no(_, F);
            return
        }
        if (m === Yt) {
            v(g);
            return
        }
        const R = () => {
            i(_),
            L && !L.persisted && L.afterLeave && L.afterLeave()
        }
        ;
        if (g.shapeFlag & 1 && L && !L.persisted) {
            const {leave: z, delayLeave: D} = L
              , V = () => z(_, R);
            D ? D(g.el, R, V) : V()
        } else
            R()
    }
      , no = (g, m) => {
        let _;
        for (; g !== m; )
            _ = h(g),
            i(g),
            g = _;
        i(m)
    }
      , so = (g, m, _) => {
        const {bum: F, scope: L, update: R, subTree: z, um: D, m: V, a: B} = g;
        Nn(V),
        Nn(B),
        F && Mt(F),
        L.stop(),
        R && (R.active = !1,
        Oe(z, g, m, _)),
        D && de(D, m),
        de( () => {
            g.isUnmounted = !0
        }
        , m),
        m && m.pendingBranch && !m.isUnmounted && g.asyncDep && !g.asyncResolved && g.suspenseId === m.pendingId && (m.deps--,
        m.deps === 0 && m.resolve())
    }
      , zt = (g, m, _, F=!1, L=!1, R=0) => {
        for (let z = R; z < g.length; z++)
            Oe(g[z], m, _, F, L)
    }
      , dn = g => {
        if (g.shapeFlag & 6)
            return dn(g.component.subTree);
        if (g.shapeFlag & 128)
            return g.suspense.next();
        const m = h(g.anchor || g.el)
          , _ = m && m[ul];
        return _ ? h(_) : m
    }
    ;
    let es = !1;
    const hi = (g, m, _) => {
        g == null ? m._vnode && Oe(m._vnode, null, null, !0) : T(m._vnode || null, g, m, null, null, null, _),
        m._vnode = g,
        es || (es = !0,
        Pi(),
        Ln(),
        es = !1)
    }
      , Tt = {
        p: T,
        um: Oe,
        m: Te,
        r: un,
        mt: q,
        mc: A,
        pc: G,
        pbc: O,
        n: dn,
        o: e
    };
    let ts, ns;
    return t && ([ts,ns] = t(Tt)),
    {
        render: hi,
        hydrate: ts,
        createApp: wa(hi, ts)
    }
}
function as({type: e, props: t}, n) {
    return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n
}
function at({effect: e, update: t}, n) {
    e.allowRecurse = t.allowRecurse = n
}
function gl(e, t) {
    return (!e || e && !e.pendingBranch) && t && !t.persisted
}
function oi(e, t, n=!1) {
    const s = e.children
      , i = t.children;
    if (k(s) && k(i))
        for (let r = 0; r < s.length; r++) {
            const l = s[r];
            let a = i[r];
            a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[r] = Qe(i[r]),
            a.el = l.el),
            !n && a.patchFlag !== -2 && oi(l, a)),
            a.type === mt && (a.el = l.el)
        }
}
function Fa(e) {
    const t = e.slice()
      , n = [0];
    let s, i, r, l, a;
    const o = e.length;
    for (s = 0; s < o; s++) {
        const f = e[s];
        if (f !== 0) {
            if (i = n[n.length - 1],
            e[i] < f) {
                t[s] = i,
                n.push(s);
                continue
            }
            for (r = 0,
            l = n.length - 1; r < l; )
                a = r + l >> 1,
                e[n[a]] < f ? r = a + 1 : l = a;
            f < e[n[r]] && (r > 0 && (t[s] = n[r - 1]),
            n[r] = s)
        }
    }
    for (r = n.length,
    l = n[r - 1]; r-- > 0; )
        n[r] = l,
        l = t[l];
    return n
}
function ml(e) {
    const t = e.subTree.component;
    if (t)
        return t.asyncDep && !t.asyncResolved ? t : ml(t)
}
function Nn(e) {
    if (e)
        for (let t = 0; t < e.length; t++)
            e[t].active = !1
}
const Ra = Symbol.for("v-scx")
  , Na = () => Pn(Ra);
function $u(e, t) {
    return ai(e, null, t)
}
const xn = {};
function qt(e, t, n) {
    return ai(e, t, n)
}
function ai(e, t, {immediate: n, deep: s, flush: i, once: r, onTrack: l, onTrigger: a}=ie) {
    if (t && r) {
        const x = t;
        t = (...P) => {
            x(...P),
            b()
        }
    }
    const o = oe
      , f = x => s === !0 ? x : et(x, s === !1 ? 1 : void 0);
    let c, u = !1, h = !1;
    if (ge(e) ? (c = () => e.value,
    u = Bt(e)) : Ot(e) ? (c = () => f(e),
    u = !0) : k(e) ? (h = !0,
    u = e.some(x => Ot(x) || Bt(x)),
    c = () => e.map(x => {
        if (ge(x))
            return x.value;
        if (Ot(x))
            return f(x);
        if (U(x))
            return st(x, o, 2)
    }
    )) : U(e) ? t ? c = () => st(e, o, 2) : c = () => (p && p(),
    Le(e, o, 3, [w])) : c = Pe,
    t && s) {
        const x = c;
        c = () => et(x())
    }
    let p, w = x => {
        p = d.onStop = () => {
            st(x, o, 4),
            p = d.onStop = void 0
        }
    }
    , T;
    if (cn)
        if (w = Pe,
        t ? n && Le(t, o, 3, [c(), h ? [] : void 0, w]) : c(),
        i === "sync") {
            const x = Na();
            T = x.__watcherHandles || (x.__watcherHandles = [])
        } else
            return Pe;
    let I = h ? new Array(e.length).fill(xn) : xn;
    const C = () => {
        if (!(!d.active || !d.dirty))
            if (t) {
                const x = d.run();
                (s || u || (h ? x.some( (P, A) => it(P, I[A])) : it(x, I))) && (p && p(),
                Le(t, o, 3, [x, I === xn ? void 0 : h && I[0] === xn ? [] : I, w]),
                I = x)
            } else
                d.run()
    }
    ;
    C.allowRecurse = !!t;
    let S;
    i === "sync" ? S = C : i === "post" ? S = () => de(C, o && o.suspense) : (C.pre = !0,
    o && (C.id = o.uid),
    S = () => Yn(C));
    const d = new Ws(c,Pe,S)
      , v = bo()
      , b = () => {
        d.stop(),
        v && js(v.effects, d)
    }
    ;
    return t ? n ? C() : I = d.run() : i === "post" ? de(d.run.bind(d), o && o.suspense) : d.run(),
    T && T.push(b),
    b
}
function Da(e, t, n) {
    const s = this.proxy
      , i = re(e) ? e.includes(".") ? vl(s, e) : () => s[e] : e.bind(s, s);
    let r;
    U(t) ? r = t : (r = t.handler,
    n = t);
    const l = bt(this)
      , a = ai(i, r.bind(s), n);
    return l(),
    a
}
function vl(e, t) {
    const n = t.split(".");
    return () => {
        let s = e;
        for (let i = 0; i < n.length && s; i++)
            s = s[n[i]];
        return s
    }
}
function et(e, t=1 / 0, n) {
    if (t <= 0 || !ne(e) || e.__v_skip || (n = n || new Set,
    n.has(e)))
        return e;
    if (n.add(e),
    t--,
    ge(e))
        et(e.value, t, n);
    else if (k(e))
        for (let s = 0; s < e.length; s++)
            et(e[s], t, n);
    else if (jn(e) || Ct(e))
        e.forEach(s => {
            et(s, t, n)
        }
        );
    else if (pr(e)) {
        for (const s in e)
            et(e[s], t, n);
        for (const s of Object.getOwnPropertySymbols(e))
            Object.prototype.propertyIsEnumerable.call(e, s) && et(e[s], t, n)
    }
    return e
}
const Va = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Re(t)}Modifiers`] || e[`${rt(t)}Modifiers`];
function za(e, t, ...n) {
    if (e.isUnmounted)
        return;
    const s = e.vnode.props || ie;
    let i = n;
    const r = t.startsWith("update:")
      , l = r && Va(s, t.slice(7));
    l && (l.trim && (i = n.map(c => re(c) ? c.trim() : c)),
    l.number && (i = n.map(bs)));
    let a, o = s[a = Cn(t)] || s[a = Cn(Re(t))];
    !o && r && (o = s[a = Cn(rt(t))]),
    o && Le(o, e, 6, i);
    const f = s[a + "Once"];
    if (f) {
        if (!e.emitted)
            e.emitted = {};
        else if (e.emitted[a])
            return;
        e.emitted[a] = !0,
        Le(f, e, 6, i)
    }
}
function yl(e, t, n=!1) {
    const s = t.emitsCache
      , i = s.get(e);
    if (i !== void 0)
        return i;
    const r = e.emits;
    let l = {}
      , a = !1;
    if (!U(e)) {
        const o = f => {
            const c = yl(f, t, !0);
            c && (a = !0,
            fe(l, c))
        }
        ;
        !n && t.mixins.length && t.mixins.forEach(o),
        e.extends && o(e.extends),
        e.mixins && e.mixins.forEach(o)
    }
    return !r && !a ? (ne(e) && s.set(e, null),
    null) : (k(r) ? r.forEach(o => l[o] = null) : fe(l, r),
    ne(e) && s.set(e, l),
    l)
}
function Zn(e, t) {
    return !e || !sn(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""),
    Q(e, t[0].toLowerCase() + t.slice(1)) || Q(e, rt(t)) || Q(e, t))
}
function fs(e) {
    const {type: t, vnode: n, proxy: s, withProxy: i, propsOptions: [r], slots: l, attrs: a, emit: o, render: f, renderCache: c, props: u, data: h, setupState: p, ctx: w, inheritAttrs: T} = e
      , I = Bn(e);
    let C, S;
    try {
        if (n.shapeFlag & 4) {
            const v = i || s
              , b = v;
            C = Ce(f.call(b, v, c, u, p, h, w)),
            S = a
        } else {
            const v = t;
            C = Ce(v.length > 1 ? v(u, {
                attrs: a,
                slots: l,
                emit: o
            }) : v(u, null)),
            S = t.props ? a : $a(a)
        }
    } catch (v) {
        Xt.length = 0,
        Vt(v, e, 1),
        C = le(pe)
    }
    let d = C;
    if (S && T !== !1) {
        const v = Object.keys(S)
          , {shapeFlag: b} = d;
        v.length && b & 7 && (r && v.some($s) && (S = ja(S, r)),
        d = Ke(d, S, !1, !0))
    }
    return n.dirs && (d = Ke(d, null, !1, !0),
    d.dirs = d.dirs ? d.dirs.concat(n.dirs) : n.dirs),
    n.transition && (d.transition = n.transition),
    C = d,
    Bn(I),
    C
}
function Ha(e, t=!0) {
    let n;
    for (let s = 0; s < e.length; s++) {
        const i = e[s];
        if (Rt(i)) {
            if (i.type !== pe || i.children === "v-if") {
                if (n)
                    return;
                n = i
            }
        } else
            return
    }
    return n
}
const $a = e => {
    let t;
    for (const n in e)
        (n === "class" || n === "style" || sn(n)) && ((t || (t = {}))[n] = e[n]);
    return t
}
  , ja = (e, t) => {
    const n = {};
    for (const s in e)
        (!$s(s) || !(s.slice(9)in t)) && (n[s] = e[s]);
    return n
}
;
function Ga(e, t, n) {
    const {props: s, children: i, component: r} = e
      , {props: l, children: a, patchFlag: o} = t
      , f = r.emitsOptions;
    if (t.dirs || t.transition)
        return !0;
    if (n && o >= 0) {
        if (o & 1024)
            return !0;
        if (o & 16)
            return s ? Vi(s, l, f) : !!l;
        if (o & 8) {
            const c = t.dynamicProps;
            for (let u = 0; u < c.length; u++) {
                const h = c[u];
                if (l[h] !== s[h] && !Zn(f, h))
                    return !0
            }
        }
    } else
        return (i || a) && (!a || !a.$stable) ? !0 : s === l ? !1 : s ? l ? Vi(s, l, f) : !0 : !!l;
    return !1
}
function Vi(e, t, n) {
    const s = Object.keys(t);
    if (s.length !== Object.keys(e).length)
        return !0;
    for (let i = 0; i < s.length; i++) {
        const r = s[i];
        if (t[r] !== e[r] && !Zn(n, r))
            return !0
    }
    return !1
}
function fi({vnode: e, parent: t}, n) {
    for (; t; ) {
        const s = t.subTree;
        if (s.suspense && s.suspense.activeBranch === e && (s.el = e.el),
        s === e)
            (e = t.vnode).el = n,
            t = t.parent;
        else
            break
    }
}
const As = e => e.__isSuspense;
let Ls = 0;
const ka = {
    name: "Suspense",
    __isSuspense: !0,
    process(e, t, n, s, i, r, l, a, o, f) {
        if (e == null)
            Wa(t, n, s, i, r, l, a, o, f);
        else {
            if (r && r.deps > 0 && !e.suspense.isInFallback) {
                t.suspense = e.suspense,
                t.suspense.vnode = t,
                t.el = e.el;
                return
            }
            Ka(e, t, n, s, i, l, a, o, f)
        }
    },
    hydrate: Ua,
    normalize: qa
}
  , ju = ka;
function nn(e, t) {
    const n = e.props && e.props[t];
    U(n) && n()
}
function Wa(e, t, n, s, i, r, l, a, o) {
    const {p: f, o: {createElement: c}} = o
      , u = c("div")
      , h = e.suspense = wl(e, i, s, t, u, n, r, l, a, o);
    f(null, h.pendingBranch = e.ssContent, u, null, s, h, r, l),
    h.deps > 0 ? (nn(e, "onPending"),
    nn(e, "onFallback"),
    f(null, e.ssFallback, t, n, s, null, r, l),
    At(h, e.ssFallback)) : h.resolve(!1, !0)
}
function Ka(e, t, n, s, i, r, l, a, {p: o, um: f, o: {createElement: c}}) {
    const u = t.suspense = e.suspense;
    u.vnode = t,
    t.el = e.el;
    const h = t.ssContent
      , p = t.ssFallback
      , {activeBranch: w, pendingBranch: T, isInFallback: I, isHydrating: C} = u;
    if (T)
        u.pendingBranch = h,
        Fe(h, T) ? (o(T, h, u.hiddenContainer, null, i, u, r, l, a),
        u.deps <= 0 ? u.resolve() : I && (C || (o(w, p, n, s, i, null, r, l, a),
        At(u, p)))) : (u.pendingId = Ls++,
        C ? (u.isHydrating = !1,
        u.activeBranch = T) : f(T, i, u),
        u.deps = 0,
        u.effects.length = 0,
        u.hiddenContainer = c("div"),
        I ? (o(null, h, u.hiddenContainer, null, i, u, r, l, a),
        u.deps <= 0 ? u.resolve() : (o(w, p, n, s, i, null, r, l, a),
        At(u, p))) : w && Fe(h, w) ? (o(w, h, n, s, i, u, r, l, a),
        u.resolve(!0)) : (o(null, h, u.hiddenContainer, null, i, u, r, l, a),
        u.deps <= 0 && u.resolve()));
    else if (w && Fe(h, w))
        o(w, h, n, s, i, u, r, l, a),
        At(u, h);
    else if (nn(t, "onPending"),
    u.pendingBranch = h,
    h.shapeFlag & 512 ? u.pendingId = h.component.suspenseId : u.pendingId = Ls++,
    o(null, h, u.hiddenContainer, null, i, u, r, l, a),
    u.deps <= 0)
        u.resolve();
    else {
        const {timeout: S, pendingId: d} = u;
        S > 0 ? setTimeout( () => {
            u.pendingId === d && u.fallback(p)
        }
        , S) : S === 0 && u.fallback(p)
    }
}
function wl(e, t, n, s, i, r, l, a, o, f, c=!1) {
    const {p: u, m: h, um: p, n: w, o: {parentNode: T, remove: I}} = f;
    let C;
    const S = Ya(e);
    S && t && t.pendingBranch && (C = t.pendingId,
    t.deps++);
    const d = e.props ? gr(e.props.timeout) : void 0
      , v = r
      , b = {
        vnode: e,
        parent: t,
        parentComponent: n,
        namespace: l,
        container: s,
        hiddenContainer: i,
        deps: 0,
        pendingId: Ls++,
        timeout: typeof d == "number" ? d : -1,
        activeBranch: null,
        pendingBranch: null,
        isInFallback: !c,
        isHydrating: c,
        isUnmounted: !1,
        effects: [],
        resolve(x=!1, P=!1) {
            const {vnode: A, activeBranch: y, pendingBranch: O, pendingId: M, effects: E, parentComponent: N, container: q} = b;
            let J = !1;
            b.isHydrating ? b.isHydrating = !1 : x || (J = y && O.transition && O.transition.mode === "out-in",
            J && (y.transition.afterLeave = () => {
                M === b.pendingId && (h(O, q, r === v ? w(y) : r, 0),
                _s(E))
            }
            ),
            y && (T(y.el) !== b.hiddenContainer && (r = w(y)),
            p(y, N, b, !0)),
            J || h(O, q, r, 0)),
            At(b, O),
            b.pendingBranch = null,
            b.isInFallback = !1;
            let j = b.parent
              , H = !1;
            for (; j; ) {
                if (j.pendingBranch) {
                    j.effects.push(...E),
                    H = !0;
                    break
                }
                j = j.parent
            }
            !H && !J && _s(E),
            b.effects = [],
            S && t && t.pendingBranch && C === t.pendingId && (t.deps--,
            t.deps === 0 && !P && t.resolve()),
            nn(A, "onResolve")
        },
        fallback(x) {
            if (!b.pendingBranch)
                return;
            const {vnode: P, activeBranch: A, parentComponent: y, container: O, namespace: M} = b;
            nn(P, "onFallback");
            const E = w(A)
              , N = () => {
                b.isInFallback && (u(null, x, O, E, y, null, M, a, o),
                At(b, x))
            }
              , q = x.transition && x.transition.mode === "out-in";
            q && (A.transition.afterLeave = N),
            b.isInFallback = !0,
            p(A, y, null, !0),
            q || N()
        },
        move(x, P, A) {
            b.activeBranch && h(b.activeBranch, x, P, A),
            b.container = x
        },
        next() {
            return b.activeBranch && w(b.activeBranch)
        },
        registerDep(x, P, A) {
            const y = !!b.pendingBranch;
            y && b.deps++;
            const O = x.vnode.el;
            x.asyncDep.catch(M => {
                Vt(M, x, 0)
            }
            ).then(M => {
                if (x.isUnmounted || b.isUnmounted || b.pendingId !== x.suspenseId)
                    return;
                x.asyncResolved = !0;
                const {vnode: E} = x;
                Rs(x, M, !1),
                O && (E.el = O);
                const N = !O && x.subTree.el;
                P(x, E, T(O || x.subTree.el), O ? null : w(x.subTree), b, l, A),
                N && I(N),
                fi(x, E.el),
                y && --b.deps === 0 && b.resolve()
            }
            )
        },
        unmount(x, P) {
            b.isUnmounted = !0,
            b.activeBranch && p(b.activeBranch, n, x, P),
            b.pendingBranch && p(b.pendingBranch, n, x, P)
        }
    };
    return b
}
function Ua(e, t, n, s, i, r, l, a, o) {
    const f = t.suspense = wl(t, s, n, e.parentNode, document.createElement("div"), null, i, r, l, a, !0)
      , c = o(e, f.pendingBranch = t.ssContent, n, f, r, l);
    return f.deps === 0 && f.resolve(!1, !0),
    c
}
function qa(e) {
    const {shapeFlag: t, children: n} = e
      , s = t & 32;
    e.ssContent = zi(s ? n.default : n),
    e.ssFallback = s ? zi(n.fallback) : le(pe)
}
function zi(e) {
    let t;
    if (U(e)) {
        const n = Ft && e._c;
        n && (e._d = !1,
        ci()),
        e = e(),
        n && (e._d = !0,
        t = we,
        Sl())
    }
    return k(e) && (e = Ha(e)),
    e = Ce(e),
    t && !e.dynamicChildren && (e.dynamicChildren = t.filter(n => n !== e)),
    e
}
function bl(e, t) {
    t && t.pendingBranch ? k(e) ? t.effects.push(...e) : t.effects.push(e) : _s(e)
}
function At(e, t) {
    e.activeBranch = t;
    const {vnode: n, parentComponent: s} = e;
    let i = t.el;
    for (; !i && t.component; )
        t = t.component.subTree,
        i = t.el;
    n.el = i,
    s && s.subTree === n && (s.vnode.el = i,
    fi(s, i))
}
function Ya(e) {
    const t = e.props && e.props.suspensible;
    return t != null && t !== !1
}
const ve = Symbol.for("v-fgt")
  , mt = Symbol.for("v-txt")
  , pe = Symbol.for("v-cmt")
  , Yt = Symbol.for("v-stc")
  , Xt = [];
let we = null;
function ci(e=!1) {
    Xt.push(we = e ? null : [])
}
function Sl() {
    Xt.pop(),
    we = Xt[Xt.length - 1] || null
}
let Ft = 1;
function Hi(e) {
    Ft += e,
    e < 0 && we && (we.hasOnce = !0)
}
function Tl(e) {
    return e.dynamicChildren = Ft > 0 ? we || _t : null,
    Sl(),
    Ft > 0 && we && we.push(e),
    e
}
function Gu(e, t, n, s, i, r) {
    return Tl(_l(e, t, n, s, i, r, !0))
}
function xl(e, t, n, s, i) {
    return Tl(le(e, t, n, s, i, !0))
}
function Rt(e) {
    return e ? e.__v_isVNode === !0 : !1
}
function Fe(e, t) {
    return e.type === t.type && e.key === t.key
}
const El = ({key: e}) => e ?? null
  , Mn = ({ref: e, ref_key: t, ref_for: n}) => (typeof e == "number" && (e = "" + e),
e != null ? re(e) || ge(e) || U(e) ? {
    i: ae,
    r: e,
    k: t,
    f: !!n
} : e : null);
function _l(e, t=null, n=null, s=0, i=null, r=e === ve ? 0 : 1, l=!1, a=!1) {
    const o = {
        __v_isVNode: !0,
        __v_skip: !0,
        type: e,
        props: t,
        key: t && El(t),
        ref: t && Mn(t),
        scopeId: Xn,
        slotScopeIds: null,
        children: n,
        component: null,
        suspense: null,
        ssContent: null,
        ssFallback: null,
        dirs: null,
        transition: null,
        el: null,
        anchor: null,
        target: null,
        targetStart: null,
        targetAnchor: null,
        staticCount: 0,
        shapeFlag: r,
        patchFlag: s,
        dynamicProps: i,
        dynamicChildren: null,
        appContext: null,
        ctx: ae
    };
    return a ? (ui(o, n),
    r & 128 && e.normalize(o)) : n && (o.shapeFlag |= re(n) ? 8 : 16),
    Ft > 0 && !l && we && (o.patchFlag > 0 || r & 6) && o.patchFlag !== 32 && we.push(o),
    o
}
const le = Xa;
function Xa(e, t=null, n=null, s=0, i=null, r=!1) {
    if ((!e || e === Jr) && (e = pe),
    Rt(e)) {
        const a = Ke(e, t, !0);
        return n && ui(a, n),
        Ft > 0 && !r && we && (a.shapeFlag & 6 ? we[we.indexOf(e)] = a : we.push(a)),
        a.patchFlag = -2,
        a
    }
    if (lf(e) && (e = e.__vccOpts),
    t) {
        t = Ja(t);
        let {class: a, style: o} = t;
        a && !re(a) && (t.class = Kn(a)),
        ne(o) && (Fr(o) && !k(o) && (o = fe({}, o)),
        t.style = Wn(o))
    }
    const l = re(e) ? 1 : As(e) ? 128 : Ca(e) ? 64 : ne(e) ? 4 : U(e) ? 2 : 0;
    return _l(e, t, n, s, i, l, r, !0)
}
function Ja(e) {
    return e ? Fr(e) || il(e) ? fe({}, e) : e : null
}
function Ke(e, t, n=!1, s=!1) {
    const {props: i, ref: r, patchFlag: l, children: a, transition: o} = e
      , f = t ? Za(i || {}, t) : i
      , c = {
        __v_isVNode: !0,
        __v_skip: !0,
        type: e.type,
        props: f,
        key: f && El(f),
        ref: t && t.ref ? n && r ? k(r) ? r.concat(Mn(t)) : [r, Mn(t)] : Mn(t) : r,
        scopeId: e.scopeId,
        slotScopeIds: e.slotScopeIds,
        children: a,
        target: e.target,
        targetStart: e.targetStart,
        targetAnchor: e.targetAnchor,
        staticCount: e.staticCount,
        shapeFlag: e.shapeFlag,
        patchFlag: t && e.type !== ve ? l === -1 ? 16 : l | 16 : l,
        dynamicProps: e.dynamicProps,
        dynamicChildren: e.dynamicChildren,
        appContext: e.appContext,
        dirs: e.dirs,
        transition: o,
        component: e.component,
        suspense: e.suspense,
        ssContent: e.ssContent && Ke(e.ssContent),
        ssFallback: e.ssFallback && Ke(e.ssFallback),
        el: e.el,
        anchor: e.anchor,
        ctx: e.ctx,
        ce: e.ce
    };
    return o && s && wt(c, o.clone(c)),
    c
}
function Cl(e=" ", t=0) {
    return le(mt, null, e, t)
}
function ku(e, t) {
    const n = le(Yt, null, e);
    return n.staticCount = t,
    n
}
function Wu(e="", t=!1) {
    return t ? (ci(),
    xl(pe, null, e)) : le(pe, null, e)
}
function Ce(e) {
    return e == null || typeof e == "boolean" ? le(pe) : k(e) ? le(ve, null, e.slice()) : typeof e == "object" ? Qe(e) : le(mt, null, String(e))
}
function Qe(e) {
    return e.el === null && e.patchFlag !== -1 || e.memo ? e : Ke(e)
}
function ui(e, t) {
    let n = 0;
    const {shapeFlag: s} = e;
    if (t == null)
        t = null;
    else if (k(t))
        n = 16;
    else if (typeof t == "object")
        if (s & 65) {
            const i = t.default;
            i && (i._c && (i._d = !1),
            ui(e, i()),
            i._c && (i._d = !0));
            return
        } else {
            n = 32;
            const i = t._;
            !i && !il(t) ? t._ctx = ae : i === 3 && ae && (ae.slots._ === 1 ? t._ = 1 : (t._ = 2,
            e.patchFlag |= 1024))
        }
    else
        U(t) ? (t = {
            default: t,
            _ctx: ae
        },
        n = 32) : (t = String(t),
        s & 64 ? (n = 16,
        t = [Cl(t)]) : n = 8);
    e.children = t,
    e.shapeFlag |= n
}
function Za(...e) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
        const s = e[n];
        for (const i in s)
            if (i === "class")
                t.class !== s.class && (t.class = Kn([t.class, s.class]));
            else if (i === "style")
                t.style = Wn([t.style, s.style]);
            else if (sn(i)) {
                const r = t[i]
                  , l = s[i];
                l && r !== l && !(k(r) && r.includes(l)) && (t[i] = r ? [].concat(r, l) : l)
            } else
                i !== "" && (t[i] = s[i])
    }
    return t
}
function ye(e, t, n, s=null) {
    Le(e, t, 7, [n, s])
}
const Qa = tl();
let ef = 0;
function tf(e, t, n) {
    const s = e.type
      , i = (t ? t.appContext : e.appContext) || Qa
      , r = {
        uid: ef++,
        vnode: e,
        type: s,
        parent: t,
        appContext: i,
        root: null,
        next: null,
        subTree: null,
        effect: null,
        update: null,
        scope: new Sr(!0),
        render: null,
        proxy: null,
        exposed: null,
        exposeProxy: null,
        withProxy: null,
        provides: t ? t.provides : Object.create(i.provides),
        accessCache: null,
        renderCache: [],
        components: null,
        directives: null,
        propsOptions: ll(s, i),
        emitsOptions: yl(s, i),
        emit: null,
        emitted: null,
        propsDefaults: ie,
        inheritAttrs: s.inheritAttrs,
        ctx: ie,
        data: ie,
        props: ie,
        attrs: ie,
        slots: ie,
        refs: ie,
        setupState: ie,
        setupContext: null,
        suspense: n,
        suspenseId: n ? n.pendingId : 0,
        asyncDep: null,
        asyncResolved: !1,
        isMounted: !1,
        isUnmounted: !1,
        isDeactivated: !1,
        bc: null,
        c: null,
        bm: null,
        m: null,
        bu: null,
        u: null,
        um: null,
        bum: null,
        da: null,
        a: null,
        rtg: null,
        rtc: null,
        ec: null,
        sp: null
    };
    return r.ctx = {
        _: r
    },
    r.root = t ? t.root : r,
    r.emit = za.bind(null, r),
    e.ce && e.ce(r),
    r
}
let oe = null;
const fn = () => oe || ae;
let Dn, Bs;
{
    const e = mr()
      , t = (n, s) => {
        let i;
        return (i = e[n]) || (i = e[n] = []),
        i.push(s),
        r => {
            i.length > 1 ? i.forEach(l => l(r)) : i[0](r)
        }
    }
    ;
    Dn = t("__VUE_INSTANCE_SETTERS__", n => oe = n),
    Bs = t("__VUE_SSR_SETTERS__", n => cn = n)
}
const bt = e => {
    const t = oe;
    return Dn(e),
    e.scope.on(),
    () => {
        e.scope.off(),
        Dn(t)
    }
}
  , Fs = () => {
    oe && oe.scope.off(),
    Dn(null)
}
;
function Pl(e) {
    return e.vnode.shapeFlag & 4
}
let cn = !1;
function nf(e, t=!1, n=!1) {
    t && Bs(t);
    const {props: s, children: i} = e.vnode
      , r = Pl(e);
    ba(e, s, r, t),
    Ea(e, i, n);
    const l = r ? sf(e, t) : void 0;
    return t && Bs(!1),
    l
}
function sf(e, t) {
    const n = e.type;
    e.accessCache = Object.create(null),
    e.proxy = new Proxy(e.ctx,da);
    const {setup: s} = n;
    if (s) {
        const i = e.setupContext = s.length > 1 ? Ol(e) : null
          , r = bt(e);
        lt();
        const l = st(s, e, 0, [e.props, i]);
        if (ot(),
        r(),
        Gs(l)) {
            if (l.then(Fs, Fs),
            t)
                return l.then(a => {
                    Rs(e, a, t)
                }
                ).catch(a => {
                    Vt(a, e, 0)
                }
                );
            e.asyncDep = l
        } else
            Rs(e, l, t)
    } else
        Ml(e, t)
}
function Rs(e, t, n) {
    U(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : ne(t) && (e.setupState = Vr(t)),
    Ml(e, n)
}
let $i;
function Ml(e, t, n) {
    const s = e.type;
    if (!e.render) {
        if (!t && $i && !s.render) {
            const i = s.template || ii(e).template;
            if (i) {
                const {isCustomElement: r, compilerOptions: l} = e.appContext.config
                  , {delimiters: a, compilerOptions: o} = s
                  , f = fe(fe({
                    isCustomElement: r,
                    delimiters: a
                }, l), o);
                s.render = $i(i, f)
            }
        }
        e.render = s.render || Pe
    }
    {
        const i = bt(e);
        lt();
        try {
            pa(e)
        } finally {
            ot(),
            i()
        }
    }
}
const rf = {
    get(e, t) {
        return be(e, "get", ""),
        e[t]
    }
};
function Ol(e) {
    const t = n => {
        e.exposed = n || {}
    }
    ;
    return {
        attrs: new Proxy(e.attrs,rf),
        slots: e.slots,
        emit: e.emit,
        expose: t
    }
}
function Qn(e) {
    return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Vr(jo(e.exposed)),{
        get(t, n) {
            if (n in t)
                return t[n];
            if (n in Kt)
                return Kt[n](e)
        },
        has(t, n) {
            return n in t || n in Kt
        }
    })) : e.proxy
}
function Ns(e, t=!0) {
    return U(e) ? e.displayName || e.name : e.name || t && e.__name
}
function lf(e) {
    return U(e) && "__vccOpts"in e
}
const Il = (e, t) => Go(e, t, cn);
function Ae(e, t, n) {
    const s = arguments.length;
    return s === 2 ? ne(t) && !k(t) ? Rt(t) ? le(e, null, [t]) : le(e, t) : le(e, null, t) : (s > 3 ? n = Array.prototype.slice.call(arguments, 2) : s === 3 && Rt(n) && (n = [n]),
    le(e, t, n))
}
const of = "3.4.38"
  , Ku = Pe;
/**
* @vue/runtime-dom v3.4.38
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
const af = "http://www.w3.org/2000/svg"
  , ff = "http://www.w3.org/1998/Math/MathML"
  , Ge = typeof document < "u" ? document : null
  , ji = Ge && Ge.createElement("template")
  , cf = {
    insert: (e, t, n) => {
        t.insertBefore(e, n || null)
    }
    ,
    remove: e => {
        const t = e.parentNode;
        t && t.removeChild(e)
    }
    ,
    createElement: (e, t, n, s) => {
        const i = t === "svg" ? Ge.createElementNS(af, e) : t === "mathml" ? Ge.createElementNS(ff, e) : n ? Ge.createElement(e, {
            is: n
        }) : Ge.createElement(e);
        return e === "select" && s && s.multiple != null && i.setAttribute("multiple", s.multiple),
        i
    }
    ,
    createText: e => Ge.createTextNode(e),
    createComment: e => Ge.createComment(e),
    setText: (e, t) => {
        e.nodeValue = t
    }
    ,
    setElementText: (e, t) => {
        e.textContent = t
    }
    ,
    parentNode: e => e.parentNode,
    nextSibling: e => e.nextSibling,
    querySelector: e => Ge.querySelector(e),
    setScopeId(e, t) {
        e.setAttribute(t, "")
    },
    insertStaticContent(e, t, n, s, i, r) {
        const l = n ? n.previousSibling : t.lastChild;
        if (i && (i === r || i.nextSibling))
            for (; t.insertBefore(i.cloneNode(!0), n),
            !(i === r || !(i = i.nextSibling)); )
                ;
        else {
            ji.innerHTML = s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e;
            const a = ji.content;
            if (s === "svg" || s === "mathml") {
                const o = a.firstChild;
                for (; o.firstChild; )
                    a.appendChild(o.firstChild);
                a.removeChild(o)
            }
            t.insertBefore(a, n)
        }
        return [l ? l.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild]
    }
}
  , Ye = "transition"
  , $t = "animation"
  , Nt = Symbol("_vtc")
  , Al = (e, {slots: t}) => Ae(ea, Bl(e), t);
Al.displayName = "Transition";
const Ll = {
    name: String,
    type: String,
    css: {
        type: Boolean,
        default: !0
    },
    duration: [String, Number, Object],
    enterFromClass: String,
    enterActiveClass: String,
    enterToClass: String,
    appearFromClass: String,
    appearActiveClass: String,
    appearToClass: String,
    leaveFromClass: String,
    leaveActiveClass: String,
    leaveToClass: String
}
  , uf = Al.props = fe({}, Wr, Ll)
  , ft = (e, t=[]) => {
    k(e) ? e.forEach(n => n(...t)) : e && e(...t)
}
  , Gi = e => e ? k(e) ? e.some(t => t.length > 1) : e.length > 1 : !1;
function Bl(e) {
    const t = {};
    for (const E in e)
        E in Ll || (t[E] = e[E]);
    if (e.css === !1)
        return t;
    const {name: n="v", type: s, duration: i, enterFromClass: r=`${n}-enter-from`, enterActiveClass: l=`${n}-enter-active`, enterToClass: a=`${n}-enter-to`, appearFromClass: o=r, appearActiveClass: f=l, appearToClass: c=a, leaveFromClass: u=`${n}-leave-from`, leaveActiveClass: h=`${n}-leave-active`, leaveToClass: p=`${n}-leave-to`} = e
      , w = df(i)
      , T = w && w[0]
      , I = w && w[1]
      , {onBeforeEnter: C, onEnter: S, onEnterCancelled: d, onLeave: v, onLeaveCancelled: b, onBeforeAppear: x=C, onAppear: P=S, onAppearCancelled: A=d} = t
      , y = (E, N, q) => {
        Xe(E, N ? c : a),
        Xe(E, N ? f : l),
        q && q()
    }
      , O = (E, N) => {
        E._isLeaving = !1,
        Xe(E, u),
        Xe(E, p),
        Xe(E, h),
        N && N()
    }
      , M = E => (N, q) => {
        const J = E ? P : S
          , j = () => y(N, E, q);
        ft(J, [N, j]),
        ki( () => {
            Xe(N, E ? o : r),
            $e(N, E ? c : a),
            Gi(J) || Wi(N, s, T, j)
        }
        )
    }
    ;
    return fe(t, {
        onBeforeEnter(E) {
            ft(C, [E]),
            $e(E, r),
            $e(E, l)
        },
        onBeforeAppear(E) {
            ft(x, [E]),
            $e(E, o),
            $e(E, f)
        },
        onEnter: M(!1),
        onAppear: M(!0),
        onLeave(E, N) {
            E._isLeaving = !0;
            const q = () => O(E, N);
            $e(E, u),
            $e(E, h),
            Rl(),
            ki( () => {
                E._isLeaving && (Xe(E, u),
                $e(E, p),
                Gi(v) || Wi(E, s, I, q))
            }
            ),
            ft(v, [E, q])
        },
        onEnterCancelled(E) {
            y(E, !1),
            ft(d, [E])
        },
        onAppearCancelled(E) {
            y(E, !0),
            ft(A, [E])
        },
        onLeaveCancelled(E) {
            O(E),
            ft(b, [E])
        }
    })
}
function df(e) {
    if (e == null)
        return null;
    if (ne(e))
        return [cs(e.enter), cs(e.leave)];
    {
        const t = cs(e);
        return [t, t]
    }
}
function cs(e) {
    return gr(e)
}
function $e(e, t) {
    t.split(/\s+/).forEach(n => n && e.classList.add(n)),
    (e[Nt] || (e[Nt] = new Set)).add(t)
}
function Xe(e, t) {
    t.split(/\s+/).forEach(s => s && e.classList.remove(s));
    const n = e[Nt];
    n && (n.delete(t),
    n.size || (e[Nt] = void 0))
}
function ki(e) {
    requestAnimationFrame( () => {
        requestAnimationFrame(e)
    }
    )
}
let pf = 0;
function Wi(e, t, n, s) {
    const i = e._endId = ++pf
      , r = () => {
        i === e._endId && s()
    }
    ;
    if (n)
        return setTimeout(r, n);
    const {type: l, timeout: a, propCount: o} = Fl(e, t);
    if (!l)
        return s();
    const f = l + "end";
    let c = 0;
    const u = () => {
        e.removeEventListener(f, h),
        r()
    }
      , h = p => {
        p.target === e && ++c >= o && u()
    }
    ;
    setTimeout( () => {
        c < o && u()
    }
    , a + 1),
    e.addEventListener(f, h)
}
function Fl(e, t) {
    const n = window.getComputedStyle(e)
      , s = w => (n[w] || "").split(", ")
      , i = s(`${Ye}Delay`)
      , r = s(`${Ye}Duration`)
      , l = Ki(i, r)
      , a = s(`${$t}Delay`)
      , o = s(`${$t}Duration`)
      , f = Ki(a, o);
    let c = null
      , u = 0
      , h = 0;
    t === Ye ? l > 0 && (c = Ye,
    u = l,
    h = r.length) : t === $t ? f > 0 && (c = $t,
    u = f,
    h = o.length) : (u = Math.max(l, f),
    c = u > 0 ? l > f ? Ye : $t : null,
    h = c ? c === Ye ? r.length : o.length : 0);
    const p = c === Ye && /\b(transform|all)(,|$)/.test(s(`${Ye}Property`).toString());
    return {
        type: c,
        timeout: u,
        propCount: h,
        hasTransform: p
    }
}
function Ki(e, t) {
    for (; e.length < t.length; )
        e = e.concat(e);
    return Math.max(...t.map( (n, s) => Ui(n) + Ui(e[s])))
}
function Ui(e) {
    return e === "auto" ? 0 : Number(e.slice(0, -1).replace(",", ".")) * 1e3
}
function Rl() {
    return document.body.offsetHeight
}
function hf(e, t, n) {
    const s = e[Nt];
    s && (t = (t ? [t, ...s] : [...s]).join(" ")),
    t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t
}
const Vn = Symbol("_vod")
  , Nl = Symbol("_vsh")
  , Uu = {
    beforeMount(e, {value: t}, {transition: n}) {
        e[Vn] = e.style.display === "none" ? "" : e.style.display,
        n && t ? n.beforeEnter(e) : jt(e, t)
    },
    mounted(e, {value: t}, {transition: n}) {
        n && t && n.enter(e)
    },
    updated(e, {value: t, oldValue: n}, {transition: s}) {
        !t != !n && (s ? t ? (s.beforeEnter(e),
        jt(e, !0),
        s.enter(e)) : s.leave(e, () => {
            jt(e, !1)
        }
        ) : jt(e, t))
    },
    beforeUnmount(e, {value: t}) {
        jt(e, t)
    }
};
function jt(e, t) {
    e.style.display = t ? e[Vn] : "none",
    e[Nl] = !t
}
const gf = Symbol("")
  , mf = /(^|;)\s*display\s*:/;
function vf(e, t, n) {
    const s = e.style
      , i = re(n);
    let r = !1;
    if (n && !i) {
        if (t)
            if (re(t))
                for (const l of t.split(";")) {
                    const a = l.slice(0, l.indexOf(":")).trim();
                    n[a] == null && On(s, a, "")
                }
            else
                for (const l in t)
                    n[l] == null && On(s, l, "");
        for (const l in n)
            l === "display" && (r = !0),
            On(s, l, n[l])
    } else if (i) {
        if (t !== n) {
            const l = s[gf];
            l && (n += ";" + l),
            s.cssText = n,
            r = mf.test(n)
        }
    } else
        t && e.removeAttribute("style");
    Vn in e && (e[Vn] = r ? s.display : "",
    e[Nl] && (s.display = "none"))
}
const qi = /\s*!important$/;
function On(e, t, n) {
    if (k(n))
        n.forEach(s => On(e, t, s));
    else if (n == null && (n = ""),
    t.startsWith("--"))
        e.setProperty(t, n);
    else {
        const s = yf(e, t);
        qi.test(n) ? e.setProperty(rt(s), n.replace(qi, ""), "important") : e[s] = n
    }
}
const Yi = ["Webkit", "Moz", "ms"]
  , us = {};
function yf(e, t) {
    const n = us[t];
    if (n)
        return n;
    let s = Re(t);
    if (s !== "filter" && s in e)
        return us[t] = s;
    s = kn(s);
    for (let i = 0; i < Yi.length; i++) {
        const r = Yi[i] + s;
        if (r in e)
            return us[t] = r
    }
    return t
}
const Xi = "http://www.w3.org/1999/xlink";
function Ji(e, t, n, s, i, r=mo(t)) {
    s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(Xi, t.slice(6, t.length)) : e.setAttributeNS(Xi, t, n) : n == null || r && !vr(n) ? e.removeAttribute(t) : e.setAttribute(t, r ? "" : He(n) ? String(n) : n)
}
function wf(e, t, n, s) {
    if (t === "innerHTML" || t === "textContent") {
        if (n == null)
            return;
        e[t] = n;
        return
    }
    const i = e.tagName;
    if (t === "value" && i !== "PROGRESS" && !i.includes("-")) {
        const l = i === "OPTION" ? e.getAttribute("value") || "" : e.value
          , a = n == null ? "" : String(n);
        (l !== a || !("_value"in e)) && (e.value = a),
        n == null && e.removeAttribute(t),
        e._value = n;
        return
    }
    let r = !1;
    if (n === "" || n == null) {
        const l = typeof e[t];
        l === "boolean" ? n = vr(n) : n == null && l === "string" ? (n = "",
        r = !0) : l === "number" && (n = 0,
        r = !0)
    }
    try {
        e[t] = n
    } catch {}
    r && e.removeAttribute(t)
}
function ut(e, t, n, s) {
    e.addEventListener(t, n, s)
}
function bf(e, t, n, s) {
    e.removeEventListener(t, n, s)
}
const Zi = Symbol("_vei");
function Sf(e, t, n, s, i=null) {
    const r = e[Zi] || (e[Zi] = {})
      , l = r[t];
    if (s && l)
        l.value = s;
    else {
        const [a,o] = Tf(t);
        if (s) {
            const f = r[t] = _f(s, i);
            ut(e, a, f, o)
        } else
            l && (bf(e, a, l, o),
            r[t] = void 0)
    }
}
const Qi = /(?:Once|Passive|Capture)$/;
function Tf(e) {
    let t;
    if (Qi.test(e)) {
        t = {};
        let s;
        for (; s = e.match(Qi); )
            e = e.slice(0, e.length - s[0].length),
            t[s[0].toLowerCase()] = !0
    }
    return [e[2] === ":" ? e.slice(3) : rt(e.slice(2)), t]
}
let ds = 0;
const xf = Promise.resolve()
  , Ef = () => ds || (xf.then( () => ds = 0),
ds = Date.now());
function _f(e, t) {
    const n = s => {
        if (!s._vts)
            s._vts = Date.now();
        else if (s._vts <= n.attached)
            return;
        Le(Cf(s, n.value), t, 5, [s])
    }
    ;
    return n.value = e,
    n.attached = Ef(),
    n
}
function Cf(e, t) {
    if (k(t)) {
        const n = e.stopImmediatePropagation;
        return e.stopImmediatePropagation = () => {
            n.call(e),
            e._stopped = !0
        }
        ,
        t.map(s => i => !i._stopped && s && s(i))
    } else
        return t
}
const er = e => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123
  , Pf = (e, t, n, s, i, r) => {
    const l = i === "svg";
    t === "class" ? hf(e, s, l) : t === "style" ? vf(e, n, s) : sn(t) ? $s(t) || Sf(e, t, n, s, r) : (t[0] === "." ? (t = t.slice(1),
    !0) : t[0] === "^" ? (t = t.slice(1),
    !1) : Mf(e, t, s, l)) ? (wf(e, t, s),
    !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && Ji(e, t, s, l, r, t !== "value")) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s),
    Ji(e, t, s, l))
}
;
function Mf(e, t, n, s) {
    if (s)
        return !!(t === "innerHTML" || t === "textContent" || t in e && er(t) && U(n));
    if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
        return !1;
    if (t === "width" || t === "height") {
        const i = e.tagName;
        if (i === "IMG" || i === "VIDEO" || i === "CANVAS" || i === "SOURCE")
            return !1
    }
    return er(t) && re(n) ? !1 : t in e
}
const Dl = new WeakMap
  , Vl = new WeakMap
  , zn = Symbol("_moveCb")
  , tr = Symbol("_enterCb")
  , zl = {
    name: "TransitionGroup",
    props: fe({}, uf, {
        tag: String,
        moveClass: String
    }),
    setup(e, {slots: t}) {
        const n = fn()
          , s = kr();
        let i, r;
        return on( () => {
            if (!i.length)
                return;
            const l = e.moveClass || `${e.name || "v"}-move`;
            if (!Bf(i[0].el, n.vnode.el, l))
                return;
            i.forEach(If),
            i.forEach(Af);
            const a = i.filter(Lf);
            Rl(),
            a.forEach(o => {
                const f = o.el
                  , c = f.style;
                $e(f, l),
                c.transform = c.webkitTransform = c.transitionDuration = "";
                const u = f[zn] = h => {
                    h && h.target !== f || (!h || /transform$/.test(h.propertyName)) && (f.removeEventListener("transitionend", u),
                    f[zn] = null,
                    Xe(f, l))
                }
                ;
                f.addEventListener("transitionend", u)
            }
            )
        }
        ),
        () => {
            const l = ee(e)
              , a = Bl(l);
            let o = l.tag || ve;
            if (i = [],
            r)
                for (let f = 0; f < r.length; f++) {
                    const c = r[f];
                    c.el && c.el instanceof Element && (i.push(c),
                    wt(c, tn(c, a, s, n)),
                    Dl.set(c, c.el.getBoundingClientRect()))
                }
            r = t.default ? ti(t.default()) : [];
            for (let f = 0; f < r.length; f++) {
                const c = r[f];
                c.key != null && wt(c, tn(c, a, s, n))
            }
            return le(o, null, r)
        }
    }
}
  , Of = e => delete e.mode;
zl.props;
const qu = zl;
function If(e) {
    const t = e.el;
    t[zn] && t[zn](),
    t[tr] && t[tr]()
}
function Af(e) {
    Vl.set(e, e.el.getBoundingClientRect())
}
function Lf(e) {
    const t = Dl.get(e)
      , n = Vl.get(e)
      , s = t.left - n.left
      , i = t.top - n.top;
    if (s || i) {
        const r = e.el.style;
        return r.transform = r.webkitTransform = `translate(${s}px,${i}px)`,
        r.transitionDuration = "0s",
        e
    }
}
function Bf(e, t, n) {
    const s = e.cloneNode()
      , i = e[Nt];
    i && i.forEach(a => {
        a.split(/\s+/).forEach(o => o && s.classList.remove(o))
    }
    ),
    n.split(/\s+/).forEach(a => a && s.classList.add(a)),
    s.style.display = "none";
    const r = t.nodeType === 1 ? t : t.parentNode;
    r.appendChild(s);
    const {hasTransform: l} = Fl(s);
    return r.removeChild(s),
    l
}
const Hn = e => {
    const t = e.props["onUpdate:modelValue"] || !1;
    return k(t) ? n => Mt(t, n) : t
}
;
function Ff(e) {
    e.target.composing = !0
}
function nr(e) {
    const t = e.target;
    t.composing && (t.composing = !1,
    t.dispatchEvent(new Event("input")))
}
const Lt = Symbol("_assign")
  , Yu = {
    created(e, {modifiers: {lazy: t, trim: n, number: s}}, i) {
        e[Lt] = Hn(i);
        const r = s || i.props && i.props.type === "number";
        ut(e, t ? "change" : "input", l => {
            if (l.target.composing)
                return;
            let a = e.value;
            n && (a = a.trim()),
            r && (a = bs(a)),
            e[Lt](a)
        }
        ),
        n && ut(e, "change", () => {
            e.value = e.value.trim()
        }
        ),
        t || (ut(e, "compositionstart", Ff),
        ut(e, "compositionend", nr),
        ut(e, "change", nr))
    },
    mounted(e, {value: t}) {
        e.value = t ?? ""
    },
    beforeUpdate(e, {value: t, oldValue: n, modifiers: {lazy: s, trim: i, number: r}}, l) {
        if (e[Lt] = Hn(l),
        e.composing)
            return;
        const a = (r || e.type === "number") && !/^0\d/.test(e.value) ? bs(e.value) : e.value
          , o = t ?? "";
        a !== o && (document.activeElement === e && e.type !== "range" && (s && t === n || i && e.value.trim() === o) || (e.value = o))
    }
}
  , Xu = {
    deep: !0,
    created(e, t, n) {
        e[Lt] = Hn(n),
        ut(e, "change", () => {
            const s = e._modelValue
              , i = Rf(e)
              , r = e.checked
              , l = e[Lt];
            if (k(s)) {
                const a = yr(s, i)
                  , o = a !== -1;
                if (r && !o)
                    l(s.concat(i));
                else if (!r && o) {
                    const f = [...s];
                    f.splice(a, 1),
                    l(f)
                }
            } else if (jn(s)) {
                const a = new Set(s);
                r ? a.add(i) : a.delete(i),
                l(a)
            } else
                l(Hl(e, r))
        }
        )
    },
    mounted: sr,
    beforeUpdate(e, t, n) {
        e[Lt] = Hn(n),
        sr(e, t, n)
    }
};
function sr(e, {value: t, oldValue: n}, s) {
    e._modelValue = t,
    k(t) ? e.checked = yr(t, s.props.value) > -1 : jn(t) ? e.checked = t.has(s.props.value) : t !== n && (e.checked = Un(t, Hl(e, !0)))
}
function Rf(e) {
    return "_value"in e ? e._value : e.value
}
function Hl(e, t) {
    const n = t ? "_trueValue" : "_falseValue";
    return n in e ? e[n] : t
}
const Nf = ["ctrl", "shift", "alt", "meta"]
  , Df = {
    stop: e => e.stopPropagation(),
    prevent: e => e.preventDefault(),
    self: e => e.target !== e.currentTarget,
    ctrl: e => !e.ctrlKey,
    shift: e => !e.shiftKey,
    alt: e => !e.altKey,
    meta: e => !e.metaKey,
    left: e => "button"in e && e.button !== 0,
    middle: e => "button"in e && e.button !== 1,
    right: e => "button"in e && e.button !== 2,
    exact: (e, t) => Nf.some(n => e[`${n}Key`] && !t.includes(n))
}
  , Ju = (e, t) => {
    const n = e._withMods || (e._withMods = {})
      , s = t.join(".");
    return n[s] || (n[s] = (i, ...r) => {
        for (let l = 0; l < t.length; l++) {
            const a = Df[t[l]];
            if (a && a(i, t))
                return
        }
        return e(i, ...r)
    }
    )
}
  , Vf = {
    esc: "escape",
    space: " ",
    up: "arrow-up",
    left: "arrow-left",
    right: "arrow-right",
    down: "arrow-down",
    delete: "backspace"
}
  , Zu = (e, t) => {
    const n = e._withKeys || (e._withKeys = {})
      , s = t.join(".");
    return n[s] || (n[s] = i => {
        if (!("key"in i))
            return;
        const r = rt(i.key);
        if (t.some(l => l === r || Vf[l] === r))
            return e(i)
    }
    )
}
  , $l = fe({
    patchProp: Pf
}, cf);
let Jt, ir = !1;
function jl() {
    return Jt || (Jt = La($l))
}
function zf() {
    return Jt = ir ? Jt : Ba($l),
    ir = !0,
    Jt
}
const Qu = (...e) => {
    jl().render(...e)
}
  , ed = (...e) => {
    const t = jl().createApp(...e)
      , {mount: n} = t;
    return t.mount = s => {
        const i = kl(s);
        if (!i)
            return;
        const r = t._component;
        !U(r) && !r.render && !r.template && (r.template = i.innerHTML),
        i.innerHTML = "";
        const l = n(i, !1, Gl(i));
        return i instanceof Element && (i.removeAttribute("v-cloak"),
        i.setAttribute("data-v-app", "")),
        l
    }
    ,
    t
}
  , td = (...e) => {
    const t = zf().createApp(...e)
      , {mount: n} = t;
    return t.mount = s => {
        const i = kl(s);
        if (i)
            return n(i, !0, Gl(i))
    }
    ,
    t
}
;
function Gl(e) {
    if (e instanceof SVGElement)
        return "svg";
    if (typeof MathMLElement == "function" && e instanceof MathMLElement)
        return "mathml"
}
function kl(e) {
    return re(e) ? document.querySelector(e) : e
}
function rr(e) {
    return e !== null && typeof e == "object" && "constructor"in e && e.constructor === Object
}
function di(e, t) {
    e === void 0 && (e = {}),
    t === void 0 && (t = {}),
    Object.keys(t).forEach(n => {
        typeof e[n] > "u" ? e[n] = t[n] : rr(t[n]) && rr(e[n]) && Object.keys(t[n]).length > 0 && di(e[n], t[n])
    }
    )
}
const Wl = {
    body: {},
    addEventListener() {},
    removeEventListener() {},
    activeElement: {
        blur() {},
        nodeName: ""
    },
    querySelector() {
        return null
    },
    querySelectorAll() {
        return []
    },
    getElementById() {
        return null
    },
    createEvent() {
        return {
            initEvent() {}
        }
    },
    createElement() {
        return {
            children: [],
            childNodes: [],
            style: {},
            setAttribute() {},
            getElementsByTagName() {
                return []
            }
        }
    },
    createElementNS() {
        return {}
    },
    importNode() {
        return null
    },
    location: {
        hash: "",
        host: "",
        hostname: "",
        href: "",
        origin: "",
        pathname: "",
        protocol: "",
        search: ""
    }
};
function ze() {
    const e = typeof document < "u" ? document : {};
    return di(e, Wl),
    e
}
const Hf = {
    document: Wl,
    navigator: {
        userAgent: ""
    },
    location: {
        hash: "",
        host: "",
        hostname: "",
        href: "",
        origin: "",
        pathname: "",
        protocol: "",
        search: ""
    },
    history: {
        replaceState() {},
        pushState() {},
        go() {},
        back() {}
    },
    CustomEvent: function() {
        return this
    },
    addEventListener() {},
    removeEventListener() {},
    getComputedStyle() {
        return {
            getPropertyValue() {
                return ""
            }
        }
    },
    Image() {},
    Date() {},
    screen: {},
    setTimeout() {},
    clearTimeout() {},
    matchMedia() {
        return {}
    },
    requestAnimationFrame(e) {
        return typeof setTimeout > "u" ? (e(),
        null) : setTimeout(e, 0)
    },
    cancelAnimationFrame(e) {
        typeof setTimeout > "u" || clearTimeout(e)
    }
};
function Me() {
    const e = typeof window < "u" ? window : {};
    return di(e, Hf),
    e
}
function $f(e) {
    const t = e;
    Object.keys(t).forEach(n => {
        try {
            t[n] = null
        } catch {}
        try {
            delete t[n]
        } catch {}
    }
    )
}
function Ds(e, t) {
    return t === void 0 && (t = 0),
    setTimeout(e, t)
}
function $n() {
    return Date.now()
}
function jf(e) {
    const t = Me();
    let n;
    return t.getComputedStyle && (n = t.getComputedStyle(e, null)),
    !n && e.currentStyle && (n = e.currentStyle),
    n || (n = e.style),
    n
}
function Gf(e, t) {
    t === void 0 && (t = "x");
    const n = Me();
    let s, i, r;
    const l = jf(e);
    return n.WebKitCSSMatrix ? (i = l.transform || l.webkitTransform,
    i.split(",").length > 6 && (i = i.split(", ").map(a => a.replace(",", ".")).join(", ")),
    r = new n.WebKitCSSMatrix(i === "none" ? "" : i)) : (r = l.MozTransform || l.OTransform || l.MsTransform || l.msTransform || l.transform || l.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,"),
    s = r.toString().split(",")),
    t === "x" && (n.WebKitCSSMatrix ? i = r.m41 : s.length === 16 ? i = parseFloat(s[12]) : i = parseFloat(s[4])),
    t === "y" && (n.WebKitCSSMatrix ? i = r.m42 : s.length === 16 ? i = parseFloat(s[13]) : i = parseFloat(s[5])),
    i || 0
}
function En(e) {
    return typeof e == "object" && e !== null && e.constructor && Object.prototype.toString.call(e).slice(8, -1) === "Object"
}
function kf(e) {
    return typeof window < "u" && typeof window.HTMLElement < "u" ? e instanceof HTMLElement : e && (e.nodeType === 1 || e.nodeType === 11)
}
function _e() {
    const e = Object(arguments.length <= 0 ? void 0 : arguments[0])
      , t = ["__proto__", "constructor", "prototype"];
    for (let n = 1; n < arguments.length; n += 1) {
        const s = n < 0 || arguments.length <= n ? void 0 : arguments[n];
        if (s != null && !kf(s)) {
            const i = Object.keys(Object(s)).filter(r => t.indexOf(r) < 0);
            for (let r = 0, l = i.length; r < l; r += 1) {
                const a = i[r]
                  , o = Object.getOwnPropertyDescriptor(s, a);
                o !== void 0 && o.enumerable && (En(e[a]) && En(s[a]) ? s[a].__swiper__ ? e[a] = s[a] : _e(e[a], s[a]) : !En(e[a]) && En(s[a]) ? (e[a] = {},
                s[a].__swiper__ ? e[a] = s[a] : _e(e[a], s[a])) : e[a] = s[a])
            }
        }
    }
    return e
}
function _n(e, t, n) {
    e.style.setProperty(t, n)
}
function Kl(e) {
    let {swiper: t, targetPosition: n, side: s} = e;
    const i = Me()
      , r = -t.translate;
    let l = null, a;
    const o = t.params.speed;
    t.wrapperEl.style.scrollSnapType = "none",
    i.cancelAnimationFrame(t.cssModeFrameID);
    const f = n > r ? "next" : "prev"
      , c = (h, p) => f === "next" && h >= p || f === "prev" && h <= p
      , u = () => {
        a = new Date().getTime(),
        l === null && (l = a);
        const h = Math.max(Math.min((a - l) / o, 1), 0)
          , p = .5 - Math.cos(h * Math.PI) / 2;
        let w = r + p * (n - r);
        if (c(w, n) && (w = n),
        t.wrapperEl.scrollTo({
            [s]: w
        }),
        c(w, n)) {
            t.wrapperEl.style.overflow = "hidden",
            t.wrapperEl.style.scrollSnapType = "",
            setTimeout( () => {
                t.wrapperEl.style.overflow = "",
                t.wrapperEl.scrollTo({
                    [s]: w
                })
            }
            ),
            i.cancelAnimationFrame(t.cssModeFrameID);
            return
        }
        t.cssModeFrameID = i.requestAnimationFrame(u)
    }
    ;
    u()
}
function Ul(e) {
    return e.querySelector(".swiper-slide-transform") || e.shadowRoot && e.shadowRoot.querySelector(".swiper-slide-transform") || e
}
function ke(e, t) {
    return t === void 0 && (t = ""),
    [...e.children].filter(n => n.matches(t))
}
function Wf(e, t) {
    t === void 0 && (t = []);
    const n = document.createElement(e);
    return n.classList.add(...Array.isArray(t) ? t : [t]),
    n
}
function Kf(e, t) {
    const n = [];
    for (; e.previousElementSibling; ) {
        const s = e.previousElementSibling;
        t ? s.matches(t) && n.push(s) : n.push(s),
        e = s
    }
    return n
}
function Uf(e, t) {
    const n = [];
    for (; e.nextElementSibling; ) {
        const s = e.nextElementSibling;
        t ? s.matches(t) && n.push(s) : n.push(s),
        e = s
    }
    return n
}
function tt(e, t) {
    return Me().getComputedStyle(e, null).getPropertyValue(t)
}
function lr(e) {
    let t = e, n;
    if (t) {
        for (n = 0; (t = t.previousSibling) !== null; )
            t.nodeType === 1 && (n += 1);
        return n
    }
}
function qf(e, t) {
    const n = [];
    let s = e.parentElement;
    for (; s; )
        n.push(s),
        s = s.parentElement;
    return n
}
function Yf(e, t) {
    function n(s) {
        s.target === e && (t.call(e, s),
        e.removeEventListener("transitionend", n))
    }
    t && e.addEventListener("transitionend", n)
}
function or(e, t, n) {
    const s = Me();
    return e[t === "width" ? "offsetWidth" : "offsetHeight"] + parseFloat(s.getComputedStyle(e, null).getPropertyValue(t === "width" ? "margin-right" : "margin-top")) + parseFloat(s.getComputedStyle(e, null).getPropertyValue(t === "width" ? "margin-left" : "margin-bottom"))
}
let ps;
function Xf() {
    const e = Me()
      , t = ze();
    return {
        smoothScroll: t.documentElement && t.documentElement.style && "scrollBehavior"in t.documentElement.style,
        touch: !!("ontouchstart"in e || e.DocumentTouch && t instanceof e.DocumentTouch)
    }
}
function ql() {
    return ps || (ps = Xf()),
    ps
}
let hs;
function Jf(e) {
    let {userAgent: t} = e === void 0 ? {} : e;
    const n = ql()
      , s = Me()
      , i = s.navigator.platform
      , r = t || s.navigator.userAgent
      , l = {
        ios: !1,
        android: !1
    }
      , a = s.screen.width
      , o = s.screen.height
      , f = r.match(/(Android);?[\s\/]+([\d.]+)?/);
    let c = r.match(/(iPad).*OS\s([\d_]+)/);
    const u = r.match(/(iPod)(.*OS\s([\d_]+))?/)
      , h = !c && r.match(/(iPhone\sOS|iOS)\s([\d_]+)/)
      , p = i === "Win32";
    let w = i === "MacIntel";
    const T = ["1024x1366", "1366x1024", "834x1194", "1194x834", "834x1112", "1112x834", "768x1024", "1024x768", "820x1180", "1180x820", "810x1080", "1080x810"];
    return !c && w && n.touch && T.indexOf(`${a}x${o}`) >= 0 && (c = r.match(/(Version)\/([\d.]+)/),
    c || (c = [0, 1, "13_0_0"]),
    w = !1),
    f && !p && (l.os = "android",
    l.android = !0),
    (c || h || u) && (l.os = "ios",
    l.ios = !0),
    l
}
function Zf(e) {
    return e === void 0 && (e = {}),
    hs || (hs = Jf(e)),
    hs
}
let gs;
function Qf() {
    const e = Me();
    let t = !1;
    function n() {
        const s = e.navigator.userAgent.toLowerCase();
        return s.indexOf("safari") >= 0 && s.indexOf("chrome") < 0 && s.indexOf("android") < 0
    }
    if (n()) {
        const s = String(e.navigator.userAgent);
        if (s.includes("Version/")) {
            const [i,r] = s.split("Version/")[1].split(" ")[0].split(".").map(l => Number(l));
            t = i < 16 || i === 16 && r < 2
        }
    }
    return {
        isSafari: t || n(),
        needPerspectiveFix: t,
        isWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(e.navigator.userAgent)
    }
}
function ec() {
    return gs || (gs = Qf()),
    gs
}
function tc(e) {
    let {swiper: t, on: n, emit: s} = e;
    const i = Me();
    let r = null
      , l = null;
    const a = () => {
        !t || t.destroyed || !t.initialized || (s("beforeResize"),
        s("resize"))
    }
      , o = () => {
        !t || t.destroyed || !t.initialized || (r = new ResizeObserver(u => {
            l = i.requestAnimationFrame( () => {
                const {width: h, height: p} = t;
                let w = h
                  , T = p;
                u.forEach(I => {
                    let {contentBoxSize: C, contentRect: S, target: d} = I;
                    d && d !== t.el || (w = S ? S.width : (C[0] || C).inlineSize,
                    T = S ? S.height : (C[0] || C).blockSize)
                }
                ),
                (w !== h || T !== p) && a()
            }
            )
        }
        ),
        r.observe(t.el))
    }
      , f = () => {
        l && i.cancelAnimationFrame(l),
        r && r.unobserve && t.el && (r.unobserve(t.el),
        r = null)
    }
      , c = () => {
        !t || t.destroyed || !t.initialized || s("orientationchange")
    }
    ;
    n("init", () => {
        if (t.params.resizeObserver && typeof i.ResizeObserver < "u") {
            o();
            return
        }
        i.addEventListener("resize", a),
        i.addEventListener("orientationchange", c)
    }
    ),
    n("destroy", () => {
        f(),
        i.removeEventListener("resize", a),
        i.removeEventListener("orientationchange", c)
    }
    )
}
function nc(e) {
    let {swiper: t, extendParams: n, on: s, emit: i} = e;
    const r = []
      , l = Me()
      , a = function(c, u) {
        u === void 0 && (u = {});
        const h = l.MutationObserver || l.WebkitMutationObserver
          , p = new h(w => {
            if (t.__preventObserver__)
                return;
            if (w.length === 1) {
                i("observerUpdate", w[0]);
                return
            }
            const T = function() {
                i("observerUpdate", w[0])
            };
            l.requestAnimationFrame ? l.requestAnimationFrame(T) : l.setTimeout(T, 0)
        }
        );
        p.observe(c, {
            attributes: typeof u.attributes > "u" ? !0 : u.attributes,
            childList: typeof u.childList > "u" ? !0 : u.childList,
            characterData: typeof u.characterData > "u" ? !0 : u.characterData
        }),
        r.push(p)
    }
      , o = () => {
        if (t.params.observer) {
            if (t.params.observeParents) {
                const c = qf(t.hostEl);
                for (let u = 0; u < c.length; u += 1)
                    a(c[u])
            }
            a(t.hostEl, {
                childList: t.params.observeSlideChildren
            }),
            a(t.wrapperEl, {
                attributes: !1
            })
        }
    }
      , f = () => {
        r.forEach(c => {
            c.disconnect()
        }
        ),
        r.splice(0, r.length)
    }
    ;
    n({
        observer: !1,
        observeParents: !1,
        observeSlideChildren: !1
    }),
    s("init", o),
    s("destroy", f)
}
var sc = {
    on(e, t, n) {
        const s = this;
        if (!s.eventsListeners || s.destroyed || typeof t != "function")
            return s;
        const i = n ? "unshift" : "push";
        return e.split(" ").forEach(r => {
            s.eventsListeners[r] || (s.eventsListeners[r] = []),
            s.eventsListeners[r][i](t)
        }
        ),
        s
    },
    once(e, t, n) {
        const s = this;
        if (!s.eventsListeners || s.destroyed || typeof t != "function")
            return s;
        function i() {
            s.off(e, i),
            i.__emitterProxy && delete i.__emitterProxy;
            for (var r = arguments.length, l = new Array(r), a = 0; a < r; a++)
                l[a] = arguments[a];
            t.apply(s, l)
        }
        return i.__emitterProxy = t,
        s.on(e, i, n)
    },
    onAny(e, t) {
        const n = this;
        if (!n.eventsListeners || n.destroyed || typeof e != "function")
            return n;
        const s = t ? "unshift" : "push";
        return n.eventsAnyListeners.indexOf(e) < 0 && n.eventsAnyListeners[s](e),
        n
    },
    offAny(e) {
        const t = this;
        if (!t.eventsListeners || t.destroyed || !t.eventsAnyListeners)
            return t;
        const n = t.eventsAnyListeners.indexOf(e);
        return n >= 0 && t.eventsAnyListeners.splice(n, 1),
        t
    },
    off(e, t) {
        const n = this;
        return !n.eventsListeners || n.destroyed || !n.eventsListeners || e.split(" ").forEach(s => {
            typeof t > "u" ? n.eventsListeners[s] = [] : n.eventsListeners[s] && n.eventsListeners[s].forEach( (i, r) => {
                (i === t || i.__emitterProxy && i.__emitterProxy === t) && n.eventsListeners[s].splice(r, 1)
            }
            )
        }
        ),
        n
    },
    emit() {
        const e = this;
        if (!e.eventsListeners || e.destroyed || !e.eventsListeners)
            return e;
        let t, n, s;
        for (var i = arguments.length, r = new Array(i), l = 0; l < i; l++)
            r[l] = arguments[l];
        return typeof r[0] == "string" || Array.isArray(r[0]) ? (t = r[0],
        n = r.slice(1, r.length),
        s = e) : (t = r[0].events,
        n = r[0].data,
        s = r[0].context || e),
        n.unshift(s),
        (Array.isArray(t) ? t : t.split(" ")).forEach(o => {
            e.eventsAnyListeners && e.eventsAnyListeners.length && e.eventsAnyListeners.forEach(f => {
                f.apply(s, [o, ...n])
            }
            ),
            e.eventsListeners && e.eventsListeners[o] && e.eventsListeners[o].forEach(f => {
                f.apply(s, n)
            }
            )
        }
        ),
        e
    }
};
function ic() {
    const e = this;
    let t, n;
    const s = e.el;
    typeof e.params.width < "u" && e.params.width !== null ? t = e.params.width : t = s.clientWidth,
    typeof e.params.height < "u" && e.params.height !== null ? n = e.params.height : n = s.clientHeight,
    !(t === 0 && e.isHorizontal() || n === 0 && e.isVertical()) && (t = t - parseInt(tt(s, "padding-left") || 0, 10) - parseInt(tt(s, "padding-right") || 0, 10),
    n = n - parseInt(tt(s, "padding-top") || 0, 10) - parseInt(tt(s, "padding-bottom") || 0, 10),
    Number.isNaN(t) && (t = 0),
    Number.isNaN(n) && (n = 0),
    Object.assign(e, {
        width: t,
        height: n,
        size: e.isHorizontal() ? t : n
    }))
}
function rc() {
    const e = this;
    function t(M) {
        return e.isHorizontal() ? M : {
            width: "height",
            "margin-top": "margin-left",
            "margin-bottom ": "margin-right",
            "margin-left": "margin-top",
            "margin-right": "margin-bottom",
            "padding-left": "padding-top",
            "padding-right": "padding-bottom",
            marginRight: "marginBottom"
        }[M]
    }
    function n(M, E) {
        return parseFloat(M.getPropertyValue(t(E)) || 0)
    }
    const s = e.params
      , {wrapperEl: i, slidesEl: r, size: l, rtlTranslate: a, wrongRTL: o} = e
      , f = e.virtual && s.virtual.enabled
      , c = f ? e.virtual.slides.length : e.slides.length
      , u = ke(r, `.${e.params.slideClass}, swiper-slide`)
      , h = f ? e.virtual.slides.length : u.length;
    let p = [];
    const w = []
      , T = [];
    let I = s.slidesOffsetBefore;
    typeof I == "function" && (I = s.slidesOffsetBefore.call(e));
    let C = s.slidesOffsetAfter;
    typeof C == "function" && (C = s.slidesOffsetAfter.call(e));
    const S = e.snapGrid.length
      , d = e.slidesGrid.length;
    let v = s.spaceBetween
      , b = -I
      , x = 0
      , P = 0;
    if (typeof l > "u")
        return;
    typeof v == "string" && v.indexOf("%") >= 0 ? v = parseFloat(v.replace("%", "")) / 100 * l : typeof v == "string" && (v = parseFloat(v)),
    e.virtualSize = -v,
    u.forEach(M => {
        a ? M.style.marginLeft = "" : M.style.marginRight = "",
        M.style.marginBottom = "",
        M.style.marginTop = ""
    }
    ),
    s.centeredSlides && s.cssMode && (_n(i, "--swiper-centered-offset-before", ""),
    _n(i, "--swiper-centered-offset-after", ""));
    const A = s.grid && s.grid.rows > 1 && e.grid;
    A && e.grid.initSlides(h);
    let y;
    const O = s.slidesPerView === "auto" && s.breakpoints && Object.keys(s.breakpoints).filter(M => typeof s.breakpoints[M].slidesPerView < "u").length > 0;
    for (let M = 0; M < h; M += 1) {
        y = 0;
        let E;
        if (u[M] && (E = u[M]),
        A && e.grid.updateSlide(M, E, h, t),
        !(u[M] && tt(E, "display") === "none")) {
            if (s.slidesPerView === "auto") {
                O && (u[M].style[t("width")] = "");
                const N = getComputedStyle(E)
                  , q = E.style.transform
                  , J = E.style.webkitTransform;
                if (q && (E.style.transform = "none"),
                J && (E.style.webkitTransform = "none"),
                s.roundLengths)
                    y = e.isHorizontal() ? or(E, "width") : or(E, "height");
                else {
                    const j = n(N, "width")
                      , H = n(N, "padding-left")
                      , G = n(N, "padding-right")
                      , Z = n(N, "margin-left")
                      , Se = n(N, "margin-right")
                      , Te = N.getPropertyValue("box-sizing");
                    if (Te && Te === "border-box")
                        y = j + Z + Se;
                    else {
                        const {clientWidth: Oe, offsetWidth: un} = E;
                        y = j + H + G + Z + Se + (un - Oe)
                    }
                }
                q && (E.style.transform = q),
                J && (E.style.webkitTransform = J),
                s.roundLengths && (y = Math.floor(y))
            } else
                y = (l - (s.slidesPerView - 1) * v) / s.slidesPerView,
                s.roundLengths && (y = Math.floor(y)),
                u[M] && (u[M].style[t("width")] = `${y}px`);
            u[M] && (u[M].swiperSlideSize = y),
            T.push(y),
            s.centeredSlides ? (b = b + y / 2 + x / 2 + v,
            x === 0 && M !== 0 && (b = b - l / 2 - v),
            M === 0 && (b = b - l / 2 - v),
            Math.abs(b) < 1 / 1e3 && (b = 0),
            s.roundLengths && (b = Math.floor(b)),
            P % s.slidesPerGroup === 0 && p.push(b),
            w.push(b)) : (s.roundLengths && (b = Math.floor(b)),
            (P - Math.min(e.params.slidesPerGroupSkip, P)) % e.params.slidesPerGroup === 0 && p.push(b),
            w.push(b),
            b = b + y + v),
            e.virtualSize += y + v,
            x = y,
            P += 1
        }
    }
    if (e.virtualSize = Math.max(e.virtualSize, l) + C,
    a && o && (s.effect === "slide" || s.effect === "coverflow") && (i.style.width = `${e.virtualSize + v}px`),
    s.setWrapperSize && (i.style[t("width")] = `${e.virtualSize + v}px`),
    A && e.grid.updateWrapperSize(y, p, t),
    !s.centeredSlides) {
        const M = [];
        for (let E = 0; E < p.length; E += 1) {
            let N = p[E];
            s.roundLengths && (N = Math.floor(N)),
            p[E] <= e.virtualSize - l && M.push(N)
        }
        p = M,
        Math.floor(e.virtualSize - l) - Math.floor(p[p.length - 1]) > 1 && p.push(e.virtualSize - l)
    }
    if (f && s.loop) {
        const M = T[0] + v;
        if (s.slidesPerGroup > 1) {
            const E = Math.ceil((e.virtual.slidesBefore + e.virtual.slidesAfter) / s.slidesPerGroup)
              , N = M * s.slidesPerGroup;
            for (let q = 0; q < E; q += 1)
                p.push(p[p.length - 1] + N)
        }
        for (let E = 0; E < e.virtual.slidesBefore + e.virtual.slidesAfter; E += 1)
            s.slidesPerGroup === 1 && p.push(p[p.length - 1] + M),
            w.push(w[w.length - 1] + M),
            e.virtualSize += M
    }
    if (p.length === 0 && (p = [0]),
    v !== 0) {
        const M = e.isHorizontal() && a ? "marginLeft" : t("marginRight");
        u.filter( (E, N) => !s.cssMode || s.loop ? !0 : N !== u.length - 1).forEach(E => {
            E.style[M] = `${v}px`
        }
        )
    }
    if (s.centeredSlides && s.centeredSlidesBounds) {
        let M = 0;
        T.forEach(N => {
            M += N + (v || 0)
        }
        ),
        M -= v;
        const E = M - l;
        p = p.map(N => N <= 0 ? -I : N > E ? E + C : N)
    }
    if (s.centerInsufficientSlides) {
        let M = 0;
        if (T.forEach(E => {
            M += E + (v || 0)
        }
        ),
        M -= v,
        M < l) {
            const E = (l - M) / 2;
            p.forEach( (N, q) => {
                p[q] = N - E
            }
            ),
            w.forEach( (N, q) => {
                w[q] = N + E
            }
            )
        }
    }
    if (Object.assign(e, {
        slides: u,
        snapGrid: p,
        slidesGrid: w,
        slidesSizesGrid: T
    }),
    s.centeredSlides && s.cssMode && !s.centeredSlidesBounds) {
        _n(i, "--swiper-centered-offset-before", `${-p[0]}px`),
        _n(i, "--swiper-centered-offset-after", `${e.size / 2 - T[T.length - 1] / 2}px`);
        const M = -e.snapGrid[0]
          , E = -e.slidesGrid[0];
        e.snapGrid = e.snapGrid.map(N => N + M),
        e.slidesGrid = e.slidesGrid.map(N => N + E)
    }
    if (h !== c && e.emit("slidesLengthChange"),
    p.length !== S && (e.params.watchOverflow && e.checkOverflow(),
    e.emit("snapGridLengthChange")),
    w.length !== d && e.emit("slidesGridLengthChange"),
    s.watchSlidesProgress && e.updateSlidesOffset(),
    !f && !s.cssMode && (s.effect === "slide" || s.effect === "fade")) {
        const M = `${s.containerModifierClass}backface-hidden`
          , E = e.el.classList.contains(M);
        h <= s.maxBackfaceHiddenSlides ? E || e.el.classList.add(M) : E && e.el.classList.remove(M)
    }
}
function lc(e) {
    const t = this
      , n = []
      , s = t.virtual && t.params.virtual.enabled;
    let i = 0, r;
    typeof e == "number" ? t.setTransition(e) : e === !0 && t.setTransition(t.params.speed);
    const l = a => s ? t.slides[t.getSlideIndexByData(a)] : t.slides[a];
    if (t.params.slidesPerView !== "auto" && t.params.slidesPerView > 1)
        if (t.params.centeredSlides)
            (t.visibleSlides || []).forEach(a => {
                n.push(a)
            }
            );
        else
            for (r = 0; r < Math.ceil(t.params.slidesPerView); r += 1) {
                const a = t.activeIndex + r;
                if (a > t.slides.length && !s)
                    break;
                n.push(l(a))
            }
    else
        n.push(l(t.activeIndex));
    for (r = 0; r < n.length; r += 1)
        if (typeof n[r] < "u") {
            const a = n[r].offsetHeight;
            i = a > i ? a : i
        }
    (i || i === 0) && (t.wrapperEl.style.height = `${i}px`)
}
function oc() {
    const e = this
      , t = e.slides
      , n = e.isElement ? e.isHorizontal() ? e.wrapperEl.offsetLeft : e.wrapperEl.offsetTop : 0;
    for (let s = 0; s < t.length; s += 1)
        t[s].swiperSlideOffset = (e.isHorizontal() ? t[s].offsetLeft : t[s].offsetTop) - n - e.cssOverflowAdjustment()
}
function ac(e) {
    e === void 0 && (e = this && this.translate || 0);
    const t = this
      , n = t.params
      , {slides: s, rtlTranslate: i, snapGrid: r} = t;
    if (s.length === 0)
        return;
    typeof s[0].swiperSlideOffset > "u" && t.updateSlidesOffset();
    let l = -e;
    i && (l = e),
    s.forEach(o => {
        o.classList.remove(n.slideVisibleClass)
    }
    ),
    t.visibleSlidesIndexes = [],
    t.visibleSlides = [];
    let a = n.spaceBetween;
    typeof a == "string" && a.indexOf("%") >= 0 ? a = parseFloat(a.replace("%", "")) / 100 * t.size : typeof a == "string" && (a = parseFloat(a));
    for (let o = 0; o < s.length; o += 1) {
        const f = s[o];
        let c = f.swiperSlideOffset;
        n.cssMode && n.centeredSlides && (c -= s[0].swiperSlideOffset);
        const u = (l + (n.centeredSlides ? t.minTranslate() : 0) - c) / (f.swiperSlideSize + a)
          , h = (l - r[0] + (n.centeredSlides ? t.minTranslate() : 0) - c) / (f.swiperSlideSize + a)
          , p = -(l - c)
          , w = p + t.slidesSizesGrid[o];
        (p >= 0 && p < t.size - 1 || w > 1 && w <= t.size || p <= 0 && w >= t.size) && (t.visibleSlides.push(f),
        t.visibleSlidesIndexes.push(o),
        s[o].classList.add(n.slideVisibleClass)),
        f.progress = i ? -u : u,
        f.originalProgress = i ? -h : h
    }
}
function fc(e) {
    const t = this;
    if (typeof e > "u") {
        const c = t.rtlTranslate ? -1 : 1;
        e = t && t.translate && t.translate * c || 0
    }
    const n = t.params
      , s = t.maxTranslate() - t.minTranslate();
    let {progress: i, isBeginning: r, isEnd: l, progressLoop: a} = t;
    const o = r
      , f = l;
    if (s === 0)
        i = 0,
        r = !0,
        l = !0;
    else {
        i = (e - t.minTranslate()) / s;
        const c = Math.abs(e - t.minTranslate()) < 1
          , u = Math.abs(e - t.maxTranslate()) < 1;
        r = c || i <= 0,
        l = u || i >= 1,
        c && (i = 0),
        u && (i = 1)
    }
    if (n.loop) {
        const c = t.getSlideIndexByData(0)
          , u = t.getSlideIndexByData(t.slides.length - 1)
          , h = t.slidesGrid[c]
          , p = t.slidesGrid[u]
          , w = t.slidesGrid[t.slidesGrid.length - 1]
          , T = Math.abs(e);
        T >= h ? a = (T - h) / w : a = (T + w - p) / w,
        a > 1 && (a -= 1)
    }
    Object.assign(t, {
        progress: i,
        progressLoop: a,
        isBeginning: r,
        isEnd: l
    }),
    (n.watchSlidesProgress || n.centeredSlides && n.autoHeight) && t.updateSlidesProgress(e),
    r && !o && t.emit("reachBeginning toEdge"),
    l && !f && t.emit("reachEnd toEdge"),
    (o && !r || f && !l) && t.emit("fromEdge"),
    t.emit("progress", i)
}
function cc() {
    const e = this
      , {slides: t, params: n, slidesEl: s, activeIndex: i} = e
      , r = e.virtual && n.virtual.enabled
      , l = o => ke(s, `.${n.slideClass}${o}, swiper-slide${o}`)[0];
    t.forEach(o => {
        o.classList.remove(n.slideActiveClass, n.slideNextClass, n.slidePrevClass)
    }
    );
    let a;
    if (r)
        if (n.loop) {
            let o = i - e.virtual.slidesBefore;
            o < 0 && (o = e.virtual.slides.length + o),
            o >= e.virtual.slides.length && (o -= e.virtual.slides.length),
            a = l(`[data-swiper-slide-index="${o}"]`)
        } else
            a = l(`[data-swiper-slide-index="${i}"]`);
    else
        a = t[i];
    if (a) {
        a.classList.add(n.slideActiveClass);
        let o = Uf(a, `.${n.slideClass}, swiper-slide`)[0];
        n.loop && !o && (o = t[0]),
        o && o.classList.add(n.slideNextClass);
        let f = Kf(a, `.${n.slideClass}, swiper-slide`)[0];
        n.loop && !f === 0 && (f = t[t.length - 1]),
        f && f.classList.add(n.slidePrevClass)
    }
    e.emitSlidesClasses()
}
const In = (e, t) => {
    if (!e || e.destroyed || !e.params)
        return;
    const n = () => e.isElement ? "swiper-slide" : `.${e.params.slideClass}`
      , s = t.closest(n());
    if (s) {
        let i = s.querySelector(`.${e.params.lazyPreloaderClass}`);
        !i && e.isElement && (s.shadowRoot ? i = s.shadowRoot.querySelector(`.${e.params.lazyPreloaderClass}`) : requestAnimationFrame( () => {
            s.shadowRoot && (i = s.shadowRoot.querySelector(`.${e.params.lazyPreloaderClass}`),
            i && i.remove())
        }
        )),
        i && i.remove()
    }
}
  , ms = (e, t) => {
    if (!e.slides[t])
        return;
    const n = e.slides[t].querySelector('[loading="lazy"]');
    n && n.removeAttribute("loading")
}
  , Vs = e => {
    if (!e || e.destroyed || !e.params)
        return;
    let t = e.params.lazyPreloadPrevNext;
    const n = e.slides.length;
    if (!n || !t || t < 0)
        return;
    t = Math.min(t, n);
    const s = e.params.slidesPerView === "auto" ? e.slidesPerViewDynamic() : Math.ceil(e.params.slidesPerView)
      , i = e.activeIndex;
    if (e.params.grid && e.params.grid.rows > 1) {
        const l = i
          , a = [l - t];
        a.push(...Array.from({
            length: t
        }).map( (o, f) => l + s + f)),
        e.slides.forEach( (o, f) => {
            a.includes(o.column) && ms(e, f)
        }
        );
        return
    }
    const r = i + s - 1;
    if (e.params.rewind || e.params.loop)
        for (let l = i - t; l <= r + t; l += 1) {
            const a = (l % n + n) % n;
            (a < i || a > r) && ms(e, a)
        }
    else
        for (let l = Math.max(i - t, 0); l <= Math.min(r + t, n - 1); l += 1)
            l !== i && (l > r || l < i) && ms(e, l)
}
;
function uc(e) {
    const {slidesGrid: t, params: n} = e
      , s = e.rtlTranslate ? e.translate : -e.translate;
    let i;
    for (let r = 0; r < t.length; r += 1)
        typeof t[r + 1] < "u" ? s >= t[r] && s < t[r + 1] - (t[r + 1] - t[r]) / 2 ? i = r : s >= t[r] && s < t[r + 1] && (i = r + 1) : s >= t[r] && (i = r);
    return n.normalizeSlideIndex && (i < 0 || typeof i > "u") && (i = 0),
    i
}
function dc(e) {
    const t = this
      , n = t.rtlTranslate ? t.translate : -t.translate
      , {snapGrid: s, params: i, activeIndex: r, realIndex: l, snapIndex: a} = t;
    let o = e, f;
    const c = h => {
        let p = h - t.virtual.slidesBefore;
        return p < 0 && (p = t.virtual.slides.length + p),
        p >= t.virtual.slides.length && (p -= t.virtual.slides.length),
        p
    }
    ;
    if (typeof o > "u" && (o = uc(t)),
    s.indexOf(n) >= 0)
        f = s.indexOf(n);
    else {
        const h = Math.min(i.slidesPerGroupSkip, o);
        f = h + Math.floor((o - h) / i.slidesPerGroup)
    }
    if (f >= s.length && (f = s.length - 1),
    o === r) {
        f !== a && (t.snapIndex = f,
        t.emit("snapIndexChange")),
        t.params.loop && t.virtual && t.params.virtual.enabled && (t.realIndex = c(o));
        return
    }
    let u;
    t.virtual && i.virtual.enabled && i.loop ? u = c(o) : t.slides[o] ? u = parseInt(t.slides[o].getAttribute("data-swiper-slide-index") || o, 10) : u = o,
    Object.assign(t, {
        previousSnapIndex: a,
        snapIndex: f,
        previousRealIndex: l,
        realIndex: u,
        previousIndex: r,
        activeIndex: o
    }),
    t.initialized && Vs(t),
    t.emit("activeIndexChange"),
    t.emit("snapIndexChange"),
    (t.initialized || t.params.runCallbacksOnInit) && (l !== u && t.emit("realIndexChange"),
    t.emit("slideChange"))
}
function pc(e, t) {
    const n = this
      , s = n.params;
    let i = e.closest(`.${s.slideClass}, swiper-slide`);
    !i && n.isElement && t && t.length > 1 && t.includes(e) && [...t.slice(t.indexOf(e) + 1, t.length)].forEach(a => {
        !i && a.matches && a.matches(`.${s.slideClass}, swiper-slide`) && (i = a)
    }
    );
    let r = !1, l;
    if (i) {
        for (let a = 0; a < n.slides.length; a += 1)
            if (n.slides[a] === i) {
                r = !0,
                l = a;
                break
            }
    }
    if (i && r)
        n.clickedSlide = i,
        n.virtual && n.params.virtual.enabled ? n.clickedIndex = parseInt(i.getAttribute("data-swiper-slide-index"), 10) : n.clickedIndex = l;
    else {
        n.clickedSlide = void 0,
        n.clickedIndex = void 0;
        return
    }
    s.slideToClickedSlide && n.clickedIndex !== void 0 && n.clickedIndex !== n.activeIndex && n.slideToClickedSlide()
}
var hc = {
    updateSize: ic,
    updateSlides: rc,
    updateAutoHeight: lc,
    updateSlidesOffset: oc,
    updateSlidesProgress: ac,
    updateProgress: fc,
    updateSlidesClasses: cc,
    updateActiveIndex: dc,
    updateClickedSlide: pc
};
function gc(e) {
    e === void 0 && (e = this.isHorizontal() ? "x" : "y");
    const t = this
      , {params: n, rtlTranslate: s, translate: i, wrapperEl: r} = t;
    if (n.virtualTranslate)
        return s ? -i : i;
    if (n.cssMode)
        return i;
    let l = Gf(r, e);
    return l += t.cssOverflowAdjustment(),
    s && (l = -l),
    l || 0
}
function mc(e, t) {
    const n = this
      , {rtlTranslate: s, params: i, wrapperEl: r, progress: l} = n;
    let a = 0
      , o = 0;
    const f = 0;
    n.isHorizontal() ? a = s ? -e : e : o = e,
    i.roundLengths && (a = Math.floor(a),
    o = Math.floor(o)),
    n.previousTranslate = n.translate,
    n.translate = n.isHorizontal() ? a : o,
    i.cssMode ? r[n.isHorizontal() ? "scrollLeft" : "scrollTop"] = n.isHorizontal() ? -a : -o : i.virtualTranslate || (n.isHorizontal() ? a -= n.cssOverflowAdjustment() : o -= n.cssOverflowAdjustment(),
    r.style.transform = `translate3d(${a}px, ${o}px, ${f}px)`);
    let c;
    const u = n.maxTranslate() - n.minTranslate();
    u === 0 ? c = 0 : c = (e - n.minTranslate()) / u,
    c !== l && n.updateProgress(e),
    n.emit("setTranslate", n.translate, t)
}
function vc() {
    return -this.snapGrid[0]
}
function yc() {
    return -this.snapGrid[this.snapGrid.length - 1]
}
function wc(e, t, n, s, i) {
    e === void 0 && (e = 0),
    t === void 0 && (t = this.params.speed),
    n === void 0 && (n = !0),
    s === void 0 && (s = !0);
    const r = this
      , {params: l, wrapperEl: a} = r;
    if (r.animating && l.preventInteractionOnTransition)
        return !1;
    const o = r.minTranslate()
      , f = r.maxTranslate();
    let c;
    if (s && e > o ? c = o : s && e < f ? c = f : c = e,
    r.updateProgress(c),
    l.cssMode) {
        const u = r.isHorizontal();
        if (t === 0)
            a[u ? "scrollLeft" : "scrollTop"] = -c;
        else {
            if (!r.support.smoothScroll)
                return Kl({
                    swiper: r,
                    targetPosition: -c,
                    side: u ? "left" : "top"
                }),
                !0;
            a.scrollTo({
                [u ? "left" : "top"]: -c,
                behavior: "smooth"
            })
        }
        return !0
    }
    return t === 0 ? (r.setTransition(0),
    r.setTranslate(c),
    n && (r.emit("beforeTransitionStart", t, i),
    r.emit("transitionEnd"))) : (r.setTransition(t),
    r.setTranslate(c),
    n && (r.emit("beforeTransitionStart", t, i),
    r.emit("transitionStart")),
    r.animating || (r.animating = !0,
    r.onTranslateToWrapperTransitionEnd || (r.onTranslateToWrapperTransitionEnd = function(h) {
        !r || r.destroyed || h.target === this && (r.wrapperEl.removeEventListener("transitionend", r.onTranslateToWrapperTransitionEnd),
        r.onTranslateToWrapperTransitionEnd = null,
        delete r.onTranslateToWrapperTransitionEnd,
        n && r.emit("transitionEnd"))
    }
    ),
    r.wrapperEl.addEventListener("transitionend", r.onTranslateToWrapperTransitionEnd))),
    !0
}
var bc = {
    getTranslate: gc,
    setTranslate: mc,
    minTranslate: vc,
    maxTranslate: yc,
    translateTo: wc
};
function Sc(e, t) {
    const n = this;
    n.params.cssMode || (n.wrapperEl.style.transitionDuration = `${e}ms`,
    n.wrapperEl.style.transitionDelay = e === 0 ? "0ms" : ""),
    n.emit("setTransition", e, t)
}
function Yl(e) {
    let {swiper: t, runCallbacks: n, direction: s, step: i} = e;
    const {activeIndex: r, previousIndex: l} = t;
    let a = s;
    if (a || (r > l ? a = "next" : r < l ? a = "prev" : a = "reset"),
    t.emit(`transition${i}`),
    n && r !== l) {
        if (a === "reset") {
            t.emit(`slideResetTransition${i}`);
            return
        }
        t.emit(`slideChangeTransition${i}`),
        a === "next" ? t.emit(`slideNextTransition${i}`) : t.emit(`slidePrevTransition${i}`)
    }
}
function Tc(e, t) {
    e === void 0 && (e = !0);
    const n = this
      , {params: s} = n;
    s.cssMode || (s.autoHeight && n.updateAutoHeight(),
    Yl({
        swiper: n,
        runCallbacks: e,
        direction: t,
        step: "Start"
    }))
}
function xc(e, t) {
    e === void 0 && (e = !0);
    const n = this
      , {params: s} = n;
    n.animating = !1,
    !s.cssMode && (n.setTransition(0),
    Yl({
        swiper: n,
        runCallbacks: e,
        direction: t,
        step: "End"
    }))
}
var Ec = {
    setTransition: Sc,
    transitionStart: Tc,
    transitionEnd: xc
};
function _c(e, t, n, s, i) {
    e === void 0 && (e = 0),
    t === void 0 && (t = this.params.speed),
    n === void 0 && (n = !0),
    typeof e == "string" && (e = parseInt(e, 10));
    const r = this;
    let l = e;
    l < 0 && (l = 0);
    const {params: a, snapGrid: o, slidesGrid: f, previousIndex: c, activeIndex: u, rtlTranslate: h, wrapperEl: p, enabled: w} = r;
    if (r.animating && a.preventInteractionOnTransition || !w && !s && !i)
        return !1;
    const T = Math.min(r.params.slidesPerGroupSkip, l);
    let I = T + Math.floor((l - T) / r.params.slidesPerGroup);
    I >= o.length && (I = o.length - 1);
    const C = -o[I];
    if (a.normalizeSlideIndex)
        for (let d = 0; d < f.length; d += 1) {
            const v = -Math.floor(C * 100)
              , b = Math.floor(f[d] * 100)
              , x = Math.floor(f[d + 1] * 100);
            typeof f[d + 1] < "u" ? v >= b && v < x - (x - b) / 2 ? l = d : v >= b && v < x && (l = d + 1) : v >= b && (l = d)
        }
    if (r.initialized && l !== u && (!r.allowSlideNext && (h ? C > r.translate && C > r.minTranslate() : C < r.translate && C < r.minTranslate()) || !r.allowSlidePrev && C > r.translate && C > r.maxTranslate() && (u || 0) !== l))
        return !1;
    l !== (c || 0) && n && r.emit("beforeSlideChangeStart"),
    r.updateProgress(C);
    let S;
    if (l > u ? S = "next" : l < u ? S = "prev" : S = "reset",
    h && -C === r.translate || !h && C === r.translate)
        return r.updateActiveIndex(l),
        a.autoHeight && r.updateAutoHeight(),
        r.updateSlidesClasses(),
        a.effect !== "slide" && r.setTranslate(C),
        S !== "reset" && (r.transitionStart(n, S),
        r.transitionEnd(n, S)),
        !1;
    if (a.cssMode) {
        const d = r.isHorizontal()
          , v = h ? C : -C;
        if (t === 0) {
            const b = r.virtual && r.params.virtual.enabled;
            b && (r.wrapperEl.style.scrollSnapType = "none",
            r._immediateVirtual = !0),
            b && !r._cssModeVirtualInitialSet && r.params.initialSlide > 0 ? (r._cssModeVirtualInitialSet = !0,
            requestAnimationFrame( () => {
                p[d ? "scrollLeft" : "scrollTop"] = v
            }
            )) : p[d ? "scrollLeft" : "scrollTop"] = v,
            b && requestAnimationFrame( () => {
                r.wrapperEl.style.scrollSnapType = "",
                r._immediateVirtual = !1
            }
            )
        } else {
            if (!r.support.smoothScroll)
                return Kl({
                    swiper: r,
                    targetPosition: v,
                    side: d ? "left" : "top"
                }),
                !0;
            p.scrollTo({
                [d ? "left" : "top"]: v,
                behavior: "smooth"
            })
        }
        return !0
    }
    return r.setTransition(t),
    r.setTranslate(C),
    r.updateActiveIndex(l),
    r.updateSlidesClasses(),
    r.emit("beforeTransitionStart", t, s),
    r.transitionStart(n, S),
    t === 0 ? r.transitionEnd(n, S) : r.animating || (r.animating = !0,
    r.onSlideToWrapperTransitionEnd || (r.onSlideToWrapperTransitionEnd = function(v) {
        !r || r.destroyed || v.target === this && (r.wrapperEl.removeEventListener("transitionend", r.onSlideToWrapperTransitionEnd),
        r.onSlideToWrapperTransitionEnd = null,
        delete r.onSlideToWrapperTransitionEnd,
        r.transitionEnd(n, S))
    }
    ),
    r.wrapperEl.addEventListener("transitionend", r.onSlideToWrapperTransitionEnd)),
    !0
}
function Cc(e, t, n, s) {
    e === void 0 && (e = 0),
    t === void 0 && (t = this.params.speed),
    n === void 0 && (n = !0),
    typeof e == "string" && (e = parseInt(e, 10));
    const i = this;
    let r = e;
    return i.params.loop && (i.virtual && i.params.virtual.enabled ? r = r + i.virtual.slidesBefore : r = i.getSlideIndexByData(r)),
    i.slideTo(r, t, n, s)
}
function Pc(e, t, n) {
    e === void 0 && (e = this.params.speed),
    t === void 0 && (t = !0);
    const s = this
      , {enabled: i, params: r, animating: l} = s;
    if (!i)
        return s;
    let a = r.slidesPerGroup;
    r.slidesPerView === "auto" && r.slidesPerGroup === 1 && r.slidesPerGroupAuto && (a = Math.max(s.slidesPerViewDynamic("current", !0), 1));
    const o = s.activeIndex < r.slidesPerGroupSkip ? 1 : a
      , f = s.virtual && r.virtual.enabled;
    if (r.loop) {
        if (l && !f && r.loopPreventsSliding)
            return !1;
        if (s.loopFix({
            direction: "next"
        }),
        s._clientLeft = s.wrapperEl.clientLeft,
        s.activeIndex === s.slides.length - 1 && r.cssMode)
            return requestAnimationFrame( () => {
                s.slideTo(s.activeIndex + o, e, t, n)
            }
            ),
            !0
    }
    return r.rewind && s.isEnd ? s.slideTo(0, e, t, n) : s.slideTo(s.activeIndex + o, e, t, n)
}
function Mc(e, t, n) {
    e === void 0 && (e = this.params.speed),
    t === void 0 && (t = !0);
    const s = this
      , {params: i, snapGrid: r, slidesGrid: l, rtlTranslate: a, enabled: o, animating: f} = s;
    if (!o)
        return s;
    const c = s.virtual && i.virtual.enabled;
    if (i.loop) {
        if (f && !c && i.loopPreventsSliding)
            return !1;
        s.loopFix({
            direction: "prev"
        }),
        s._clientLeft = s.wrapperEl.clientLeft
    }
    const u = a ? s.translate : -s.translate;
    function h(C) {
        return C < 0 ? -Math.floor(Math.abs(C)) : Math.floor(C)
    }
    const p = h(u)
      , w = r.map(C => h(C));
    let T = r[w.indexOf(p) - 1];
    if (typeof T > "u" && i.cssMode) {
        let C;
        r.forEach( (S, d) => {
            p >= S && (C = d)
        }
        ),
        typeof C < "u" && (T = r[C > 0 ? C - 1 : C])
    }
    let I = 0;
    if (typeof T < "u" && (I = l.indexOf(T),
    I < 0 && (I = s.activeIndex - 1),
    i.slidesPerView === "auto" && i.slidesPerGroup === 1 && i.slidesPerGroupAuto && (I = I - s.slidesPerViewDynamic("previous", !0) + 1,
    I = Math.max(I, 0))),
    i.rewind && s.isBeginning) {
        const C = s.params.virtual && s.params.virtual.enabled && s.virtual ? s.virtual.slides.length - 1 : s.slides.length - 1;
        return s.slideTo(C, e, t, n)
    } else if (i.loop && s.activeIndex === 0 && i.cssMode)
        return requestAnimationFrame( () => {
            s.slideTo(I, e, t, n)
        }
        ),
        !0;
    return s.slideTo(I, e, t, n)
}
function Oc(e, t, n) {
    e === void 0 && (e = this.params.speed),
    t === void 0 && (t = !0);
    const s = this;
    return s.slideTo(s.activeIndex, e, t, n)
}
function Ic(e, t, n, s) {
    e === void 0 && (e = this.params.speed),
    t === void 0 && (t = !0),
    s === void 0 && (s = .5);
    const i = this;
    let r = i.activeIndex;
    const l = Math.min(i.params.slidesPerGroupSkip, r)
      , a = l + Math.floor((r - l) / i.params.slidesPerGroup)
      , o = i.rtlTranslate ? i.translate : -i.translate;
    if (o >= i.snapGrid[a]) {
        const f = i.snapGrid[a]
          , c = i.snapGrid[a + 1];
        o - f > (c - f) * s && (r += i.params.slidesPerGroup)
    } else {
        const f = i.snapGrid[a - 1]
          , c = i.snapGrid[a];
        o - f <= (c - f) * s && (r -= i.params.slidesPerGroup)
    }
    return r = Math.max(r, 0),
    r = Math.min(r, i.slidesGrid.length - 1),
    i.slideTo(r, e, t, n)
}
function Ac() {
    const e = this
      , {params: t, slidesEl: n} = e
      , s = t.slidesPerView === "auto" ? e.slidesPerViewDynamic() : t.slidesPerView;
    let i = e.clickedIndex, r;
    const l = e.isElement ? "swiper-slide" : `.${t.slideClass}`;
    if (t.loop) {
        if (e.animating)
            return;
        r = parseInt(e.clickedSlide.getAttribute("data-swiper-slide-index"), 10),
        t.centeredSlides ? i < e.loopedSlides - s / 2 || i > e.slides.length - e.loopedSlides + s / 2 ? (e.loopFix(),
        i = e.getSlideIndex(ke(n, `${l}[data-swiper-slide-index="${r}"]`)[0]),
        Ds( () => {
            e.slideTo(i)
        }
        )) : e.slideTo(i) : i > e.slides.length - s ? (e.loopFix(),
        i = e.getSlideIndex(ke(n, `${l}[data-swiper-slide-index="${r}"]`)[0]),
        Ds( () => {
            e.slideTo(i)
        }
        )) : e.slideTo(i)
    } else
        e.slideTo(i)
}
var Lc = {
    slideTo: _c,
    slideToLoop: Cc,
    slideNext: Pc,
    slidePrev: Mc,
    slideReset: Oc,
    slideToClosest: Ic,
    slideToClickedSlide: Ac
};
function Bc(e) {
    const t = this
      , {params: n, slidesEl: s} = t;
    if (!n.loop || t.virtual && t.params.virtual.enabled)
        return;
    ke(s, `.${n.slideClass}, swiper-slide`).forEach( (r, l) => {
        r.setAttribute("data-swiper-slide-index", l)
    }
    ),
    t.loopFix({
        slideRealIndex: e,
        direction: n.centeredSlides ? void 0 : "next"
    })
}
function Fc(e) {
    let {slideRealIndex: t, slideTo: n=!0, direction: s, setTranslate: i, activeSlideIndex: r, byController: l, byMousewheel: a} = e === void 0 ? {} : e;
    const o = this;
    if (!o.params.loop)
        return;
    o.emit("beforeLoopFix");
    const {slides: f, allowSlidePrev: c, allowSlideNext: u, slidesEl: h, params: p} = o;
    if (o.allowSlidePrev = !0,
    o.allowSlideNext = !0,
    o.virtual && p.virtual.enabled) {
        n && (!p.centeredSlides && o.snapIndex === 0 ? o.slideTo(o.virtual.slides.length, 0, !1, !0) : p.centeredSlides && o.snapIndex < p.slidesPerView ? o.slideTo(o.virtual.slides.length + o.snapIndex, 0, !1, !0) : o.snapIndex === o.snapGrid.length - 1 && o.slideTo(o.virtual.slidesBefore, 0, !1, !0)),
        o.allowSlidePrev = c,
        o.allowSlideNext = u,
        o.emit("loopFix");
        return
    }
    const w = p.slidesPerView === "auto" ? o.slidesPerViewDynamic() : Math.ceil(parseFloat(p.slidesPerView, 10));
    let T = p.loopedSlides || w;
    T % p.slidesPerGroup !== 0 && (T += p.slidesPerGroup - T % p.slidesPerGroup),
    o.loopedSlides = T;
    const I = []
      , C = [];
    let S = o.activeIndex;
    typeof r > "u" ? r = o.getSlideIndex(o.slides.filter(P => P.classList.contains(p.slideActiveClass))[0]) : S = r;
    const d = s === "next" || !s
      , v = s === "prev" || !s;
    let b = 0
      , x = 0;
    if (r < T) {
        b = Math.max(T - r, p.slidesPerGroup);
        for (let P = 0; P < T - r; P += 1) {
            const A = P - Math.floor(P / f.length) * f.length;
            I.push(f.length - A - 1)
        }
    } else if (r > o.slides.length - T * 2) {
        x = Math.max(r - (o.slides.length - T * 2), p.slidesPerGroup);
        for (let P = 0; P < x; P += 1) {
            const A = P - Math.floor(P / f.length) * f.length;
            C.push(A)
        }
    }
    if (v && I.forEach(P => {
        o.slides[P].swiperLoopMoveDOM = !0,
        h.prepend(o.slides[P]),
        o.slides[P].swiperLoopMoveDOM = !1
    }
    ),
    d && C.forEach(P => {
        o.slides[P].swiperLoopMoveDOM = !0,
        h.append(o.slides[P]),
        o.slides[P].swiperLoopMoveDOM = !1
    }
    ),
    o.recalcSlides(),
    p.slidesPerView === "auto" && o.updateSlides(),
    p.watchSlidesProgress && o.updateSlidesOffset(),
    n) {
        if (I.length > 0 && v)
            if (typeof t > "u") {
                const P = o.slidesGrid[S]
                  , y = o.slidesGrid[S + b] - P;
                a ? o.setTranslate(o.translate - y) : (o.slideTo(S + b, 0, !1, !0),
                i && (o.touches[o.isHorizontal() ? "startX" : "startY"] += y,
                o.touchEventsData.currentTranslate = o.translate))
            } else
                i && (o.slideToLoop(t, 0, !1, !0),
                o.touchEventsData.currentTranslate = o.translate);
        else if (C.length > 0 && d)
            if (typeof t > "u") {
                const P = o.slidesGrid[S]
                  , y = o.slidesGrid[S - x] - P;
                a ? o.setTranslate(o.translate - y) : (o.slideTo(S - x, 0, !1, !0),
                i && (o.touches[o.isHorizontal() ? "startX" : "startY"] += y,
                o.touchEventsData.currentTranslate = o.translate))
            } else
                o.slideToLoop(t, 0, !1, !0)
    }
    if (o.allowSlidePrev = c,
    o.allowSlideNext = u,
    o.controller && o.controller.control && !l) {
        const P = {
            slideRealIndex: t,
            direction: s,
            setTranslate: i,
            activeSlideIndex: r,
            byController: !0
        };
        Array.isArray(o.controller.control) ? o.controller.control.forEach(A => {
            !A.destroyed && A.params.loop && A.loopFix({
                ...P,
                slideTo: A.params.slidesPerView === p.slidesPerView ? n : !1
            })
        }
        ) : o.controller.control instanceof o.constructor && o.controller.control.params.loop && o.controller.control.loopFix({
            ...P,
            slideTo: o.controller.control.params.slidesPerView === p.slidesPerView ? n : !1
        })
    }
    o.emit("loopFix")
}
function Rc() {
    const e = this
      , {params: t, slidesEl: n} = e;
    if (!t.loop || e.virtual && e.params.virtual.enabled)
        return;
    e.recalcSlides();
    const s = [];
    e.slides.forEach(i => {
        const r = typeof i.swiperSlideIndex > "u" ? i.getAttribute("data-swiper-slide-index") * 1 : i.swiperSlideIndex;
        s[r] = i
    }
    ),
    e.slides.forEach(i => {
        i.removeAttribute("data-swiper-slide-index")
    }
    ),
    s.forEach(i => {
        n.append(i)
    }
    ),
    e.recalcSlides(),
    e.slideTo(e.realIndex, 0)
}
var Nc = {
    loopCreate: Bc,
    loopFix: Fc,
    loopDestroy: Rc
};
function Dc(e) {
    const t = this;
    if (!t.params.simulateTouch || t.params.watchOverflow && t.isLocked || t.params.cssMode)
        return;
    const n = t.params.touchEventsTarget === "container" ? t.el : t.wrapperEl;
    t.isElement && (t.__preventObserver__ = !0),
    n.style.cursor = "move",
    n.style.cursor = e ? "grabbing" : "grab",
    t.isElement && requestAnimationFrame( () => {
        t.__preventObserver__ = !1
    }
    )
}
function Vc() {
    const e = this;
    e.params.watchOverflow && e.isLocked || e.params.cssMode || (e.isElement && (e.__preventObserver__ = !0),
    e[e.params.touchEventsTarget === "container" ? "el" : "wrapperEl"].style.cursor = "",
    e.isElement && requestAnimationFrame( () => {
        e.__preventObserver__ = !1
    }
    ))
}
var zc = {
    setGrabCursor: Dc,
    unsetGrabCursor: Vc
};
function Hc(e, t) {
    t === void 0 && (t = this);
    function n(s) {
        if (!s || s === ze() || s === Me())
            return null;
        s.assignedSlot && (s = s.assignedSlot);
        const i = s.closest(e);
        return !i && !s.getRootNode ? null : i || n(s.getRootNode().host)
    }
    return n(t)
}
function $c(e) {
    const t = this
      , n = ze()
      , s = Me()
      , i = t.touchEventsData;
    i.evCache.push(e);
    const {params: r, touches: l, enabled: a} = t;
    if (!a || !r.simulateTouch && e.pointerType === "mouse" || t.animating && r.preventInteractionOnTransition)
        return;
    !t.animating && r.cssMode && r.loop && t.loopFix();
    let o = e;
    o.originalEvent && (o = o.originalEvent);
    let f = o.target;
    if (r.touchEventsTarget === "wrapper" && !t.wrapperEl.contains(f) || "which"in o && o.which === 3 || "button"in o && o.button > 0 || i.isTouched && i.isMoved)
        return;
    const c = !!r.noSwipingClass && r.noSwipingClass !== ""
      , u = e.composedPath ? e.composedPath() : e.path;
    c && o.target && o.target.shadowRoot && u && (f = u[0]);
    const h = r.noSwipingSelector ? r.noSwipingSelector : `.${r.noSwipingClass}`
      , p = !!(o.target && o.target.shadowRoot);
    if (r.noSwiping && (p ? Hc(h, f) : f.closest(h))) {
        t.allowClick = !0;
        return
    }
    if (r.swipeHandler && !f.closest(r.swipeHandler))
        return;
    l.currentX = o.pageX,
    l.currentY = o.pageY;
    const w = l.currentX
      , T = l.currentY
      , I = r.edgeSwipeDetection || r.iOSEdgeSwipeDetection
      , C = r.edgeSwipeThreshold || r.iOSEdgeSwipeThreshold;
    if (I && (w <= C || w >= s.innerWidth - C))
        if (I === "prevent")
            e.preventDefault();
        else
            return;
    Object.assign(i, {
        isTouched: !0,
        isMoved: !1,
        allowTouchCallbacks: !0,
        isScrolling: void 0,
        startMoving: void 0
    }),
    l.startX = w,
    l.startY = T,
    i.touchStartTime = $n(),
    t.allowClick = !0,
    t.updateSize(),
    t.swipeDirection = void 0,
    r.threshold > 0 && (i.allowThresholdMove = !1);
    let S = !0;
    f.matches(i.focusableElements) && (S = !1,
    f.nodeName === "SELECT" && (i.isTouched = !1)),
    n.activeElement && n.activeElement.matches(i.focusableElements) && n.activeElement !== f && n.activeElement.blur();
    const d = S && t.allowTouchMove && r.touchStartPreventDefault;
    (r.touchStartForcePreventDefault || d) && !f.isContentEditable && o.preventDefault(),
    r.freeMode && r.freeMode.enabled && t.freeMode && t.animating && !r.cssMode && t.freeMode.onTouchStart(),
    t.emit("touchStart", o)
}
function jc(e) {
    const t = ze()
      , n = this
      , s = n.touchEventsData
      , {params: i, touches: r, rtlTranslate: l, enabled: a} = n;
    if (!a || !i.simulateTouch && e.pointerType === "mouse")
        return;
    let o = e;
    if (o.originalEvent && (o = o.originalEvent),
    !s.isTouched) {
        s.startMoving && s.isScrolling && n.emit("touchMoveOpposite", o);
        return
    }
    const f = s.evCache.findIndex(P => P.pointerId === o.pointerId);
    f >= 0 && (s.evCache[f] = o);
    const c = s.evCache.length > 1 ? s.evCache[0] : o
      , u = c.pageX
      , h = c.pageY;
    if (o.preventedByNestedSwiper) {
        r.startX = u,
        r.startY = h;
        return
    }
    if (!n.allowTouchMove) {
        o.target.matches(s.focusableElements) || (n.allowClick = !1),
        s.isTouched && (Object.assign(r, {
            startX: u,
            startY: h,
            prevX: n.touches.currentX,
            prevY: n.touches.currentY,
            currentX: u,
            currentY: h
        }),
        s.touchStartTime = $n());
        return
    }
    if (i.touchReleaseOnEdges && !i.loop) {
        if (n.isVertical()) {
            if (h < r.startY && n.translate <= n.maxTranslate() || h > r.startY && n.translate >= n.minTranslate()) {
                s.isTouched = !1,
                s.isMoved = !1;
                return
            }
        } else if (u < r.startX && n.translate <= n.maxTranslate() || u > r.startX && n.translate >= n.minTranslate())
            return
    }
    if (t.activeElement && o.target === t.activeElement && o.target.matches(s.focusableElements)) {
        s.isMoved = !0,
        n.allowClick = !1;
        return
    }
    if (s.allowTouchCallbacks && n.emit("touchMove", o),
    o.targetTouches && o.targetTouches.length > 1)
        return;
    r.currentX = u,
    r.currentY = h;
    const p = r.currentX - r.startX
      , w = r.currentY - r.startY;
    if (n.params.threshold && Math.sqrt(p ** 2 + w ** 2) < n.params.threshold)
        return;
    if (typeof s.isScrolling > "u") {
        let P;
        n.isHorizontal() && r.currentY === r.startY || n.isVertical() && r.currentX === r.startX ? s.isScrolling = !1 : p * p + w * w >= 25 && (P = Math.atan2(Math.abs(w), Math.abs(p)) * 180 / Math.PI,
        s.isScrolling = n.isHorizontal() ? P > i.touchAngle : 90 - P > i.touchAngle)
    }
    if (s.isScrolling && n.emit("touchMoveOpposite", o),
    typeof s.startMoving > "u" && (r.currentX !== r.startX || r.currentY !== r.startY) && (s.startMoving = !0),
    s.isScrolling || n.zoom && n.params.zoom && n.params.zoom.enabled && s.evCache.length > 1) {
        s.isTouched = !1;
        return
    }
    if (!s.startMoving)
        return;
    n.allowClick = !1,
    !i.cssMode && o.cancelable && o.preventDefault(),
    i.touchMoveStopPropagation && !i.nested && o.stopPropagation();
    let T = n.isHorizontal() ? p : w
      , I = n.isHorizontal() ? r.currentX - r.previousX : r.currentY - r.previousY;
    i.oneWayMovement && (T = Math.abs(T) * (l ? 1 : -1),
    I = Math.abs(I) * (l ? 1 : -1)),
    r.diff = T,
    T *= i.touchRatio,
    l && (T = -T,
    I = -I);
    const C = n.touchesDirection;
    n.swipeDirection = T > 0 ? "prev" : "next",
    n.touchesDirection = I > 0 ? "prev" : "next";
    const S = n.params.loop && !i.cssMode
      , d = n.swipeDirection === "next" && n.allowSlideNext || n.swipeDirection === "prev" && n.allowSlidePrev;
    if (!s.isMoved) {
        if (S && d && n.loopFix({
            direction: n.swipeDirection
        }),
        s.startTranslate = n.getTranslate(),
        n.setTransition(0),
        n.animating) {
            const P = new window.CustomEvent("transitionend",{
                bubbles: !0,
                cancelable: !0
            });
            n.wrapperEl.dispatchEvent(P)
        }
        s.allowMomentumBounce = !1,
        i.grabCursor && (n.allowSlideNext === !0 || n.allowSlidePrev === !0) && n.setGrabCursor(!0),
        n.emit("sliderFirstMove", o)
    }
    let v;
    s.isMoved && C !== n.touchesDirection && S && d && Math.abs(T) >= 1 && (n.loopFix({
        direction: n.swipeDirection,
        setTranslate: !0
    }),
    v = !0),
    n.emit("sliderMove", o),
    s.isMoved = !0,
    s.currentTranslate = T + s.startTranslate;
    let b = !0
      , x = i.resistanceRatio;
    if (i.touchReleaseOnEdges && (x = 0),
    T > 0 ? (S && d && !v && s.currentTranslate > (i.centeredSlides ? n.minTranslate() - n.size / 2 : n.minTranslate()) && n.loopFix({
        direction: "prev",
        setTranslate: !0,
        activeSlideIndex: 0
    }),
    s.currentTranslate > n.minTranslate() && (b = !1,
    i.resistance && (s.currentTranslate = n.minTranslate() - 1 + (-n.minTranslate() + s.startTranslate + T) ** x))) : T < 0 && (S && d && !v && s.currentTranslate < (i.centeredSlides ? n.maxTranslate() + n.size / 2 : n.maxTranslate()) && n.loopFix({
        direction: "next",
        setTranslate: !0,
        activeSlideIndex: n.slides.length - (i.slidesPerView === "auto" ? n.slidesPerViewDynamic() : Math.ceil(parseFloat(i.slidesPerView, 10)))
    }),
    s.currentTranslate < n.maxTranslate() && (b = !1,
    i.resistance && (s.currentTranslate = n.maxTranslate() + 1 - (n.maxTranslate() - s.startTranslate - T) ** x))),
    b && (o.preventedByNestedSwiper = !0),
    !n.allowSlideNext && n.swipeDirection === "next" && s.currentTranslate < s.startTranslate && (s.currentTranslate = s.startTranslate),
    !n.allowSlidePrev && n.swipeDirection === "prev" && s.currentTranslate > s.startTranslate && (s.currentTranslate = s.startTranslate),
    !n.allowSlidePrev && !n.allowSlideNext && (s.currentTranslate = s.startTranslate),
    i.threshold > 0)
        if (Math.abs(T) > i.threshold || s.allowThresholdMove) {
            if (!s.allowThresholdMove) {
                s.allowThresholdMove = !0,
                r.startX = r.currentX,
                r.startY = r.currentY,
                s.currentTranslate = s.startTranslate,
                r.diff = n.isHorizontal() ? r.currentX - r.startX : r.currentY - r.startY;
                return
            }
        } else {
            s.currentTranslate = s.startTranslate;
            return
        }
    !i.followFinger || i.cssMode || ((i.freeMode && i.freeMode.enabled && n.freeMode || i.watchSlidesProgress) && (n.updateActiveIndex(),
    n.updateSlidesClasses()),
    i.freeMode && i.freeMode.enabled && n.freeMode && n.freeMode.onTouchMove(),
    n.updateProgress(s.currentTranslate),
    n.setTranslate(s.currentTranslate))
}
function Gc(e) {
    const t = this
      , n = t.touchEventsData
      , s = n.evCache.findIndex(d => d.pointerId === e.pointerId);
    if (s >= 0 && n.evCache.splice(s, 1),
    ["pointercancel", "pointerout", "pointerleave", "contextmenu"].includes(e.type) && !(["pointercancel", "contextmenu"].includes(e.type) && (t.browser.isSafari || t.browser.isWebView)))
        return;
    const {params: i, touches: r, rtlTranslate: l, slidesGrid: a, enabled: o} = t;
    if (!o || !i.simulateTouch && e.pointerType === "mouse")
        return;
    let f = e;
    if (f.originalEvent && (f = f.originalEvent),
    n.allowTouchCallbacks && t.emit("touchEnd", f),
    n.allowTouchCallbacks = !1,
    !n.isTouched) {
        n.isMoved && i.grabCursor && t.setGrabCursor(!1),
        n.isMoved = !1,
        n.startMoving = !1;
        return
    }
    i.grabCursor && n.isMoved && n.isTouched && (t.allowSlideNext === !0 || t.allowSlidePrev === !0) && t.setGrabCursor(!1);
    const c = $n()
      , u = c - n.touchStartTime;
    if (t.allowClick) {
        const d = f.path || f.composedPath && f.composedPath();
        t.updateClickedSlide(d && d[0] || f.target, d),
        t.emit("tap click", f),
        u < 300 && c - n.lastClickTime < 300 && t.emit("doubleTap doubleClick", f)
    }
    if (n.lastClickTime = $n(),
    Ds( () => {
        t.destroyed || (t.allowClick = !0)
    }
    ),
    !n.isTouched || !n.isMoved || !t.swipeDirection || r.diff === 0 || n.currentTranslate === n.startTranslate) {
        n.isTouched = !1,
        n.isMoved = !1,
        n.startMoving = !1;
        return
    }
    n.isTouched = !1,
    n.isMoved = !1,
    n.startMoving = !1;
    let h;
    if (i.followFinger ? h = l ? t.translate : -t.translate : h = -n.currentTranslate,
    i.cssMode)
        return;
    if (i.freeMode && i.freeMode.enabled) {
        t.freeMode.onTouchEnd({
            currentPos: h
        });
        return
    }
    let p = 0
      , w = t.slidesSizesGrid[0];
    for (let d = 0; d < a.length; d += d < i.slidesPerGroupSkip ? 1 : i.slidesPerGroup) {
        const v = d < i.slidesPerGroupSkip - 1 ? 1 : i.slidesPerGroup;
        typeof a[d + v] < "u" ? h >= a[d] && h < a[d + v] && (p = d,
        w = a[d + v] - a[d]) : h >= a[d] && (p = d,
        w = a[a.length - 1] - a[a.length - 2])
    }
    let T = null
      , I = null;
    i.rewind && (t.isBeginning ? I = i.virtual && i.virtual.enabled && t.virtual ? t.virtual.slides.length - 1 : t.slides.length - 1 : t.isEnd && (T = 0));
    const C = (h - a[p]) / w
      , S = p < i.slidesPerGroupSkip - 1 ? 1 : i.slidesPerGroup;
    if (u > i.longSwipesMs) {
        if (!i.longSwipes) {
            t.slideTo(t.activeIndex);
            return
        }
        t.swipeDirection === "next" && (C >= i.longSwipesRatio ? t.slideTo(i.rewind && t.isEnd ? T : p + S) : t.slideTo(p)),
        t.swipeDirection === "prev" && (C > 1 - i.longSwipesRatio ? t.slideTo(p + S) : I !== null && C < 0 && Math.abs(C) > i.longSwipesRatio ? t.slideTo(I) : t.slideTo(p))
    } else {
        if (!i.shortSwipes) {
            t.slideTo(t.activeIndex);
            return
        }
        t.navigation && (f.target === t.navigation.nextEl || f.target === t.navigation.prevEl) ? f.target === t.navigation.nextEl ? t.slideTo(p + S) : t.slideTo(p) : (t.swipeDirection === "next" && t.slideTo(T !== null ? T : p + S),
        t.swipeDirection === "prev" && t.slideTo(I !== null ? I : p))
    }
}
function ar() {
    const e = this
      , {params: t, el: n} = e;
    if (n && n.offsetWidth === 0)
        return;
    t.breakpoints && e.setBreakpoint();
    const {allowSlideNext: s, allowSlidePrev: i, snapGrid: r} = e
      , l = e.virtual && e.params.virtual.enabled;
    e.allowSlideNext = !0,
    e.allowSlidePrev = !0,
    e.updateSize(),
    e.updateSlides(),
    e.updateSlidesClasses();
    const a = l && t.loop;
    (t.slidesPerView === "auto" || t.slidesPerView > 1) && e.isEnd && !e.isBeginning && !e.params.centeredSlides && !a ? e.slideTo(e.slides.length - 1, 0, !1, !0) : e.params.loop && !l ? e.slideToLoop(e.realIndex, 0, !1, !0) : e.slideTo(e.activeIndex, 0, !1, !0),
    e.autoplay && e.autoplay.running && e.autoplay.paused && (clearTimeout(e.autoplay.resizeTimeout),
    e.autoplay.resizeTimeout = setTimeout( () => {
        e.autoplay && e.autoplay.running && e.autoplay.paused && e.autoplay.resume()
    }
    , 500)),
    e.allowSlidePrev = i,
    e.allowSlideNext = s,
    e.params.watchOverflow && r !== e.snapGrid && e.checkOverflow()
}
function kc(e) {
    const t = this;
    t.enabled && (t.allowClick || (t.params.preventClicks && e.preventDefault(),
    t.params.preventClicksPropagation && t.animating && (e.stopPropagation(),
    e.stopImmediatePropagation())))
}
function Wc() {
    const e = this
      , {wrapperEl: t, rtlTranslate: n, enabled: s} = e;
    if (!s)
        return;
    e.previousTranslate = e.translate,
    e.isHorizontal() ? e.translate = -t.scrollLeft : e.translate = -t.scrollTop,
    e.translate === 0 && (e.translate = 0),
    e.updateActiveIndex(),
    e.updateSlidesClasses();
    let i;
    const r = e.maxTranslate() - e.minTranslate();
    r === 0 ? i = 0 : i = (e.translate - e.minTranslate()) / r,
    i !== e.progress && e.updateProgress(n ? -e.translate : e.translate),
    e.emit("setTranslate", e.translate, !1)
}
function Kc(e) {
    const t = this;
    In(t, e.target),
    !(t.params.cssMode || t.params.slidesPerView !== "auto" && !t.params.autoHeight) && t.update()
}
let fr = !1;
function Uc() {}
const Xl = (e, t) => {
    const n = ze()
      , {params: s, el: i, wrapperEl: r, device: l} = e
      , a = !!s.nested
      , o = t === "on" ? "addEventListener" : "removeEventListener"
      , f = t;
    i[o]("pointerdown", e.onTouchStart, {
        passive: !1
    }),
    n[o]("pointermove", e.onTouchMove, {
        passive: !1,
        capture: a
    }),
    n[o]("pointerup", e.onTouchEnd, {
        passive: !0
    }),
    n[o]("pointercancel", e.onTouchEnd, {
        passive: !0
    }),
    n[o]("pointerout", e.onTouchEnd, {
        passive: !0
    }),
    n[o]("pointerleave", e.onTouchEnd, {
        passive: !0
    }),
    n[o]("contextmenu", e.onTouchEnd, {
        passive: !0
    }),
    (s.preventClicks || s.preventClicksPropagation) && i[o]("click", e.onClick, !0),
    s.cssMode && r[o]("scroll", e.onScroll),
    s.updateOnWindowResize ? e[f](l.ios || l.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", ar, !0) : e[f]("observerUpdate", ar, !0),
    i[o]("load", e.onLoad, {
        capture: !0
    })
}
;
function qc() {
    const e = this
      , t = ze()
      , {params: n} = e;
    e.onTouchStart = $c.bind(e),
    e.onTouchMove = jc.bind(e),
    e.onTouchEnd = Gc.bind(e),
    n.cssMode && (e.onScroll = Wc.bind(e)),
    e.onClick = kc.bind(e),
    e.onLoad = Kc.bind(e),
    fr || (t.addEventListener("touchstart", Uc),
    fr = !0),
    Xl(e, "on")
}
function Yc() {
    Xl(this, "off")
}
var Xc = {
    attachEvents: qc,
    detachEvents: Yc
};
const cr = (e, t) => e.grid && t.grid && t.grid.rows > 1;
function Jc() {
    const e = this
      , {realIndex: t, initialized: n, params: s, el: i} = e
      , r = s.breakpoints;
    if (!r || r && Object.keys(r).length === 0)
        return;
    const l = e.getBreakpoint(r, e.params.breakpointsBase, e.el);
    if (!l || e.currentBreakpoint === l)
        return;
    const o = (l in r ? r[l] : void 0) || e.originalParams
      , f = cr(e, s)
      , c = cr(e, o)
      , u = s.enabled;
    f && !c ? (i.classList.remove(`${s.containerModifierClass}grid`, `${s.containerModifierClass}grid-column`),
    e.emitContainerClasses()) : !f && c && (i.classList.add(`${s.containerModifierClass}grid`),
    (o.grid.fill && o.grid.fill === "column" || !o.grid.fill && s.grid.fill === "column") && i.classList.add(`${s.containerModifierClass}grid-column`),
    e.emitContainerClasses()),
    ["navigation", "pagination", "scrollbar"].forEach(C => {
        if (typeof o[C] > "u")
            return;
        const S = s[C] && s[C].enabled
          , d = o[C] && o[C].enabled;
        S && !d && e[C].disable(),
        !S && d && e[C].enable()
    }
    );
    const h = o.direction && o.direction !== s.direction
      , p = s.loop && (o.slidesPerView !== s.slidesPerView || h)
      , w = s.loop;
    h && n && e.changeDirection(),
    _e(e.params, o);
    const T = e.params.enabled
      , I = e.params.loop;
    Object.assign(e, {
        allowTouchMove: e.params.allowTouchMove,
        allowSlideNext: e.params.allowSlideNext,
        allowSlidePrev: e.params.allowSlidePrev
    }),
    u && !T ? e.disable() : !u && T && e.enable(),
    e.currentBreakpoint = l,
    e.emit("_beforeBreakpoint", o),
    n && (p ? (e.loopDestroy(),
    e.loopCreate(t),
    e.updateSlides()) : !w && I ? (e.loopCreate(t),
    e.updateSlides()) : w && !I && e.loopDestroy()),
    e.emit("breakpoint", o)
}
function Zc(e, t, n) {
    if (t === void 0 && (t = "window"),
    !e || t === "container" && !n)
        return;
    let s = !1;
    const i = Me()
      , r = t === "window" ? i.innerHeight : n.clientHeight
      , l = Object.keys(e).map(a => {
        if (typeof a == "string" && a.indexOf("@") === 0) {
            const o = parseFloat(a.substr(1));
            return {
                value: r * o,
                point: a
            }
        }
        return {
            value: a,
            point: a
        }
    }
    );
    l.sort( (a, o) => parseInt(a.value, 10) - parseInt(o.value, 10));
    for (let a = 0; a < l.length; a += 1) {
        const {point: o, value: f} = l[a];
        t === "window" ? i.matchMedia(`(min-width: ${f}px)`).matches && (s = o) : f <= n.clientWidth && (s = o)
    }
    return s || "max"
}
var Qc = {
    setBreakpoint: Jc,
    getBreakpoint: Zc
};
function eu(e, t) {
    const n = [];
    return e.forEach(s => {
        typeof s == "object" ? Object.keys(s).forEach(i => {
            s[i] && n.push(t + i)
        }
        ) : typeof s == "string" && n.push(t + s)
    }
    ),
    n
}
function tu() {
    const e = this
      , {classNames: t, params: n, rtl: s, el: i, device: r} = e
      , l = eu(["initialized", n.direction, {
        "free-mode": e.params.freeMode && n.freeMode.enabled
    }, {
        autoheight: n.autoHeight
    }, {
        rtl: s
    }, {
        grid: n.grid && n.grid.rows > 1
    }, {
        "grid-column": n.grid && n.grid.rows > 1 && n.grid.fill === "column"
    }, {
        android: r.android
    }, {
        ios: r.ios
    }, {
        "css-mode": n.cssMode
    }, {
        centered: n.cssMode && n.centeredSlides
    }, {
        "watch-progress": n.watchSlidesProgress
    }], n.containerModifierClass);
    t.push(...l),
    i.classList.add(...t),
    e.emitContainerClasses()
}
function nu() {
    const e = this
      , {el: t, classNames: n} = e;
    t.classList.remove(...n),
    e.emitContainerClasses()
}
var su = {
    addClasses: tu,
    removeClasses: nu
};
function iu() {
    const e = this
      , {isLocked: t, params: n} = e
      , {slidesOffsetBefore: s} = n;
    if (s) {
        const i = e.slides.length - 1
          , r = e.slidesGrid[i] + e.slidesSizesGrid[i] + s * 2;
        e.isLocked = e.size > r
    } else
        e.isLocked = e.snapGrid.length === 1;
    n.allowSlideNext === !0 && (e.allowSlideNext = !e.isLocked),
    n.allowSlidePrev === !0 && (e.allowSlidePrev = !e.isLocked),
    t && t !== e.isLocked && (e.isEnd = !1),
    t !== e.isLocked && e.emit(e.isLocked ? "lock" : "unlock")
}
var ru = {
    checkOverflow: iu
}
  , zs = {
    init: !0,
    direction: "horizontal",
    oneWayMovement: !1,
    touchEventsTarget: "wrapper",
    initialSlide: 0,
    speed: 300,
    cssMode: !1,
    updateOnWindowResize: !0,
    resizeObserver: !0,
    nested: !1,
    createElements: !1,
    enabled: !0,
    focusableElements: "input, select, option, textarea, button, video, label",
    width: null,
    height: null,
    preventInteractionOnTransition: !1,
    userAgent: null,
    url: null,
    edgeSwipeDetection: !1,
    edgeSwipeThreshold: 20,
    autoHeight: !1,
    setWrapperSize: !1,
    virtualTranslate: !1,
    effect: "slide",
    breakpoints: void 0,
    breakpointsBase: "window",
    spaceBetween: 0,
    slidesPerView: 1,
    slidesPerGroup: 1,
    slidesPerGroupSkip: 0,
    slidesPerGroupAuto: !1,
    centeredSlides: !1,
    centeredSlidesBounds: !1,
    slidesOffsetBefore: 0,
    slidesOffsetAfter: 0,
    normalizeSlideIndex: !0,
    centerInsufficientSlides: !1,
    watchOverflow: !0,
    roundLengths: !1,
    touchRatio: 1,
    touchAngle: 45,
    simulateTouch: !0,
    shortSwipes: !0,
    longSwipes: !0,
    longSwipesRatio: .5,
    longSwipesMs: 300,
    followFinger: !0,
    allowTouchMove: !0,
    threshold: 5,
    touchMoveStopPropagation: !1,
    touchStartPreventDefault: !0,
    touchStartForcePreventDefault: !1,
    touchReleaseOnEdges: !1,
    uniqueNavElements: !0,
    resistance: !0,
    resistanceRatio: .85,
    watchSlidesProgress: !1,
    grabCursor: !1,
    preventClicks: !0,
    preventClicksPropagation: !0,
    slideToClickedSlide: !1,
    loop: !1,
    loopedSlides: null,
    loopPreventsSliding: !0,
    rewind: !1,
    allowSlidePrev: !0,
    allowSlideNext: !0,
    swipeHandler: null,
    noSwiping: !0,
    noSwipingClass: "swiper-no-swiping",
    noSwipingSelector: null,
    passiveListeners: !0,
    maxBackfaceHiddenSlides: 10,
    containerModifierClass: "swiper-",
    slideClass: "swiper-slide",
    slideActiveClass: "swiper-slide-active",
    slideVisibleClass: "swiper-slide-visible",
    slideNextClass: "swiper-slide-next",
    slidePrevClass: "swiper-slide-prev",
    wrapperClass: "swiper-wrapper",
    lazyPreloaderClass: "swiper-lazy-preloader",
    lazyPreloadPrevNext: 0,
    runCallbacksOnInit: !0,
    _emitClasses: !1
};
function lu(e, t) {
    return function(s) {
        s === void 0 && (s = {});
        const i = Object.keys(s)[0]
          , r = s[i];
        if (typeof r != "object" || r === null) {
            _e(t, s);
            return
        }
        if (e[i] === !0 && (e[i] = {
            enabled: !0
        }),
        i === "navigation" && e[i] && e[i].enabled && !e[i].prevEl && !e[i].nextEl && (e[i].auto = !0),
        ["pagination", "scrollbar"].indexOf(i) >= 0 && e[i] && e[i].enabled && !e[i].el && (e[i].auto = !0),
        !(i in e && "enabled"in r)) {
            _e(t, s);
            return
        }
        typeof e[i] == "object" && !("enabled"in e[i]) && (e[i].enabled = !0),
        e[i] || (e[i] = {
            enabled: !1
        }),
        _e(t, s)
    }
}
const vs = {
    eventsEmitter: sc,
    update: hc,
    translate: bc,
    transition: Ec,
    slide: Lc,
    loop: Nc,
    grabCursor: zc,
    events: Xc,
    breakpoints: Qc,
    checkOverflow: ru,
    classes: su
}
  , ys = {};
let pi = class je {
    constructor() {
        let t, n;
        for (var s = arguments.length, i = new Array(s), r = 0; r < s; r++)
            i[r] = arguments[r];
        i.length === 1 && i[0].constructor && Object.prototype.toString.call(i[0]).slice(8, -1) === "Object" ? n = i[0] : [t,n] = i,
        n || (n = {}),
        n = _e({}, n),
        t && !n.el && (n.el = t);
        const l = ze();
        if (n.el && typeof n.el == "string" && l.querySelectorAll(n.el).length > 1) {
            const c = [];
            return l.querySelectorAll(n.el).forEach(u => {
                const h = _e({}, n, {
                    el: u
                });
                c.push(new je(h))
            }
            ),
            c
        }
        const a = this;
        a.__swiper__ = !0,
        a.support = ql(),
        a.device = Zf({
            userAgent: n.userAgent
        }),
        a.browser = ec(),
        a.eventsListeners = {},
        a.eventsAnyListeners = [],
        a.modules = [...a.__modules__],
        n.modules && Array.isArray(n.modules) && a.modules.push(...n.modules);
        const o = {};
        a.modules.forEach(c => {
            c({
                params: n,
                swiper: a,
                extendParams: lu(n, o),
                on: a.on.bind(a),
                once: a.once.bind(a),
                off: a.off.bind(a),
                emit: a.emit.bind(a)
            })
        }
        );
        const f = _e({}, zs, o);
        return a.params = _e({}, f, ys, n),
        a.originalParams = _e({}, a.params),
        a.passedParams = _e({}, n),
        a.params && a.params.on && Object.keys(a.params.on).forEach(c => {
            a.on(c, a.params.on[c])
        }
        ),
        a.params && a.params.onAny && a.onAny(a.params.onAny),
        Object.assign(a, {
            enabled: a.params.enabled,
            el: t,
            classNames: [],
            slides: [],
            slidesGrid: [],
            snapGrid: [],
            slidesSizesGrid: [],
            isHorizontal() {
                return a.params.direction === "horizontal"
            },
            isVertical() {
                return a.params.direction === "vertical"
            },
            activeIndex: 0,
            realIndex: 0,
            isBeginning: !0,
            isEnd: !1,
            translate: 0,
            previousTranslate: 0,
            progress: 0,
            velocity: 0,
            animating: !1,
            cssOverflowAdjustment() {
                return Math.trunc(this.translate / 2 ** 23) * 2 ** 23
            },
            allowSlideNext: a.params.allowSlideNext,
            allowSlidePrev: a.params.allowSlidePrev,
            touchEventsData: {
                isTouched: void 0,
                isMoved: void 0,
                allowTouchCallbacks: void 0,
                touchStartTime: void 0,
                isScrolling: void 0,
                currentTranslate: void 0,
                startTranslate: void 0,
                allowThresholdMove: void 0,
                focusableElements: a.params.focusableElements,
                lastClickTime: 0,
                clickTimeout: void 0,
                velocities: [],
                allowMomentumBounce: void 0,
                startMoving: void 0,
                evCache: []
            },
            allowClick: !0,
            allowTouchMove: a.params.allowTouchMove,
            touches: {
                startX: 0,
                startY: 0,
                currentX: 0,
                currentY: 0,
                diff: 0
            },
            imagesToLoad: [],
            imagesLoaded: 0
        }),
        a.emit("_swiper"),
        a.params.init && a.init(),
        a
    }
    getSlideIndex(t) {
        const {slidesEl: n, params: s} = this
          , i = ke(n, `.${s.slideClass}, swiper-slide`)
          , r = lr(i[0]);
        return lr(t) - r
    }
    getSlideIndexByData(t) {
        return this.getSlideIndex(this.slides.filter(n => n.getAttribute("data-swiper-slide-index") * 1 === t)[0])
    }
    recalcSlides() {
        const t = this
          , {slidesEl: n, params: s} = t;
        t.slides = ke(n, `.${s.slideClass}, swiper-slide`)
    }
    enable() {
        const t = this;
        t.enabled || (t.enabled = !0,
        t.params.grabCursor && t.setGrabCursor(),
        t.emit("enable"))
    }
    disable() {
        const t = this;
        t.enabled && (t.enabled = !1,
        t.params.grabCursor && t.unsetGrabCursor(),
        t.emit("disable"))
    }
    setProgress(t, n) {
        const s = this;
        t = Math.min(Math.max(t, 0), 1);
        const i = s.minTranslate()
          , l = (s.maxTranslate() - i) * t + i;
        s.translateTo(l, typeof n > "u" ? 0 : n),
        s.updateActiveIndex(),
        s.updateSlidesClasses()
    }
    emitContainerClasses() {
        const t = this;
        if (!t.params._emitClasses || !t.el)
            return;
        const n = t.el.className.split(" ").filter(s => s.indexOf("swiper") === 0 || s.indexOf(t.params.containerModifierClass) === 0);
        t.emit("_containerClasses", n.join(" "))
    }
    getSlideClasses(t) {
        const n = this;
        return n.destroyed ? "" : t.className.split(" ").filter(s => s.indexOf("swiper-slide") === 0 || s.indexOf(n.params.slideClass) === 0).join(" ")
    }
    emitSlidesClasses() {
        const t = this;
        if (!t.params._emitClasses || !t.el)
            return;
        const n = [];
        t.slides.forEach(s => {
            const i = t.getSlideClasses(s);
            n.push({
                slideEl: s,
                classNames: i
            }),
            t.emit("_slideClass", s, i)
        }
        ),
        t.emit("_slideClasses", n)
    }
    slidesPerViewDynamic(t, n) {
        t === void 0 && (t = "current"),
        n === void 0 && (n = !1);
        const s = this
          , {params: i, slides: r, slidesGrid: l, slidesSizesGrid: a, size: o, activeIndex: f} = s;
        let c = 1;
        if (typeof i.slidesPerView == "number")
            return i.slidesPerView;
        if (i.centeredSlides) {
            let u = r[f] ? r[f].swiperSlideSize : 0, h;
            for (let p = f + 1; p < r.length; p += 1)
                r[p] && !h && (u += r[p].swiperSlideSize,
                c += 1,
                u > o && (h = !0));
            for (let p = f - 1; p >= 0; p -= 1)
                r[p] && !h && (u += r[p].swiperSlideSize,
                c += 1,
                u > o && (h = !0))
        } else if (t === "current")
            for (let u = f + 1; u < r.length; u += 1)
                (n ? l[u] + a[u] - l[f] < o : l[u] - l[f] < o) && (c += 1);
        else
            for (let u = f - 1; u >= 0; u -= 1)
                l[f] - l[u] < o && (c += 1);
        return c
    }
    update() {
        const t = this;
        if (!t || t.destroyed)
            return;
        const {snapGrid: n, params: s} = t;
        s.breakpoints && t.setBreakpoint(),
        [...t.el.querySelectorAll('[loading="lazy"]')].forEach(l => {
            l.complete && In(t, l)
        }
        ),
        t.updateSize(),
        t.updateSlides(),
        t.updateProgress(),
        t.updateSlidesClasses();
        function i() {
            const l = t.rtlTranslate ? t.translate * -1 : t.translate
              , a = Math.min(Math.max(l, t.maxTranslate()), t.minTranslate());
            t.setTranslate(a),
            t.updateActiveIndex(),
            t.updateSlidesClasses()
        }
        let r;
        if (s.freeMode && s.freeMode.enabled && !s.cssMode)
            i(),
            s.autoHeight && t.updateAutoHeight();
        else {
            if ((s.slidesPerView === "auto" || s.slidesPerView > 1) && t.isEnd && !s.centeredSlides) {
                const l = t.virtual && s.virtual.enabled ? t.virtual.slides : t.slides;
                r = t.slideTo(l.length - 1, 0, !1, !0)
            } else
                r = t.slideTo(t.activeIndex, 0, !1, !0);
            r || i()
        }
        s.watchOverflow && n !== t.snapGrid && t.checkOverflow(),
        t.emit("update")
    }
    changeDirection(t, n) {
        n === void 0 && (n = !0);
        const s = this
          , i = s.params.direction;
        return t || (t = i === "horizontal" ? "vertical" : "horizontal"),
        t === i || t !== "horizontal" && t !== "vertical" || (s.el.classList.remove(`${s.params.containerModifierClass}${i}`),
        s.el.classList.add(`${s.params.containerModifierClass}${t}`),
        s.emitContainerClasses(),
        s.params.direction = t,
        s.slides.forEach(r => {
            t === "vertical" ? r.style.width = "" : r.style.height = ""
        }
        ),
        s.emit("changeDirection"),
        n && s.update()),
        s
    }
    changeLanguageDirection(t) {
        const n = this;
        n.rtl && t === "rtl" || !n.rtl && t === "ltr" || (n.rtl = t === "rtl",
        n.rtlTranslate = n.params.direction === "horizontal" && n.rtl,
        n.rtl ? (n.el.classList.add(`${n.params.containerModifierClass}rtl`),
        n.el.dir = "rtl") : (n.el.classList.remove(`${n.params.containerModifierClass}rtl`),
        n.el.dir = "ltr"),
        n.update())
    }
    mount(t) {
        const n = this;
        if (n.mounted)
            return !0;
        let s = t || n.params.el;
        if (typeof s == "string" && (s = document.querySelector(s)),
        !s)
            return !1;
        s.swiper = n,
        s.parentNode && s.parentNode.host && s.parentNode.host.nodeName === "SWIPER-CONTAINER" && (n.isElement = !0);
        const i = () => `.${(n.params.wrapperClass || "").trim().split(" ").join(".")}`;
        let l = s && s.shadowRoot && s.shadowRoot.querySelector ? s.shadowRoot.querySelector(i()) : ke(s, i())[0];
        return !l && n.params.createElements && (l = Wf("div", n.params.wrapperClass),
        s.append(l),
        ke(s, `.${n.params.slideClass}`).forEach(a => {
            l.append(a)
        }
        )),
        Object.assign(n, {
            el: s,
            wrapperEl: l,
            slidesEl: n.isElement && !s.parentNode.host.slideSlots ? s.parentNode.host : l,
            hostEl: n.isElement ? s.parentNode.host : s,
            mounted: !0,
            rtl: s.dir.toLowerCase() === "rtl" || tt(s, "direction") === "rtl",
            rtlTranslate: n.params.direction === "horizontal" && (s.dir.toLowerCase() === "rtl" || tt(s, "direction") === "rtl"),
            wrongRTL: tt(l, "display") === "-webkit-box"
        }),
        !0
    }
    init(t) {
        const n = this;
        if (n.initialized || n.mount(t) === !1)
            return n;
        n.emit("beforeInit"),
        n.params.breakpoints && n.setBreakpoint(),
        n.addClasses(),
        n.updateSize(),
        n.updateSlides(),
        n.params.watchOverflow && n.checkOverflow(),
        n.params.grabCursor && n.enabled && n.setGrabCursor(),
        n.params.loop && n.virtual && n.params.virtual.enabled ? n.slideTo(n.params.initialSlide + n.virtual.slidesBefore, 0, n.params.runCallbacksOnInit, !1, !0) : n.slideTo(n.params.initialSlide, 0, n.params.runCallbacksOnInit, !1, !0),
        n.params.loop && n.loopCreate(),
        n.attachEvents();
        const i = [...n.el.querySelectorAll('[loading="lazy"]')];
        return n.isElement && i.push(...n.hostEl.querySelectorAll('[loading="lazy"]')),
        i.forEach(r => {
            r.complete ? In(n, r) : r.addEventListener("load", l => {
                In(n, l.target)
            }
            )
        }
        ),
        Vs(n),
        n.initialized = !0,
        Vs(n),
        n.emit("init"),
        n.emit("afterInit"),
        n
    }
    destroy(t, n) {
        t === void 0 && (t = !0),
        n === void 0 && (n = !0);
        const s = this
          , {params: i, el: r, wrapperEl: l, slides: a} = s;
        return typeof s.params > "u" || s.destroyed || (s.emit("beforeDestroy"),
        s.initialized = !1,
        s.detachEvents(),
        i.loop && s.loopDestroy(),
        n && (s.removeClasses(),
        r.removeAttribute("style"),
        l.removeAttribute("style"),
        a && a.length && a.forEach(o => {
            o.classList.remove(i.slideVisibleClass, i.slideActiveClass, i.slideNextClass, i.slidePrevClass),
            o.removeAttribute("style"),
            o.removeAttribute("data-swiper-slide-index")
        }
        )),
        s.emit("destroy"),
        Object.keys(s.eventsListeners).forEach(o => {
            s.off(o)
        }
        ),
        t !== !1 && (s.el.swiper = null,
        $f(s)),
        s.destroyed = !0),
        null
    }
    static extendDefaults(t) {
        _e(ys, t)
    }
    static get extendedDefaults() {
        return ys
    }
    static get defaults() {
        return zs
    }
    static installModule(t) {
        je.prototype.__modules__ || (je.prototype.__modules__ = []);
        const n = je.prototype.__modules__;
        typeof t == "function" && n.indexOf(t) < 0 && n.push(t)
    }
    static use(t) {
        return Array.isArray(t) ? (t.forEach(n => je.installModule(n)),
        je) : (je.installModule(t),
        je)
    }
}
;
Object.keys(vs).forEach(e => {
    Object.keys(vs[e]).forEach(t => {
        pi.prototype[t] = vs[e][t]
    }
    )
}
);
pi.use([tc, nc]);
const Jl = ["eventsPrefix", "injectStyles", "injectStylesUrls", "modules", "init", "_direction", "oneWayMovement", "touchEventsTarget", "initialSlide", "_speed", "cssMode", "updateOnWindowResize", "resizeObserver", "nested", "focusableElements", "_enabled", "_width", "_height", "preventInteractionOnTransition", "userAgent", "url", "_edgeSwipeDetection", "_edgeSwipeThreshold", "_freeMode", "_autoHeight", "setWrapperSize", "virtualTranslate", "_effect", "breakpoints", "breakpointsBase", "_spaceBetween", "_slidesPerView", "maxBackfaceHiddenSlides", "_grid", "_slidesPerGroup", "_slidesPerGroupSkip", "_slidesPerGroupAuto", "_centeredSlides", "_centeredSlidesBounds", "_slidesOffsetBefore", "_slidesOffsetAfter", "normalizeSlideIndex", "_centerInsufficientSlides", "_watchOverflow", "roundLengths", "touchRatio", "touchAngle", "simulateTouch", "_shortSwipes", "_longSwipes", "longSwipesRatio", "longSwipesMs", "_followFinger", "allowTouchMove", "_threshold", "touchMoveStopPropagation", "touchStartPreventDefault", "touchStartForcePreventDefault", "touchReleaseOnEdges", "uniqueNavElements", "_resistance", "_resistanceRatio", "_watchSlidesProgress", "_grabCursor", "preventClicks", "preventClicksPropagation", "_slideToClickedSlide", "_loop", "loopedSlides", "loopPreventsSliding", "_rewind", "_allowSlidePrev", "_allowSlideNext", "_swipeHandler", "_noSwiping", "noSwipingClass", "noSwipingSelector", "passiveListeners", "containerModifierClass", "slideClass", "slideActiveClass", "slideVisibleClass", "slideNextClass", "slidePrevClass", "wrapperClass", "lazyPreloaderClass", "lazyPreloadPrevNext", "runCallbacksOnInit", "observer", "observeParents", "observeSlideChildren", "a11y", "_autoplay", "_controller", "coverflowEffect", "cubeEffect", "fadeEffect", "flipEffect", "creativeEffect", "cardsEffect", "hashNavigation", "history", "keyboard", "mousewheel", "_navigation", "_pagination", "parallax", "_scrollbar", "_thumbs", "virtual", "zoom", "control"];
function St(e) {
    return typeof e == "object" && e !== null && e.constructor && Object.prototype.toString.call(e).slice(8, -1) === "Object" && !e.__swiper__
}
function vt(e, t) {
    const n = ["__proto__", "constructor", "prototype"];
    Object.keys(t).filter(s => n.indexOf(s) < 0).forEach(s => {
        typeof e[s] > "u" ? e[s] = t[s] : St(t[s]) && St(e[s]) && Object.keys(t[s]).length > 0 ? t[s].__swiper__ ? e[s] = t[s] : vt(e[s], t[s]) : e[s] = t[s]
    }
    )
}
function Zl(e) {
    return e === void 0 && (e = {}),
    e.navigation && typeof e.navigation.nextEl > "u" && typeof e.navigation.prevEl > "u"
}
function Ql(e) {
    return e === void 0 && (e = {}),
    e.pagination && typeof e.pagination.el > "u"
}
function eo(e) {
    return e === void 0 && (e = {}),
    e.scrollbar && typeof e.scrollbar.el > "u"
}
function to(e) {
    e === void 0 && (e = "");
    const t = e.split(" ").map(s => s.trim()).filter(s => !!s)
      , n = [];
    return t.forEach(s => {
        n.indexOf(s) < 0 && n.push(s)
    }
    ),
    n.join(" ")
}
function ou(e) {
    return e === void 0 && (e = ""),
    e ? e.includes("swiper-wrapper") ? e : `swiper-wrapper ${e}` : "swiper-wrapper"
}
function au(e) {
    let {swiper: t, slides: n, passedParams: s, changedParams: i, nextEl: r, prevEl: l, scrollbarEl: a, paginationEl: o} = e;
    const f = i.filter(y => y !== "children" && y !== "direction" && y !== "wrapperClass")
      , {params: c, pagination: u, navigation: h, scrollbar: p, virtual: w, thumbs: T} = t;
    let I, C, S, d, v, b, x, P;
    i.includes("thumbs") && s.thumbs && s.thumbs.swiper && c.thumbs && !c.thumbs.swiper && (I = !0),
    i.includes("controller") && s.controller && s.controller.control && c.controller && !c.controller.control && (C = !0),
    i.includes("pagination") && s.pagination && (s.pagination.el || o) && (c.pagination || c.pagination === !1) && u && !u.el && (S = !0),
    i.includes("scrollbar") && s.scrollbar && (s.scrollbar.el || a) && (c.scrollbar || c.scrollbar === !1) && p && !p.el && (d = !0),
    i.includes("navigation") && s.navigation && (s.navigation.prevEl || l) && (s.navigation.nextEl || r) && (c.navigation || c.navigation === !1) && h && !h.prevEl && !h.nextEl && (v = !0);
    const A = y => {
        t[y] && (t[y].destroy(),
        y === "navigation" ? (t.isElement && (t[y].prevEl.remove(),
        t[y].nextEl.remove()),
        c[y].prevEl = void 0,
        c[y].nextEl = void 0,
        t[y].prevEl = void 0,
        t[y].nextEl = void 0) : (t.isElement && t[y].el.remove(),
        c[y].el = void 0,
        t[y].el = void 0))
    }
    ;
    i.includes("loop") && t.isElement && (c.loop && !s.loop ? b = !0 : !c.loop && s.loop ? x = !0 : P = !0),
    f.forEach(y => {
        if (St(c[y]) && St(s[y]))
            vt(c[y], s[y]),
            (y === "navigation" || y === "pagination" || y === "scrollbar") && "enabled"in s[y] && !s[y].enabled && A(y);
        else {
            const O = s[y];
            (O === !0 || O === !1) && (y === "navigation" || y === "pagination" || y === "scrollbar") ? O === !1 && A(y) : c[y] = s[y]
        }
    }
    ),
    f.includes("controller") && !C && t.controller && t.controller.control && c.controller && c.controller.control && (t.controller.control = c.controller.control),
    i.includes("children") && n && w && c.virtual.enabled && (w.slides = n,
    w.update(!0)),
    i.includes("children") && n && c.loop && (P = !0),
    I && T.init() && T.update(!0),
    C && (t.controller.control = c.controller.control),
    S && (t.isElement && (!o || typeof o == "string") && (o = document.createElement("div"),
    o.classList.add("swiper-pagination"),
    o.part.add("pagination"),
    t.el.appendChild(o)),
    o && (c.pagination.el = o),
    u.init(),
    u.render(),
    u.update()),
    d && (t.isElement && (!a || typeof a == "string") && (a = document.createElement("div"),
    a.classList.add("swiper-scrollbar"),
    a.part.add("scrollbar"),
    t.el.appendChild(a)),
    a && (c.scrollbar.el = a),
    p.init(),
    p.updateSize(),
    p.setTranslate()),
    v && (t.isElement && ((!r || typeof r == "string") && (r = document.createElement("div"),
    r.classList.add("swiper-button-next"),
    r.innerHTML = t.hostEl.constructor.nextButtonSvg,
    r.part.add("button-next"),
    t.el.appendChild(r)),
    (!l || typeof l == "string") && (l = document.createElement("div"),
    l.classList.add("swiper-button-prev"),
    l.innerHTML = t.hostEl.constructor.prevButtonSvg,
    l.part.add("button-prev"),
    t.el.appendChild(l))),
    r && (c.navigation.nextEl = r),
    l && (c.navigation.prevEl = l),
    h.init(),
    h.update()),
    i.includes("allowSlideNext") && (t.allowSlideNext = s.allowSlideNext),
    i.includes("allowSlidePrev") && (t.allowSlidePrev = s.allowSlidePrev),
    i.includes("direction") && t.changeDirection(s.direction, !1),
    (b || P) && t.loopDestroy(),
    (x || P) && t.loopCreate(),
    t.update()
}
function ur(e, t) {
    e === void 0 && (e = {});
    const n = {
        on: {}
    }
      , s = {}
      , i = {};
    vt(n, zs),
    n._emitClasses = !0,
    n.init = !1;
    const r = {}
      , l = Jl.map(o => o.replace(/_/, ""))
      , a = Object.assign({}, e);
    return Object.keys(a).forEach(o => {
        typeof e[o] > "u" || (l.indexOf(o) >= 0 ? St(e[o]) ? (n[o] = {},
        i[o] = {},
        vt(n[o], e[o]),
        vt(i[o], e[o])) : (n[o] = e[o],
        i[o] = e[o]) : o.search(/on[A-Z]/) === 0 && typeof e[o] == "function" ? n.on[`${o[2].toLowerCase()}${o.substr(3)}`] = e[o] : r[o] = e[o])
    }
    ),
    ["navigation", "pagination", "scrollbar"].forEach(o => {
        n[o] === !0 && (n[o] = {}),
        n[o] === !1 && delete n[o]
    }
    ),
    {
        params: n,
        passedParams: i,
        rest: r,
        events: s
    }
}
function fu(e, t) {
    let {el: n, nextEl: s, prevEl: i, paginationEl: r, scrollbarEl: l, swiper: a} = e;
    Zl(t) && s && i && (a.params.navigation.nextEl = s,
    a.originalParams.navigation.nextEl = s,
    a.params.navigation.prevEl = i,
    a.originalParams.navigation.prevEl = i),
    Ql(t) && r && (a.params.pagination.el = r,
    a.originalParams.pagination.el = r),
    eo(t) && l && (a.params.scrollbar.el = l,
    a.originalParams.scrollbar.el = l),
    a.init(n)
}
function cu(e, t, n, s, i) {
    const r = [];
    if (!t)
        return r;
    const l = o => {
        r.indexOf(o) < 0 && r.push(o)
    }
    ;
    if (n && s) {
        const o = s.map(i)
          , f = n.map(i);
        o.join("") !== f.join("") && l("children"),
        s.length !== n.length && l("children")
    }
    return Jl.filter(o => o[0] === "_").map(o => o.replace(/_/, "")).forEach(o => {
        if (o in e && o in t)
            if (St(e[o]) && St(t[o])) {
                const f = Object.keys(e[o])
                  , c = Object.keys(t[o]);
                f.length !== c.length ? l(o) : (f.forEach(u => {
                    e[o][u] !== t[o][u] && l(o)
                }
                ),
                c.forEach(u => {
                    e[o][u] !== t[o][u] && l(o)
                }
                ))
            } else
                e[o] !== t[o] && l(o)
    }
    ),
    r
}
const uu = e => {
    !e || e.destroyed || !e.params.virtual || e.params.virtual && !e.params.virtual.enabled || (e.updateSlides(),
    e.updateProgress(),
    e.updateSlidesClasses(),
    e.parallax && e.params.parallax && e.params.parallax.enabled && e.parallax.setTranslate())
}
;
function ws(e, t, n) {
    e === void 0 && (e = {});
    const s = []
      , i = {
        "container-start": [],
        "container-end": [],
        "wrapper-start": [],
        "wrapper-end": []
    }
      , r = (l, a) => {
        Array.isArray(l) && l.forEach(o => {
            const f = typeof o.type == "symbol";
            a === "default" && (a = "container-end"),
            f && o.children ? r(o.children, a) : o.type && (o.type.name === "SwiperSlide" || o.type.name === "AsyncComponentWrapper") ? s.push(o) : i[a] && i[a].push(o)
        }
        )
    }
    ;
    return Object.keys(e).forEach(l => {
        if (typeof e[l] != "function")
            return;
        const a = e[l]();
        r(a, l)
    }
    ),
    n.value = t.value,
    t.value = s,
    {
        slides: s,
        slots: i
    }
}
function du(e, t, n) {
    if (!n)
        return null;
    const s = c => {
        let u = c;
        return c < 0 ? u = t.length + c : u >= t.length && (u = u - t.length),
        u
    }
      , i = e.value.isHorizontal() ? {
        [e.value.rtlTranslate ? "right" : "left"]: `${n.offset}px`
    } : {
        top: `${n.offset}px`
    }
      , {from: r, to: l} = n
      , a = e.value.params.loop ? -t.length : 0
      , o = e.value.params.loop ? t.length * 2 : t.length
      , f = [];
    for (let c = a; c < o; c += 1)
        c >= r && c <= l && f.push(t[s(c)]);
    return f.map(c => (c.props || (c.props = {}),
    c.props.style || (c.props.style = {}),
    c.props.swiperRef = e,
    c.props.style = i,
    Ae(c.type, {
        ...c.props
    }, c.children)))
}
const nd = {
    name: "Swiper",
    props: {
        tag: {
            type: String,
            default: "div"
        },
        wrapperTag: {
            type: String,
            default: "div"
        },
        modules: {
            type: Array,
            default: void 0
        },
        init: {
            type: Boolean,
            default: void 0
        },
        direction: {
            type: String,
            default: void 0
        },
        oneWayMovement: {
            type: Boolean,
            default: void 0
        },
        touchEventsTarget: {
            type: String,
            default: void 0
        },
        initialSlide: {
            type: Number,
            default: void 0
        },
        speed: {
            type: Number,
            default: void 0
        },
        cssMode: {
            type: Boolean,
            default: void 0
        },
        updateOnWindowResize: {
            type: Boolean,
            default: void 0
        },
        resizeObserver: {
            type: Boolean,
            default: void 0
        },
        nested: {
            type: Boolean,
            default: void 0
        },
        focusableElements: {
            type: String,
            default: void 0
        },
        width: {
            type: Number,
            default: void 0
        },
        height: {
            type: Number,
            default: void 0
        },
        preventInteractionOnTransition: {
            type: Boolean,
            default: void 0
        },
        userAgent: {
            type: String,
            default: void 0
        },
        url: {
            type: String,
            default: void 0
        },
        edgeSwipeDetection: {
            type: [Boolean, String],
            default: void 0
        },
        edgeSwipeThreshold: {
            type: Number,
            default: void 0
        },
        autoHeight: {
            type: Boolean,
            default: void 0
        },
        setWrapperSize: {
            type: Boolean,
            default: void 0
        },
        virtualTranslate: {
            type: Boolean,
            default: void 0
        },
        effect: {
            type: String,
            default: void 0
        },
        breakpoints: {
            type: Object,
            default: void 0
        },
        spaceBetween: {
            type: [Number, String],
            default: void 0
        },
        slidesPerView: {
            type: [Number, String],
            default: void 0
        },
        maxBackfaceHiddenSlides: {
            type: Number,
            default: void 0
        },
        slidesPerGroup: {
            type: Number,
            default: void 0
        },
        slidesPerGroupSkip: {
            type: Number,
            default: void 0
        },
        slidesPerGroupAuto: {
            type: Boolean,
            default: void 0
        },
        centeredSlides: {
            type: Boolean,
            default: void 0
        },
        centeredSlidesBounds: {
            type: Boolean,
            default: void 0
        },
        slidesOffsetBefore: {
            type: Number,
            default: void 0
        },
        slidesOffsetAfter: {
            type: Number,
            default: void 0
        },
        normalizeSlideIndex: {
            type: Boolean,
            default: void 0
        },
        centerInsufficientSlides: {
            type: Boolean,
            default: void 0
        },
        watchOverflow: {
            type: Boolean,
            default: void 0
        },
        roundLengths: {
            type: Boolean,
            default: void 0
        },
        touchRatio: {
            type: Number,
            default: void 0
        },
        touchAngle: {
            type: Number,
            default: void 0
        },
        simulateTouch: {
            type: Boolean,
            default: void 0
        },
        shortSwipes: {
            type: Boolean,
            default: void 0
        },
        longSwipes: {
            type: Boolean,
            default: void 0
        },
        longSwipesRatio: {
            type: Number,
            default: void 0
        },
        longSwipesMs: {
            type: Number,
            default: void 0
        },
        followFinger: {
            type: Boolean,
            default: void 0
        },
        allowTouchMove: {
            type: Boolean,
            default: void 0
        },
        threshold: {
            type: Number,
            default: void 0
        },
        touchMoveStopPropagation: {
            type: Boolean,
            default: void 0
        },
        touchStartPreventDefault: {
            type: Boolean,
            default: void 0
        },
        touchStartForcePreventDefault: {
            type: Boolean,
            default: void 0
        },
        touchReleaseOnEdges: {
            type: Boolean,
            default: void 0
        },
        uniqueNavElements: {
            type: Boolean,
            default: void 0
        },
        resistance: {
            type: Boolean,
            default: void 0
        },
        resistanceRatio: {
            type: Number,
            default: void 0
        },
        watchSlidesProgress: {
            type: Boolean,
            default: void 0
        },
        grabCursor: {
            type: Boolean,
            default: void 0
        },
        preventClicks: {
            type: Boolean,
            default: void 0
        },
        preventClicksPropagation: {
            type: Boolean,
            default: void 0
        },
        slideToClickedSlide: {
            type: Boolean,
            default: void 0
        },
        loop: {
            type: Boolean,
            default: void 0
        },
        loopedSlides: {
            type: Number,
            default: void 0
        },
        loopPreventsSliding: {
            type: Boolean,
            default: void 0
        },
        rewind: {
            type: Boolean,
            default: void 0
        },
        allowSlidePrev: {
            type: Boolean,
            default: void 0
        },
        allowSlideNext: {
            type: Boolean,
            default: void 0
        },
        swipeHandler: {
            type: Boolean,
            default: void 0
        },
        noSwiping: {
            type: Boolean,
            default: void 0
        },
        noSwipingClass: {
            type: String,
            default: void 0
        },
        noSwipingSelector: {
            type: String,
            default: void 0
        },
        passiveListeners: {
            type: Boolean,
            default: void 0
        },
        containerModifierClass: {
            type: String,
            default: void 0
        },
        slideClass: {
            type: String,
            default: void 0
        },
        slideActiveClass: {
            type: String,
            default: void 0
        },
        slideVisibleClass: {
            type: String,
            default: void 0
        },
        slideNextClass: {
            type: String,
            default: void 0
        },
        slidePrevClass: {
            type: String,
            default: void 0
        },
        wrapperClass: {
            type: String,
            default: void 0
        },
        lazyPreloaderClass: {
            type: String,
            default: void 0
        },
        lazyPreloadPrevNext: {
            type: Number,
            default: void 0
        },
        runCallbacksOnInit: {
            type: Boolean,
            default: void 0
        },
        observer: {
            type: Boolean,
            default: void 0
        },
        observeParents: {
            type: Boolean,
            default: void 0
        },
        observeSlideChildren: {
            type: Boolean,
            default: void 0
        },
        a11y: {
            type: [Boolean, Object],
            default: void 0
        },
        autoplay: {
            type: [Boolean, Object],
            default: void 0
        },
        controller: {
            type: Object,
            default: void 0
        },
        coverflowEffect: {
            type: Object,
            default: void 0
        },
        cubeEffect: {
            type: Object,
            default: void 0
        },
        fadeEffect: {
            type: Object,
            default: void 0
        },
        flipEffect: {
            type: Object,
            default: void 0
        },
        creativeEffect: {
            type: Object,
            default: void 0
        },
        cardsEffect: {
            type: Object,
            default: void 0
        },
        hashNavigation: {
            type: [Boolean, Object],
            default: void 0
        },
        history: {
            type: [Boolean, Object],
            default: void 0
        },
        keyboard: {
            type: [Boolean, Object],
            default: void 0
        },
        mousewheel: {
            type: [Boolean, Object],
            default: void 0
        },
        navigation: {
            type: [Boolean, Object],
            default: void 0
        },
        pagination: {
            type: [Boolean, Object],
            default: void 0
        },
        parallax: {
            type: [Boolean, Object],
            default: void 0
        },
        scrollbar: {
            type: [Boolean, Object],
            default: void 0
        },
        thumbs: {
            type: Object,
            default: void 0
        },
        virtual: {
            type: [Boolean, Object],
            default: void 0
        },
        zoom: {
            type: [Boolean, Object],
            default: void 0
        },
        grid: {
            type: [Object],
            default: void 0
        },
        freeMode: {
            type: [Boolean, Object],
            default: void 0
        },
        enabled: {
            type: Boolean,
            default: void 0
        }
    },
    emits: ["_beforeBreakpoint", "_containerClasses", "_slideClass", "_slideClasses", "_swiper", "_freeModeNoMomentumRelease", "activeIndexChange", "afterInit", "autoplay", "autoplayStart", "autoplayStop", "autoplayPause", "autoplayResume", "autoplayTimeLeft", "beforeDestroy", "beforeInit", "beforeLoopFix", "beforeResize", "beforeSlideChangeStart", "beforeTransitionStart", "breakpoint", "breakpointsBase", "changeDirection", "click", "disable", "doubleTap", "doubleClick", "destroy", "enable", "fromEdge", "hashChange", "hashSet", "init", "keyPress", "lock", "loopFix", "momentumBounce", "navigationHide", "navigationShow", "navigationPrev", "navigationNext", "observerUpdate", "orientationchange", "paginationHide", "paginationRender", "paginationShow", "paginationUpdate", "progress", "reachBeginning", "reachEnd", "realIndexChange", "resize", "scroll", "scrollbarDragEnd", "scrollbarDragMove", "scrollbarDragStart", "setTransition", "setTranslate", "slideChange", "slideChangeTransitionEnd", "slideChangeTransitionStart", "slideNextTransitionEnd", "slideNextTransitionStart", "slidePrevTransitionEnd", "slidePrevTransitionStart", "slideResetTransitionStart", "slideResetTransitionEnd", "sliderMove", "sliderFirstMove", "slidesLengthChange", "slidesGridLengthChange", "snapGridLengthChange", "snapIndexChange", "swiper", "tap", "toEdge", "touchEnd", "touchMove", "touchMoveOpposite", "touchStart", "transitionEnd", "transitionStart", "unlock", "update", "virtualUpdate", "zoomChange"],
    setup(e, t) {
        let {slots: n, emit: s} = t;
        const {tag: i, wrapperTag: r} = e
          , l = ue("swiper")
          , a = ue(null)
          , o = ue(!1)
          , f = ue(!1)
          , c = ue(null)
          , u = ue(null)
          , h = ue(null)
          , p = {
            value: []
        }
          , w = {
            value: []
        }
          , T = ue(null)
          , I = ue(null)
          , C = ue(null)
          , S = ue(null)
          , {params: d, passedParams: v} = ur(e);
        ws(n, p, w),
        h.value = v,
        w.value = p.value;
        const b = () => {
            ws(n, p, w),
            o.value = !0
        }
        ;
        d.onAny = function(A) {
            for (var y = arguments.length, O = new Array(y > 1 ? y - 1 : 0), M = 1; M < y; M++)
                O[M - 1] = arguments[M];
            s(A, ...O)
        }
        ,
        Object.assign(d.on, {
            _beforeBreakpoint: b,
            _containerClasses(A, y) {
                l.value = y
            }
        });
        const x = {
            ...d
        };
        if (delete x.wrapperClass,
        u.value = new pi(x),
        u.value.virtual && u.value.params.virtual.enabled) {
            u.value.virtual.slides = p.value;
            const A = {
                cache: !1,
                slides: p.value,
                renderExternal: y => {
                    a.value = y
                }
                ,
                renderExternalUpdate: !1
            };
            vt(u.value.params.virtual, A),
            vt(u.value.originalParams.virtual, A)
        }
        on( () => {
            !f.value && u.value && (u.value.emitSlidesClasses(),
            f.value = !0);
            const {passedParams: A} = ur(e)
              , y = cu(A, h.value, p.value, w.value, O => O.props && O.props.key);
            h.value = A,
            (y.length || o.value) && u.value && !u.value.destroyed && au({
                swiper: u.value,
                slides: p.value,
                passedParams: A,
                changedParams: y,
                nextEl: T.value,
                prevEl: I.value,
                scrollbarEl: S.value,
                paginationEl: C.value
            }),
            o.value = !1
        }
        ),
        ri("swiper", u),
        qt(a, () => {
            $r( () => {
                uu(u.value)
            }
            )
        }
        ),
        ln( () => {
            c.value && (fu({
                el: c.value,
                nextEl: T.value,
                prevEl: I.value,
                paginationEl: C.value,
                scrollbarEl: S.value,
                swiper: u.value
            }, d),
            s("swiper", u.value))
        }
        ),
        an( () => {
            u.value && !u.value.destroyed && u.value.destroy(!0, !1)
        }
        );
        function P(A) {
            return d.virtual ? du(u, A, a.value) : (A.forEach( (y, O) => {
                y.props || (y.props = {}),
                y.props.swiperRef = u,
                y.props.swiperSlideIndex = O
            }
            ),
            A)
        }
        return () => {
            const {slides: A, slots: y} = ws(n, p, w);
            return Ae(i, {
                ref: c,
                class: to(l.value)
            }, [y["container-start"], Ae(r, {
                class: ou(d.wrapperClass)
            }, [y["wrapper-start"], P(A), y["wrapper-end"]]), Zl(e) && [Ae("div", {
                ref: I,
                class: "swiper-button-prev"
            }), Ae("div", {
                ref: T,
                class: "swiper-button-next"
            })], eo(e) && Ae("div", {
                ref: S,
                class: "swiper-scrollbar"
            }), Ql(e) && Ae("div", {
                ref: C,
                class: "swiper-pagination"
            }), y["container-end"]])
        }
    }
}
  , sd = {
    name: "SwiperSlide",
    props: {
        tag: {
            type: String,
            default: "div"
        },
        swiperRef: {
            type: Object,
            required: !1
        },
        swiperSlideIndex: {
            type: Number,
            default: void 0,
            required: !1
        },
        zoom: {
            type: Boolean,
            default: void 0,
            required: !1
        },
        lazy: {
            type: Boolean,
            default: !1,
            required: !1
        },
        virtualIndex: {
            type: [String, Number],
            default: void 0
        }
    },
    setup(e, t) {
        let {slots: n} = t
          , s = !1;
        const {swiperRef: i} = e
          , r = ue(null)
          , l = ue("swiper-slide")
          , a = ue(!1);
        function o(u, h, p) {
            h === r.value && (l.value = p)
        }
        ln( () => {
            !i || !i.value || (i.value.on("_slideClass", o),
            s = !0)
        }
        ),
        Yr( () => {
            s || !i || !i.value || (i.value.on("_slideClass", o),
            s = !0)
        }
        ),
        on( () => {
            !r.value || !i || !i.value || (typeof e.swiperSlideIndex < "u" && (r.value.swiperSlideIndex = e.swiperSlideIndex),
            i.value.destroyed && l.value !== "swiper-slide" && (l.value = "swiper-slide"))
        }
        ),
        an( () => {
            !i || !i.value || i.value.off("_slideClass", o)
        }
        );
        const f = Il( () => ({
            isActive: l.value.indexOf("swiper-slide-active") >= 0,
            isVisible: l.value.indexOf("swiper-slide-visible") >= 0,
            isPrev: l.value.indexOf("swiper-slide-prev") >= 0,
            isNext: l.value.indexOf("swiper-slide-next") >= 0
        }));
        ri("swiperSlide", f);
        const c = () => {
            a.value = !0
        }
        ;
        return () => Ae(e.tag, {
            class: to(`${l.value}`),
            ref: r,
            "data-swiper-slide-index": typeof e.virtualIndex > "u" && i && i.value && i.value.params.loop ? e.swiperSlideIndex : e.virtualIndex,
            onLoadCapture: c
        }, e.zoom ? Ae("div", {
            class: "swiper-zoom-container",
            "data-swiper-zoom": typeof e.zoom == "number" ? e.zoom : void 0
        }, [n.default && n.default(f.value), e.lazy && !a.value && Ae("div", {
            class: "swiper-lazy-preloader"
        })]) : [n.default && n.default(f.value), e.lazy && !a.value && Ae("div", {
            class: "swiper-lazy-preloader"
        })])
    }
};
function id(e) {
    let {swiper: t, extendParams: n, on: s, emit: i, params: r} = e;
    t.autoplay = {
        running: !1,
        paused: !1,
        timeLeft: 0
    },
    n({
        autoplay: {
            enabled: !1,
            delay: 3e3,
            waitForTransition: !0,
            disableOnInteraction: !0,
            stopOnLastSlide: !1,
            reverseDirection: !1,
            pauseOnMouseEnter: !1
        }
    });
    let l, a, o = r && r.autoplay ? r.autoplay.delay : 3e3, f = r && r.autoplay ? r.autoplay.delay : 3e3, c, u = new Date().getTime, h, p, w, T, I, C;
    function S(H) {
        !t || t.destroyed || !t.wrapperEl || H.target === t.wrapperEl && (t.wrapperEl.removeEventListener("transitionend", S),
        y())
    }
    const d = () => {
        if (t.destroyed || !t.autoplay.running)
            return;
        t.autoplay.paused ? h = !0 : h && (f = c,
        h = !1);
        const H = t.autoplay.paused ? c : u + f - new Date().getTime();
        t.autoplay.timeLeft = H,
        i("autoplayTimeLeft", H, H / o),
        a = requestAnimationFrame( () => {
            d()
        }
        )
    }
      , v = () => {
        let H;
        return t.virtual && t.params.virtual.enabled ? H = t.slides.filter(Z => Z.classList.contains("swiper-slide-active"))[0] : H = t.slides[t.activeIndex],
        H ? parseInt(H.getAttribute("data-swiper-autoplay"), 10) : void 0
    }
      , b = H => {
        if (t.destroyed || !t.autoplay.running)
            return;
        cancelAnimationFrame(a),
        d();
        let G = typeof H > "u" ? t.params.autoplay.delay : H;
        o = t.params.autoplay.delay,
        f = t.params.autoplay.delay;
        const Z = v();
        !Number.isNaN(Z) && Z > 0 && typeof H > "u" && (G = Z,
        o = Z,
        f = Z),
        c = G;
        const Se = t.params.speed
          , Te = () => {
            !t || t.destroyed || (t.params.autoplay.reverseDirection ? !t.isBeginning || t.params.loop || t.params.rewind ? (t.slidePrev(Se, !0, !0),
            i("autoplay")) : t.params.autoplay.stopOnLastSlide || (t.slideTo(t.slides.length - 1, Se, !0, !0),
            i("autoplay")) : !t.isEnd || t.params.loop || t.params.rewind ? (t.slideNext(Se, !0, !0),
            i("autoplay")) : t.params.autoplay.stopOnLastSlide || (t.slideTo(0, Se, !0, !0),
            i("autoplay")),
            t.params.cssMode && (u = new Date().getTime(),
            requestAnimationFrame( () => {
                b()
            }
            )))
        }
        ;
        return G > 0 ? (clearTimeout(l),
        l = setTimeout( () => {
            Te()
        }
        , G)) : requestAnimationFrame( () => {
            Te()
        }
        ),
        G
    }
      , x = () => {
        t.autoplay.running = !0,
        b(),
        i("autoplayStart")
    }
      , P = () => {
        t.autoplay.running = !1,
        clearTimeout(l),
        cancelAnimationFrame(a),
        i("autoplayStop")
    }
      , A = (H, G) => {
        if (t.destroyed || !t.autoplay.running)
            return;
        clearTimeout(l),
        H || (C = !0);
        const Z = () => {
            i("autoplayPause"),
            t.params.autoplay.waitForTransition ? t.wrapperEl.addEventListener("transitionend", S) : y()
        }
        ;
        if (t.autoplay.paused = !0,
        G) {
            I && (c = t.params.autoplay.delay),
            I = !1,
            Z();
            return
        }
        c = (c || t.params.autoplay.delay) - (new Date().getTime() - u),
        !(t.isEnd && c < 0 && !t.params.loop) && (c < 0 && (c = 0),
        Z())
    }
      , y = () => {
        t.isEnd && c < 0 && !t.params.loop || t.destroyed || !t.autoplay.running || (u = new Date().getTime(),
        C ? (C = !1,
        b(c)) : b(),
        t.autoplay.paused = !1,
        i("autoplayResume"))
    }
      , O = () => {
        if (t.destroyed || !t.autoplay.running)
            return;
        const H = ze();
        H.visibilityState === "hidden" && (C = !0,
        A(!0)),
        H.visibilityState === "visible" && y()
    }
      , M = H => {
        H.pointerType === "mouse" && (C = !0,
        !(t.animating || t.autoplay.paused) && A(!0))
    }
      , E = H => {
        H.pointerType === "mouse" && t.autoplay.paused && y()
    }
      , N = () => {
        t.params.autoplay.pauseOnMouseEnter && (t.el.addEventListener("pointerenter", M),
        t.el.addEventListener("pointerleave", E))
    }
      , q = () => {
        t.el.removeEventListener("pointerenter", M),
        t.el.removeEventListener("pointerleave", E)
    }
      , J = () => {
        ze().addEventListener("visibilitychange", O)
    }
      , j = () => {
        ze().removeEventListener("visibilitychange", O)
    }
    ;
    s("init", () => {
        t.params.autoplay.enabled && (N(),
        J(),
        u = new Date().getTime(),
        x())
    }
    ),
    s("destroy", () => {
        q(),
        j(),
        t.autoplay.running && P()
    }
    ),
    s("beforeTransitionStart", (H, G, Z) => {
        t.destroyed || !t.autoplay.running || (Z || !t.params.autoplay.disableOnInteraction ? A(!0, !0) : P())
    }
    ),
    s("sliderFirstMove", () => {
        if (!(t.destroyed || !t.autoplay.running)) {
            if (t.params.autoplay.disableOnInteraction) {
                P();
                return
            }
            p = !0,
            w = !1,
            C = !1,
            T = setTimeout( () => {
                C = !0,
                w = !0,
                A(!0)
            }
            , 200)
        }
    }
    ),
    s("touchEnd", () => {
        if (!(t.destroyed || !t.autoplay.running || !p)) {
            if (clearTimeout(T),
            clearTimeout(l),
            t.params.autoplay.disableOnInteraction) {
                w = !1,
                p = !1;
                return
            }
            w && t.params.cssMode && y(),
            w = !1,
            p = !1
        }
    }
    ),
    s("slideChange", () => {
        t.destroyed || !t.autoplay.running || (I = !0)
    }
    ),
    Object.assign(t.autoplay, {
        start: x,
        stop: P,
        pause: A,
        resume: y
    })
}
function pu(e) {
    const {effect: t, swiper: n, on: s, setTranslate: i, setTransition: r, overwriteParams: l, perspective: a, recreateShadows: o, getEffectParams: f} = e;
    s("beforeInit", () => {
        if (n.params.effect !== t)
            return;
        n.classNames.push(`${n.params.containerModifierClass}${t}`),
        a && a() && n.classNames.push(`${n.params.containerModifierClass}3d`);
        const u = l ? l() : {};
        Object.assign(n.params, u),
        Object.assign(n.originalParams, u)
    }
    ),
    s("setTranslate", () => {
        n.params.effect === t && i()
    }
    ),
    s("setTransition", (u, h) => {
        n.params.effect === t && r(h)
    }
    ),
    s("transitionEnd", () => {
        if (n.params.effect === t && o) {
            if (!f || !f().slideShadows)
                return;
            n.slides.forEach(u => {
                u.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach(h => h.remove())
            }
            ),
            o()
        }
    }
    );
    let c;
    s("virtualUpdate", () => {
        n.params.effect === t && (n.slides.length || (c = !0),
        requestAnimationFrame( () => {
            c && n.slides && n.slides.length && (i(),
            c = !1)
        }
        ))
    }
    )
}
function hu(e, t) {
    const n = Ul(t);
    return n !== t && (n.style.backfaceVisibility = "hidden",
    n.style["-webkit-backface-visibility"] = "hidden"),
    n
}
function gu(e) {
    let {swiper: t, duration: n, transformElements: s, allSlides: i} = e;
    const {activeIndex: r} = t
      , l = a => a.parentElement ? a.parentElement : t.slides.filter(f => f.shadowRoot && f.shadowRoot === a.parentNode)[0];
    if (t.params.virtualTranslate && n !== 0) {
        let a = !1, o;
        i ? o = s : o = s.filter(f => {
            const c = f.classList.contains("swiper-slide-transform") ? l(f) : f;
            return t.getSlideIndex(c) === r
        }
        ),
        o.forEach(f => {
            Yf(f, () => {
                if (a || !t || t.destroyed)
                    return;
                a = !0,
                t.animating = !1;
                const c = new window.CustomEvent("transitionend",{
                    bubbles: !0,
                    cancelable: !0
                });
                t.wrapperEl.dispatchEvent(c)
            }
            )
        }
        )
    }
}
function rd(e) {
    let {swiper: t, extendParams: n, on: s} = e;
    n({
        fadeEffect: {
            crossFade: !1
        }
    }),
    pu({
        effect: "fade",
        swiper: t,
        on: s,
        setTranslate: () => {
            const {slides: l} = t
              , a = t.params.fadeEffect;
            for (let o = 0; o < l.length; o += 1) {
                const f = t.slides[o];
                let u = -f.swiperSlideOffset;
                t.params.virtualTranslate || (u -= t.translate);
                let h = 0;
                t.isHorizontal() || (h = u,
                u = 0);
                const p = t.params.fadeEffect.crossFade ? Math.max(1 - Math.abs(f.progress), 0) : 1 + Math.min(Math.max(f.progress, -1), 0)
                  , w = hu(a, f);
                w.style.opacity = p,
                w.style.transform = `translate3d(${u}px, ${h}px, 0px)`
            }
        }
        ,
        setTransition: l => {
            const a = t.slides.map(o => Ul(o));
            a.forEach(o => {
                o.style.transitionDuration = `${l}ms`
            }
            ),
            gu({
                swiper: t,
                duration: l,
                transformElements: a,
                allSlides: !0
            })
        }
        ,
        overwriteParams: () => ({
            slidesPerView: 1,
            slidesPerGroup: 1,
            watchSlidesProgress: !0,
            spaceBetween: 0,
            virtualTranslate: !t.params.cssMode
        })
    })
}
export {Al as $, Ot as A, Tu as B, ln as C, le as D, $u as E, ve as F, Br as G, re as H, Re as I, ci as J, Mu as K, Gu as L, _l as M, ne as N, Q as O, Ku as P, Pe as Q, U as R, Fu as S, mt as T, Za as U, Zo as V, Cu as W, Kn as X, Wn as Y, yo as Z, Uu as _, fn as a, xl as a0, Wu as a1, Iu as a2, Ju as a3, Rt as a4, Qu as a5, yt as a6, Pu as a7, Ru as a8, Yu as a9, kn as aA, rt as aB, Xu as aC, Ke as aD, Hu as aE, ia as aF, Du as aG, nd as aH, id as aI, rd as aJ, sd as aK, ku as aa, Lu as ab, Nu as ac, ju as ad, mu as ae, Ja as af, ca as ag, td as ah, ed as ai, Cl as aj, Eu as ak, _u as al, an as am, on as an, Zu as ao, k as ap, qu as aq, Bu as ar, Gs as as, Ou as at, Vu as au, sa as av, oo as aw, Au as ax, Cn as ay, pe as az, wu as b, ue as c, ta as d, vu as e, Il as f, bo as g, zu as h, Pn as i, Ae as j, Xr as k, yu as l, ge as m, $r as n, la as o, ri as p, bu as q, Xs as r, $o as s, xu as t, Dr as u, of as v, qt as w, Su as x, jo as y, ee as z};
