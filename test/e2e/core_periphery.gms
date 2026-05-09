# Core and periphery economic model (FKV)
# Demonstrates nested loops, MCP solver, complex nonlinear equations.
# Source: https://github.com/ShiroTakeda/gams-mode/blob/master/sample_gams_code/outline-sample.gms
# Adapted: * comments converted to #, $-directives removed, `log` renamed to `logval`

Set itr 'iterations over lambda' / iter1*iter11 /
    tc  'iterations over transport cost' / 1*5 / ;

Parameters
    lowest   'lowest transport cost'
    highest  'highest transport cost' ;

lowest  = 1.3 ;
highest = 2 ;

Parameters
    mu    'expenditure share on manufactured goods'
    sig   'elasticity of substitution'
    sigm  'one minus sig'
    vt    'value of transport cost'
    lam   'share of workers in region one' ;

Variables
    wone   'nominal wage of region one'
    wtwo   'nominal wage of region two'
    omeone 'real wage of region one'
    ometwo 'real wage of region two'
    ratio  'ratio of real wages' ;

Equations
    weqone  'wage equation for wone'
    weqtwo  'wage equation for wtwo'
    rweqone 'real wage equation for omega one'
    rweqtwo 'real wage equation for omega two'
    eqratio 'equation for ratio' ;

weqone ..
    (wone**sig)
    =e= (mu * lam * wone + (1-mu) / 2)
      / (lam * (wone**sigm) + (1-lam) * ((wtwo * vt)**sigm))
      + ((mu * (1-lam) * wtwo + (1-mu)/2) * (vt**sigm))
      / (lam * ((wone * vt)**sigm) + (1-lam) * (wtwo**sigm)) ;

weqtwo ..
    (wtwo**sig)
    =e= ((mu * lam * wone + (1-mu)/2) * (vt**sigm))
      / (lam * (wone**sigm) + (1-lam) * ((wtwo * vt)**sigm))
      + (mu * (1-lam) * wtwo + (1-mu) / 2)
      / (lam * (wone * vt)**sigm + (1-lam) * (wtwo**sigm)) ;

rweqone ..
    omeone =e= wone * (lam * (wone**sigm)
        + (1-lam) * ((wtwo * vt)**sigm))**(-mu/sigm) ;

rweqtwo ..
    ometwo =e= wtwo * (lam * ((wone * vt)**sigm)
        + (1-lam) * (wtwo**sigm))**(-mu/sigm) ;

eqratio .. ratio =e= omeone / ometwo ;

Model fkv 'core and periphery model' / weqone, weqtwo, rweqone, rweqtwo, eqratio / ;

mu   = 0.4 ;
sig  = 5 ;
sigm = 1 - sig ;

Parameters
    lambda(itr)      'value of lam'
    iterlog(itr,tc,*) 'iteration logval'
    logval(itr,tc)      'ratio of real wages' ;

Parameters
    count1
    count2 ;

Parameters
    wone0   'initial value of wone'
    wtwo0   'initial value of wtwo'
    omeone0 'initial value of omeone'
    ometwo0 'initial value of ometwo' ;

loop(tc,
    count2 = (ord(tc) - 1) / (card(tc) - 1) ;
    vt = (1 - count2) * lowest + count2 * highest ;

    wone0   = 2 ;
    wtwo0   = 2 ;
    omeone0 = 2 ;
    ometwo0 = 2 ;

    loop(itr,
        count1      = (ord(itr) - 1) / (card(itr) - 1) ;
        lambda(itr) = (1 - count1) * 0 + count1 * 1 ;
        lam         = lambda(itr) ;

        wone.l   = wone0 ;
        wtwo.l   = wtwo0 ;
        omeone.l = omeone0 ;
        ometwo.l = ometwo0 ;

        fkv.iterlim = 3000 ;
        solve fkv using mcp ;

        iterlog(itr, tc, 'omone')   = omeone.l ;
        iterlog(itr, tc, 'omtwo')   = ometwo.l ;
        iterlog(itr, tc, 'omratio') = ratio.l ;
        logval(itr, tc) = iterlog(itr, tc, 'omratio') ;

        wone0   = wone.l ;
        wtwo0   = wtwo.l ;
        omeone0 = omeone.l ;
        ometwo0 = ometwo.l ;
    ) ;
) ;

Display logval ;
