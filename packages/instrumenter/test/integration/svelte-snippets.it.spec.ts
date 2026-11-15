import {
  INSTRUMENTER_CONSTANTS as ID,
  InstrumenterContext,
} from '@stryker-mutator/api/core';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import type { Component } from 'svelte';
import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';

import { createInstrumenter } from '../../src/index.js';
import { createInstrumenterOptions } from '../helpers/factories.js';

const examples = [
  [
    'render argument',
    '{#snippet line(flag)}<span>{flag}</span>{/snippet}{@render line(true)}',
  ],
  [
    'optional render argument',
    '{#snippet line(flag)}<span>{flag}</span>{/snippet}{@render line?.(true)}',
  ],
  [
    'array render argument',
    '{#snippet line(flag)}<span>{flag}</span>{/snippet}{@render line([true])}',
  ],
  [
    'render callee',
    '{#snippet a()}a{/snippet}{#snippet b()}b{/snippet}{@render (true ? a : b)()}',
  ],
  [
    'snippet default',
    '{#snippet line(flag = true)}<span>{flag}</span>{/snippet}{@render line()}',
  ],
  [
    'object default',
    '{#snippet line({flag = true} = {})}<span>{flag}</span>{/snippet}{@render line()}',
  ],
  [
    'array default',
    '{#snippet line([flag = true] = [])}<span>{flag}</span>{/snippet}{@render line()}',
  ],
  [
    'computed parameter key',
    '{#snippet line({[true ? "a" : "b"]: flag} = {a: false})}<span>{flag}</span>{/snippet}{@render line()}',
  ],
  [
    'typed default',
    '<script lang="ts">const label: string = "value";</script>\n{#snippet line(flag: boolean = true)}<span>{label}{flag}</span>{/snippet}\n{@render line()}',
  ],
  [
    'multiline offset',
    '<script>const label = "🙂";</script>\n{#snippet line(flag)}<span>{label}{flag}</span>{/snippet}\n{@render line(\ntrue\n)}',
  ],
  [
    'object render argument',
    '{#snippet line(flag)}<span>{flag.value}</span>{/snippet}{@render line({value: true})}',
  ],
  [
    'function default',
    '{#snippet line(flag = function () { return true; })}<span>{flag()}</span>{/snippet}{@render line()}',
  ],
  [
    'class default',
    '{#snippet line(flag = class { static value = true; })}<span>{flag.value}</span>{/snippet}{@render line()}',
  ],
  [
    'object at column zero',
    '{#snippet line(flag =\n{value: true}\n)}<span>{flag.value}</span>{/snippet}{@render line()}',
  ],
  [
    'UTF-16 column',
    '🙂{#snippet line(flag)}<span>{flag}</span>{/snippet}{@render line(true)}',
  ],
] as const;

describe('Svelte snippet instrumentation', () => {
  for (const [name, content] of examples) {
    it(`mutates ${name} at its original position and preserves valid Svelte`, async (): Promise<void> => {
      compile(content, { filename: 'example.svelte', generate: 'client' });
      const instrumenter =
        testInjector.injector.injectFunction(createInstrumenter);
      const result = await instrumenter.instrument(
        [{ name: 'example.svelte', content, mutate: true }],
        createInstrumenterOptions(),
      );
      const offset = content.indexOf('true');
      const before = content.slice(0, offset).split('\n');
      const start = {
        line: before.length - 1,
        column: offset - content.lastIndexOf('\n', offset) - 1,
      };
      const mutant = result.mutants.find(
        (candidate) =>
          candidate.mutatorName === 'BooleanLiteral' &&
          candidate.location.start.line === start.line &&
          candidate.location.start.column === start.column,
      );
      expect(mutant, name).not.undefined;
      if (!mutant) throw new Error(`Missing BooleanLiteral mutant: ${name}`);
      expect(mutant.replacement).eq('false');
      expect(mutant.location.end).deep.eq({
        line: start.line,
        column: start.column + 4,
      });
      expect(result.files).lengthOf(1);
      for (const file of result.files) {
        compile(file.content, { filename: file.name, generate: 'client' });
        compile(file.content, { filename: file.name, generate: 'server' });
        const previous = Object.getOwnPropertyDescriptor(
          globalThis,
          ID.NAMESPACE,
        );
        const context: InstrumenterContext = {};
        Object.defineProperty(globalThis, ID.NAMESPACE, {
          configurable: true,
          value: context,
        });
        try {
          const baseline = await renderSource(content);
          expect(await renderSource(file.content)).eq(baseline);
          context.activeMutant = mutant.id;
          expect(await renderSource(file.content)).not.eq(baseline);
        } finally {
          if (previous)
            Object.defineProperty(globalThis, ID.NAMESPACE, previous);
          else Reflect.deleteProperty(globalThis, ID.NAMESPACE);
        }
      }
    });
  }
});

async function renderSource(source: string): Promise<string> {
  const compiled = compile(source, {
    filename: 'example.svelte',
    generate: 'server',
  }).js.code.replaceAll(
    "'svelte/internal/server'",
    JSON.stringify(import.meta.resolve('svelte/internal/server')),
  );
  const module: unknown = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
  );
  if (!isComponentModule(module))
    throw new Error('Missing compiled Svelte component');
  return (await render(module.default)).body;
}

function isComponentModule(value: unknown): value is { default: Component } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'default' in value &&
    typeof value.default === 'function'
  );
}
