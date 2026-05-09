# Option statements

option reslim = 800;

option LP = cplex;

option NLP = default;

option optcr = 0.001;

option limcol = 100;

option reslim = 800, optcr = 0.001, MIP = xpress;

options reslim = 3600
        optcr = 0.0
        limrow = 0;

option x:4;

option x:4:2:1;

option clear = x;

option solprint = off;
