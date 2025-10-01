import '../styles/global.css'

const Layout = ({ children, title }) => {
  return (
    <div className="layout">
      <header className="header">
        <h1>{title || '회의실 예약 시스템'}</h1>
      </header>
      <main className="main">
        {children}
      </main>
      <footer className="footer">
        <p>&copy; 2025 R&D Team</p>
      </footer>
    </div>
  )
}

export default Layout