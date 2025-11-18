module.exports = grammar({
  name: 'gams',

  extras: $ => [
    /\s/,
    $.comment
  ],

  rules: {
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      // declaration
      $.set_declaration,
      $.alias_declaration,
      $.parameter_declaration,
      $.scalar_declaration,
      $.variable_declaration,
      $.equation_declaration,

      // other
      $.comment,
      $.string
    ),

    // utils
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    set_element: $ => /[a-zA-Z_][a-zA-Z0-9_\-]*/,
    set_element_selection: $ => choice(
      $.set_element,
      seq(
        token("("), commaSep1($.set_element), token(")")
      ),
      seq($.set_element, "*", $.set_element)
    ),

    identifier_with_domain: $ => seq(
      $.identifier,
      token.immediate('('),
      commaSep1($.identifier),
      ')'
    ),

    number: $ => /[+-]?(?:\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/,

    comment: $ => token(seq('#', /.*/)),

    string: $ => choice(
      seq('"', repeat(choice(/[^"]/)), '"'),
      seq("'", repeat(choice(/[^']/)), "'")
    ),

    // set declaration
    set_declaration: $ => seq(
      choice(caseInsensitive('set'), caseInsensitive('sets')),
      commaOrNewlineSep1($.set_entry),
      ';'
    ),

    set_entry: $ => seq(
      choice(
        $.identifier,               // set_name
        $.identifier_with_domain
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
    alias_declaration: $ => seq(
      caseInsensitive('alias'),
      '(',
      commaSep1($.identifier), // aliases
      ')',
      ';'
    ),

    // scalar declaration
    scalar_declaration: $ => seq(
      choice(
        caseInsensitive('scalar'),
        caseInsensitive('scalars')
      ),
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
    parameter_declaration: $ => seq(
      choice(
        caseInsensitive('parameter'),
        caseInsensitive('parameters')
      ),
      commaOrNewlineSep1($.param_entry),
      ';'
    ),

    param_entry: $ => seq(
      choice(
        $.identifier,               // param_name
        $.identifier_with_domain    // param_name(index_list)
      ),
      optional($.string),           // ["text"]
      $.param_data_block            // [/ ... /]
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
    variable_declaration: $ => seq(
      optional($.var_type),
      choice(
        caseInsensitive('variable'),
        caseInsensitive('variables')
      ),
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
      $.var_attr,
      field('value', $.number)
    ),

    // i1, i1.j1, i1.j1.k3 (support multi-dimensional tuples separated by dots)
    index_atom: $ => seq(
      $.set_element_selection,
      repeat(seq('.', $.set_element_selection))
    ),

    var_attr: $ => token(/(up|lo|l|m|scale)/i),

    var_type: $ => choice(
      caseInsensitive('free'),
      caseInsensitive('positive'),
      caseInsensitive('negative'),
      caseInsensitive('integer'),
      caseInsensitive('binary'),
      caseInsensitive('sos1'),
      caseInsensitive('sos2'),
      caseInsensitive('semicont'),
      caseInsensitive('semiint')
    ),


    // equation declaration

    equation_declaration: $ => seq(
      choice(
        caseInsensitive('equation'),
        caseInsensitive('equations')
      ),
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
      $.eq_attr,
      field('value', $.number)
    ),

    eq_attr: $ => token(/(up|lo|l|m|scale)/i),
    
    // instantiation



    // loops

  }
});

// separate one or more term by comma or newline
function commaOrNewlineSep1(rule) {
  return seq(rule, 
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