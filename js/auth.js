(function () {
  const h = "af977026b789611741484b09bdc8f0fb2b2ec4a045f989e4c442a2920c3088b3";
  const k = "coachAuth";

  const x = async (v) => {
    const e = new TextEncoder().encode(v);
    const d = await crypto.subtle.digest("SHA-256", e);
    return Array.from(new Uint8Array(d)).map((n) => n.toString(16).padStart(2, "0")).join("");
  };

  const m = async (v) => (await x(v)) === h;

  const s = () => sessionStorage.getItem(k) === "true";

  const a = () => sessionStorage.setItem(k, "true");

  const o = () => sessionStorage.removeItem(k);

  const g = (u) => {
    if (!s()) {
      window.location.replace(u || "/coaches-login.html");
    }
  };

  window.coachAuth = { validate: m, isAuthenticated: s, setAuthenticated: a, logout: o, guard: g };
})();
