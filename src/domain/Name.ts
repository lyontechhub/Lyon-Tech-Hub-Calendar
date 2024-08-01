export class Name {
  #name: string;

  private constructor(name: string) {
    this.#name = name.trim().replaceAll(/\s+/g, ' ');
  }

  static of(name: string): Name {
    return new Name(name);
  }

  get get(): string {
    return this.#name;
  }
}
