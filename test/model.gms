Model one   "first model"                             / tcost_eq, supply_eq, demand_eq /
      two   "second model that nests first"           / one, balance_eq /
      three "third model that nests first and second" / two, capacity_eq, configure_eq /;

Model four "fourth model: model three minus model one"         / three-one /
      five "fifth model: model three without eqn configure_eq" / three-configure_eq /
      six  "sixth model: model four plus model two"            / four+two /;

Model  nortonl   "linear version"      / cb,rc,dfl,bc,obj /
       nortonn   "nonlinear version"   / cb,rc,dfn,bc,obj /
       nortone   "expenditure version" / cb,rc,dfe,bc,obj /;

Model transport "a transportation model" / all /;