export interface ITodo {
  name: string;
  description: string;
  completed: boolean;
}

export class Todo implements ITodo {
  constructor(public name: string, public description: string, public completed: boolean) { 
  }

  public toString() {
    return this.name + this.description;
  }
}

