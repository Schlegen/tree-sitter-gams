# Table declarations

Table transport(i,j)  "shipping costs ($ per case)"
              new-york  chicago  topeka
  seattle         2.5      1.7     1.8
  san-diego       2.5      1.8     1.4 ;

Table attrib(ci, cr, q)  "blending attributes"
                    density   sulfur
    naphtha.mid-c     272      .283
    naphtha.w-tex     272      1.48 ;

Table ka(m,i) ;

Table demand(i,j) "demand data"
          q1    q2    q3    q4
    prod1  10    20    30    40
    prod2  15    25    35    45 ;
