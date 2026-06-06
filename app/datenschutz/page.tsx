import Link from "next/link";

export default function DatenschutzPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px", color: "var(--c-fg)", fontFamily: "inherit" }}>
      <Link href="/" style={{ fontSize: 13, color: "var(--c-fg-subtle)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 40 }}>
        ← Zurück zur Startseite
      </Link>

      <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -0.5, marginBottom: 8, color: "var(--c-fg)" }}>Datenschutzerklärung</h1>
      <p style={{ ...p, marginBottom: 40, color: "var(--c-fg-subtle)" }}>Stand: Juni 2026</p>

      <Section title="1. Verantwortlicher">
        <p style={p}>EJS_Solution — Elias Philip Strohbach und Jona Storch GbR</p>
        <p style={p}>Fechenheimer Weg 35, 63477 Maintal</p>
        <p style={p}>Telefon: <a href="tel:01794554925" style={link}>0179 4554925</a></p>
        <p style={p}>E-Mail: <a href="mailto:ejs-solution@outlook.de" style={link}>ejs-solution@outlook.de</a></p>
      </Section>

      <Section title="2. Cookies">
        <p style={p}>
          Wir setzen ausschließlich technisch notwendige Cookies ein, die für den Betrieb der Plattform erforderlich sind.
          Dazu speichern wir Ihre Sitzungsdaten (Session-Token) in einem sicheren HTTP-Cookie.
          Es werden keine Tracking- oder Analyse-Cookies ohne Ihre Einwilligung gesetzt.
        </p>
        <p style={p}>
          Darüber hinaus nutzen wir <strong style={{ color: "var(--c-fg)" }}>localStorage</strong> im Browser ausschließlich für
          Benutzereinstellungen (z.&nbsp;B. Dark/Light-Modus, Profilbild). Diese Daten verlassen Ihren Browser nicht.
        </p>
      </Section>

      <Section title="3. Hosting & Server">
        <p style={p}>
          Diese Website wird über <strong style={{ color: "var(--c-fg)" }}>Vercel Inc.</strong> (340 S Lemon Ave #4133, Walnut, CA 91789, USA) bereitgestellt.
          Die Verarbeitung erfolgt auf Servern in der EU (Frankfurt, Deutschland).
          Vercel ist nach dem <strong style={{ color: "var(--c-fg)" }}>EU-US Data Privacy Framework</strong> zertifiziert, sodass ein angemessenes Datenschutzniveau gewährleistet ist.
        </p>
        <p style={p}>
          Beim Aufruf unserer Website werden automatisch folgende Daten in Server-Logfiles gespeichert: IP-Adresse (anonymisiert),
          Datum/Uhrzeit, aufgerufene Seite, Browsertyp. Diese Daten werden ausschließlich zur Sicherstellung des Betriebs verwendet
          und nach 30 Tagen gelöscht.
        </p>
      </Section>

      <Section title="4. Schriftarten">
        <p style={p}>
          Wir verwenden die Schriftart „Geist" über die Next.js Font Optimization. Die Schrift wird beim Build-Prozess
          heruntergeladen und anschließend lokal von unserem Server ausgeliefert.
          Es werden keine Anfragen an externe Server (z.&nbsp;B. Google Fonts) gestellt.
        </p>
      </Section>

      <Section title="5. Kontaktaufnahme per E-Mail">
        <p style={p}>
          Wenn Sie uns per E-Mail kontaktieren, speichern wir Ihre Angaben (Name, E-Mail-Adresse, Nachrichteninhalt)
          zur Bearbeitung Ihrer Anfrage. Die Daten werden ausschließlich für die Kommunikation mit Ihnen genutzt
          und nicht an Dritte weitergegeben. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) bzw.
          Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
        </p>
      </Section>

      <Section title="6. Datenspeicherung in Airtable">
        <p style={p}>
          Termindaten, Kundendaten und Mitarbeiterdaten werden in <strong style={{ color: "var(--c-fg)" }}>Airtable</strong> (Formagrid Inc.,
          799 Market St, San Francisco, CA 94103, USA) gespeichert. Mit Airtable besteht ein
          Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO. Airtable ist nach dem EU-US Data Privacy Framework zertifiziert.
        </p>
        <p style={p}>
          Gespeicherte Daten: Kundennamen, Telefonnummern, gebuchte Dienstleistungen, Termine, Zahlungsbeträge.
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung / Terminverwaltung).
        </p>
      </Section>

      <Section title="7. Google-Dienste (optional)">
        <p style={p}>
          Sofern Sie Ihren Google-Account verknüpfen, werden folgende Daten von Google verarbeitet:
          Google Kalender-Ereignisse (Lesen/Schreiben) sowie Gmail-E-Mails (nur Lesen).
          Die Verknüpfung erfolgt über OAuth 2.0. Ihre Google-Zugangsdaten werden von uns nicht gespeichert.
          Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Die Einwilligung kann jederzeit
          unter <strong style={{ color: "var(--c-fg)" }}>myaccount.google.com/permissions</strong> widerrufen werden.
        </p>
      </Section>

      <Section title="8. Ihre Rechte">
        <p style={p}>Sie haben gemäß DSGVO folgende Rechte:</p>
        <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
          {[
            "Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)",
            "Berichtigung unrichtiger Daten (Art. 16 DSGVO)",
            "Löschung Ihrer Daten (Art. 17 DSGVO)",
            "Einschränkung der Verarbeitung (Art. 18 DSGVO)",
            "Datenübertragbarkeit (Art. 20 DSGVO)",
            "Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)",
          ].map(r => <li key={r} style={{ ...p, margin: "4px 0" }}>{r}</li>)}
        </ul>
        <p style={p}>
          Zur Ausübung Ihrer Rechte wenden Sie sich an:{" "}
          <a href="mailto:ejs-solution@outlook.de" style={link}>ejs-solution@outlook.de</a>
        </p>
        <p style={p}>
          Sie haben außerdem das Recht, sich bei der zuständigen Datenschutzaufsichtsbehörde zu beschweren.
          In Hessen: <a href="https://www.datenschutz.hessen.de" target="_blank" rel="noopener noreferrer" style={link}>www.datenschutz.hessen.de</a>
        </p>
      </Section>

      <Section title="9. Datensicherheit">
        <p style={p}>
          Unsere Website nutzt ausschließlich HTTPS-Verschlüsselung (TLS). Der Zugang zur Verwaltungsoberfläche
          ist durch eine Authentifizierung (E-Mail + Passwort) geschützt. Passwörter werden gehasht gespeichert.
        </p>
      </Section>

      <Section title="10. Änderungen dieser Datenschutzerklärung">
        <p style={p}>
          Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Die aktuelle Version ist stets
          unter <strong style={{ color: "var(--c-fg)" }}>cutzdashboard.vercel.app/datenschutz</strong> abrufbar.
        </p>
      </Section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--c-border)", fontSize: 12, color: "var(--c-fg-subtle)" }}>
        <Link href="/impressum" style={{ color: "var(--c-accent)", textDecoration: "none", marginRight: 20 }}>Impressum</Link>
        <Link href="/" style={{ color: "var(--c-fg-subtle)", textDecoration: "none" }}>CUTZ Solution Dashboard</Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36, paddingBottom: 32, borderBottom: "1px solid var(--c-border)" }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--c-fg)", marginBottom: 12, marginTop: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

const p: React.CSSProperties = {
  fontSize: 14, color: "var(--c-fg-muted)", lineHeight: 1.75, margin: "0 0 8px 0",
};
const link: React.CSSProperties = {
  color: "var(--c-accent)", textDecoration: "none",
};
