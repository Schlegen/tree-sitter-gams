- [x] Add * as index

- [ ] manage table format def

```
Variable Table x(i,j) initial values
                            l      m
    seattle.  new-york      50
    seattle.  chicago      300
    san-diego.new-york     275
    san-diego.chicago           0.009;
```

idem add table format for Equation

- [x] Add dollar options -> will be done in the LSP

- [x] Not managing * as comment :/ -> will be done in the LSP

- [x] check that there is a number at the end of the indexes in case we have row1*row7

- [x] add variable values (.scale, .l, .up, .lo)

- [x] add variables assignment

- [x] add indexed operators (sum, prod, smax, smin)

- [x] add loops

- [x] add unary expressions : abs, ord, round ... 

- [x] add binary expressions : uniform, mod, round ...

- [x] add bools ("yes", "no")

- [x] add ifthenelse control flow

- [ ] replace unary_function_expr and binary_function_expr by multi args.

- [ ] add equation assignment

- [ ] add model declaration

- [ ] acronym statements

- [ ] add display

- [ ] add table

- [ ] abort

- [ ] add testbase from all gams examples

```
solve ml using lp minimizing z;
if (ml.modelstat = 4,
     display "model ml was infeasible, relax bounds on x and solve again";
     x.up(j) = 2*x.up(j) ;
     solve ml using lp minimizing z ;
else
    if (ml.modelstat <> 1,
        abort "error solving model ml" ;
    );
);
```