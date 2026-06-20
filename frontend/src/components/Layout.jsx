import Sidebar from './Sidebar';

const Layout = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-slate-950">
    <div className="fixed inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-accent/10 pointer-events-none" />
    <Sidebar />
    <main className="lg:ml-72 min-h-screen">
      <div className="p-6 lg:p-8 pt-20 lg:pt-8">
        {(title || subtitle) && (
          <div className="mb-8">
            {title && <h1 className="text-3xl font-display font-bold">{title}</h1>}
            {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </main>
  </div>
);

export default Layout;
