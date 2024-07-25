import inquirer from 'inquirer';

export type Answers = Parameters<typeof inquirer.prompt>[0];
export type Question = Extract<Parameters<typeof inquirer.prompt>[0], { type: string }>;
export type ListQuestion = Extract<Question, { type: 'select' }>;
export type CheckboxQuestion = Extract<Question, { type: 'checkbox' }>;
export type InputQuestion = Extract<Question, { type: 'input' }>;
export type ListChoices = ListQuestion['choices'];
export type CheckboxChoices = CheckboxQuestion['choices'];
