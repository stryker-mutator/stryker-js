interface TestSelector{
  
  files(): string[];
  
  select(id: number[]): Promise<void>;
}

export default TestSelector;