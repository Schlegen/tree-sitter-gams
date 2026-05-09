# For loops
Scalar cnt;

for(cnt = 1 to 10,
    x(cnt) = cnt * 2;
);

for(cnt = 10 downto 1,
    display cnt;
);

for(cnt = 1 to 20 by 2,
    y(cnt) = cnt + 1;
);

# While loops
while(cnt < 10,
    cnt = cnt + 1;
);

while(abs(x - target) > tol,
    x = x - f(x) / df(x);
    iter = iter + 1;
);

# Repeat-until loops
repeat(
    cnt = cnt + 1;
    display cnt;
until cnt >= 5);

repeat(
    a = a + 1;
until a = 10);

# Break and continue
loop(i,
    break$(sameas('i6', i));
    cnt = cnt + 1;
);

loop(i,
    continue$(mod(ord(i), 2) = 0);
    cnt = cnt + 1;
);

loop((i,j),
    break$(x(i,j) > 100) 2;
);

# Nested loops with break
for(cnt = 1 to 100,
    x = sqrt(cnt);
    break$(x > 5);
);
