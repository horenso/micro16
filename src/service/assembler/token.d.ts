import { Location } from '@/register';

type SimpleToken = {
    type: 'GOTO' | 'IF' | 'L_PAREN' | 'R_PAREN' | 'ARROW';
    text: string;
};

type LocationToken = {
    type: 'LOCATION';
    location: Location;
    text: string;
};

type ReadWriteToken = {
    type: 'READ_WRITE';
    readWrite: 'rd' | 'wr';
    text: string;
};

type ConditionToken = {
    type: 'CONDITION';
    condition: 'N' | 'Z';
    text: string;
};

type FunctionToken = {
    type: 'FUNCTION';
    name: 'lsh' | 'rsh';
    text: string;
};

type UnaryOperatorToken = {
    type: 'UNARY_OPERATOR';
    operator: '~';
    text: string;
};

type BinaryOperatorToken = {
    type: 'BINARY_OPERATOR';
    operator: '+' | '&';
    text: string;
};

type JumpAddressToken = {
    type: 'JUMP_ADDRESS';
    number: number;
    text: string;
};

type LabelDefineToken = {
    type: 'LABEL_DEFINE';
    label: string;
    text: string;
};

type LabelTargetToken = {
    type: 'LABEL_TARGET';
    label: string;
    text: string;
};

type SpecialToken = {
    type: 'COMMENT' | 'WHITESPACE' | 'GARBAGE';
    text: string;
};

type Token =
    | SimpleToken
    | LocationToken
    | ReadWriteToken
    | ConditionToken
    | FunctionToken
    | UnaryOperatorToken
    | BinaryOperatorToken
    | JumpAddressToken
    | LabelDefineToken
    | LabelTargetToken
    | SpecialToken;
