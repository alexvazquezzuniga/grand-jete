import Image from 'next/image'
import Link from 'next/link'

const menuItems = [
  ['#academia', 'La Academia'],
  ['#disciplinas', 'Disciplinas'],
  ['#maestros', 'Maestros'],
  ['#horarios', 'Horarios'],
  ['#galeria', 'Galería'],
  ['#inscripciones', 'Inscripciones'],
  ['#contacto', 'Contacto'],
]

export default function Page() {
  return (
    <main className="public-site">
      <section className="public-hero">
        <div className="public-hero-background" />

        <header className="public-header">
          <a href="/" className="public-logo-link">
            <Image
              src="/grand-jete-logo.png"
              alt="Grand Jeté Academia de Danza"
              width={190}
              height={150}
              priority
              className="public-logo"
            />
          </a>

          {/* Navegación de escritorio */}
          <nav className="public-nav public-nav-desktop">
            {menuItems.map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}

            <Link
              href="https://app.grandjete.mx"
              className="public-admin-button"
            >
              Administración
            </Link>
          </nav>

          {/* Navegación móvil */}
          <details className="public-mobile-menu">
            <summary aria-label="Abrir menú">
              <span className="public-menu-icon">
                <i />
                <i />
                <i />
              </span>
            </summary>

            <nav className="public-mobile-menu-panel">
              {menuItems.map(([href, label]) => (
                <a key={href} href={href}>
                  {label}
                </a>
              ))}

              <Link
                href="https://app.grandjete.mx"
                className="public-mobile-admin"
              >
                Administración
              </Link>
            </nav>
          </details>
        </header>

        <div className="public-hero-content">
          <div className="public-hero-copy">
            <div className="public-gold-line" />

            <h1>
              NACISTE
              <br />
              PARA
              <br />
              MOVERTE
            </h1>

            <p>Grand Jeté · Academia de Danza</p>

            <a href="#academia" className="public-primary-button">
              Conoce la academia <span>→</span>
            </a>
          </div>
        </div>

        <div className="public-location-bar">
          <div>
            <div className="public-location-title">
              Grand Jeté · Aguascalientes
            </div>

            <div className="public-location-text">
              Encuéntranos en el Desarrollo Especial Talleres F.F.C.C.
              <br className="desktop-break" />
              {' '}
              (Estacionamiento de Casa Redonda)
            </div>
          </div>

          <a
            href="https://maps.app.goo.gl/6ECp6WPdwMRr2eJG9"
            target="_blank"
            rel="noopener noreferrer"
            className="public-maps-link"
          >
            Cómo llegar ↗
          </a>
        </div>
      </section>

      <section id="academia" className="public-section public-academy-section">
        <div className="public-section-kicker">Grand Jeté</div>

        <h2>La Academia</h2>

        <p className="public-section-intro">
          Un espacio para descubrir el movimiento, desarrollar la técnica
          y hacer de la danza una forma de expresión.
        </p>
      </section>

      {/* Secciones preparadas para seguir construyendo */}
      <section id="disciplinas" className="public-anchor-section" />
      <section id="maestros" className="public-anchor-section" />
      <section id="horarios" className="public-anchor-section" />
      <section id="galeria" className="public-anchor-section" />
      <section id="inscripciones" className="public-anchor-section" />
      <section id="contacto" className="public-anchor-section" />
    </main>
  )
}