import Image from 'next/image'
import Link from 'next/link'

export default function Page() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#080808',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <section
        style={{
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(90deg, rgba(0,0,0,.98) 0%, rgba(0,0,0,.82) 38%, rgba(0,0,0,.25) 70%, rgba(0,0,0,.45) 100%)',
        }}
      >
        {/* Fondo temporal */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 70% 40%, #555 0%, #252525 30%, #090909 70%)',
            zIndex: 0,
          }}
        />

        <header
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 30,
            padding: '28px 5vw',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <Image
              src="/grand-jete-logo.png"
              alt="Grand Jeté Academia de Danza"
              width={170}
              height={140}
              priority
              style={{
                width: 170,
                height: 'auto',
                filter: 'invert(1)',
              }}
            />
          </div>

          <nav
  style={{
  display: 'flex',
  alignItems: 'center',
  gap: 28,
  fontSize: 13,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
}}
className="public-nav"
>
            <a href="#academia">La Academia</a>
            <a href="#disciplinas">Disciplinas</a>
            <a href="#maestros">Maestros</a>
            <a href="#horarios">Horarios</a>
            <a href="#galeria">Galería</a>
            <a href="#inscripciones">Inscripciones</a>
            <a href="#contacto">Contacto</a>

            <Link 
            href="https://app.grandjete.mx"
              style={{
                border: '1px solid #b78a36',
                padding: '14px 18px',
                color: '#e1b75f',
              }}
            >
              Administración
            </Link>
          </nav>
        </header>

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            padding: '4vh 5vw 10vh',
          }}
        >
          <div
            style={{
              maxWidth: 650,
            }}
          >
            <div
              style={{
                width: 58,
                height: 2,
                background: '#c69a48',
                marginBottom: 26,
              }}
            />

            <h1
              style={{
                margin: 0,
                fontFamily: 'Georgia, Times New Roman, serif',
                fontSize: 'clamp(64px, 8vw, 132px)',
                fontWeight: 400,
                lineHeight: 0.88,
                letterSpacing: -3,
              }}
            >
              NACISTE
              <br />
              PARA
              <br />
              MOVERTE
            </h1>

            <p
              style={{
                marginTop: 38,
                fontSize: 22,
                lineHeight: 1.5,
                maxWidth: 500,
                color: '#ddd',
              }}
            >
              Grand Jeté · Academia de Danza
            </p>

            <a
              href="#academia"
              style={{
                display: 'inline-flex',
                marginTop: 24,
                padding: '16px 26px',
                border: '1px solid #c69a48',
                color: '#e1b75f',
                letterSpacing: 2,
                textTransform: 'uppercase',
                fontSize: 13,
              }}
            >
              Conoce la academia →
            </a>
          </div>
        </div>

        <div
  style={{
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 30,
    padding: '24px 5vw',
    background: 'rgba(0,0,0,.86)',
    borderTop: '1px solid rgba(255,255,255,.1)',
  }}
>
  <div>
    <div
      style={{
        color: '#d7a94e',
        fontSize: 12,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 7,
      }}
    >
      Grand Jeté · Aguascalientes
    </div>

    <div
      style={{
        color: '#e8e4de',
        fontSize: 15,
        lineHeight: 1.5,
      }}
    >
      ENCUÉNTRANOS EN EL DESARROLLO ESPECIAL TALLERES F.F.C.C. (ESTACIONAMIENTO DE CASA REDONDA)
    </div>
  </div>

  <a
    href="https://maps.app.goo.gl/6ECp6WPdwMRr2eJG9"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color: '#d7a94e',
      textDecoration: 'none',
      fontSize: 13,
      letterSpacing: 2,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      borderBottom: '1px solid #d7a94e',
      paddingBottom: 5,
    }}
  >
    Cómo llegar ↗
  </a>
</div>
      </section>

      <section
        id="academia"
        style={{
          minHeight: '70vh',
          background: '#f5f2ed',
          color: '#161616',
          padding: '90px 7vw',
        }}
      >
        <h2
          style={{
            fontFamily: 'Georgia, Times New Roman, serif',
            fontWeight: 400,
            fontSize: 70,
            margin: 0,
          }}
        >
          La Academia
        </h2>
      </section>
    </main>
  )
}