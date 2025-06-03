import {u as R, d as h, E as ie} from "./BAI9wOt_.js";
import {t as L, m as B, n as S, a7 as de, a9 as z, p as Y, a2 as pe, ag as ce, G as x, Q as ue, D as q, a1 as fe, ah as me, q as ve, _ as be} from "./BFLkLLaT.js";
import {d as O, S as k, c as $, p as G, i as ge, C as Q, u as r, am as he, f as I, J as y, a0 as ye, V as D, L as _, X as N, Z as U, a1 as K, aj as Z, U as Ce, H as J, r as Ee, w as F, M as T, Y as Ie, F as j, ab as H, N as V, k as _e, D as we, aq as Se, n as Ne} from "./vBK9FDfF.js";
import {u as $e} from "./BpciMA5l.js";
import {U as ee, C as te} from "./BB_Ol6Sd.js";
import {u as ke, a as Oe} from "./QXLBCXsZ.js";
import {u as Te, a as Be} from "./CBiSl3QW.js";
import {d as Le} from "./Cq9Fpw4b.js";
import {d as Ae} from "./BehbX2AX.js";
const Pe = O({
    inheritAttrs: !1
});
function Ve(n, l, o, t, v, c) {
    return k(n.$slots, "default")
}
var Me = L(Pe, [["render", Ve], ["__file", "collection.vue"]]);
const Re = O({
    name: "ElCollectionItem",
    inheritAttrs: !1
});
function ze(n, l, o, t, v, c) {
    return k(n.$slots, "default")
}
var De = L(Re, [["render", ze], ["__file", "collection-item.vue"]]);
const Ue = "data-el-collection-item"
  , Fe = n => {
    const l = `El${n}Collection`
      , o = `${l}Item`
      , t = Symbol(l)
      , v = Symbol(o)
      , c = {
        ...Me,
        name: l,
        setup() {
            const p = $(null)
              , m = new Map;
            G(t, {
                itemMap: m,
                getItems: () => {
                    const a = r(p);
                    if (!a)
                        return [];
                    const d = Array.from(a.querySelectorAll(`[${Ue}]`));
                    return [...m.values()].sort( (g, u) => d.indexOf(g.ref) - d.indexOf(u.ref))
                }
                ,
                collectionRef: p
            })
        }
    }
      , b = {
        ...De,
        name: o,
        setup(p, {attrs: m}) {
            const f = $(null)
              , a = ge(t, void 0);
            G(v, {
                collectionItemRef: f
            }),
            Q( () => {
                const d = r(f);
                d && a.itemMap.set(d, {
                    ref: d,
                    ...m
                })
            }
            ),
            he( () => {
                const d = r(f);
                a.itemMap.delete(d)
            }
            )
        }
    };
    return {
        COLLECTION_INJECTION_KEY: t,
        COLLECTION_ITEM_INJECTION_KEY: v,
        ElCollection: c,
        ElCollectionItem: b
    }
}
  , M = B({
    trigger: R.trigger,
    effect: {
        ...h.effect,
        default: "light"
    },
    type: {
        type: S(String)
    },
    placement: {
        type: S(String),
        default: "bottom"
    },
    popperOptions: {
        type: S(Object),
        default: () => ({})
    },
    id: String,
    size: {
        type: String,
        default: ""
    },
    splitButton: Boolean,
    hideOnClick: {
        type: Boolean,
        default: !0
    },
    loop: {
        type: Boolean,
        default: !0
    },
    showTimeout: {
        type: Number,
        default: 150
    },
    hideTimeout: {
        type: Number,
        default: 150
    },
    tabindex: {
        type: S([Number, String]),
        default: 0
    },
    maxHeight: {
        type: S([Number, String]),
        default: ""
    },
    popperClass: {
        type: String,
        default: ""
    },
    disabled: Boolean,
    role: {
        type: String,
        default: "menu"
    },
    buttonProps: {
        type: S(Object)
    },
    teleported: h.teleported
});
B({
    command: {
        type: [Object, String, Number],
        default: () => ({})
    },
    disabled: Boolean,
    divided: Boolean,
    textValue: String,
    icon: {
        type: de
    }
});
B({
    onKeydown: {
        type: S(Function)
    }
});
Fe("Dropdown");
const je = B({
    trigger: R.trigger,
    placement: M.placement,
    disabled: R.disabled,
    visible: h.visible,
    transition: h.transition,
    popperOptions: M.popperOptions,
    tabindex: M.tabindex,
    content: h.content,
    popperStyle: h.popperStyle,
    popperClass: h.popperClass,
    enterable: {
        ...h.enterable,
        default: !0
    },
    effect: {
        ...h.effect,
        default: "light"
    },
    teleported: h.teleported,
    title: String,
    width: {
        type: [String, Number],
        default: 150
    },
    offset: {
        type: Number,
        default: void 0
    },
    showAfter: {
        type: Number,
        default: 0
    },
    hideAfter: {
        type: Number,
        default: 200
    },
    autoClose: {
        type: Number,
        default: 0
    },
    showArrow: {
        type: Boolean,
        default: !0
    },
    persistent: {
        type: Boolean,
        default: !0
    },
    "onUpdate:visible": {
        type: Function
    }
})
  , He = {
    "update:visible": n => z(n),
    "before-enter": () => !0,
    "before-leave": () => !0,
    "after-enter": () => !0,
    "after-leave": () => !0
}
  , Xe = "onUpdate:visible"
  , qe = O({
    name: "ElPopover"
})
  , Ge = O({
    ...qe,
    props: je,
    emits: He,
    setup(n, {expose: l, emit: o}) {
        const t = n
          , v = I( () => t[Xe])
          , c = Y("popover")
          , b = $()
          , p = I( () => {
            var e;
            return (e = r(b)) == null ? void 0 : e.popperRef
        }
        )
          , m = I( () => [{
            width: pe(t.width)
        }, t.popperStyle])
          , f = I( () => [c.b(), t.popperClass, {
            [c.m("plain")]: !!t.content
        }])
          , a = I( () => t.transition === `${c.namespace.value}-fade-in-linear`)
          , d = () => {
            var e;
            (e = b.value) == null || e.hide()
        }
          , i = () => {
            o("before-enter")
        }
          , g = () => {
            o("before-leave")
        }
          , u = () => {
            o("after-enter")
        }
          , C = () => {
            o("update:visible", !1),
            o("after-leave")
        }
        ;
        return l({
            popperRef: p,
            hide: d
        }),
        (e, A) => (y(),
        ye(r(ie), Ce({
            ref_key: "tooltipRef",
            ref: b
        }, e.$attrs, {
            trigger: e.trigger,
            placement: e.placement,
            disabled: e.disabled,
            visible: e.visible,
            transition: e.transition,
            "popper-options": e.popperOptions,
            tabindex: e.tabindex,
            content: e.content,
            offset: e.offset,
            "show-after": e.showAfter,
            "hide-after": e.hideAfter,
            "auto-close": e.autoClose,
            "show-arrow": e.showArrow,
            "aria-label": e.title,
            effect: e.effect,
            enterable: e.enterable,
            "popper-class": r(f),
            "popper-style": r(m),
            teleported: e.teleported,
            persistent: e.persistent,
            "gpu-acceleration": r(a),
            "onUpdate:visible": r(v),
            onBeforeShow: i,
            onBeforeHide: g,
            onShow: u,
            onHide: C
        }), {
            content: D( () => [e.title ? (y(),
            _("div", {
                key: 0,
                class: N(r(c).e("title")),
                role: "title"
            }, U(e.title), 3)) : K("v-if", !0), k(e.$slots, "default", {}, () => [Z(U(e.content), 1)])]),
            default: D( () => [e.$slots.reference ? k(e.$slots, "reference", {
                key: 0
            }) : K("v-if", !0)]),
            _: 3
        }, 16, ["trigger", "placement", "disabled", "visible", "transition", "popper-options", "tabindex", "content", "offset", "show-after", "hide-after", "auto-close", "show-arrow", "aria-label", "effect", "enterable", "popper-class", "popper-style", "teleported", "persistent", "gpu-acceleration", "onUpdate:visible"]))
    }
});
var Ke = L(Ge, [["__file", "popover.vue"]]);
const W = (n, l) => {
    const o = l.arg || l.value
      , t = o == null ? void 0 : o.popperRef;
    t && (t.triggerRef = n)
}
;
var Je = {
    mounted(n, l) {
        W(n, l)
    },
    updated(n, l) {
        W(n, l)
    }
};
const We = "popover"
  , Ye = ce(Je, We)
  , mt = x(Ke, {
    directive: Ye
})
  , xe = B({
    options: {
        type: S(Array),
        default: () => []
    },
    modelValue: {
        type: [String, Number, Boolean],
        default: void 0
    },
    block: Boolean,
    size: ue,
    disabled: Boolean,
    validateEvent: {
        type: Boolean,
        default: !0
    },
    id: String,
    name: String,
    ...$e(["ariaLabel"])
})
  , Qe = {
    [ee]: n => J(n) || q(n) || z(n),
    [te]: n => J(n) || q(n) || z(n)
}
  , Ze = O({
    name: "ElSegmented"
})
  , et = O({
    ...Ze,
    props: xe,
    emits: Qe,
    setup(n, {emit: l}) {
        const o = n
          , t = Y("segmented")
          , v = fe()
          , c = ke()
          , b = Oe()
          , {formItem: p} = Te()
          , {inputId: m, isLabeledByFormItem: f} = Be(o, {
            formItemContext: p
        })
          , a = $(null)
          , d = me()
          , i = Ee({
            isInit: !1,
            width: 0,
            translateX: 0,
            disabled: !1,
            focusVisible: !1
        })
          , g = s => {
            const E = u(s);
            l(ee, E),
            l(te, E)
        }
          , u = s => V(s) ? s.value : s
          , C = s => V(s) ? s.label : s
          , e = s => !!(b.value || V(s) && s.disabled)
          , A = s => o.modelValue === u(s)
          , oe = s => o.options.find(E => u(E) === s)
          , se = s => [t.e("item"), t.is("selected", A(s)), t.is("disabled", e(s))]
          , P = () => {
            if (!a.value)
                return;
            const s = a.value.querySelector(".is-selected")
              , E = a.value.querySelector(".is-selected input");
            if (!s || !E) {
                i.width = 0,
                i.translateX = 0,
                i.disabled = !1,
                i.focusVisible = !1;
                return
            }
            const w = s.getBoundingClientRect();
            i.isInit = !0,
            i.width = w.width,
            i.translateX = s.offsetLeft,
            i.disabled = e(oe(o.modelValue));
            try {
                i.focusVisible = E.matches(":focus-visible")
            } catch {}
        }
          , ne = I( () => [t.b(), t.m(c.value), t.is("block", o.block)])
          , ae = I( () => ({
            width: `${i.width}px`,
            transform: `translateX(${i.translateX}px)`,
            display: i.isInit ? "block" : "none"
        }))
          , le = I( () => [t.e("item-selected"), t.is("disabled", i.disabled), t.is("focus-visible", i.focusVisible)])
          , re = I( () => o.name || v.value);
        return ve(a, P),
        F(d, P),
        F( () => o.modelValue, () => {
            var s;
            P(),
            o.validateEvent && ((s = p == null ? void 0 : p.validate) == null || s.call(p, "change").catch(E => Le()))
        }
        , {
            flush: "post"
        }),
        (s, E) => (y(),
        _("div", {
            id: r(m),
            ref_key: "segmentedRef",
            ref: a,
            class: N(r(ne)),
            role: "radiogroup",
            "aria-label": r(f) ? void 0 : s.ariaLabel || "segmented",
            "aria-labelledby": r(f) ? r(p).labelId : void 0
        }, [T("div", {
            class: N(r(t).e("group"))
        }, [T("div", {
            style: Ie(r(ae)),
            class: N(r(le))
        }, null, 6), (y(!0),
        _(j, null, H(s.options, (w, X) => (y(),
        _("label", {
            key: X,
            class: N(se(w))
        }, [T("input", {
            class: N(r(t).e("item-input")),
            type: "radio",
            name: r(re),
            disabled: e(w),
            checked: A(w),
            onChange: nt => g(w)
        }, null, 42, ["name", "disabled", "checked", "onChange"]), T("div", {
            class: N(r(t).e("item-label"))
        }, [k(s.$slots, "default", {
            item: w
        }, () => [Z(U(C(w)), 1)])], 2)], 2))), 128))], 2)], 10, ["id", "aria-label", "aria-labelledby"]))
    }
});
var tt = L(et, [["__file", "segmented.vue"]]);
const vt = x(tt)
  , ot = {
    class: "w-full"
}
  , st = {
    __name: "CommentLayout",
    props: {
        items: {
            type: Array,
            default: () => []
        },
        breakpoints: {
            type: Object,
            default: () => ({
                "3xl": 1980,
                xl: 1280,
                md: 768,
                sm: 640
            })
        }
    },
    setup(n) {
        const l = n
          , o = $(4)
          , t = $([])
          , v = $([]);
        let c = !1;
        const b = () => {
            v.value = Array(o.value).fill(0),
            t.value = Array.from({
                length: o.value
            }, () => [])
        }
          , p = a => {
            const d = Math.floor(a.length / t.value.length)
              , i = a.length % t.value.length
              , g = [];
            let u = 0;
            for (let C = 0; C < t.value.length; C++) {
                const e = d + (C < i ? 1 : 0);
                g.push(a.slice(u, u + e)),
                u += e
            }
            t.value = g,
            Ne( () => {
                window.HSStaticMethods.autoInit()
            }
            )
        }
          , m = () => {
            const a = window.innerWidth;
            if (a >= l.breakpoints["3xl"] || a >= l.breakpoints.xl ? o.value = 4 : a >= l.breakpoints.md || a > l.breakpoints.sm ? o.value = 2 : o.value = 1,
            t.value.length !== o.value) {
                const d = l.items;
                b(),
                p(d),
                c = !0
            }
        }
          , f = Ae(m, 200);
        return F( () => l.items, a => {
            c && (b(),
            p(a))
        }
        , {
            immediate: !0
        }),
        Q( () => {
            m(),
            p(l.items),
            window.addEventListener("resize", f)
        }
        ),
        _e( () => {
            window.removeEventListener("resize", f)
        }
        ),
        (a, d) => (y(),
        _("div", ot, [T("div", {
            class: N(`grid grid-cols-${r(o)} gap-x-6`)
        }, [(y(!0),
        _(j, null, H(r(t), (i, g) => (y(),
        _("div", {
            key: "column-" + g,
            class: "w-full flex flex-col gap-6"
        }, [we(Se, null, {
            default: D( () => [(y(!0),
            _(j, null, H(i, (u, C) => (y(),
            _("div", {
                key: `col-${C}`,
                class: "w-full"
            }, [k(a.$slots, "default", {
                item: u
            }, void 0, !0)]))), 128))]),
            _: 2
        }, 1024)]))), 128))], 2)]))
    }
}
  , bt = be(st, [["__scopeId", "data-v-84cc548b"]]);
export {vt as E, bt as _, mt as a};
