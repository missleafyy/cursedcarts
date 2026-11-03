#!/usr/bin/env python3
"""One lift and one set-down sound per material (grab_x0 / put_x0). Run, then tools/pack_sounds.py."""
src = open('tools/make_sounds.py').read().split('# ------------------------------------------------ hands and objects')[0]
exec(src)
def rattle(n, span, lo, hi, v=.8, seed=3):
    r = np.random.default_rng(seed); ts = np.sort(r.uniform(0, span, n)); o = []
    for k, t in enumerate(ts): o.append((burst(.016, lo, hi, .004 + .002 * (k % 3)), float(t), v * (1 - .5 * k / n)))
    return mix(*o)
def crinkle(d, seed):
    r = np.random.default_rng(seed); o = [(burst(d, 1800, 9000, d * .5), 0, .25)]
    for t in r.uniform(0, d * .8, 9): o.append((burst(.012, 2500, 10000, .003), float(t), .7))
    return mix(*o)
M = {
 'cart':   (lambda: mix((modal([(1100, .7, .010), (2450, .45, .007)], .06), 0, .8), (burst(.012, 900, 5000, .003), 0, .5)),
            lambda: mix((thump(190, 120, .018, .1), 0, .8), (modal([(820, .7, .014), (1750, .45, .008)], .08), 0, .9), (modal([(1000, .3, .008)], .05), .032, .45))),
 'gadget': (lambda: mix((modal([(620, .6, .014), (1500, .35, .009)], .07), 0, .7), (rattle(3, .03, 2500, 7000, .35), .005, 1)),
            lambda: mix((thump(160, 90, .03, .14), 0, 1), (modal([(520, .6, .02), (1250, .3, .01)], .1), 0, .7), (rattle(3, .04, 2500, 7000, .3), .01, 1))),
 'heavy':  (lambda: mix((thump(120, 80, .05, .2), 0, .5), (modal([(300, .5, .03)], .12), .01, .5), (burst(.04, 200, 1500, .015), 0, .4)),
            lambda: mix((thump(95, 48, .1, .35), 0, 1.2), (modal([(240, .6, .05), (640, .25, .02)], .2), 0, .6), (rattle(4, .07, 1500, 5000, .22), .02, 1))),
 'soft':   (lambda: burst(.09, 250, 2200, .035), lambda: mix((thump(90, 60, .05, .15), 0, .55), (burst(.1, 200, 1600, .035), 0, .7))),
 'paper':  (lambda: crinkle(.08, 11), lambda: mix((burst(.045, 900, 6000, .016), 0, .8), (thump(150, 90, .012, .05), 0, .25))),
 'crinkle':(lambda: crinkle(.16, 12), lambda: mix((crinkle(.13, 13), 0, 1), (thump(110, 70, .03, .08), 0, .35))),
 'can':    (lambda: mix((modal([(1750, .7, .03), (3300, .35, .018)], .12), 0, .55), (burst(.05, 600, 2500, .02), .01, .18)),
            lambda: mix((thump(180, 110, .02, .08), 0, .55), (modal([(1320, .7, .05), (2710, .4, .03), (4300, .15, .015)], .18), 0, .75), (burst(.08, 500, 2000, .03), .012, .22))),
 'glass':  (lambda: modal([(3100, .55, .05), (5200, .3, .03)], .18),
            lambda: mix((thump(240, 160, .012, .05), 0, .4), (modal([(2350, .6, .09), (3950, .4, .06), (6100, .2, .03)], .3), 0, .8))),
 'pills':  (lambda: rattle(11, .14, 2200, 8000, .6, 5), lambda: mix((rattle(14, .18, 2200, 8000, .6, 6), .01, 1), (thump(170, 110, .015, .06), 0, .5))),
 'metal':  (lambda: modal([(2100, .5, .035), (3900, .3, .02)], .15),
            lambda: mix((modal([(1480, .6, .06), (2950, .35, .035), (5150, .2, .015)], .22), 0, .8), (modal([(1600, .3, .03)], .1), .05, .4))),
 'gun':    (lambda: mix((thump(150, 100, .03, .12), 0, .5), (modal([(1050, .5, .02), (2600, .3, .012)], .08), 0, .7), (burst(.012, 2000, 7000, .003), .07, .5)),
            lambda: mix((thump(110, 60, .07, .25), 0, 1.1), (modal([(420, .6, .03), (960, .4, .025)], .14), 0, .8), (burst(.012, 2000, 7000, .003), .05, .4))),
 'box':    (lambda: mix((burst(.07, 300, 2600, .025), 0, .7), (thump(130, 90, .03, .1), 0, .4)),
            lambda: mix((thump(105, 60, .06, .2), 0, 1), (burst(.07, 250, 2200, .025), 0, .6), (modal([(340, .5, .025)], .1), 0, .4))),
 'food':   (lambda: mix((burst(.05, 500, 3200, .02), 0, .5), (thump(170, 120, .03, .08), 0, .25)),
            lambda: mix((thump(120, 75, .04, .12), 0, .7), (burst(.05, 400, 2600, .018), 0, .55))),
}
for k, (g, p) in M.items():
    save(f'grab_{k}0', room(g(), .06, .08), .55); save(f'put_{k}0', room(p(), .08, .1), .7)
# PA: the two-note mall chime, then a little line hum
save('pa0', room(mix((modal([(784,.8,.28),(1568,.25,.12)],.7),0,.8),(modal([(622,.8,.34),(1244,.25,.14)],.9),.32,.8)),.35,.3), .6)
