import { PI, e, log, normsDist, pow, sqrt } from "./util";

class BalckScholes {
  private R: number;
  private V: number;
  private T: number;
  private D: number;
  private d1: number;
  private d2: number;
  public call: {
    premium: number;
    delta: number;
    theta: number;
    vega: number;
    gamma: number;
    rho: number;
  };
  public put: {
    premium: number;
    delta: number;
    theta: number;
    vega: number;
    gamma: number;
    rho: number;
  };
  constructor(
    private spot: number,
    private strike: number,
    private expiry: number,
    private volatility: number,
    private riskFreeRate: number,
    private dividend: number
  ) {
    this.R = this.riskFreeRate / 100;
    this.V = this.volatility / 100;
    this.T = this.expiry / 365;
    this.D = this.dividend / 100;
    this.d1 = this.get_d1();
    this.d2 = this.get_d2();
    this.call = {
      premium: this.get_callPremium(),
      delta: this.get_callDelta(),
      theta: this.get_callTheta(),
      vega: this.get_vega(),
      gamma: this.get_gamma(),
      rho: this.get_callRho(),
    };
    this.put = {
      premium: this.get_putPremium(),
      delta: this.get_putDelta(),
      vega: this.get_vega(),
      gamma: this.get_gamma(),
      theta: this.get_putTheta(),
      rho: this.get_putRho(),
    };
  }
  get_d1() {
    return (
      (log(this.spot / this.strike) +
        (this.R - this.D + pow(this.V, 2) / 2) * this.T) /
      (this.V * sqrt(this.T))
    );
  }
  get_d2() {
    return this.d1 - this.V * sqrt(this.T);
  }
  get_callPremium() {
    let r1 = this.spot * e(-this.D * this.T) * normsDist(this.d1);
    let r2 = this.strike * e(-this.R * this.T) * normsDist(this.d2);
    return +(r1 - r2).toFixed(2);
  }
  get_putPremium() {
    return +(
      this.strike * e(-this.R * this.T) * normsDist(-this.d2) -
      this.spot * e(-this.D * this.T) * normsDist(-this.d1)
    ).toFixed(2);
  }
  get_vega() {
    let temp =
      (1 / sqrt(2 * PI)) *
      e(pow(this.d1, 2) / -2) *
      e(-1 * this.T * this.D) *
      this.spot *
      sqrt(this.T);
    return +(temp / 100).toFixed(3);
  }
  get_gamma() {
    let temp1 =
      (1 / sqrt(2 * PI)) * e(pow(this.d1, 2) / -2) * e(-1 * this.T * this.D);
    let temp2 = this.spot * this.V * sqrt(this.T);
    return +(temp1 / temp2).toFixed(3);
  }
  get_callRho() {
    let temp =
      this.strike *
      this.T *
      e(-this.R * this.T) *
      normsDist(this.d2) *
      e(-this.D * this.T);
    return +(temp / 100).toFixed(3);
  }
  get_putRho() {
    let temp =
      -1 *
      this.strike *
      this.T *
      e(-this.R * this.T) *
      normsDist(-this.d2) *
      e(-this.D * this.T);
    return +(temp / 100).toFixed(3);
  }
  get_callDelta() {
    return +(e(-this.D * this.T) * normsDist(this.d1)).toFixed(3);
  }
  get_putDelta() {
    return +(e(-this.D * this.T) * (normsDist(this.d1) - 1)).toFixed(3);
  }
  get_callTheta() {
    let ra =
      -1 *
      (this.spot / sqrt(2 * PI)) *
      e(pow(this.d1, 2) / -2) *
      this.V *
      e(-this.T * this.D);
    let rb = 2 * sqrt(this.T);
    let r1 = ra / rb;
    let r2 = this.D * this.spot * this.get_callDelta();
    let r3 = this.R * this.strike * e(-this.R * this.T) * normsDist(-this.d2);
    return +((r1 + r2 - r3) / 365).toFixed(3);
  }

