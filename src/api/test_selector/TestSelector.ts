interface TestSelector{
  
  files(): string[];
  
  select(id: number[]): void;
}

export default TestSelector;