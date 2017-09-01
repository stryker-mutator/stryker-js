

export default class Echo {

  constructor(private name: string) {
  }

  say(value: string) {
    return `${this.name}: ${value}`;
  }

  sayDelayed(value: string, delay: number) {
    return new Promise<string>(res => {
      setTimeout(() => {
        res(this.say(`${value} (${delay} ms)`));
      }, delay);
    });
  }

}