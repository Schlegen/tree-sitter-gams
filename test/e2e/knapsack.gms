# Binary knapsack problem (KNAPSACK, SEQ=436)
# Kellerer, Pferschy, Pisinger. Knapsack Problems. Springer 2004. p.3.
# Source: https://www.gams.com/latest/gamslib_ml/libhtml/gamslib_knapsack.html
# Adapted: $Title/$Ontext/$Offtext directives and * comments removed

Set i 'items' / i1*i10 / ;

Parameters
    p(i) 'profits'
    w(i) 'weights' ;

Scalar c 'capacity' / 269 / ;

Free Variable z 'objective' ;
Binary Variable x(i) 'choice' ;

Equations cap_restr, utility ;

cap_restr .. sum(i, w(i)*x(i)) =l= c ;
utility   .. z =e= sum(i, p(i)*x(i)) ;

z.lo = 0 ;

Model knapsack /all/ ;

Table data(i, *)
       p   w
i1    55  95
i2    10   4
i3    47  60
i4     5  32
i5     4  23
i6    50  72
i7     8  80
i8    61  62
i9    85  65
i10   87  46 ;

p(i) = data(i,'p') ;
w(i) = data(i,'w') ;

Solve knapsack using mip maximizing z ;
