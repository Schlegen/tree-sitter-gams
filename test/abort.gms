# Abort statements

abort "this model has infeasibilities";

abort$(target <= 0) "argument must be positive";

abort$(p > 3) "parameter too large", p;

abort.noError "stopping early for inspection", x;

loop(i,
    abort$(p(i) > 3) "Parameter larger than 3", p;
);