  get_putTheta() {
    let ra =
      -1 *
      (this.spot / sqrt(2 * PI)) *
      e(pow(this.d1, 2) / -2) *
      this.V *
      e(-this.T * this.D);
    let rb = 2 * sqrt(this.T);
    let r1 = ra / rb;
    let r2 = this.D * this.spot * normsDist(-this.d1) * e(-this.T * this.D);
    let r3 = this.R * this.strike * e(-this.R * this.T) * normsDist(-this.d2);
    return +((r1 - r2 + r3) / 365).toFixed(3);
  }
}

// @ts-ignore
let inputs: HTMLInputElement[] = [
  ...document.querySelectorAll('input[type="number"]'),
];

inputs.forEach((inp) => {
  inp.addEventListener("input", updateValue);
});

function updateValue() {
  let val = inputs.map((inp) => +inp.value);
  let obj: BalckScholes;
  // @ts-ignore
  obj = new BalckScholes(...val);
  $(".call-premium").innerText = `${obj.call.premium}`;
  $(".put-premium").innerText = `${obj.put.premium}`;
  $(".call-delta").innerText = `${obj.call.delta}`;
  $(".put-delta").innerText = `${obj.put.delta}`;
  $(".call-theta").innerText = `${obj.call.theta}`;
  $(".put-theta").innerText = `${obj.put.theta}`;
  $(".call-rho").innerText = `${obj.call.rho}`;
  $(".put-rho").innerText = `${obj.put.rho}`;
  $(".gamma").innerText = `${obj.call.gamma}`;
  $(".vega").innerText = `${obj.call.vega}`;

  function $(query: string, element = document): HTMLElement {
    return element.querySelector(query);
  }
}

console.log("Norms", normsDist(0.105).toFixed(3));

updateValue();

class DarkMode {
  root: HTMLElement;
  label: string;
  constructor(
    el: HTMLElement,
    public namespace: string,
    public setMetaTheme: boolean
  ) {
    this.root = document.querySelector("html");
    if (namespace) this.namespace = namespace;
    if (setMetaTheme) this.setMetaTheme = setMetaTheme;
    this.label = "darkMode";
    this.InitializeTheme();
    el.addEventListener("click", () => this.toggleTheme());
  }

  InitializeTheme() {
    if (this.namespace) this.label = `${this.namespace}-darkMode`;
    let theme = localStorage.getItem(this.label);

    if (theme === "false" || theme == null) {
      this.setLightMode();
      if (this.setMetaTheme) this.setMeta("light");
    } else {
      this.setDarkMode();
      if (this.setMetaTheme) this.setMeta("dark");
    }
  }

  setMeta(theme) {
    let meta = document.querySelector('html meta[name="theme-color"]');
    if (!meta) {
      let meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document
        .querySelector("head")
        .insertAdjacentHTML(
          "beforeend",
          `<meta name="theme-color" content="${
            theme === "dark" ? "#191919" : "#ffffff"
          }" />`
        );
      return;
    }

    meta.insertAdjacentHTML(
      "afterend",
      `<meta name="theme-color" content="${
        theme === "dark" ? "#191919" : "#ffffff"
      }" />`
    );
    meta.remove();
  }

  toggleTheme() {
    let theme = localStorage.getItem(this.label);
    if (theme === "false") {
      this.setDarkMode();
      if (this.setMetaTheme) this.setMeta("dark");
    } else {
      this.setLightMode();
      if (this.setMetaTheme) this.setMeta("light");
    }
  }

  setDarkMode() {
    this.root.classList.add("dark");
    localStorage.setItem(this.label, "true");
    if (this.setMetaTheme) this.setMeta("dark");
  }

  setLightMode() {
    this.root.classList.remove("dark");
    localStorage.setItem(this.label, "false");
    if (this.setMetaTheme) this.setMeta("light");
  }
}

new DarkMode(document.querySelector("#darkMode-toggle"), "blackScholes", true);
