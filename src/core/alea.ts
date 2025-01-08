class Mash {
  private n = 0xefc8249d;

  mash(data: string | number) {
    const current = '' + data;

    // cache the length
    for (let i = 0, l = current.length; i < l; i++) {
      this.n += current.charCodeAt(i);

      let h = 0.02519603282416938 * this.n;

      this.n = h >>> 0;
      h -= this.n;
      h *= this.n;
      this.n = h >>> 0;
      h -= this.n;
      this.n += h * 0x100000000;
    }
    return (this.n >>> 0) * 2.3283064365386963e-10; // 2^-32
  }
}

export class AleaRNG {
  private s0: number;
  private s1: number;
  private s2: number;
  private c: number;

  constructor(
    seed: string,
    public steps = 0,
  ) {
    const instance = new Mash();

    // internal state of generator
    this.s0 = instance.mash(' ');
    this.s1 = instance.mash(' ');
    this.s2 = instance.mash(' ');

    this.c = 1;

    for (let i = 0, len = seed.length; i < len; i++) {
      this.s0 -= instance.mash(seed[i]);
      if (this.s0 < 0) {
        this.s0 += 1;
      }

      this.s1 -= instance.mash(seed[i]);
      if (this.s1 < 0) {
        this.s1 += 1;
      }

      this.s2 -= instance.mash(seed[i]);
      if (this.s2 < 0) {
        this.s2 += 1;
      }
    }

    for (let i = 0; i < steps; i++) {
      this.random();
    }
  }

  random() {
    this.steps++;

    const t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32

    this.s0 = this.s1;
    this.s1 = this.s2;
    this.c = t | 0;
    this.s2 = t - this.c;

    return this.s2;
  }

  int32() {
    return this.random() * 0x100000000;
  }
}
