import { createToken, Lexer, CstParser } from 'chevrotain';

const SP = createToken({
  name: 'SP',
  pattern: /\s+/,
});

const GT = createToken({
  name: 'GT',
  pattern: />/,
});

const GTE = createToken({
  name: 'GTE',
  pattern: />=/,
});

const LT = createToken({
  name: 'LT',
  pattern: /</,
});

const LTE = createToken({
  name: 'LTE',
  pattern: /<=/,
});

const Colon = createToken({
  name: 'Colon',
  pattern: /:/,
});

const Identifier = createToken({
  name: 'Identifier',
  pattern: /[a-zA-Z_]\w*/,
});

const Term = createToken({
  name: 'Term',
  pattern: /[^\s]+/,
});

const Phrase = createToken({
  name: 'Phrase',
  pattern: /"([^"\\]|\\.)*"/,
});

const tokens = [SP, Colon, GTE, GT, LTE, LT, Phrase, Identifier, Term];

const lexer = new Lexer(tokens);

class FilterParser extends CstParser {
  [key: string]: any;

  query = this.RULE('query', () => {
    this.MANY_SEP({
      SEP: SP,
      DEF: () => {
        this.SUBRULE(this.clause);
      },
    });
  });

  clause = this.RULE('clause', () => {
    this.OPTION(() => {
      this.CONSUME(Identifier);
      this.SUBRULE(this.operator);
    });
    this.SUBRULE(this.value);
  });

  operator = this.RULE('operator', () => {
    this.OR([
      { ALT: () => this.CONSUME(Colon) },
      { ALT: () => this.CONSUME(GT) },
      { ALT: () => this.CONSUME(GTE) },
      { ALT: () => this.CONSUME(LT) },
      { ALT: () => this.CONSUME(LTE) },
    ]);
  });

  value = this.RULE('value', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.term) },
      { ALT: () => this.SUBRULE(this.phrase) },
    ]);
  });

  term = this.RULE('term', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(Identifier);
          this.OPTION(() => {
            this.CONSUME(Term);
          });
        },
      },
      { ALT: () => this.CONSUME2(Term) },
    ]);
  });

  phrase = this.RULE('phrase', () => {
    this.CONSUME(Phrase);
  });

  constructor() {
    super(tokens, { recoveryEnabled: true });
    this.performSelfAnalysis();
  }
}

const parser = new FilterParser();

class FilterCstVisitor extends parser.getBaseCstVisitorConstructor() {
  constructor() {
    super();
    this.validateVisitor();
  }

  query(ctx: any) {
    return ctx.clause.filter((t) => !t.recoveredNode).map((t) => this.visit(t));
  }

  clause(ctx: any) {
    const value = this.visit(ctx.value);
    if (ctx.Identifier) {
      const property = ctx.Identifier[0].image;
      const op = this.visit(ctx.operator);
      return {
        type: 'property',
        property,
        op,
        value: value.value,
      };
    }
    return value;
  }

  operator(ctx: any) {
    if (ctx.Colon) {
      return 'eq';
    } else if (ctx.GT) {
      return 'gt';
    } else if (ctx.GTE) {
      return 'gte';
    } else if (ctx.LT) {
      return 'lt';
    } else if (ctx.LTE) {
      return 'lte';
    }
  }

  value(ctx: any) {
    let type: string;
    let value: string;
    if (ctx.term) {
      type = 'term';
      value = this.visit(ctx.term);
    } else {
      type = 'phrase';
      value = this.visit(ctx.phrase);
    }
    return { type, value };
  }

  term(ctx: any) {
    if (ctx.Identifier) {
      if (ctx.Term) {
        return ctx.Identifier[0].image + ctx.Term[0].image;
      }
      return ctx.Identifier[0].image;
    }
    return ctx.Term[0].image;
  }

  phrase(ctx: any) {
    return ctx.Phrase[0].image.slice(1, -1);
  }
}

const visitor = new FilterCstVisitor();

interface ValueItem {
  type: 'term' | 'phrase';
  value: string;
}

interface PropertyItem {
  type: 'property';
  property: string;
  op: 'eq' | 'gt' | 'gte' | 'lt' | 'lte';
  value: string;
}

type FilterItem = ValueItem | PropertyItem;

export interface ParseFilterResult {
  properties?: Record<
    string,
    {
      eq?: string[];
      gt?: string;
      gte?: string;
      lt?: string;
      lte?: string;
    }
  >;
  terms?: { value: string; quoted?: true }[];
}

export function parse(
  source: string,
  validators: Record<string, (value: string) => boolean> = {},
): ParseFilterResult {
  const lexingResult = lexer.tokenize(source.trim());

  parser.input = lexingResult.tokens;
  const cst = parser.query();

  const ast = visitor.visit(cst);

  const result: ParseFilterResult = {};
  ast.forEach((item: FilterItem) => {
    if (item.type === 'term') {
      if (!result.terms) {
        result.terms = [];
      }
      result.terms.push({ value: item.value });
    } else if (item.type === 'phrase') {
      if (!result.terms) {
        result.terms = [];
      }
      result.terms.push({ value: item.value, quoted: true });
    } else if (item.type === 'property') {
      const validator = validators[item.property];
      if (!validator || !validator(item.value)) {
        return;
      }
      if (!result.properties) {
        result.properties = {};
      }
      if (!result.properties[item.property]) {
        result.properties[item.property] = {};
      }
      if (item.op === 'eq') {
        if (!result.properties[item.property].eq) {
          result.properties[item.property].eq = [];
        }
        result.properties[item.property].eq.push(item.value);
      } else {
        result.properties[item.property][item.op] = item.value;
      }
    }
  });

  return result;
}
