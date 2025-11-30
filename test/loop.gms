loop(i$(curacc > reltol),
       value(i+1) =  0.5*(value(i) + target / value(i));
       sqrtval    =  value(i);
       curacc     =  abs (value(i)-value(i))/(1+abs(value(i)))
);
loop( (i,j) $ (q(i,j) > 0), x = x + q(i,j));
loop ( i $ (c(i) + c(i)**2), z = z + 1);
loop ( i $ sum(j, abs(q(i,j))), z = z + 1);
loop ( j $ (ord(j) > 1 and ord(j) < card(j)), z = z + 1);
loop ( (i,j) $ k(i,j), y = y + ord(i) + 2*ord(j));
loop(i$(curacc > reltol),
       value(i+1) =  0.5*(value(i) + target/value(i));
       sqrtval    =  value(i+1);
       curacc     =  abs (value(i+1)-value(i))/(1+abs(value(i+1)))
) ;