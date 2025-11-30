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
        $._declaration,
        $._statement
      )
    ),

    _declaration: $ => choice(
      prec(10, $.set_declaration),
      prec(9, $.parameter_declaration),
      prec(9, $.scalar_declaration),
      prec(9, $.variable_declaration),
      prec(9, $.equation_declaration),
    ),

    _statement: $ => choice(
      $.alias_declaration,
      // prec(2, $.loop_statement),
      prec(1, $.assignment_statement),

      // other
      $.comment,
      // $.string
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
        $.identifier,
        optional(
          prec(3, repeat(seq(',', $.identifier)))
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
          seq($.number, '*', $.number),
          $.identifier_with_domain,
          $.identifier
        ),

    variable_attribute_keyword: $ => 
      choice(
        token.immediate(caseInsensitive('up')),
        token.immediate(caseInsensitive('lo')),
        token.immediate(caseInsensitive('l')),
        token.immediate(caseInsensitive('fx')),
        token.immediate(caseInsensitive('scale')),
        token.immediate(caseInsensitive('m')),
      ),
      
    number: $ => /[+-]?(?:\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/,

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
      commaOrNewlineSep1($.set_entry),
      ';'
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
        choice(
          commaOrNewlineSep1($.element_entry),
          seq($.identifier, '*', $.identifier),
          seq($.number, '*', $.number) 
        ),
        '/'
    ),

    element_entry: $ => seq(
      $.identifier,
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
      ')',
      ';'
    ),

    scalar_keyword: $ => prec(9, choice(
      token.immediate(caseInsensitive('scalar')),
      token.immediate(caseInsensitive('scalars'))
    )),

    // scalar declaration
    scalar_declaration: $ => seq(
      $.scalar_keyword,
      commaOrNewlineSep1($.scalar_entry),
      ';'
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
        token.immediate(caseInsensitive('parameters')),
      )
    ),

    parameter_declaration: $ =>
      seq(
        $.parameter_keyword,
        commaOrNewlineSep1($.param_entry),
        ';'
      ),

    param_entry: $ => seq(
      choice(
        $.identifier_with_domain,    // param_name(index_list)
        $.identifier               // param_name
      ),
      optional($.string),           // ["text"]
      optional(seq(/\s*\n\s*/, $.param_data_block))           // [/ ... /]
    ),

    param_data_block: $ => seq(
      '/',
      commaOrNewlineSep1($.param_assignment),
      '/'
    ),

    param_assignment: $ => seq(
      $.index_atom,                 // element or tuple (i1, i1.j1, etc.)
      optional('='),                // optional equals sign
      field('value', $.number)
    ),

    // variable declaration
    variable_keyword: $ => prec(9, choice(
      token.immediate(caseInsensitive('variable')),
      token.immediate(caseInsensitive('variables'))
    )),

    variable_declaration: $ => seq(
      optional($.var_type),
      $.variable_keyword,
      commaOrNewlineSep1($.var_entry),
      ';'
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
      commaOrNewlineSep1($.var_attr_assignment),
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
      commaOrNewlineSep1($.eq_entry),
      ';'
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
      commaOrNewlineSep1($.eq_attr_assignment),
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
    
    // Expressions

    expression: $ =>choice(
      $.number,
      $.string,
      $.indexed_reference,
      $.paren_expr,
      $.unary_expr,
      $.binary_expr,
      $.indexed_operation, 
      // $.call_expr,
      $.conditional_expr,
      $.identifier,
      // $.sum_expr,
      // $.prod_expr
    ),

    paren_expr: $ => seq('(', $.expression, ')'),

    unary_expr: $ => prec(100, seq(choice('+', '-', caseInsensitive('not')), $.expression)),

    binary_operator_keyword : $ => choice(
      token('+'), token('-'), token('*'), token('/'), token('**'),
      token('>'), token('<'), token('>='), token('<='), 
      token(caseInsensitive('and')), token(caseInsensitive('or')),
      token(caseInsensitive('gt')), token(caseInsensitive('lt')),
      token(caseInsensitive('ge')), token(caseInsensitive('le'))
    ),

    binary_expr: $ => prec.left(1, seq(
      $.expression,
      $.binary_operator_keyword,
      $.expression
    )),

    indexed_operation_keyword: $ => choice(
      token('sum'), token('prod'), token('smin'), 
      token('smax'), token('sand'), token('sor')
    ),

    indexed_operation: $ => seq(
      $.indexed_operation_keyword,
      token.immediate('('),
      $.index_element,
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
          $.index_element,
          optional(
              seq(
                ',',
                $.index_element
              )
            ),
          token(')')
          )
        ),

    // call_expr: $ => prec.dynamic(0, seq(
    //   $.identifier,
    //   token.immediate('('),
    //   optional(commaSep1($.expression)),
    //   ')'
    // )),

    conditional_expr: $ => prec.left(1, seq(
      $.expression,
      '$',
      $.expression
    )),

    // call_expr: $ => seq(
    //   caseInsensitive('sum', 'prod', 'smin', 'smax'),
    //   token.immediate('('),
    //   commaSep1($.index_spec),
    //   ',',
    //   $.expression,
    //   ')'
    // ),

    // prod_expr: $ => seq(
    //   caseInsensitive('prod'),
    //   token.immediate('('),
    //   commaSep1($.index_spec),
    //   ',',
    //   $.expression,
    //   ')'
    // ),

    // index_spec: $ => choice(
    //   $.identifier_with_domain, // i(j)
    //   $.indexed_reference,
    //   $.identifier, // i
    // ),

    // Assignments

    assignment_statement: $ =>
      prec(1,
        seq(
          field(
            "left_hand_side",
            choice(
              $.indexed_reference,
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
            $.expression,
          ),
          ';'
        )
    ),

    // lvalue: $ => choice(
    //   $.identifier,
    //   $.identifier_with_domain,
    //   $.indexed_reference
    // ),

    // loops

  },
  // conflicts: $ => [
    // [$.identifier_with_domain_args, $.indexed_reference_args]
  // ]
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