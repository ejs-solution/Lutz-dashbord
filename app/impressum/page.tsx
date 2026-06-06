import Link from "next/link";

export default function ImpressumPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px", color: "var(--c-fg)", fontFamily: "inherit" }}>
      <Link href="/" style={{ fontSize: 13, color: "var(--c-fg-subtle)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 40 }}>
        ← Zurück zur Startseite
      </Link>

      <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -0.5, marginBottom: 40, color: "var(--c-fg)" }}>Impressum</h1>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2}>Angaben gemäß § 5 TMG</h2>
        <p style={p}>EJS_Solution — Elias Philip Strohbach und Jona Storch GbR</p>
        <p style={p}>Fechenheimer Weg 35</p>
        <p style={p}>63477 Maintal</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2}>Vertreten durch die Gesellschafter</h2>
        <p style={p}>Jona Storch</p>
        <p style={p}>Elias Philip Strohbach</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2}>Kontakt</h2>
        <p style={p}>Telefon: <a href="tel:01794554925" style={link}>0179 4554925</a></p>
        <p style={p}>E-Mail: <a href="mailto:ejs-solution@outlook.de" style={link}>ejs-solution@outlook.de</a></p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2}>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
        <p style={p}>Jona Storch und Elias Philip Strohbach</p>
        <p style={p}>Anschrift wie oben</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2}>Streitschlichtung</h2>
        <p style={p}>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" style={link}>
            https://ec.europa.eu/consumers/odr/
          </a>
        </p>
        <p style={p}>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2}>Haftung für Inhalte</h2>
        <p style={p}>
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
          Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen
          oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        </p>
        <p style={p}>
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
          Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
          Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2}>Haftung für Links</h2>
        <p style={p}>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
          Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten
          ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2}>Urheberrecht</h2>
        <p style={p}>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
          Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen
          der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
        </p>
      </section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--c-border)", fontSize: 12, color: "var(--c-fg-subtle)" }}>
        <Link href="/datenschutz" style={{ color: "var(--c-accent)", textDecoration: "none", marginRight: 20 }}>Datenschutzerklärung</Link>
        <Link href="/" style={{ color: "var(--c-fg-subtle)", textDecoration: "none" }}>CUTZ Solution Dashboard</Link>
      </div>
    </div>
  );
}

const h2: React.CSSProperties = {
  fontSize: 15, fontWeight: 800, color: "var(--c-fg)", marginBottom: 8, marginTop: 0,
};
const p: React.CSSProperties = {
  fontSize: 14, color: "var(--c-fg-muted)", lineHeight: 1.7, margin: "0 0 4px 0",
};
const link: React.CSSProperties = {
  color: "var(--c-accent)", textDecoration: "none",
};
