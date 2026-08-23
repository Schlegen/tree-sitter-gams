module.exports = grammar({
  name: 'gams',

  extras: $ => [
    /\s/,
    $.comment
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat(
      choice(
        $.statement,
        $.comment
      )
    ),

    statement: $ => prec(30,
      seq(
        $.statement_without_semicolon,
        ';'
      )
    ),

    statement_without_semicolon: $ =>
      prec(25,
        choice(
          prec(20, $.loop_statement),
          prec(20, $.if_statement),
          prec(20, $.for_statement),
          prec(20, $.while_statement),
          prec(20, $.repeat_statement),

          prec(11, $.variable_table_declaration),
          prec(10, $.set_declaration),
          prec(10, $.table_declaration),
          prec(9, $.parameter_declaration),
          prec(9, $.scalar_declaration),
          prec(9, $.variable_declaration),
          prec(9, $.equation_declaration),
          prec(9, $.model_declaration),
          prec(9, $.solve_statement),
          prec(9, $.display_statement),
          prec(9, $.option_statement),
          prec(9, $.acronym_declaration),

          $.alias_declaration,
          $.break_statement,
          $.continue_statement,
          $.abort_statement,
          prec(2, $.equation_definition),
          prec(1, $.assignment_statement)
        )
    ),

    // utils
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    set_element: $ => /[a-zA-Z_][a-zA-Z0-9_\-]*/,
    set_element_selection: $ => choice(
      $.set_element,
      seq(
        token("("), commaSep1($.set_element), token(")")
      ),
      seq($.set_element, "*", $.set_element),
      seq($.number, "*", $.number)
    ),

    identifier_with_domain: $ =>
      prec(3,
        seq(
          $.identifier,
          token.immediate('('),
          $.identifier_with_domain_args,
          ')'
        )
    ),

    identifier_with_domain_args: $ =>
      seq(
        choice($.identifier, '*'),
        optional(
          prec(3, repeat(seq(',', choice($.identifier, '*'))))
        )
      ),

    indexed_reference: $ => 
      prec(2,
        seq(
          $.identifier,
          optional(
            seq(
              token.immediate('.'),
              $.variable_attribute_keyword
            )
          ),
          token.immediate('('),
          $.indexed_reference_args,
          ')'
        )
      ),

    reference: $ => 
      prec(2,
        seq(
          $.identifier,
          token.immediate('.'),
          $.variable_attribute_keyword
        )
      ),

    indexed_reference_args: $ =>
      seq(
        $.index_element,
        optional(
          prec(2, repeat(
            seq(
            ',',
            $.index_element
          )
        )))
      ),
    
    index_element: $ =>
      choice(
          $.string,
          seq($.identifier, '*', $.identifier),
          seq($.identifier, '+', $.number),
          seq($.number, '*', $.number),
          $.identifier_with_domain,
          $.identifier,
          $.number
        ),

    variable_attribute_keyword: $ =>
      choice(
        token.immediate(caseInsensitive('up')),
        token.immediate(caseInsensitive('lo')),
        token.immediate(caseInsensitive('l')),
        token.immediate(caseInsensitive('fx')),
        token.immediate(caseInsensitive('scale')),
        token.immediate(caseInsensitive('m')),
        // equation attributes
        token.immediate(caseInsensitive('infeas')),
        token.immediate(caseInsensitive('range')),
        // set element attributes
        token.immediate(caseInsensitive('val')),   // numeric value of set element
        token.immediate(caseInsensitive('tl')),    // text label of set element
        token.immediate(caseInsensitive('te')),    // element text in legend
        token.immediate(caseInsensitive('ord')),   // ordinal value (alias for ord() in some contexts)
        // model solve result attributes (e.g. ml.modelstat)
        token.immediate(caseInsensitive('modelstat')),
        token.immediate(caseInsensitive('solvestat')),
        token.immediate(caseInsensitive('objval')),
        token.immediate(caseInsensitive('objest')),
        token.immediate(caseInsensitive('resusd')),
        token.immediate(caseInsensitive('iterusd')),
        token.immediate(caseInsensitive('nodusd')),
        token.immediate(caseInsensitive('numinfes')),
        token.immediate(caseInsensitive('prior')),
        // model solver control attributes (e.g. fkv.iterlim = 3000)
        token.immediate(caseInsensitive('iterlim')),
        token.immediate(caseInsensitive('reslim')),
        token.immediate(caseInsensitive('optfile')),
        token.immediate(caseInsensitive('optcr')),
        token.immediate(caseInsensitive('optca')),
        token.immediate(caseInsensitive('bratio')),
        token.immediate(caseInsensitive('trylinear')),
      ),
      
    number: $ => /[+-]?(?:\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/,

    bool: $ => choice('yes', 'no'),

    comment: $ => token(seq('#', /.*/)),

    string: $ => choice(
      seq('"', repeat(/[^"]/), '"'),
      seq("'", repeat(/[^']/), "'")
    ),

    // set declaration

    set_keyword: $ => prec(10, choice(
      token.immediate(caseInsensitive('set')),
      token.immediate(caseInsensitive('sets'))
    )),

    set_declaration: $ => prec(10, seq(
      $.set_keyword,
      commaOrNewlineSep1($.set_entry)
      )
    ),

    set_entry: $ => seq(
      choice(
        $.identifier_with_domain,
        $.identifier,               // set_name
      ),                
      optional($.string),           // ["text"]
      optional($.element_block)     // [/element [text], .../]
    ),

    element_block: $ => seq(
        '/',
        optional(
          choice(
            commaOrNewlineSep1Trailing($.element_entry),
            seq($.set_element, '*', $.set_element),
            seq($.number, '*', $.number)
          )
        ),
        '/'
    ),

    element_entry: $ => seq(
      $.set_element,
      optional($.string)
    ),

    // subset

    // alias
    alias_keyword: $ => prec(9, 
      token.immediate(caseInsensitive('alias')),
    ),


    alias_declaration: $ => seq(
      $.alias_keyword,
      '(',
      commaSep1($.identifier), // aliases
      ')'
    ),

    scalar_keyword: $ => prec(9, choice(
      token.immediate(caseInsensitive('scalar')),
      token.immediate(caseInsensitive('scalars'))
    )),

    // scalar declaration
    scalar_declaration: $ => seq(
      $.scalar_keyword,
      commaOrNewlineSep1($.scalar_entry)
    ),

    scalar_entry: $ => seq(
      $.identifier,                 // scalar_name
      optional($.string),            // ["text"]
      optional($.scalar_value_block) // [/numerical_value/]
    ),

    
    scalar_value_block: $ => seq(
      '/',
      $.number,
      '/'
    ),

    // parameter declaration
    parameter_keyword: $ => prec(10,
      choice(
        token.immediate(caseInsensitive('parameter')),
        token.immediate(caseInsensitive('parameters'))
      )
    ),

    parameter_declaration: $ =>
      seq(
        $.parameter_keyword,
        commaOrNewlineSep1($.param_entry)
      ),

    param_entry: $ => seq(
      choice(
        $.identifier_with_domain,    // param_name(index_list)
        $.identifier               // param_name
      ),
      optional($.string),           // ["text"]
      optional(choice(
        seq(/\r?\n/, $.param_data_block),  // next-line form: GLR separates this from the \n separator
        $.param_data_block                  // same-line form
      ))
    ),

    param_data_block: $ => seq(
      '/',
      commaOrNewlineSep1Trailing($.param_assignment),
      '/'
    ),

    param_assignment: $ => seq(
      $.index_atom,                 // element or tuple (i1, i1.j1, etc.)
      optional('='),                // optional equals sign
      field('value', choice($.number, $.identifier))  // number or acronym identifier
    ),

    // variable declaration
    variable_keyword: $ => prec(9, choice(
      token.immediate(caseInsensitive('variable')),
      token.immediate(caseInsensitive('variables'))
    )),

    variable_declaration: $ => seq(
      optional($.var_type),
      $.variable_keyword,
      commaOrNewlineSep1($.var_entry)
    ),

    var_entry: $ => seq(
      choice(
        $.identifier,                      // var_name
        $.identifier_with_domain
      ),
      optional($.string),                // ["text"]
      optional($.var_data_block)         // [/ ... /]
    ),

    var_data_block: $ => seq(
      '/',
      commaOrNewlineSep1Trailing($.var_attr_assignment),
      '/'
    ),

    // j1.up 10    i1.j2.lo 5     k.m 0    a.scale 20
    var_attr_assignment: $ => seq(
      $.index_atom,
      token.immediate('.'),        // no space between element and dot attribute
      $.variable_attribute_keyword,
      field('value', $.number)
    ),

    // i1, i1.j1, i1.j1.k3 (support multi-dimensional tuples separated by dots)
    index_atom: $ => seq(
      $.set_element_selection,
      repeat(seq('.', $.set_element_selection))
    ),

    var_attr: $ => token(/(up|lo|l|m|scale)/i),

    var_type: $ => prec(9,
      choice(
        token.immediate(caseInsensitive('free')),
        token.immediate(caseInsensitive('positive')),
        token.immediate(caseInsensitive('negative')),
        token.immediate(caseInsensitive('integer')),
        token.immediate(caseInsensitive('binary')),
        token.immediate(caseInsensitive('sos1')),
        token.immediate(caseInsensitive('sos2')),
        token.immediate(caseInsensitive('semicont')),
        token.immediate(caseInsensitive('semiint'))
      )
    ),

    // equation declaration

    equation_keyword: $ => prec(9, choice(
      token.immediate(caseInsensitive('equation')),
      token.immediate(caseInsensitive('equations'))
    )),

    equation_declaration: $ => seq(
      $.equation_keyword,
      commaOrNewlineSep1($.eq_entry)
    ),

    eq_entry: $ => seq(
      choice(
        $.identifier,                      // eq_name
        $.identifier_with_domain
      ),
      optional($.string),                // ["text"]
      optional($.eq_data_block)         // [/ ... /]
    ),

    eq_data_block: $ => seq(
      '/',
      commaOrNewlineSep1Trailing($.eq_attr_assignment),
      '/'
    ),

    // j1.up 10    i1.j2.lo 5     k.m 0    a.scale 20
    eq_attr_assignment: $ => seq(
      $.index_atom,
      token.immediate('.'),        // no space between element and dot attribute
      $.variable_attribute_keyword,
      field('value', $.number)
    ),

    // tables
    

    // models declaration

    model_declaration: $ => seq( $.model_keyword, 
      commaOrNewlineSep1($.model_entry)
    ),

    model_keyword: $ => prec(9, choice(
      token.immediate(caseInsensitive('model')),
      token.immediate(caseInsensitive('models'))
    )),

    model_entry: $ => seq(
      $.identifier,
      optional($.string),
      optional($.model_data_block)
    ),

    model_data_block: $ => seq( '/', commaOrNewlineSep1Trailing($.model_item), '/' ),
    
    model_item: $ => choice(
      token(caseInsensitive('all')) ,
      $.identifier,               // eqn_name
      $.identifier_with_domain,    // var_name(set_name)
      seq($.identifier, choice('+', '-'), $.identifier)
    ),

    // Solve statement

    solve_keyword: $ => token.immediate(caseInsensitive('solve')),

    solve_direction: $ => choice(
      token.immediate(caseInsensitive('maximizing')),
      token.immediate(caseInsensitive('minimizing'))
    ),

    solve_statement: $ => prec(9,
      seq(
        $.solve_keyword,
        $.identifier, // model_name
        choice(
          // using solver_type [direction var]  (direction optional for MCP/CNS)
          seq(
            token.immediate(caseInsensitive('using')),
            $.identifier,                // solver_type
            optional(seq($.solve_direction, $.identifier)) // objective
          ),
          // direction var using solver_type
          seq(
            $.solve_direction,
            $.identifier,                 // var_name
            token.immediate(caseInsensitive('using')),
            $.identifier
          )
        )
      )
    ),

    // Display statement
    display_keyword: $ => token.immediate(caseInsensitive('display')),

    display_statement: $ => prec(9, seq($.display_keyword, commaSep1($.display_item))),

    display_item: $ => choice( $.string, $.expression),

    // Expressions

    expression: $ => 
      prec(3,
        choice(
          prec.left(5, $.unary_builtin_function_expr),
          prec.left(4, $.binary_builtin_function_expr),
          prec.left(3, $.multi_args_builtin_function_expr),
          prec.left(2, $.number),
          prec.left(2, $.bool),
          prec.left(2, $.string),
          prec.left(2, $.unary_expr),
          prec.left(2, $.indexed_reference),
          prec.left(2, $.paren_expr),
          prec.left(2, $.binary_expr),
          prec.left(2, $.indexed_operation),
          prec.left(1, $.reference),
        // $.call_expr,
          $.conditional_expr,
          prec.left(-1, alias($.identifier, $.bare_identifier)),
      )),

    paren_expr: $ => seq('(', $.expression, ')'),

    unary_expr: $ => prec(100, seq(choice('+', '-', 'not'), $.expression)),

    binary_operator_keyword : $ => choice(
      token('+'), token('-'), token('*'), token('/'), token('**'),
      token('>'), token('<'), token('>='), token('<='), token('<>'),
      token('='),   // equality comparison in conditions (e.g. if / until)
      token(caseInsensitive('and')), token(caseInsensitive('or')),
      token(caseInsensitive('gt')), token(caseInsensitive('lt')),
      token(caseInsensitive('ge')), token(caseInsensitive('le')),
      token(caseInsensitive('ne')),
      token(caseInsensitive('eq')),
      token(caseInsensitive('mod'))
    ),

    binary_expr: $ => prec.left(1, seq(
      $.expression,
      $.binary_operator_keyword,
      $.expression
    )),

    indexed_operation_keyword: $ => choice(
      'sum', 'prod', 'smin', 
      'smax', 'sand', 'sor'
    ),

    indexed_operation: $ => seq(
      $.indexed_operation_keyword,
      token.immediate('('),
      $.index_list,
      optional(
        seq(
          '$',
          $.expression
        )
      ),
      token(','),
      $.expression,
      token(')')
    ),

    index_list: $ =>
      choice(
        $.index_element,
        seq(
          token('('),
          commaSep1($.index_element),
          token(')')
          )
        ),

    conditional_expr: $ => prec.left(1, seq(
      $.expression,
      '$',
      $.expression
    )),

    unary_builtin_function_keyword: $ =>
      prec(5,
        choice(
          'abs',
          'ord',
          'card',
          'val',
          'exp',
          'log',
          'log10',
          'sqrt',
          'sin',
          'cos',
          'tan',
          'asin',
          'acos',
          'arctan',
          'sinh',
          'cosh',
          'tanh',
          'ceil',
          'floor',
          'sign',
          'sqr',
          'trunc',
          'frac'
        )
    ),

    unary_builtin_function_expr: $ =>
      prec(5,
        seq(
          $.unary_builtin_function_keyword,
          '(',
          $.expression,
          ')'
        )
      ),


    binary_builtin_function_keyword: $ =>
      prec(4,
        choice(
          'uniform',
          'power',
          'mod'
        )
      ),

    binary_builtin_function_expr: $ =>
      prec(4,
        seq(
          $.binary_builtin_function_keyword,
          '(',
          $.expression,
          ',',
          $.expression,
          ')'
        )
      ),

    multi_args_builtin_function_keyword: $ =>
      prec(3,
        choice(
          'max',
          'min',
          'round'
        )
      ),

    multi_args_builtin_function_expr: $ =>
      prec(3,
        seq(
          $.multi_args_builtin_function_keyword,
          '(',
          $.expression,
          optional(
            repeat(
              seq(
                ',',
                $.expression
              )
            )
          ),
          ')'
        )
      ),
    

    // Assignments

    assignment_statement: $ =>
      prec(1,
        seq(
          field(
            "left_hand_side",
            choice(
              $.indexed_reference,
              $.reference,
              $.identifier, // i
            )
          ),
          optional(
            field("condition",
              prec(2,
                seq(
                  '$',
                  $.expression
                )
              )
            )
          ),
          '=',
          field("right_hand_side",
            $.expression
          )
        )
      ),

    // Equation definitions  (eqn_name(domain)[$cond].. lhs =e= rhs)

    equation_type: $ =>
      token(choice(
        /=[eE]=/,   // equality
        /=[lL]=/,   // less-than-or-equal
        /=[gG]=/,   // greater-than-or-equal
        /=[nN]=/,   // non-binding  (free row)
        /=[xX]=/,   // external    (solver-defined)
        /=[cC]=/,   // conic
      )),

    equation_definition: $ =>
      prec(2,
        seq(
          field("name",
            choice(
              $.identifier_with_domain,
              $.identifier,
            )
          ),
          optional(
            field("condition",
              seq('$', $.expression)
            )
          ),
          '..',
          field("left_hand_side",  $.expression),
          field("type",            $.equation_type),
          field("right_hand_side", $.expression),
        )
      ),

    // loops
    loop_keyword: $ => token.immediate(caseInsensitive('loop')),

    loop_statement: $ => prec(20,
      seq(
        $.loop_keyword,
        token('('),
        $.index_list,
        optional(
          seq(
            '$',
            $.expression
          )
        ),
        token(','),
        repeat($.statement),
        optional(
          $.statement_without_semicolon,
        ),
        token(')')
      )
    ),

    // for loop: for(scalar = start to|downto end [by step], statements)
    for_keyword: $ => token.immediate(caseInsensitive('for')),

    for_statement: $ => prec(20,
      seq(
        $.for_keyword,
        '(',
        $.identifier,
        '=',
        $.expression,
        choice(
          token(caseInsensitive('downto')),
          token(caseInsensitive('to'))
        ),
        $.expression,
        optional(seq(token(caseInsensitive('by')), $.expression)),
        ',',
        repeat($.statement),
        optional($.statement_without_semicolon),
        ')'
      )
    ),

    // while loop: while(condition, statements)
    while_keyword: $ => token.immediate(caseInsensitive('while')),

    while_statement: $ => prec(20,
      seq(
        $.while_keyword,
        '(',
        alias($.expression, $.condition),
        ',',
        repeat($.statement),
        optional($.statement_without_semicolon),
        ')'
      )
    ),

    // repeat-until loop: repeat(statements until condition)
    repeat_keyword: $ => token.immediate(caseInsensitive('repeat')),
    until_keyword: $ => 'until',

    repeat_statement: $ => prec(20,
      seq(
        $.repeat_keyword,
        '(',
        repeat($.statement),
        optional($.statement_without_semicolon),
        $.until_keyword,
        $.expression,
        ')'
      )
    ),

    // break [n] or break$(cond) [n]
    break_statement: $ => seq(
      'break',
      optional(seq(token.immediate('$'), $.expression)),
      optional($.number)
    ),

    // continue or continue$(cond)
    continue_statement: $ => seq(
      'continue',
      optional(seq(token.immediate('$'), $.expression))
    ),

    // abort ["msg"|id, ...] or abort.noError [...] or abort$(cond) [...]
    abort_statement: $ => seq(
      'abort',
      optional(choice(
        seq(token.immediate('.'), token.immediate(/[nN][oO][eE][rR][rR][oO][rR]/)),
        seq(token.immediate('$'), $.expression)
      )),
      commaSep1(choice($.string, $.identifier))
    ),

    // option[s] item, item, ...
    option_keyword: $ => prec(9, choice(
      token.immediate(caseInsensitive('option')),
      token.immediate(caseInsensitive('options'))
    )),

    option_statement: $ => prec(9,
      seq($.option_keyword, commaOrNewlineSep1($.option_item))
    ),

    option_item: $ => choice(
      // display format: x:decimals[:rows[:cols]]
      seq($.identifier, token.immediate(':'), $.number,
          optional(seq(':', $.number, optional(seq(':', $.number))))),
      // key = value (number or identifier, covers "default" as identifier)
      seq($.identifier, '=', choice($.number, $.identifier)),
      // projection: key < identifier
      seq($.identifier, '<', $.identifier),
      // flag (bare identifier)
      $.identifier
    ),

    // acronym[s] name ["text"], ...
    acronym_keyword: $ => prec(9, choice(
      token.immediate(caseInsensitive('acronym')),
      token.immediate(caseInsensitive('acronyms'))
    )),

    acronym_declaration: $ => seq(
      $.acronym_keyword,
      commaOrNewlineSep1($.acronym_entry)
    ),

    acronym_entry: $ => seq(
      $.identifier,
      optional($.string)
    ),

    // table declaration: table name(domain) ["text"] body
    table_keyword: $ => prec(10, choice(
      token.immediate(caseInsensitive('table')),
      token.immediate(caseInsensitive('tables'))
    )),

    // "Variable Table" is a single lexical token to avoid token.immediate issues
    // across the whitespace between the two keywords.
    variable_table_keyword: $ => token(seq(
      caseInsensitive('variable'),
      /\s+/,
      caseInsensitive('table')
    )),

    variable_table_declaration: $ => prec(11, seq(
      $.variable_table_keyword,
      choice($.identifier_with_domain, $.identifier),
      optional($.string),
      optional($.table_body)
    )),

    table_declaration: $ => prec(10,
      seq(
        $.table_keyword,
        choice($.identifier_with_domain, $.identifier),
        optional($.string),
        optional($.table_body)
      )
    ),

    // Table body: opaque token consuming everything up to the terminating semicolon.
    // GAMS table format is column-aligned (not parseable as structured tokens),
    // and supports dots, spaces, *, +, parentheses in row/column labels.
    table_body: $ => /[^;]+/,

    // if elseif else control flow
    if_statement: $ => prec(20,
      seq(
        field("if",
          seq(
            'if',
            '(',
            alias($.expression, $.condition), // logical condition
            ',',
            $.statement,
            repeat($.statement), // one or more statements
          )
        ),
        repeat(
          field("elseif",
            seq(
              'elseif',
              alias($.expression, $.condition),
              ',',
              $.statement,
              repeat($.statement)
            )
          ),
        ),
        optional(
          field("else",
            seq(
              'else',
              $.statement,
              repeat($.statement)
            )
          )
        ),
        ')'
      )
    )
  },
  conflicts: $ => [
    [$.identifier_with_domain_args, $.index_element],
    [$.param_entry]
  ]
});

// separate one or more term by comma or newline
function commaOrNewlineSep1(rule) {
  return seq(
    rule,
    repeat(
      seq(
        choice(',', /\r?\n/),
        rule)
      )
  );
}

// same as commaOrNewlineSep1, but also allows a trailing comma or newline
// after the last term (e.g. a trailing comma before a closing '/')
function commaOrNewlineSep1Trailing(rule) {
  return seq(
    commaOrNewlineSep1(rule),
    optional(choice(',', /\r?\n/))
  );
}

function newlineSep1(rule) {
  return seq(rule, 
      repeat(seq(/\r?\n/, rule)));
}

// separate one or more term by comma
function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}

function toCaseInsensitive(a) {
  var ca = a.charCodeAt(0);
  if (ca>=97 && ca<=122) return `[${a}${a.toUpperCase()}]`;
  if (ca>=65 && ca<= 90) return `[${a.toLowerCase()}${a}]`;
  return a;
}

function caseInsensitive (keyword) {
  return new RegExp(keyword
    .split('')
    .map(toCaseInsensitive)
    .join('')
  )
}